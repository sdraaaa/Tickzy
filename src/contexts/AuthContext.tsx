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

  // Create or get user document from Firestore
  const createOrGetUserDocument = async (firebaseUser: User): Promise<UserData | null> => {
    if (!firebaseUser.email) return null;

    const userDocRef = doc(db, 'users', firebaseUser.uid);
    
    try {
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
      return null;
    }
  };

  // Logout function
  const logout = async (): Promise<void> => {
    try {
      await signOut(auth);
      setUser(null);
      setUserData(null);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      
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
      {children}
    </AuthContext.Provider>
  );
};
