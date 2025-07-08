// Test user data for development/testing purposes
// This file contains sample user data structures for testing role-based routing

export const testUserData = {
  // Regular user
  user: {
    email: 'user@test.com',
    displayName: 'Test User',
    role: 'user',
    firstName: 'Test',
    lastName: 'User',
    createdAt: new Date().toISOString(),
  },
  
  // Host user
  host: {
    email: 'host@test.com',
    displayName: 'Test Host',
    role: 'host',
    firstName: 'Test',
    lastName: 'Host',
    createdAt: new Date().toISOString(),
  },
  
  // Admin user
  admin: {
    email: 'admin@test.com',
    displayName: 'Test Admin',
    role: 'admin',
    firstName: 'Test',
    lastName: 'Admin',
    createdAt: new Date().toISOString(),
  },
};

// Helper function to create test user document in Firestore
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/firebase';

export const createTestUser = async (userId: string, userType: 'user' | 'host' | 'admin') => {
  try {
    const userData = testUserData[userType];
    await setDoc(doc(db, 'users', userId), userData);
    console.log(`Test ${userType} created successfully`);
  } catch (error) {
    console.error(`Error creating test ${userType}:`, error);
  }
};
