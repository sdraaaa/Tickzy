/**
 * Profile Service
 * 
 * Service functions for updating user profile information
 * Handles both Firebase Auth and Firestore synchronization
 */

import { updateProfile, User } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { uploadImage, generateProfileImagePath, deleteImage } from './storage';

export interface ProfileUpdateData {
  displayName?: string;
  photoURL?: string;
}

/**
 * Update user profile in both Firebase Auth and Firestore
 */
export const updateUserProfile = async (
  user: User,
  updates: ProfileUpdateData
): Promise<void> => {
  if (!user || !db) {
    throw new Error('User not authenticated or database not available');
  }

  try {
    // Update Firebase Auth profile
    await updateProfile(user, updates);

    // Update Firestore user document
    const userDocRef = doc(db, 'users', user.uid);
    const firestoreUpdates: any = {
      updatedAt: new Date()
    };

    if (updates.displayName !== undefined) {
      firestoreUpdates.displayName = updates.displayName;
    }

    if (updates.photoURL !== undefined) {
      firestoreUpdates.photoURL = updates.photoURL;
    }

    await updateDoc(userDocRef, firestoreUpdates);
  } catch (error) {
    console.error('Error updating profile:', error);
    throw new Error('Failed to update profile. Please try again.');
  }
};

/**
 * Update user display name
 */
export const updateDisplayName = async (
  user: User,
  displayName: string
): Promise<void> => {
  if (!displayName.trim()) {
    throw new Error('Display name cannot be empty');
  }

  if (displayName.length > 50) {
    throw new Error('Display name must be less than 50 characters');
  }

  await updateUserProfile(user, { displayName: displayName.trim() });
};

/**
 * Upload and update profile picture
 */
export const updateProfilePicture = async (
  user: User,
  file: File,
  onProgress?: (progress: { progress: number; isUploading: boolean; error: string | null }) => void
): Promise<string> => {
  if (!user) {
    throw new Error('User not authenticated');
  }

  try {
    // Generate storage path with original file extension to preserve format
    const storagePath = generateProfileImagePath(user.uid, file);

    // Upload image to Firebase Storage
    const downloadURL = await uploadImage(file, storagePath, onProgress);

    // Update user profile with new photo URL
    await updateUserProfile(user, { photoURL: downloadURL });

    return downloadURL;
  } catch (error) {
    console.error('Error updating profile picture:', error);
    throw error;
  }
};

/**
 * Remove profile picture
 */
export const removeProfilePicture = async (user: User): Promise<void> => {
  if (!user) {
    throw new Error('User not authenticated');
  }

  try {
    // If user has a current photo URL, try to delete it from storage
    if (user.photoURL) {
      try {
        await deleteImage(user.photoURL);
      } catch (error) {
        // Don't fail the entire operation if we can't delete the old image
        console.warn('Could not delete old profile image:', error);
      }
    }

    // Update user profile to remove photo URL
    await updateUserProfile(user, { photoURL: '' });
  } catch (error) {
    console.error('Error removing profile picture:', error);
    throw new Error('Failed to remove profile picture. Please try again.');
  }
};

/**
 * Validate profile image file
 */
export const validateProfileImage = (file: File): string | null => {
  // Check file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
  if (!allowedTypes.includes(file.type)) {
    return 'Only JPG and PNG files are allowed';
  }

  // Check file size (2MB limit)
  const maxSize = 2 * 1024 * 1024; // 2MB
  if (file.size > maxSize) {
    return 'File size must be less than 2MB';
  }

  return null; // No validation errors
};

/**
 * Get user's profile picture URL or return default
 */
export const getProfilePictureURL = (user: User | null): string | null => {
  return user?.photoURL || null;
};

/**
 * Get user's display name or fallback to email
 */
export const getDisplayName = (user: User | null): string => {
  if (!user) return 'Unknown User';
  return user.displayName || user.email?.split('@')[0] || 'Unknown User';
};
