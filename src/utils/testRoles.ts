/**
 * Test Utilities for Role Management
 * 
 * Temporary utilities for testing different user roles
 * This file should be removed in production
 */

import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

export type UserRole = 'user' | 'host' | 'admin';

/**
 * Update user role in Firestore (for testing purposes)
 * In production, this should be handled by admin-only functions
 */
export const updateUserRole = async (uid: string, role: UserRole): Promise<void> => {
  try {
    const userDocRef = doc(db, 'users', uid);
    await updateDoc(userDocRef, { role });
    console.log(`User role updated to: ${role}`);
  } catch (error) {
    console.error('Error updating user role:', error);
    throw error;
  }
};

/**
 * Update user verification status (for testing purposes)
 */
export const updateUserVerification = async (uid: string, isVerified: boolean): Promise<void> => {
  try {
    const userDocRef = doc(db, 'users', uid);
    await updateDoc(userDocRef, { isVerified });
    console.log(`User verification updated to: ${isVerified}`);
  } catch (error) {
    console.error('Error updating user verification:', error);
    throw error;
  }
};

// Export for console testing
if (typeof window !== 'undefined') {
  (window as any).testRoles = {
    updateUserRole,
    updateUserVerification,
  };
}
