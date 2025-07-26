/**
 * EventReviewModal Component
 * 
 * Detailed modal for admins to review event submissions before approval/rejection
 */

import React, { useState } from 'react';
import { doc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../firebase';

interface EventWithHost {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  price: number;
  capacity: number;
  image: string;
  hostId: string;
  hostName?: string;
  hostEmail?: string;
  status: string;
  venueProofPDF?: string;
  createdAt?: any;
  updatedAt?: any;
  [key: string]: any;
}

interface EventReviewModalProps {
  event: EventWithHost;
  isOpen: boolean;
  onClose: () => void;
  onStatusUpdate: (eventId: string, newStatus: string) => void;
}

const EventReviewModal: React.FC<EventReviewModalProps> = ({
  event,
  isOpen,
  onClose,
  onStatusUpdate
}) => {
  const [updating, setUpdating] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectionForm, setShowRejectionForm] = useState(false);

  if (!isOpen) return null;

  const handleApprove = async () => {
    setUpdating(true);
    try {
      await updateDoc(doc(db, 'events', event.id), {
        status: 'approved',
        statusUpdatedAt: Timestamp.now(),
        statusUpdatedBy: 'admin',
        updatedAt: Timestamp.now()
      });
      
      onStatusUpdate(event.id, 'approved');
      onClose();
    } catch (error) {
      console.error('Error approving event:', error);
      alert('Failed to approve event. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      alert('Please provide a reason for rejection.');
      return;
    }

    setUpdating(true);
    try {
      await updateDoc(doc(db, 'events', event.id), {
        status: 'rejected',
        rejectionReason: rejectionReason.trim(),
        statusUpdatedAt: Timestamp.now(),
        statusUpdatedBy: 'admin',
        updatedAt: Timestamp.now()
      });
      
      onStatusUpdate(event.id, 'rejected');
      onClose();
    } catch (error) {
      console.error('Error rejecting event:', error);
      alert('Failed to reject event. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const formatTime = (timeString: string) => {
    try {
      const [hours, minutes] = timeString.split(':');
      const date = new Date();
      date.setHours(parseInt(hours), parseInt(minutes));
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return timeString;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-neutral-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-700">
        {/* Header */}
        <div className="sticky top-0 bg-neutral-800 border-b border-gray-700 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Review Event Submission</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8">
          {/* Event Banner */}
          <div className="relative h-64 rounded-lg overflow-hidden">
            <img
              src={event.image}
              alt={event.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            <div className="absolute bottom-4 left-4">
              <h3 className="text-2xl font-bold text-white">{event.title}</h3>
              <p className="text-gray-200">{event.location}</p>
            </div>
          </div>

          {/* Event Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-semibold text-white mb-3">Event Information</h4>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-gray-300">{formatDate(event.date)}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-gray-300">{formatTime(event.time)}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-gray-300">{event.location}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                    <span className="text-gray-300">${event.price} per ticket</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span className="text-gray-300">{event.capacity} max capacity</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-white mb-3">Host Information</h4>
                <div className="bg-neutral-700 rounded-lg p-4 space-y-2">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-medium">
                        {(event.hostName || event.hostEmail || 'U')[0].toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-white font-medium">{event.hostName || 'Unknown Host'}</p>
                      <p className="text-gray-400 text-sm">{event.hostEmail}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-semibold text-white mb-3">Description</h4>
                <div className="bg-neutral-700 rounded-lg p-4">
                  <p className="text-gray-300 leading-relaxed">{event.description}</p>
                </div>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-white mb-3">Venue Documentation</h4>
                <div className="bg-neutral-700 rounded-lg p-4">
                  {event.venueProofPDF ? (
                    <a
                      href={event.venueProofPDF}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-3 text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span>View Venue Booking Proof (PDF)</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  ) : (
                    <p className="text-red-400">⚠️ No venue documentation provided</p>
                  )}
                </div>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-white mb-3">Submission Details</h4>
                <div className="bg-neutral-700 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Status:</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      event.status === 'pending' ? 'bg-yellow-600 text-white' :
                      event.status === 'approved' ? 'bg-green-600 text-white' :
                      'bg-red-600 text-white'
                    }`}>
                      {event.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Submitted:</span>
                    <span className="text-gray-300">
                      {event.createdAt ? new Date(event.createdAt.toDate()).toLocaleDateString() : 'Unknown'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Rejection Form */}
          {showRejectionForm && (
            <div className="bg-red-900/20 border border-red-700 rounded-lg p-6">
              <h4 className="text-lg font-semibold text-white mb-3">Rejection Reason</h4>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Please provide a detailed reason for rejecting this event..."
                className="w-full h-32 bg-neutral-700 border border-gray-600 rounded-lg p-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
              />
            </div>
          )}

          {/* Action Buttons */}
          {event.status === 'pending' && (
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-700">
              {!showRejectionForm ? (
                <>
                  <button
                    onClick={() => setShowRejectionForm(true)}
                    disabled={updating}
                    className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors duration-200 disabled:opacity-50"
                  >
                    Reject Event
                  </button>
                  <button
                    onClick={handleApprove}
                    disabled={updating}
                    className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors duration-200 disabled:opacity-50"
                  >
                    {updating ? 'Approving...' : 'Approve Event'}
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setShowRejectionForm(false);
                      setRejectionReason('');
                    }}
                    disabled={updating}
                    className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleReject}
                    disabled={updating || !rejectionReason.trim()}
                    className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors duration-200 disabled:opacity-50"
                  >
                    {updating ? 'Rejecting...' : 'Confirm Rejection'}
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventReviewModal;
