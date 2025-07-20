import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Calendar, MapPin, Users, Star, Share2, Heart, Clock, DollarSign, Info, ArrowLeft, ImageIcon } from 'lucide-react';
import PublicNavbar from '@/components/Layout/PublicNavbar';
import { useAuth } from '@/contexts/AuthContext';
import { subscribeToEvent, Event } from '@/services/eventsService';

const EventDetails: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { currentUser } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTickets, setSelectedTickets] = useState(1);
  const [isFavorited, setIsFavorited] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  // Check if user came here with booking intent
  const bookingIntent = searchParams.get('booking') === 'true';

  // Scroll to top when component mounts or route parameters change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]); // Re-run when event ID changes

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoading(false);
  };

  const handleBooking = () => {
    if (!currentUser) {
      // Store the current URL for redirect after login (use pathname + search to avoid full URL)
      const returnUrl = window.location.pathname + window.location.search;
      console.log('🔍 EventDetails storing returnUrl:', returnUrl);
      console.log('🔍 EventDetails window.location:', {
        href: window.location.href,
        pathname: window.location.pathname,
        search: window.location.search
      });

      sessionStorage.setItem('returnUrl', returnUrl);
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

      // User is authenticated and not admin, proceed with booking confirmation
      const bookingParams = new URLSearchParams({
        eventId: event.id,
        eventTitle: event.title,
        eventDate: event.date,
        eventLocation: event.location,
        ticketCount: selectedTickets.toString(),
        totalPrice: (event.price * selectedTickets).toString(),
        eventImage: event.image
      });

      navigate(`/booking/confirmation?${bookingParams.toString()}`);
    }
  };

  // Fetch event data from Firebase based on ID parameter
  useEffect(() => {
    if (!id) {
      setLoading(false);
      setError('No event ID provided');
      return;
    }

    // Reset image states when event ID changes
    setImageError(false);
    setImageLoading(true);
    setLoading(true);
    setError(null);

    const unsubscribe = subscribeToEvent(id, (eventData) => {
      if (eventData) {
        setEvent(eventData);
        setError(null);
      } else {
        setEvent(null);
        setError('Event not found');
      }
      setLoading(false);
    });

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PublicNavbar />
        <div className="pt-20 min-h-screen">
          <div className="animate-pulse">
            <div className="h-96 bg-gray-200"></div>
            <div className="max-w-7xl mx-auto px-4 py-8">
              <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
              <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-4 bg-gray-200 rounded"></div>
                  ))}
                </div>
                <div className="h-96 bg-gray-200 rounded-2xl"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PublicNavbar />
        <div className="pt-20 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              {error || 'Event Not Found'}
            </h1>
            <p className="text-gray-600 mb-6">
              {error ? 'There was an error loading this event.' : 'The event you\'re looking for doesn\'t exist.'}
            </p>
            <div className="space-x-4">
              <Link to="/" className="btn-primary">
                Back to Events
              </Link>
              {error && (
                <button
                  onClick={() => window.location.reload()}
                  className="btn-secondary"
                >
                  Try Again
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PublicNavbar />
      <div className="pt-20 min-h-screen">
        {/* Back Button */}
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Link
            to="/"
            className="inline-flex items-center text-gray-600 hover:text-primary-500 transition-colors duration-300"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Events
          </Link>
        </div>

        {/* Hero Image */}
        <div className="relative h-96 overflow-hidden bg-gray-200">
          {imageLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
            </div>
          )}

          {imageError ? (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <div className="text-center text-gray-400">
                <ImageIcon className="w-16 h-16 mx-auto mb-4" />
                <p className="text-lg">Event image not available</p>
              </div>
            </div>
          ) : (
            <img
              src={event.image}
              alt={event.title}
              className="w-full h-full object-cover"
              onLoad={handleImageLoad}
              onError={handleImageError}
              style={{ display: imageLoading ? 'none' : 'block' }}
            />
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        
        {/* Action Buttons */}
        <div className="absolute top-6 right-6 flex space-x-3">
          <button
            onClick={() => setIsFavorited(!isFavorited)}
            className={`p-3 rounded-full backdrop-blur-sm transition-all duration-300 ${
              isFavorited ? 'bg-red-500 text-white' : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            <Heart className={`w-5 h-5 ${isFavorited ? 'fill-current' : ''}`} />
          </button>
          <button className="p-3 bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 rounded-full transition-all duration-300">
            <Share2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Event Header */}
            <div className="mb-8">
              <div className="flex items-center space-x-3 mb-4">
                <span className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm font-medium">
                  {event.category}
                </span>
                <div className="flex items-center">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-sm text-gray-600 ml-1">{event.rating}</span>
                </div>
              </div>
              
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                {event.title}
              </h1>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-600">
                <div className="flex items-center">
                  <Calendar className="w-5 h-5 mr-3 text-primary-500" />
                  <span>{event.date}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="w-5 h-5 mr-3 text-primary-500" />
                  <span>{event.time}</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="w-5 h-5 mr-3 text-primary-500" />
                  <span>{event.location}</span>
                </div>
                <div className="flex items-center">
                  <Users className="w-5 h-5 mr-3 text-primary-500" />
                  <span>{event.attendees} attending</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-2xl p-6 shadow-soft mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">About This Event</h2>
              <p className="text-gray-700 leading-relaxed mb-6">
                {event.description}
              </p>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Event Highlights</h3>
              <ul className="space-y-2">
                {event.highlights.map((highlight, index) => (
                  <li key={index} className="flex items-center text-gray-700">
                    <div className="w-2 h-2 bg-primary-500 rounded-full mr-3"></div>
                    {highlight}
                  </li>
                ))}
              </ul>
            </div>

            {/* Organizer */}
            <div className="bg-white rounded-2xl p-6 shadow-soft">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Event Organizer</h2>
              <div className="flex items-center">
                <img
                  src={event.organizer.avatar}
                  alt={event.organizer.name}
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">{event.organizer.name}</h3>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                      {event.organizer.rating}
                    </div>
                    <span>{event.organizer.events} events hosted</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Booking Sidebar */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <div className="bg-white rounded-2xl p-6 shadow-card">
              {/* Booking Intent Notification */}
              {bookingIntent && currentUser && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
                  <p className="text-sm text-green-700 font-medium">
                    ✅ You're now logged in! Complete your booking below.
                  </p>
                </div>
              )}

              <h2 className="text-xl font-bold text-gray-900 mb-6">Select Tickets</h2>
              
              {/* Ticket Types */}
              <div className="space-y-4 mb-6">
                {event.ticketTypes.map((ticket) => (
                  <div
                    key={ticket.id}
                    className={`border-2 rounded-xl p-4 transition-all duration-300 ${
                      ticket.soldOut
                        ? 'border-gray-200 bg-gray-50 opacity-50'
                        : 'border-gray-200 hover:border-primary-500 cursor-pointer'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-gray-900">{ticket.name}</h3>
                        <p className="text-sm text-gray-600">{ticket.description}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-gray-900">${ticket.price}</p>
                        {ticket.soldOut && (
                          <p className="text-sm text-red-500">Sold Out</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Quantity Selector */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Tickets
                </label>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setSelectedTickets(Math.max(1, selectedTickets - 1))}
                    className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-xl flex items-center justify-center transition-colors duration-300"
                  >
                    -
                  </button>
                  <span className="text-lg font-semibold px-4">{selectedTickets}</span>
                  <button
                    onClick={() => setSelectedTickets(selectedTickets + 1)}
                    className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-xl flex items-center justify-center transition-colors duration-300"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Total */}
              <div className="border-t pt-4 mb-6">
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Total</span>
                  <span>${event.price * selectedTickets}</span>
                </div>
              </div>

              {/* Book Button */}
              <button
                onClick={handleBooking}
                disabled={currentUser?.email === 'aleemsidra2205@gmail.com'}
                className={`w-full mb-4 flex items-center justify-center ${
                  currentUser?.email === 'aleemsidra2205@gmail.com'
                    ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                    : 'btn-primary'
                }`}
              >
                <DollarSign className="w-5 h-5 mr-2" />
                {currentUser?.email === 'aleemsidra2205@gmail.com'
                  ? 'Admins Cannot Book Events'
                  : currentUser
                    ? 'Book Now'
                    : 'Login to Book'
                }
              </button>

              <p className="text-xs text-gray-500 text-center">
                Secure booking • Full refund available until 24h before event
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};

export default EventDetails;