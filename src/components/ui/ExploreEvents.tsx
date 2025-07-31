/**
 * ExploreEvents Component
 *
 * Event discovery section with filters and booking functionality
 * Used in the dashboard for users and hosts
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useGlobalToast } from '../../contexts/ToastContext';
import { getEvents, migrateEventsAddSeatsLeft } from '../../services/firestore';
import { getDefaultEventImage } from '../../utils/defaultImage';
import { Event, SearchFilters } from '../../types';
import BookingModal from './BookingModal';

interface ExploreEventsProps {
  searchQuery?: string;
}

const ExploreEvents: React.FC<ExploreEventsProps> = ({ searchQuery: navbarSearchQuery = '' }) => {
  const { user, userData } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPastEvents, setShowPastEvents] = useState(false);
  // Use navbar search query, fallback to local state for standalone usage
  const [localSearchQuery, setLocalSearchQuery] = useState('');
  const searchQuery = navbarSearchQuery || localSearchQuery;

  // Booking modal state
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  // Toast notifications
  const { showSuccess, showError } = useGlobalToast();


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

        // Additional client-side filtering for extra safety
        const now = new Date();
        now.setHours(0, 0, 0, 0);

        const validEvents = fetchedEvents.filter(event => {
          // Ensure event is published/approved
          const isPublished = event.status === 'approved' ||
                             event.status === 'published' ||
                             event.status === 'active';

          // Ensure event is not cancelled/deleted
          const isValid = event.status !== 'cancelled' &&
                         event.status !== 'deleted' &&
                         event.status !== 'rejected';

          return isPublished && isValid;
        });

        console.log(`📅 Dashboard: Found ${fetchedEvents.length} total events, ${validEvents.length} valid events`);
        setEvents(validEvents);
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

  const handleBookEvent = (event: Event) => {
    if (!user || !userData) {
      showError('Authentication Required', 'Please log in to book events');
      return;
    }

    if (userData.role !== 'user') {
      showError('Booking Restricted', 'Only users can book events');
      return;
    }

    // Check if event date has passed
    const eventDate = new Date(event.date);
    const now = new Date();
    now.setHours(0, 0, 0, 0); // Reset time to start of day for comparison

    if (eventDate < now) {
      showError('Event Passed', 'This event has already passed and is no longer available for booking');
      return;
    }

    if (event.status !== 'published' && event.status !== 'approved') {
      showError('Event Unavailable', 'This event is not available for booking');
      return;
    }

    // Calculate available seats (handle missing seatsLeft)
    const seatsLeft = event.seatsLeft !== undefined && event.seatsLeft !== null
      ? event.seatsLeft
      : Math.max(0, (event.capacity || event.totalTickets || 100) - (event.ticketsSold || 0));

    if (seatsLeft <= 0) {
      showError('Sold Out', 'This event is sold out');
      return;
    }

    setSelectedEvent(event);
    setIsBookingModalOpen(true);
  };

  const handleBookingSuccess = (bookingId: string) => {
    showSuccess(
      'Booking Confirmed!',
      'Your ticket has been booked successfully. Check your email for confirmation.'
    );

    // Refresh events to update seat counts
    const fetchEvents = async () => {
      try {
        const filters: Partial<SearchFilters> = {
          category: selectedCategory === 'all' ? undefined : selectedCategory,
          query: searchQuery || undefined
        };
        const fetchedEvents = await getEvents(filters);
        setEvents(fetchedEvents);
      } catch (error) {
        console.error('Error refreshing events:', error);
      }
    };
    fetchEvents();
  };

  const handleCloseBookingModal = () => {
    setIsBookingModalOpen(false);
    setSelectedEvent(null);
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

        {/* Past Events Toggle */}
        <div className="flex justify-center mb-8">
          <button
            onClick={() => setShowPastEvents(!showPastEvents)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
              showPastEvents
                ? 'bg-red-600 text-white'
                : 'bg-neutral-800 text-gray-300 hover:text-white hover:bg-neutral-700'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {showPastEvents ? 'Hide Past Events' : 'Show Past Events'}
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
            <span className="ml-4 text-white">Loading events...</span>
          </div>
        )}

        {/* Events Grid */}
        {!loading && events.length > 0 && (() => {
          // Filter events based on showPastEvents toggle
          const filteredEvents = showPastEvents ? events : events.filter(event => {
            const eventDate = new Date(event.date);
            const now = new Date();
            now.setHours(0, 0, 0, 0);
            return eventDate >= now; // Show only upcoming events by default
          });

          return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredEvents.map((event) => (
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
                <div className="absolute top-3 right-3 flex flex-col gap-2">
                  <span className="bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-medium shadow-lg">
                    ${event.price}
                  </span>
                  {(() => {
                    const eventDate = new Date(event.date);
                    const now = new Date();
                    now.setHours(0, 0, 0, 0);
                    const isPastEvent = eventDate < now;

                    if (isPastEvent) {
                      return (
                        <span className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-medium shadow-lg">
                          Past Event
                        </span>
                      );
                    }
                    return null;
                  })()}
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

                <div className="space-y-2 mb-4">
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
                  <div className="flex items-center text-gray-400 text-sm">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    {(() => {
                      // Handle events with missing seatsLeft or capacity
                      const seatsLeft = event.seatsLeft;
                      const capacity = event.capacity || event.totalTickets || 100;
                      const ticketsSold = event.ticketsSold || 0;

                      if (seatsLeft !== undefined && seatsLeft !== null) {
                        return `${seatsLeft} seats left`;
                      } else {
                        // Calculate seats left if missing
                        const calculatedSeats = Math.max(0, capacity - ticketsSold);
                        return `${calculatedSeats} seats left`;
                      }
                    })()}
                  </div>
                </div>

                {/* Booking Button */}
                {user && userData?.role === 'user' ? (
                  (() => {
                    // Check if event date has passed
                    const eventDate = new Date(event.date);
                    const now = new Date();
                    now.setHours(0, 0, 0, 0); // Reset time to start of day for comparison
                    const isPastEvent = eventDate < now;

                    // Calculate available seats
                    const seatsLeft = event.seatsLeft !== undefined && event.seatsLeft !== null
                      ? event.seatsLeft
                      : Math.max(0, (event.capacity || event.totalTickets || 100) - (event.ticketsSold || 0));

                    const isAvailable = !isPastEvent && seatsLeft > 0 && (event.status === 'published' || event.status === 'approved');

                    return (
                      <button
                        onClick={() => handleBookEvent(event)}
                        disabled={!isAvailable}
                        className={`w-full font-medium py-3 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg ${
                          !isAvailable
                            ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                            : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white'
                        }`}
                      >
                        {isPastEvent
                          ? 'Event Passed'
                          : seatsLeft <= 0
                          ? 'Sold Out'
                          : (event.status !== 'published' && event.status !== 'approved')
                          ? 'Not Available'
                          : 'Book Now'
                        }
                      </button>
                    );
                  })()
                ) : (
                  <button
                    onClick={() => {
                      if (!user) {
                        showError('Login Required', 'Please log in to book events');
                      } else {
                        showError('Booking Restricted', 'Only users can book events');
                      }
                    }}
                    className="w-full bg-gray-600 hover:bg-gray-700 text-gray-300 font-medium py-3 rounded-lg transition-colors duration-200"
                  >
                    {!user ? 'Login to Book' : 'View Details'}
                  </button>
                )}
              </div>
            </div>
              ))}
            </div>
          );
        })()}

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

        {/* Booking Modal */}
        <BookingModal
          event={selectedEvent}
          isOpen={isBookingModalOpen}
          onClose={handleCloseBookingModal}
          onBookingSuccess={handleBookingSuccess}
        />
      </div>
    </section>
  );
};

export default ExploreEvents;
