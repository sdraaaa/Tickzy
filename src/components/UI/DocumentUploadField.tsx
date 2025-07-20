import React, { useState, useRef, useCallback } from 'react';
import { Upload, X, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import {
  uploadVenueDocument,
  validateDocumentFile,
  formatFileSize,
  UploadProgress
} from '@/services/storageService';

interface DocumentUploadFieldProps {
  value?: string; // Current document URL
  onChange: (url: string) => void;
  onError?: (error: string) => void;
  eventId?: string;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

const DocumentUploadField: React.FC<DocumentUploadFieldProps> = ({
  value,
  onChange,
  onError,
  eventId,
  label = 'Venue Booking Document',
  required = false,
  disabled = false,
  className = ''
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounterRef = useRef(0);

  // Handle file selection
  const handleFileSelect = useCallback(async (file: File) => {
    setError(null);
    
    // Validate file
    const validation = validateDocumentFile(file);
    if (!validation.valid) {
      const errorMsg = validation.error || 'Invalid file';
      setError(errorMsg);
      if (onError) onError(errorMsg);
      return;
    }

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
      const result = await uploadVenueDocument(
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

    } catch (error: any) {
      console.error('Upload error:', error);
      const errorMsg = error.message || 'Upload failed';
      setError(errorMsg);
      if (onError) onError(errorMsg);
      setIsUploading(false);
      setUploadProgress(null);
    }
  };

  // Drag handlers
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current++;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
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

  // Remove selected document
  const handleRemove = useCallback(() => {
    setSelectedFile(null);
    setError(null);
    onChange('');
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [onChange]);

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
          accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,.pdf,.doc,.docx"
          onChange={handleInputChange}
          className="hidden"
          disabled={disabled}
        />

        {/* Upload content */}
        {!value && !selectedFile && !isUploading && (
          <div className="space-y-2">
            <FileText className="w-12 h-12 text-gray-400 mx-auto" />
            <div>
              <p className="text-sm text-gray-600">
                <span className="font-medium text-primary-600">Click to browse</span> or drag and drop
              </p>
              <p className="text-xs text-gray-500 mt-1">
                PDF, DOC, DOCX up to 10MB
              </p>
            </div>
          </div>
        )}

        {/* Upload progress */}
        {isUploading && uploadProgress && (
          <div className="space-y-2">
            <div className="w-12 h-12 mx-auto bg-primary-100 rounded-full flex items-center justify-center">
              <Upload className="w-6 h-6 text-primary-600 animate-pulse" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Uploading document...</p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div
                  className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress.progress}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {uploadProgress.progress}% ({formatFileSize(uploadProgress.bytesTransferred)} / {formatFileSize(uploadProgress.totalBytes)})
              </p>
            </div>
          </div>
        )}

        {/* Document preview */}
        {(value || selectedFile) && !isUploading && (
          <div className="relative">
            <div className="flex items-center justify-center space-x-3 p-4 bg-gray-50 rounded-lg">
              <FileText className="w-8 h-8 text-blue-500" />
              <div className="text-left">
                <p className="text-sm font-medium text-gray-900">
                  {selectedFile?.name || 'Venue Booking Document'}
                </p>
                <p className="text-xs text-gray-500">
                  {selectedFile ? `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB` : 'Uploaded'}
                </p>
              </div>
              <CheckCircle className="w-5 h-5 text-green-500" />
            </div>
            
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
          </div>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div className="flex items-center space-x-2 text-red-600">
          <AlertCircle className="w-4 h-4" />
          <span className="text-sm">{error}</span>
        </div>
      )}
    </div>
  );
};

export default DocumentUploadField;
