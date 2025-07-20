/**
 * Debug Helpers for Tickzy Application
 * 
 * These utilities help debug and fix common issues during development
 */

/**
 * Clear all session storage and reset app state
 */
export const clearAllAppState = () => {
  console.log('🧹 Clearing all app state...');
  
  // Clear all session storage
  const sessionKeys = Object.keys(sessionStorage);
  sessionKeys.forEach(key => {
    sessionStorage.removeItem(key);
    console.log(`🗑️ Removed sessionStorage: ${key}`);
  });
  
  // Clear specific localStorage items that might cause issues
  const localStorageKeys = Object.keys(localStorage);
  localStorageKeys.forEach(key => {
    if (key.includes('firebase') || key.includes('auth') || key.includes('user') || key.includes('google')) {
      localStorage.removeItem(key);
      console.log(`🗑️ Removed localStorage: ${key}`);
    }
  });
  
  console.log('✅ App state cleared successfully');
  return true;
};

/**
 * Debug current URL and navigation state
 */
export const debugNavigationState = () => {
  console.log('🔍 Navigation Debug Info:');
  console.log('  Current URL:', window.location.href);
  console.log('  Pathname:', window.location.pathname);
  console.log('  Search:', window.location.search);
  console.log('  Hash:', window.location.hash);
  console.log('  Origin:', window.location.origin);
  
  console.log('📦 Session Storage:');
  const sessionKeys = Object.keys(sessionStorage);
  sessionKeys.forEach(key => {
    console.log(`  ${key}:`, sessionStorage.getItem(key));
  });
  
  console.log('📦 Relevant Local Storage:');
  const localKeys = Object.keys(localStorage);
  localKeys.forEach(key => {
    if (key.includes('firebase') || key.includes('auth') || key.includes('user')) {
      console.log(`  ${key}:`, localStorage.getItem(key));
    }
  });
  
  return {
    url: window.location.href,
    pathname: window.location.pathname,
    sessionStorage: Object.fromEntries(sessionKeys.map(key => [key, sessionStorage.getItem(key)])),
    relevantLocalStorage: Object.fromEntries(
      localKeys
        .filter(key => key.includes('firebase') || key.includes('auth') || key.includes('user'))
        .map(key => [key, localStorage.getItem(key)])
    )
  };
};

/**
 * Fix malformed URLs in session storage
 */
export const fixMalformedUrls = () => {
  console.log('🔧 Checking for malformed URLs in session storage...');
  
  const returnUrl = sessionStorage.getItem('returnUrl');
  if (returnUrl) {
    console.log('🔍 Current returnUrl:', returnUrl);
    
    // Check if it's a full URL instead of relative path
    if (returnUrl.includes('http://') || returnUrl.includes('https://')) {
      console.warn('⚠️ Found malformed returnUrl (full URL instead of relative path)');
      
      try {
        const url = new URL(returnUrl);
        const fixedUrl = url.pathname + url.search + url.hash;
        sessionStorage.setItem('returnUrl', fixedUrl);
        console.log('✅ Fixed returnUrl:', fixedUrl);
      } catch (error) {
        console.error('❌ Failed to fix malformed URL, removing it');
        sessionStorage.removeItem('returnUrl');
      }
    } else if (!returnUrl.startsWith('/')) {
      console.warn('⚠️ Found invalid returnUrl (not starting with /)');
      sessionStorage.removeItem('returnUrl');
      console.log('✅ Removed invalid returnUrl');
    } else {
      console.log('✅ returnUrl is valid');
    }
  }
  
  return true;
};

/**
 * Force navigate to a clean state
 */
export const forceCleanNavigation = (path: string = '/') => {
  console.log(`🔄 Force navigating to clean state: ${path}`);
  
  // Clear all app state
  clearAllAppState();
  
  // Force navigation
  window.location.href = path;
};

/**
 * Debug authentication state and flow
 */
export const debugAuthState = () => {
  console.log('🔍 Authentication Debug Info:');

  // Check Firebase Auth state
  import('../firebase').then(({ auth }) => {
    console.log('  Firebase Auth currentUser:', auth.currentUser ? {
      email: auth.currentUser.email,
      uid: auth.currentUser.uid,
      displayName: auth.currentUser.displayName
    } : 'null');
  });

  // Check session storage for auth-related items
  console.log('📦 Auth-related Session Storage:');
  const authKeys = ['returnUrl', 'pendingReturnUrl', 'bookingIntent'];
  authKeys.forEach(key => {
    const value = sessionStorage.getItem(key);
    if (value) {
      console.log(`  ${key}:`, value);
    }
  });

  // Check localStorage for Firebase auth
  console.log('📦 Firebase Auth Local Storage:');
  Object.keys(localStorage).forEach(key => {
    if (key.includes('firebase:authUser')) {
      console.log(`  ${key}:`, localStorage.getItem(key));
    }
  });

  return true;
};

/**
 * Debug predefined user roles and authentication
 */
export const debugPredefinedUsers = async () => {
  console.log('🔍 Predefined Users Debug Info:');

  try {
    const { PREDEFINED_USERS } = await import('./userRoleSetup');
    const { auth, db } = await import('../firebase');
    const { doc, getDoc } = await import('firebase/firestore');

    console.log('📋 Expected Predefined Users:');
    PREDEFINED_USERS.forEach(user => {
      console.log(`  ${user.email} → ${user.role} (${user.displayName})`);
    });

    const currentUser = auth.currentUser;
    if (currentUser) {
      console.log(`\n👤 Current User: ${currentUser.email}`);

      // Check if current user is predefined
      const predefinedUser = PREDEFINED_USERS.find(u => u.email === currentUser.email);
      console.log(`  Is Predefined: ${!!predefinedUser}`);
      console.log(`  Expected Role: ${predefinedUser?.role || 'user (default)'}`);

      // Check Firestore document
      try {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          console.log(`  Firestore Role: ${userData.role}`);
          console.log(`  Is Pre-configured: ${userData.isPreConfigured || false}`);
          console.log(`  Role Match: ${userData.role === predefinedUser?.role}`);
        } else {
          console.log('  Firestore Document: Not found');
        }
      } catch (error) {
        console.error('  Firestore Error:', error);
      }
    } else {
      console.log('\n👤 No current user authenticated');
    }

  } catch (error) {
    console.error('Error debugging predefined users:', error);
  }

  return true;
};

/**
 * Test authentication redirect flow
 */
export const testAuthRedirect = () => {
  console.log('🧪 Testing authentication redirect flow...');

  // Set up test return URL
  sessionStorage.setItem('returnUrl', '/event/test123');
  sessionStorage.setItem('bookingIntent', 'true');

  console.log('✅ Test return URL set. Now try logging in and check if redirect works.');
  debugAuthState();

  return true;
};

// Import sample events utility
import { createSampleEvents, checkSampleEventsExist } from './seedSampleEvents';
// Import real-time debugging utilities
import {
  testEventApprovalRealTime,
  testHostRequestRealTime,
  testApprovalWorkflow,
  checkFirestoreIndexes,
  runComprehensiveRealTimeTests
} from './realTimeDebugger';

// Make functions available in browser console for debugging
if (typeof window !== 'undefined') {
  (window as any).clearAllAppState = clearAllAppState;
  (window as any).debugNavigationState = debugNavigationState;
  (window as any).fixMalformedUrls = fixMalformedUrls;
  (window as any).forceCleanNavigation = forceCleanNavigation;
  (window as any).debugAuthState = debugAuthState;
  (window as any).debugPredefinedUsers = debugPredefinedUsers;
  (window as any).testAuthRedirect = testAuthRedirect;
  (window as any).createSampleEvents = createSampleEvents;
  (window as any).checkSampleEventsExist = checkSampleEventsExist;
  (window as any).testEventApprovalRealTime = testEventApprovalRealTime;
  (window as any).testHostRequestRealTime = testHostRequestRealTime;
  (window as any).testApprovalWorkflow = testApprovalWorkflow;
  (window as any).checkFirestoreIndexes = checkFirestoreIndexes;
  (window as any).runComprehensiveRealTimeTests = runComprehensiveRealTimeTests;
}
