/**
 * HostEvents Component
 *
 * Shows host's created events, management tools, and create new event CTA
 * Used in the My Dashboard tab for hosts
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getEventsByHost } from '../../services/firestore';
import { Event } from '../../types';
import { isEventPast } from '../../utils/dateUtils';

const HostEvents: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'active' | 'pending' | 'past'>('active');
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch host events from Firestore
  useEffect(() => {
    const fetchEvents = async () => {
      if (!user) return;

      setLoading(true);
      try {
        const hostEvents = await getEventsByHost(user.uid, user.email || undefined);
        setEvents(hostEvents);
      } catch (error) {
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [user]);

  // Filter events by status and tab
  // Define statuses more comprehensively
  const pastStatuses = ['completed', 'ended', 'cancelled', 'expired', 'rejected', 'declined'];
  const pendingStatuses = ['pending', 'draft', 'submitted', 'under_review'];
  const activeStatuses = ['approved', 'published', 'active', 'live', 'open'];

  // Helper function to check if event has completely passed (date + time)
  const isEventDatePast = (eventDate: string, eventTime: string): boolean => {
    return isEventPast(eventDate, eventTime);
  };

  // Active events: not past by status AND not past by date+time AND not pending
  const activeEvents = events.filter(event => {
    const status = event.status?.toLowerCase() || '';
    const isPastByStatus = pastStatuses.some(s => s.toLowerCase() === status);
    const isPastByDate = isEventDatePast(event.date, event.time);
    const isPending = pendingStatuses.some(s => s.toLowerCase() === status);

    // Event is active if it's not past (by status OR date+time) and not pending
    return !isPastByStatus && !isPastByDate && !isPending;
  });

  // Pending events: pending, draft (events waiting for approval) AND not past by date+time
  const pendingEvents = events.filter(event => {
    const isPastByDate = isEventDatePast(event.date, event.time);
    const isPending = pendingStatuses.includes(event.status);

    // Event is pending if it has pending status AND date+time hasn't passed
    return isPending && !isPastByDate;
  });

  // Past events: past by status OR past by date+time
  const pastEvents = events.filter(event => {
    const status = event.status?.toLowerCase() || '';
    const isPastByStatus = pastStatuses.some(s => s.toLowerCase() === status);
    const isPastByDate = isEventDatePast(event.date, event.time);

    // Event is past if it's past by status OR past by date+time
    return isPastByStatus || isPastByDate;
  });





  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
      case 'approved':
      case 'active':
        return 'bg-green-900/50 text-green-300 border-green-700';
      case 'draft':
      case 'pending':
        return 'bg-yellow-900/50 text-yellow-300 border-yellow-700';
      case 'completed':
      case 'ended':
        return 'bg-blue-900/50 text-blue-300 border-blue-700';
      case 'cancelled':
        return 'bg-red-900/50 text-red-300 border-red-700';
      default:
        return 'bg-gray-900/50 text-gray-300 border-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'published':
      case 'approved':
      case 'active':
        return '✓';
      case 'draft':
      case 'pending':
        return '📝';
      case 'completed':
      case 'ended':
        return '🎉';
      case 'cancelled':
        return '❌';
      default:
        return '?';
    }
  };

  const getCurrentEvents = () => {
    switch (activeTab) {
      case 'active': return activeEvents;
      case 'pending': return pendingEvents;
      case 'past': return pastEvents;
      default: return [];
    }
  };

  const currentEvents = getCurrentEvents();



  return (
    <section id="my-dashboard" className="py-16 bg-black scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center md:text-left mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">My Events</h2>
          <p className="text-xl text-gray-400">
            Manage your events and track performance
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
            <span className="ml-4 text-white">Loading events...</span>
          </div>
        )}

        {/* Quick Stats */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-neutral-800 rounded-xl p-6 border border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-white">{activeEvents.length}</div>
                  <div className="text-gray-400 text-sm">Active Events</div>
                </div>
                <div className="w-12 h-12 bg-green-600/20 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-neutral-800 rounded-xl p-6 border border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-white">{pendingEvents.length}</div>
                  <div className="text-gray-400 text-sm">Pending Approval</div>
                </div>
                <div className="w-12 h-12 bg-yellow-600/20 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-neutral-800 rounded-xl p-6 border border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-white">
                    {activeEvents.reduce((sum, event) => sum + (event.ticketsSold || 0), 0)}
                  </div>
                  <div className="text-gray-400 text-sm">Total Tickets Sold</div>
                </div>
                <div className="w-12 h-12 bg-purple-600/20 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-neutral-800 rounded-xl p-6 border border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-white">
                    ${activeEvents.reduce((sum, event) => sum + (event.revenue || 0), 0).toLocaleString()}
                  </div>
                  <div className="text-gray-400 text-sm">Total Revenue</div>
                </div>
                <div className="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-neutral-800 rounded-lg p-1 flex">
            <button
              onClick={() => setActiveTab('active')}
              className={`px-6 py-3 rounded-md text-sm font-medium transition-all duration-200 ${
                activeTab === 'active'
                  ? 'bg-green-600 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Active Events ({activeEvents.length})
            </button>
            <button
              onClick={() => setActiveTab('pending')}
              className={`px-6 py-3 rounded-md text-sm font-medium transition-all duration-200 ${
                activeTab === 'pending'
                  ? 'bg-yellow-600 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Pending Events ({pendingEvents.length})
            </button>
            <button
              onClick={() => setActiveTab('past')}
              className={`px-6 py-3 rounded-md text-sm font-medium transition-all duration-200 ${
                activeTab === 'past'
                  ? 'bg-gray-600 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Past Events ({pastEvents.length})
            </button>
          </div>
        </div>

        {/* Events Grid */}
        {!loading && currentEvents.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentEvents.map((event) => (
              <div key={event.id} className="bg-neutral-800 rounded-xl overflow-hidden border border-gray-700 hover:border-purple-500/50 transition-all duration-300">
                <div className="relative h-32">
                  <img
                    src={event.image}
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 right-3">
                    {(() => {
                      const isPastByDate = isEventDatePast(event.date);
                      const displayStatus = isPastByDate ? 'Event Ended' : event.status.charAt(0).toUpperCase() + event.status.slice(1);
                      const statusColor = isPastByDate ? 'bg-red-600/20 text-red-400 border-red-600/30' : getStatusColor(event.status);
                      const statusIcon = isPastByDate ? '🏁' : getStatusIcon(event.status);

                      return (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${statusColor}`}>
                          {statusIcon} {displayStatus}
                        </span>
                      );
                    })()}
                  </div>
                </div>

                <div className="p-4">
                  <h4 className="text-lg font-semibold text-white mb-2">{event.title}</h4>

                  <div className="space-y-1 mb-4">
                    <div className="flex items-center text-gray-400 text-sm">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {new Date(event.date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center text-gray-400 text-sm">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {event.location}
                    </div>
                  </div>

                  <div className="flex justify-between items-center mb-4">
                    <div className="text-center">
                      <div className="text-lg font-bold text-white">{event.ticketsSold || 0}</div>
                      <div className="text-gray-400 text-xs">Sold</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-white">
                        {event.seatsLeft !== undefined && event.seatsLeft !== null
                          ? event.seatsLeft
                          : Math.max(0, (event.totalTickets || event.capacity || 0) - (event.ticketsSold || 0))
                        }
                      </div>
                      <div className="text-gray-400 text-xs">Left</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-white">${event.revenue || 0}</div>
                      <div className="text-gray-400 text-xs">Revenue</div>
                    </div>
                  </div>

                  <button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 rounded-lg transition-colors duration-200">
                    Manage Event
                  </button>
                </div>
              </div>
            ))}


          </div>
        )}

        {/* Empty State */}
        {!loading && currentEvents.length === 0 && (
          <div className="text-center py-16">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${
              activeTab === 'active' ? 'bg-green-600/20' :
              activeTab === 'pending' ? 'bg-yellow-600/20' : 'bg-gray-600/20'
            }`}>
              <svg className={`w-10 h-10 ${
                activeTab === 'active' ? 'text-green-400' :
                activeTab === 'pending' ? 'text-yellow-400' : 'text-gray-400'
              }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {activeTab === 'pending' ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                )}
              </svg>
            </div>
            <h3 className="text-2xl font-semibold text-white mb-2">
              No {activeTab === 'active' ? 'Active' : activeTab === 'pending' ? 'Pending' : 'Past'} Events
            </h3>
            <p className="text-gray-400 mb-6">
              {activeTab === 'active'
                ? "No active events yet. Your approved events will appear here once they're live."
                : activeTab === 'pending'
                ? "No pending events. Use the Create Event button in the navigation bar to create your first event!"
                : "No past events to show. Your completed events will appear here."
              }
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default HostEvents;
