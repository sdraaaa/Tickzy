import React from 'react';
import EventCard from './EventCard';

interface EventGridProps {
  events: Array<{
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
  }>;
  loading?: boolean;
}

const EventGrid: React.FC<EventGridProps> = ({ events, loading = false }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, index) => (
          <div key={index} className="card animate-pulse">
            <div className="h-48 bg-gray-200 rounded-t-2xl"></div>
            <div className="p-6 space-y-3">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {events.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
};

export default EventGrid;