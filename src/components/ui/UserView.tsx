/**
 * UserView Component
 * 
 * Dashboard view for regular users
 * Features: Event browsing, booking management, notifications
 */

import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import EventCard from './EventCard';
import BookingCard from './BookingCard';

const UserView: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 rounded-xl p-8 border border-purple-500/20">
        <h1 className="text-3xl font-bold text-white mb-2">
          Hi, {user?.displayName || user?.email?.split('@')[0]}!
        </h1>
        <p className="text-purple-200">
          Welcome to your dashboard. Discover amazing events happening around you.
        </p>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Primary Content */}
        <div className="xl:col-span-2 space-y-8">
          {/* Explore Events Section */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Explore Events</h2>
              <button className="text-purple-400 hover:text-purple-300 font-medium">
                View All →
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <EventCard 
                title="Tech Conference 2024"
                date="Dec 15, 2024"
                location="Convention Center"
                price="$99"
                image="https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400"
              />
              <EventCard 
                title="Music Festival"
                date="Dec 20, 2024"
                location="City Park"
                price="$75"
                image="https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400"
              />
              <EventCard 
                title="Art Workshop"
                date="Dec 25, 2024"
                location="Art Studio"
                price="$45"
                image="https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400"
              />
              <EventCard 
                title="Food Festival"
                date="Dec 30, 2024"
                location="Downtown Square"
                price="$25"
                image="https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400"
              />
            </div>
          </div>

          {/* Upcoming Bookings */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Upcoming Bookings</h2>
            <div className="space-y-4">
              <BookingCard 
                eventTitle="Tech Conference 2024"
                date="Dec 15, 2024"
                time="9:00 AM"
                ticketCount={2}
                status="confirmed"
              />
              <BookingCard 
                eventTitle="Music Festival"
                date="Dec 20, 2024"
                time="6:00 PM"
                ticketCount={1}
                status="pending"
              />
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-neutral-800 rounded-xl p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-lg transition-colors duration-200 text-left">
                <div className="font-medium">Browse Events</div>
                <div className="text-purple-200 text-sm">Find events near you</div>
              </button>
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg transition-colors duration-200 text-left">
                <div className="font-medium">My Tickets</div>
                <div className="text-blue-200 text-sm">View your bookings</div>
              </button>
              <button className="w-full bg-green-600 hover:bg-green-700 text-white p-3 rounded-lg transition-colors duration-200 text-left">
                <div className="font-medium">Favorites</div>
                <div className="text-green-200 text-sm">Saved events</div>
              </button>
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-neutral-800 rounded-xl p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Notifications</h3>
            <div className="space-y-3">
              <div className="p-3 bg-blue-900/30 border border-blue-700 rounded-lg">
                <div className="text-blue-300 text-sm font-medium">Event Reminder</div>
                <div className="text-blue-200 text-xs mt-1">Tech Conference starts in 3 days</div>
              </div>
              <div className="p-3 bg-green-900/30 border border-green-700 rounded-lg">
                <div className="text-green-300 text-sm font-medium">Booking Confirmed</div>
                <div className="text-green-200 text-xs mt-1">Music Festival tickets confirmed</div>
              </div>
              <div className="text-gray-400 text-sm text-center py-4">
                No more notifications
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-neutral-800 rounded-xl p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center text-gray-300">
                <div className="w-2 h-2 bg-purple-400 rounded-full mr-3"></div>
                <div>Viewed Tech Conference 2024</div>
              </div>
              <div className="flex items-center text-gray-300">
                <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                <div>Booked Music Festival tickets</div>
              </div>
              <div className="flex items-center text-gray-300">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                <div>Added Art Workshop to favorites</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserView;
