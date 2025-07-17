/**
 * Authentication Testing Utility
 * 
 * This utility provides comprehensive testing functions for authentication
 * and role-based routing functionality.
 */

import { User } from 'firebase/auth';
import { getUserRole, verifyUserRole } from './roleProtection';

export interface PredefinedUser {
  email: string;
  role: 'user' | 'host' | 'admin';
  expectedDashboard: string;
}

/**
 * Predefined users for testing
 */
export const PREDEFINED_USERS: PredefinedUser[] = [
  {
    email: 'sidraaleem8113@gmail.com',
    role: 'user',
    expectedDashboard: '/user-dashboard'
  },
  {
    email: 'abdulaleemsidra@gmail.com',
    role: 'host',
    expectedDashboard: '/host-dashboard'
  },
  {
    email: 'aleemsidra2205@gmail.com',
    role: 'admin',
    expectedDashboard: '/admin'
  }
];

/**
 * Test authentication flow for a specific user
 */
export const testUserAuthentication = async (
  user: User,
  expectedRole: string
): Promise<{
  success: boolean;
  issues: string[];
  userInfo: any;
}> => {
  const issues: string[] = [];
  
  try {
    // Test 1: Verify user object
    if (!user) {
      issues.push('User object is null or undefined');
      return { success: false, issues, userInfo: null };
    }
    
    // Test 2: Verify email
    if (!user.email) {
      issues.push('User email is missing');
    }
    
    // Test 3: Verify UID
    if (!user.uid) {
      issues.push('User UID is missing');
    }
    
    // Test 4: Get and verify role from Firestore
    const actualRole = await getUserRole(user.uid);
    if (!actualRole) {
      issues.push('Could not retrieve user role from Firestore');
    } else if (actualRole !== expectedRole) {
      issues.push(`Role mismatch: expected ${expectedRole}, got ${actualRole}`);
    }
    
    // Test 5: Verify role integrity
    const roleVerified = await verifyUserRole(user.uid, expectedRole);
    if (!roleVerified) {
      issues.push('Role verification failed');
    }
    
    const userInfo = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      actualRole,
      expectedRole,
      emailVerified: user.emailVerified,
      providerData: user.providerData.map(p => ({
        providerId: p.providerId,
        uid: p.uid,
        email: p.email
      }))
    };
    
    return {
      success: issues.length === 0,
      issues,
      userInfo
    };
    
  } catch (error) {
    console.error('Error testing user authentication:', error);
    issues.push(`Authentication test error: ${error}`);
    return { success: false, issues, userInfo: null };
  }
};

/**
 * Test role-based routing for current URL
 */
export const testRoleBasedRouting = (
  userRole: string,
  currentPath: string
): {
  isCorrectDashboard: boolean;
  expectedPath: string;
  issues: string[];
} => {
  const issues: string[] = [];
  
  // Find expected dashboard for role
  const predefinedUser = PREDEFINED_USERS.find(u => u.role === userRole);
  const expectedPath = predefinedUser?.expectedDashboard || '/user-dashboard';
  
  // Check if current path matches expected
  const isCorrectDashboard = currentPath === expectedPath;
  
  if (!isCorrectDashboard) {
    issues.push(`User with role '${userRole}' is on '${currentPath}' but should be on '${expectedPath}'`);
  }
  
  // Additional checks
  if (userRole === 'admin' && !currentPath.includes('/admin')) {
    issues.push('Admin user not on admin dashboard');
  }
  
  if (userRole === 'host' && !currentPath.includes('/host-dashboard')) {
    issues.push('Host user not on host dashboard');
  }
  
  if (userRole === 'user' && !currentPath.includes('/user-dashboard')) {
    issues.push('Regular user not on user dashboard');
  }
  
  return {
    isCorrectDashboard,
    expectedPath,
    issues
  };
};

/**
 * Test Google OAuth functionality
 */
export const testGoogleOAuth = (): {
  available: boolean;
  issues: string[];
  recommendations: string[];
} => {
  const issues: string[] = [];
  const recommendations: string[] = [];
  
  // Check if Google APIs are available
  if (typeof window === 'undefined') {
    issues.push('Window object not available (SSR environment)');
    return { available: false, issues, recommendations };
  }
  
  // Check for popup blockers
  try {
    const popup = window.open('', '_blank', 'width=1,height=1');
    if (popup) {
      popup.close();
    } else {
      issues.push('Popup blocker detected');
      recommendations.push('Ask users to allow popups for this site');
    }
  } catch (error) {
    issues.push('Popup functionality blocked');
    recommendations.push('Check browser popup settings');
  }
  
  // Check for third-party cookies
  if (!navigator.cookieEnabled) {
    issues.push('Cookies disabled');
    recommendations.push('Ask users to enable cookies');
  }
  
  // Check for HTTPS in production
  if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
    issues.push('Not using HTTPS in production');
    recommendations.push('Ensure production deployment uses HTTPS');
  }
  
  return {
    available: issues.length === 0,
    issues,
    recommendations
  };
};

/**
 * Comprehensive authentication system test
 */
export const runComprehensiveAuthTest = async (
  user: User | null,
  userRole: string | null,
  currentPath: string
): Promise<{
  overallSuccess: boolean;
  authTest: any;
  routingTest: any;
  oauthTest: any;
  summary: string[];
}> => {
  const summary: string[] = [];
  
  // Test 1: Authentication
  let authTest = null;
  if (user && userRole) {
    authTest = await testUserAuthentication(user, userRole);
    if (authTest.success) {
      summary.push('✅ Authentication test passed');
    } else {
      summary.push('❌ Authentication test failed');
      summary.push(...authTest.issues.map(issue => `  - ${issue}`));
    }
  } else {
    summary.push('⚠️ No authenticated user to test');
  }
  
  // Test 2: Role-based routing
  let routingTest = null;
  if (userRole) {
    routingTest = testRoleBasedRouting(userRole, currentPath);
    if (routingTest.isCorrectDashboard) {
      summary.push('✅ Role-based routing test passed');
    } else {
      summary.push('❌ Role-based routing test failed');
      summary.push(...routingTest.issues.map(issue => `  - ${issue}`));
    }
  } else {
    summary.push('⚠️ No user role to test routing');
  }
  
  // Test 3: Google OAuth
  const oauthTest = testGoogleOAuth();
  if (oauthTest.available) {
    summary.push('✅ Google OAuth compatibility test passed');
  } else {
    summary.push('❌ Google OAuth compatibility issues detected');
    summary.push(...oauthTest.issues.map(issue => `  - ${issue}`));
  }
  
  const overallSuccess = 
    (!authTest || authTest.success) &&
    (!routingTest || routingTest.isCorrectDashboard) &&
    oauthTest.available;
  
  return {
    overallSuccess,
    authTest,
    routingTest,
    oauthTest,
    summary
  };
};

/**
 * Log comprehensive test results
 */
export const logAuthTestResults = async (
  user: User | null,
  userRole: string | null,
  currentPath: string
): Promise<void> => {
  console.group('🧪 Comprehensive Authentication Test Results');
  
  const results = await runComprehensiveAuthTest(user, userRole, currentPath);
  
  console.log('Overall Success:', results.overallSuccess ? '✅ PASS' : '❌ FAIL');
  console.log('\nSummary:');
  results.summary.forEach(line => console.log(line));
  
  if (results.authTest) {
    console.log('\nAuthentication Details:', results.authTest);
  }
  
  if (results.routingTest) {
    console.log('\nRouting Details:', results.routingTest);
  }
  
  console.log('\nOAuth Details:', results.oauthTest);
  
  console.groupEnd();
};
