/**
 * MyBookings Page
 * 
 * Full booking management page with QR codes, cancellation options,
 * and detailed booking history
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface Booking {
  id: string;
  eventTitle: string;
  date: string;
  time: string;
  location: string;
  ticketCount: number;
  status: 'confirmed' | 'pending' | 'cancelled';
  qrCode: string;
  bookingDate: string;
  totalAmount: number;
  eventImage: string;
}

const MyBookings: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  // Sample bookings data
  const allBookings: Booking[] = [
    {
      id: '1',
      eventTitle: 'Tech Conference 2024',
      date: 'Dec 15, 2024',
      time: '9:00 AM',
      location: 'Convention Center',
      ticketCount: 2,
      status: 'confirmed',
      qrCode: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzAwMCIvPjxyZWN0IHg9IjEwIiB5PSIxMCIgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiBmaWxsPSIjZmZmIi8+PC9zdmc+',
      bookingDate: 'Nov 20, 2024',
      totalAmount: 198,
      eventImage: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400'
    },
    {
      id: '2',
      eventTitle: 'Summer Music Festival',
      date: 'Dec 20, 2024',
      time: '6:00 PM',
      location: 'City Park',
      ticketCount: 1,
      status: 'pending',
      qrCode: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzAwMCIvPjxyZWN0IHg9IjE1IiB5PSIxNSIgd2lkdGg9IjcwIiBoZWlnaHQ9IjcwIiBmaWxsPSIjZmZmIi8+PC9zdmc+',
      bookingDate: 'Nov 25, 2024',
      totalAmount: 75,
      eventImage: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400'
    },
    {
      id: '3',
      eventTitle: 'Art Workshop',
      date: 'Nov 30, 2024',
      time: '2:00 PM',
      location: 'Art Studio',
      ticketCount: 1,
      status: 'confirmed',
      qrCode: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzAwMCIvPjxyZWN0IHg9IjIwIiB5PSIyMCIgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjZmZmIi8+PC9zdmc+',
      bookingDate: 'Nov 15, 2024',
      totalAmount: 45,
      eventImage: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400'
    }
  ];

  const upcomingBookings = allBookings.filter(booking => 
    new Date(booking.date) > new Date() || booking.status === 'pending'
  );
  
  const pastBookings = allBookings.filter(booking => 
    new Date(booking.date) <= new Date() && booking.status !== 'pending'
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-900/50 text-green-300 border-green-700';
      case 'pending': return 'bg-yellow-900/50 text-yellow-300 border-yellow-700';
      case 'cancelled': return 'bg-red-900/50 text-red-300 border-red-700';
      default: return 'bg-gray-900/50 text-gray-300 border-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return '✓';
      case 'pending': return '⏳';
      case 'cancelled': return '✗';
      default: return '?';
    }
  };

  const handleCancelBooking = (bookingId: string) => {
    // In real app, this would make an API call
    console.log('Cancelling booking:', bookingId);
    // Show confirmation dialog, then update booking status
  };

  const currentBookings = activeTab === 'upcoming' ? upcomingBookings : pastBookings;

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="bg-neutral-900 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">My Bookings</h1>
              <p className="text-gray-400 mt-1">Manage your event tickets and bookings</p>
            </div>
            <button
              onClick={() => navigate('/')}
              className="text-purple-400 hover:text-purple-300 font-medium transition-colors duration-200"
            >
              ← Back to Home
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="flex space-x-1 bg-neutral-800 rounded-lg p-1 mb-8 w-fit">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`px-6 py-3 rounded-md font-medium transition-colors duration-200 ${
              activeTab === 'upcoming'
                ? 'bg-purple-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Upcoming ({upcomingBookings.length})
          </button>
          <button
            onClick={() => setActiveTab('past')}
            className={`px-6 py-3 rounded-md font-medium transition-colors duration-200 ${
              activeTab === 'past'
                ? 'bg-purple-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Past Events ({pastBookings.length})
          </button>
        </div>

        {/* Bookings List */}
        {currentBookings.length > 0 ? (
          <div className="space-y-6">
            {currentBookings.map((booking) => (
              <div key={booking.id} className="bg-neutral-800 rounded-xl border border-gray-700 overflow-hidden">
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                    {/* Event Info */}
                    <div className="flex items-start space-x-4 mb-4 lg:mb-0">
                      <img
                        src={booking.eventImage}
                        alt={booking.eventTitle}
                        className="w-20 h-20 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-xl font-semibold text-white">{booking.eventTitle}</h3>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(booking.status)}`}>
                            {getStatusIcon(booking.status)} {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-400">
                          <div className="flex items-center">
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {booking.date} at {booking.time}
                          </div>
                          <div className="flex items-center">
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {booking.location}
                          </div>
                          <div className="flex items-center">
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                            </svg>
                            {booking.ticketCount} ticket{booking.ticketCount !== 1 ? 's' : ''} • ${booking.totalAmount}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-3">
                      {booking.status === 'confirmed' && (
                        <button
                          onClick={() => setSelectedBooking(booking)}
                          className="bg-purple-600 hover:bg-purple-700 text-white font-medium px-6 py-2 rounded-lg transition-colors duration-200"
                        >
                          View QR Code
                        </button>
                      )}
                      <button className="border border-gray-600 text-gray-300 hover:text-white hover:border-gray-500 font-medium px-6 py-2 rounded-lg transition-colors duration-200">
                        Details
                      </button>
                      {booking.status !== 'cancelled' && activeTab === 'upcoming' && (
                        <button
                          onClick={() => handleCancelBooking(booking.id)}
                          className="border border-red-600 text-red-400 hover:bg-red-600 hover:text-white font-medium px-6 py-2 rounded-lg transition-colors duration-200"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="bg-neutral-800 rounded-xl p-12 border border-gray-700 text-center">
            <div className="w-16 h-16 bg-purple-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              No {activeTab} bookings
            </h3>
            <p className="text-gray-400 mb-6">
              {activeTab === 'upcoming' 
                ? "You don't have any upcoming events. Explore amazing events happening near you!"
                : "You haven't attended any events yet. Start exploring!"
              }
            </p>
            <button 
              onClick={() => navigate('/explore')}
              className="bg-purple-600 hover:bg-purple-700 text-white font-medium px-6 py-3 rounded-lg transition-colors duration-200"
            >
              Explore Events
            </button>
          </div>
        )}
      </div>

      {/* QR Code Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-neutral-800 rounded-xl p-8 max-w-md w-full border border-gray-700">
            <div className="text-center">
              <h3 className="text-xl font-bold text-white mb-4">{selectedBooking.eventTitle}</h3>
              <div className="bg-white p-4 rounded-lg mb-4 inline-block">
                <img 
                  src={selectedBooking.qrCode} 
                  alt="QR Code" 
                  className="w-32 h-32"
                />
              </div>
              <p className="text-gray-400 text-sm mb-6">
                Show this QR code at the event entrance
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setSelectedBooking(null)}
                  className="flex-1 border border-gray-600 text-gray-300 hover:text-white hover:border-gray-500 font-medium py-3 rounded-lg transition-colors duration-200"
                >
                  Close
                </button>
                <button className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 rounded-lg transition-colors duration-200">
                  Download
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBookings;
