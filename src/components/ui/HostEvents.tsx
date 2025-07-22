/**
 * HostEvents Component
 * 
 * Shows host's created events, management tools, and create new event CTA
 * Used in the My Dashboard tab for hosts
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const HostEvents: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'published' | 'draft' | 'past'>('published');

  // Sample host events data
  const publishedEvents = [
    {
      id: '1',
      title: 'Summer Music Festival',
      date: 'Dec 20, 2024',
      location: 'City Park',
      status: 'published',
      ticketsSold: 156,
      totalTickets: 200,
      revenue: 3120,
      image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400'
    },
    {
      id: '2',
      title: 'Food & Wine Festival',
      date: 'Dec 30, 2024',
      location: 'Downtown Plaza',
      status: 'published',
      ticketsSold: 89,
      totalTickets: 150,
      revenue: 3115,
      image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400'
    }
  ];

  const draftEvents = [
    {
      id: '3',
      title: 'Tech Conference 2025',
      date: 'Jan 15, 2025',
      location: 'Convention Center',
      status: 'draft',
      ticketsSold: 0,
      totalTickets: 300,
      revenue: 0,
      image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400'
    }
  ];

  const pastEvents = [
    {
      id: '4',
      title: 'Halloween Party 2024',
      date: 'Oct 31, 2024',
      location: 'Event Hall',
      status: 'completed',
      ticketsSold: 180,
      totalTickets: 180,
      revenue: 3600,
      image: 'https://images.unsplash.com/photo-1509557965043-6e4b26c5c2b4?w=400'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-900/50 text-green-300 border-green-700';
      case 'draft': return 'bg-yellow-900/50 text-yellow-300 border-yellow-700';
      case 'completed': return 'bg-blue-900/50 text-blue-300 border-blue-700';
      default: return 'bg-gray-900/50 text-gray-300 border-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'published': return '✓';
      case 'draft': return '📝';
      case 'completed': return '🎉';
      default: return '?';
    }
  };

  const getCurrentEvents = () => {
    switch (activeTab) {
      case 'published': return publishedEvents;
      case 'draft': return draftEvents;
      case 'past': return pastEvents;
      default: return [];
    }
  };

  const currentEvents = getCurrentEvents();

  return (
    <section className="py-16 bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with Create Event Button */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-12">
          <div className="text-center md:text-left mb-6 md:mb-0">
            <h2 className="text-4xl font-bold text-white mb-4">My Events</h2>
            <p className="text-xl text-gray-400">
              Manage your events and track performance
            </p>
          </div>
          <button
            onClick={() => navigate('/create-event')}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold px-8 py-4 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg whitespace-nowrap"
          >
            + Create New Event
          </button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-neutral-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-white">{publishedEvents.length}</div>
                <div className="text-gray-400 text-sm">Published Events</div>
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
                <div className="text-2xl font-bold text-white">
                  {publishedEvents.reduce((sum, event) => sum + event.ticketsSold, 0)}
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
                  ${publishedEvents.reduce((sum, event) => sum + event.revenue, 0).toLocaleString()}
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

        {/* Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-neutral-800 rounded-lg p-1 flex">
            <button
              onClick={() => setActiveTab('published')}
              className={`px-6 py-3 rounded-md text-sm font-medium transition-all duration-200 ${
                activeTab === 'published'
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Published ({publishedEvents.length})
            </button>
            <button
              onClick={() => setActiveTab('draft')}
              className={`px-6 py-3 rounded-md text-sm font-medium transition-all duration-200 ${
                activeTab === 'draft'
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Drafts ({draftEvents.length})
            </button>
            <button
              onClick={() => setActiveTab('past')}
              className={`px-6 py-3 rounded-md text-sm font-medium transition-all duration-200 ${
                activeTab === 'past'
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Past Events ({pastEvents.length})
            </button>
          </div>
        </div>

        {/* Events Grid */}
        {currentEvents.length > 0 ? (
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
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(event.status)}`}>
                      {getStatusIcon(event.status)} {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                    </span>
                  </div>
                </div>

                <div className="p-4">
                  <h4 className="text-lg font-semibold text-white mb-2">{event.title}</h4>

                  <div className="space-y-1 mb-4">
                    <div className="flex items-center text-gray-400 text-sm">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {event.date}
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
                      <div className="text-lg font-bold text-white">{event.ticketsSold}</div>
                      <div className="text-gray-400 text-xs">Sold</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-white">{event.totalTickets}</div>
                      <div className="text-gray-400 text-xs">Total</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-white">${event.revenue}</div>
                      <div className="text-gray-400 text-xs">Revenue</div>
                    </div>
                  </div>

                  <button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 rounded-lg transition-colors duration-200">
                    Manage Event
                  </button>
                </div>
              </div>
            ))}

            {/* Add Event Card - Only show in published/draft tabs */}
            {(activeTab === 'published' || activeTab === 'draft') && (
              <div className="bg-neutral-800 rounded-xl border-2 border-dashed border-gray-600 hover:border-purple-500 transition-all duration-300 flex items-center justify-center h-64">
                <button
                  onClick={() => navigate('/create-event')}
                  className="text-center p-6"
                >
                  <div className="w-16 h-16 bg-purple-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-semibold text-white mb-2">Create New Event</h4>
                  <p className="text-gray-400 text-sm">Start planning your next amazing event</p>
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-purple-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-2xl font-semibold text-white mb-2">
              No {activeTab === 'published' ? 'Published' : activeTab === 'draft' ? 'Draft' : 'Past'} Events
            </h3>
            <p className="text-gray-400 mb-6">
              {activeTab === 'draft' 
                ? "No draft events found. Start creating your next event!"
                : activeTab === 'past'
                ? "No past events to show. Your completed events will appear here."
                : "No published events yet. Create and publish your first event!"
              }
            </p>
            <button
              onClick={() => navigate('/create-event')}
              className="bg-purple-600 hover:bg-purple-700 text-white font-medium px-6 py-3 rounded-lg transition-colors duration-200"
            >
              Create New Event
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default HostEvents;
