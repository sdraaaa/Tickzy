/**
 * Authentication Test Runner
 * 
 * This utility helps test and verify the authentication system is working correctly
 * for all predefined users.
 */

import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/firebase';
import { PREDEFINED_USERS } from './userRoleSetup';

interface AuthTestResult {
  email: string;
  expectedRole: string;
  success: boolean;
  actualRole?: string;
  error?: string;
  uid?: string;
}

/**
 * Test authentication for a specific user
 */
export const testUserAuth = async (email: string, password: string): Promise<AuthTestResult> => {
  const predefinedUser = PREDEFINED_USERS.find(u => u.email === email);
  const expectedRole = predefinedUser?.role || 'user';
  
  try {
    console.log(`🧪 Testing authentication for ${email}...`);
    
    // Sign in the user
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Wait a moment for the AuthContext to process the user
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Get user document from Firestore
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    
    if (!userDoc.exists()) {
      return {
        email,
        expectedRole,
        success: false,
        error: 'User document not found in Firestore',
        uid: user.uid
      };
    }
    
    const userData = userDoc.data();
    const actualRole = userData.role;
    
    const success = actualRole === expectedRole;
    
    console.log(`${success ? '✅' : '❌'} ${email}: Expected ${expectedRole}, got ${actualRole}`);
    
    return {
      email,
      expectedRole,
      actualRole,
      success,
      uid: user.uid
    };
    
  } catch (error) {
    console.error(`❌ Authentication failed for ${email}:`, error);
    return {
      email,
      expectedRole,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

/**
 * Test all predefined users (requires passwords)
 */
export const testAllPredefinedUsers = async (passwords: Record<string, string>): Promise<AuthTestResult[]> => {
  console.log('🧪 Starting comprehensive authentication tests...');
  
  const results: AuthTestResult[] = [];
  
  for (const user of PREDEFINED_USERS) {
    const password = passwords[user.email];
    
    if (!password) {
      console.warn(`⚠️ No password provided for ${user.email}, skipping...`);
      results.push({
        email: user.email,
        expectedRole: user.role,
        success: false,
        error: 'No password provided'
      });
      continue;
    }
    
    const result = await testUserAuth(user.email, password);
    results.push(result);
    
    // Sign out before testing next user
    try {
      await signOut(auth);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for sign out
    } catch (error) {
      console.warn('Warning: Failed to sign out between tests:', error);
    }
  }
  
  // Print summary
  console.log('\n📊 Authentication Test Summary:');
  const successful = results.filter(r => r.success).length;
  const total = results.length;
  
  console.log(`✅ Successful: ${successful}/${total}`);
  console.log(`❌ Failed: ${total - successful}/${total}`);
  
  results.forEach(result => {
    if (!result.success) {
      console.log(`❌ ${result.email}: ${result.error}`);
    }
  });
  
  return results;
};

/**
 * Quick test for current user's role assignment
 */
export const testCurrentUserRole = async (): Promise<void> => {
  const user = auth.currentUser;
  
  if (!user) {
    console.log('❌ No user currently authenticated');
    return;
  }
  
  console.log(`🧪 Testing current user: ${user.email}`);
  
  const predefinedUser = PREDEFINED_USERS.find(u => u.email === user.email);
  const expectedRole = predefinedUser?.role || 'user';
  
  try {
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    
    if (!userDoc.exists()) {
      console.log('❌ User document not found in Firestore');
      return;
    }
    
    const userData = userDoc.data();
    const actualRole = userData.role;
    
    console.log(`📋 User Info:`);
    console.log(`  Email: ${user.email}`);
    console.log(`  UID: ${user.uid}`);
    console.log(`  Expected Role: ${expectedRole}`);
    console.log(`  Actual Role: ${actualRole}`);
    console.log(`  Is Predefined: ${!!predefinedUser}`);
    console.log(`  Is Pre-configured: ${userData.isPreConfigured || false}`);
    console.log(`  Role Match: ${actualRole === expectedRole ? '✅' : '❌'}`);
    
  } catch (error) {
    console.error('❌ Error testing current user role:', error);
  }
};

// Make functions available in browser console for debugging
if (typeof window !== 'undefined') {
  (window as any).testUserAuth = testUserAuth;
  (window as any).testAllPredefinedUsers = testAllPredefinedUsers;
  (window as any).testCurrentUserRole = testCurrentUserRole;
}
