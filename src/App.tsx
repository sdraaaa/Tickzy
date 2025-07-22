/**
 * App Component
 *
 * Main routing setup for Tickzy platform with authentication
 * Includes route guards to prevent authenticated users from accessing public pages
 */

import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';
import AuthRedirect from './routes/AuthRedirect';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import ExploreEvents from './pages/ExploreEvents';
import Dashboard from './components/Dashboard';

const App: React.FC = () => {
  return (
    <AuthProvider>
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
    </AuthProvider>
  );
};

export default App;