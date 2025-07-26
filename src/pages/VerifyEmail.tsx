/**
 * Email Verification Page
 * 
 * Displays verification instructions and handles email verification status
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { sendEmailVerification, reload } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

const VerifyEmail: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [checkingVerification, setCheckingVerification] = useState(false);

  useEffect(() => {
    // If user is already verified or signed in with Google, redirect to dashboard
    if (user?.emailVerified || user?.providerData?.[0]?.providerId === 'google.com') {
      navigate('/dashboard');
      return;
    }

    // If no user, redirect to login
    if (!user) {
      navigate('/login');
      return;
    }

    // Start cooldown timer if there's a stored timestamp
    const lastSentTime = localStorage.getItem('emailVerificationSent');
    if (lastSentTime) {
      const timeDiff = Date.now() - parseInt(lastSentTime);
      const remainingTime = Math.max(0, 60000 - timeDiff); // 60 second cooldown
      if (remainingTime > 0) {
        setResendCooldown(Math.ceil(remainingTime / 1000));
      }
    }
  }, [user, navigate]);

  useEffect(() => {
    // Countdown timer
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleResendVerification = async () => {
    if (!user || resendCooldown > 0) return;

    setIsResending(true);
    try {
      await sendEmailVerification(user);
      localStorage.setItem('emailVerificationSent', Date.now().toString());
      setResendCooldown(60); // 60 second cooldown
      alert('Verification email sent! Please check your inbox.');
    } catch (error: any) {
      console.error('Error sending verification email:', error);
      alert(`Failed to send verification email: ${error.message}`);
    } finally {
      setIsResending(false);
    }
  };

  const handleCheckVerification = async () => {
    if (!user) return;

    setCheckingVerification(true);
    try {
      // Reload user to get latest verification status
      await reload(user);
      
      // Check if email is now verified
      if (user.emailVerified) {
        navigate('/dashboard');
      } else {
        alert('Email not yet verified. Please check your inbox and click the verification link.');
      }
    } catch (error: any) {
      console.error('Error checking verification status:', error);
      alert('Failed to check verification status. Please try again.');
    } finally {
      setCheckingVerification(false);
    }
  };

  const handleBackToLogin = () => {
    navigate('/login');
  };

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-neutral-800 rounded-xl border border-gray-700 p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-purple-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Verify Your Email</h1>
            <p className="text-gray-400">
              We've sent a verification link to <span className="text-purple-400 font-medium">{user.email}</span>
            </p>
          </div>

          {/* Instructions */}
          <div className="space-y-4 mb-8">
            <div className="bg-neutral-700/50 rounded-lg p-4">
              <h3 className="text-white font-medium mb-2">📧 Check Your Email</h3>
              <p className="text-gray-300 text-sm">
                Click the verification link in the email we sent you to activate your account.
              </p>
            </div>

            <div className="bg-neutral-700/50 rounded-lg p-4">
              <h3 className="text-white font-medium mb-2">📱 Check Spam Folder</h3>
              <p className="text-gray-300 text-sm">
                If you don't see the email, please check your spam or junk folder.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleCheckVerification}
              disabled={checkingVerification}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-600/50 text-white font-medium py-3 rounded-lg transition-colors duration-200"
            >
              {checkingVerification ? 'Checking...' : 'I\'ve Verified My Email'}
            </button>

            <button
              onClick={handleResendVerification}
              disabled={isResending || resendCooldown > 0}
              className="w-full bg-neutral-700 hover:bg-neutral-600 disabled:bg-neutral-700/50 text-white font-medium py-3 rounded-lg transition-colors duration-200"
            >
              {isResending ? 'Sending...' : 
               resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 
               'Resend Verification Email'}
            </button>

            <button
              onClick={handleBackToLogin}
              className="w-full text-gray-400 hover:text-white font-medium py-3 transition-colors duration-200"
            >
              Back to Login
            </button>
          </div>

          {/* Help Text */}
          <div className="mt-6 pt-6 border-t border-gray-700">
            <p className="text-gray-400 text-sm text-center">
              Having trouble? Contact support at{' '}
              <a href="mailto:support@tickzy.com" className="text-purple-400 hover:text-purple-300">
                support@tickzy.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
