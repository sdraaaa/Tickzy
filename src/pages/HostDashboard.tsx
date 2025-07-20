import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Plus, Calendar, Users, DollarSign, TrendingUp, Eye, Edit, Trash2, MoreHorizontal, CheckCircle, X, Clock, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { subscribeToHostEvents, Event } from '@/services/eventsService';
import EventStatusBadge, { EventStatus } from '@/components/Events/EventStatusBadge';

const HostDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const [selectedTab, setSelectedTab] = useState('overview');
  const [showMessage, setShowMessage] = useState(false);
  const [hostEvents, setHostEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  // Handle success/error messages from navigation state
  useEffect(() => {
    if (location.state?.message) {
      setShowMessage(true);
      // Clear the message from history state
      window.history.replaceState({}, document.title);

      // Auto-hide message after 5 seconds
      const timer = setTimeout(() => {
        setShowMessage(false);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [location.state]);

  // Subscribe to host events
  useEffect(() => {
    if (!currentUser) return;

    const unsubscribe = subscribeToHostEvents(currentUser.uid, (events) => {
      setHostEvents(events);
      setLoading(false);
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [currentUser]);

  // Calculate stats from real events
  const stats = {
    totalEvents: hostEvents.length,
    publishedEvents: hostEvents.filter(e => e.status === 'approved').length,
    pendingEvents: hostEvents.filter(e => e.status === 'pending').length,
    totalRevenue: hostEvents.reduce((total, event) => {
      if (event.status === 'approved') {
        return total + (event.price * (event.attendees || 0));
      }
      return total;
    }, 0),
    totalTicketsSold: hostEvents.reduce((total, event) => {
      if (event.status === 'approved') {
        return total + (event.attendees || 0);
      }
      return total;
    }, 0)
  };

  const events = [
    {
      id: '1',
      title: 'Summer Music Festival 2024',
      date: 'Aug 15, 2024',
      status: 'Published',
      ticketsSold: 245,
      revenue: 12250,
      image: 'https://images.pexels.com/photos/1190298/pexels-photo-1190298.jpeg?auto=compress&cs=tinysrgb&w=400',
    },
    {
      id: '2',
      title: 'Tech Conference 2024',
      date: 'Sep 20, 2024',
      status: 'Draft',
      ticketsSold: 0,
      revenue: 0,
      image: 'https://images.pexels.com/photos/2774556/pexels-photo-2774556.jpeg?auto=compress&cs=tinysrgb&w=400',
    },
    {
      id: '3',
      title: 'Food & Wine Tasting',
      date: 'Aug 25, 2024',
      status: 'Published',
      ticketsSold: 67,
      revenue: 8375,
      image: 'https://images.pexels.com/photos/1581384/pexels-photo-1581384.jpeg?auto=compress&cs=tinysrgb&w=400',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'rejected':
        return <X className="w-4 h-4 text-red-600" />;
      case 'cancelled':
        return <AlertCircle className="w-4 h-4 text-gray-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved':
        return 'Approved';
      case 'pending':
        return 'Pending Approval';
      case 'rejected':
        return 'Rejected';
      case 'cancelled':
        return 'Cancelled';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className="pt-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Success/Error Message */}
      {showMessage && location.state?.message && (
        <div className={`mb-6 p-4 rounded-xl flex items-center justify-between ${
          location.state?.type === 'success'
            ? 'bg-green-50 border border-green-200'
            : 'bg-red-50 border border-red-200'
        }`}>
          <div className="flex items-center">
            <CheckCircle className={`w-5 h-5 mr-3 ${
              location.state?.type === 'success' ? 'text-green-500' : 'text-red-500'
            }`} />
            <p className={`font-medium ${
              location.state?.type === 'success' ? 'text-green-800' : 'text-red-800'
            }`}>
              {location.state.message}
            </p>
          </div>
          <button
            onClick={() => setShowMessage(false)}
            className={`p-1 rounded-lg hover:bg-opacity-20 ${
              location.state?.type === 'success'
                ? 'text-green-600 hover:bg-green-600'
                : 'text-red-600 hover:bg-red-600'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Host Dashboard</h1>
          <p className="text-gray-600">Manage your events and track performance</p>
        </div>
        <Link to="/host/create" className="btn-primary mt-4 sm:mt-0">
          <Plus className="w-5 h-5 mr-2" />
          Create Event
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-2xl p-6 shadow-soft">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
              <Calendar className="w-6 h-6 text-primary-500" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">{stats.totalEvents}</p>
              <p className="text-gray-600">Total Events</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl p-6 shadow-soft">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-green-500" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">{stats.totalTicketsSold.toLocaleString()}</p>
              <p className="text-gray-600">Tickets Sold</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl p-6 shadow-soft">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-purple-500" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">${stats.totalRevenue.toLocaleString()}</p>
              <p className="text-gray-600">Total Revenue</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl p-6 shadow-soft">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-orange-500" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">{stats.publishedEvents}</p>
              <p className="text-gray-600">Published Events</p>
            </div>
          </div>
        </div>
      </div>

      {/* Pending Events Alert */}
      {stats.pendingEvents > 0 && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
          <div className="flex items-center">
            <Clock className="w-5 h-5 text-yellow-600 mr-3" />
            <div>
              <p className="font-medium text-yellow-800">
                {stats.pendingEvents} event{stats.pendingEvents > 1 ? 's' : ''} pending approval
              </p>
              <p className="text-sm text-yellow-700">
                Your events are being reviewed by our admin team. You'll be notified once they're approved.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-2xl shadow-soft mb-8">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {['overview', 'events', 'analytics'].map((tab) => (
              <button
                key={tab}
                onClick={() => setSelectedTab(tab)}
                className={`py-4 px-1 border-b-2 font-medium text-sm capitalize transition-all duration-300 ${
                  selectedTab === tab
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {selectedTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Events</h2>
                <div className="space-y-4">
                  {events.slice(0, 3).map((event) => (
                    <div key={event.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center">
                        <img
                          src={event.image}
                          alt={event.title}
                          className="w-16 h-16 rounded-xl object-cover"
                        />
                        <div className="ml-4">
                          <h3 className="font-semibold text-gray-900">{event.title}</h3>
                          <p className="text-sm text-gray-600">{event.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                          {event.status}
                        </span>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">{event.ticketsSold} sold</p>
                          <p className="text-sm text-gray-600">${event.revenue.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {selectedTab === 'events' && (
            <div>
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900">All Events</h2>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Event</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Date</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Status</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Tickets Sold</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Revenue</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto mb-4"></div>
                          <p className="text-gray-600">Loading your events...</p>
                        </td>
                      </tr>
                    ) : hostEvents.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center">
                          <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 mb-2">No Events Yet</h3>
                          <p className="text-gray-600 mb-4">Create your first event to get started!</p>
                          <Link to="/host/create" className="btn-primary">
                            <Plus className="w-4 h-4 mr-2" />
                            Create Event
                          </Link>
                        </td>
                      </tr>
                    ) : (
                      hostEvents.map((event) => (
                        <tr key={event.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200">
                          <td className="py-4 px-4">
                            <div className="flex items-center">
                              <img
                                src={event.image}
                                alt={event.title}
                                className="w-12 h-12 rounded-lg object-cover mr-3"
                                onError={(e) => {
                                  e.currentTarget.src = 'https://images.pexels.com/photos/1190298/pexels-photo-1190298.jpeg?auto=compress&cs=tinysrgb&w=400';
                                }}
                              />
                              <div>
                                <p className="font-medium text-gray-900">{event.title}</p>
                                <p className="text-sm text-gray-600">{event.location}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-gray-600">{event.date} • {event.time}</td>
                          <td className="py-4 px-4">
                            <EventStatusBadge
                              status={(event.status || 'pending') as EventStatus}
                              size="sm"
                            />
                          </td>
                          <td className="py-4 px-4 text-gray-600">{event.attendees || 0}</td>
                          <td className="py-4 px-4 text-gray-600">${(event.price || 0).toLocaleString()}</td>
                        <td className="py-4 px-4">
                          <div className="flex justify-end space-x-2">
                            <button className="p-2 text-gray-400 hover:text-primary-500 rounded-lg hover:bg-primary-50 transition-all duration-200">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button className="p-2 text-gray-400 hover:text-blue-500 rounded-lg hover:bg-blue-50 transition-all duration-200">
                              <Edit className="w-4 h-4" />
                            </button>
                            <button className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-all duration-200">
                              <Trash2 className="w-4 h-4" />
                            </button>
                            <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50 transition-all duration-200">
                              <MoreHorizontal className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                          </tr>
                        ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {selectedTab === 'analytics' && (
            <div className="text-center py-12">
              <TrendingUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-500 mb-2">Analytics Coming Soon</h3>
              <p className="text-gray-400">Detailed analytics and reporting features will be available soon</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HostDashboard;