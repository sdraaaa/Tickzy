/**
 * EventShowcase Component
 *
 * Displays real events from Firebase on the landing page
 * Booking attempts trigger login redirect for unauthenticated users
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import EventCard from '../ui/EventCard';
import { getEvents } from '../../services/firestore';
import { Event } from '../../types';

const EventShowcase: React.FC = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch real events from Firebase
  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const fetchedEvents = await getEvents();

        // Additional client-side filtering for extra safety
        const now = new Date();
        now.setHours(0, 0, 0, 0);

        const validEvents = fetchedEvents.filter(event => {
          // Ensure event is published/approved
          const isPublished = event.status === 'approved' ||
                             event.status === 'published' ||
                             event.status === 'active';

          // Ensure event date hasn't passed
          const eventDate = new Date(event.date);
          const isUpcoming = eventDate >= now;

          // Ensure event is not cancelled/deleted
          const isValid = event.status !== 'cancelled' &&
                         event.status !== 'deleted' &&
                         event.status !== 'rejected';

          // Don't filter by seats on landing page - let users see all events
          // They'll get proper validation when trying to book

          return isPublished && isUpcoming && isValid;
        });

        console.log(`📅 Landing page: Found ${fetchedEvents.length} total events, ${validEvents.length} valid events`);

        // Limit to 6 events for the landing page showcase
        setEvents(validEvents.slice(0, 6));
      } catch (error) {
        console.error('Error fetching events for landing page:', error);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const handleEventClick = (eventId: string) => {
    // Navigate to event detail page
    navigate(`/event/${eventId}`);
  };

  // Manual refresh function for testing
  const refreshEvents = async () => {
    setLoading(true);
    try {
      const fetchedEvents = await getEvents();

      // Additional client-side filtering for extra safety
      const now = new Date();
      now.setHours(0, 0, 0, 0);

      const validEvents = fetchedEvents.filter(event => {
        const isPublished = event.status === 'approved' ||
                           event.status === 'published' ||
                           event.status === 'active';

        const eventDate = new Date(event.date);
        const isUpcoming = eventDate >= now;

        const isValid = event.status !== 'cancelled' &&
                       event.status !== 'deleted' &&
                       event.status !== 'rejected';

        // Don't filter by seats on landing page - let users see all events

        return isPublished && isUpcoming && isValid;
      });

      console.log(`🔄 Manual refresh: Found ${fetchedEvents.length} total events, ${validEvents.length} valid events`);
      setEvents(validEvents.slice(0, 6));
    } catch (error) {
      console.error('Error refreshing events:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-16 bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              Discover Amazing Events
            </h2>
            <button
              onClick={refreshEvents}
              disabled={loading}
              className="ml-4 p-2 text-gray-400 hover:text-white transition-colors duration-200 disabled:opacity-50"
              title="Refresh events"
            >
              <svg className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            From concerts to conferences, workshops to festivals - find your next unforgettable experience
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-16 mb-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
            <span className="ml-4 text-white">Loading events...</span>
          </div>
        )}

        {/* Featured Events Grid */}
        {!loading && events.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {events.map((event) => (
              <div key={event.id} className="cursor-pointer">
                <EventCard
                  event={event}
                  onClick={handleEventClick}
                />
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && events.length === 0 && (
          <div className="text-center py-16 mb-12">
            <div className="w-20 h-20 bg-purple-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-2xl font-semibold text-white mb-4">No Events Available</h3>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
              There are currently no events to display. Check back soon for exciting new events!
            </p>
            <button
              onClick={() => navigate('/login')}
              className="bg-purple-600 hover:bg-purple-700 text-white font-medium px-6 py-3 rounded-lg transition-colors duration-200"
            >
              Sign Up to Create Events
            </button>
          </div>
        )}

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
