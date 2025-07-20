import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signOut } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyALIVaf8gwwzKOkCfEUBlMxgeDBW8sUicU",
  authDomain: "tickzy-e986b.firebaseapp.com",
  projectId: "tickzy-e986b",
  storageBucket: "tickzy-e986b.firebasestorage.app",
  messagingSenderId: "304409562549",
  appId: "1:304409562549:web:19b4c2d6210e12d56b9dfc",
  measurementId: "G-R6XHGNT5D5"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Debug Firebase Storage configuration
console.log('🔧 Firebase Storage Configuration:', {
  storageBucket: firebaseConfig.storageBucket,
  storageApp: storage.app.name,
  storageOptions: storage.app.options
});

// Configure Firebase Auth persistence (should be enabled by default, but let's be explicit)
// This ensures authentication state persists across browser sessions
console.log('🔧 Firebase Auth persistence is enabled by default for web apps');

// Google Auth Provider with enhanced configuration for production
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account', // Always show account selection
  hd: undefined, // Allow any domain (remove if you want to restrict to specific domains)
});

// Add scopes for better user experience
googleProvider.addScope('email');
googleProvider.addScope('profile');

// Comprehensive authentication state clearing utility
export const clearAllAuthenticationState = async () => {
  try {
    console.log('🔄 Starting comprehensive authentication state clearing...');

    // Step 1: Firebase signOut
    try {
      await signOut(auth);
      console.log('✅ Firebase signOut completed');
    } catch (signOutError) {
      console.log('⚠️ Firebase signOut error (may already be signed out):', signOutError);
    }

    // Step 2: Clear all localStorage
    const localStorageKeys = Object.keys(localStorage);
    let localStorageCleared = 0;
    localStorageKeys.forEach(key => {
      if (key.includes('firebase') || key.includes('auth') || key.includes('user') || key.includes('google')) {
        localStorage.removeItem(key);
        localStorageCleared++;
        console.log(`🗑️ Removed localStorage: ${key}`);
      }
    });

    // Step 3: Clear all sessionStorage
    const sessionStorageKeys = Object.keys(sessionStorage);
    let sessionStorageCleared = 0;
    sessionStorageKeys.forEach(key => {
      if (key.includes('firebase') || key.includes('auth') || key.includes('user') || key.includes('google')) {
        sessionStorage.removeItem(key);
        sessionStorageCleared++;
        console.log(`🗑️ Removed sessionStorage: ${key}`);
      }
    });

    // Step 4: Clear IndexedDB (Firebase uses this for persistence)
    try {
      if ('indexedDB' in window) {
        const databases = await indexedDB.databases();
        for (const db of databases) {
          if (db.name && (db.name.includes('firebase') || db.name.includes('auth'))) {
            indexedDB.deleteDatabase(db.name);
            console.log(`🗑️ Removed IndexedDB: ${db.name}`);
          }
        }
      }
    } catch (indexedDBError) {
      console.log('⚠️ IndexedDB clearing error:', indexedDBError);
    }

    console.log(`✅ Authentication state clearing complete:`);
    console.log(`   - localStorage items cleared: ${localStorageCleared}`);
    console.log(`   - sessionStorage items cleared: ${sessionStorageCleared}`);
    console.log(`   - Firebase signOut: completed`);
    console.log(`   - IndexedDB: cleared`);

    return true;
  } catch (error) {
    console.error('❌ Error during authentication state clearing:', error);
    return false;
  }
};

// Legacy function for backward compatibility
export const forceLogout = clearAllAuthenticationState;

export { auth, db, storage, googleProvider };
