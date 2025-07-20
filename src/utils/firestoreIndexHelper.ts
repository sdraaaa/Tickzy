/**
 * Firestore Index Helper
 * 
 * This utility helps create the required Firestore indexes for the Tickzy application.
 */

export interface RequiredIndex {
  collection: string;
  fields: Array<{
    field: string;
    order: 'asc' | 'desc';
  }>;
  description: string;
  createUrl: string;
}

export const REQUIRED_INDEXES: RequiredIndex[] = [
  {
    collection: 'events',
    fields: [
      { field: 'status', order: 'asc' },
      { field: 'createdAt', order: 'desc' }
    ],
    description: 'Events by status and creation date (for approved events listing)',
    createUrl: 'https://console.firebase.google.com/v1/r/project/tickzy-e986b/firestore/indexes/?create_composite=Cl9wcm9qZWN0cy90aWNremUtZTk4NmIvZGF0YWJhc2VzLyhkZWZhdWx0KS9jb2xsZWN0aW9uR3JvdXBzL2V2ZW50cy9pbmRleGVzL18QARoKCgZzdGF0dXMQARoNCgljcmVhdGVkQXQQAhoMCghfX25hbWVfXxAC'
  },
  {
    collection: 'events',
    fields: [
      { field: 'status', order: 'asc' },
      { field: 'category', order: 'asc' },
      { field: 'createdAt', order: 'desc' }
    ],
    description: 'Events by status, category, and creation date (for filtered listings)',
    createUrl: 'https://console.firebase.google.com/v1/r/project/tickzy-e986b/firestore/indexes/?create_composite=ClJwcm9qZWN0cy90aWNremUtZTk4NmIvZGF0YWJhc2VzLyhkZWZhdWx0KS9jb2xsZWN0aW9uR3JvdXBzL2V2ZW50cy9pbmRleGVzL18QARoKCgZzdGF0dXMQARoMCghjYXRlZ29yeRABGg0KCWNyZWF0ZWRBdBAC'
  },
  {
    collection: 'events',
    fields: [
      { field: 'createdBy', order: 'asc' },
      { field: 'createdAt', order: 'desc' }
    ],
    description: 'Events by creator and creation date (for host dashboard)',
    createUrl: 'https://console.firebase.google.com/v1/r/project/tickzy-e986b/firestore/indexes/?create_composite=ClNwcm9qZWN0cy90aWNremUtZTk4NmIvZGF0YWJhc2VzLyhkZWZhdWx0KS9jb2xsZWN0aW9uR3JvdXBzL2V2ZW50cy9pbmRleGVzL18QARoNCgljcmVhdGVkQnkQARoNCgljcmVhdGVkQXQQAg=='
  },
  {
    collection: 'events',
    fields: [
      { field: 'status', order: 'asc' },
      { field: 'rating', order: 'desc' },
      { field: 'createdAt', order: 'desc' }
    ],
    description: 'Events by status, rating, and creation date (for popular events)',
    createUrl: 'https://console.firebase.google.com/v1/r/project/tickzy-e986b/firestore/indexes/?create_composite=ClFwcm9qZWN0cy90aWNremUtZTk4NmIvZGF0YWJhc2VzLyhkZWZhdWx0KS9jb2xsZWN0aW9uR3JvdXBzL2V2ZW50cy9pbmRleGVzL18QARoKCgZzdGF0dXMQARoKCgZyYXRpbmcQAhoNCgljcmVhdGVkQXQQAg=='
  }
];

/**
 * Check if a Firestore error is related to missing indexes
 */
export const isIndexError = (error: any): boolean => {
  return error?.code === 'failed-precondition' && 
         error?.message?.includes('index');
};

/**
 * Extract index creation URL from Firestore error message
 */
export const extractIndexUrlFromError = (error: any): string | null => {
  if (!isIndexError(error)) return null;
  
  const message = error.message;
  const urlMatch = message.match(/https:\/\/console\.firebase\.google\.com[^\s]+/);
  return urlMatch ? urlMatch[0] : null;
};

/**
 * Log instructions for creating required indexes
 */
export const logIndexInstructions = (error?: any) => {
  console.group('🔥 FIRESTORE INDEXES REQUIRED');
  
  if (error && isIndexError(error)) {
    const url = extractIndexUrlFromError(error);
    if (url) {
      console.error('❌ Missing index detected!');
      console.error('📋 Click this link to create the required index:');
      console.error(url);
      console.error('⏳ After creating the index, refresh the page.');
    }
  }
  
  console.log('📚 All required indexes for Tickzy:');
  REQUIRED_INDEXES.forEach((index, i) => {
    console.log(`\n${i + 1}. ${index.description}`);
    console.log(`   Collection: ${index.collection}`);
    console.log(`   Fields: ${index.fields.map(f => `${f.field} (${f.order})`).join(', ')}`);
    console.log(`   Create: ${index.createUrl}`);
  });
  
  console.log('\n💡 How to create indexes:');
  console.log('1. Click on any of the "Create" links above');
  console.log('2. Sign in to Firebase Console if prompted');
  console.log('3. Click "Create Index" button');
  console.log('4. Wait for index creation to complete (may take a few minutes)');
  console.log('5. Refresh your application');
  
  console.groupEnd();
};

/**
 * Create all required indexes (opens multiple tabs)
 */
export const createAllIndexes = () => {
  console.log('🚀 Opening Firebase Console to create all required indexes...');
  
  REQUIRED_INDEXES.forEach((index, i) => {
    setTimeout(() => {
      window.open(index.createUrl, `_blank_index_${i}`);
    }, i * 1000); // Stagger opening tabs by 1 second
  });
  
  console.log('📋 Please create each index in the opened tabs, then refresh this page.');
};

/**
 * Check if we're likely missing indexes based on common error patterns
 */
export const checkForMissingIndexes = () => {
  console.log('🔍 Checking for missing Firestore indexes...');
  
  // This is a basic check - in a real implementation, you might want to
  // test actual queries to see which ones fail
  const hasIndexIssues = localStorage.getItem('firestore_index_issues') === 'true';
  
  if (hasIndexIssues) {
    logIndexInstructions();
    return true;
  }
  
  return false;
};

/**
 * Mark that we've encountered index issues (for persistence across page loads)
 */
export const markIndexIssues = () => {
  localStorage.setItem('firestore_index_issues', 'true');
};

/**
 * Clear index issues flag (call after indexes are created)
 */
export const clearIndexIssues = () => {
  localStorage.removeItem('firestore_index_issues');
};

// Make functions available in browser console for debugging
if (typeof window !== 'undefined') {
  (window as any).logIndexInstructions = logIndexInstructions;
  (window as any).createAllIndexes = createAllIndexes;
  (window as any).checkForMissingIndexes = checkForMissingIndexes;
  (window as any).clearIndexIssues = clearIndexIssues;
  (window as any).REQUIRED_INDEXES = REQUIRED_INDEXES;
}
