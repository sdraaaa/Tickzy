/**
 * MyDashboard Page
 * 
 * Personal dashboard for users and hosts showing their specific tools:
 * - Users: Upcoming bookings, past bookings
 * - Hosts: My created events, create new event button
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const MyDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, userData } = useAuth();

  if (!user || !userData) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // User Dashboard Content
  const UserDashboardContent = () => {
    // Sample bookings data
    const upcomingBookings = [
      {
        id: '1',
        eventTitle: 'Tech Conference 2024',
        date: 'Dec 15, 2024',
        time: '9:00 AM',
        location: 'Convention Center',
        ticketCount: 2,
        status: 'confirmed' as const
      },
      {
        id: '2',
        eventTitle: 'Summer Music Festival',
        date: 'Dec 20, 2024',
        time: '6:00 PM',
        location: 'City Park',
        ticketCount: 1,
        status: 'pending' as const
      }
    ];

    const getStatusColor = (status: string) => {
      return status === 'confirmed'
        ? 'bg-green-900/50 text-green-300 border-green-700'
        : 'bg-yellow-900/50 text-yellow-300 border-yellow-700';
    };

    const getStatusIcon = (status: string) => {
      return status === 'confirmed' ? '✓' : '⏳';
    };

    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome back, {user?.displayName || user?.email?.split('@')[0]}! 👋
          </h1>
          <p className="text-gray-400">Manage your bookings and discover new events</p>
        </div>

        {/* Upcoming Bookings */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Your Upcoming Bookings</h2>
            <button
              onClick={() => navigate('/my-bookings')}
              className="text-purple-400 hover:text-purple-300 font-medium transition-colors duration-200"
            >
              View All →
            </button>
          </div>

          {upcomingBookings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingBookings.map((booking) => (
                <div key={booking.id} className="bg-neutral-800 rounded-xl p-6 border border-gray-700 hover:border-purple-500/50 transition-all duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(booking.status)}`}>
                      {getStatusIcon(booking.status)} {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </span>
                    <span className="text-gray-400 text-sm">{booking.ticketCount} ticket{booking.ticketCount !== 1 ? 's' : ''}</span>
                  </div>

                  <h3 className="text-lg font-semibold text-white mb-2">
                    {booking.eventTitle}
                  </h3>

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
                  </div>

                  <div className="flex space-x-2">
                    {booking.status === 'confirmed' && (
                      <button className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 text-sm">
                        View Ticket
                      </button>
                    )}
                    <button className="flex-1 border border-gray-600 text-gray-300 hover:text-white hover:border-gray-500 font-medium py-2 px-4 rounded-lg transition-colors duration-200 text-sm">
                      Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-neutral-800 rounded-xl p-12 border border-gray-700 text-center">
              <div className="w-16 h-16 bg-purple-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No Upcoming Bookings</h3>
              <p className="text-gray-400 mb-6">
                You haven't booked any events yet. Explore amazing events happening near you!
              </p>
              <button
                onClick={() => navigate('/dashboard')}
                className="bg-purple-600 hover:bg-purple-700 text-white font-medium px-6 py-3 rounded-lg transition-colors duration-200"
              >
                Explore Events
              </button>
            </div>
          )}
        </section>
      </div>
    );
  };

  // Host Dashboard Content
  const HostDashboardContent = () => {
    // Sample host events data
    const hostEvents = [
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
        title: 'Tech Conference 2024',
        date: 'Dec 15, 2024',
        location: 'Convention Center',
        status: 'draft',
        ticketsSold: 0,
        totalTickets: 150,
        revenue: 0,
        image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400'
      }
    ];

    const getStatusColor = (status: string) => {
      switch (status) {
        case 'published': return 'bg-green-900/50 text-green-300 border-green-700';
        case 'draft': return 'bg-yellow-900/50 text-yellow-300 border-yellow-700';
        default: return 'bg-gray-900/50 text-gray-300 border-gray-700';
      }
    };

    const getStatusIcon = (status: string) => {
      switch (status) {
        case 'published': return '✓';
        case 'draft': return '📝';
        default: return '?';
      }
    };

    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome back, {user?.displayName || user?.email?.split('@')[0]}! 👋
          </h1>
          <p className="text-gray-400">Manage your events and create amazing experiences</p>
        </div>



        {/* My Events */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">My Events</h2>
            <button
              onClick={() => navigate('/my-events')}
              className="text-purple-400 hover:text-purple-300 font-medium transition-colors duration-200"
            >
              Manage All →
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hostEvents.map((event) => (
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


          </div>
        </section>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-black">
      {userData?.role === 'user' && <UserDashboardContent />}
      {userData?.role === 'host' && <HostDashboardContent />}
      
      {/* Fallback for unknown roles */}
      {userData && !['user', 'host'].includes(userData.role) && (
        <div className="text-white p-8 text-center">
          <p>This page is only available for users and hosts.</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="mt-4 bg-purple-600 hover:bg-purple-700 text-white font-medium px-6 py-3 rounded-lg transition-colors duration-200"
          >
            Go to Dashboard
          </button>
        </div>
      )}
    </div>
  );
};

export default MyDashboard;
