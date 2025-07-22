/**
 * BookingCard Component
 * 
 * Reusable card component for displaying booking information
 */

import React from 'react';

interface BookingCardProps {
  eventTitle: string;
  date: string;
  time: string;
  ticketCount: number;
  status: 'confirmed' | 'pending' | 'cancelled';
}

const BookingCard: React.FC<BookingCardProps> = ({ 
  eventTitle, 
  date, 
  time, 
  ticketCount, 
  status 
}) => {
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

  return (
    <div className="bg-neutral-800 rounded-lg p-6 border border-gray-700 hover:border-purple-500/50 transition-all duration-300">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-white">{eventTitle}</h3>
            <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(status)}`}>
              {getStatusIcon(status)} {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
          </div>
          
          <div className="flex items-center space-x-6 text-gray-400 text-sm">
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {date}
            </div>
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {time}
            </div>
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
              </svg>
              {ticketCount} ticket{ticketCount !== 1 ? 's' : ''}
            </div>
          </div>
        </div>
        
        <div className="ml-6 flex space-x-2">
          <button className="text-purple-400 hover:text-purple-300 font-medium text-sm transition-colors">
            View Details
          </button>
          {status === 'confirmed' && (
            <button className="text-gray-400 hover:text-white font-medium text-sm transition-colors">
              Download Ticket
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingCard;
