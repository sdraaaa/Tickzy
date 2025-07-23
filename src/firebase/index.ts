import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

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
let provider;

try {
  // Log configuration for debugging (without sensitive data)
  console.log('Initializing Firebase with project:', firebaseConfig.projectId);

  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);

  // Configure Google Auth Provider to avoid CORS issues
  provider = new GoogleAuthProvider();
  provider.setCustomParameters({
    prompt: 'select_account'
  });

  console.log('Firebase initialized successfully');
} catch (error) {
  console.error('Firebase initialization error:', error);

  // Create mock implementations for development/fallback
  auth = null;
  db = null;
  provider = null;
}

export { auth, db, provider };
