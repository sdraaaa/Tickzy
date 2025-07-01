import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, TrendingUp, MapPin, Search, Ticket, Heart, Clock } from 'lucide-react';
import EventGrid from '../components/Events/EventGrid';
import CategoryFilter from '../components/UI/CategoryFilter';
import FestiveBanner from '../components/UI/FestiveBanner';

const Dashboard: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);

  // Mock data - replace with actual API call
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

  // Mock user tickets
  const userTickets = [
    {
      id: '1',
      eventTitle: 'Summer Music Festival 2024',
      date: 'Aug 15, 2024',
      time: '6:00 PM',
      venue: 'Central Park, New York',
      ticketType: 'VIP',
      status: 'confirmed',
      image: 'https://images.pexels.com/photos/1190298/pexels-photo-1190298.jpeg?auto=compress&cs=tinysrgb&w=400'
    },
    {
      id: '2',
      eventTitle: 'Tech Conference 2024',
      date: 'Sep 20, 2024',
      time: '9:00 AM',
      venue: 'Convention Center, San Francisco',
      ticketType: 'General',
      status: 'confirmed',
      image: 'https://images.pexels.com/photos/2774556/pexels-photo-2774556.jpeg?auto=compress&cs=tinysrgb&w=400'
    }
  ];

  useEffect(() => {
    // Simulate API loading
    setTimeout(() => {
      setEvents(mockEvents);
      setLoading(false);
    }, 1500);
  }, []);

  const filteredEvents = selectedCategory === 'all' 
    ? events 
    : events.filter(event => event.category.toLowerCase() === selectedCategory);

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
            <Link
              key={event.id}
              to={`/event/${event.id}`}
              className="block bg-white rounded-2xl shadow-soft hover:shadow-card-hover transition-all duration-300 overflow-hidden group"
            >
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
              <div className="p-6">
                <h3 className="font-bold text-gray-900 mb-2 line-clamp-2">{event.title}</h3>
                <div className="flex items-center text-gray-600 mb-3">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span className="text-sm">{event.date}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-primary-500">${event.price}</span>
                  <button className="bg-primary-500 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-primary-600 transition-colors duration-300">
                    <Ticket className="w-4 h-4 mr-1 inline" />
                    Book Now
                  </button>
                </div>
              </div>
            </Link>
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