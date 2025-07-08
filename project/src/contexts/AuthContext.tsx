import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/firebase';
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
          let userDoc = await getDoc(userDocRef);
          let userData;

          if (userDoc.exists()) {
            // User document exists with this UID
            const data = userDoc.data();
            userData = {
              uid: user.uid,
              email: user.email,
              displayName: user.displayName,
              photoURL: user.photoURL,
              role: data.role || 'user',
            };
          } else {
            // User document doesn't exist with this UID, check predefined users first
            const predefinedUser = findPredefinedUserByEmail(user.email || '');

            if (predefinedUser) {
              // Found a predefined user, create document with their role
              userData = {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName,
                photoURL: user.photoURL,
                role: predefinedUser.role,
              };

              // Create the user document with predefined role
              await setDoc(userDocRef, {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName,
                photoURL: user.photoURL,
                role: predefinedUser.role,
                isPreConfigured: true,
                createdAt: new Date().toISOString(),
              });
            } else {
              // No predefined user found, create default user
              userData = {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName,
                photoURL: user.photoURL,
                role: 'user',
              };

              // Create new user document for default user
              await setDoc(userDocRef, {
                ...userData,
                createdAt: new Date().toISOString(),
              });
            }
          }

          setUserData(userData);
        } catch (error) {
          console.error('AuthContext: Error fetching user data:', error);
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
