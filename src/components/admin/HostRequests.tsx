/**
 * HostRequests Component
 * 
 * Admin panel for managing host requests - approve or reject
 */

import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../contexts/AuthContext';
import { adminLogger } from '../../services/adminLogger';
import HostRequestReviewModal from './HostRequestReviewModal';

interface HostRequest {
  id: string;
  userId: string;
  userEmail?: string;
  userName?: string;
  reason?: string;
  experience?: string;
  licensePDF?: string;
  status?: 'pending' | 'approved' | 'rejected';
  createdAt?: any;
  // Allow for flexible field names from Firebase
  [key: string]: any;
}

const HostRequests: React.FC = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<HostRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<HostRequest | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);


  useEffect(() => {
    fetchHostRequests();
  }, []);

  const fetchHostRequests = async () => {
    setLoading(true);
    try {
      // Try multiple possible collection names
      const possibleCollections = [
        'hostRequests',
        'host_requests',
        'host-requests',
        'hostApplications',
        'host_applications',
        'requests',
        'applications'
      ];

      let requestsSnapshot = null;
      let foundCollectionName = '';

      for (const collectionName of possibleCollections) {
        try {
          const snapshot = await getDocs(collection(db, collectionName));

          if (snapshot.docs.length > 0) {
            requestsSnapshot = snapshot;
            foundCollectionName = collectionName;
            break;
          }
        } catch (error) {
          // Continue to next collection
        }
      }

      if (!requestsSnapshot) {
        setRequests([]);
        setLoading(false);
        return;
      }

      const usersSnapshot = await getDocs(collection(db, 'users'));

      // Create a map of user IDs to user data
      const usersMap = new Map();
      usersSnapshot.docs.forEach(doc => {
        usersMap.set(doc.id, doc.data());
      });

      const requestsData = requestsSnapshot.docs.map(doc => {
        const data = doc.data();
        const requestData: HostRequest = {
          id: doc.id,
          userId: data.userId || data.user_id || '',
          userEmail: data.email || data.userEmail || data.user_email || '',
          userName: data.displayName || data.userName || data.user_name || data.name || '',
          reason: data.reason || data.message || '',
          experience: data.experience || data.background || '',
          licensePDF: data.licensePDF || data.license_pdf || data.licenseDocument || '',
          status: data.status || 'pending',
          createdAt: data.createdAt || data.created_at || data.timestamp,
          // Add the original field names for the modal
          displayName: data.displayName || data.userName || data.user_name || data.name || '',
          email: data.email || data.userEmail || data.user_email || ''
          // Don't spread all data to avoid object rendering issues
        };

        // Try to get user data if userId exists but no user info
        if (requestData.userId && !requestData.userEmail) {
          const userData = usersMap.get(requestData.userId);
          if (userData) {
            requestData.userEmail = userData.email;
            requestData.userName = userData.displayName || userData.name;
          }
        }

        return requestData;
      });

      // Sort by creation date, newest first
      requestsData.sort((a, b) => {
        if (a.createdAt && b.createdAt) {
          const dateA = a.createdAt.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
          const dateB = b.createdAt.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
          return dateB.getTime() - dateA.getTime();
        }
        return 0;
      });

      setRequests(requestsData);
    } catch (error) {
      console.error('Error fetching host requests:', error);
    } finally {
      setLoading(false);
    }
  };



  const approveRequest = async (request: HostRequest) => {
    setProcessing(request.id);
    try {
      // First, verify the user document exists
      const userDocRef = doc(db, 'users', request.userId);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        throw new Error(`User document not found for ID: ${request.userId}`);
      }

      // Update user role to host
      await updateDoc(userDocRef, {
        role: 'host',
        updatedAt: new Date(),
        hostApprovedAt: new Date(),
        hostApprovedBy: 'admin'
      });

      // Update request status
      await updateDoc(doc(db, 'hostRequests', request.id), {
        status: 'approved',
        processedAt: new Date(),
        processedBy: 'admin'
      });

      // Log the approval action
      if (user) {
        await adminLogger.logHostRequestApproval(
          user.uid,
          user.email || 'admin@tickzy.com',
          request.id,
          request.userEmail || 'unknown@email.com',
          request.userName
        );
      }

      // Update local state
      setRequests(requests.map(req =>
        req.id === request.id ? { ...req, status: 'approved' } : req
      ));

      alert('Host request approved successfully! The user is now a host.');

    } catch (error) {
      console.error('Error approving host request:', error);
      alert(`Failed to approve host request: ${error.message}`);
    } finally {
      setProcessing(null);
    }
  };

  const rejectRequest = async (request: HostRequest) => {
    setProcessing(request.id);
    try {
      // Try to find and delete from the correct collection
      const possibleCollections = [
        'hostRequests', 'host_requests', 'host-requests',
        'hostApplications', 'host_applications', 'requests', 'applications'
      ];

      let deleted = false;
      for (const collectionName of possibleCollections) {
        try {
          const docRef = doc(db, collectionName, request.id);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            await deleteDoc(docRef);
            deleted = true;
            break;
          }
        } catch (error) {
          // Continue to next collection
        }
      }

      if (!deleted) {
        throw new Error('Request not found in any collection');
      }

      // Log the rejection/deletion action
      if (user) {
        await adminLogger.logHostRequestDeletion(
          user.uid,
          user.email || 'admin@tickzy.com',
          request.id,
          request.userEmail || 'unknown@email.com',
          request.userName
        );
      }

      // Update local state
      setRequests(requests.filter(req => req.id !== request.id));

    } catch (error) {
      console.error('Error rejecting host request:', error);
      alert('Error rejecting request. Please try again.');
    } finally {
      setProcessing(null);
    }
  };

  const handleViewRequest = (request: HostRequest) => {
    setSelectedRequest(request);
    setShowReviewModal(true);
  };

  const handleCloseModal = () => {
    setSelectedRequest(null);
    setShowReviewModal(false);
  };

  const handleStatusUpdate = (requestId: string, newStatus: string) => {
    setRequests(requests.map(request =>
      request.id === requestId ? { ...request, status: newStatus } : request
    ));
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-600 text-white';
      case 'rejected': return 'bg-red-600 text-white';
      case 'pending': return 'bg-yellow-600 text-white';
      default: return 'bg-purple-600 text-white';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-16">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
        <span className="ml-4 text-white">Loading host requests...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Host Requests</h2>
        <div className="flex space-x-2">
          <span className="text-gray-400 text-sm">
            {requests.length} requests found
          </span>
          <button
            onClick={fetchHostRequests}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
          >
            Refresh
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {requests.map((request) => (
          <div key={request.id} className="bg-neutral-800 rounded-xl border border-gray-700 p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-white">
                  {request.userName || 'Unknown User'}
                </h3>
                <p className="text-gray-400 text-sm">{request.userEmail}</p>
                <p className="text-gray-500 text-xs mt-1">
                  {request.createdAt?.toDate().toLocaleDateString()}
                </p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(request.status)}`}>
                {request.status.toUpperCase()}
              </span>
            </div>

            <div className="space-y-3 mb-6">
              <div>
                <h4 className="text-sm font-medium text-gray-300 mb-1">Reason for Request:</h4>
                <p className="text-white text-sm bg-neutral-700 rounded p-3">
                  {request.reason || 'No reason provided'}
                </p>
              </div>

              {request.experience && (
                <div>
                  <h4 className="text-sm font-medium text-gray-300 mb-1">Experience:</h4>
                  <p className="text-white text-sm bg-neutral-700 rounded p-3">
                    {request.experience}
                  </p>
                </div>
              )}

              {(request as any).licensePDF && (
                <div>
                  <h4 className="text-sm font-medium text-gray-300 mb-1">Event Manager License:</h4>
                  <a
                    href={(request as any).licensePDF}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-2 text-blue-400 hover:text-blue-300 bg-blue-900/20 px-3 py-2 rounded-lg transition-colors duration-200"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span>View License PDF</span>
                  </a>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <button
                onClick={() => handleViewRequest(request)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition-colors duration-200"
              >
                View Details
              </button>

              {request.status === 'pending' && (
                <div className="flex space-x-3">
                  <button
                    onClick={() => approveRequest(request)}
                    disabled={processing === request.id}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 rounded-lg transition-colors duration-200"
                  >
                    {processing === request.id ? 'Processing...' : 'Approve & Make Host'}
                  </button>
                  <button
                    onClick={() => rejectRequest(request)}
                    disabled={processing === request.id}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 rounded-lg transition-colors duration-200"
                  >
                    {processing === request.id ? 'Processing...' : 'Reject'}
                  </button>
                </div>
              )}
            </div>

            {request.status !== 'pending' && (
              <div className="text-center py-2">
                <span className="text-gray-400 text-sm">
                  Request has been {request.status}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {requests.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-purple-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">No Host Requests</h3>
          <p className="text-gray-400">No pending host requests at this time.</p>
        </div>
      )}

      {/* Host Request Review Modal */}
      {selectedRequest && (
        <HostRequestReviewModal
          request={selectedRequest}
          isOpen={showReviewModal}
          onClose={handleCloseModal}
          onStatusUpdate={handleStatusUpdate}
        />
      )}
    </div>
  );
};

export default HostRequests;
