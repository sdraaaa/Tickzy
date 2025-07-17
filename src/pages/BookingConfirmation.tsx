import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, Calendar, MapPin, Users, DollarSign, Ticket, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const BookingConfirmation: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { currentUser } = useAuth();
  const [bookingDetails, setBookingDetails] = useState<any>(null);

  // Extract booking details from URL parameters
  const eventId = searchParams.get('eventId');
  const eventTitle = searchParams.get('eventTitle');
  const eventDate = searchParams.get('eventDate');
  const eventLocation = searchParams.get('eventLocation');
  const ticketCount = searchParams.get('ticketCount');
  const totalPrice = searchParams.get('totalPrice');
  const eventImage = searchParams.get('eventImage');

  useEffect(() => {
    // Validate that all required booking parameters are present
    if (!eventId || !eventTitle || !ticketCount || !totalPrice) {
      navigate('/');
      return;
    }

    // Set booking details from URL parameters
    setBookingDetails({
      eventId,
      eventTitle,
      eventDate,
      eventLocation,
      ticketCount: parseInt(ticketCount),
      totalPrice: parseFloat(totalPrice),
      eventImage,
      bookingId: `TKZ-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      bookingDate: new Date().toLocaleDateString(),
      userEmail: currentUser?.email
    });
  }, [currentUser, navigate, eventId, eventTitle, ticketCount, totalPrice, eventDate, eventLocation, eventImage]);

  // Don't render anything if booking details are not available
  if (!bookingDetails) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Booking Confirmed!</h1>
          <p className="text-lg text-gray-600">
            Your tickets have been successfully booked. Check your email for confirmation details.
          </p>
        </div>

        {/* Booking Details Card */}
        <div className="bg-white rounded-2xl shadow-card p-8 mb-6">
          <div className="border-b border-gray-200 pb-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Booking Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Booking ID</p>
                <p className="font-semibold text-gray-900">{bookingDetails.bookingId}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Booking Date</p>
                <p className="font-semibold text-gray-900">{bookingDetails.bookingDate}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-semibold text-gray-900">{bookingDetails.userEmail}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Number of Tickets</p>
                <p className="font-semibold text-gray-900">{bookingDetails.ticketCount}</p>
              </div>
            </div>
          </div>

          {/* Event Details */}
          <div className="flex flex-col md:flex-row gap-6">
            {bookingDetails.eventImage && (
              <div className="md:w-48 h-32 md:h-48 rounded-xl overflow-hidden bg-gray-200 flex-shrink-0">
                <img
                  src={bookingDetails.eventImage}
                  alt={bookingDetails.eventTitle}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">{bookingDetails.eventTitle}</h3>
              
              <div className="space-y-3">
                {bookingDetails.eventDate && (
                  <div className="flex items-center text-gray-600">
                    <Calendar className="w-5 h-5 mr-3" />
                    <span>{bookingDetails.eventDate}</span>
                  </div>
                )}
                
                {bookingDetails.eventLocation && (
                  <div className="flex items-center text-gray-600">
                    <MapPin className="w-5 h-5 mr-3" />
                    <span>{bookingDetails.eventLocation}</span>
                  </div>
                )}
                
                <div className="flex items-center text-gray-600">
                  <Users className="w-5 h-5 mr-3" />
                  <span>{bookingDetails.ticketCount} ticket{bookingDetails.ticketCount > 1 ? 's' : ''}</span>
                </div>
                
                <div className="flex items-center text-gray-600">
                  <DollarSign className="w-5 h-5 mr-3" />
                  <span className="text-2xl font-bold text-primary-500">${bookingDetails.totalPrice}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">What's Next?</h3>
          <ul className="space-y-2 text-blue-800">
            <li className="flex items-start">
              <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
              <span>A confirmation email has been sent to {bookingDetails.userEmail}</span>
            </li>
            <li className="flex items-start">
              <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
              <span>Your tickets will be available in your dashboard</span>
            </li>
            <li className="flex items-start">
              <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
              <span>Present your booking ID at the event entrance</span>
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex-1 btn-primary flex items-center justify-center"
          >
            <Ticket className="w-5 h-5 mr-2" />
            View My Tickets
          </button>
          
          <button
            onClick={() => navigate('/')}
            className="flex-1 btn-secondary flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Browse More Events
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmation;
