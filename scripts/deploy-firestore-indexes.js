#!/usr/bin/env node

/**
 * Firestore Indexes Deployment Script
 *
 * This script automatically deploys Firestore indexes to Firebase Console
 * ensuring all required composite indexes are created programmatically.
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔥 Starting Firestore indexes deployment...');

// Check if Firebase CLI is installed
function checkFirebaseCLI() {
  try {
    execSync('npx firebase-tools --version', { stdio: 'pipe' });
    console.log('✅ Firebase CLI is available via npx');
    return true;
  } catch (error) {
    console.error('❌ Firebase CLI is not available');
    console.log('📦 Install Firebase CLI with: npm install -g firebase-tools');
    return false;
  }
}

// Check if user is logged in to Firebase
function checkFirebaseAuth() {
  try {
    const result = execSync('npx firebase-tools projects:list', { stdio: 'pipe', encoding: 'utf8' });
    if (result.includes('tickzy-e986b')) {
      console.log('✅ Firebase authentication verified');
      console.log('✅ Project tickzy-e986b found');
      return true;
    } else {
      console.error('❌ Project tickzy-e986b not found in your Firebase projects');
      return false;
    }
  } catch (error) {
    console.error('❌ Firebase authentication failed');
    console.log('🔑 Login with: npx firebase-tools login');
    return false;
  }
}

// Check if firestore.indexes.json exists and is valid
function validateIndexesFile() {
  const indexesPath = path.join(__dirname, '..', 'firestore.indexes.json');
  
  if (!fs.existsSync(indexesPath)) {
    console.error('❌ firestore.indexes.json not found');
    return false;
  }
  
  try {
    const indexesContent = fs.readFileSync(indexesPath, 'utf8');
    const indexes = JSON.parse(indexesContent);
    
    if (!indexes.indexes || !Array.isArray(indexes.indexes)) {
      console.error('❌ Invalid firestore.indexes.json format');
      return false;
    }
    
    console.log(`✅ Found ${indexes.indexes.length} indexes in firestore.indexes.json`);
    
    // Check for required indexes
    const requiredIndexes = [
      { collection: 'events', fields: ['status', 'createdAt'] },
      { collection: 'events', fields: ['createdBy', 'createdAt'] },
      { collection: 'events', fields: ['status', 'category', 'createdAt'] }
    ];
    
    let foundRequired = 0;
    requiredIndexes.forEach(required => {
      const found = indexes.indexes.some(index => {
        if (index.collectionGroup !== required.collection) return false;
        
        const indexFields = index.fields.map(f => f.fieldPath);
        return required.fields.every(field => indexFields.includes(field));
      });
      
      if (found) {
        foundRequired++;
        console.log(`✅ Required index found: ${required.collection} [${required.fields.join(', ')}]`);
      } else {
        console.log(`⚠️ Required index missing: ${required.collection} [${required.fields.join(', ')}]`);
      }
    });
    
    console.log(`📊 Found ${foundRequired}/${requiredIndexes.length} required indexes`);
    return true;
    
  } catch (error) {
    console.error('❌ Error parsing firestore.indexes.json:', error.message);
    return false;
  }
}

// Deploy indexes to Firebase
function deployIndexes() {
  try {
    console.log('🚀 Deploying Firestore indexes...');

    // Deploy only indexes (not rules)
    execSync('npx firebase-tools deploy --only firestore:indexes --project tickzy-e986b', {
      stdio: 'inherit',
      cwd: path.join(__dirname, '..')
    });

    console.log('✅ Firestore indexes deployed successfully!');
    console.log('⏳ Note: Index creation may take a few minutes to complete in Firebase Console');
    console.log('🔗 Check status at: https://console.firebase.google.com/project/tickzy-e986b/firestore/indexes');

    return true;
  } catch (error) {
    console.error('❌ Failed to deploy Firestore indexes:', error.message);
    return false;
  }
}

// Main execution
async function main() {
  try {
    console.log('🔍 Pre-deployment checks...');
    
    // Step 1: Check Firebase CLI
    if (!checkFirebaseCLI()) {
      process.exit(1);
    }
    
    // Step 2: Check Firebase authentication
    if (!checkFirebaseAuth()) {
      process.exit(1);
    }
    
    // Step 3: Validate indexes file
    if (!validateIndexesFile()) {
      process.exit(1);
    }
    
    // Step 4: Deploy indexes
    if (!deployIndexes()) {
      process.exit(1);
    }
    
    console.log('🎉 Firestore indexes deployment completed successfully!');
    console.log('📋 Next steps:');
    console.log('   1. Wait 2-5 minutes for indexes to build in Firebase Console');
    console.log('   2. Refresh your application to test the queries');
    console.log('   3. Check Firebase Console to verify indexes are active');
    
  } catch (error) {
    console.error('❌ Deployment script failed:', error.message);
    process.exit(1);
  }
}

// Run the script
main();
