import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import './index.css';

// Filter out COOP warnings from console (they're non-critical browser warnings)
const originalError = console.error;
console.error = (...args) => {
  const message = args.join(' ');
  if (message.includes('Cross-Origin-Opener-Policy') ||
      message.includes('COOP') ||
      message.includes('cross-origin-opener-policy')) {
    // Silently ignore COOP warnings - they don't break functionality
    return;
  }
  originalError.apply(console, args);
};

// Determine the basename for routing
const getBasename = () => {
  // Check if we're on GitHub Pages
  if (window.location.hostname === 'sdraaaa.github.io') {
    return '/Tickzy';
  }
  // Default for local development and other deployments
  return '';
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter
      basename={getBasename()}
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <App />
    </BrowserRouter>
  </StrictMode>
);
