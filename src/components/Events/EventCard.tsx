import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Users, Star, Ticket, ImageIcon } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Event } from '@/services/eventsService';
import EventStatusBadge, { EventStatus } from './EventStatusBadge';

interface EventCardProps {
  event: Event;
  showBookButton?: boolean;
  showStatus?: boolean;
  onBookClick?: () => void;
}

const EventCard: React.FC<EventCardProps> = ({ event, showBookButton = false, showStatus = false, onBookClick }) => {
  const { currentUser } = useAuth();
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  // Helper function to safely render any value as string
  const safeRender = (value: any): string => {
    if (value === null || value === undefined) return '';
    if (typeof value === 'string' || typeof value === 'number') return String(value);
    if (typeof value === 'object') {
      // Handle Firebase Timestamp
      if (value.toDate && typeof value.toDate === 'function') {
        return value.toDate().toLocaleDateString();
      }
      // Handle Firebase GeoPoint or other objects
      if (value._lat !== undefined && value._long !== undefined) {
        return `${value._lat}, ${value._long}`;
      }
      // Handle other objects by converting to JSON or returning empty string
      return '';
    }
    return String(value);
  };

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoading(false);
  };

  return (
    <Link
      to={`/event/${event.id}`}
      className="block w-full max-w-sm mx-auto card card-hover group"
    >
      {/* Image Section */}
      <div className="relative h-48 overflow-hidden rounded-t-2xl bg-gray-200">
        {imageLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
          </div>
        )}

        {imageError ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <div className="text-center text-gray-400">
              <ImageIcon className="w-12 h-12 mx-auto mb-2" />
              <p className="text-sm">Image not available</p>
            </div>
          </div>
        ) : (
          <img
            src={event.image}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            onLoad={handleImageLoad}
            onError={handleImageError}
            style={{ display: imageLoading ? 'none' : 'block' }}
          />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        
        {/* Status and Popular Badges */}
        <div className="absolute top-4 left-4 flex flex-col space-y-2">
          {showStatus && event.status && (
            <EventStatusBadge
              status={event.status as EventStatus}
              size="sm"
            />
          )}
          {event.isPopular && (
            <div className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-medium">
              🔥 Popular
            </div>
          )}
        </div>
        
        {/* Category */}
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-gray-800 px-3 py-1 rounded-full text-xs font-medium">
          {safeRender(event.category)}
        </div>

        {/* Price */}
        <div className="absolute bottom-4 right-4 bg-primary-500 text-white px-4 py-2 rounded-xl font-bold">
          ${safeRender(event.price)}
        </div>
      </div>

      {/* Content Section */}
      <div className="p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-primary-500 transition-colors duration-300">
          {safeRender(event.title)}
        </h3>

        {/* Event Details */}
        <div className="space-y-3">
          <div className="flex items-center text-gray-600">
            <Calendar className="w-4 h-4 mr-3 text-primary-500" />
            <span className="text-sm">{safeRender(event.date)} • {safeRender(event.time)}</span>
          </div>

          <div className="flex items-center text-gray-600">
            <MapPin className="w-4 h-4 mr-3 text-primary-500" />
            <span className="text-sm truncate">{safeRender(event.location)}</span>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center text-gray-600">
              <Users className="w-4 h-4 mr-2 text-primary-500" />
              <span className="text-sm">{safeRender(event.attendees)} attending</span>
            </div>

            <div className="flex items-center">
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
              <span className="text-sm text-gray-600 ml-1">{safeRender(event.rating)}</span>
            </div>
          </div>

          {/* Book Ticket Button */}
          {showBookButton && (
            <div className="pt-4">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  if (currentUser?.email === 'aleemsidra2205@gmail.com') {
                    alert('Admins cannot book events. Admins are meant to manage and approve events, not book them as attendees.');
                    return;
                  }
                  if (onBookClick) {
                    onBookClick();
                  }
                }}
                disabled={currentUser?.email === 'aleemsidra2205@gmail.com'}
                className={`w-full py-2 px-4 rounded-xl font-medium transition-colors duration-300 flex items-center justify-center ${
                  currentUser?.email === 'aleemsidra2205@gmail.com'
                    ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                    : 'bg-primary-500 text-white hover:bg-primary-600'
                }`}
              >
                <Ticket className="w-4 h-4 mr-2" />
                {currentUser?.email === 'aleemsidra2205@gmail.com'
                  ? 'Admin - Cannot Book'
                  : currentUser
                    ? 'Book Ticket'
                    : 'Login to Book'
                }
              </button>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default EventCard;