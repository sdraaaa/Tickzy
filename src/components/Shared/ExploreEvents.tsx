/**
 * ExploreEvents Component
 * 
 * Horizontal scrollable event carousel
 * Displays event cards in a BookMyShow-style layout
 */

import React from 'react';
import EventCard from './EventCard';

interface Event {
  id: string;
  title: string;
  date: string;
  location: string;
  price: string;
  image: string;
}

interface ExploreEventsProps {
  title: string;
  events?: Event[];
}

const ExploreEvents: React.FC<ExploreEventsProps> = ({ title, events }) => {
  // Sample events data
  const sampleEvents: Event[] = events || [
    {
      id: '1',
      title: 'Tech Conference 2024',
      date: 'Dec 15, 2024',
      location: 'Convention Center',
      price: '$99',
      image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400'
    },
    {
      id: '2',
      title: 'Summer Music Festival',
      date: 'Dec 20, 2024',
      location: 'City Park',
      price: '$75',
      image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400'
    },
    {
      id: '3',
      title: 'Art & Design Workshop',
      date: 'Dec 25, 2024',
      location: 'Art Studio',
      price: '$45',
      image: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400'
    },
    {
      id: '4',
      title: 'Food Festival',
      date: 'Dec 30, 2024',
      location: 'Downtown Square',
      price: '$25',
      image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400'
    },
    {
      id: '5',
      title: 'Comedy Night',
      date: 'Jan 5, 2025',
      location: 'Comedy Club',
      price: '$35',
      image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400'
    },
    {
      id: '6',
      title: 'Startup Pitch Event',
      date: 'Jan 10, 2025',
      location: 'Business Center',
      price: '$50',
      image: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=400'
    }
  ];

  return (
    <section className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-white">
            {title}
          </h2>
          <button className="text-purple-400 hover:text-purple-300 font-medium transition-colors duration-200">
            View All →
          </button>
        </div>

        {/* Horizontal Scrollable Container */}
        <div className="relative">
          <div className="flex overflow-x-auto gap-6 scrollbar-hide pb-4">
            {sampleEvents.map((event) => (
              <div key={event.id} className="flex-none w-80">
                <EventCard
                  title={event.title}
                  date={event.date}
                  location={event.location}
                  price={event.price}
                  image={event.image}
                />
              </div>
            ))}
          </div>
          
          {/* Scroll Indicators */}
          <div className="absolute top-1/2 -left-4 transform -translate-y-1/2 hidden lg:block">
            <button className="w-12 h-12 bg-neutral-800 hover:bg-neutral-700 rounded-full flex items-center justify-center text-white shadow-lg transition-colors duration-200">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          </div>
          <div className="absolute top-1/2 -right-4 transform -translate-y-1/2 hidden lg:block">
            <button className="w-12 h-12 bg-neutral-800 hover:bg-neutral-700 rounded-full flex items-center justify-center text-white shadow-lg transition-colors duration-200">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile scroll hint */}
        <div className="md:hidden text-center mt-4">
          <p className="text-gray-400 text-sm">← Swipe to see more events →</p>
        </div>
      </div>

      {/* Custom CSS for hiding scrollbar is handled via inline styles above */}
    </section>
  );
};

export default ExploreEvents;
