/**
 * AdminView Component
 * 
 * Dashboard view for administrators
 * Features: User management, event moderation, platform analytics
 */

import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import StatsCard from './StatsCard';

const AdminView: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-red-900/50 to-orange-900/50 rounded-xl p-8 border border-red-500/20">
        <h1 className="text-3xl font-bold text-white mb-2">
          Admin Dashboard
        </h1>
        <p className="text-red-200">
          Manage users, events, and platform operations, {user?.displayName || user?.email?.split('@')[0]}.
        </p>
      </div>

      {/* Platform Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatsCard 
          title="Total Users"
          value="2,847"
          change="+12% this month"
          color="red"
          icon="👥"
        />
        <StatsCard 
          title="Active Events"
          value="156"
          change="+8 this week"
          color="orange"
          icon="📅"
        />
        <StatsCard 
          title="Platform Revenue"
          value="$28,450"
          change="+18% this month"
          color="green"
          icon="💰"
        />
        <StatsCard 
          title="Support Tickets"
          value="23"
          change="5 pending"
          color="blue"
          icon="🎫"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Primary Content */}
        <div className="xl:col-span-2 space-y-8">
          {/* Manage Users Table */}
          <div className="bg-neutral-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Manage Users</h2>
              <button className="text-red-400 hover:text-red-300 font-medium">
                View All →
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left text-gray-400 font-medium py-3">User</th>
                    <th className="text-left text-gray-400 font-medium py-3">Role</th>
                    <th className="text-left text-gray-400 font-medium py-3">Status</th>
                    <th className="text-left text-gray-400 font-medium py-3">Joined</th>
                    <th className="text-left text-gray-400 font-medium py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-700/50">
                    <td className="py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm">J</span>
                        </div>
                        <div>
                          <div className="text-white font-medium">john.doe@email.com</div>
                          <div className="text-gray-400 text-sm">John Doe</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4">
                      <span className="bg-purple-900/50 text-purple-300 px-2 py-1 rounded text-sm">User</span>
                    </td>
                    <td className="py-4">
                      <span className="bg-green-900/50 text-green-300 px-2 py-1 rounded text-sm">Verified</span>
                    </td>
                    <td className="py-4 text-gray-400">Dec 1, 2024</td>
                    <td className="py-4">
                      <button className="text-red-400 hover:text-red-300 text-sm">Edit</button>
                    </td>
                  </tr>
                  <tr className="border-b border-gray-700/50">
                    <td className="py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm">S</span>
                        </div>
                        <div>
                          <div className="text-white font-medium">sarah.host@email.com</div>
                          <div className="text-gray-400 text-sm">Sarah Host</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4">
                      <span className="bg-green-900/50 text-green-300 px-2 py-1 rounded text-sm">Host</span>
                    </td>
                    <td className="py-4">
                      <span className="bg-green-900/50 text-green-300 px-2 py-1 rounded text-sm">Verified</span>
                    </td>
                    <td className="py-4 text-gray-400">Nov 28, 2024</td>
                    <td className="py-4">
                      <button className="text-red-400 hover:text-red-300 text-sm">Edit</button>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-yellow-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm">M</span>
                        </div>
                        <div>
                          <div className="text-white font-medium">mike.new@email.com</div>
                          <div className="text-gray-400 text-sm">Mike New</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4">
                      <span className="bg-purple-900/50 text-purple-300 px-2 py-1 rounded text-sm">User</span>
                    </td>
                    <td className="py-4">
                      <span className="bg-yellow-900/50 text-yellow-300 px-2 py-1 rounded text-sm">Pending</span>
                    </td>
                    <td className="py-4 text-gray-400">Dec 5, 2024</td>
                    <td className="py-4">
                      <button className="text-red-400 hover:text-red-300 text-sm">Edit</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Event Approvals */}
          <div className="bg-neutral-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Event Approvals</h2>
              <span className="bg-orange-900/50 text-orange-300 px-3 py-1 rounded-full text-sm">3 Pending</span>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-orange-900/20 border border-orange-700 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center">
                    <span className="text-xl">🎵</span>
                  </div>
                  <div>
                    <h3 className="text-white font-medium">Winter Music Festival</h3>
                    <p className="text-gray-400 text-sm">by Sarah Host • Dec 30, 2024</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm">
                    Approve
                  </button>
                  <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm">
                    Reject
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Admin Tools */}
          <div className="bg-neutral-800 rounded-xl p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Admin Tools</h3>
            <div className="space-y-3">
              <button className="w-full bg-red-600 hover:bg-red-700 text-white p-3 rounded-lg transition-colors duration-200 text-left">
                <div className="font-medium">User Management</div>
                <div className="text-red-200 text-sm">Manage accounts & roles</div>
              </button>
              <button className="w-full bg-orange-600 hover:bg-orange-700 text-white p-3 rounded-lg transition-colors duration-200 text-left">
                <div className="font-medium">Event Moderation</div>
                <div className="text-orange-200 text-sm">Review & approve events</div>
              </button>
              <button className="w-full bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-lg transition-colors duration-200 text-left">
                <div className="font-medium">Platform Settings</div>
                <div className="text-purple-200 text-sm">Configure system</div>
              </button>
            </div>
          </div>

          {/* System Status */}
          <div className="bg-neutral-800 rounded-xl p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">System Status</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Platform:</span>
                <span className="text-green-400 flex items-center">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                  Online
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Database:</span>
                <span className="text-green-400 flex items-center">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                  Connected
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Storage:</span>
                <span className="text-green-400 flex items-center">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                  Healthy
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">API:</span>
                <span className="text-green-400 flex items-center">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                  Operational
                </span>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-neutral-800 rounded-xl p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center text-gray-300">
                <div className="w-2 h-2 bg-red-400 rounded-full mr-3"></div>
                <div>User john.doe@email.com verified</div>
              </div>
              <div className="flex items-center text-gray-300">
                <div className="w-2 h-2 bg-orange-400 rounded-full mr-3"></div>
                <div>Event "Winter Festival" submitted</div>
              </div>
              <div className="flex items-center text-gray-300">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                <div>Host sarah.host@email.com approved</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminView;
