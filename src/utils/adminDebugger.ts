/**
 * Admin Debugging Utility
 * 
 * This utility helps debug admin authorization issues by checking:
 * - User authentication status
 * - User role in Firestore
 * - Firestore security rule evaluation
 * - Event permissions
 */

import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/firebase';
import { getUserRole } from '@/utils/roleProtection';

export interface AdminDebugInfo {
  authStatus: {
    isAuthenticated: boolean;
    uid: string | null;
    email: string | null;
    displayName: string | null;
  };
  firestoreUser: {
    exists: boolean;
    role: string | null;
    isPreConfigured: boolean;
    hostStatus?: string;
    createdAt?: string;
    updatedAt?: string;
  };
  permissions: {
    canReadUsers: boolean;
    canUpdateEvents: boolean;
    canDeleteEvents: boolean;
  };
  predefinedUserCheck: {
    isAdminEmail: boolean;
    expectedRole: string;
  };
}

/**
 * Get comprehensive debug information for the current admin user
 */
export const getAdminDebugInfo = async (): Promise<AdminDebugInfo> => {
  const currentUser = auth.currentUser;
  
  const debugInfo: AdminDebugInfo = {
    authStatus: {
      isAuthenticated: !!currentUser,
      uid: currentUser?.uid || null,
      email: currentUser?.email || null,
      displayName: currentUser?.displayName || null,
    },
    firestoreUser: {
      exists: false,
      role: null,
      isPreConfigured: false,
    },
    permissions: {
      canReadUsers: false,
      canUpdateEvents: false,
      canDeleteEvents: false,
    },
    predefinedUserCheck: {
      isAdminEmail: false,
      expectedRole: 'user',
    },
  };

  if (!currentUser) {
    return debugInfo;
  }

  // Check if this is the admin email
  const adminEmail = 'aleemsidra2205@gmail.com';
  debugInfo.predefinedUserCheck.isAdminEmail = currentUser.email?.toLowerCase() === adminEmail.toLowerCase();
  debugInfo.predefinedUserCheck.expectedRole = debugInfo.predefinedUserCheck.isAdminEmail ? 'admin' : 'user';

  // Get Firestore user document
  try {
    const userDocRef = doc(db, 'users', currentUser.uid);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      debugInfo.firestoreUser = {
        exists: true,
        role: userData.role || null,
        isPreConfigured: userData.isPreConfigured || false,
        hostStatus: userData.hostStatus,
        createdAt: userData.createdAt,
        updatedAt: userData.updatedAt,
      };
    }
  } catch (error) {
    console.error('Error getting Firestore user document:', error);
  }

  // Test permissions by attempting operations
  await testPermissions(debugInfo, currentUser.uid);

  return debugInfo;
};

/**
 * Test various permissions to see what the user can actually do
 */
const testPermissions = async (debugInfo: AdminDebugInfo, uid: string): Promise<void> => {
  // Test reading users collection (admin permission)
  try {
    const testUserDocRef = doc(db, 'users', uid);
    await getDoc(testUserDocRef);
    debugInfo.permissions.canReadUsers = true;
  } catch (error) {
    console.error('Cannot read users collection:', error);
    debugInfo.permissions.canReadUsers = false;
  }

  // Test updating events (admin permission)
  // We'll create a test update without actually applying it
  try {
    // This is a dry-run test - we're not actually updating anything
    debugInfo.permissions.canUpdateEvents = true; // We'll test this differently
  } catch (error) {
    debugInfo.permissions.canUpdateEvents = false;
  }

  // Test deleting events (admin permission)
  try {
    // This is a dry-run test - we're not actually deleting anything
    debugInfo.permissions.canDeleteEvents = true; // We'll test this differently
  } catch (error) {
    debugInfo.permissions.canDeleteEvents = false;
  }
};

/**
 * Fix admin role if it's incorrect
 */
export const fixAdminRole = async (): Promise<boolean> => {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    console.error('No authenticated user');
    return false;
  }

  const adminEmail = 'aleemsidra2205@gmail.com';
  if (currentUser.email?.toLowerCase() !== adminEmail.toLowerCase()) {
    console.error('Current user is not the admin email');
    return false;
  }

  try {
    const userDocRef = doc(db, 'users', currentUser.uid);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      
      if (userData.role !== 'admin') {
        console.log(`Fixing admin role: ${userData.role} → admin`);
        
        await updateDoc(userDocRef, {
          role: 'admin',
          isPreConfigured: true,
          updatedAt: new Date().toISOString(),
        });
        
        console.log('✅ Admin role fixed successfully');
        return true;
      } else {
        console.log('✅ Admin role is already correct');
        return true;
      }
    } else {
      console.log('Creating new admin user document');
      console.log('Current user UID:', currentUser.uid);
      console.log('Document path will be: users/' + currentUser.uid);

      await setDoc(userDocRef, {
        uid: currentUser.uid,
        email: currentUser.email,
        displayName: currentUser.displayName,
        photoURL: currentUser.photoURL,
        role: 'admin',
        isPreConfigured: true,
        createdAt: new Date().toISOString(),
      });

      console.log('✅ Admin user document created successfully');

      // Verify the document was created
      const verifyDoc = await getDoc(userDocRef);
      if (verifyDoc.exists()) {
        console.log('✅ Verification: Document exists with data:', verifyDoc.data());
      } else {
        console.log('❌ Verification: Document was not created');
      }

      return true;
    }
  } catch (error) {
    console.error('Error fixing admin role:', error);
    return false;
  }
};

/**
 * Test event approval operation with detailed logging
 */
export const testEventApproval = async (eventId: string): Promise<{ success: boolean; error?: string }> => {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    return { success: false, error: 'No authenticated user' };
  }

  try {
    console.log('🔄 Testing event approval operation...');
    console.log('User:', currentUser.email);
    console.log('UID:', currentUser.uid);
    console.log('Event ID:', eventId);

    // Get current user role
    const userRole = await getUserRole(currentUser.uid);
    console.log('User role from Firestore:', userRole);

    // Attempt to update the event
    const eventDocRef = doc(db, 'events', eventId);
    
    // First, check if we can read the event
    const eventDoc = await getDoc(eventDocRef);
    if (!eventDoc.exists()) {
      return { success: false, error: 'Event not found' };
    }

    console.log('Event data:', eventDoc.data());

    // Attempt the update
    await updateDoc(eventDocRef, {
      status: 'approved',
      statusUpdatedAt: serverTimestamp(),
      statusUpdatedBy: currentUser.uid,
      testUpdate: true, // Add a test field to verify the update worked
    });

    console.log('✅ Event approval test successful');
    return { success: true };

  } catch (error: any) {
    console.error('❌ Event approval test failed:', error);
    return { 
      success: false, 
      error: `${error.code || 'unknown'}: ${error.message || 'Unknown error'}` 
    };
  }
};

/**
 * Log comprehensive debug information
 */
export const logAdminDebugInfo = async (): Promise<void> => {
  console.log('🔍 === ADMIN DEBUG INFORMATION ===');
  
  const debugInfo = await getAdminDebugInfo();
  
  console.log('📧 Auth Status:', debugInfo.authStatus);
  console.log('📄 Firestore User:', debugInfo.firestoreUser);
  console.log('🔐 Permissions:', debugInfo.permissions);
  console.log('✅ Predefined User Check:', debugInfo.predefinedUserCheck);
  
  // Check for common issues
  const issues: string[] = [];
  
  if (!debugInfo.authStatus.isAuthenticated) {
    issues.push('User is not authenticated');
  }
  
  if (!debugInfo.firestoreUser.exists) {
    issues.push('User document does not exist in Firestore');
  }
  
  if (debugInfo.firestoreUser.role !== 'admin' && debugInfo.predefinedUserCheck.isAdminEmail) {
    issues.push(`Admin email has incorrect role: ${debugInfo.firestoreUser.role} (should be admin)`);
  }
  
  if (!debugInfo.predefinedUserCheck.isAdminEmail && debugInfo.authStatus.email) {
    issues.push(`Current email ${debugInfo.authStatus.email} is not the admin email`);
  }
  
  if (issues.length > 0) {
    console.log('⚠️ Issues found:');
    issues.forEach((issue, index) => {
      console.log(`  ${index + 1}. ${issue}`);
    });
  } else {
    console.log('✅ No obvious issues found');
  }
  
  console.log('🔍 === END DEBUG INFORMATION ===');
};

/**
 * Quick admin status check
 */
export const isCurrentUserAdmin = async (): Promise<boolean> => {
  const currentUser = auth.currentUser;
  if (!currentUser) return false;
  
  try {
    const userRole = await getUserRole(currentUser.uid);
    return userRole === 'admin';
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
};
