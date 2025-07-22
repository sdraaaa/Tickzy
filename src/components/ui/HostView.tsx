/**
 * HostView Component
 * 
 * Dashboard view for event hosts
 * Features: Event management, analytics, booking history
 */

import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import StatsCard from './StatsCard';

const HostView: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-green-900/50 to-emerald-900/50 rounded-xl p-8 border border-green-500/20">
        <h1 className="text-3xl font-bold text-white mb-2">
          Host Dashboard
        </h1>
        <p className="text-green-200">
          Manage your events and connect with your audience, {user?.displayName || user?.email?.split('@')[0]}.
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatsCard 
          title="Total Events"
          value="12"
          change="+2 this month"
          color="green"
          icon="📅"
        />
        <StatsCard 
          title="Active Events"
          value="3"
          change="2 upcoming"
          color="blue"
          icon="🎯"
        />
        <StatsCard 
          title="Total Revenue"
          value="$4,250"
          change="+15% this month"
          color="purple"
          icon="💰"
        />
        <StatsCard 
          title="Attendees"
          value="847"
          change="+23% this month"
          color="orange"
          icon="👥"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Primary Content */}
        <div className="xl:col-span-2 space-y-8">
          {/* Create Event Section */}
          <div className="bg-neutral-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Create New Event</h2>
            </div>
            
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg p-6 text-center">
              <div className="text-4xl mb-4">🎉</div>
              <h3 className="text-xl font-bold text-white mb-2">Ready to host your next event?</h3>
              <p className="text-green-100 mb-6">Create engaging experiences for your audience</p>
              <button className="bg-white text-green-600 font-bold px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                Create Event
              </button>
            </div>
          </div>

          {/* Your Events */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Your Events</h2>
              <button className="text-green-400 hover:text-green-300 font-medium">
                View All →
              </button>
            </div>
            
            <div className="space-y-4">
              {/* Event Item */}
              <div className="bg-neutral-800 rounded-lg p-6 border border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-green-600 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">🎵</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">Summer Music Festival</h3>
                      <p className="text-gray-400">Dec 20, 2024 • City Park</p>
                      <div className="flex items-center space-x-4 mt-2">
                        <span className="text-green-400 text-sm">✓ Published</span>
                        <span className="text-gray-400 text-sm">156 tickets sold</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-white">$3,120</div>
                    <div className="text-gray-400 text-sm">Revenue</div>
                  </div>
                </div>
              </div>

              {/* Event Item */}
              <div className="bg-neutral-800 rounded-lg p-6 border border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">💻</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">Tech Conference 2024</h3>
                      <p className="text-gray-400">Dec 15, 2024 • Convention Center</p>
                      <div className="flex items-center space-x-4 mt-2">
                        <span className="text-yellow-400 text-sm">⏳ Draft</span>
                        <span className="text-gray-400 text-sm">0 tickets sold</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-white">$0</div>
                    <div className="text-gray-400 text-sm">Revenue</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-neutral-800 rounded-xl p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full bg-green-600 hover:bg-green-700 text-white p-3 rounded-lg transition-colors duration-200 text-left">
                <div className="font-medium">Create Event</div>
                <div className="text-green-200 text-sm">Start planning your event</div>
              </button>
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg transition-colors duration-200 text-left">
                <div className="font-medium">View Analytics</div>
                <div className="text-blue-200 text-sm">Track performance</div>
              </button>
              <button className="w-full bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-lg transition-colors duration-200 text-left">
                <div className="font-medium">Manage Bookings</div>
                <div className="text-purple-200 text-sm">Handle reservations</div>
              </button>
            </div>
          </div>

          {/* Recent Bookings */}
          <div className="bg-neutral-800 rounded-xl p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Recent Bookings</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-900/30 border border-green-700 rounded-lg">
                <div>
                  <div className="text-green-300 text-sm font-medium">Summer Music Festival</div>
                  <div className="text-green-200 text-xs">2 tickets • $40</div>
                </div>
                <div className="text-green-400 text-xs">2h ago</div>
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-900/30 border border-blue-700 rounded-lg">
                <div>
                  <div className="text-blue-300 text-sm font-medium">Tech Conference 2024</div>
                  <div className="text-blue-200 text-xs">1 ticket • $99</div>
                </div>
                <div className="text-blue-400 text-xs">5h ago</div>
              </div>
            </div>
          </div>

          {/* Performance */}
          <div className="bg-neutral-800 rounded-xl p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">This Month</h3>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-400">Events Created:</span>
                <span className="text-white font-medium">2</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Tickets Sold:</span>
                <span className="text-white font-medium">156</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Revenue:</span>
                <span className="text-white font-medium">$3,120</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Growth:</span>
                <span className="text-green-400 font-medium">+15%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HostView;
