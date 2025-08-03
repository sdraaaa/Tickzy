/**
 * AdminStatsModal Component
 * 
 * Interactive modal for displaying detailed admin statistics
 * Used for admin dashboard stat cards
 */

import React from 'react';

interface AdminStatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  type: 'total-events' | 'total-users' | 'total-revenue' | 'pending-events';
  data: any;
}

const AdminStatsModal: React.FC<AdminStatsModalProps> = ({ isOpen, onClose, title, type, data }) => {
  if (!isOpen) return null;

  const renderTotalEvents = () => (
    <div className="space-y-6">
      <div className="bg-neutral-700 rounded-lg p-6 border border-gray-600">
        <h4 className="text-white font-medium mb-4">Event Statistics</h4>
        <div className="grid grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-green-400">{data.published || 0}</div>
            <div className="text-gray-400 text-sm">Published</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-yellow-400">{data.pending || 0}</div>
            <div className="text-gray-400 text-sm">Pending</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-red-400">{data.rejected || 0}</div>
            <div className="text-gray-400 text-sm">Rejected</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-400">{data.draft || 0}</div>
            <div className="text-gray-400 text-sm">Drafts</div>
          </div>
        </div>
      </div>
      
      <div className="bg-neutral-700 rounded-lg p-4 border border-gray-600">
        <h4 className="text-white font-medium mb-3">Recent Activity</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">Events created today:</span>
            <span className="text-white">{data.createdToday || 0}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Events this week:</span>
            <span className="text-white">{data.createdThisWeek || 0}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Average per day:</span>
            <span className="text-white">{((data.createdThisWeek || 0) / 7).toFixed(1)}</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTotalUsers = () => (
    <div className="space-y-6">
      <div className="bg-neutral-700 rounded-lg p-6 border border-gray-600">
        <h4 className="text-white font-medium mb-4">User Breakdown</h4>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-blue-400">{data.users || 0}</div>
            <div className="text-gray-400 text-sm">Regular Users</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-400">{data.hosts || 0}</div>
            <div className="text-gray-400 text-sm">Event Hosts</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-400">{data.admins || 0}</div>
            <div className="text-gray-400 text-sm">Administrators</div>
          </div>
        </div>
      </div>

      <div className="bg-neutral-700 rounded-lg p-4 border border-gray-600">
        <h4 className="text-white font-medium mb-3">User Activity</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">New users today:</span>
            <span className="text-white">{data.newToday || 0}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">New users this week:</span>
            <span className="text-white">{data.newThisWeek || 0}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Active users:</span>
            <span className="text-white">{data.activeUsers || 0}</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTotalRevenue = () => (
    <div className="space-y-6">
      <div className="bg-neutral-700 rounded-lg p-6 border border-gray-600">
        <h4 className="text-white font-medium mb-4">Revenue Breakdown</h4>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-green-400">${(data.totalRevenue || 0).toLocaleString()}</div>
            <div className="text-gray-400 text-sm">Total Revenue</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-400">${(data.monthlyRevenue || 0).toLocaleString()}</div>
            <div className="text-gray-400 text-sm">This Month</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-400">${(data.avgPerEvent || 0).toFixed(0)}</div>
            <div className="text-gray-400 text-sm">Avg per Event</div>
          </div>
        </div>
      </div>

      <div className="bg-neutral-700 rounded-lg p-4 border border-gray-600">
        <h4 className="text-white font-medium mb-3">Revenue Trends</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">Growth this month:</span>
            <span className="text-green-400">+{data.monthlyGrowth || 0}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Top performing category:</span>
            <span className="text-white">{data.topCategory || 'Technology'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Platform fee collected:</span>
            <span className="text-white">${(data.platformFees || 0).toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPendingEvents = () => (
    <div className="space-y-6">
      <div className="bg-neutral-700 rounded-lg p-6 border border-gray-600">
        <h4 className="text-white font-medium mb-4">Pending Events Overview</h4>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-yellow-400">{data.total || 0}</div>
            <div className="text-gray-400 text-sm">Total Pending</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-red-400">{data.urgent || 0}</div>
            <div className="text-gray-400 text-sm">Urgent (>3 days)</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-400">{data.avgWaitTime || 0}</div>
            <div className="text-gray-400 text-sm">Avg Wait (hours)</div>
          </div>
        </div>
      </div>

      <div className="bg-neutral-700 rounded-lg p-4 border border-gray-600">
        <h4 className="text-white font-medium mb-3">Action Required</h4>
        <div className="space-y-3">
          <div className="flex justify-between items-center p-2 bg-neutral-600 rounded">
            <span className="text-white text-sm">Events pending > 24h</span>
            <span className="bg-red-600 text-white px-2 py-1 rounded text-xs">{data.over24h || 0}</span>
          </div>
          <div className="flex justify-between items-center p-2 bg-neutral-600 rounded">
            <span className="text-white text-sm">Events pending > 72h</span>
            <span className="bg-red-700 text-white px-2 py-1 rounded text-xs">{data.over72h || 0}</span>
          </div>
          <div className="flex justify-between items-center p-2 bg-neutral-600 rounded">
            <span className="text-white text-sm">High-value events</span>
            <span className="bg-purple-600 text-white px-2 py-1 rounded text-xs">{data.highValue || 0}</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (type) {
      case 'total-events':
        return renderTotalEvents();
      case 'total-users':
        return renderTotalUsers();
      case 'total-revenue':
        return renderTotalRevenue();
      case 'pending-events':
        return renderPendingEvents();
      default:
        return <div className="text-gray-400">No data available</div>;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-neutral-800 rounded-xl max-w-4xl w-full max-h-[80vh] overflow-hidden border border-gray-700">
        <div className="flex justify-between items-center p-6 border-b border-gray-700">
          <h3 className="text-xl font-bold text-white">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default AdminStatsModal;
