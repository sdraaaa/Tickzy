/**
 * AuthContext
 * 
 * Global authentication context that manages user state,
 * Firebase Auth integration, and Firestore user documents
 */

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, onAuthStateChanged, signOut, reload } from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot, Timestamp, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { emailService } from '../services/emailService';

// User data structure in Firestore
export interface UserData {
  uid: string;
  email: string;
  role: 'user' | 'host' | 'admin';
  isVerified: boolean;
  createdAt: Timestamp;
  welcomeEmailSent?: boolean;
  welcomeEmailSentAt?: Timestamp;
  displayName?: string;
  photoURL?: string;
  provider?: string;
}

// Auth context interface
interface AuthContextType {
  user: User | null;
  userData: UserData | null;
  loading: boolean;
  logout: () => Promise<void>;
  refreshUserData: () => Promise<void>;
  checkEmailVerification: () => Promise<boolean>;
  isEmailVerified: () => boolean;
  needsEmailVerification: () => boolean;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Auth provider component
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [firebaseError, setFirebaseError] = useState<string | null>(null);

  // Create or get user document from Firestore
  const createOrGetUserDocument = async (firebaseUser: User): Promise<UserData | null> => {
    if (!firebaseUser.email || !db) return null;

    try {
      const userDocRef = doc(db, 'users', firebaseUser.uid);

      // Check if user document exists
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        // User exists, check if welcome email should be sent
        const existingData = userDoc.data() as UserData;

        // Send welcome email if user is verified and hasn't received it yet
        if (shouldSendWelcomeEmail(firebaseUser, existingData)) {
          await sendWelcomeEmailToUser(firebaseUser, existingData);
        }

        return existingData;
      } else {
        // User doesn't exist, create new document
        const isGoogleUser = firebaseUser.providerData?.[0]?.providerId === 'google.com';

        const newUserData: UserData = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          role: 'user',
          isVerified: true, // Auto-verify all users in Firestore
          createdAt: Timestamp.now(),
          displayName: firebaseUser.displayName || '',
          photoURL: firebaseUser.photoURL || '',
          provider: isGoogleUser ? 'google' : 'email',
          welcomeEmailSent: false,
        };

        await setDoc(userDocRef, newUserData);

        // Send welcome email for verified users (Google users or verified email users)
        if (isGoogleUser || firebaseUser.emailVerified) {
          await sendWelcomeEmailToUser(firebaseUser, newUserData);
        }

        return newUserData;
      }
    } catch (error) {
      console.error('Error creating/getting user document:', error);
      setFirebaseError('Failed to access user data. Please try again later.');
      return null;
    }
  };

  // Helper function to determine if welcome email should be sent
  const shouldSendWelcomeEmail = (firebaseUser: User, userData: UserData): boolean => {
    const isGoogleUser = firebaseUser.providerData?.[0]?.providerId === 'google.com';
    const isEmailVerified = firebaseUser.emailVerified;
    const welcomeEmailNotSent = !userData.welcomeEmailSent;

    return (isGoogleUser || isEmailVerified) && welcomeEmailNotSent;
  };

  // Helper function to send welcome email
  const sendWelcomeEmailToUser = async (firebaseUser: User, userData: UserData): Promise<void> => {
    try {
      await emailService.sendWelcomeEmailIfNeeded(
        firebaseUser.uid,
        firebaseUser.email || '',
        firebaseUser.displayName || userData.displayName || 'New User'
      );
    } catch (error) {
      console.error('Error sending welcome email:', error);
    }
  };

  // Check email verification status
  const checkEmailVerification = async (): Promise<boolean> => {
    if (!user) return false;

    try {
      await reload(user);
      return user.emailVerified;
    } catch (error) {
      console.error('Error checking email verification:', error);
      return false;
    }
  };

  // Check if user's email is verified
  const isEmailVerified = (): boolean => {
    if (!user) return false;

    // Google users are automatically considered verified
    const isGoogleUser = user.providerData?.[0]?.providerId === 'google.com';
    return isGoogleUser || user.emailVerified;
  };

  // Check if user needs email verification
  const needsEmailVerification = (): boolean => {
    if (!user) return false;

    // Google users don't need email verification
    const isGoogleUser = user.providerData?.[0]?.providerId === 'google.com';
    return !isGoogleUser && !user.emailVerified;
  };

  // Refresh user data function
  const refreshUserData = async (): Promise<void> => {
    if (!user) return;

    try {
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        setUserData(userDoc.data() as UserData);
      }
    } catch (error) {
      console.error('Error refreshing user data:', error);
    }
  };

  // Logout function
  const logout = async (): Promise<void> => {
    if (!auth) {
      console.warn('Firebase auth not initialized');
      return;
    }

    try {
      await signOut(auth);
      setUser(null);
      setUserData(null);
      setFirebaseError(null);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  // Listen for auth state changes
  useEffect(() => {
    if (!auth) {
      console.warn('Firebase auth not initialized, skipping auth state listener');
      setLoading(false);
      return;
    }

    let userDocUnsubscribe: (() => void) | null = null;

    const authUnsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      setFirebaseError(null);

      // Clean up previous user document listener
      if (userDocUnsubscribe) {
        userDocUnsubscribe();
        userDocUnsubscribe = null;
      }

      try {
        if (firebaseUser) {
          // User is signed in
          setUser(firebaseUser);

          // Get or create user document in Firestore
          const userDoc = await createOrGetUserDocument(firebaseUser);
          setUserData(userDoc);

          // Set up real-time listener for user document changes
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          userDocUnsubscribe = onSnapshot(userDocRef, (doc) => {
            if (doc.exists()) {
              setUserData(doc.data() as UserData);
            }
          }, (error) => {
            console.error('Error listening to user document:', error);
          });
        } else {
          // User is signed out
          setUser(null);
          setUserData(null);
        }
      } catch (error) {
        console.error('Error in auth state change:', error);
        setFirebaseError('Authentication error. Please refresh the page.');
        setUser(null);
        setUserData(null);
      }

      setLoading(false);
    });

    // Cleanup subscriptions on unmount
    return () => {
      authUnsubscribe();
      if (userDocUnsubscribe) {
        userDocUnsubscribe();
      }
    };
  }, []);

  const value: AuthContextType = {
    user,
    userData,
    loading,
    logout,
    refreshUserData,
    checkEmailVerification,
    isEmailVerified,
    needsEmailVerification,
  };

  return (
    <AuthContext.Provider value={value}>
      {firebaseError && (
        <div className="fixed top-4 right-4 bg-red-600 text-white p-4 rounded-lg shadow-lg z-50 max-w-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm">{firebaseError}</span>
            <button
              onClick={() => setFirebaseError(null)}
              className="ml-2 text-white hover:text-gray-200"
            >
              ×
            </button>
          </div>
        </div>
      )}
      {children}
    </AuthContext.Provider>
  );
};
