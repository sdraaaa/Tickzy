/**
 * EventStatus Component
 * 
 * Displays visual status indicators for events based on their date/time
 * Shows "LIVE", "UPCOMING", "PAST", etc. with appropriate styling
 */

import React from 'react';
import { isEventPast, isEventToday, getTimeUntilEvent } from '../../utils/dateUtils';

interface EventStatusProps {
  eventDate: string;
  eventTime: string;
  className?: string;
  showTimeRemaining?: boolean;
}

const EventStatus: React.FC<EventStatusProps> = ({
  eventDate,
  eventTime,
  className = '',
  showTimeRemaining = false
}) => {
  const isPast = isEventPast(eventDate, eventTime);
  const isToday = isEventToday(eventDate);
  const timeUntil = getTimeUntilEvent(eventDate, eventTime);

  // Determine status and styling
  let status = '';
  let statusClass = '';
  let icon = '';

  if (isPast) {
    status = 'PAST';
    statusClass = 'bg-gray-600 text-gray-300 border-gray-500';
    icon = '⏰';
  } else if (isToday) {
    if (timeUntil && timeUntil.hours <= 2) {
      status = 'STARTING SOON';
      statusClass = 'bg-orange-600 text-white border-orange-500 animate-pulse';
      icon = '🔥';
    } else {
      status = 'TODAY';
      statusClass = 'bg-blue-600 text-white border-blue-500';
      icon = '📅';
    }
  } else {
    status = 'UPCOMING';
    statusClass = 'bg-green-600 text-white border-green-500';
    icon = '🎯';
  }

  return (
    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${statusClass} ${className}`}>
      <span>{icon}</span>
      <span>{status}</span>
      {showTimeRemaining && timeUntil && !isPast && (
        <span className="ml-1 text-xs opacity-90">
          {timeUntil.days > 0 && `${timeUntil.days}d `}
          {timeUntil.hours > 0 && `${timeUntil.hours}h `}
          {timeUntil.days === 0 && timeUntil.hours === 0 && `${timeUntil.minutes}m`}
        </span>
      )}
    </div>
  );
};

export default EventStatus;
