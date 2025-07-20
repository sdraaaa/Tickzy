import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { canUserCreateEvents } from '@/services/hostService';
import { AlertCircle, Clock, UserCheck } from 'lucide-react';

interface HostProtectedRouteProps {
  children: React.ReactNode;
}

const HostProtectedRoute: React.FC<HostProtectedRouteProps> = ({ children }) => {
  const { currentUser, userData, loading: authLoading } = useAuth();
  const [canCreate, setCanCreate] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const checkPermissions = async () => {
      if (authLoading) return;

      if (!currentUser) {
        setCanCreate(false);
        setLoading(false);
        return;
      }

      if (!userData) {
        setCanCreate(false);
        setLoading(false);
        return;
      }

      // Check if user is admin (admins can always create events)
      if (userData.role === 'admin') {
        setCanCreate(true);
        setLoading(false);
        return;
      }

      // Check if user is an approved host
      try {
        const canCreateEvents = await canUserCreateEvents(currentUser.uid);
        setCanCreate(canCreateEvents);
      } catch (error) {
        console.error('Error checking host permissions:', error);
        setCanCreate(false);
      } finally {
        setLoading(false);
      }
    };

    checkPermissions();
  }, [currentUser, userData, authLoading]);

  // Show loading state
  if (authLoading || loading) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Checking permissions...</p>
          </div>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Show access denied if user cannot create events
  if (canCreate === false) {
    const getAccessDeniedContent = () => {
      if (!userData) {
        return {
          icon: <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />,
          title: "Access Denied",
          message: "Unable to verify your account permissions.",
          action: null
        };
      }

      if (userData.role === 'user') {
        const hostStatus = (userData as any).hostStatus || 'none';
        
        switch (hostStatus) {
          case 'none':
            return {
              icon: <UserCheck className="w-16 h-16 text-blue-500 mx-auto mb-4" />,
              title: "Host Application Required",
              message: "You need to apply to become a host before you can create events.",
              action: (
                <a
                  href="/user-dashboard"
                  className="btn-primary inline-flex items-center"
                >
                  <UserCheck className="w-4 h-4 mr-2" />
                  Apply to Become Host
                </a>
              )
            };
          case 'pending':
            return {
              icon: <Clock className="w-16 h-16 text-yellow-500 mx-auto mb-4" />,
              title: "Application Under Review",
              message: "Your host application is being reviewed by our admin team. You'll be notified once it's approved.",
              action: (
                <a
                  href="/user-dashboard"
                  className="btn-secondary inline-flex items-center"
                >
                  <Clock className="w-4 h-4 mr-2" />
                  Check Application Status
                </a>
              )
            };
          case 'rejected':
            return {
              icon: <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />,
              title: "Application Rejected",
              message: "Your host application was not approved. Please contact support for more information.",
              action: (
                <a
                  href="/user-dashboard"
                  className="btn-secondary inline-flex items-center"
                >
                  <UserCheck className="w-4 h-4 mr-2" />
                  View Application Details
                </a>
              )
            };
          default:
            return {
              icon: <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />,
              title: "Access Denied",
              message: "You don't have permission to create events.",
              action: null
            };
        }
      }

      return {
        icon: <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />,
        title: "Access Denied",
        message: "You don't have permission to create events.",
        action: null
      };
    };

    const content = getAccessDeniedContent();

    return (
      <div className="px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto py-8">
        <div className="min-h-[500px] flex items-center justify-center">
          <div className="text-center max-w-md">
            {content.icon}
            <h1 className="text-2xl font-bold text-gray-900 mb-4">{content.title}</h1>
            <p className="text-gray-600 mb-8">{content.message}</p>
            {content.action && (
              <div className="space-y-4">
                {content.action}
                <div>
                  <a
                    href="/host-dashboard"
                    className="text-primary-600 hover:text-primary-700 text-sm"
                  >
                    ← Back to Dashboard
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Render children if user has permission
  return <>{children}</>;
};

export default HostProtectedRoute;
