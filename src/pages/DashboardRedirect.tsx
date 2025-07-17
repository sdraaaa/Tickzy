import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { verifyUserRole } from '@/utils/roleProtection';

const DashboardRedirect: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, userData, loading } = useAuth();
  const [redirectTimeout, setRedirectTimeout] = React.useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Clear any existing timeout
    if (redirectTimeout) {
      clearTimeout(redirectTimeout);
    }

    if (!loading) {
      if (currentUser && userData) {
        // User is authenticated, redirect based on role
        console.log(`🔄 Redirecting user ${currentUser.email} with role: ${userData.role}`);

        // Verify role integrity for debugging
        if (process.env.NODE_ENV === 'development') {
          verifyUserRole(currentUser.uid, userData.role);
        }

        switch (userData.role) {
          case "admin":
            console.log(`✅ Redirecting admin user to /admin`);
            navigate("/admin", { replace: true });
            break;
          case "host":
            console.log(`✅ Redirecting host user to /host-dashboard`);
            navigate("/host-dashboard", { replace: true });
            break;
          case "user":
          default:
            console.log(`✅ Redirecting user to /user-dashboard`);
            navigate("/user-dashboard", { replace: true });
            break;
        }
      } else if (currentUser && !userData) {
        // User is authenticated but userData is not loaded yet, wait a bit more
        const timeout = setTimeout(() => {
          navigate("/user-dashboard", { replace: true });
        }, 5000); // 5 second timeout
        setRedirectTimeout(timeout);
      } else {
        // User is not authenticated, redirect to login
        navigate("/login", { replace: true });
      }
    }

    return () => {
      if (redirectTimeout) {
        clearTimeout(redirectTimeout);
      }
    };
  }, [currentUser, userData, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting to your dashboard...</p>
        </div>
      </div>
    );
  }



  return null;
};

export default DashboardRedirect;
