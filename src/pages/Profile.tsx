/**
 * Profile Page
 * 
 * User profile management page with editable name and uploadable profile picture
 * Accessible via avatar dropdown in navbar
 */

import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { updateDisplayName, updateProfilePicture, validateProfileImage, getDisplayName } from '../services/profileService';
import { ToastContainer, useToast } from '../components/ui/Toast';
import UnifiedNavbar from '../components/ui/UnifiedNavbar';

const Profile: React.FC = () => {
  const { user, userData, loading } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Form state
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [isUpdatingName, setIsUpdatingName] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  // Toast notifications
  const { toasts, showSuccess, showError, removeToast } = useToast();

  // Handle display name update
  const handleNameUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      showError('Authentication Error', 'Please log in to update your profile');
      return;
    }

    if (!displayName.trim()) {
      showError('Validation Error', 'Display name cannot be empty');
      return;
    }

    if (displayName.trim() === user.displayName) {
      showError('No Changes', 'Display name is already set to this value');
      return;
    }

    setIsUpdatingName(true);
    
    try {
      await updateDisplayName(user, displayName.trim());
      showSuccess('Profile Updated', 'Your display name has been updated successfully');
    } catch (error) {
      console.error('Error updating display name:', error);
      showError('Update Failed', error instanceof Error ? error.message : 'Failed to update display name');
      // Reset to original value on error
      setDisplayName(user.displayName || '');
    } finally {
      setIsUpdatingName(false);
    }
  };

  // Handle profile picture upload
  const handleImageUpload = async (file: File) => {
    if (!user) {
      showError('Authentication Error', 'Please log in to update your profile picture');
      return;
    }



    // Validate file
    const validationError = validateProfileImage(file);
    if (validationError) {
      showError('Invalid File', validationError);
      return;
    }

    setIsUploadingImage(true);
    setUploadProgress(0);

    try {
      await updateProfilePicture(user, file, (progress) => {
        setUploadProgress(progress.progress);
        if (progress.error) {
          showError('Upload Failed', progress.error);
        }
      });

      showSuccess('Profile Picture Updated', 'Your profile picture has been updated successfully');
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      showError('Upload Failed', error instanceof Error ? error.message : 'Failed to upload profile picture');
    } finally {
      setIsUploadingImage(false);
      setUploadProgress(0);
    }
  };

  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle drag and drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-black">
      <UnifiedNavbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-purple-400 hover:text-purple-300 mb-4 flex items-center transition-colors duration-200"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-white">My Profile</h1>
          <p className="text-gray-400 mt-2">Manage your account settings and profile information</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Picture Section */}
          <div className="lg:col-span-1">
            <div className="bg-neutral-800 rounded-xl p-6 border border-gray-700">
              <h2 className="text-xl font-semibold text-white mb-4">Profile Picture</h2>
              
              {/* Current Profile Picture */}
              <div className="flex flex-col items-center">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-gray-600 mb-4">
                  {user.photoURL ? (
                    <>
                      <img
                        src={user.photoURL}
                        alt="Profile"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Fallback to gradient avatar if image fails to load
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const fallback = target.nextElementSibling as HTMLElement;
                          if (fallback) {
                            fallback.style.display = 'flex';
                          }
                        }}
                      />
                      <div
                        className={`w-full h-full bg-gradient-to-r ${
                          userData?.role === 'admin' ? 'from-red-500 to-orange-500' :
                          userData?.role === 'host' ? 'from-green-500 to-emerald-500' :
                          'from-purple-500 to-blue-500'
                        } items-center justify-center`}
                        style={{ display: 'none' }}
                      >
                        <span className="text-white text-3xl font-medium">
                          {(user?.displayName || user?.email?.split('@')[0] || 'U')[0].toUpperCase()}
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className={`w-full h-full bg-gradient-to-r ${
                      userData?.role === 'admin' ? 'from-red-500 to-orange-500' :
                      userData?.role === 'host' ? 'from-green-500 to-emerald-500' :
                      'from-purple-500 to-blue-500'
                    } flex items-center justify-center`}>
                      <span className="text-white text-3xl font-medium">
                        {(user?.displayName || user?.email?.split('@')[0] || 'U')[0].toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>

                {/* Upload Area */}
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  className="w-full border-2 border-dashed border-gray-600 rounded-lg p-6 text-center hover:border-purple-500 transition-colors duration-200 cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {isUploadingImage ? (
                    <div className="space-y-2">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto"></div>
                      <p className="text-sm text-gray-400">Uploading... {uploadProgress}%</p>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        ></div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <svg className="w-8 h-8 text-gray-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <p className="text-sm text-gray-400">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">
                        JPG or PNG (max 2MB)
                      </p>
                    </div>
                  )}
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            </div>
          </div>

          {/* Profile Information Section */}
          <div className="lg:col-span-2">
            <div className="bg-neutral-800 rounded-xl p-6 border border-gray-700">
              <h2 className="text-xl font-semibold text-white mb-6">Profile Information</h2>
              
              <form onSubmit={handleNameUpdate} className="space-y-6">
                {/* Display Name */}
                <div>
                  <label htmlFor="displayName" className="block text-sm font-medium text-gray-300 mb-2">
                    Display Name
                  </label>
                  <div className="flex space-x-3">
                    <input
                      type="text"
                      id="displayName"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="flex-1 bg-neutral-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Enter your display name"
                      maxLength={50}
                      disabled={isUpdatingName}
                    />
                    <button
                      type="submit"
                      disabled={isUpdatingName || !displayName.trim() || displayName.trim() === user.displayName}
                      className="px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors duration-200"
                    >
                      {isUpdatingName ? 'Updating...' : 'Update'}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    This is how your name will appear to other users
                  </p>
                </div>

                {/* Email (Read-only) */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={user.email || ''}
                    readOnly
                    className="w-full bg-neutral-700 border border-gray-600 rounded-lg px-4 py-2 text-gray-400 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Email address cannot be changed
                  </p>
                </div>

                {/* Account Role (Read-only) */}
                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-gray-300 mb-2">
                    Account Role
                  </label>
                  <input
                    type="text"
                    id="role"
                    value={userData?.role?.toUpperCase() || 'USER'}
                    readOnly
                    className="w-full bg-neutral-700 border border-gray-600 rounded-lg px-4 py-2 text-gray-400 cursor-not-allowed capitalize"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Contact support to change your account role
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
    </div>
  );
};

export default Profile;
