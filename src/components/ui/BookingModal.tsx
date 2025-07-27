/**
 * BookingModal Component
 * 
 * Modal for confirming event bookings with loading states and error handling
 */

import React, { useState } from 'react';
import { Event } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { createBookingAtomic } from '../../services/firestore';
import { emailService } from '../../services/emailService';

interface BookingModalProps {
  event: Event | null;
  isOpen: boolean;
  onClose: () => void;
  onBookingSuccess: (bookingId: string) => void;
}

const BookingModal: React.FC<BookingModalProps> = ({ 
  event, 
  isOpen, 
  onClose, 
  onBookingSuccess 
}) => {
  const { user, userData } = useAuth();
  const [isBooking, setIsBooking] = useState(false);
  const [ticketCount, setTicketCount] = useState(1);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !event || !user || !userData) return null;

  const totalAmount = event.price * ticketCount;

  // Calculate available seats (handle missing seatsLeft)
  const availableSeats = event.seatsLeft !== undefined && event.seatsLeft !== null
    ? event.seatsLeft
    : Math.max(0, (event.capacity || event.totalTickets || 100) - (event.ticketsSold || 0));

  const maxTickets = Math.min(availableSeats, 10); // Limit to 10 tickets per booking

  const handleBooking = async () => {
    if (!user || !userData) return;

    // Check if event date has passed
    const eventDate = new Date(event.date);
    const now = new Date();
    now.setHours(0, 0, 0, 0); // Reset time to start of day for comparison

    if (eventDate < now) {
      setError('This event has already passed and is no longer available for booking');
      return;
    }

    setIsBooking(true);
    setError(null);

    try {
      // Create booking atomically
      const result = await createBookingAtomic(
        user.uid,
        user.email || userData.email,
        userData.displayName || user.displayName || 'User',
        event.id,
        ticketCount
      );

      if (!result.success) {
        setError(result.error || 'Failed to create booking');
        return;
      }

      // Send booking confirmation email with QR code from booking result
      try {
        const qrCode = result.qrCode || '';
        console.log('📧 QR code from booking result:', qrCode ? `Found QR code (${qrCode.length} chars)` : 'No QR code');

        await emailService.sendBookingConfirmationEmail({
          userEmail: user.email || userData.email,
          userName: userData.displayName || user.displayName || 'User',
          eventTitle: event.title,
          eventDate: new Date(event.date).toLocaleDateString(),
          eventTime: event.time,
          eventLocation: event.location,
          bookingId: result.bookingId!,
          totalAmount,
          ticketCount,
          qrCode // QR code directly from booking creation
        });
      } catch (emailError) {
        console.error('Failed to send confirmation email:', emailError);
        // Don't fail the booking if email fails
      }

      // Success!
      onBookingSuccess(result.bookingId!);
      onClose();
    } catch (error: any) {
      console.error('Booking error:', error);
      setError(error.message || 'An unexpected error occurred');
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-neutral-800 rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white">Book Event</h2>
          <button
            onClick={onClose}
            disabled={isBooking}
            className="text-gray-400 hover:text-white transition-colors duration-200 disabled:opacity-50"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Event Info */}
          <div className="mb-6">
            <div className="flex items-start space-x-4">
              <img
                src={event.image}
                alt={event.title}
                className="w-16 h-16 rounded-lg object-cover"
              />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-1">{event.title}</h3>
                <div className="space-y-1 text-sm text-gray-400">
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {new Date(event.date).toLocaleDateString()} at {event.time}
                  </div>
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {event.location}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Ticket Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Number of Tickets
            </label>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setTicketCount(Math.max(1, ticketCount - 1))}
                disabled={ticketCount <= 1 || isBooking}
                className="w-10 h-10 rounded-lg bg-neutral-700 text-white flex items-center justify-center hover:bg-neutral-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                -
              </button>
              <span className="text-xl font-semibold text-white w-12 text-center">
                {ticketCount}
              </span>
              <button
                onClick={() => setTicketCount(Math.min(maxTickets, ticketCount + 1))}
                disabled={ticketCount >= maxTickets || isBooking}
                className="w-10 h-10 rounded-lg bg-neutral-700 text-white flex items-center justify-center hover:bg-neutral-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                +
              </button>
            </div>
            <p className="text-sm text-gray-400 mt-2">
              {availableSeats} seats available • Max {maxTickets} tickets per booking
            </p>
          </div>

          {/* Price Summary */}
          <div className="mb-6 p-4 bg-neutral-700/50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-300">Price per ticket</span>
              <span className="text-white">${event.price}</span>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-300">Quantity</span>
              <span className="text-white">{ticketCount}</span>
            </div>
            <div className="border-t border-gray-600 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold text-white">Total</span>
                <span className="text-lg font-semibold text-purple-400">${totalAmount}</span>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-900/50 border border-red-700 rounded-lg">
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleBooking}
              disabled={isBooking || availableSeats < ticketCount}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-600/50 text-white font-medium py-3 rounded-lg transition-colors duration-200 flex items-center justify-center"
            >
              {isBooking ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Booking...
                </>
              ) : (
                `Book ${ticketCount} Ticket${ticketCount !== 1 ? 's' : ''} - $${totalAmount}`
              )}
            </button>
            
            <button
              onClick={onClose}
              disabled={isBooking}
              className="w-full border border-gray-600 text-gray-300 hover:text-white hover:border-gray-500 disabled:opacity-50 font-medium py-3 rounded-lg transition-colors duration-200"
            >
              Cancel
            </button>
          </div>

          {/* Terms */}
          <p className="text-xs text-gray-500 mt-4 text-center">
            By booking, you agree to our terms and conditions. 
            You will receive a confirmation email with your ticket.
          </p>
        </div>
      </div>
    </div>
  );
};

export default BookingModal;
