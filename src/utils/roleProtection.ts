import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/firebase';

/**
 * Role Protection Utility
 * 
 * This utility provides safeguards against accidental user role modifications
 * during event viewing, navigation, or other operations that should not affect user roles.
 */

export interface SafeUserUpdate {
  displayName?: string;
  photoURL?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  updatedAt?: string;
  // Note: 'role' is intentionally excluded to prevent accidental modifications
}

/**
 * Safely update user document without modifying the role
 * This function ensures that user roles are never accidentally changed
 */
export const safeUpdateUser = async (
  uid: string, 
  updates: SafeUserUpdate
): Promise<void> => {
  try {
    const userDocRef = doc(db, 'users', uid);
    
    // Always use merge: true to preserve existing role and other data
    await setDoc(userDocRef, {
      ...updates,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
    
    console.log(`✅ Safely updated user ${uid} without modifying role`);
  } catch (error) {
    console.error(`❌ Error safely updating user ${uid}:`, error);
    throw error;
  }
};

/**
 * Get user role safely (read-only operation)
 * This function only reads the user's role without any risk of modification
 */
export const getUserRole = async (uid: string): Promise<string | null> => {
  try {
    const userDocRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
      const data = userDoc.data();
      return data.role || 'user';
    }
    
    return null;
  } catch (error) {
    console.error(`❌ Error getting user role for ${uid}:`, error);
    return null;
  }
};

/**
 * Verify that a user's role has not been accidentally modified
 * This function can be used for debugging and monitoring
 */
export const verifyUserRole = async (
  uid: string, 
  expectedRole: string
): Promise<boolean> => {
  try {
    const currentRole = await getUserRole(uid);
    const isCorrect = currentRole === expectedRole;
    
    if (!isCorrect) {
      console.warn(`⚠️ Role mismatch for user ${uid}: expected ${expectedRole}, got ${currentRole}`);
    } else {
      console.log(`✅ Role verified for user ${uid}: ${currentRole}`);
    }
    
    return isCorrect;
  } catch (error) {
    console.error(`❌ Error verifying user role for ${uid}:`, error);
    return false;
  }
};

/**
 * Log user role changes for audit purposes
 * This function should be called whenever a role is intentionally changed
 */
export const logRoleChange = (
  uid: string, 
  oldRole: string, 
  newRole: string, 
  reason: string
): void => {
  console.log(`🔄 Role change for user ${uid}: ${oldRole} → ${newRole} (Reason: ${reason})`);
  
  // In production, this could send to an audit log service
  if (process.env.NODE_ENV === 'production') {
    // TODO: Send to audit logging service
  }
};

/**
 * Constants for role validation
 */
export const VALID_ROLES = ['user', 'host', 'admin'] as const;
export type ValidRole = typeof VALID_ROLES[number];

/**
 * Validate that a role is one of the allowed values
 */
export const isValidRole = (role: string): role is ValidRole => {
  return VALID_ROLES.includes(role as ValidRole);
};
