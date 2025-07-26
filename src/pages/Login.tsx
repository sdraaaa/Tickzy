/**
 * Login Page
 * 
 * Handles Google Sign-In authentication and user redirection
 * based on verification status
 */

import React, { useState, useEffect } from 'react';
import { signInWithPopup, signInWithRedirect, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { useNavigate, Link } from 'react-router-dom';
import { auth, provider } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import LandingNavbar from '../components/Landing/LandingNavbar';

const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate();
  const { user, userData, needsEmailVerification } = useAuth();

  // Redirect logic based on authentication and verification status
  useEffect(() => {
    if (user && userData) {
      // Check if user needs email verification
      if (needsEmailVerification()) {
        navigate('/verify-email');
      } else {
        navigate('/dashboard');
      }
    }
  }, [user, userData, navigate, needsEmailVerification]);

  // Handle email/password sign in
  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Check if email is verified
      if (!user.emailVerified) {
        navigate('/verify-email');
      } else {
        navigate('/dashboard');
      }
    } catch (error: any) {
      console.error('Email sign in error:', error);
      setError(getErrorMessage(error.code));
    } finally {
      setLoading(false);
    }
  };

  // Handle email/password sign up
  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Send email verification
      await sendEmailVerification(user);

      // Redirect to verification page
      navigate('/verify-email');
    } catch (error: any) {
      console.error('Email sign up error:', error);
      setError(getErrorMessage(error.code));
    } finally {
      setLoading(false);
    }
  };

  // Get user-friendly error messages
  const getErrorMessage = (errorCode: string): string => {
    switch (errorCode) {
      case 'auth/user-not-found':
        return 'No account found with this email address';
      case 'auth/wrong-password':
        return 'Incorrect password';
      case 'auth/email-already-in-use':
        return 'An account with this email already exists';
      case 'auth/weak-password':
        return 'Password is too weak';
      case 'auth/invalid-email':
        return 'Invalid email address';
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please try again later';
      default:
        return 'An error occurred. Please try again';
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;



      // The AuthContext will handle creating/getting the user document
      // and the useEffect above will handle redirection

    } catch (error: any) {
      console.error('Error signing in with Google:', error);

      // Handle specific error cases
      if (error.code === 'auth/popup-closed-by-user') {
        setError('Sign-in was cancelled. Please try again.');
      } else if (error.code === 'auth/popup-blocked') {
        setError('Pop-up was blocked. Trying redirect method...');
        // Fallback to redirect method
        try {
          await signInWithRedirect(auth, provider);
          return; // Don't set loading to false as redirect will reload the page
        } catch (redirectError) {
          console.error('Redirect sign-in also failed:', redirectError);
          setError('Failed to sign in. Please try again.');
        }
      } else if (error.message?.includes('Cross-Origin-Opener-Policy')) {
        setError('Browser security settings are blocking sign-in. Trying redirect method...');
        // Fallback to redirect method for CORS issues
        try {
          await signInWithRedirect(auth, provider);
          return; // Don't set loading to false as redirect will reload the page
        } catch (redirectError) {
          console.error('Redirect sign-in also failed:', redirectError);
          setError('Failed to sign in. Please try again.');
        }
      } else {
        setError('Failed to sign in. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Navigation */}
      <LandingNavbar />

      <div className="flex items-center justify-center px-4 pt-16 pb-8 min-h-screen">
      <div className="max-w-md w-full">
        {/* Login Card */}
        <div className="bg-neutral-900 rounded-xl shadow-2xl p-8 border border-gray-800">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              {isSignUp ? 'Create Account' : 'Welcome Back'}
            </h1>
            <p className="text-gray-400">
              {isSignUp ? 'Join Tickzy to discover amazing events' : 'Sign in to your account'}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-900/50 border border-red-700 rounded-lg">
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          {/* Email/Password Form */}
          <form onSubmit={isSignUp ? handleEmailSignUp : handleEmailSignIn} className="space-y-4 mb-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-neutral-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Enter your email"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-neutral-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Enter your password"
                required
              />
            </div>

            {isSignUp && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-neutral-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Confirm your password"
                  required
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mx-auto"></div>
              ) : (
                isSignUp ? 'Create Account' : 'Sign In'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-neutral-900 text-gray-400">Or continue with</span>
            </div>
          </div>

          {/* Google Sign-In Button */}
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full bg-white hover:bg-gray-100 text-gray-900 font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900"></div>
            ) : (
              <>
                {/* Google Icon */}
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span>Continue with Google</span>
              </>
            )}
          </button>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-gray-500 text-sm">
              By signing in, you agree to our{' '}
              <a href="#" className="text-purple-400 hover:text-purple-300">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#" className="text-purple-400 hover:text-purple-300">
                Privacy Policy
              </a>
            </p>
          </div>
        </div>

        {/* Toggle Sign In/Sign Up */}
        <div className="text-center mt-6 mb-4">
          <p className="text-gray-400">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError(null);
                setEmail('');
                setPassword('');
                setConfirmPassword('');
              }}
              className="text-purple-400 hover:text-purple-300 font-medium transition-colors duration-200"
            >
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </button>
          </p>
        </div>

        {/* Back to Home */}
        <div className="text-center">
          <button
            onClick={() => navigate('/')}
            className="text-gray-400 hover:text-white transition-colors duration-200"
          >
            ← Back to Home
          </button>
        </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
