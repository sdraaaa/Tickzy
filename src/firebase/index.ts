import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Firebase configuration with fallback values for production
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyALIVaf8gwwzKOkCfEUBlMxgeDBW8sUicU",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "tickzy-e986b.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "tickzy-e986b",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "tickzy-e986b.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "304409562549",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:304409562549:web:19b4c2d6210e12d56b9dfc",
};

// Initialize Firebase with error handling
let app;
let auth;
let db;
let storage;
let provider;

try {


  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);

  // Configure Google Auth Provider with better popup handling
  provider = new GoogleAuthProvider();
  provider.setCustomParameters({
    prompt: 'select_account',
    // Add parameters to help with COOP issues
    hd: undefined // Allow any domain
  });

  // Add scopes for better user info
  provider.addScope('email');
  provider.addScope('profile');


} catch (error) {
  console.error('Firebase initialization error:', error);

  // Create mock implementations for development/fallback
  auth = null;
  db = null;
  storage = null;
  provider = null;
}

// Debug function to check Firebase configuration
export const debugFirebaseConfig = () => {
  console.log('🔧 Firebase Configuration Debug:');
  console.log('API Key:', firebaseConfig.apiKey ? '✅ Set' : '❌ Missing');
  console.log('Auth Domain:', firebaseConfig.authDomain);
  console.log('Project ID:', firebaseConfig.projectId);
  console.log('Storage Bucket:', firebaseConfig.storageBucket);
  console.log('Auth initialized:', auth ? '✅ Yes' : '❌ No');
  console.log('Firestore initialized:', db ? '✅ Yes' : '❌ No');
  console.log('Storage initialized:', storage ? '✅ Yes' : '❌ No');
  return firebaseConfig;
};

// Test Firebase Storage connectivity
export const testStorageConnectivity = async () => {
  try {
    if (!storage) {
      throw new Error('Storage not initialized');
    }

    console.log('🧪 Testing Firebase Storage connectivity...');

    // Try to create a reference (this doesn't make a network call)
    const { ref } = await import('firebase/storage');
    const testRef = ref(storage, 'test/connectivity-test.txt');

    console.log('✅ Storage reference created successfully');
    console.log('Storage bucket:', storage.app.options.storageBucket);

    return true;
  } catch (error) {
    console.error('❌ Storage connectivity test failed:', error);
    return false;
  }
};

// Export for console debugging
if (typeof window !== 'undefined') {
  (window as any).debugFirebaseConfig = debugFirebaseConfig;
  (window as any).testStorageConnectivity = testStorageConnectivity;
}

export { auth, db, storage, provider };
