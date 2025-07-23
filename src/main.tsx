import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import './index.css';

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
