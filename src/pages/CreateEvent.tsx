/**
 * CreateEvent Page
 * 
 * Form for hosts to create new events with mandatory venue proof PDF upload
 * Only accessible to users with role === 'host'
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { addDoc, collection, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import PDFUpload from '../components/ui/PDFUpload';
import { generatePDFPath } from '../services/storage';

interface EventFormData {
  title: string;
  description: string;
  date: string;
  time: string;
  locationName: string;
  price: number;
  seatsLeft: number;
  bannerURL: string;
  venueProofPDF: string;
}

const CreateEvent: React.FC = () => {
  const navigate = useNavigate();
  const { user, userData } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    description: '',
    date: '',
    time: '',
    locationName: '',
    price: 0,
    seatsLeft: 0,
    bannerURL: '',
    venueProofPDF: ''
  });
  const [errors, setErrors] = useState<Partial<EventFormData>>({});

  // Redirect if not a host
  React.useEffect(() => {
    if (userData && userData.role !== 'host') {
      navigate('/dashboard');
    }
  }, [userData, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'seatsLeft' ? Number(value) : value
    }));
    
    // Clear error when user starts typing
    if (errors[name as keyof EventFormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleVenueProofUpload = (downloadURL: string) => {
    setFormData(prev => ({ ...prev, venueProofPDF: downloadURL }));
    if (errors.venueProofPDF) {
      setErrors(prev => ({ ...prev, venueProofPDF: undefined }));
    }
  };

  const handleVenueProofError = (error: string) => {
    setErrors(prev => ({ ...prev, venueProofPDF: error }));
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<EventFormData> = {};

    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.date) {
      newErrors.date = 'Date is required';
    } else {
      // Check if date is in the past
      const selectedDate = new Date(formData.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Reset time to start of day for comparison

      if (selectedDate < today) {
        newErrors.date = 'Event date cannot be in the past';
      }
    }
    if (!formData.time) newErrors.time = 'Time is required';
    if (!formData.locationName.trim()) newErrors.locationName = 'Location is required';
    if (formData.price < 0) newErrors.price = 'Price cannot be negative';
    if (formData.seatsLeft <= 0) newErrors.seatsLeft = 'Seats must be greater than 0';
    if (!formData.venueProofPDF) newErrors.venueProofPDF = 'Venue booking proof is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !validateForm()) return;

    setIsSubmitting(true);
    try {
      // Create event document in Firestore
      await addDoc(collection(db, 'events'), {
        title: formData.title,
        description: formData.description,
        date: formData.date,
        time: formData.time,
        location: formData.locationName, // Using 'location' to match existing schema
        locationName: formData.locationName,
        price: formData.price,
        capacity: formData.seatsLeft, // Using 'capacity' to match existing schema
        seatsLeft: formData.seatsLeft,
        image: formData.bannerURL || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400',
        bannerURL: formData.bannerURL,
        venueProofPDF: formData.venueProofPDF,
        hostId: user.uid,
        status: 'pending',
        ticketsSold: 0,
        revenue: 0,
        tags: [],
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });

      // Show success message and redirect
      alert('Event created successfully! It will be reviewed by admin before publishing.');
      navigate('/dashboard');
    } catch (error) {
      alert('Failed to create event. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user || userData?.role !== 'host') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-gray-400">Only hosts can create events.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Create New Event</h1>
          <p className="text-xl text-gray-400">
            Fill out the details below to create your event
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="bg-neutral-800 rounded-xl p-8 border border-gray-700">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Title */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-white mb-2">
                  Event Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-neutral-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter event title"
                  required
                />
                {errors.title && <p className="text-red-400 text-sm mt-1">{errors.title}</p>}
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-white mb-2">
                  Description <span className="text-red-400">*</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-3 bg-neutral-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Describe your event"
                  required
                />
                {errors.description && <p className="text-red-400 text-sm mt-1">{errors.description}</p>}
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Date <span className="text-red-400">*</span>
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  min={new Date().toISOString().split('T')[0]} // Prevent past dates
                  className="w-full px-4 py-3 bg-neutral-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
                {errors.date && <p className="text-red-400 text-sm mt-1">{errors.date}</p>}
              </div>

              {/* Time */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Time <span className="text-red-400">*</span>
                </label>
                <input
                  type="time"
                  name="time"
                  value={formData.time}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-neutral-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
                {errors.time && <p className="text-red-400 text-sm mt-1">{errors.time}</p>}
              </div>

              {/* Location */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-white mb-2">
                  Location <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="locationName"
                  value={formData.locationName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-neutral-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter venue location"
                  required
                />
                {errors.locationName && <p className="text-red-400 text-sm mt-1">{errors.locationName}</p>}
              </div>

              {/* Price */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Ticket Price ($) <span className="text-red-400">*</span>
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-3 bg-neutral-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="0.00"
                  required
                />
                {errors.price && <p className="text-red-400 text-sm mt-1">{errors.price}</p>}
              </div>

              {/* Seats */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Available Seats <span className="text-red-400">*</span>
                </label>
                <input
                  type="number"
                  name="seatsLeft"
                  value={formData.seatsLeft}
                  onChange={handleInputChange}
                  min="1"
                  className="w-full px-4 py-3 bg-neutral-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="100"
                  required
                />
                {errors.seatsLeft && <p className="text-red-400 text-sm mt-1">{errors.seatsLeft}</p>}
              </div>

              {/* Banner URL (Optional) */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-white mb-2">
                  Event Banner URL (Optional)
                </label>
                <input
                  type="url"
                  name="bannerURL"
                  value={formData.bannerURL}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-neutral-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="https://example.com/banner.jpg"
                />
              </div>
            </div>
          </div>

          {/* Venue Proof Upload */}
          <div className="bg-neutral-800 rounded-xl p-8 border border-gray-700">
            <h3 className="text-xl font-bold text-white mb-6">Required Documents</h3>
            <PDFUpload
              label="Upload Venue Booking Proof (PDF only)"
              onUploadComplete={handleVenueProofUpload}
              onUploadError={handleVenueProofError}
              storagePath={generatePDFPath('venueProofs', user?.uid || 'unknown')}
              required
              disabled={isSubmitting}
            />
            {errors.venueProofPDF && <p className="text-red-400 text-sm mt-2">{errors.venueProofPDF}</p>}
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
              disabled={isSubmitting || !formData.venueProofPDF}
              className="group relative px-8 py-3 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:via-teal-400 hover:to-cyan-400 text-white font-bold rounded-xl transition-all duration-300 transform hover:scale-110 shadow-xl border-2 border-emerald-400/30 hover:border-emerald-300/50 shadow-emerald-500/25 hover:shadow-emerald-400/40 tracking-wide disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:scale-100"
            >
              <div className="flex items-center space-x-2">
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Creating Event...</span>
                  </>
                ) : (
                  <>
                    <svg
                      className="w-5 h-5 drop-shadow-sm"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                    </svg>
                    <span>Create Event</span>
                  </>
                )}
              </div>

              {/* Enhanced glow effect - only when not disabled */}
              {!isSubmitting && !(!formData.venueProofPDF) && (
                <>
                  <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-30 transition-opacity duration-300 bg-gradient-to-r from-emerald-300 via-teal-300 to-cyan-300 blur-sm"></div>

                  {/* Sparkle effect */}
                  <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="absolute top-1 right-1 w-1 h-1 bg-white rounded-full animate-pulse"></div>
                    <div className="absolute bottom-1 left-1 w-1 h-1 bg-white rounded-full animate-pulse delay-300"></div>
                    <div className="absolute top-1/2 left-1/2 w-0.5 h-0.5 bg-white rounded-full animate-pulse delay-150"></div>
                  </div>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEvent;
