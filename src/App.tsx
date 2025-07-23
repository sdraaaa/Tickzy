/**
 * App Component
 *
 * Main routing setup for Tickzy platform with authentication
 * Includes route guards to prevent authenticated users from accessing public pages
 */

import React, { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';
import AuthRedirect from './routes/AuthRedirect';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import ExploreEvents from './pages/ExploreEvents';
import Dashboard from './components/Dashboard';

const App: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    console.log('App mounted, current location:', location.pathname);
    console.log('Window location:', window.location.href);
    console.log('Environment:', {
      hostname: window.location.hostname,
      pathname: window.location.pathname,
      search: window.location.search,
      hash: window.location.hash
    });
  }, [location]);

  return (
    <AuthProvider>
      <div className="min-h-screen bg-black">
        {/* Debug indicator */}
        <div className="fixed top-4 left-4 bg-green-600 text-white px-2 py-1 rounded text-xs z-50">
          App Loaded ✓
        </div>

        <Routes>
        {/* Landing page - redirect authenticated users to dashboard */}
        <Route path="/" element={
          <AuthRedirect>
            <LandingPage />
          </AuthRedirect>
        } />

        {/* Login page - redirect authenticated users to dashboard */}
        <Route path="/login" element={
          <AuthRedirect>
            <Login />
          </AuthRedirect>
        } />

        {/* Explore events - accessible to all users */}
        <Route path="/explore-events" element={<ExploreEvents />} />

        {/* Dashboard - unified route for all authenticated users */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
      </Routes>
      </div>
    </AuthProvider>
  );
};

export default App;