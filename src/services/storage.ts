/**
 * Firebase Storage service for PDF uploads
 */

import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../firebase';

export interface UploadProgress {
  progress: number;
  isUploading: boolean;
  error: string | null;
  downloadURL: string | null;
}

/**
 * Upload a PDF file to Firebase Storage
 */
export const uploadPDF = async (
  file: File,
  path: string,
  onProgress?: (progress: UploadProgress) => void
): Promise<string> => {
  if (!storage) {
    throw new Error('Firebase Storage not initialized');
  }

  // Validate file type
  if (file.type !== 'application/pdf') {
    throw new Error('Only PDF files are allowed');
  }

  // Validate file size (max 10MB)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    throw new Error('File size must be less than 10MB');
  }

  try {
    // Update progress - start upload
    onProgress?.({
      progress: 0,
      isUploading: true,
      error: null,
      downloadURL: null
    });

    // Create storage reference
    const storageRef = ref(storage, path);

    // Upload file
    onProgress?.({
      progress: 50,
      isUploading: true,
      error: null,
      downloadURL: null
    });

    const snapshot = await uploadBytes(storageRef, file);

    // Get download URL
    onProgress?.({
      progress: 90,
      isUploading: true,
      error: null,
      downloadURL: null
    });

    const downloadURL = await getDownloadURL(snapshot.ref);

    // Update progress - complete
    onProgress?.({
      progress: 100,
      isUploading: false,
      error: null,
      downloadURL
    });

    return downloadURL;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Upload failed';
    
    onProgress?.({
      progress: 0,
      isUploading: false,
      error: errorMessage,
      downloadURL: null
    });

    throw new Error(errorMessage);
  }
};

/**
 * Delete a PDF file from Firebase Storage
 */
export const deletePDF = async (downloadURL: string): Promise<void> => {
  if (!storage) {
    throw new Error('Firebase Storage not initialized');
  }

  try {
    const storageRef = ref(storage, downloadURL);
    await deleteObject(storageRef);
  } catch (error) {
    throw new Error('Failed to delete PDF');
  }
};

/**
 * Upload an image file to Firebase Storage
 */
export const uploadImage = async (
  file: File,
  path: string,
  onProgress?: (progress: UploadProgress) => void
): Promise<string> => {
  if (!storage) {
    throw new Error('Firebase Storage not initialized');
  }



  // Validate file type
  if (!file.type.startsWith('image/')) {
    throw new Error('Only image files are allowed');
  }

  // Validate specific image types
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Only JPG and PNG files are allowed');
  }

  // Validate file size (max 2MB for profile images)
  const maxSize = 2 * 1024 * 1024; // 2MB
  if (file.size > maxSize) {
    throw new Error('File size must be less than 2MB');
  }

  try {
    // Update progress - start upload
    onProgress?.({
      progress: 0,
      isUploading: true,
      error: null,
      downloadURL: null
    });

    // Create storage reference
    const storageRef = ref(storage, path);

    // Upload file
    onProgress?.({
      progress: 50,
      isUploading: true,
      error: null,
      downloadURL: null
    });

    const snapshot = await uploadBytes(storageRef, file);

    // Get download URL
    onProgress?.({
      progress: 90,
      isUploading: true,
      error: null,
      downloadURL: null
    });

    const downloadURL = await getDownloadURL(snapshot.ref);

    // Update progress - complete
    onProgress?.({
      progress: 100,
      isUploading: false,
      error: null,
      downloadURL
    });

    return downloadURL;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Upload failed';

    onProgress?.({
      progress: 0,
      isUploading: false,
      error: errorMessage,
      downloadURL: null
    });

    throw new Error(errorMessage);
  }
};

/**
 * Delete an image file from Firebase Storage
 */
export const deleteImage = async (downloadURL: string): Promise<void> => {
  if (!storage) {
    throw new Error('Firebase Storage not initialized');
  }

  try {
    const storageRef = ref(storage, downloadURL);
    await deleteObject(storageRef);
  } catch (error) {
    throw new Error('Failed to delete image');
  }
};

/**
 * Generate a unique filename for PDF uploads
 */
export const generatePDFPath = (folder: string, identifier: string): string => {
  const timestamp = Date.now();
  return `${folder}/${identifier}_${timestamp}.pdf`;
};

/**
 * Generate a path for profile picture uploads
 */
export const generateProfileImagePath = (userId: string, file: File): string => {
  // Get the file extension from the original file to preserve format
  const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  return `profilePictures/${userId}.${extension}`;
};

/**
 * Validate PDF file before upload
 */
export const validatePDFFile = (file: File): { isValid: boolean; error?: string } => {
  // Check file type
  if (file.type !== 'application/pdf') {
    return { isValid: false, error: 'Only PDF files are allowed' };
  }

  // Check file size (max 10MB)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    return { isValid: false, error: 'File size must be less than 10MB' };
  }

  // Check file name
  if (!file.name.toLowerCase().endsWith('.pdf')) {
    return { isValid: false, error: 'File must have .pdf extension' };
  }

  return { isValid: true };
};

/**
 * Format file size for display
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Safely open a PDF file in a new tab with proper error handling
 */
export const openPDFSafely = async (downloadURL: string, fileName?: string): Promise<void> => {
  try {
    // Validate URL format
    if (!downloadURL || !downloadURL.startsWith('https://firebasestorage.googleapis.com')) {
      throw new Error('Invalid Firebase Storage URL');
    }

    // Try to open in new tab
    const newWindow = window.open(
      downloadURL,
      '_blank',
      'noopener,noreferrer,width=1200,height=800,scrollbars=yes,resizable=yes'
    );

    if (!newWindow) {
      // Popup blocked, try alternative method
      const link = document.createElement('a');
      link.href = downloadURL;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      if (fileName) {
        link.download = fileName;
      }

      // Add to DOM temporarily
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  } catch (error) {
    // Show user-friendly error message
    alert('Unable to open PDF file. Please check your browser settings and try again.');

    // As a last resort, copy URL to clipboard
    try {
      await navigator.clipboard.writeText(downloadURL);
      alert('PDF URL copied to clipboard. You can paste it in a new tab to view the file.');
    } catch (clipboardError) {
      // Silent fail for clipboard
    }
  }
};
