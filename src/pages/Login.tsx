import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Calendar, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { signInWithEmailAndPassword, signInWithPopup, signInWithRedirect, getRedirectResult } from 'firebase/auth';
import { auth, googleProvider } from '@/firebase';
import { useAuth } from '@/contexts/AuthContext';

const Login: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isOAuthInProgress, setIsOAuthInProgress] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { currentUser, userData, loading: authLoading } = useAuth();

  // Get return URL and booking intent from session storage or URL params
  const getReturnUrl = () => {
    const returnUrl = sessionStorage.getItem('returnUrl');
    const bookingIntent = sessionStorage.getItem('bookingIntent');

    console.log('🔍 Login getReturnUrl:', {
      returnUrl,
      bookingIntent,
      currentLocation: window.location.href,
      pathname: window.location.pathname
    });

    // Validate returnUrl to ensure it's a relative path
    if (returnUrl && bookingIntent) {
      if (returnUrl.startsWith('/')) {
        return returnUrl;
      } else {
        console.warn('⚠️ Invalid returnUrl detected (not relative path):', returnUrl);
        return '/dashboard';
      }
    }
    return '/dashboard';
  };

  // Get login message from URL params
  const loginMessage = searchParams.get('message');

  // Debug current auth state on component mount
  useEffect(() => {
    console.log('🔍 Login component mounted, current auth state:', {
      currentUser: currentUser ? currentUser.email : 'null',
      userData: userData ? userData.role : 'null',
      authLoading,
      loading
    });
  }, []);

  // Handle Google sign-in redirect result first (this runs once on page load)
  useEffect(() => {
    const handleRedirectResult = async () => {
      console.log('🔍 Login: Checking for Google redirect result...');
      try {
        const result = await getRedirectResult(auth);
        console.log('🔍 Login: getRedirectResult returned:', result ? 'User found' : 'No redirect result');

        if (result) {
          console.log('🔄 Google sign-in redirect successful, user:', result.user.email);
          setIsOAuthInProgress(true); // Prevent other navigation logic from interfering

          // Don't navigate here - let the AuthContext handle user creation and the next useEffect handle navigation
          console.log('🔄 Waiting for AuthContext to process user data...');
        } else {
          console.log('🔍 Login: No Google redirect result found, user came to login normally');
        }
      } catch (error: any) {
        console.error('Google sign-in redirect error:', error);
        setError('Failed to complete Google sign-in. Please try again.');
        setLoading(false);
        setIsOAuthInProgress(false);
      }
    };

    handleRedirectResult();
  }, []); // Run only once on component mount

  // Handle navigation after authentication (including after Google popup/redirect)
  useEffect(() => {
    if (!authLoading && currentUser && userData && !loading) {
      console.log('🔄 Login: User authenticated, determining destination...', {
        user: currentUser.email,
        role: userData.role,
        isOAuthInProgress,
        loading
      });

      // Small delay to ensure all auth processing is complete
      const navigationTimeout = setTimeout(() => {
        // Determine destination based on user role and stored URLs
        let destination = '/dashboard'; // Default fallback

        // Check for stored return URL first
        const storedReturnUrl = sessionStorage.getItem('returnUrl') || sessionStorage.getItem('pendingReturnUrl');
        const bookingIntent = sessionStorage.getItem('bookingIntent');

        if (storedReturnUrl && bookingIntent && storedReturnUrl.startsWith('/')) {
          destination = storedReturnUrl;
        } else {
          // Navigate to role-based dashboard
          switch (userData.role) {
            case 'admin':
              destination = '/admin';
              break;
            case 'host':
              destination = '/host-dashboard';
              break;
            case 'user':
            default:
              destination = '/user-dashboard';
              break;
          }
        }

        console.log('🔄 Login: Navigating to:', destination);

        // Clear all stored URLs
        sessionStorage.removeItem('returnUrl');
        sessionStorage.removeItem('pendingReturnUrl');
        sessionStorage.removeItem('bookingIntent');

        // Reset OAuth progress state
        setIsOAuthInProgress(false);

        // Navigate to destination
        navigate(destination, { replace: true });
      }, 100); // Small delay to ensure state is stable

      return () => clearTimeout(navigationTimeout);
    }
  }, [currentUser, userData, authLoading, loading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await signInWithEmailAndPassword(auth, formData.email, formData.password);
      // Redirect will be handled by the useEffect above after AuthContext processes the user
      console.log('🔄 Email/password sign-in successful, waiting for AuthContext...');
    } catch (error: any) {
      console.error('Email/password sign in error:', error);

      // Provide user-friendly error messages
      let errorMessage = 'Failed to sign in';
      if (error.code === 'auth/invalid-credential') {
        errorMessage = 'Invalid email or password. Please check your credentials and try again.';
      } else if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email address.';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password. Please try again.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed attempts. Please try again later.';
      } else if (error.code === 'auth/user-disabled') {
        errorMessage = 'This account has been disabled.';
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    setIsOAuthInProgress(true);

    try {
      console.log('🔄 Attempting Google sign-in with popup first...');
      const result = await signInWithPopup(auth, googleProvider);
      console.log('✅ Google popup sign-in successful:', result.user.email);
      return;
    } catch (popupError: any) {
      console.log('⚠️ Popup failed, trying redirect method...', popupError.code);

      if (popupError.code === 'auth/popup-blocked' ||
          popupError.code === 'auth/popup-closed-by-user' ||
          popupError.code === 'auth/cancelled-popup-request') {
        try {
          const destination = getReturnUrl();
          console.log('🔄 Storing destination before Google redirect:', destination);
          sessionStorage.setItem('pendingReturnUrl', destination);
          console.log('🔄 Starting Google sign-in redirect...');
          await signInWithRedirect(auth, googleProvider);
          return;
        } catch (redirectError: any) {
          console.error('Both popup and redirect failed:', redirectError);
        }
      }

      console.error('Google sign in error:', popupError);
      let errorMessage = 'Failed to sign in with Google';

      switch (popupError.code) {
        case 'auth/popup-closed-by-user':
          errorMessage = 'Sign-in was cancelled. Please try again.';
          break;
        case 'auth/popup-blocked':
          errorMessage = 'Pop-up was blocked. Please allow pop-ups for this site and try again.';
          break;
        case 'auth/cancelled-popup-request':
          errorMessage = 'Sign-in was cancelled. Please try again.';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Network error. Please check your internet connection and try again.';
          break;
        case 'auth/unauthorized-domain':
          errorMessage = `This domain (${window.location.hostname}) is not authorized for Google sign-in. Please add it to Firebase Console -> Authentication -> Settings -> Authorized domains.`;
          break;
        case 'auth/operation-not-allowed':
          errorMessage = 'Google sign-in is not enabled. Please contact support.';
          break;
        case 'auth/invalid-api-key':
          errorMessage = 'Authentication configuration error. Please contact support.';
          break;
        case 'auth/app-deleted':
          errorMessage = 'Authentication service unavailable. Please contact support.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many sign-in attempts. Please wait a moment and try again.';
          break;
        case 'auth/user-disabled':
          errorMessage = 'Your account has been disabled. Please contact support.';
          break;
        case 'auth/web-storage-unsupported':
          errorMessage = 'Your browser does not support web storage. Please enable cookies and try again.';
          break;
        default:
          console.error('Unhandled Google OAuth error:', {
            code: popupError.code,
            message: popupError.message,
            stack: popupError.stack,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href
          });
          errorMessage = `Authentication failed: ${popupError.message || 'Unknown error'}. Please try again or contact support.`;
      }

      setError(errorMessage);
      setIsOAuthInProgress(false);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2240%22%20height%3D%2240%22%20viewBox%3D%220%200%2040%2040%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22%232643E9%22%20fill-opacity%3D%220.05%22%3E%3Ccircle%20cx%3D%2220%22%20cy%3D%2220%22%20r%3D%2220%22/%3E%3C/g%3E%3C/svg%3E')] opacity-30"></div>
      
      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-2 group">
            <div className="w-12 h-12 bg-primary-500 rounded-2xl flex items-center justify-center group-hover:bg-primary-600 transition-colors duration-300">
              <Calendar className="w-7 h-7 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">Tickzy</span>
          </Link>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-card p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back</h1>
            <p className="text-gray-600">Choose your preferred sign-in method</p>

            {/* Booking Intent Message */}
            {loginMessage && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-xl">
                <p className="text-sm text-blue-700 font-medium">
                  {loginMessage}
                </p>
              </div>
            )}
          </div>

          {/* Google Sign In - Primary Option */}
          <div className="mb-6">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full flex items-center justify-center px-4 py-3 bg-white hover:bg-gray-50 border-2 border-primary-200 hover:border-primary-300 rounded-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
            >
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span className="font-medium">Continue with Google</span>
            </button>
          </div>

          {/* Divider */}
          <div className="my-6 flex items-center">
            <div className="flex-1 border-t border-gray-300"></div>
            <span className="px-4 text-sm text-gray-500 font-medium">or sign in with email</span>
            <div className="flex-1 border-t border-gray-300"></div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full pl-12 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Remember & Forgot */}
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-primary-500 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 focus:ring-2"
                />
                <span className="ml-2 text-sm text-gray-600">Remember me</span>
              </label>
              <Link to="/forgot-password" className="text-sm text-primary-500 hover:text-primary-600 font-medium">
                Forgot password?
              </Link>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary relative"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                  Signing In...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  Sign In
                  <ArrowRight className="w-5 h-5 ml-2" />
                </div>
              )}
            </button>
          </form>

          {/* Sign Up Link */}
          <p className="text-center text-gray-600">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary-500 hover:text-primary-600 font-medium">
              Sign up
            </Link>
          </p>
        </div>


      </div>
    </div>
  );
};

export default Login;