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
import CreateEvent from './pages/CreateEvent';
import RequestHost from './pages/RequestHost';
import Footer from './components/ui/Footer';

const App: React.FC = () => {
  const location = useLocation();



  return (
    <AuthProvider>
      <div className="min-h-screen bg-black">
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

        {/* Create Event - only for hosts */}
        <Route path="/create-event" element={
          <ProtectedRoute>
            <CreateEvent />
          </ProtectedRoute>
        } />

        {/* Request Host - only for users */}
        <Route path="/request-host" element={
          <ProtectedRoute>
            <RequestHost />
          </ProtectedRoute>
        } />
      </Routes>

        {/* Footer on all pages */}
        <Footer />
      </div>
    </AuthProvider>
  );
};

export default App;