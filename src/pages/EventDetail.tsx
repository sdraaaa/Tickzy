/**
 * EventDetail Page
 * 
 * Displays full event information with booking functionality
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useGlobalToast } from '../contexts/ToastContext';
import { getEventById } from '../services/firestore';
import { Event, TicketTier } from '../types';
import { getDefaultEventImage } from '../utils/defaultImage';
import BookingModal from '../components/ui/BookingModal';
import CustomMap from '../components/ui/CustomMap';
import UnifiedNavbar from '../components/ui/UnifiedNavbar';
import LandingNavbar from '../components/Landing/LandingNavbar';
import { isEventPast } from '../utils/dateUtils';

// Helper function to safely decode location
const decodeLocation = (encodedLocation: string): string => {
  try {
    return decodeURIComponent(encodedLocation);
  } catch (error) {
    // If decoding fails, return the original string
    return encodedLocation;
  }
};

// Map Preview Component
const MapPreview: React.FC<{ locationName?: string }> = ({ locationName }) => {
  // Check if location name is available
  if (!locationName || !locationName.trim()) {
    return (
      <div className="bg-neutral-700 rounded-xl p-6 text-center">
        <div className="text-gray-400 mb-2">
          <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <p className="text-gray-400">Location not available</p>
        <p className="text-gray-500 text-sm mt-1">No location name provided</p>
      </div>
    );
  }

  // Clean the location name and encode for URL
  const cleanLocation = locationName.trim();
  const encodedLocation = encodeURIComponent(cleanLocation);

  // Use the simple embed URL that works without API key
  const mapSrc = `https://maps.google.com/maps?q=${encodedLocation}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
  const mapsSearchUrl = `https://www.google.com/maps/search/?api=1&query=${encodedLocation}`;

  console.log('🗺️ Map Debug Info:', {
    originalLocation: locationName,
    cleanLocation: cleanLocation,
    encodedLocation: encodedLocation,
    mapSrc: mapSrc
  });

  return (
    <div className="space-y-4">
      {/* Location Display */}
      <div className="bg-neutral-700 rounded-lg p-4">
        <div className="flex items-center space-x-3">
          <span className="text-purple-400 text-xl">📍</span>
          <div>
            <h4 className="text-white font-medium">Event Location</h4>
            <p className="text-gray-300 text-sm">{cleanLocation}</p>
          </div>
        </div>
      </div>

      {/* Custom Map Component - No API Keys Required */}
      <CustomMap
        location={cleanLocation}
        height="300px"
        showBadge={true}
      />
    </div>
  );
};

const EventDetail: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { user, userData } = useAuth();
  const { showError, showSuccess, showInfo } = useGlobalToast();
  
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTier, setSelectedTier] = useState<TicketTier | null>(null);
  const [ticketCount, setTicketCount] = useState(1);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      if (!eventId) {
        setError('Event ID not provided');
        setLoading(false);
        return;
      }

      try {
        const eventData = await getEventById(eventId);
        if (eventData) {
          setEvent(eventData);
          // Set default ticket tier if available
          if (eventData.ticketTiers && eventData.ticketTiers.length > 0) {
            setSelectedTier(eventData.ticketTiers[0]);
          }
        } else {
          setError('Event not found');
        }
      } catch (err) {
        console.error('Error fetching event:', err);
        setError('Failed to load event details');
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [eventId]);

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const formatPrice = (price: number) => {
    return price === 0 ? 'Free' : `$${price}`;
  };

  const isEventBookable = () => {
    if (!event) return false;
    if (event.status === 'cancelled') return false;
    if (event.seatsLeft <= 0) return false;

    // Check if event date/time has passed using centralized logic
    if (isEventPast(event.date, event.time)) return false;

    // Check ticket tier sale window if selected
    if (selectedTier) {
      const now = new Date();
      if (selectedTier.saleStart && new Date(selectedTier.saleStart) > now) return false;
      if (selectedTier.saleEnd && new Date(selectedTier.saleEnd) < now) return false;
      if (selectedTier.seats <= 0) return false;
    }

    return true;
  };

  const handleBookTicket = () => {
    if (!user) {
      showError('Please sign in to book tickets');
      navigate('/login');
      return;
    }

    // Check if user has permission to book events
    if (!userData) {
      showError('User data not loaded');
      return;
    }

    // Allow both users and hosts to book events, but prevent hosts from booking their own events
    if (userData.role === 'host' && event?.hostId === user.uid) {
      showError('You cannot book tickets for your own event');
      return;
    }

    // Only allow users and hosts to book events (exclude admins for now)
    if (userData.role !== 'user' && userData.role !== 'host') {
      showError('Only users and hosts can book events');
      return;
    }

    if (!isEventBookable()) {
      showError('This event is not available for booking');
      return;
    }

    setIsBookingModalOpen(true);
  };

  const handleBookingSuccess = (bookingId: string) => {
    setIsBookingModalOpen(false);
    showSuccess('Booking successful! Check your email for confirmation.');
    // Optionally navigate to bookings page or show ticket
    navigate('/dashboard');
  };

  const getStatusBadge = () => {
    if (!event) return null;

    if (event.status === 'cancelled') {
      return (
        <span className="bg-red-600 text-white px-4 py-2 rounded-full text-sm font-medium">
          Cancelled
        </span>
      );
    }

    if (event.seatsLeft === 0) {
      return (
        <span className="bg-gray-600 text-white px-4 py-2 rounded-full text-sm font-medium">
          Sold Out
        </span>
      );
    }

    // Use centralized date/time comparison logic
    if (isEventPast(event.date, event.time)) {
      return (
        <span className="bg-gray-600 text-white px-4 py-2 rounded-full text-sm font-medium">
          Event Over
        </span>
      );
    }

    return (
      <span className="bg-green-600 text-white px-4 py-2 rounded-full text-sm font-medium">
        Available
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading event details...</div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-xl mb-4">{error || 'Event not found'}</div>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Navigation */}
      {user ? (
        <UnifiedNavbar
          onNavigate={(view) => {
            if (view === 'explore') {
              navigate('/explore-events');
            } else if (view === 'my-dashboard') {
              navigate('/dashboard');
            }
          }}
          currentView="explore"
        />
      ) : (
        <LandingNavbar />
      )}

      {/* Back Button */}
      <div className="bg-neutral-900 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Event Image */}
          <div className="space-y-6">
            <div className="relative h-96 rounded-xl overflow-hidden">
              <img
                src={event.image}
                alt={event.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = getDefaultEventImage();
                }}
              />
              <div className="absolute top-4 right-4">
                {getStatusBadge()}
              </div>
            </div>

            {/* Tags */}
            {event.tags && event.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {event.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="bg-purple-900/50 text-purple-300 px-3 py-1 rounded-full text-sm font-medium border border-purple-700/50"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Event Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-white mb-4">{event.title}</h1>
              <p className="text-gray-300 text-lg leading-relaxed">{event.description}</p>
            </div>

            {/* Event Info */}
            <div className="space-y-4">
              <div className="flex items-center text-gray-300">
                <svg className="w-5 h-5 mr-3 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>{formatDate(event.date)} at {event.time}</span>
              </div>

              <div className="flex items-center text-gray-300">
                <span className="text-purple-400 mr-3 text-lg">📍</span>
                <span>Location: {event.locationName || decodeLocation(event.location || '')}</span>
              </div>

              <div className="flex items-center text-gray-300">
                <svg className="w-5 h-5 mr-3 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span>Hosted by {event.hostName || 'Unknown Host'}</span>
              </div>

              <div className="flex items-center text-gray-300">
                <svg className="w-5 h-5 mr-3 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span>{event.seatsLeft} of {event.capacity} seats available</span>
              </div>
            </div>

            {/* Map Preview */}
            <div className="space-y-3">
              <h3 className="text-xl font-semibold text-white">Event Location</h3>
              <MapPreview
                locationName={event.locationName || decodeLocation(event.location || '')}
              />
            </div>

            {/* Ticket Tiers */}
            {event.ticketTiers && event.ticketTiers.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-white">Select Ticket Type</h3>
                <div className="space-y-3">
                  {event.ticketTiers.map((tier) => (
                    <div
                      key={tier.id}
                      className={`p-4 rounded-lg border cursor-pointer transition-all ${
                        selectedTier?.id === tier.id
                          ? 'border-purple-500 bg-purple-900/20'
                          : 'border-gray-700 bg-neutral-800 hover:border-gray-600'
                      }`}
                      onClick={() => setSelectedTier(tier)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-white font-medium">{tier.name}</h4>
                          {tier.description && (
                            <p className="text-gray-400 text-sm mt-1">{tier.description}</p>
                          )}
                          <p className="text-gray-400 text-sm mt-1">{tier.seats} seats available</p>
                        </div>
                        <div className="text-right">
                          <div className="text-white font-semibold">{formatPrice(tier.price)}</div>
                          {tier.seats <= 0 && (
                            <div className="text-red-400 text-sm">Sold Out</div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Ticket Quantity */}
            {isEventBookable() && (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-white">Number of Tickets</h3>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setTicketCount(Math.max(1, ticketCount - 1))}
                    className="w-10 h-10 rounded-full bg-neutral-800 border border-gray-700 text-white hover:bg-neutral-700 transition-colors"
                  >
                    -
                  </button>
                  <span className="text-white text-lg font-medium w-8 text-center">{ticketCount}</span>
                  <button
                    onClick={() => setTicketCount(Math.min(10, ticketCount + 1))}
                    className="w-10 h-10 rounded-full bg-neutral-800 border border-gray-700 text-white hover:bg-neutral-700 transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            {/* Booking Section */}
            <div className="space-y-4">
              {(() => {
                // Check if host is trying to book their own event
                const isOwnEvent = userData?.role === 'host' && event?.hostId === user?.uid;
                const canBook = isEventBookable() && !isOwnEvent;

                if (isOwnEvent) {
                  return (
                    <div className="text-center py-4">
                      <div className="text-gray-400 mb-2">This is your event</div>
                      <div className="text-sm text-gray-500">You cannot book tickets for your own event</div>
                    </div>
                  );
                }

                if (canBook) {
                  return (
                    <div className="space-y-4">
                      <div className="bg-neutral-800 p-4 rounded-lg">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-300">Total Cost:</span>
                          <span className="text-white text-xl font-semibold">
                            {selectedTier
                              ? formatPrice(selectedTier.price * ticketCount)
                              : formatPrice(event.price * ticketCount)
                            }
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={handleBookTicket}
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-4 rounded-lg transition-colors text-lg"
                      >
                        {user ? 'Book Tickets' : 'Sign In to Book'}
                      </button>
                    </div>
                  );
                } else {
                  return (
                    <div className="text-center py-4">
                      <div className="text-gray-400 mb-2">This event is not available for booking</div>
                      {!user && (
                        <button
                          onClick={() => navigate('/login')}
                          className="text-purple-400 hover:text-purple-300 transition-colors"
                        >
                          Sign in to view booking options
                        </button>
                      )}
                    </div>
                  );
                }
              })()}
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      <BookingModal
        event={event}
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        onBookingSuccess={handleBookingSuccess}
      />
    </div>
  );
};

export default EventDetail;
