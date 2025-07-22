/**
 * Explore Events Page
 * 
 * Public page showing all available events with filters
 * Accessible to both authenticated and unauthenticated users
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ExploreEvents: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState('all');

  const handleBackToHome = () => {
    // Navigate to dashboard if authenticated, otherwise to landing page
    navigate(user ? '/dashboard' : '/');
  };

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
    }
  ];

  const categories = [
    { id: 'all', name: 'All Events' },
    { id: 'music', name: 'Music' },
    { id: 'tech', name: 'Technology' },
    { id: 'art', name: 'Art & Culture' },
    { id: 'sports', name: 'Sports' }
  ];

  const filteredEvents = selectedCategory === 'all' 
    ? events 
    : events.filter(event => event.category === selectedCategory);

  const handleBookEvent = (eventId: string) => {
    if (!user) {
      // Redirect to login if not authenticated
      navigate('/login');
      return;
    }
    
    // TODO: Implement booking flow
    alert(`Booking event ${eventId} - Feature coming soon!`);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="bg-neutral-900 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Explore Events</h1>
              <p className="text-gray-400 mt-2">Discover amazing events happening near you</p>
            </div>
            <button
              onClick={handleBackToHome}
              className="text-purple-400 hover:text-purple-300 font-medium transition-colors duration-200"
            >
              ← Back to Home
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-wrap gap-3">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
                selectedCategory === category.id
                  ? 'bg-purple-600 text-white'
                  : 'bg-neutral-800 text-gray-300 hover:text-white hover:bg-neutral-700'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Events Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredEvents.map((event) => (
            <div key={event.id} className="bg-neutral-800 rounded-xl overflow-hidden border border-gray-700 hover:border-purple-500/50 transition-all duration-300">
              <div className="relative h-48">
                <img
                  src={event.image}
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 right-3">
                  <span className="bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                    ${event.price}
                  </span>
                </div>
              </div>

              <div className="p-6">
                <h3 className="text-xl font-semibold text-white mb-2">{event.title}</h3>
                <p className="text-gray-400 text-sm mb-4">{event.description}</p>

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
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 rounded-lg transition-colors duration-200"
                >
                  {user ? 'Book Now' : 'Sign In to Book'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredEvents.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-purple-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No Events Found</h3>
            <p className="text-gray-400">Try selecting a different category.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExploreEvents;
