/**
 * App Component
 *
 * Main routing setup for Tickzy platform
 */

import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      {/* Future routes will be added here */}
    </Routes>
  );
};

export default App;