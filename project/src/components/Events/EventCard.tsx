import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Users, Star, Ticket } from 'lucide-react';

interface EventCardProps {
  event: {
    id: string;
    title: string;
    image: string;
    date: string;
    time: string;
    location: string;
    price: number;
    category: string;
    attendees: number;
    rating: number;
    isPopular?: boolean;
  };
  showBookButton?: boolean;
  onBookClick?: () => void;
}

const EventCard: React.FC<EventCardProps> = ({ event, showBookButton = false, onBookClick }) => {
  return (
    <Link
      to={`/event/${event.id}`}
      className="block w-full max-w-sm mx-auto card card-hover group"
    >
      {/* Image Section */}
      <div className="relative h-48 overflow-hidden rounded-t-2xl">
        <img
          src={event.image}
          alt={event.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        
        {/* Popular Badge */}
        {event.isPopular && (
          <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-medium">
            🔥 Popular
          </div>
        )}
        
        {/* Category */}
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-gray-800 px-3 py-1 rounded-full text-xs font-medium">
          {event.category}
        </div>
        
        {/* Price */}
        <div className="absolute bottom-4 right-4 bg-primary-500 text-white px-4 py-2 rounded-xl font-bold">
          ${event.price}
        </div>
      </div>

      {/* Content Section */}
      <div className="p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-primary-500 transition-colors duration-300">
          {event.title}
        </h3>

        {/* Event Details */}
        <div className="space-y-3">
          <div className="flex items-center text-gray-600">
            <Calendar className="w-4 h-4 mr-3 text-primary-500" />
            <span className="text-sm">{event.date} • {event.time}</span>
          </div>
          
          <div className="flex items-center text-gray-600">
            <MapPin className="w-4 h-4 mr-3 text-primary-500" />
            <span className="text-sm truncate">{event.location}</span>
          </div>
          
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center text-gray-600">
              <Users className="w-4 h-4 mr-2 text-primary-500" />
              <span className="text-sm">{event.attendees} attending</span>
            </div>
            
            <div className="flex items-center">
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
              <span className="text-sm text-gray-600 ml-1">{event.rating}</span>
            </div>
          </div>

          {/* Book Ticket Button */}
          {showBookButton && (
            <div className="pt-4">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  if (onBookClick) {
                    onBookClick();
                  }
                }}
                className="w-full bg-primary-500 text-white py-2 px-4 rounded-xl font-medium hover:bg-primary-600 transition-colors duration-300 flex items-center justify-center"
              >
                <Ticket className="w-4 h-4 mr-2" />
                Book Ticket
              </button>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default EventCard;