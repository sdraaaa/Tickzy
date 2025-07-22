/**
 * ExploreEvents Component
 * 
 * Event discovery section with filters and booking functionality
 * Used in the dashboard for users and hosts
 */

import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const ExploreEvents: React.FC = () => {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Sample events data
  const events = [
    {
      id: '1',
      title: 'Summer Music Festival',
      date: 'Dec 20, 2024',
      time: '6:00 PM',
      location: 'City Park',
      price: 25,
      category: 'music',
      image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400',
      description: 'Join us for an amazing night of live music under the stars.'
    },
    {
      id: '2',
      title: 'Tech Conference 2024',
      date: 'Dec 15, 2024',
      time: '9:00 AM',
      location: 'Convention Center',
      price: 50,
      category: 'tech',
      image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400',
      description: 'Learn about the latest trends in technology and innovation.'
    },
    {
      id: '3',
      title: 'Art Exhibition',
      date: 'Dec 25, 2024',
      time: '2:00 PM',
      location: 'Art Gallery',
      price: 15,
      category: 'art',
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
      description: 'Discover contemporary art from local and international artists.'
    },
    {
      id: '4',
      title: 'Food & Wine Festival',
      date: 'Dec 30, 2024',
      time: '12:00 PM',
      location: 'Downtown Plaza',
      price: 35,
      category: 'food',
      image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400',
      description: 'Taste amazing dishes and wines from local restaurants and wineries.'
    },
    {
      id: '5',
      title: 'Basketball Championship',
      date: 'Jan 5, 2025',
      time: '7:00 PM',
      location: 'Sports Arena',
      price: 40,
      category: 'sports',
      image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400',
      description: 'Watch the most exciting basketball games of the season.'
    },
    {
      id: '6',
      title: 'Comedy Night',
      date: 'Jan 10, 2025',
      time: '8:00 PM',
      location: 'Comedy Club',
      price: 20,
      category: 'entertainment',
      image: 'https://images.unsplash.com/photo-1527224857830-43a7acc85260?w=400',
      description: 'Laugh out loud with the best comedians in town.'
    }
  ];

  const categories = [
    { id: 'all', name: 'All Events' },
    { id: 'music', name: 'Music' },
    { id: 'tech', name: 'Technology' },
    { id: 'art', name: 'Art & Culture' },
    { id: 'food', name: 'Food & Drink' },
    { id: 'sports', name: 'Sports' },
    { id: 'entertainment', name: 'Entertainment' }
  ];

  const filteredEvents = selectedCategory === 'all' 
    ? events 
    : events.filter(event => event.category === selectedCategory);

  const handleBookEvent = (eventId: string) => {
    // TODO: Implement booking modal/flow
    alert(`Booking event ${eventId} - Feature coming soon!`);
  };

  return (
    <section id="explore-events" className="py-16 bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">Explore Events</h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Discover amazing events happening near you
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-6 py-3 rounded-full text-sm font-medium transition-all duration-200 ${
                selectedCategory === category.id
                  ? 'bg-purple-600 text-white shadow-lg transform scale-105'
                  : 'bg-neutral-800 text-gray-300 hover:text-white hover:bg-neutral-700'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredEvents.map((event) => (
            <div key={event.id} className="bg-neutral-800 rounded-xl overflow-hidden border border-gray-700 hover:border-purple-500/50 transition-all duration-300 transform hover:scale-105">
              <div className="relative h-48">
                <img
                  src={event.image}
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 right-3">
                  <span className="bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-medium shadow-lg">
                    ${event.price}
                  </span>
                </div>
              </div>

              <div className="p-6">
                <h3 className="text-xl font-semibold text-white mb-2">{event.title}</h3>
                <p className="text-gray-400 text-sm mb-4 line-clamp-2">{event.description}</p>

                <div className="space-y-2 mb-6">
                  <div className="flex items-center text-gray-400 text-sm">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {event.date} at {event.time}
                  </div>
                  <div className="flex items-center text-gray-400 text-sm">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {event.location}
                  </div>
                </div>

                <button
                  onClick={() => handleBookEvent(event.id)}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium py-3 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
                >
                  Book Now
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredEvents.length === 0 && (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-purple-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-2xl font-semibold text-white mb-2">No Events Found</h3>
            <p className="text-gray-400">Try selecting a different category to discover more events.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default ExploreEvents;
