/**
 * UserBookings Component
 * 
 * Shows user's bookings, history, and ticket management
 * Used in the My Dashboard tab for users
 */

import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const UserBookings: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');

  // Sample bookings data
  const upcomingBookings = [
    {
      id: '1',
      eventTitle: 'Tech Conference 2024',
      date: 'Dec 15, 2024',
      time: '9:00 AM',
      location: 'Convention Center',
      ticketCount: 2,
      status: 'confirmed' as const,
      totalAmount: 100,
      bookingDate: '2024-11-20',
      image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400'
    },
    {
      id: '2',
      eventTitle: 'Summer Music Festival',
      date: 'Dec 20, 2024',
      time: '6:00 PM',
      location: 'City Park',
      ticketCount: 1,
      status: 'pending' as const,
      totalAmount: 25,
      bookingDate: '2024-11-22',
      image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400'
    }
  ];

  const pastBookings = [
    {
      id: '3',
      eventTitle: 'Art Exhibition Opening',
      date: 'Nov 15, 2024',
      time: '7:00 PM',
      location: 'Downtown Gallery',
      ticketCount: 2,
      status: 'attended' as const,
      totalAmount: 30,
      bookingDate: '2024-11-01',
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400'
    },
    {
      id: '4',
      eventTitle: 'Comedy Night',
      date: 'Oct 28, 2024',
      time: '8:00 PM',
      location: 'Comedy Club',
      ticketCount: 1,
      status: 'attended' as const,
      totalAmount: 20,
      bookingDate: '2024-10-15',
      image: 'https://images.unsplash.com/photo-1527224857830-43a7acc85260?w=400'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-900/50 text-green-300 border-green-700';
      case 'pending': return 'bg-yellow-900/50 text-yellow-300 border-yellow-700';
      case 'attended': return 'bg-blue-900/50 text-blue-300 border-blue-700';
      default: return 'bg-gray-900/50 text-gray-300 border-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return '✓';
      case 'pending': return '⏳';
      case 'attended': return '🎉';
      default: return '?';
    }
  };

  const currentBookings = activeTab === 'upcoming' ? upcomingBookings : pastBookings;

  return (
    <section className="py-16 bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">My Bookings</h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Manage your event tickets and booking history
          </p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-neutral-800 rounded-lg p-1 flex">
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`px-6 py-3 rounded-md text-sm font-medium transition-all duration-200 ${
                activeTab === 'upcoming'
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Upcoming Events ({upcomingBookings.length})
            </button>
            <button
              onClick={() => setActiveTab('past')}
              className={`px-6 py-3 rounded-md text-sm font-medium transition-all duration-200 ${
                activeTab === 'past'
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Past Events ({pastBookings.length})
            </button>
          </div>
        </div>

        {/* Bookings List */}
        {currentBookings.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {currentBookings.map((booking) => (
              <div key={booking.id} className="bg-neutral-800 rounded-xl overflow-hidden border border-gray-700 hover:border-purple-500/50 transition-all duration-300">
                <div className="flex">
                  {/* Event Image */}
                  <div className="w-32 h-32 flex-shrink-0">
                    <img
                      src={booking.image}
                      alt={booking.eventTitle}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Booking Details */}
                  <div className="flex-1 p-6">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-lg font-semibold text-white">{booking.eventTitle}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(booking.status)}`}>
                        {getStatusIcon(booking.status)} {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </span>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-gray-400 text-sm">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {booking.date} at {booking.time}
                      </div>
                      <div className="flex items-center text-gray-400 text-sm">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {booking.location}
                      </div>
                      <div className="flex items-center text-gray-400 text-sm">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                        </svg>
                        {booking.ticketCount} ticket{booking.ticketCount !== 1 ? 's' : ''} • ${booking.totalAmount}
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      {booking.status === 'confirmed' && activeTab === 'upcoming' && (
                        <button className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 text-sm">
                          View Ticket
                        </button>
                      )}
                      <button className="flex-1 border border-gray-600 text-gray-300 hover:text-white hover:border-gray-500 font-medium py-2 px-4 rounded-lg transition-colors duration-200 text-sm">
                        Details
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-purple-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
              </svg>
            </div>
            <h3 className="text-2xl font-semibold text-white mb-2">
              No {activeTab === 'upcoming' ? 'Upcoming' : 'Past'} Bookings
            </h3>
            <p className="text-gray-400 mb-6">
              {activeTab === 'upcoming' 
                ? "You haven't booked any events yet. Explore amazing events happening near you!"
                : "No past events to show. Start booking events to build your history!"
              }
            </p>
            {activeTab === 'upcoming' && (
              <button
                onClick={() => {
                  const exploreSection = document.getElementById('explore-events');
                  if (exploreSection) {
                    exploreSection.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="bg-purple-600 hover:bg-purple-700 text-white font-medium px-6 py-3 rounded-lg transition-colors duration-200"
              >
                Explore Events
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default UserBookings;
