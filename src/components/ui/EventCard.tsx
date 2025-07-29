/**
 * EventCard Component
 *
 * Reusable card component for displaying event information
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Event } from '../../types';
import { getDefaultEventImage } from '../../utils/defaultImage';

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
  return (
    <div
      className="bg-neutral-800 rounded-xl overflow-hidden border border-gray-700 hover:border-purple-500/50 transition-all duration-300 hover:transform hover:scale-105 group cursor-pointer"
      onClick={handleCardClick}
    >
      {/* Event Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={event.image}
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

        {/* Status Badge */}
        {event.status === 'cancelled' && (
          <div className="absolute top-4 left-4">
            <span className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-medium">
              Cancelled
            </span>
          </div>
        )}

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
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {event.location}
          </div>
        </div>

        {/* Dynamic Tags */}
        {event.tags && event.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {event.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="bg-purple-900/50 text-purple-300 px-2 py-1 rounded-full text-xs font-medium border border-purple-700/50"
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
