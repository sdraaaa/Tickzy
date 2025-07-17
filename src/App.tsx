import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { getDomainInfo } from './utils/environmentHelper';
import Layout from './components/Layout/Layout';
import LandingPage from './pages/LandingPage';
import DashboardRedirect from './pages/DashboardRedirect';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';
import EventDetails from './pages/EventDetails';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import HostDashboard from './pages/HostDashboard';
import CreateEvent from './pages/CreateEvent';
import BookingConfirmation from './pages/BookingConfirmation';
import ProtectedRoute from './components/Auth/ProtectedRoute';


function App() {
  // Get the base path for routing based on deployment environment
  const { basePath } = getDomainInfo();

  return (
    <AuthProvider>
      <Router
        basename={basePath === '/' ? undefined : basePath.slice(0, -1)} // Remove trailing slash for basename
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <div className="min-h-screen bg-gray-50">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Dashboard Redirect */}
            <Route path="/dashboard" element={<DashboardRedirect />} />

            {/* Admin Route (standalone) */}
            <Route path="/admin" element={<AdminDashboard />} />

            {/* Profile Route (accessible to all authenticated users) */}
            <Route path="/profile" element={<Profile />} />

            {/* Event Details Route (PUBLIC - no authentication required) */}
            <Route path="/event/:id" element={<EventDetails />} />

            {/* Booking Confirmation Route (PROTECTED - authentication required) */}
            <Route path="/booking/confirmation" element={
              <ProtectedRoute>
                <BookingConfirmation />
              </ProtectedRoute>
            } />

            {/* Protected Routes with Layout */}
            <Route element={<Layout />}>
              <Route path="/user-dashboard" element={<UserDashboard />} />
              <Route path="/host-dashboard" element={<HostDashboard />} />
              <Route path="/host/create" element={<CreateEvent />} />
            </Route>
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;