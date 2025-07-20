import { doc, setDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/firebase';

export interface UserRole {
  email: string;
  role: 'user' | 'host' | 'admin';
  displayName: string;
  firstName?: string;
  lastName?: string;
  hostStatus?: 'none' | 'pending' | 'approved' | 'rejected';
}

// Predefined user roles for Tickzy application
export const PREDEFINED_USERS: UserRole[] = [
  {
    email: 'sidraaleem8113@gmail.com',
    role: 'user',
    displayName: 'Sidra Aleem',
    firstName: 'Sidra',
    lastName: 'Aleem'
  },
  {
    email: 'abdulaleemsidra@gmail.com',
    role: 'host',
    displayName: 'Abdul Aleem Sidra',
    firstName: 'Abdul Aleem',
    lastName: 'Sidra',
    hostStatus: 'approved'
  },
  {
    email: 'aleemsidra2205@gmail.com',
    role: 'admin',
    displayName: 'Aleem Sidra',
    firstName: 'Aleem',
    lastName: 'Sidra'
  }
];

/**
 * Find a predefined user by email (checks against PREDEFINED_USERS array)
 * This is used during authentication to check if a user should get a specific role
 */
export const findPredefinedUserByEmail = (email: string): UserRole | null => {
  const predefinedUser = PREDEFINED_USERS.find(user => user.email.toLowerCase() === email.toLowerCase());
  return predefinedUser || null;
};

/**
 * Create or update a user document in Firestore with specific role
 */
export const createUserWithRole = async (userRole: UserRole): Promise<void> => {
  try {
    console.log(`Creating/updating user: ${userRole.email} with role: ${userRole.role}`);
    
    // First, check if a user with this email already exists
    const existingUser = await findUserByEmail(userRole.email);
    
    if (existingUser) {
      console.log(`User with email ${userRole.email} already exists with UID: ${existingUser.uid}`);
      
      // Update the existing user document
      const userDocRef = doc(db, 'users', existingUser.uid);
      await setDoc(userDocRef, {
        ...existingUser.data,
        role: userRole.role,
        displayName: userRole.displayName,
        firstName: userRole.firstName,
        lastName: userRole.lastName,
        updatedAt: new Date().toISOString(),
      }, { merge: true });
      
      console.log(`Updated existing user ${userRole.email} with role ${userRole.role}`);
    } else {
      // Create a new user document with a generated ID
      // Note: This creates a placeholder document that will be updated when the user actually signs in
      const userDocRef = doc(collection(db, 'users'));
      const userData: any = {
        email: userRole.email,
        role: userRole.role,
        displayName: userRole.displayName,
        firstName: userRole.firstName,
        lastName: userRole.lastName,
        createdAt: new Date().toISOString(),
        isPreConfigured: true, // Flag to indicate this was pre-configured
      };

      // Add hostStatus for host users
      if (userRole.role === 'host' && userRole.hostStatus) {
        userData.hostStatus = userRole.hostStatus;
      }

      await setDoc(userDocRef, userData);
      
      console.log(`Created new user document for ${userRole.email} with role ${userRole.role}`);
    }
  } catch (error) {
    console.error(`Error creating/updating user ${userRole.email}:`, error);
    throw error;
  }
};

/**
 * Find a user document by email address
 */
export const findUserByEmail = async (email: string): Promise<{ uid: string; data: any } | null> => {
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', email));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return {
        uid: doc.id,
        data: doc.data()
      };
    }
    
    return null;
  } catch (error) {
    console.error(`Error finding user by email ${email}:`, error);
    return null;
  }
};

/**
 * Set up all predefined users
 */
export const setupPredefinedUsers = async (): Promise<void> => {
  console.log('Setting up predefined users...');
  
  for (const userRole of PREDEFINED_USERS) {
    await createUserWithRole(userRole);
  }
  
  console.log('All predefined users have been set up successfully!');
};

/**
 * Get user role by email (for testing purposes)
 */
export const getUserRoleByEmail = async (email: string): Promise<string | null> => {
  try {
    const user = await findUserByEmail(email);
    return user ? user.data.role : null;
  } catch (error) {
    console.error(`Error getting user role for ${email}:`, error);
    return null;
  }
};

/**
 * List all users with their roles (for admin purposes)
 */
export const listAllUsers = async (): Promise<Array<{ uid: string; email: string; role: string; displayName: string }>> => {
  try {
    const usersRef = collection(db, 'users');
    const querySnapshot = await getDocs(usersRef);
    
    const users: Array<{ uid: string; email: string; role: string; displayName: string }> = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      users.push({
        uid: doc.id,
        email: data.email || 'No email',
        role: data.role || 'user',
        displayName: data.displayName || 'No name'
      });
    });
    
    return users;
  } catch (error) {
    console.error('Error listing users:', error);
    return [];
  }
};
