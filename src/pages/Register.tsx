import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Calendar, Mail, Lock, Eye, EyeOff, User, ArrowRight } from 'lucide-react';
import { createUserWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '@/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { allowRoleModification } from '@/utils/firestoreMonitor';

const Register: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isOAuthInProgress, setIsOAuthInProgress] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { currentUser, userData, loading: authLoading } = useAuth();

  // Get return URL and booking intent from session storage
  const getReturnUrl = () => {
    const returnUrl = sessionStorage.getItem('returnUrl');
    const bookingIntent = sessionStorage.getItem('bookingIntent');

    if (returnUrl && bookingIntent) {
      return returnUrl;
    }
    return '/dashboard';
  };

  // Handle navigation after authentication
  useEffect(() => {
    if (!authLoading && currentUser && userData) {
      console.log('🔄 Register: User authenticated, determining destination...', {
        user: currentUser.email,
        role: userData.role
      });

      // Determine destination based on user role and stored URLs
      let destination = '/dashboard'; // Default fallback

      // Check for stored return URL first
      const storedReturnUrl = sessionStorage.getItem('returnUrl');
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

      console.log('🔄 Register: Navigating to:', destination);

      // Clear all stored URLs
      sessionStorage.removeItem('returnUrl');
      sessionStorage.removeItem('bookingIntent');

      // Navigate to destination
      navigate(destination, { replace: true });
    }
  }, [currentUser, userData, authLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;

      // Create user document in Firestore
      const operationId = `register-email-${user.uid}-${Date.now()}`;
      allowRoleModification(operationId);

      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        displayName: `${formData.firstName} ${formData.lastName}`,
        role: 'user', // Default role
        createdAt: new Date().toISOString(),
      }, { merge: true }); // SAFEGUARD: Use merge to prevent overwriting existing data

      // Redirect to appropriate destination (dashboard or booking page)
      const destination = getReturnUrl();
      sessionStorage.removeItem('returnUrl');
      sessionStorage.removeItem('bookingIntent');
      navigate(destination);
    } catch (error: any) {
      setError(error.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setLoading(true);
    setError('');
    setIsOAuthInProgress(true);

    try {
      console.log('Starting Google sign up...');
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      console.log('Google sign up successful, user:', user.uid);

      // Check if user document exists, if not create one with default role
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        console.log('Creating new user document...');
        const userData = {
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          role: 'user', // Default role
          createdAt: new Date().toISOString(),
        };
        const operationId = `register-google-${result.user.uid}-${Date.now()}`;
        allowRoleModification(operationId);

        await setDoc(userDocRef, userData, { merge: true }); // SAFEGUARD: Use merge to prevent overwriting
        console.log('User document created:', userData);
      } else {
        console.log('User document already exists');
      }

      console.log('Navigating to appropriate destination...');
      // Navigate to appropriate destination (dashboard or booking page)
      const destination = getReturnUrl();
      sessionStorage.removeItem('returnUrl');
      sessionStorage.removeItem('bookingIntent');
      navigate(destination);
    } catch (error: any) {
      console.error('Google sign up error:', error);

      // Enhanced error handling for production deployment issues
      let errorMessage = 'Failed to sign up with Google';

      switch (error.code) {
        case 'auth/popup-closed-by-user':
          errorMessage = 'Sign-up was cancelled. Please try again.';
          break;
        case 'auth/popup-blocked':
          errorMessage = 'Pop-up was blocked. Please allow pop-ups for this site and try again.';
          break;
        case 'auth/cancelled-popup-request':
          errorMessage = 'Sign-up was cancelled. Please try again.';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Network error. Please check your internet connection and try again.';
          break;
        case 'auth/unauthorized-domain':
          errorMessage = 'This domain is not authorized for Google sign-up. Please contact support.';
          break;
        case 'auth/operation-not-allowed':
          errorMessage = 'Google sign-up is not enabled. Please contact support.';
          break;
        case 'auth/invalid-api-key':
          errorMessage = 'Authentication configuration error. Please contact support.';
          break;
        case 'auth/app-deleted':
          errorMessage = 'Authentication service unavailable. Please contact support.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many sign-up attempts. Please wait a moment and try again.';
          break;
        case 'auth/account-exists-with-different-credential':
          errorMessage = 'An account already exists with this email using a different sign-in method. Please try signing in instead.';
          break;
        case 'auth/web-storage-unsupported':
          errorMessage = 'Your browser does not support web storage. Please enable cookies and try again.';
          break;
        default:
          // Log detailed error for debugging in production
          console.error('Unhandled Google OAuth error:', {
            code: error.code,
            message: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href
          });
          errorMessage = `Sign-up failed: ${error.message || 'Unknown error'}. Please try again or contact support.`;
      }

      setError(errorMessage);
      setIsOAuthInProgress(false);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
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

        {/* Register Card */}
        <div className="bg-white rounded-2xl shadow-card p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Create Account</h1>
            <p className="text-gray-600">Choose your preferred sign-up method</p>
          </div>

          {/* Google Sign Up - Primary Option */}
          <div className="mb-6">
            <button
              type="button"
              onClick={handleGoogleSignUp}
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
            <span className="px-4 text-sm text-gray-500 font-medium">or sign up with email</span>
            <div className="flex-1 border-t border-gray-300"></div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Inputs */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                  First Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300"
                    placeholder="John"
                    required
                  />
                </div>
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300"
                  placeholder="Doe"
                  required
                />
              </div>
            </div>

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
                  placeholder="john@example.com"
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
                  placeholder="Create a strong password"
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

            {/* Confirm Password Input */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full pl-12 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300"
                  placeholder="Confirm your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Terms Checkbox */}
            <div className="flex items-start">
              <input
                type="checkbox"
                id="agreeToTerms"
                name="agreeToTerms"
                checked={formData.agreeToTerms}
                onChange={handleInputChange}
                className="w-4 h-4 mt-1 text-primary-500 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 focus:ring-2"
                required
              />
              <label htmlFor="agreeToTerms" className="ml-3 text-sm text-gray-600">
                I agree to the{' '}
                <Link to="/terms" className="text-primary-500 hover:text-primary-600 font-medium">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link to="/privacy" className="text-primary-500 hover:text-primary-600 font-medium">
                  Privacy Policy
                </Link>
              </label>
            </div>

            {/* Register Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary relative"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                  Creating Account...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  Create Account
                  <ArrowRight className="w-5 h-5 ml-2" />
                </div>
              )}
            </button>
          </form>

          {/* Sign In Link */}
          <p className="text-center text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-500 hover:text-primary-600 font-medium">
              Sign in
            </Link>
          </p>
        </div>


      </div>
    </div>
  );
};

export default Register;