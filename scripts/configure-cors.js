#!/usr/bin/env node

/**
 * Configure CORS for Firebase Storage bucket
 * This script uses the Google Cloud Storage JSON API to set CORS configuration
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const PROJECT_ID = 'tickzy-e986b';
const BUCKET_NAME = `${PROJECT_ID}.appspot.com`;

// CORS configuration
const corsConfig = [
  {
    "origin": [
      "http://localhost:3000",
      "http://localhost:5173", 
      "https://tickzy.netlify.app",
      "https://sdraaaa.github.io"
    ],
    "method": ["GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD"],
    "maxAgeSeconds": 3600,
    "responseHeader": [
      "Content-Type",
      "Authorization", 
      "x-goog-resumable",
      "x-goog-meta-*",
      "x-firebase-gmpid"
    ]
  }
];

console.log('🔧 Configuring CORS for Firebase Storage bucket...');
console.log(`📦 Bucket: ${BUCKET_NAME}`);

try {
  // Write CORS config to temporary file
  const corsFile = path.join(process.cwd(), 'temp-cors.json');
  fs.writeFileSync(corsFile, JSON.stringify(corsConfig, null, 2));
  
  console.log('📝 CORS configuration:');
  console.log(JSON.stringify(corsConfig, null, 2));
  
  // Try to set CORS using gcloud (if available)
  try {
    console.log('🔄 Attempting to set CORS using gcloud...');
    execSync(`gcloud storage buckets update gs://${BUCKET_NAME} --cors-file=${corsFile}`, { 
      stdio: 'inherit' 
    });
    console.log('✅ CORS configuration applied successfully!');
  } catch (gcloudError) {
    console.log('⚠️ gcloud not available, trying gsutil...');
    
    try {
      execSync(`gsutil cors set ${corsFile} gs://${BUCKET_NAME}`, { 
        stdio: 'inherit' 
      });
      console.log('✅ CORS configuration applied successfully with gsutil!');
    } catch (gsutilError) {
      console.log('❌ Neither gcloud nor gsutil available.');
      console.log('');
      console.log('🔧 Manual CORS Configuration Required:');
      console.log('');
      console.log('1. Go to Google Cloud Console: https://console.cloud.google.com/');
      console.log(`2. Select project: ${PROJECT_ID}`);
      console.log('3. Navigate to Storage > Buckets');
      console.log(`4. Click on bucket: ${BUCKET_NAME}`);
      console.log('5. Go to Configuration tab');
      console.log('6. Click "Edit CORS configuration"');
      console.log('7. Paste this configuration:');
      console.log('');
      console.log(JSON.stringify(corsConfig, null, 2));
      console.log('');
      console.log('8. Save the configuration');
    }
  }
  
  // Clean up temp file
  if (fs.existsSync(corsFile)) {
    fs.unlinkSync(corsFile);
  }
  
} catch (error) {
  console.error('❌ Error configuring CORS:', error.message);
  process.exit(1);
}
