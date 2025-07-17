import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, Ticket, Heart, Clock, MapPin, Star, TrendingUp, User, Send, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import FestiveBanner from '../components/UI/FestiveBanner';
import { useAuth } from '@/contexts/AuthContext';
import { subscribeToPopularEvents, Event } from '@/services/eventsService';
import { subscribeToUserHostStatus, submitHostRequest, HostStatus } from '@/services/hostService';

const UserDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [recommendedEvents, setRecommendedEvents] = useState<Event[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Host request state
  const [hostStatus, setHostStatus] = useState<HostStatus>('none');
  const [hostRequestMessage, setHostRequestMessage] = useState('');
  const [showHostRequestForm, setShowHostRequestForm] = useState(false);
  const [hostRequestLoading, setHostRequestLoading] = useState(false);
  const [hostRequestDate, setHostRequestDate] = useState<any>(null);

  // Mock user tickets
  const upcomingEvents = [
    {
      id: '1',
      title: 'Summer Music Festival 2024',
      date: 'Aug 15, 2024',
      time: '6:00 PM',
      location: 'Central Park, New York',
      ticketType: 'VIP',
      status: 'confirmed',
      image: 'https://images.pexels.com/photos/1190298/pexels-photo-1190298.jpeg?auto=compress&cs=tinysrgb&w=400'
    },
    {
      id: '2',
      title: 'Tech Conference 2024',
      date: 'Sep 20, 2024',
      time: '9:00 AM',
      location: 'Convention Center, San Francisco',
      ticketType: 'General',
      status: 'confirmed',
      image: 'https://images.pexels.com/photos/2774556/pexels-photo-2774556.jpeg?auto=compress&cs=tinysrgb&w=400'
    }
  ];

  const myTickets = [
    {
      id: '1',
      eventTitle: 'Summer Music Festival 2024',
      date: 'Aug 15, 2024',
      time: '6:00 PM',
      venue: 'Central Park, New York',
      ticketType: 'VIP',
      qrCode: 'QR123456',
      status: 'active',
      image: 'https://images.pexels.com/photos/1190298/pexels-photo-1190298.jpeg?auto=compress&cs=tinysrgb&w=400'
    },
    {
      id: '2',
      eventTitle: 'Food & Wine Tasting',
      date: 'Aug 25, 2024',
      time: '7:00 PM',
      venue: 'Downtown Restaurant, Chicago',
      ticketType: 'General',
      qrCode: 'QR789012',
      status: 'active',
      image: 'https://images.pexels.com/photos/1581384/pexels-photo-1581384.jpeg?auto=compress&cs=tinysrgb&w=400'
    }
  ];

  // Load recommended events from Firebase
  useEffect(() => {
    setLoading(true);
    setError(null);

    const unsubscribe = subscribeToPopularEvents((fetchedEvents) => {
      setRecommendedEvents(fetchedEvents);
      setLoading(false);
    }, 3); // Limit to 3 recommended events

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  // Subscribe to user's host status
  useEffect(() => {
    if (!currentUser) return;

    const unsubscribe = subscribeToUserHostStatus(currentUser.uid, (hostData) => {
      setHostStatus(hostData.hostStatus || 'none');
      setHostRequestDate(hostData.hostRequestDate);
    });

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [currentUser]);

  if (loading) {
    return (
      <div className="pt-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="animate-pulse space-y-8">
          <div className="h-48 bg-gray-200 rounded-2xl"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-2xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const handleBooking = (event: any) => {
    if (!currentUser) {
      // Store the intended booking URL for redirect after login
      sessionStorage.setItem('returnUrl', `/event/${event.id}?booking=true`);
      sessionStorage.setItem('bookingIntent', 'true');

      // Navigate to login with booking message
      const message = encodeURIComponent('Please log in to book tickets for this event');
      navigate(`/login?message=${message}`);
    } else {
      // User is authenticated, navigate to event details page
      navigate(`/event/${event.id}`);
    }
  };

  const handleHostRequest = async () => {
    if (!currentUser || !hostRequestMessage.trim()) return;

    setHostRequestLoading(true);
    try {
      const success = await submitHostRequest(currentUser.uid, hostRequestMessage.trim());
      if (success) {
        setShowHostRequestForm(false);
        setHostRequestMessage('');
        // Status will be updated via the subscription
      } else {
        setError('Failed to submit host request. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting host request:', error);
      setError('Failed to submit host request. Please try again.');
    } finally {
      setHostRequestLoading(false);
    }
  };

  const getHostStatusDisplay = () => {
    switch (hostStatus) {
      case 'pending':
        return {
          icon: <AlertCircle className="w-5 h-5 text-yellow-500" />,
          text: 'Host Request Pending',
          description: 'Your request to become a host is being reviewed by our admin team.',
          color: 'yellow'
        };
      case 'approved':
        return {
          icon: <CheckCircle className="w-5 h-5 text-green-500" />,
          text: 'Host Status: Approved',
          description: 'Congratulations! You can now create events.',
          color: 'green'
        };
      case 'rejected':
        return {
          icon: <XCircle className="w-5 h-5 text-red-500" />,
          text: 'Host Request Rejected',
          description: 'Your host request was not approved. You can submit a new request.',
          color: 'red'
        };
      default:
        return null;
    }
  };

  return (
    <div className="pt-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Festive Banner */}
      <FestiveBanner
        title="🎫 Welcome Back!"
        subtitle="Your personalized event dashboard"
        image="https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg?auto=compress&cs=tinysrgb&w=1200"
      />

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-2xl p-6 shadow-soft">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
              <Ticket className="w-6 h-6 text-primary-500" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">{myTickets.length}</p>
              <p className="text-gray-600">Active Tickets</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl p-6 shadow-soft">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <Calendar className="w-6 h-6 text-green-500" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">{upcomingEvents.length}</p>
              <p className="text-gray-600">Upcoming Events</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl p-6 shadow-soft">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <Heart className="w-6 h-6 text-purple-500" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">12</p>
              <p className="text-gray-600">Saved Events</p>
            </div>
          </div>
        </div>
      </div>

      {/* Host Request Section */}
      {currentUser && (
        <div className="mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-soft">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <User className="w-6 h-6 text-primary-500 mr-3" />
                <h2 className="text-xl font-bold text-gray-900">Host Status</h2>
              </div>
            </div>

            {/* Host Status Display */}
            {hostStatus !== 'none' && (
              <div className={`mb-4 p-4 rounded-xl border ${
                getHostStatusDisplay()?.color === 'yellow' ? 'bg-yellow-50 border-yellow-200' :
                getHostStatusDisplay()?.color === 'green' ? 'bg-green-50 border-green-200' :
                'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-start">
                  {getHostStatusDisplay()?.icon}
                  <div className="ml-3">
                    <h3 className="font-semibold text-gray-900">{getHostStatusDisplay()?.text}</h3>
                    <p className="text-sm text-gray-600 mt-1">{getHostStatusDisplay()?.description}</p>
                    {hostRequestDate && (
                      <p className="text-xs text-gray-500 mt-2">
                        Requested: {hostRequestDate}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Host Request Actions */}
            {(hostStatus === 'none' || hostStatus === 'rejected') && !showHostRequestForm && (
              <div className="text-center py-4">
                <p className="text-gray-600 mb-4">
                  Want to host your own events? Apply to become a host and start creating amazing experiences!
                </p>
                <button
                  onClick={() => setShowHostRequestForm(true)}
                  className="btn-primary flex items-center mx-auto"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Request to Become Host
                </button>
              </div>
            )}

            {/* Host Request Form */}
            {showHostRequestForm && (
              <div className="border-t pt-4">
                <h3 className="font-semibold text-gray-900 mb-3">Host Application</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Why do you want to become a host? *
                    </label>
                    <textarea
                      value={hostRequestMessage}
                      onChange={(e) => setHostRequestMessage(e.target.value)}
                      placeholder="Tell us about your experience, the types of events you'd like to host, and why you'd be a great host..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                      rows={4}
                      maxLength={500}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {hostRequestMessage.length}/500 characters
                    </p>
                  </div>

                  <div className="flex space-x-3">
                    <button
                      onClick={handleHostRequest}
                      disabled={!hostRequestMessage.trim() || hostRequestLoading}
                      className="btn-primary flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {hostRequestLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Submit Request
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setShowHostRequestForm(false);
                        setHostRequestMessage('');
                      }}
                      className="btn-secondary"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Approved Host Actions */}
            {hostStatus === 'approved' && (
              <div className="text-center py-4">
                <Link
                  to="/host/create"
                  className="btn-primary flex items-center mx-auto"
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Create New Event
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Upcoming Events */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Upcoming Events</h2>
          <Link to="/events" className="text-primary-500 hover:text-primary-600 font-medium">
            View All
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {upcomingEvents.map((event) => (
            <div key={event.id} className="bg-white rounded-2xl p-6 shadow-soft border-l-4 border-primary-500">
              <div className="flex items-center">
                <img
                  src={event.image}
                  alt={event.title}
                  className="w-20 h-20 rounded-xl object-cover"
                />
                <div className="ml-4 flex-1">
                  <h3 className="font-bold text-gray-900 mb-2">{event.title}</h3>
                  <div className="flex items-center text-sm text-gray-600 mb-2">
                    <Calendar className="w-4 h-4 mr-2" />
                    {event.date} • {event.time}
                  </div>
                  <div className="flex items-center text-sm text-gray-600 mb-3">
                    <MapPin className="w-4 h-4 mr-2" />
                    {event.location}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-xs font-medium">
                      {event.ticketType} Ticket
                    </span>
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium">
                      {event.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* My Tickets */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">My Tickets</h2>
          <Link to="/tickets" className="text-primary-500 hover:text-primary-600 font-medium">
            Manage Tickets
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {myTickets.map((ticket) => (
            <div key={ticket.id} className="bg-white rounded-2xl shadow-soft overflow-hidden">
              <div className="bg-gradient-to-r from-primary-500 to-primary-600 p-4">
                <div className="flex items-center justify-between text-white">
                  <div>
                    <h3 className="font-bold text-lg">{ticket.eventTitle}</h3>
                    <p className="text-primary-100">{ticket.ticketType} Ticket</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm">{ticket.date}</p>
                    <p className="text-sm">{ticket.time}</p>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Venue</p>
                    <p className="font-medium text-gray-900">{ticket.venue}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600 mb-1">QR Code</p>
                    <p className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">{ticket.qrCode}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium">
                    Active
                  </span>
                  <button className="text-primary-500 hover:text-primary-600 text-sm font-medium">
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recommended Events */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Recommended for You</h2>
          <button className="text-primary-500 hover:text-primary-600 font-medium">
            <TrendingUp className="w-4 h-4 mr-1 inline" />
            Refresh
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {recommendedEvents.map((event) => (
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
                    <Heart className="w-4 h-4 text-gray-600 hover:text-red-500 transition-colors duration-300" />
                  </div>
                  <div className="absolute bottom-4 right-4 bg-primary-500 text-white px-3 py-1 rounded-xl font-bold">
                    ${event.price}
                  </div>
                </div>
                <div className="p-6 pb-4">
                  <h3 className="font-bold text-gray-900 mb-2 line-clamp-2">{event.title}</h3>
                  <div className="flex items-center text-gray-600 mb-2">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span className="text-sm">{event.date} • {event.time}</span>
                  </div>
                  <div className="flex items-center text-gray-600 mb-4">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span className="text-sm truncate">{event.location}</span>
                  </div>
                </div>
              </Link>
              <div className="px-6 pb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                    <span className="text-sm text-gray-600">{event.rating}</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      handleBooking(event);
                    }}
                    className="bg-primary-500 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-primary-600 transition-colors duration-300"
                  >
                    <Ticket className="w-4 h-4 mr-1 inline" />
                    {currentUser ? 'Book Ticket' : 'Login to Book'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;