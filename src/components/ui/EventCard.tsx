/**
 * EventCard Component
 *
 * Reusable card component for displaying event information
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Event } from '../../types';
import { getDefaultEventImage } from '../../utils/defaultImage';
import EventStatus from './EventStatus';
import { isEventPast } from '../../utils/dateUtils';

// Helper function to safely decode location
const decodeLocation = (encodedLocation: string): string => {
  try {
    return decodeURIComponent(encodedLocation);
  } catch (error) {
    // If decoding fails, return the original string
    return encodedLocation;
  }
};

interface EventCardProps {
  event: Event;
  onClick?: (eventId: string) => void;
}

const EventCard: React.FC<EventCardProps> = ({ event, onClick }) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    if (onClick) {
      onClick(event.id);
    } else {
      navigate(`/event/${event.id}`);
    }
  };

  const formatPrice = (price: number) => {
    return price === 0 ? 'Free' : `$${price}`;
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  // Get the banner image with fallback
  const getBannerImage = () => {
    // Prioritize bannerURL if available, fallback to image, then default
    if (event.bannerURL && event.bannerURL.trim()) {
      return event.bannerURL;
    }
    if (event.image && event.image.trim()) {
      return event.image;
    }
    return getDefaultEventImage();
  };

  // Don't render the card if no valid banner is available
  if (!event.bannerURL && !event.image) {
    console.warn(`Event ${event.id} has no banner image, skipping render`);
    return null;
  }
  return (
    <div
      className="bg-neutral-800 rounded-xl overflow-hidden border border-gray-700 hover:border-purple-500/50 transition-all duration-300 hover:transform hover:scale-105 group cursor-pointer"
      onClick={handleCardClick}
    >
      {/* Event Banner */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={getBannerImage()}
          alt={event.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          onError={(e) => {
            e.currentTarget.src = getDefaultEventImage();
          }}
        />
        <div className="absolute top-4 right-4">
          <span className="bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-medium">
            {formatPrice(event.price)}
          </span>
        </div>

        {/* Status Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          {/* Event Time Status */}
          <EventStatus
            eventDate={event.date}
            eventTime={event.time}
            showTimeRemaining={false}
          />

          {/* Cancellation Status */}
          {event.status === 'cancelled' && (
            <span className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-medium">
              Cancelled
            </span>
          )}

          {/* Past Event Overlay */}
          {isEventPast(event.date, event.time) && (
            <span className="bg-black/70 text-gray-300 px-3 py-1 rounded-full text-sm font-medium">
              Event Ended
            </span>
          )}
        </div>

        {event.seatsLeft === 0 && event.status !== 'cancelled' && (
          <div className="absolute top-4 left-4">
            <span className="bg-gray-600 text-white px-3 py-1 rounded-full text-sm font-medium">
              Sold Out
            </span>
          </div>
        )}
      </div>

      {/* Event Details */}
      <div className="p-6">
        <h3 className="text-lg font-bold text-white mb-2 group-hover:text-purple-400 transition-colors">
          {event.title}
        </h3>

        <div className="space-y-2 mb-4">
          <div className="flex items-center text-gray-400 text-sm">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {formatDate(event.date)} at {event.time}
          </div>
          <div className="flex items-center text-gray-400 text-sm">
            <span className="mr-2">📍</span>
            Location: {event.locationName || decodeLocation(event.location || '')}
          </div>
        </div>

        {/* Dynamic Tags */}
        {event.tags && event.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {event.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="bg-purple-700 text-white text-xs px-2 py-1 rounded-full mr-1"
              >
                {tag}
              </span>
            ))}
            {event.tags.length > 3 && (
              <span className="text-gray-400 text-xs px-2 py-1">
                +{event.tags.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Seats Left Indicator */}
        <div className="text-sm text-gray-400 mb-3">
          {event.seatsLeft > 0 ? (
            <span>{event.seatsLeft} seats left</span>
          ) : (
            <span className="text-red-400">No seats available</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventCard;
