import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initializeDomainChecking } from './utils/authDomainHelper';
import { initializeFirestoreMonitoring } from './utils/firestoreMonitor';
import { logEnvironmentInfo } from './utils/environmentHelper';
import { initializeIndexManagement } from './services/firestoreIndexService';
import './utils/seedData'; // Import seed data for development
import './utils/debugHelpers'; // Import debug helpers for development
import './utils/createEventTester'; // Import create event testing utilities
import './utils/eventApprovalTester'; // Import event approval workflow testing utilities
import './utils/firestoreIndexHelper'; // Import Firestore index helper utilities
import './utils/fixHostPermissions'; // Import host permission fix utilities

// Log environment info for debugging
logEnvironmentInfo();

// Initialize domain checking for Google OAuth compatibility
initializeDomainChecking();

// Initialize Firestore operation monitoring
initializeFirestoreMonitoring();

// Initialize Firestore index management
initializeIndexManagement();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
