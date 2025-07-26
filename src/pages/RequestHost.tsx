/**
 * RequestHost Page
 * 
 * Form for users to request to become hosts with mandatory license PDF upload
 * Only accessible to users with role === 'user'
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { addDoc, collection, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import PDFUpload from '../components/ui/PDFUpload';
import { generatePDFPath } from '../services/storage';

interface HostRequestFormData {
  reason: string;
  experience: string;
  licensePDF: string;
}

const RequestHost: React.FC = () => {
  const navigate = useNavigate();
  const { user, userData } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<HostRequestFormData>({
    reason: '',
    experience: '',
    licensePDF: ''
  });
  const [errors, setErrors] = useState<Partial<HostRequestFormData>>({});

  // Redirect if not a regular user
  React.useEffect(() => {
    if (userData && userData.role !== 'user') {
      navigate('/dashboard');
    }
  }, [userData, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name as keyof HostRequestFormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleLicenseUpload = (downloadURL: string) => {
    setFormData(prev => ({ ...prev, licensePDF: downloadURL }));
    if (errors.licensePDF) {
      setErrors(prev => ({ ...prev, licensePDF: undefined }));
    }
  };

  const handleLicenseError = (error: string) => {
    setErrors(prev => ({ ...prev, licensePDF: error }));
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<HostRequestFormData> = {};

    if (!formData.reason.trim()) {
      newErrors.reason = 'Please explain why you want to become a host';
    } else if (formData.reason.trim().length < 50) {
      newErrors.reason = 'Please provide at least 50 characters explaining your reason';
    }

    if (!formData.experience.trim()) {
      newErrors.experience = 'Please describe your event management experience';
    } else if (formData.experience.trim().length < 30) {
      newErrors.experience = 'Please provide at least 30 characters describing your experience';
    }

    if (!formData.licensePDF) {
      newErrors.licensePDF = 'Event Manager License is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !validateForm()) return;

    setIsSubmitting(true);
    try {
      // Create host request document in Firestore
      await addDoc(collection(db, 'hostRequests'), {
        userId: user.uid,
        displayName: user.displayName || user.email?.split('@')[0] || 'Unknown User',
        email: user.email,
        reason: formData.reason.trim(),
        experience: formData.experience.trim(),
        licensePDF: formData.licensePDF,
        status: 'pending',
        createdAt: Timestamp.now()
      });

      // Show success message and redirect
      alert('Host request submitted successfully! We will review your application and get back to you soon.');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error submitting host request:', error);
      alert('Failed to submit host request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user || userData?.role !== 'user') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-gray-400">Only regular users can request to become hosts.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Request to Become a Host</h1>
          <p className="text-xl text-gray-400">
            Join our community of event organizers and start hosting amazing events
          </p>
        </div>

        {/* Info Section */}
        <div className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 rounded-xl p-8 border border-purple-500/20 mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Why Become a Host?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Reach More People</h3>
              <p className="text-purple-200 text-sm">Connect with thousands of potential attendees</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💰</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Monetize Events</h3>
              <p className="text-blue-200 text-sm">Sell tickets and generate revenue from your events</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Analytics & Insights</h3>
              <p className="text-green-200 text-sm">Track performance and optimize your events</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="bg-neutral-800 rounded-xl p-8 border border-gray-700">
            <h3 className="text-xl font-bold text-white mb-6">Tell Us About Yourself</h3>
            
            {/* Reason */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-white mb-2">
                Why do you want to become a host? <span className="text-red-400">*</span>
              </label>
              <textarea
                name="reason"
                value={formData.reason}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-4 py-3 bg-neutral-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Explain your motivation for hosting events, your goals, and what you hope to achieve..."
                required
              />
              <div className="flex justify-between items-center mt-1">
                {errors.reason && <p className="text-red-400 text-sm">{errors.reason}</p>}
                <p className="text-gray-400 text-sm ml-auto">{formData.reason.length}/50 minimum</p>
              </div>
            </div>

            {/* Experience */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Describe your event management experience <span className="text-red-400">*</span>
              </label>
              <textarea
                name="experience"
                value={formData.experience}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-4 py-3 bg-neutral-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Share your experience organizing events, managing teams, working with venues, etc..."
                required
              />
              <div className="flex justify-between items-center mt-1">
                {errors.experience && <p className="text-red-400 text-sm">{errors.experience}</p>}
                <p className="text-gray-400 text-sm ml-auto">{formData.experience.length}/30 minimum</p>
              </div>
            </div>
          </div>

          {/* License Upload */}
          <div className="bg-neutral-800 rounded-xl p-8 border border-gray-700">
            <h3 className="text-xl font-bold text-white mb-6">Required Documentation</h3>
            <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-4 mb-6">
              <div className="flex items-start space-x-3">
                <svg className="w-5 h-5 text-yellow-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <div>
                  <h4 className="text-yellow-400 font-medium">Event Manager License Required</h4>
                  <p className="text-yellow-200 text-sm mt-1">
                    Please upload a valid Event Manager License or certification. This helps us verify your qualifications to host events safely and professionally.
                  </p>
                </div>
              </div>
            </div>
            
            <PDFUpload
              label="Upload Event Manager License (PDF only)"
              onUploadComplete={handleLicenseUpload}
              onUploadError={handleLicenseError}
              storagePath={generatePDFPath('licenseProofs', user?.uid || 'unknown')}
              required
              disabled={isSubmitting}
            />
            {errors.licensePDF && <p className="text-red-400 text-sm mt-2">{errors.licensePDF}</p>}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="px-8 py-3 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors duration-200"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !formData.licensePDF}
              className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isSubmitting ? 'Submitting Request...' : 'Submit Host Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RequestHost;
