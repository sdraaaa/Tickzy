/**
 * StatsModal Component
 * 
 * Interactive modal for displaying detailed statistics
 * Used for both host and admin dashboard stat cards
 */

import React from 'react';
import { Event } from '../../types';
import { isEventPast } from '../../utils/dateUtils';

interface StatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  type: 'active-events' | 'pending-events' | 'past-events' | 'tickets-sold' | 'revenue' | 'total-events' | 'total-users' | 'total-revenue';
  events?: Event[];
  data?: any;
}

const StatsModal: React.FC<StatsModalProps> = ({ isOpen, onClose, title, type, events = [], data }) => {
  if (!isOpen) return null;

  const renderActiveEvents = () => (
    <div className="space-y-4">
      <p className="text-gray-300 mb-4">Your currently active and published events</p>
      {events.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-400 mb-2">📅</div>
          <p className="text-gray-400">No active events found</p>
        </div>
      ) : (
        events.map((event) => (
          <div key={event.id} className="bg-neutral-700 rounded-lg p-4 border border-gray-600">
            <div className="flex justify-between items-start mb-2">
              <h4 className="text-white font-medium">{event.title}</h4>
              <span className="bg-green-600/20 text-green-400 px-2 py-1 rounded text-xs">
                {event.status}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-gray-400">Date</p>
                <p className="text-white">{new Date(event.date).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-gray-400">Tickets Sold</p>
                <p className="text-white">{event.ticketsSold || 0}</p>
              </div>
              <div>
                <p className="text-gray-400">Revenue</p>
                <p className="text-white">${event.revenue || 0}</p>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );

  const renderPendingEvents = () => (
    <div className="space-y-4">
      <p className="text-gray-300 mb-4">Events waiting for admin approval</p>
      {events.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-400 mb-2">⏳</div>
          <p className="text-gray-400">No pending events</p>
        </div>
      ) : (
        events.map((event) => (
          <div key={event.id} className="bg-neutral-700 rounded-lg p-4 border border-gray-600">
            <div className="flex justify-between items-start mb-2">
              <h4 className="text-white font-medium">{event.title}</h4>
              <span className="bg-yellow-600/20 text-yellow-400 px-2 py-1 rounded text-xs">
                {event.status}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-400">Submitted</p>
                <p className="text-white">{event.createdAt ? new Date(event.createdAt.toDate()).toLocaleDateString() : 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-400">Event Date</p>
                <p className="text-white">{new Date(event.date).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );

  const renderPastEvents = () => (
    <div className="space-y-4">
      <p className="text-gray-300 mb-4">Your completed events and their performance</p>
      {events.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-400 mb-2">📊</div>
          <p className="text-gray-400">No past events found</p>
        </div>
      ) : (
        events.map((event) => (
          <div key={event.id} className="bg-neutral-700 rounded-lg p-4 border border-gray-600">
            <div className="flex justify-between items-start mb-2">
              <h4 className="text-white font-medium">{event.title}</h4>
              <span className="bg-gray-600/20 text-gray-400 px-2 py-1 rounded text-xs">
                Completed
              </span>
            </div>
            <div className="grid grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-gray-400">Date</p>
                <p className="text-white">{new Date(event.date).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-gray-400">Capacity</p>
                <p className="text-white">{event.capacity || 0}</p>
              </div>
              <div>
                <p className="text-gray-400">Sold</p>
                <p className="text-white">{event.ticketsSold || 0}</p>
              </div>
              <div>
                <p className="text-gray-400">Revenue</p>
                <p className="text-white">${event.revenue || 0}</p>
              </div>
            </div>
            <div className="mt-2">
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>Fill Rate</span>
                <span>{Math.round(((event.ticketsSold || 0) / (event.capacity || 1)) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-600 rounded-full h-2">
                <div 
                  className="bg-purple-500 h-2 rounded-full" 
                  style={{ width: `${Math.min(((event.ticketsSold || 0) / (event.capacity || 1)) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );

  const renderTicketsSold = () => {
    const totalTickets = events.reduce((sum, event) => sum + (event.ticketsSold || 0), 0);
    const totalCapacity = events.reduce((sum, event) => sum + (event.capacity || 0), 0);
    const fillRate = totalCapacity > 0 ? (totalTickets / totalCapacity) * 100 : 0;

    return (
      <div className="space-y-6">
        <div className="bg-neutral-700 rounded-lg p-6 border border-gray-600">
          <h4 className="text-white font-medium mb-4">Ticket Sales Overview</h4>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-purple-400">{totalTickets}</div>
              <div className="text-gray-400 text-sm">Total Sold</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-400">{totalCapacity}</div>
              <div className="text-gray-400 text-sm">Total Capacity</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-400">{fillRate.toFixed(1)}%</div>
              <div className="text-gray-400 text-sm">Fill Rate</div>
            </div>
          </div>
        </div>
        
        <div className="space-y-3">
          <h4 className="text-white font-medium">Top Performing Events</h4>
          {events
            .filter(event => (event.ticketsSold || 0) > 0)
            .sort((a, b) => (b.ticketsSold || 0) - (a.ticketsSold || 0))
            .slice(0, 5)
            .map((event) => (
              <div key={event.id} className="bg-neutral-700 rounded-lg p-3 border border-gray-600">
                <div className="flex justify-between items-center">
                  <span className="text-white">{event.title}</span>
                  <div className="text-right">
                    <div className="text-purple-400 font-medium">{event.ticketsSold} tickets</div>
                    <div className="text-gray-400 text-xs">${event.revenue || 0} revenue</div>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    );
  };

  const renderRevenue = () => {
    const totalRevenue = events.reduce((sum, event) => sum + (event.revenue || 0), 0);
    const avgRevenuePerEvent = events.length > 0 ? totalRevenue / events.length : 0;
    const topEvent = events.reduce((max, event) => (event.revenue || 0) > (max.revenue || 0) ? event : max, events[0]);

    return (
      <div className="space-y-6">
        <div className="bg-neutral-700 rounded-lg p-6 border border-gray-600">
          <h4 className="text-white font-medium mb-4">Revenue Analytics</h4>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-green-400">${totalRevenue.toLocaleString()}</div>
              <div className="text-gray-400 text-sm">Total Revenue</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-400">${avgRevenuePerEvent.toFixed(0)}</div>
              <div className="text-gray-400 text-sm">Avg per Event</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-400">{events.length}</div>
              <div className="text-gray-400 text-sm">Total Events</div>
            </div>
          </div>
        </div>

        {topEvent && (
          <div className="bg-neutral-700 rounded-lg p-4 border border-gray-600">
            <h4 className="text-white font-medium mb-2">Top Revenue Event</h4>
            <div className="flex justify-between items-center">
              <div>
                <div className="text-white font-medium">{topEvent.title}</div>
                <div className="text-gray-400 text-sm">{new Date(topEvent.date).toLocaleDateString()}</div>
              </div>
              <div className="text-right">
                <div className="text-green-400 font-bold text-lg">${topEvent.revenue || 0}</div>
                <div className="text-gray-400 text-sm">{topEvent.ticketsSold} tickets sold</div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderContent = () => {
    switch (type) {
      case 'active-events':
        return renderActiveEvents();
      case 'pending-events':
        return renderPendingEvents();
      case 'past-events':
        return renderPastEvents();
      case 'tickets-sold':
        return renderTicketsSold();
      case 'revenue':
        return renderRevenue();
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

export default StatsModal;
