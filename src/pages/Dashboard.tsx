import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, TrendingUp, MapPin, Search, Ticket, Heart, Clock } from 'lucide-react';
import EventGrid from '../components/Events/EventGrid';
import CategoryFilter from '../components/UI/CategoryFilter';
import FestiveBanner from '../components/UI/FestiveBanner';
import { useAuth } from '@/contexts/AuthContext';
import { subscribeToEventsWithLimit, Event } from '@/services/eventsService';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<Event[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Load events from Firebase with real-time updates

  // User tickets will come from Firebase when booking system is implemented
  const userTickets: any[] = [];

  useEffect(() => {
    setLoading(true);
    setError(null);

    const unsubscribe = subscribeToEventsWithLimit((fetchedEvents) => {
      setEvents(fetchedEvents);
      setLoading(false);
    }, 6, selectedCategory); // Limit to 6 events for dashboard

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [selectedCategory]);

  const filteredEvents = events; // Events are already filtered by the subscription

  const handleBooking = (event: any) => {
    if (!currentUser) {
      // Store the intended booking URL for redirect after login
      sessionStorage.setItem('returnUrl', `/event/${event.id}?booking=true`);
      sessionStorage.setItem('bookingIntent', 'true');

      // Navigate to login with booking message
      const message = encodeURIComponent('Please log in to book tickets for this event');
      navigate(`/login?message=${message}`);
    } else {
      // Check if user is admin - admins cannot book events
      if (currentUser.email === 'aleemsidra2205@gmail.com') {
        alert('Admins cannot book events. Admins are meant to manage and approve events, not book them as attendees.');
        return;
      }

      // User is authenticated and not admin, navigate to event details page
      navigate(`/event/${event.id}`);
    }
  };

  return (
    <div className="pt-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Festive Banner */}
      <FestiveBanner 
        title="Discover Amazing Events"
        subtitle="Find and book tickets for the best events happening around you"
        image="https://images.pexels.com/photos/1190298/pexels-photo-1190298.jpeg?auto=compress&cs=tinysrgb&w=1200"
      />

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-2xl p-6 shadow-soft">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
              <Calendar className="w-6 h-6 text-primary-500" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">1,247</p>
              <p className="text-gray-600">Events This Month</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl p-6 shadow-soft">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-500" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">89K</p>
              <p className="text-gray-600">Tickets Sold</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl p-6 shadow-soft">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <MapPin className="w-6 h-6 text-purple-500" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">25</p>
              <p className="text-gray-600">Cities Available</p>
            </div>
          </div>
        </div>
      </div>

      {/* My Tickets Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">My Tickets</h2>
          <Link to="/tickets" className="text-primary-500 hover:text-primary-600 font-medium">
            View All
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {userTickets.map((ticket) => (
            <div key={ticket.id} className="bg-white rounded-2xl p-6 shadow-soft border-l-4 border-primary-500">
              <div className="flex items-center">
                <img
                  src={ticket.image}
                  alt={ticket.eventTitle}
                  className="w-16 h-16 rounded-xl object-cover"
                />
                <div className="ml-4 flex-1">
                  <h3 className="font-bold text-gray-900 mb-1">{ticket.eventTitle}</h3>
                  <div className="flex items-center text-sm text-gray-600 mb-2">
                    <Calendar className="w-4 h-4 mr-2" />
                    {ticket.date} • {ticket.time}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{ticket.ticketType} Ticket</span>
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                      Confirmed
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Category Filter */}
      <CategoryFilter 
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
      />

      {/* Upcoming Events Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {selectedCategory === 'all' ? 'Upcoming Events' : `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Events`}
          </h2>
          <p className="text-gray-600">
            {filteredEvents.length} events found
          </p>
        </div>
        
        <EventGrid events={filteredEvents} loading={loading} />
      </div>

      {/* Recommended Events */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Recommended for You</h2>
          <button className="text-primary-500 hover:text-primary-600 font-medium">
            Refresh
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {events.slice(0, 3).map((event) => (
            <div
              key={event.id}
              className="bg-white rounded-2xl shadow-soft hover:shadow-card-hover transition-all duration-300 overflow-hidden group"
            >
              <Link to={`/event/${event.id}`} className="block">
                <div className="relative h-48">
                  <img
                    src={event.image}
                    alt={event.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-2 rounded-xl">
                    <Heart className="w-4 h-4 text-gray-600" />
                  </div>
                </div>
                <div className="p-6 pb-4">
                  <h3 className="font-bold text-gray-900 mb-2 line-clamp-2">{event.title}</h3>
                  <div className="flex items-center text-gray-600 mb-3">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span className="text-sm">{event.date}</span>
                  </div>
                </div>
              </Link>
              <div className="px-6 pb-6">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-primary-500">${event.price}</span>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      handleBooking(event);
                    }}
                    className="bg-primary-500 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-primary-600 transition-colors duration-300"
                  >
                    <Ticket className="w-4 h-4 mr-1 inline" />
                    {currentUser ? 'Book Now' : 'Login to Book'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Load More Button */}
      {!loading && filteredEvents.length >= 6 && (
        <div className="text-center mb-8">
          <button className="btn-secondary">
            Load More Events
          </button>
        </div>
      )}
    </div>
  );
};

export default Dashboard;