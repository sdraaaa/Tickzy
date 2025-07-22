/**
 * EventShowcase Component
 * 
 * Displays dummy event cards on the landing page
 * Booking attempts trigger login redirect for unauthenticated users
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import EventCard from '../ui/EventCard';

interface Event {
  id: string;
  title: string;
  date: string;
  location: string;
  price: string;
  image: string;
  category?: string;
}

const EventShowcase: React.FC = () => {
  const navigate = useNavigate();

  // Sample events for public display
  const showcaseEvents: Event[] = [
    {
      id: '1',
      title: 'Tech Conference 2024',
      date: 'Dec 15, 2024',
      location: 'Convention Center',
      price: '$99',
      image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400',
      category: 'Technology'
    },
    {
      id: '2',
      title: 'Summer Music Festival',
      date: 'Dec 20, 2024',
      location: 'City Park',
      price: '$75',
      image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400',
      category: 'Music'
    },
    {
      id: '3',
      title: 'Art & Design Workshop',
      date: 'Dec 25, 2024',
      location: 'Art Studio',
      price: '$45',
      image: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400',
      category: 'Workshop'
    },
    {
      id: '4',
      title: 'Food Festival',
      date: 'Dec 30, 2024',
      location: 'Downtown Square',
      price: '$25',
      image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400',
      category: 'Food'
    },
    {
      id: '5',
      title: 'Comedy Night',
      date: 'Jan 5, 2025',
      location: 'Comedy Club',
      price: '$35',
      image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400',
      category: 'Comedy'
    },
    {
      id: '6',
      title: 'Startup Pitch Event',
      date: 'Jan 10, 2025',
      location: 'Business Center',
      price: '$50',
      image: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=400',
      category: 'Business'
    }
  ];

  const handleEventClick = () => {
    // Redirect to login when trying to book an event
    navigate('/login');
  };

  return (
    <section className="py-16 bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Discover Amazing Events
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            From concerts to conferences, workshops to festivals - find your next unforgettable experience
          </p>
        </div>

        {/* Featured Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {showcaseEvents.slice(0, 6).map((event) => (
            <div key={event.id} onClick={handleEventClick} className="cursor-pointer">
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

        {/* Categories Section */}
        <div className="text-center mb-12">
          <h3 className="text-2xl font-bold text-white mb-8">Browse by Category</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[
              { name: 'Music', icon: '🎵', color: 'from-purple-500 to-pink-500' },
              { name: 'Technology', icon: '💻', color: 'from-blue-500 to-cyan-500' },
              { name: 'Food', icon: '🍕', color: 'from-orange-500 to-red-500' },
              { name: 'Art', icon: '🎨', color: 'from-green-500 to-teal-500' },
              { name: 'Sports', icon: '⚽', color: 'from-yellow-500 to-orange-500' },
              { name: 'Business', icon: '💼', color: 'from-gray-500 to-gray-600' }
            ].map((category) => (
              <button
                key={category.name}
                onClick={() => navigate('/login')}
                className={`bg-gradient-to-r ${category.color} rounded-xl p-6 text-white hover:scale-105 transition-transform duration-200`}
              >
                <div className="text-3xl mb-2">{category.icon}</div>
                <div className="font-semibold">{category.name}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <div className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 rounded-2xl p-12 border border-purple-500/20">
            <h3 className="text-3xl font-bold text-white mb-4">
              Ready to Start Your Journey?
            </h3>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Join thousands of event enthusiasts and discover experiences that matter to you
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/login')}
                className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-bold px-8 py-4 rounded-full text-lg transition-all duration-300 transform hover:scale-105 shadow-2xl"
              >
                Get Started
              </button>
              <button
                onClick={() => navigate('/about')}
                className="border-2 border-white text-white hover:bg-white hover:text-black font-semibold px-8 py-4 rounded-full text-lg transition-all duration-300"
              >
                Learn More
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EventShowcase;
