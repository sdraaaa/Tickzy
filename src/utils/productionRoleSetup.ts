import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase';

/**
 * Production-safe role setup utility
 * This file contains only the essential functions needed for production
 * without exposing sensitive user information or debug capabilities
 */

export interface UserRoleData {
  email: string;
  role: 'user' | 'host' | 'admin';
  displayName: string;
  firstName?: string;
  lastName?: string;
  createdAt: string;
  updatedAt?: string;
}

/**
 * Create or update a user document with role information
 * This is used during the OAuth sign-in process
 */
export const createOrUpdateUserRole = async (
  uid: string, 
  email: string, 
  displayName: string, 
  role: 'user' | 'host' | 'admin' = 'user'
): Promise<void> => {
  try {
    const userDocRef = doc(db, 'users', uid);
    const existingDoc = await getDoc(userDocRef);
    
    const userData: UserRoleData = {
      email,
      role,
      displayName,
      createdAt: existingDoc.exists() ? existingDoc.data().createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    await setDoc(userDocRef, userData, { merge: true });
  } catch (error) {
    console.error('Error creating/updating user role:', error);
    throw error;
  }
};

/**
 * Get user role by UID (production-safe)
 */
export const getUserRole = async (uid: string): Promise<string> => {
  try {
    const userDocRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
      return userDoc.data().role || 'user';
    }
    
    return 'user'; // Default role
  } catch (error) {
    console.error('Error getting user role:', error);
    return 'user'; // Default role on error
  }
};

/**
 * Check if a user has a specific role
 */
export const hasRole = async (uid: string, requiredRole: 'user' | 'host' | 'admin'): Promise<boolean> => {
  try {
    const userRole = await getUserRole(uid);
    
    // Role hierarchy: admin > host > user
    const roleHierarchy = { user: 1, host: 2, admin: 3 };
    const userLevel = roleHierarchy[userRole as keyof typeof roleHierarchy] || 1;
    const requiredLevel = roleHierarchy[requiredRole];
    
    return userLevel >= requiredLevel;
  } catch (error) {
    console.error('Error checking user role:', error);
    return false;
  }
};
