/**
 * TicketModal Component
 * 
 * Modal to display ticket details with QR code
 */

import React from 'react';
import { Booking } from '../../types';

interface TicketModalProps {
  booking: Booking | null;
  isOpen: boolean;
  onClose: () => void;
}

const TicketModal: React.FC<TicketModalProps> = ({ booking, isOpen, onClose }) => {
  if (!isOpen || !booking) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-neutral-800 rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white">Your Ticket</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors duration-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Ticket Content */}
        <div className="p-6">
          {/* Event Banner */}
          <div className="relative h-32 rounded-lg overflow-hidden mb-6">
            <img
              src={booking.eventImage}
              alt={booking.eventTitle}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            <div className="absolute bottom-3 left-3">
              <h3 className="text-white font-semibold text-lg">{booking.eventTitle}</h3>
            </div>
          </div>

          {/* Ticket Details */}
          <div className="space-y-4 mb-6">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Ticket Type</span>
              <span className="text-white font-medium">{booking.ticketTier.toUpperCase()}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Date & Time</span>
              <span className="text-white font-medium">
                {new Date(booking.eventDate).toLocaleDateString()} at {booking.eventTime}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Venue</span>
              <span className="text-white font-medium">{booking.eventLocation}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Tickets</span>
              <span className="text-white font-medium">{booking.ticketCount}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Total Paid</span>
              <span className="text-white font-medium">${booking.totalAmount}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Booking ID</span>
              <span className="text-white font-medium text-sm">{booking.id}</span>
            </div>
          </div>

          {/* QR Code */}
          <div className="bg-white rounded-lg p-6 text-center">
            <div className="w-48 h-48 mx-auto mb-4 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
              {booking.qrCode ? (
                <img
                  src={booking.qrCode}
                  alt="Ticket QR Code"
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="text-gray-500 text-sm">
                  QR Code not available
                </div>
              )}
            </div>
            <p className="text-gray-600 text-sm">
              Show this QR code at the venue entrance
            </p>
            <p className="text-gray-500 text-xs mt-1 break-all">
              {booking.qrCodeData || booking.id}
            </p>
          </div>

          {/* Status Badge */}
          <div className="mt-6 text-center">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              booking.status === 'confirmed' 
                ? 'bg-green-900/50 text-green-300 border border-green-700'
                : booking.status === 'pending'
                ? 'bg-yellow-900/50 text-yellow-300 border border-yellow-700'
                : 'bg-gray-900/50 text-gray-300 border border-gray-700'
            }`}>
              {booking.status === 'confirmed' && '✓ '}
              {booking.status === 'pending' && '⏳ '}
              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 space-y-3">
            <button
              onClick={() => {
                // TODO: Implement download ticket functionality
                console.log('Download ticket');
              }}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 rounded-lg transition-colors duration-200"
            >
              Download Ticket
            </button>
            
            <button
              onClick={() => {
                // TODO: Implement share functionality
                console.log('Share ticket');
              }}
              className="w-full border border-gray-600 text-gray-300 hover:text-white hover:border-gray-500 font-medium py-3 rounded-lg transition-colors duration-200"
            >
              Share Ticket
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketModal;
