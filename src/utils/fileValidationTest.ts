/**
 * File Validation Test Utility
 * 
 * This utility helps test the file validation logic with various file types
 * and MIME type scenarios to ensure proper fallback validation works.
 */

import { validateImageFile, validateDocumentFile } from '@/services/storageService';

// Mock File objects for testing
const createMockFile = (name: string, type: string, size: number = 1024): File => {
  const file = new File(['test content'], name, { type });
  Object.defineProperty(file, 'size', { value: size });
  return file;
};

export const testFileValidation = () => {
  console.log('🧪 Starting File Validation Tests...\n');

  // Test Image Files
  console.log('📸 Testing Image File Validation:');
  
  // Valid image files with proper MIME types
  const validJpg = createMockFile('test.jpg', 'image/jpeg', 1024 * 1024); // 1MB
  const validPng = createMockFile('test.png', 'image/png', 2 * 1024 * 1024); // 2MB
  const validWebp = createMockFile('test.webp', 'image/webp', 3 * 1024 * 1024); // 3MB
  
  // Valid image files with missing/incorrect MIME types (fallback test)
  const jpgNoMime = createMockFile('photo.jpg', '', 1024 * 1024);
  const pngCustomMime = createMockFile('image.png', 'application/octet-stream', 1024 * 1024);
  const jpegFallback = createMockFile('camera.jpeg', 'custom file', 2 * 1024 * 1024);
  
  // Invalid image files
  const invalidType = createMockFile('document.txt', 'text/plain', 1024);
  const tooLarge = createMockFile('huge.jpg', 'image/jpeg', 10 * 1024 * 1024); // 10MB
  const wrongExtension = createMockFile('fake.exe', 'image/jpeg', 1024);

  const imageTests = [
    { file: validJpg, expected: true, name: 'Valid JPG with MIME type' },
    { file: validPng, expected: true, name: 'Valid PNG with MIME type' },
    { file: validWebp, expected: true, name: 'Valid WebP with MIME type' },
    { file: jpgNoMime, expected: true, name: 'JPG with missing MIME type (fallback)' },
    { file: pngCustomMime, expected: true, name: 'PNG with incorrect MIME type (fallback)' },
    { file: jpegFallback, expected: true, name: 'JPEG with custom MIME type (fallback)' },
    { file: invalidType, expected: false, name: 'Invalid file type (TXT)' },
    { file: tooLarge, expected: false, name: 'File too large (10MB)' },
    { file: wrongExtension, expected: false, name: 'Wrong extension with valid MIME' }
  ];

  imageTests.forEach(test => {
    const result = validateImageFile(test.file);
    const passed = result.valid === test.expected;
    console.log(`${passed ? '✅' : '❌'} ${test.name}: ${result.valid ? 'VALID' : 'INVALID'}`);
    if (!result.valid) {
      console.log(`   Error: ${result.error}`);
    }
  });

  console.log('\n📄 Testing Document File Validation:');
  
  // Valid document files with proper MIME types
  const validPdf = createMockFile('contract.pdf', 'application/pdf', 2 * 1024 * 1024); // 2MB
  const validDoc = createMockFile('agreement.doc', 'application/msword', 3 * 1024 * 1024); // 3MB
  const validDocx = createMockFile('booking.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 4 * 1024 * 1024); // 4MB
  
  // Valid document files with missing/incorrect MIME types (fallback test)
  const pdfNoMime = createMockFile('venue.pdf', '', 2 * 1024 * 1024);
  const docCustomMime = createMockFile('permit.doc', 'application/octet-stream', 1024 * 1024);
  const docxFallback = createMockFile('license.docx', 'custom file', 3 * 1024 * 1024);
  
  // Invalid document files
  const invalidDocType = createMockFile('image.jpg', 'image/jpeg', 1024);
  const docTooLarge = createMockFile('huge.pdf', 'application/pdf', 15 * 1024 * 1024); // 15MB
  const wrongDocExtension = createMockFile('fake.exe', 'application/pdf', 1024);

  const documentTests = [
    { file: validPdf, expected: true, name: 'Valid PDF with MIME type' },
    { file: validDoc, expected: true, name: 'Valid DOC with MIME type' },
    { file: validDocx, expected: true, name: 'Valid DOCX with MIME type' },
    { file: pdfNoMime, expected: true, name: 'PDF with missing MIME type (fallback)' },
    { file: docCustomMime, expected: true, name: 'DOC with incorrect MIME type (fallback)' },
    { file: docxFallback, expected: true, name: 'DOCX with custom MIME type (fallback)' },
    { file: invalidDocType, expected: false, name: 'Invalid file type (JPG)' },
    { file: docTooLarge, expected: false, name: 'Document too large (15MB)' },
    { file: wrongDocExtension, expected: false, name: 'Wrong extension with valid MIME' }
  ];

  documentTests.forEach(test => {
    const result = validateDocumentFile(test.file);
    const passed = result.valid === test.expected;
    console.log(`${passed ? '✅' : '❌'} ${test.name}: ${result.valid ? 'VALID' : 'INVALID'}`);
    if (!result.valid) {
      console.log(`   Error: ${result.error}`);
    }
  });

  console.log('\n🎯 File Validation Tests Complete!');
};

// Export for use in browser console
(window as any).testFileValidation = testFileValidation;
