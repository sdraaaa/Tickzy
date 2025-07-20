/**
 * Fix Host Permissions Utility
 * 
 * This utility helps fix host permission issues by ensuring predefined hosts
 * have the correct hostStatus set in their Firestore documents.
 */

import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '@/firebase/index';
import { PREDEFINED_USERS } from './userRoleSetup';

/**
 * Fix host permissions for the current user
 */
export const fixCurrentUserHostPermissions = async (): Promise<boolean> => {
  const user = auth.currentUser;
  if (!user) {
    console.error('❌ No user is currently logged in');
    return false;
  }

  console.log(`🔧 Checking host permissions for ${user.email}...`);

  // Find if this is a predefined host
  const predefinedUser = PREDEFINED_USERS.find(u => u.email === user.email);
  
  if (!predefinedUser) {
    console.log(`ℹ️ ${user.email} is not a predefined user`);
    return false;
  }

  if (predefinedUser.role !== 'host') {
    console.log(`ℹ️ ${user.email} is not a predefined host (role: ${predefinedUser.role})`);
    return false;
  }

  try {
    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      console.log(`📝 Creating user document for ${user.email}...`);
      
      await setDoc(userDocRef, {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || predefinedUser.displayName,
        photoURL: user.photoURL,
        role: predefinedUser.role,
        hostStatus: predefinedUser.hostStatus || 'approved',
        isPreConfigured: true,
        createdAt: new Date().toISOString(),
        firstName: predefinedUser.firstName,
        lastName: predefinedUser.lastName,
      });

      console.log(`✅ Created user document with hostStatus: ${predefinedUser.hostStatus || 'approved'}`);
      return true;
    } else {
      const userData = userDoc.data();
      const needsUpdate = userData.role !== predefinedUser.role || 
                         !userData.hostStatus || 
                         userData.hostStatus !== (predefinedUser.hostStatus || 'approved');

      if (needsUpdate) {
        console.log(`📝 Updating user document for ${user.email}...`);
        console.log(`   Current role: ${userData.role} → ${predefinedUser.role}`);
        console.log(`   Current hostStatus: ${userData.hostStatus} → ${predefinedUser.hostStatus || 'approved'}`);

        await updateDoc(userDocRef, {
          role: predefinedUser.role,
          hostStatus: predefinedUser.hostStatus || 'approved',
          isPreConfigured: true,
          updatedAt: new Date().toISOString(),
          firstName: predefinedUser.firstName,
          lastName: predefinedUser.lastName,
        });

        console.log(`✅ Updated user document with hostStatus: ${predefinedUser.hostStatus || 'approved'}`);
        return true;
      } else {
        console.log(`✅ User document is already correct for ${user.email}`);
        console.log(`   Role: ${userData.role}`);
        console.log(`   HostStatus: ${userData.hostStatus}`);
        return true;
      }
    }
  } catch (error) {
    console.error(`❌ Error fixing host permissions for ${user.email}:`, error);
    return false;
  }
};

/**
 * Fix host permissions for all predefined hosts
 */
export const fixAllPredefinedHostPermissions = async (): Promise<void> => {
  console.log('🔧 Fixing permissions for all predefined hosts...');

  const predefinedHosts = PREDEFINED_USERS.filter(user => user.role === 'host');
  
  if (predefinedHosts.length === 0) {
    console.log('ℹ️ No predefined hosts found');
    return;
  }

  console.log(`📋 Found ${predefinedHosts.length} predefined host(s):`);
  predefinedHosts.forEach(host => {
    console.log(`   - ${host.email} (${host.displayName})`);
  });

  // Note: This function can only fix the current user's permissions
  // because we need authentication to write to Firestore
  const currentUser = auth.currentUser;
  if (!currentUser) {
    console.error('❌ No user is currently logged in. Please login as a host to fix permissions.');
    return;
  }

  const currentUserHost = predefinedHosts.find(host => host.email === currentUser.email);
  if (currentUserHost) {
    await fixCurrentUserHostPermissions();
  } else {
    console.log(`ℹ️ Current user (${currentUser.email}) is not a predefined host`);
    console.log('💡 To fix host permissions, please login as one of the predefined hosts listed above');
  }
};

/**
 * Check current user's host permissions
 */
export const checkCurrentUserHostPermissions = async (): Promise<void> => {
  const user = auth.currentUser;
  if (!user) {
    console.error('❌ No user is currently logged in');
    return;
  }

  console.log(`🔍 Checking host permissions for ${user.email}...`);

  try {
    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      console.log('❌ User document does not exist in Firestore');
      return;
    }

    const userData = userDoc.data();
    const predefinedUser = PREDEFINED_USERS.find(u => u.email === user.email);

    console.log('📊 Current User Data:');
    console.log(`   Email: ${userData.email}`);
    console.log(`   Role: ${userData.role}`);
    console.log(`   HostStatus: ${userData.hostStatus || 'not set'}`);
    console.log(`   IsPreConfigured: ${userData.isPreConfigured || false}`);

    if (predefinedUser) {
      console.log('📋 Expected Predefined User Data:');
      console.log(`   Role: ${predefinedUser.role}`);
      console.log(`   HostStatus: ${predefinedUser.hostStatus || 'approved'}`);

      const isCorrect = userData.role === predefinedUser.role && 
                       userData.hostStatus === (predefinedUser.hostStatus || 'approved');

      if (isCorrect) {
        console.log('✅ User permissions are correct!');
      } else {
        console.log('❌ User permissions need to be fixed');
        console.log('💡 Run fixCurrentUserHostPermissions() to fix');
      }
    } else {
      console.log('ℹ️ This is not a predefined user');
    }

    // Check if user can create events
    const canCreate = userData.role === 'host' && userData.hostStatus === 'approved';
    console.log(`🎫 Can create events: ${canCreate ? '✅ YES' : '❌ NO'}`);

    if (!canCreate) {
      console.log('💡 To enable event creation:');
      console.log('   1. Role must be "host"');
      console.log('   2. HostStatus must be "approved"');
      if (predefinedUser && predefinedUser.role === 'host') {
        console.log('   3. Run fixCurrentUserHostPermissions() to fix automatically');
      }
    }
  } catch (error) {
    console.error('❌ Error checking user permissions:', error);
  }
};

/**
 * Test event creation permissions
 */
export const testEventCreationPermissions = async (): Promise<void> => {
  const user = auth.currentUser;
  if (!user) {
    console.error('❌ No user is currently logged in');
    return;
  }

  console.log(`🧪 Testing event creation permissions for ${user.email}...`);

  try {
    // Import the canUserCreateEvents function
    const { canUserCreateEvents } = await import('@/services/hostService');
    
    const canCreate = await canUserCreateEvents(user.uid);
    
    console.log(`🎫 Event creation test result: ${canCreate ? '✅ ALLOWED' : '❌ DENIED'}`);
    
    if (!canCreate) {
      console.log('🔧 Attempting to fix permissions...');
      const fixed = await fixCurrentUserHostPermissions();
      
      if (fixed) {
        console.log('🔄 Retesting after fix...');
        const canCreateAfterFix = await canUserCreateEvents(user.uid);
        console.log(`🎫 Event creation after fix: ${canCreateAfterFix ? '✅ ALLOWED' : '❌ STILL DENIED'}`);
        
        if (canCreateAfterFix) {
          console.log('🎉 Event creation permissions fixed successfully!');
          console.log('💡 Try creating an event now at /host/create');
        } else {
          console.log('❌ Still unable to create events. Please check Firestore rules and user data.');
        }
      }
    } else {
      console.log('🎉 Event creation permissions are working correctly!');
    }
  } catch (error) {
    console.error('❌ Error testing event creation permissions:', error);
  }
};

// Make functions available in browser console for debugging
if (typeof window !== 'undefined') {
  (window as any).fixCurrentUserHostPermissions = fixCurrentUserHostPermissions;
  (window as any).fixAllPredefinedHostPermissions = fixAllPredefinedHostPermissions;
  (window as any).checkCurrentUserHostPermissions = checkCurrentUserHostPermissions;
  (window as any).testEventCreationPermissions = testEventCreationPermissions;
}
