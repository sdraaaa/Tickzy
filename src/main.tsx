import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initializeDomainChecking } from './utils/authDomainHelper';
import { initializeFirestoreMonitoring } from './utils/firestoreMonitor';
import { logEnvironmentInfo } from './utils/environmentHelper';
import './utils/seedData'; // Import seed data for development
import './utils/debugHelpers'; // Import debug helpers for development

// Log environment info for debugging
logEnvironmentInfo();

// Initialize domain checking for Google OAuth compatibility
initializeDomainChecking();

// Initialize Firestore operation monitoring
initializeFirestoreMonitoring();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
