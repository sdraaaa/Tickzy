/**
 * EventManagement Component
 * 
 * Admin panel for managing events - approve, reject, cancel, delete
 */

import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { Event } from '../../types';
import { getDefaultEventImage } from '../../utils/defaultImage';
import EventReviewModal from './EventReviewModal';
import { notificationService } from '../../services/notificationService';

interface EventWithHost extends Event {
  hostEmail?: string;
  hostName?: string;
  venueProofPDF?: string;
  bannerURL?: string;
  locationName?: string;
  seatsLeft?: number;
}

const EventManagement: React.FC = () => {
  const [events, setEvents] = useState<EventWithHost[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<EventWithHost | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const eventsSnapshot = await getDocs(collection(db, 'events'));
      const usersSnapshot = await getDocs(collection(db, 'users'));

      // Create a map of user IDs to user data
      const usersMap = new Map();
      usersSnapshot.docs.forEach(doc => {
        usersMap.set(doc.id, doc.data());
      });

      const eventsData = eventsSnapshot.docs.map(doc => {
        const data = doc.data();

        // Handle location - could be string or GeoPoint
        let locationString = 'TBD';
        if (data.location) {
          if (typeof data.location === 'string') {
            locationString = data.location;
          } else if (data.location._lat !== undefined && data.location._long !== undefined) {
            // Handle Firebase GeoPoint
            locationString = `${data.location._lat}, ${data.location._long}`;
          } else if (data.location.latitude !== undefined && data.location.longitude !== undefined) {
            // Handle regular lat/lng object
            locationString = `${data.location.latitude}, ${data.location.longitude}`;
          } else {
            locationString = 'Location data available';
          }
        }

        // Handle date - could be Timestamp or string
        let dateString = new Date().toISOString();
        if (data.date) {
          if (typeof data.date === 'string') {
            dateString = data.date;
          } else if (data.date.toDate) {
            // Firebase Timestamp
            dateString = data.date.toDate().toISOString();
          } else if (data.date.seconds) {
            // Timestamp object
            dateString = new Date(data.date.seconds * 1000).toISOString();
          }
        }

        const eventData: EventWithHost = {
          id: doc.id,
          title: data.title || 'Untitled Event',
          description: data.description || '',
          date: dateString,
          time: data.time || '00:00',
          location: locationString,
          price: data.price || 0,
          capacity: data.capacity || 0,
          image: data.image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400',
          tags: Array.isArray(data.tags) ? data.tags : [],
          hostId: data.hostId || data.host_id || '',
          status: data.status || 'pending',
          ticketsSold: data.ticketsSold || 0,
          revenue: data.revenue || 0,
          createdAt: data.createdAt || data.created_at,
          updatedAt: data.updatedAt || data.updated_at,
          venueProofPDF: data.venueProofPDF || data.venueDocument || '',
          bannerURL: data.bannerURL || data.image || '',
          locationName: data.locationName || data.location || '',
          seatsLeft: data.seatsLeft || data.capacity || 0
        };

        // Get host information
        const hostData = usersMap.get(eventData.hostId);
        if (hostData) {
          eventData.hostEmail = hostData.email;
          eventData.hostName = hostData.displayName || hostData.name;
        }

        return eventData;
      });

      // Sort by creation date, newest first
      eventsData.sort((a, b) => {
        if (a.createdAt && b.createdAt) {
          const dateA = a.createdAt.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
          const dateB = b.createdAt.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
          return dateB.getTime() - dateA.getTime();
        }
        return 0;
      });


      setEvents(eventsData);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateEventStatus = async (eventId: string, newStatus: 'pending' | 'approved' | 'rejected' | 'cancelled') => {
    setUpdating(eventId);
    try {
      await updateDoc(doc(db, 'events', eventId), {
        status: newStatus,
        updatedAt: new Date()
      });

      // Update local state
      setEvents(events.map(event =>
        event.id === eventId ? { ...event, status: newStatus } : event
      ));


    } catch (error) {
      console.error('Error updating event status:', error);
    } finally {
      setUpdating(null);
    }
  };

  const handleViewEvent = (event: EventWithHost) => {
    setSelectedEvent(event);
    setShowReviewModal(true);
  };

  const handleCloseModal = () => {
    setSelectedEvent(null);
    setShowReviewModal(false);
  };

  const handleStatusUpdate = (eventId: string, newStatus: string) => {
    setEvents(events.map(event =>
      event.id === eventId ? { ...event, status: newStatus } : event
    ));
  };

  const deleteEvent = async (eventId: string) => {
    const eventToDelete = events.find(event => event.id === eventId);
    if (!eventToDelete) return;

    if (!confirm('Are you sure you want to delete this event? This action cannot be undone and will notify all affected users.')) {
      return;
    }

    setUpdating(eventId);
    try {
      // Send notifications before deleting the event
      await notificationService.notifyEventDeleted(
        eventId,
        eventToDelete.title,
        eventToDelete.hostId
      );

      // Delete the event from Firestore
      await deleteDoc(doc(db, 'events', eventId));

      // Update local state
      setEvents(events.filter(event => event.id !== eventId));

      console.log(`✅ Event "${eventToDelete.title}" deleted and notifications sent`);

    } catch (error) {
      console.error('Error deleting event:', error);
      alert('Failed to delete event. Please try again.');
    } finally {
      setUpdating(null);
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-600 text-white';
      case 'rejected': return 'bg-red-600 text-white';
      case 'cancelled': return 'bg-gray-600 text-white';
      case 'pending': return 'bg-yellow-600 text-white';
      default: return 'bg-purple-600 text-white';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-16">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
        <span className="ml-4 text-white">Loading events...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Event Management</h2>
        <button
          onClick={fetchEvents}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
        >
          Refresh
        </button>
      </div>

      <div className="bg-neutral-800 rounded-xl border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-900">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Event</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Host</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Date</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Documents</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Status</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {events.map((event) => (
                <tr key={event.id} className="hover:bg-neutral-700/50">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <img
                        src={event.image}
                        alt={event.title}
                        className="w-12 h-12 rounded-lg object-cover"
                        onError={(e) => {
                          e.currentTarget.src = getDefaultEventImage();
                        }}
                      />
                      <div>
                        <div className="text-white font-medium">{String(event.title)}</div>
                        <div className="text-gray-400 text-sm">{String(event.location)}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-white text-sm">
                        {String(event.hostName || 'Unknown')}
                      </div>
                      <div className="text-gray-400 text-xs">{String(event.hostEmail || '')}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-white text-sm">
                      {new Date(event.date).toLocaleDateString()}
                    </div>
                    <div className="text-gray-400 text-xs">{String(event.time)}</div>
                  </td>
                  <td className="px-6 py-4">
                    {(event as any).venueProofPDF ? (
                      <a
                        href={(event as any).venueProofPDF}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-1 text-blue-400 hover:text-blue-300 text-xs bg-blue-900/20 px-2 py-1 rounded"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span>Venue Proof</span>
                      </a>
                    ) : (
                      <span className="text-gray-500 text-xs">No document</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(event.status)}`}>
                      {event.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2 flex-wrap">
                      <button
                        onClick={() => handleViewEvent(event)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs font-medium transition-colors duration-200"
                      >
                        View
                      </button>

                      {event.status === 'pending' && (
                        <>
                          <button
                            onClick={() => updateEventStatus(event.id, 'approved')}
                            disabled={updating === event.id}
                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs font-medium transition-colors duration-200"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => updateEventStatus(event.id, 'rejected')}
                            disabled={updating === event.id}
                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs font-medium transition-colors duration-200"
                          >
                            Reject
                          </button>
                        </>
                      )}

                      {event.status === 'approved' && (
                        <button
                          onClick={() => updateEventStatus(event.id, 'cancelled')}
                          disabled={updating === event.id}
                          className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded text-xs font-medium transition-colors duration-200"
                        >
                          Cancel
                        </button>
                      )}

                      <button
                        onClick={() => deleteEvent(event.id)}
                        disabled={updating === event.id}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs font-medium transition-colors duration-200"
                      >
                        {updating === event.id ? '...' : 'Delete'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {events.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-purple-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">No Events Found</h3>
          <p className="text-gray-400">No events have been created yet.</p>
        </div>
      )}

      {/* Event Review Modal */}
      {selectedEvent && (
        <EventReviewModal
          event={selectedEvent}
          isOpen={showReviewModal}
          onClose={handleCloseModal}
          onStatusUpdate={handleStatusUpdate}
        />
      )}
    </div>
  );
};

export default EventManagement;
