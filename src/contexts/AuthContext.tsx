/**
 * AuthContext
 * 
 * Global authentication context that manages user state,
 * Firebase Auth integration, and Firestore user documents
 */

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import { auth, db } from '../firebase';

// User data structure in Firestore
export interface UserData {
  uid: string;
  email: string;
  role: 'user' | 'host' | 'admin';
  isVerified: boolean;
  createdAt: Timestamp;
}

// Auth context interface
interface AuthContextType {
  user: User | null;
  userData: UserData | null;
  loading: boolean;
  logout: () => Promise<void>;
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
        // User exists, return existing data
        return userDoc.data() as UserData;
      } else {
        // User doesn't exist, create new document
        const newUserData: UserData = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          role: 'user',
          isVerified: true, // Auto-verify all users
          createdAt: Timestamp.now(),
        };

        await setDoc(userDocRef, newUserData);
        return newUserData;
      }
    } catch (error) {
      console.error('Error creating/getting user document:', error);
      setFirebaseError('Failed to access user data. Please try again later.');
      return null;
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

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      setFirebaseError(null);

      try {
        if (firebaseUser) {
          // User is signed in
          setUser(firebaseUser);

          // Get or create user document in Firestore
          const userDoc = await createOrGetUserDocument(firebaseUser);
          setUserData(userDoc);
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

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const value: AuthContextType = {
    user,
    userData,
    loading,
    logout,
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
