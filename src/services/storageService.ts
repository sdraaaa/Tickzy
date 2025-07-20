/**
 * Firebase Storage Service
 * 
 * Handles file uploads to Firebase Storage with proper error handling,
 * progress tracking, and security validation.
 */

import {
  ref,
  uploadBytes,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  UploadTaskSnapshot
} from 'firebase/storage';
import { storage } from '@/firebase/index';

export interface UploadProgress {
  bytesTransferred: number;
  totalBytes: number;
  progress: number; // 0-100
  state: 'running' | 'paused' | 'success' | 'canceled' | 'error';
}

export interface UploadResult {
  downloadURL: string;
  fullPath: string;
  name: string;
  size: number;
}

/**
 * Validate image file before upload
 */
export const validateImageFile = (file: File): { valid: boolean; error?: string } => {
  const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const allowedExtensions = ['.png', '.jpg', '.jpeg', '.webp'];
  const maxSize = 5 * 1024 * 1024; // 5MB

  // Debug logging
  console.log('🔍 Image file validation:', {
    fileName: file.name,
    fileType: file.type || 'MIME type not detected',
    fileSize: file.size,
    fileSizeFormatted: formatFileSize(file.size)
  });

  // Get file extension (case-insensitive)
  const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));

  // Check file size first
  if (file.size > maxSize) {
    const error = `Image size must be less than ${formatFileSize(maxSize)}. Current size: ${formatFileSize(file.size)}.`;
    console.log('❌ Image validation failed - size:', error);
    return { valid: false, error };
  }

  // Primary validation: Check MIME type (if available and reliable)
  const mimeTypeValid = file.type && allowedMimeTypes.includes(file.type.toLowerCase());

  // Fallback validation: Check file extension
  const extensionValid = allowedExtensions.includes(fileExtension);

  // Debug logging for validation results
  console.log('🔍 Image validation details:', {
    mimeType: file.type || 'undefined',
    mimeTypeValid,
    extension: fileExtension,
    extensionValid,
    finalResult: mimeTypeValid || extensionValid
  });

  // Accept file if either MIME type OR extension is valid
  if (!mimeTypeValid && !extensionValid) {
    const error = `Only image files are allowed. Supported formats: JPG, JPEG, PNG, WebP.\nDetected type: ${file.type || 'unknown'}\nFile extension: ${fileExtension}`;
    console.log('❌ Image validation failed - type:', error);
    return { valid: false, error };
  }

  // Log when using fallback validation
  if (!mimeTypeValid && extensionValid) {
    console.log('⚠️ MIME type detection failed, using extension-based validation for:', file.name);
  }

  console.log('✅ Image validation passed for:', file.name);
  return { valid: true };
};

/**
 * Generate a unique filename for the uploaded image
 */
export const generateImageFilename = (originalName: string, eventId?: string): string => {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 8);
  const extension = originalName.split('.').pop()?.toLowerCase() || 'jpg';
  
  if (eventId) {
    return `${eventId}_${timestamp}_${randomString}.${extension}`;
  }
  
  return `event_${timestamp}_${randomString}.${extension}`;
};

/**
 * Upload event banner image to Firebase Storage
 */
export const uploadEventBanner = (
  file: File,
  eventId: string,
  onProgress?: (progress: UploadProgress) => void
): Promise<UploadResult> => {
  return new Promise(async (resolve, reject) => {
    // Validate file first
    const validation = validateImageFile(file);
    if (!validation.valid) {
      reject(new Error(validation.error));
      return;
    }

    // Generate unique filename
    const filename = generateImageFilename(file.name, eventId);
    const storagePath = `events/banners/${eventId}/${filename}`;

    console.log('🔄 Starting image upload:', {
      fileName: file.name,
      fileSize: formatFileSize(file.size),
      eventId,
      storagePath,
      generatedFilename: filename,
      storageApp: storage.app.name,
      storageBucket: storage.app.options.storageBucket
    });

    // Create storage reference
    const storageRef = ref(storage, storagePath);
    console.log('📁 Storage reference created:', {
      bucket: storageRef.bucket,
      fullPath: storageRef.fullPath,
      name: storageRef.name
    });

    // Try using uploadBytes instead of uploadBytesResumable to avoid CORS issues
    try {
      console.log('⬆️ Attempting direct upload with uploadBytes...');
      const snapshot = await uploadBytes(storageRef, file);
      console.log('✅ Direct upload successful:', snapshot);

      const downloadURL = await getDownloadURL(snapshot.ref);
      const result: UploadResult = {
        downloadURL,
        fullPath: snapshot.ref.fullPath,
        name: filename,
        size: file.size,
        contentType: file.type
      };

      console.log('✅ Image upload completed:', result);
      resolve(result);
      return;
    } catch (directUploadError) {
      console.log('⚠️ Direct upload failed, trying resumable upload:', directUploadError);
    }

    // Fallback to resumable upload
    const uploadTask = uploadBytesResumable(storageRef, file);
    console.log('⬆️ Upload task created, starting resumable upload...');

    // Monitor upload progress
    uploadTask.on('state_changed', 
      (snapshot: UploadTaskSnapshot) => {
        const progress: UploadProgress = {
          bytesTransferred: snapshot.bytesTransferred,
          totalBytes: snapshot.totalBytes,
          progress: Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100),
          state: snapshot.state as any
        };
        
        if (onProgress) {
          onProgress(progress);
        }
      },
      (error) => {
        console.error('🚨 Firebase Storage Upload Error:', {
          code: error.code,
          message: error.message,
          serverResponse: error.serverResponse,
          customData: error.customData
        });

        let errorMessage = 'Upload failed. Please try again.';

        switch (error.code) {
          case 'storage/unauthorized':
            errorMessage = 'You do not have permission to upload files. Please ensure you are logged in as an approved host.';
            break;
          case 'storage/canceled':
            errorMessage = 'Upload was canceled.';
            break;
          case 'storage/quota-exceeded':
            errorMessage = 'Storage quota exceeded. Please contact support.';
            break;
          case 'storage/invalid-format':
            errorMessage = 'Invalid file format. Please upload a valid image.';
            break;
          case 'storage/retry-limit-exceeded':
            errorMessage = 'Upload failed after multiple retries. Please check your connection.';
            break;
          default:
            errorMessage = `Upload failed: ${error.message || error.code || 'Unknown error'}. Please check Firebase Storage configuration.`;
        }

        reject(new Error(errorMessage));
      },
      async () => {
        try {
          // Upload completed successfully, get download URL
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          
          const result: UploadResult = {
            downloadURL,
            fullPath: uploadTask.snapshot.ref.fullPath,
            name: filename,
            size: file.size
          };
          
          console.log('✅ Image uploaded successfully:', result);
          resolve(result);
        } catch (error) {
          console.error('Error getting download URL:', error);
          reject(new Error('Upload completed but failed to get download URL.'));
        }
      }
    );
  });
};

/**
 * Delete an uploaded image from Firebase Storage
 */
export const deleteEventBanner = async (fullPath: string): Promise<void> => {
  try {
    const storageRef = ref(storage, fullPath);
    await deleteObject(storageRef);
    console.log('✅ Image deleted successfully:', fullPath);
  } catch (error: any) {
    console.error('Error deleting image:', error);

    if (error.code === 'storage/object-not-found') {
      // File doesn't exist, which is fine
      return;
    }

    throw new Error('Failed to delete image. Please try again.');
  }
};

/**
 * Validate document file (PDF, DOC, DOCX)
 */
export const validateDocumentFile = (file: File): { valid: boolean; error?: string } => {
  const allowedMimeTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  const allowedExtensions = ['.pdf', '.doc', '.docx'];
  const maxSize = 10 * 1024 * 1024; // 10MB

  // Debug logging
  console.log('🔍 Document file validation:', {
    fileName: file.name,
    fileType: file.type || 'MIME type not detected',
    fileSize: file.size,
    fileSizeFormatted: formatFileSize(file.size)
  });

  // Get file extension (case-insensitive)
  const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));

  // Check file size first
  if (file.size > maxSize) {
    const error = `File size must be less than ${formatFileSize(maxSize)}. Current size: ${formatFileSize(file.size)}.`;
    console.log('❌ Document validation failed - size:', error);
    return { valid: false, error };
  }

  // Primary validation: Check MIME type (if available and reliable)
  const mimeTypeValid = file.type && allowedMimeTypes.includes(file.type.toLowerCase());

  // Fallback validation: Check file extension
  const extensionValid = allowedExtensions.includes(fileExtension);

  // Debug logging for validation results
  console.log('🔍 Document validation details:', {
    mimeType: file.type || 'undefined',
    mimeTypeValid,
    extension: fileExtension,
    extensionValid,
    finalResult: mimeTypeValid || extensionValid
  });

  // Accept file if either MIME type OR extension is valid
  if (!mimeTypeValid && !extensionValid) {
    const error = `Only document files are allowed. Supported formats: PDF, DOC, DOCX.\nDetected type: ${file.type || 'unknown'}\nFile extension: ${fileExtension}`;
    console.log('❌ Document validation failed - type:', error);
    return { valid: false, error };
  }

  // Log when using fallback validation
  if (!mimeTypeValid && extensionValid) {
    console.log('⚠️ MIME type detection failed, using extension-based validation for:', file.name);
  }

  console.log('✅ Document validation passed for:', file.name);
  return { valid: true };
};

/**
 * Generate a unique filename for the uploaded document
 */
export const generateDocumentFilename = (originalName: string, eventId?: string): string => {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 8);
  const extension = originalName.split('.').pop()?.toLowerCase() || 'pdf';

  if (eventId) {
    return `${eventId}_venue_${timestamp}_${randomString}.${extension}`;
  }

  return `venue_${timestamp}_${randomString}.${extension}`;
};

/**
 * Upload venue document to Firebase Storage
 */
export const uploadVenueDocument = (
  file: File,
  eventId: string,
  onProgress?: (progress: UploadProgress) => void
): Promise<UploadResult> => {
  return new Promise(async (resolve, reject) => {
    // Validate file first
    const validation = validateDocumentFile(file);
    if (!validation.valid) {
      reject(new Error(validation.error));
      return;
    }

    // Generate unique filename
    const filename = generateDocumentFilename(file.name, eventId);
    const storagePath = `events/documents/${eventId}/${filename}`;

    console.log('🔄 Starting document upload:', {
      fileName: file.name,
      fileSize: formatFileSize(file.size),
      eventId,
      storagePath,
      generatedFilename: filename
    });

    // Create storage reference (restricted access path)
    const storageRef = ref(storage, storagePath);

    // Try using uploadBytes instead of uploadBytesResumable to avoid CORS issues
    try {
      console.log('⬆️ Attempting direct document upload with uploadBytes...');
      const snapshot = await uploadBytes(storageRef, file);
      console.log('✅ Direct document upload successful:', snapshot);

      const downloadURL = await getDownloadURL(snapshot.ref);
      const result: UploadResult = {
        downloadURL,
        fullPath: snapshot.ref.fullPath,
        name: filename,
        size: file.size,
        contentType: file.type
      };

      console.log('✅ Document upload completed:', result);
      resolve(result);
      return;
    } catch (directUploadError) {
      console.log('⚠️ Direct document upload failed, trying resumable upload:', directUploadError);
    }

    // Fallback to resumable upload
    const uploadTask = uploadBytesResumable(storageRef, file);

    // Handle upload progress
    uploadTask.on(
      'state_changed',
      (snapshot: UploadTaskSnapshot) => {
        const progress: UploadProgress = {
          bytesTransferred: snapshot.bytesTransferred,
          totalBytes: snapshot.totalBytes,
          progress: Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100),
          state: snapshot.state as any
        };

        if (onProgress) {
          onProgress(progress);
        }

        console.log(`📄 Document upload progress: ${progress.progress}%`);
      },
      (error) => {
        console.error('🚨 Firebase Storage Document Upload Error:', {
          code: error.code,
          message: error.message,
          serverResponse: error.serverResponse,
          customData: error.customData
        });

        let errorMessage = 'Document upload failed. Please try again.';

        switch (error.code) {
          case 'storage/unauthorized':
            errorMessage = 'You do not have permission to upload documents. Please ensure you are logged in as an approved host.';
            break;
          case 'storage/canceled':
            errorMessage = 'Document upload was cancelled.';
            break;
          case 'storage/quota-exceeded':
            errorMessage = 'Storage quota exceeded. Please try again later.';
            break;
          case 'storage/retry-limit-exceeded':
            errorMessage = 'Document upload failed after multiple retries. Please check your connection.';
            break;
          default:
            errorMessage = `Document upload failed: ${error.message || error.code || 'Unknown error'}. Please check Firebase Storage configuration.`;
        }

        reject(new Error(errorMessage));
      },
      async () => {
        try {
          // Upload completed successfully, get download URL
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

          const result: UploadResult = {
            downloadURL,
            fullPath: uploadTask.snapshot.ref.fullPath,
            name: filename,
            size: file.size
          };

          console.log('✅ Document uploaded successfully:', result);
          resolve(result);
        } catch (error) {
          console.error('Error getting document download URL:', error);
          reject(new Error('Document upload completed but failed to get download URL.'));
        }
      }
    );
  });
};

/**
 * Delete an uploaded document from Firebase Storage
 */
export const deleteVenueDocument = async (fullPath: string): Promise<void> => {
  try {
    const storageRef = ref(storage, fullPath);
    await deleteObject(storageRef);
    console.log('✅ Document deleted successfully:', fullPath);
  } catch (error: any) {
    console.error('Error deleting document:', error);

    if (error.code === 'storage/object-not-found') {
      // File doesn't exist, which is fine
      return;
    }

    throw new Error('Failed to delete document. Please try again.');
  }
};

/**
 * Create a preview URL for a file (for local preview before upload)
 */
export const createFilePreviewURL = (file: File): string => {
  return URL.createObjectURL(file);
};

/**
 * Clean up preview URL to prevent memory leaks
 */
export const revokeFilePreviewURL = (url: string): void => {
  URL.revokeObjectURL(url);
};

/**
 * Get file size in human-readable format
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Check if user has permission to upload files
 */
export const checkUploadPermission = async (): Promise<boolean> => {
  try {
    // This is a basic check - in a real implementation, you might want to
    // verify the user's role and hostStatus from Firestore
    const { auth } = await import('@/firebase/index');
    return auth.currentUser !== null;
  } catch (error) {
    console.error('Error checking upload permission:', error);
    return false;
  }
};

/**
 * Compress image before upload (optional utility)
 */
export const compressImage = (file: File, maxWidth: number = 1920, quality: number = 0.8): Promise<File> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img;
      
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      
      // Set canvas dimensions
      canvas.width = width;
      canvas.height = height;
      
      // Draw and compress
      ctx?.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now()
            });
            resolve(compressedFile);
          } else {
            resolve(file); // Return original if compression fails
          }
        },
        file.type,
        quality
      );
    };
    
    img.onerror = () => resolve(file); // Return original if loading fails
    img.src = URL.createObjectURL(file);
  });
};
