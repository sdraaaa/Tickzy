import React, { useState, useRef, useCallback } from 'react';
import { Upload, X, Image as ImageIcon, AlertCircle, CheckCircle } from 'lucide-react';
import { 
  uploadEventBanner, 
  validateImageFile, 
  createFilePreviewURL, 
  revokeFilePreviewURL, 
  formatFileSize,
  UploadProgress 
} from '@/services/storageService';

interface ImageUploadFieldProps {
  value?: string; // Current image URL
  onChange: (url: string) => void;
  onError?: (error: string) => void;
  eventId?: string; // For generating unique storage path
  label?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

const ImageUploadField: React.FC<ImageUploadFieldProps> = ({
  value,
  onChange,
  onError,
  eventId,
  label = 'Event Banner Image',
  required = false,
  disabled = false,
  className = ''
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounterRef = useRef(0);

  // Handle file selection
  const handleFileSelect = useCallback(async (file: File) => {
    setError(null);
    
    // Validate file
    const validation = validateImageFile(file);
    if (!validation.valid) {
      const errorMsg = validation.error || 'Invalid file';
      setError(errorMsg);
      if (onError) onError(errorMsg);
      return;
    }

    // Create preview
    const preview = createFilePreviewURL(file);
    setPreviewUrl(preview);
    setSelectedFile(file);
    
    // Start upload if eventId is provided
    if (eventId) {
      await uploadFile(file);
    }
  }, [eventId, onError]);

  // Upload file to Firebase Storage
  const uploadFile = async (file: File) => {
    if (!eventId) {
      setError('Event ID is required for upload');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const result = await uploadEventBanner(
        file,
        eventId,
        (progress) => {
          setUploadProgress(progress);
        }
      );

      // Upload successful
      onChange(result.downloadURL);
      setIsUploading(false);
      setUploadProgress(null);
      
      // Clean up preview URL since we now have the uploaded URL
      if (previewUrl) {
        revokeFilePreviewURL(previewUrl);
        setPreviewUrl(null);
      }
      
    } catch (error: any) {
      console.error('Upload error:', error);
      const errorMsg = error.message || 'Upload failed';
      setError(errorMsg);
      if (onError) onError(errorMsg);
      setIsUploading(false);
      setUploadProgress(null);
    }
  };

  // Handle drag events
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current++;
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current--;
    if (dragCounterRef.current === 0) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dragCounterRef.current = 0;

    if (disabled) return;

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [disabled, handleFileSelect]);

  // Handle file input change
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  // Handle click to browse
  const handleBrowseClick = useCallback(() => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, [disabled]);

  // Remove selected image
  const handleRemove = useCallback(() => {
    if (previewUrl) {
      revokeFilePreviewURL(previewUrl);
      setPreviewUrl(null);
    }
    setSelectedFile(null);
    setError(null);
    onChange('');
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [previewUrl, onChange]);

  // Get display image URL (uploaded or preview)
  const displayImageUrl = value || previewUrl;

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Label */}
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {/* Upload Area */}
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-6 text-center transition-colors
          ${isDragging 
            ? 'border-primary-500 bg-primary-50' 
            : 'border-gray-300 hover:border-gray-400'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          ${error ? 'border-red-300 bg-red-50' : ''}
        `}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleBrowseClick}
      >
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
          onChange={handleInputChange}
          className="hidden"
          disabled={disabled}
        />

        {/* Upload content */}
        {!displayImageUrl && !isUploading && (
          <div className="space-y-2">
            <Upload className="w-12 h-12 text-gray-400 mx-auto" />
            <div>
              <p className="text-sm text-gray-600">
                <span className="font-medium text-primary-600">Click to browse</span> or drag and drop
              </p>
              <p className="text-xs text-gray-500 mt-1">
                JPG, JPEG, PNG, WebP up to 5MB
              </p>
            </div>
          </div>
        )}

        {/* Upload progress */}
        {isUploading && uploadProgress && (
          <div className="space-y-3">
            <Upload className="w-12 h-12 text-primary-500 mx-auto animate-pulse" />
            <div>
              <p className="text-sm text-gray-600 mb-2">Uploading...</p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress.progress}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {uploadProgress.progress}% ({formatFileSize(uploadProgress.bytesTransferred)} / {formatFileSize(uploadProgress.totalBytes)})
              </p>
            </div>
          </div>
        )}

        {/* Image preview */}
        {displayImageUrl && !isUploading && (
          <div className="relative">
            <img
              src={displayImageUrl}
              alt="Event banner preview"
              className="max-w-full max-h-48 mx-auto rounded-lg shadow-sm"
              style={{ maxWidth: '300px' }}
            />
            
            {/* Remove button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleRemove();
              }}
              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
              disabled={disabled}
            >
              <X className="w-4 h-4" />
            </button>

            {/* Success indicator */}
            {value && !previewUrl && (
              <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center">
                <CheckCircle className="w-4 h-4" />
              </div>
            )}
          </div>
        )}
      </div>

      {/* File info */}
      {selectedFile && !value && (
        <div className="text-xs text-gray-500 flex items-center space-x-2">
          <ImageIcon className="w-4 h-4" />
          <span>{selectedFile.name}</span>
          <span>({formatFileSize(selectedFile.size)})</span>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="flex items-center space-x-2 text-sm text-red-600">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {/* Help text */}
      {!error && (
        <p className="text-xs text-gray-500">
          Upload a high-quality image that represents your event. This will be displayed as the main banner.
        </p>
      )}
    </div>
  );
};

export default ImageUploadField;
