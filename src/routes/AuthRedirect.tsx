/**
 * AuthRedirect Component
 * 
 * Redirects authenticated users away from public pages (like landing page)
 * to their appropriate dashboard. Prevents logged-in users from seeing
 * the public landing page.
 */

import React, { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface AuthRedirectProps {
  children: ReactNode;
  redirectTo?: string;
}

const AuthRedirect: React.FC<AuthRedirectProps> = ({ 
  children, 
  redirectTo = '/dashboard' 
}) => {
  const { user, loading } = useAuth();

  // Show loading spinner while auth state is being determined
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // If user is authenticated, redirect them to dashboard
  if (user) {
    return <Navigate to={redirectTo} replace />;
  }

  // If user is not authenticated, render the public content
  return <>{children}</>;
};

export default AuthRedirect;
