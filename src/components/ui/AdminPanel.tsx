/**
 * AdminPanel Component
 * 
 * Admin dashboard with platform management tools
 * Used for admin users - no HeroSection or Explore Events
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const AdminPanel: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Sample admin data
  const platformStats = {
    totalUsers: 1247,
    totalEvents: 89,
    totalRevenue: 45670,
    pendingEvents: 12
  };

  const recentUsers = [
    { id: '1', name: 'John Doe', email: 'john@example.com', role: 'user', joinDate: '2024-12-01' },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'host', joinDate: '2024-12-02' },
    { id: '3', name: 'Bob Wilson', email: 'bob@example.com', role: 'user', joinDate: '2024-12-03' }
  ];

  const pendingEvents = [
    { id: '1', title: 'New Year Party', host: 'Party Planners Inc', date: '2024-12-31', status: 'pending' },
    { id: '2', title: 'Business Summit', host: 'Corp Events', date: '2024-12-28', status: 'pending' }
  ];

  return (
    <div className="min-h-screen bg-black py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Admin Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Admin Dashboard
          </h1>
          <p className="text-xl text-gray-400">
            Manage platform operations and oversee all activities
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-neutral-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Users</p>
                <p className="text-3xl font-bold text-white">{platformStats.totalUsers}</p>
                <p className="text-green-400 text-xs">+12% this month</p>
              </div>
              <div className="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-neutral-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Events</p>
                <p className="text-3xl font-bold text-white">{platformStats.totalEvents}</p>
                <p className="text-green-400 text-xs">+8 this week</p>
              </div>
              <div className="w-12 h-12 bg-purple-600/20 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-neutral-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Revenue</p>
                <p className="text-3xl font-bold text-white">${platformStats.totalRevenue.toLocaleString()}</p>
                <p className="text-green-400 text-xs">+18% this month</p>
              </div>
              <div className="w-12 h-12 bg-green-600/20 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-neutral-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Pending Events</p>
                <p className="text-3xl font-bold text-white">{platformStats.pendingEvents}</p>
                <p className="text-yellow-400 text-xs">5 urgent</p>
              </div>
              <div className="w-12 h-12 bg-yellow-600/20 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Management Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Recent Users */}
          <div className="bg-neutral-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">Recent Users</h3>
              <button
                onClick={() => navigate('/manage-users')}
                className="text-purple-400 hover:text-purple-300 font-medium transition-colors duration-200"
              >
                View All →
              </button>
            </div>
            <div className="space-y-3">
              {recentUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-3 hover:bg-gray-700 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm">{user.name[0]}</span>
                    </div>
                    <div>
                      <p className="text-white font-medium">{user.name}</p>
                      <p className="text-gray-400 text-sm">{user.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      user.role === 'host' ? 'bg-green-900/50 text-green-300' : 'bg-blue-900/50 text-blue-300'
                    }`}>
                      {user.role}
                    </span>
                    <p className="text-gray-400 text-xs mt-1">{user.joinDate}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pending Events */}
          <div className="bg-neutral-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">Pending Events</h3>
              <span className="bg-yellow-900/50 text-yellow-300 px-3 py-1 rounded-full text-sm">
                {pendingEvents.length} Pending
              </span>
            </div>
            <div className="space-y-3">
              {pendingEvents.map((event) => (
                <div key={event.id} className="p-3 hover:bg-gray-700 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-white font-medium">{event.title}</h4>
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-900/50 text-yellow-300">
                      Pending
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm">Host: {event.host}</p>
                  <p className="text-gray-400 text-sm">Date: {event.date}</p>
                  <div className="flex space-x-2 mt-3">
                    <button className="bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-1 rounded transition-colors duration-200">
                      Approve
                    </button>
                    <button className="bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-1 rounded transition-colors duration-200">
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-neutral-800 rounded-xl p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">User Management</h3>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/manage-users')}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 rounded-lg transition-colors duration-200"
              >
                Manage All Users
              </button>
              <button
                onClick={() => navigate('/assign-roles')}
                className="w-full border border-gray-600 text-gray-300 hover:text-white hover:border-gray-500 font-medium py-2 rounded-lg transition-colors duration-200"
              >
                Assign Roles
              </button>
            </div>
          </div>

          <div className="bg-neutral-800 rounded-xl p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Event Management</h3>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/event-moderation')}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 rounded-lg transition-colors duration-200"
              >
                Event Moderation
              </button>
              <button
                onClick={() => navigate('/all-events')}
                className="w-full border border-gray-600 text-gray-300 hover:text-white hover:border-gray-500 font-medium py-2 rounded-lg transition-colors duration-200"
              >
                View All Events
              </button>
            </div>
          </div>

          <div className="bg-neutral-800 rounded-xl p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Platform Settings</h3>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/platform-settings')}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 rounded-lg transition-colors duration-200"
              >
                Platform Settings
              </button>
              <button
                onClick={() => navigate('/analytics')}
                className="w-full border border-gray-600 text-gray-300 hover:text-white hover:border-gray-500 font-medium py-2 rounded-lg transition-colors duration-200"
              >
                View Analytics
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
