/**
 * PDFUpload Component
 * 
 * Reusable component for uploading PDF files to Firebase Storage
 * Features: drag & drop, validation, progress tracking, error handling
 */

import React, { useState, useRef } from 'react';
import { uploadPDF, validatePDFFile, formatFileSize, UploadProgress } from '../../services/storage';

interface PDFUploadProps {
  label: string;
  onUploadComplete: (downloadURL: string) => void;
  onUploadError?: (error: string) => void;
  storagePath: string;
  required?: boolean;
  disabled?: boolean;
}

const PDFUpload: React.FC<PDFUploadProps> = ({
  label,
  onUploadComplete,
  onUploadError,
  storagePath,
  required = false,
  disabled = false
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({
    progress: 0,
    isUploading: false,
    error: null,
    downloadURL: null
  });
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    // Validate file
    const validation = validatePDFFile(file);
    if (!validation.isValid) {
      setUploadProgress(prev => ({
        ...prev,
        error: validation.error || 'Invalid file'
      }));
      onUploadError?.(validation.error || 'Invalid file');
      return;
    }

    setSelectedFile(file);
    setUploadProgress({
      progress: 0,
      isUploading: false,
      error: null,
      downloadURL: null
    });

    // Start upload immediately
    handleUpload(file);
  };

  const handleUpload = async (file: File) => {
    try {
      const downloadURL = await uploadPDF(file, storagePath, setUploadProgress);
      onUploadComplete(downloadURL);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      onUploadError?.(errorMessage);
    }
  };

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);

    const files = event.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleClick = () => {
    if (!disabled && !uploadProgress.isUploading) {
      fileInputRef.current?.click();
    }
  };

  const handleRemove = () => {
    setSelectedFile(null);
    setUploadProgress({
      progress: 0,
      isUploading: false,
      error: null,
      downloadURL: null
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      {/* Label */}
      <label className="block text-sm font-medium text-white">
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>

      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200 cursor-pointer ${
          isDragOver
            ? 'border-purple-400 bg-purple-900/20'
            : uploadProgress.error
            ? 'border-red-400 bg-red-900/20'
            : uploadProgress.downloadURL
            ? 'border-green-400 bg-green-900/20'
            : 'border-gray-600 bg-neutral-800 hover:border-purple-500 hover:bg-purple-900/10'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf"
          onChange={handleFileInputChange}
          className="hidden"
          disabled={disabled || uploadProgress.isUploading}
        />

        {uploadProgress.isUploading ? (
          // Uploading State
          <div className="space-y-3">
            <div className="w-12 h-12 bg-purple-600/20 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-6 h-6 text-purple-400 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
            </div>
            <div>
              <p className="text-white font-medium">Uploading...</p>
              <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                <div 
                  className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress.progress}%` }}
                ></div>
              </div>
              <p className="text-gray-400 text-sm mt-1">{uploadProgress.progress}%</p>
            </div>
          </div>
        ) : uploadProgress.downloadURL ? (
          // Success State
          <div className="space-y-3">
            <div className="w-12 h-12 bg-green-600/20 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-green-400 font-medium">Upload Complete!</p>
              {selectedFile && (
                <div className="text-gray-300 text-sm mt-1">
                  <p>{selectedFile.name}</p>
                  <p>{formatFileSize(selectedFile.size)}</p>
                </div>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove();
                }}
                className="text-red-400 hover:text-red-300 text-sm mt-2 underline"
              >
                Remove file
              </button>
            </div>
          </div>
        ) : (
          // Default State
          <div className="space-y-3">
            <div className="w-12 h-12 bg-gray-600/20 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <div>
              <p className="text-white font-medium">
                {isDragOver ? 'Drop PDF file here' : 'Upload PDF file'}
              </p>
              <p className="text-gray-400 text-sm">
                Drag & drop or click to browse • PDF only • Max 10MB
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {uploadProgress.error && (
        <div className="flex items-center space-x-2 text-red-400 text-sm">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{uploadProgress.error}</span>
        </div>
      )}
    </div>
  );
};

export default PDFUpload;
