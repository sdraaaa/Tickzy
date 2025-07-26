/**
 * ExploreEvents Component
 *
 * Event discovery section with filters and booking functionality
 * Used in the dashboard for users and hosts
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getEvents } from '../../services/firestore';
import { getDefaultEventImage } from '../../utils/defaultImage';
import { Event, SearchFilters } from '../../types';

interface ExploreEventsProps {
  searchQuery?: string;
}

const ExploreEvents: React.FC<ExploreEventsProps> = ({ searchQuery: navbarSearchQuery = '' }) => {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  // Use navbar search query, fallback to local state for standalone usage
  const [localSearchQuery, setLocalSearchQuery] = useState('');
  const searchQuery = navbarSearchQuery || localSearchQuery;


  // Fetch events from Firestore
  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const filters: Partial<SearchFilters> = {
          category: selectedCategory === 'all' ? undefined : selectedCategory,
          query: searchQuery || undefined
        };

        const fetchedEvents = await getEvents(filters);
        setEvents(fetchedEvents);
      } catch (error) {
        console.error('Error fetching events:', error);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [selectedCategory, searchQuery, navbarSearchQuery]);


  const categories = [
    { id: 'all', name: 'All Events' },
    { id: 'music', name: 'Music' },
    { id: 'technology', name: 'Technology' },
    { id: 'art', name: 'Art & Culture' },
    { id: 'food', name: 'Food & Drink' },
    { id: 'sports', name: 'Sports' },
    { id: 'entertainment', name: 'Entertainment' },
    { id: 'business', name: 'Business' },
    { id: 'education', name: 'Education' }
  ];

  const handleBookEvent = (eventId: string) => {
    // TODO: Implement booking modal/flow
    alert(`Booking event ${eventId} - Feature coming soon!`);
  };

  return (
    <section id="explore-events" className="py-16 bg-black scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">Explore Events</h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-8">
            Discover amazing events happening near you
          </p>

          {/* Search Results Info */}
          {searchQuery && (
            <div className="max-w-4xl mx-auto mb-4">
              <div className="text-center">
                <p className="text-gray-400">
                  {events.length > 0
                    ? `Found ${events.length} event${events.length === 1 ? '' : 's'} for "${searchQuery}"`
                    : `No events found for "${searchQuery}"`
                  }
                </p>
              </div>
            </div>
          )}
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

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
            <span className="ml-4 text-white">Loading events...</span>
          </div>
        )}

        {/* Events Grid */}
        {!loading && events.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map((event) => (
            <div key={event.id} className="bg-neutral-800 rounded-xl overflow-hidden border border-gray-700 hover:border-purple-500/50 transition-all duration-300 transform hover:scale-105">
              <div className="relative h-48">
                <img
                  src={event.image}
                  alt={event.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = getDefaultEventImage();
                  }}
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

                {/* Tags */}
                {event.tags && event.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {event.tags.slice(0, 3).map((tag, index) => (
                      <span key={index} className="bg-purple-600/20 text-purple-300 px-2 py-1 rounded-full text-xs">
                        {tag}
                      </span>
                    ))}
                    {event.tags.length > 3 && (
                      <span className="text-gray-400 text-xs px-2 py-1">+{event.tags.length - 3} more</span>
                    )}
                  </div>
                )}

                <div className="space-y-2 mb-6">
                  <div className="flex items-center text-gray-400 text-sm">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {new Date(event.date).toLocaleDateString()} at {event.time}
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
        )}

        {/* Empty State */}
        {!loading && events.length === 0 && (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-purple-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-2xl font-semibold text-white mb-2">No Events Found</h3>
            <p className="text-gray-400">
              {searchQuery || selectedCategory !== 'all'
                ? "Try adjusting your search or filters to discover more events."
                : "No events are currently available. Check back soon for exciting new events!"
              }
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default ExploreEvents;
