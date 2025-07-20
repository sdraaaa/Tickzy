/**
 * Firestore Index Management Service
 * 
 * This service handles automatic detection of missing Firestore indexes
 * and provides guidance for creating them programmatically.
 */

import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '@/firebase';

export interface IndexRequirement {
  collection: string;
  fields: Array<{
    field: string;
    direction: 'asc' | 'desc';
  }>;
  description: string;
  errorPattern: string;
}

export interface IndexStatus {
  required: IndexRequirement[];
  missing: IndexRequirement[];
  available: IndexRequirement[];
}

// Define all required indexes for the application
const REQUIRED_INDEXES: IndexRequirement[] = [
  {
    collection: 'events',
    fields: [
      { field: 'status', direction: 'asc' },
      { field: 'createdAt', direction: 'desc' }
    ],
    description: 'Events filtered by status and ordered by creation date',
    errorPattern: 'status.*createdAt'
  },
  {
    collection: 'events',
    fields: [
      { field: 'status', direction: 'asc' },
      { field: 'category', direction: 'asc' },
      { field: 'createdAt', direction: 'desc' }
    ],
    description: 'Events filtered by status and category, ordered by creation date',
    errorPattern: 'status.*category.*createdAt'
  },
  {
    collection: 'events',
    fields: [
      { field: 'createdBy', direction: 'asc' },
      { field: 'createdAt', direction: 'desc' }
    ],
    description: 'Events filtered by creator and ordered by creation date',
    errorPattern: 'createdBy.*createdAt'
  },
  {
    collection: 'events',
    fields: [
      { field: 'rating', direction: 'desc' },
      { field: 'createdAt', direction: 'desc' }
    ],
    description: 'Events ordered by rating and creation date (for popular events)',
    errorPattern: 'rating.*createdAt'
  }
];

/**
 * Test if a specific index is available by running a small query
 */
async function testIndexAvailability(indexReq: IndexRequirement): Promise<boolean> {
  try {
    const collectionRef = collection(db, indexReq.collection);
    
    // Build a test query based on the index requirements
    let testQuery = query(collectionRef);
    
    // Add where clauses for non-sort fields
    indexReq.fields.forEach(fieldReq => {
      if (fieldReq.field === 'status') {
        testQuery = query(testQuery, where('status', '==', 'approved'));
      } else if (fieldReq.field === 'category') {
        testQuery = query(testQuery, where('category', '==', 'music'));
      } else if (fieldReq.field === 'createdBy') {
        testQuery = query(testQuery, where('createdBy', '==', 'test-user'));
      } else if (fieldReq.field === 'rating') {
        testQuery = query(testQuery, where('rating', '>=', 4.0));
      }
    });
    
    // Add orderBy clauses
    indexReq.fields.forEach(fieldReq => {
      if (fieldReq.field !== 'status' && fieldReq.field !== 'category' && fieldReq.field !== 'createdBy' && fieldReq.field !== 'rating') {
        testQuery = query(testQuery, orderBy(fieldReq.field, fieldReq.direction === 'desc' ? 'desc' : 'asc'));
      } else if (fieldReq.direction === 'desc' || fieldReq.direction === 'asc') {
        testQuery = query(testQuery, orderBy(fieldReq.field, fieldReq.direction === 'desc' ? 'desc' : 'asc'));
      }
    });
    
    // Add limit to make query efficient
    testQuery = query(testQuery, limit(1));
    
    // Execute the query
    await getDocs(testQuery);
    return true;
    
  } catch (error: any) {
    // Check if error is related to missing index
    if (error?.code === 'failed-precondition' && error?.message?.includes('index')) {
      return false;
    }
    
    // Other errors might not be index-related
    console.warn(`Index test for ${indexReq.description} failed with non-index error:`, error);
    return true; // Assume index is available if error is not index-related
  }
}

/**
 * Check the status of all required indexes
 */
export async function checkIndexStatus(): Promise<IndexStatus> {
  const status: IndexStatus = {
    required: REQUIRED_INDEXES,
    missing: [],
    available: []
  };
  
  console.log('🔍 Checking Firestore index status...');
  
  for (const indexReq of REQUIRED_INDEXES) {
    try {
      const isAvailable = await testIndexAvailability(indexReq);
      
      if (isAvailable) {
        status.available.push(indexReq);
        console.log(`✅ Index available: ${indexReq.description}`);
      } else {
        status.missing.push(indexReq);
        console.log(`❌ Index missing: ${indexReq.description}`);
      }
    } catch (error) {
      console.error(`Error testing index: ${indexReq.description}`, error);
      status.missing.push(indexReq);
    }
  }
  
  return status;
}

/**
 * Generate deployment instructions for missing indexes
 */
export function generateDeploymentInstructions(missingIndexes: IndexRequirement[]): string {
  if (missingIndexes.length === 0) {
    return '✅ All required Firestore indexes are available!';
  }
  
  const instructions = [
    '🔥 FIRESTORE INDEXES REQUIRED',
    '',
    `❌ Missing ${missingIndexes.length} required index(es):`,
    ...missingIndexes.map(idx => `   • ${idx.description}`),
    '',
    '🚀 AUTOMATED DEPLOYMENT OPTIONS:',
    '',
    '1. Using npm script (recommended):',
    '   npm run deploy:firestore',
    '',
    '2. Using Firebase CLI directly:',
    '   npm run deploy:firestore:indexes',
    '',
    '3. Manual setup:',
    '   npm run firebase:login',
    '   npm run deploy:firestore:all',
    '',
    '📋 PREREQUISITES:',
    '• Firebase CLI installed: npm install -g firebase-tools',
    '• Firebase authentication: npm run firebase:login',
    '',
    '⏳ After deployment, indexes take 2-5 minutes to build.',
    '🔗 Monitor progress: https://console.firebase.google.com/project/tickzy-e986b/firestore/indexes'
  ];
  
  return instructions.join('\n');
}

/**
 * Initialize index checking and provide user guidance
 */
export async function initializeIndexManagement(): Promise<void> {
  try {
    const status = await checkIndexStatus();
    
    if (status.missing.length > 0) {
      const instructions = generateDeploymentInstructions(status.missing);
      console.log(instructions);
      
      // Store instructions in sessionStorage for UI display
      sessionStorage.setItem('firestore-index-instructions', instructions);
      sessionStorage.setItem('firestore-indexes-missing', 'true');
    } else {
      console.log('✅ All Firestore indexes are available!');
      sessionStorage.removeItem('firestore-index-instructions');
      sessionStorage.removeItem('firestore-indexes-missing');
    }
  } catch (error) {
    console.error('Error during index management initialization:', error);
  }
}

/**
 * Get stored deployment instructions from session storage
 */
export function getStoredInstructions(): string | null {
  return sessionStorage.getItem('firestore-index-instructions');
}

/**
 * Check if indexes are missing based on stored state
 */
export function areIndexesMissing(): boolean {
  return sessionStorage.getItem('firestore-indexes-missing') === 'true';
}
