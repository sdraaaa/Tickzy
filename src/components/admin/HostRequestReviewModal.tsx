/**
 * HostRequestReviewModal Component
 * 
 * Detailed modal for admins to review host requests before approval/rejection
 */

import React, { useState } from 'react';
import { doc, getDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../firebase';

interface HostRequest {
  id: string;
  userId: string;
  displayName?: string;
  email?: string;
  reason?: string;
  experience?: string;
  licensePDF?: string;
  status: string;
  createdAt?: any;
  updatedAt?: any;
  [key: string]: any;
}

interface HostRequestReviewModalProps {
  request: HostRequest;
  isOpen: boolean;
  onClose: () => void;
  onStatusUpdate: (requestId: string, newStatus: string) => void;
}

const HostRequestReviewModal: React.FC<HostRequestReviewModalProps> = ({
  request,
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
      // First, verify the user document exists
      const userDocRef = doc(db, 'users', request.userId);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        throw new Error(`User document not found for ID: ${request.userId}`);
      }

      // Update the user's role to 'host'
      await updateDoc(userDocRef, {
        role: 'host',
        updatedAt: Timestamp.now(),
        hostApprovedAt: Timestamp.now(),
        hostApprovedBy: 'admin'
      });

      // Then, update the request status
      await updateDoc(doc(db, 'hostRequests', request.id), {
        status: 'approved',
        statusUpdatedAt: Timestamp.now(),
        statusUpdatedBy: 'admin',
        updatedAt: Timestamp.now()
      });

      onStatusUpdate(request.id, 'approved');
      onClose();

      // Show success message
      alert('Host request approved successfully! The user is now a host.');
    } catch (error) {
      console.error('Error approving host request:', error);
      alert(`Failed to approve host request: ${error.message}`);
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
      await updateDoc(doc(db, 'hostRequests', request.id), {
        status: 'rejected',
        rejectionReason: rejectionReason.trim(),
        statusUpdatedAt: Timestamp.now(),
        statusUpdatedBy: 'admin',
        updatedAt: Timestamp.now()
      });
      
      onStatusUpdate(request.id, 'rejected');
      onClose();
    } catch (error) {
      console.error('Error rejecting host request:', error);
      alert('Failed to reject host request. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  const formatDate = (timestamp: any) => {
    try {
      if (timestamp?.toDate) {
        return timestamp.toDate().toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      }
      return 'Unknown';
    } catch {
      return 'Unknown';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-neutral-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-700">
        {/* Header */}
        <div className="sticky top-0 bg-neutral-800 border-b border-gray-700 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Review Host Request</h2>
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
          {/* Applicant Header */}
          <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 rounded-lg p-6 border border-purple-500/20">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xl font-bold">
                  {(request.displayName || request.email || 'U')[0].toUpperCase()}
                </span>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">{request.displayName || 'Unknown User'}</h3>
                <p className="text-purple-200">{request.email || 'No email provided'}</p>
                <p className="text-gray-400 text-sm">User ID: {request.userId || 'Unknown'}</p>
              </div>
            </div>
          </div>

          {/* Request Details Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-semibold text-white mb-3 flex items-center space-x-2">
                  <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Why do you want to become a host?</span>
                </h4>
                <div className="bg-neutral-700 rounded-lg p-4">
                  <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{request.reason || 'No reason provided'}</p>
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  Character count: {(request.reason || '').length}
                </div>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-white mb-3 flex items-center space-x-2">
                  <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                  </svg>
                  <span>Event Management Experience</span>
                </h4>
                <div className="bg-neutral-700 rounded-lg p-4">
                  <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{request.experience || 'No experience provided'}</p>
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  Character count: {(request.experience || '').length}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-semibold text-white mb-3 flex items-center space-x-2">
                  <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>Event Manager License</span>
                </h4>
                <div className="bg-neutral-700 rounded-lg p-4">
                  {request.licensePDF ? (
                    <a
                      href={request.licensePDF}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-3 text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span>View Event Manager License (PDF)</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  ) : (
                    <p className="text-red-400">⚠️ No license documentation provided</p>
                  )}
                </div>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-white mb-3 flex items-center space-x-2">
                  <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Request Details</span>
                </h4>
                <div className="bg-neutral-700 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Status:</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      request.status === 'pending' ? 'bg-yellow-600 text-white' :
                      request.status === 'approved' ? 'bg-green-600 text-white' :
                      'bg-red-600 text-white'
                    }`}>
                      {request.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Submitted:</span>
                    <span className="text-gray-300 text-sm">
                      {formatDate(request.createdAt)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Request ID:</span>
                    <span className="text-gray-300 text-xs font-mono">
                      {request.id}
                    </span>
                  </div>
                </div>
              </div>

              {/* Assessment Checklist */}
              <div>
                <h4 className="text-lg font-semibold text-white mb-3 flex items-center space-x-2">
                  <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                  <span>Assessment Checklist</span>
                </h4>
                <div className="bg-neutral-700 rounded-lg p-4 space-y-2">
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" className="rounded" defaultChecked={(request.reason || '').length >= 50} />
                    <span className="text-gray-300 text-sm">Reason is detailed (50+ characters)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" className="rounded" defaultChecked={(request.experience || '').length >= 30} />
                    <span className="text-gray-300 text-sm">Experience is described (30+ characters)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" className="rounded" defaultChecked={!!request.licensePDF} />
                    <span className="text-gray-300 text-sm">License documentation provided</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" className="rounded" />
                    <span className="text-gray-300 text-sm">License appears valid and legitimate</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" className="rounded" />
                    <span className="text-gray-300 text-sm">Applicant shows genuine interest in hosting</span>
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
                placeholder="Please provide a detailed reason for rejecting this host request..."
                className="w-full h-32 bg-neutral-700 border border-gray-600 rounded-lg p-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
              />
            </div>
          )}

          {/* Action Buttons */}
          {request.status === 'pending' && (
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-700">
              {!showRejectionForm ? (
                <>
                  <button
                    onClick={() => setShowRejectionForm(true)}
                    disabled={updating}
                    className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors duration-200 disabled:opacity-50"
                  >
                    Reject Request
                  </button>
                  <button
                    onClick={handleApprove}
                    disabled={updating}
                    className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors duration-200 disabled:opacity-50"
                  >
                    {updating ? 'Approving...' : 'Approve Request'}
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

export default HostRequestReviewModal;
