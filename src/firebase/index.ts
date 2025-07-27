import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Firebase configuration with fallback values for production
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyALIVaf8gwwzKOkCfEUBlMxgeDBW8sUicU",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "tickzy-e986b.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "tickzy-e986b",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "tickzy-e986b.firebasestorage.app",
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

export { auth, db, storage, provider };
