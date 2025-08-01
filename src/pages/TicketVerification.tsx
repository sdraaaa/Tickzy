/**
 * Ticket Verification Page
 * 
 * Shows booking details when QR code is scanned
 */

import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { getBookingById, getEventById } from '../services/firestore';
import { Booking, Event } from '../types';
import { useAuth } from '../contexts/AuthContext';
import UnifiedNavbar from '../components/ui/UnifiedNavbar';
import LandingNavbar from '../components/Landing/LandingNavbar';

const TicketVerification: React.FC = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const eventId = searchParams.get('event');
  
  const [booking, setBooking] = useState<Booking | null>(null);
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTicketData = async () => {
      if (!bookingId) {
        setError('Invalid ticket - missing booking ID');
        setLoading(false);
        return;
      }

      try {
        // Fetch booking details
        const bookingData = await getBookingById(bookingId);
        if (!bookingData) {
          setError('Ticket not found - invalid booking ID');
          setLoading(false);
          return;
        }

        setBooking(bookingData);

        // Fetch event details if eventId is provided
        if (eventId) {
          const eventData = await getEventById(eventId);
          setEvent(eventData);
        }

        setLoading(false);
      } catch (err) {
        console.error('Error fetching ticket data:', err);
        setError('Failed to verify ticket');
        setLoading(false);
      }
    };

    fetchTicketData();
  }, [bookingId, eventId]);

  if (loading) {
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
            currentView={null}
          />
        ) : (
          <LandingNavbar />
        )}

        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
            <p className="text-white">Verifying ticket...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !booking) {
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
            currentView={null}
          />
        ) : (
          <LandingNavbar />
        )}

        <div className="flex items-center justify-center py-8">
          <div className="max-w-md mx-auto text-center p-6">
            <div className="w-20 h-20 bg-red-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white mb-4">Invalid Ticket</h1>
            <p className="text-gray-400 mb-6">{error}</p>
            <a
              href="/"
              className="inline-block bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200"
            >
              Go to Homepage
            </a>
          </div>
        </div>
      </div>
    );
  }

  const isValidTicket = booking.status === 'booked' || booking.status === 'confirmed';
  const eventDate = new Date(booking.eventDate);
  const now = new Date();
  const isEventToday = eventDate.toDateString() === now.toDateString();
  const isEventPast = eventDate < now;

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
          currentView={null}
        />
      ) : (
        <LandingNavbar />
      )}

      <div className="py-8">
        <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${
            isValidTicket ? 'bg-green-600/20' : 'bg-red-600/20'
          }`}>
            {isValidTicket ? (
              <svg className="w-10 h-10 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg className="w-10 h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
          </div>
          <h1 className={`text-3xl font-bold mb-2 ${
            isValidTicket ? 'text-green-400' : 'text-red-400'
          }`}>
            {isValidTicket ? 'Valid Ticket' : 'Invalid Ticket'}
          </h1>
          <p className="text-gray-400">
            {isValidTicket ? 'This ticket is verified and valid for entry' : 'This ticket cannot be used for entry'}
          </p>
        </div>

        {/* Ticket Details */}
        <div className="bg-neutral-800 rounded-xl border border-gray-700 overflow-hidden">
          {/* Event Image */}
          {booking.eventImage && (
            <div className="h-48 relative">
              <img
                src={booking.eventImage}
                alt={booking.eventTitle}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            </div>
          )}

          <div className="p-6">
            {/* Event Title */}
            <h2 className="text-2xl font-bold text-white mb-4">{booking.eventTitle}</h2>

            {/* Event Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="space-y-3">
                <div className="flex items-center text-gray-300">
                  <svg className="w-5 h-5 mr-3 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>{new Date(booking.eventDate).toLocaleDateString()} at {booking.eventTime}</span>
                </div>
                <div className="flex items-center text-gray-300">
                  <svg className="w-5 h-5 mr-3 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>{booking.eventLocation}</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center text-gray-300">
                  <svg className="w-5 h-5 mr-3 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                  </svg>
                  <span>{booking.ticketCount} ticket{booking.ticketCount !== 1 ? 's' : ''}</span>
                </div>
                <div className="flex items-center text-gray-300">
                  <svg className="w-5 h-5 mr-3 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                  <span>${booking.totalAmount}</span>
                </div>
              </div>
            </div>

            {/* Booking Info */}
            <div className="border-t border-gray-700 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">Booking ID:</span>
                  <span className="text-white ml-2 font-mono">{booking.id}</span>
                </div>
                <div>
                  <span className="text-gray-400">Booked by:</span>
                  <span className="text-white ml-2">{booking.userName}</span>
                </div>
                <div>
                  <span className="text-gray-400">Booking Date:</span>
                  <span className="text-white ml-2">{new Date(booking.bookingDate).toLocaleDateString()}</span>
                </div>
                <div>
                  <span className="text-gray-400">Status:</span>
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                    booking.status === 'booked' || booking.status === 'confirmed'
                      ? 'bg-green-600/20 text-green-400'
                      : booking.status === 'cancelled'
                      ? 'bg-red-600/20 text-red-400'
                      : 'bg-yellow-600/20 text-yellow-400'
                  }`}>
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  </span>
                </div>
              </div>
            </div>

            {/* Event Status Warnings */}
            {isEventPast && (
              <div className="mt-4 p-3 bg-yellow-600/20 border border-yellow-600/30 rounded-lg">
                <p className="text-yellow-400 text-sm">⚠️ This event has already ended.</p>
              </div>
            )}
            
            {isEventToday && !isEventPast && (
              <div className="mt-4 p-3 bg-green-600/20 border border-green-600/30 rounded-lg">
                <p className="text-green-400 text-sm">🎉 This event is happening today!</p>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 text-center">
          <a
            href="/"
            className="inline-block bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200"
          >
            Back to Tickzy
          </a>
        </div>
        </div>
      </div>
    </div>
  );
};

export default TicketVerification;
