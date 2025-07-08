import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import PublicNavbar from '@/components/Layout/PublicNavbar';
import Banner from '@/components/Banner';
import EventCard from '@/components/Events/EventCard';
import CategoryFilter from '@/components/UI/CategoryFilter';

const LandingPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  // Landing page is always publicly accessible - no auto-redirects
  // Users will only be redirected when they explicitly click "Login" or access protected routes

  // Mock events data - same as Dashboard
  const mockEvents = [
    {
      id: '1',
      title: 'Summer Music Festival 2024',
      image: 'https://images.pexels.com/photos/1190298/pexels-photo-1190298.jpeg?auto=compress&cs=tinysrgb&w=800',
      date: 'Aug 15, 2024',
      time: '6:00 PM',
      location: 'Central Park, New York',
      price: 89,
      category: 'Music',
      attendees: 1250,
      rating: 4.8,
      isPopular: true,
    },
    {
      id: '2',
      title: 'Tech Conference 2024',
      image: 'https://images.pexels.com/photos/2774556/pexels-photo-2774556.jpeg?auto=compress&cs=tinysrgb&w=800',
      date: 'Sep 20, 2024',
      time: '9:00 AM',
      location: 'Convention Center, San Francisco',
      price: 299,
      category: 'Business',
      attendees: 500,
      rating: 4.6,
    },
    {
      id: '3',
      title: 'Food & Wine Tasting',
      image: 'https://images.pexels.com/photos/1581384/pexels-photo-1581384.jpeg?auto=compress&cs=tinysrgb&w=800',
      date: 'Aug 25, 2024',
      time: '7:00 PM',
      location: 'Downtown Restaurant, Chicago',
      price: 125,
      category: 'Lifestyle',
      attendees: 75,
      rating: 4.9,
    },
    {
      id: '4',
      title: 'Art Gallery Opening',
      image: 'https://images.pexels.com/photos/1194420/pexels-photo-1194420.jpeg?auto=compress&cs=tinysrgb&w=800',
      date: 'Sep 5, 2024',
      time: '6:30 PM',
      location: 'Modern Art Museum, Los Angeles',
      price: 45,
      category: 'Arts',
      attendees: 200,
      rating: 4.4,
    },
    {
      id: '5',
      title: 'Gaming Championship',
      image: 'https://images.pexels.com/photos/3165335/pexels-photo-3165335.jpeg?auto=compress&cs=tinysrgb&w=800',
      date: 'Oct 1, 2024',
      time: '2:00 PM',
      location: 'Gaming Arena, Austin',
      price: 65,
      category: 'Gaming',
      attendees: 800,
      rating: 4.7,
      isPopular: true,
    },
    {
      id: '6',
      title: 'Marathon & Fun Run',
      image: 'https://images.pexels.com/photos/2402777/pexels-photo-2402777.jpeg?auto=compress&cs=tinysrgb&w=800',
      date: 'Sep 15, 2024',
      time: '7:00 AM',
      location: 'City Park, Miami',
      price: 35,
      category: 'Sports',
      attendees: 2000,
      rating: 4.5,
    },
  ];

  useEffect(() => {
    // Simulate API loading
    setTimeout(() => {
      setEvents(mockEvents);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredEvents = selectedCategory === 'all' 
    ? events 
    : events.filter(event => event.category.toLowerCase() === selectedCategory);

  const handleUnauthenticatedBooking = () => {
    alert('Please log in to book tickets for events!');
    navigate('/login');
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
                onBookClick={handleUnauthenticatedBooking}
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
