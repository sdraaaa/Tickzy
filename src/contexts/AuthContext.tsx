import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signOut } from 'firebase/auth';
import { doc } from 'firebase/firestore';
import { auth, db } from '@/firebase';
import { logAuthTestResults } from '@/utils/authTesting';
import { monitoredGetDoc, monitoredSetDoc, allowRoleModification } from '@/utils/firestoreMonitor';
import { findUserByEmail, findPredefinedUserByEmail } from '@/utils/userRoleSetup';
import { initializationService } from '@/services/initializationService';

interface UserData {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  role: string;
}

interface AuthContextType {
  currentUser: User | null;
  userData: UserData | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  userData: null,
  loading: true,
  logout: async () => {},
});

export const useAuth = () => {
  return useContext(AuthContext);
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [authInitialized, setAuthInitialized] = useState(false);

  useEffect(() => {
    // Initialize application (setup user roles) when AuthContext starts
    initializationService.initialize().catch(error => {
      console.error('AuthContext: Initialization service failed:', error);
    });

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('🔄 AuthContext: Auth state changed', {
        user: user ? user.email : 'null',
        uid: user ? user.uid : 'null',
        authInitialized
      });

      // Ensure we always set the current user first
      setCurrentUser(user);

      // Mark auth as initialized after first state change
      if (!authInitialized) {
        setAuthInitialized(true);
      }

      if (user) {
        try {
          // First, try to get user document by UID
          const userDocRef = doc(db, 'users', user.uid);
          let userDoc = await monitoredGetDoc(userDocRef);
          let userData;

          if (userDoc.exists()) {
            // User document exists with this UID
            const data = userDoc.data();

            // Check if this is a predefined user and ensure correct role assignment
            const predefinedUser = findPredefinedUserByEmail(user.email || '');
            let finalRole = data.role || 'user';

            // If this is a predefined user but doesn't have the correct role, fix it
            if (predefinedUser && data.role !== predefinedUser.role) {
              console.log(`🔧 Correcting role for predefined user ${user.email}: ${data.role} → ${predefinedUser.role}`);
              finalRole = predefinedUser.role;

              // Update the role in Firestore
              const operationId = `auth-role-correction-${user.uid}-${Date.now()}`;
              allowRoleModification(operationId);

              await monitoredSetDoc(userDocRef, {
                role: predefinedUser.role,
                isPreConfigured: true,
                updatedAt: new Date().toISOString(),
              }, { merge: true });
            }

            userData = {
              uid: user.uid,
              email: user.email,
              displayName: user.displayName,
              photoURL: user.photoURL,
              role: finalRole,
            };

            // Update non-role fields if they've changed
            const needsUpdate =
              data.displayName !== user.displayName ||
              data.photoURL !== user.photoURL;

            if (needsUpdate) {
              await monitoredSetDoc(userDocRef, {
                displayName: user.displayName,
                photoURL: user.photoURL,
                updatedAt: new Date().toISOString(),
              }, { merge: true });
            }
          } else {
            // User document doesn't exist with this UID, check predefined users first
            const predefinedUser = findPredefinedUserByEmail(user.email || '');

            if (predefinedUser) {
              console.log(`✅ Creating new document for predefined user ${user.email} with role: ${predefinedUser.role}`);

              // Found a predefined user, create document with their role
              userData = {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName,
                photoURL: user.photoURL,
                role: predefinedUser.role,
              };

              // Create the user document with predefined role
              const operationId = `auth-predefined-user-${user.uid}-${Date.now()}`;
              allowRoleModification(operationId);

              await monitoredSetDoc(userDocRef, {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName,
                photoURL: user.photoURL,
                role: predefinedUser.role,
                isPreConfigured: true,
                createdAt: new Date().toISOString(),
              }, { merge: true });
            } else {
              console.log(`✅ Creating new document for regular user ${user.email} with default role: user`);

              // No predefined user found, create default user
              userData = {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName,
                photoURL: user.photoURL,
                role: 'user',
              };

              // Create new user document for default user
              const operationId = `auth-default-user-${user.uid}-${Date.now()}`;
              allowRoleModification(operationId);

              await monitoredSetDoc(userDocRef, {
                ...userData,
                createdAt: new Date().toISOString(),
              }, { merge: true });
            }
          }

          setUserData(userData);

          console.log('✅ AuthContext: User data set successfully', {
            email: userData.email,
            role: userData.role,
            uid: userData.uid,
            isPredefined: findPredefinedUserByEmail(userData.email || '') !== null
          });

          // Run comprehensive authentication tests in development
          if (process.env.NODE_ENV === 'development' && user && userData) {
            setTimeout(() => {
              logAuthTestResults(user, userData.role, window.location.pathname);
            }, 1000); // Delay to allow navigation to complete
          }
        } catch (error) {
          console.error('AuthContext: Error fetching user data:', error);
          console.error('AuthContext: Error details:', {
            userEmail: user?.email,
            userUID: user?.uid,
            errorMessage: error instanceof Error ? error.message : 'Unknown error'
          });
          setUserData(null);
        }
      } else {
        setUserData(null);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const logout = async () => {
    try {
      setLoading(true);

      // Clear local state first
      setCurrentUser(null);
      setUserData(null);

      // Then sign out from Firebase
      await signOut(auth);
    } catch (error) {
      console.error('AuthContext: Logout error:', error);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    currentUser,
    userData,
    loading,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
