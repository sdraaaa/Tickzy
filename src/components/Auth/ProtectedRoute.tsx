import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
  requireAuth?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  redirectTo = '/login',
  requireAuth = true 
}) => {
  const { currentUser, loading } = useAuth();
  const location = useLocation();

  // Show loading spinner while authentication state is being determined
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  // If authentication is required and user is not authenticated
  if (requireAuth && !currentUser) {
    // Store the current location for redirect after login
    sessionStorage.setItem('returnUrl', location.pathname + location.search);
    
    // Add booking intent if this is a booking-related route
    if (location.pathname.includes('/booking')) {
      sessionStorage.setItem('bookingIntent', 'true');
    }

    // Redirect to login with appropriate message
    const message = location.pathname.includes('/booking') 
      ? 'Please log in to access booking confirmation'
      : 'Please log in to access this page';
    
    return <Navigate to={`${redirectTo}?message=${encodeURIComponent(message)}`} replace />;
  }

  // If authentication is not required but user is authenticated, 
  // or if authentication is required and user is authenticated
  return <>{children}</>;
};

export default ProtectedRoute;
