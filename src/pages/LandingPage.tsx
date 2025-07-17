import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import PublicNavbar from '@/components/Layout/PublicNavbar';
import Banner from '@/components/Banner';
import EventCard from '@/components/Events/EventCard';
import CategoryFilter from '@/components/UI/CategoryFilter';
import { subscribeToEvents, Event } from '@/services/eventsService';

const LandingPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<Event[]>([]);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  // Landing page is always publicly accessible - no auto-redirects
  // Users will only be redirected when they explicitly click "Login" or access protected routes

  // Load events from Firebase with real-time updates
  useEffect(() => {
    setLoading(true);
    setError(null);

    const unsubscribe = subscribeToEvents((fetchedEvents) => {
      setEvents(fetchedEvents);
      setLoading(false);
    }, selectedCategory);

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [selectedCategory]);

  const filteredEvents = events; // Events are already filtered by the subscription

  const handleBooking = (eventId?: string) => {
    if (!currentUser) {
      // Store the intended booking URL for redirect after login
      const returnUrl = eventId ? `/event/${eventId}?booking=true` : window.location.pathname;
      sessionStorage.setItem('returnUrl', returnUrl);
      sessionStorage.setItem('bookingIntent', 'true');

      // Navigate to login with a clear message
      const message = encodeURIComponent('Please log in to book tickets for this event');
      navigate(`/login?message=${message}`);
    } else {
      // User is authenticated, navigate to event details page
      navigate(`/event/${eventId}`);
    }
  };

  // Show loading while loading events
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PublicNavbar />
        <div className="pt-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading events...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PublicNavbar />
        <div className="pt-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <p className="text-red-600 mb-4">Error loading events: {error}</p>
              <button
                onClick={() => window.location.reload()}
                className="btn-primary"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PublicNavbar />
      
      <main className="pt-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Banner */}
        <Banner 
          title="Discover Amazing Events"
          subtitle="Find and book tickets for the best events happening around you"
          image="https://images.pexels.com/photos/1190298/pexels-photo-1190298.jpeg?auto=compress&cs=tinysrgb&w=1200"
          showSearchBar={true}
        />

        {/* Category Filter */}
        <CategoryFilter 
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />

        {/* Events Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {selectedCategory === 'all' ? 'All Events' : `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Events`}
            </h2>
            <p className="text-gray-600">
              {filteredEvents.length} events found
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                showBookButton={true}
                onBookClick={() => handleBooking(event.id)}
              />
            ))}
          </div>
        </div>

        {/* Load More Button */}
        {filteredEvents.length >= 6 && (
          <div className="text-center mb-8">
            <button className="bg-white text-gray-700 px-6 py-3 rounded-xl border border-gray-300 hover:bg-gray-50 transition-colors duration-200 font-medium">
              Load More Events
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default LandingPage;
