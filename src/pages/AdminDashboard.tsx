import React, { useState, useEffect } from 'react';
import { Users, CheckCircle, AlertTriangle, DollarSign, Calendar, Eye, Edit, Trash2, MoreHorizontal, Search, Filter, LogOut, UserCircle, Settings, UserCheck, UserX, Clock } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { subscribeToPendingHostRequests, subscribeToAllHostRequests, approveHostRequest, rejectHostRequest, HostRequest } from '@/services/hostService';
import { subscribeToEvents, Event } from '@/services/eventsService';

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('users');
  const [searchTerm, setSearchTerm] = useState('');
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const navigate = useNavigate();
  const { logout, currentUser } = useAuth();

  // State for host requests
  const [pendingHostRequests, setPendingHostRequests] = useState<HostRequest[]>([]);
  const [allHostRequests, setAllHostRequests] = useState<HostRequest[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Subscribe to host requests and events
  useEffect(() => {
    if (!currentUser) return;

    setLoading(true);

    // Subscribe to pending host requests
    const unsubscribePending = subscribeToPendingHostRequests((requests) => {
      setPendingHostRequests(requests);
    });

    // Subscribe to all host requests
    const unsubscribeAll = subscribeToAllHostRequests((requests) => {
      setAllHostRequests(requests);
    });

    // Subscribe to events
    const unsubscribeEvents = subscribeToEvents((fetchedEvents) => {
      setEvents(fetchedEvents);
      setLoading(false);
    });

    return () => {
      if (unsubscribePending) unsubscribePending();
      if (unsubscribeAll) unsubscribeAll();
      if (unsubscribeEvents) unsubscribeEvents();
    };
  }, [currentUser]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
      navigate('/', { replace: true });
    }
  };

  const handleApproveHostRequest = async (userId: string) => {
    if (!currentUser) return;

    setActionLoading(userId);
    try {
      const success = await approveHostRequest(userId, currentUser.uid);
      if (!success) {
        alert('Failed to approve host request. Please try again.');
      }
    } catch (error) {
      console.error('Error approving host request:', error);
      alert('Failed to approve host request. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectHostRequest = async (userId: string) => {
    if (!currentUser) return;

    if (!confirm('Are you sure you want to reject this host request?')) return;

    setActionLoading(userId);
    try {
      const success = await rejectHostRequest(userId, currentUser.uid);
      if (!success) {
        alert('Failed to reject host request. Please try again.');
      }
    } catch (error) {
      console.error('Error rejecting host request:', error);
      alert('Failed to reject host request. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  // Calculate stats from real data
  const stats = {
    totalUsers: allHostRequests.length + 100, // Approximate total users
    pendingHostRequests: pendingHostRequests.length,
    totalEvents: events.length,
    approvedHosts: allHostRequests.filter(req => req.hostStatus === 'approved').length,
    monthlyRevenue: events.reduce((total, event) => {
      // Calculate revenue from events (assuming some basic pricing logic)
      const eventRevenue = (event.price || 0) * (event.attendees?.length || 0);
      return total + eventRevenue;
    }, 0)
  };

  const users = [
    {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'User',
      joinDate: '2024-01-15',
      status: 'Active',
      eventsAttended: 12,
      totalSpent: 450
    },
    {
      id: '2',
      name: 'Sarah Wilson',
      email: 'sarah@example.com',
      role: 'Host',
      joinDate: '2024-02-20',
      status: 'Active',
      eventsHosted: 5,
      totalRevenue: 12500
    },
    {
      id: '3',
      name: 'Mike Johnson',
      email: 'mike@example.com',
      role: 'User',
      joinDate: '2024-03-10',
      status: 'Suspended',
      eventsAttended: 3,
      totalSpent: 150
    }
  ];

  const pendingEvents = [
    {
      id: '1',
      title: 'Summer Music Festival 2024',
      organizer: 'EventPro Productions',
      date: '2024-08-15',
      category: 'Music',
      ticketPrice: 89,
      expectedAttendees: 1000,
      status: 'Pending Review',
      submittedDate: '2024-07-01'
    },
    {
      id: '2',
      title: 'Tech Innovation Summit',
      organizer: 'TechCorp Events',
      date: '2024-09-20',
      category: 'Technology',
      ticketPrice: 299,
      expectedAttendees: 500,
      status: 'Under Review',
      submittedDate: '2024-07-05'
    }
  ];

  const refundRequests = [
    {
      id: '1',
      eventTitle: 'Cancelled Concert',
      userName: 'Alice Brown',
      userEmail: 'alice@example.com',
      amount: 120,
      reason: 'Event cancelled by organizer',
      requestDate: '2024-07-10',
      status: 'Pending'
    },
    {
      id: '2',
      eventTitle: 'Food Festival',
      userName: 'Bob Smith',
      userEmail: 'bob@example.com',
      amount: 45,
      reason: 'Unable to attend due to illness',
      requestDate: '2024-07-12',
      status: 'Under Review'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
      case 'pending review':
      case 'under review':
        return 'bg-yellow-100 text-yellow-800';
      case 'suspended':
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const tabs = [
    { id: 'users', name: 'Manage Users', icon: Users },
    { id: 'host-requests', name: 'Host Requests', icon: UserCheck, badge: pendingHostRequests.length },
    { id: 'events', name: 'Manage Events', icon: CheckCircle },
    { id: 'refunds', name: 'Refund Requests', icon: AlertTriangle }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center group-hover:bg-primary-600 transition-colors duration-300">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">Tickzy Admin</span>
            </Link>

            {/* Right Section */}
            <div className="flex items-center space-x-4">
              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                  className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded-xl transition-all duration-300"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center">
                    <UserCircle className="w-4 h-4 text-white" />
                  </div>
                  <span className="hidden lg:block text-sm font-medium text-gray-700">
                    {currentUser?.email || 'Admin'}
                  </span>
                </button>

                {/* Dropdown Menu */}
                {showProfileDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-card border border-gray-100 py-2 z-50">
                    <Link
                      to="/profile"
                      className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                      onClick={() => setShowProfileDropdown(false)}
                    >
                      <UserCircle className="w-4 h-4 mr-3" />
                      View Profile
                    </Link>
                    <Link
                      to="/settings"
                      className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                      onClick={() => setShowProfileDropdown(false)}
                    >
                      <Settings className="w-4 h-4 mr-3" />
                      Settings
                    </Link>
                    <hr className="my-2 border-gray-100" />
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-red-600 hover:bg-red-50 transition-colors duration-200"
                    >
                      <LogOut className="w-4 h-4 mr-3" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Click outside to close dropdown */}
        {showProfileDropdown && (
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowProfileDropdown(false)}
          />
        )}
      </header>

      <div className="pt-20 flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-soft min-h-screen">
          <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-8">Admin Panel</h1>
            
            {/* Stats Overview */}
            <div className="space-y-4 mb-8">
              <div className="bg-primary-50 p-4 rounded-xl">
                <div className="flex items-center">
                  <Users className="w-8 h-8 text-primary-500" />
                  <div className="ml-3">
                    <p className="text-lg font-bold text-gray-900">{stats.totalUsers.toLocaleString()}</p>
                    <p className="text-sm text-gray-600">Total Users</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-yellow-50 p-4 rounded-xl">
                <div className="flex items-center">
                  <UserCheck className="w-8 h-8 text-yellow-500" />
                  <div className="ml-3">
                    <p className="text-lg font-bold text-gray-900">{stats.pendingHostRequests}</p>
                    <p className="text-sm text-gray-600">Pending Host Requests</p>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 p-4 rounded-xl">
                <div className="flex items-center">
                  <CheckCircle className="w-8 h-8 text-green-500" />
                  <div className="ml-3">
                    <p className="text-lg font-bold text-gray-900">{stats.totalEvents}</p>
                    <p className="text-sm text-gray-600">Total Events</p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-xl">
                <div className="flex items-center">
                  <Users className="w-8 h-8 text-blue-500" />
                  <div className="ml-3">
                    <p className="text-lg font-bold text-gray-900">{stats.approvedHosts}</p>
                    <p className="text-sm text-gray-600">Approved Hosts</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-green-50 p-4 rounded-xl">
                <div className="flex items-center">
                  <DollarSign className="w-8 h-8 text-green-500" />
                  <div className="ml-3">
                    <p className="text-lg font-bold text-gray-900">${stats.monthlyRevenue.toLocaleString()}</p>
                    <p className="text-sm text-gray-600">Monthly Revenue</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-left transition-all duration-300 ${
                      activeTab === tab.id
                        ? 'bg-primary-50 text-primary-600'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{tab.name}</span>
                    </div>
                    {tab.badge && tab.badge > 0 && (
                      <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                        {tab.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">
                {tabs.find(tab => tab.id === activeTab)?.name}
              </h2>
              <p className="text-gray-600">Manage and monitor platform activities</p>
            </div>
            
            {/* Search and Filter */}
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <button className="p-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors duration-300">
                <Filter className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Content based on active tab */}
          <div className="bg-white rounded-2xl shadow-soft">
            {activeTab === 'users' && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left py-4 px-6 font-semibold text-gray-900">User</th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-900">Role</th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-900">Join Date</th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-900">Status</th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-900">Activity</th>
                      <th className="text-right py-4 px-6 font-semibold text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200">
                        <td className="py-4 px-6">
                          <div>
                            <p className="font-medium text-gray-900">{user.name}</p>
                            <p className="text-sm text-gray-600">{user.email}</p>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            user.role === 'Host' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-gray-600">{user.joinDate}</td>
                        <td className="py-4 px-6">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                            {user.status}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-gray-600">
                          {user.role === 'Host' 
                            ? `${user.eventsHosted} events hosted`
                            : `${user.eventsAttended} events attended`
                          }
                        </td>
                        <td className="py-4 px-6">
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
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'host-requests' && (
              <div className="p-6">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
                  </div>
                ) : (
                  <>
                    {/* Pending Requests */}
                    {pendingHostRequests.length > 0 && (
                      <div className="mb-8">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                          Pending Requests ({pendingHostRequests.length})
                        </h3>
                        <div className="space-y-4">
                          {pendingHostRequests.map((request) => (
                            <div key={request.uid} className="border border-yellow-200 bg-yellow-50 rounded-xl p-6">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center mb-2">
                                    <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center mr-3">
                                      <UserCheck className="w-5 h-5 text-yellow-600" />
                                    </div>
                                    <div>
                                      <h4 className="font-semibold text-gray-900">{request.displayName || 'Unknown User'}</h4>
                                      <p className="text-sm text-gray-600">{request.email}</p>
                                    </div>
                                  </div>

                                  <div className="ml-13">
                                    <p className="text-sm text-gray-600 mb-2">
                                      <strong>Request Date:</strong> {request.hostRequestDate || 'Recently'}
                                    </p>
                                    <p className="text-sm text-gray-600 mb-3">
                                      <strong>Message:</strong>
                                    </p>
                                    <div className="bg-white p-3 rounded-lg border">
                                      <p className="text-sm text-gray-700">{request.hostRequestMessage || 'No message provided'}</p>
                                    </div>
                                  </div>
                                </div>

                                <div className="flex space-x-2 ml-4">
                                  <button
                                    onClick={() => handleApproveHostRequest(request.uid)}
                                    disabled={actionLoading === request.uid}
                                    className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                                  >
                                    {actionLoading === request.uid ? (
                                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    ) : (
                                      <CheckCircle className="w-4 h-4 mr-2" />
                                    )}
                                    Approve
                                  </button>
                                  <button
                                    onClick={() => handleRejectHostRequest(request.uid)}
                                    disabled={actionLoading === request.uid}
                                    className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                                  >
                                    {actionLoading === request.uid ? (
                                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    ) : (
                                      <UserX className="w-4 h-4 mr-2" />
                                    )}
                                    Reject
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* All Requests History */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        All Host Requests ({allHostRequests.length})
                      </h3>
                      {allHostRequests.length === 0 ? (
                        <div className="text-center py-12">
                          <UserCheck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-600">No host requests yet</p>
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="text-left py-3 px-4 font-semibold text-gray-900">User</th>
                                <th className="text-left py-3 px-4 font-semibold text-gray-900">Request Date</th>
                                <th className="text-left py-3 px-4 font-semibold text-gray-900">Status</th>
                                <th className="text-left py-3 px-4 font-semibold text-gray-900">Processed Date</th>
                                <th className="text-right py-3 px-4 font-semibold text-gray-900">Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {allHostRequests.map((request) => (
                                <tr key={request.uid} className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200">
                                  <td className="py-3 px-4">
                                    <div>
                                      <p className="font-medium text-gray-900">{request.displayName || 'Unknown User'}</p>
                                      <p className="text-sm text-gray-600">{request.email}</p>
                                    </div>
                                  </td>
                                  <td className="py-3 px-4 text-gray-600 text-sm">
                                    {request.hostRequestDate || 'Recently'}
                                  </td>
                                  <td className="py-3 px-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                      request.hostStatus === 'approved' ? 'bg-green-100 text-green-800' :
                                      request.hostStatus === 'rejected' ? 'bg-red-100 text-red-800' :
                                      'bg-yellow-100 text-yellow-800'
                                    }`}>
                                      {request.hostStatus.charAt(0).toUpperCase() + request.hostStatus.slice(1)}
                                    </span>
                                  </td>
                                  <td className="py-3 px-4 text-gray-600 text-sm">
                                    {request.hostApprovedDate || '-'}
                                  </td>
                                  <td className="py-3 px-4">
                                    <div className="flex justify-end">
                                      <button className="text-primary-500 hover:text-primary-600 text-sm font-medium">
                                        View Details
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}

            {activeTab === 'events' && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left py-4 px-6 font-semibold text-gray-900">Event</th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-900">Organizer</th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-900">Date</th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-900">Category</th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-900">Status</th>
                      <th className="text-right py-4 px-6 font-semibold text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingEvents.map((event) => (
                      <tr key={event.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200">
                        <td className="py-4 px-6">
                          <div>
                            <p className="font-medium text-gray-900">{event.title}</p>
                            <p className="text-sm text-gray-600">${event.ticketPrice} • {event.expectedAttendees} expected</p>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-gray-600">{event.organizer}</td>
                        <td className="py-4 px-6 text-gray-600">{event.date}</td>
                        <td className="py-4 px-6">
                          <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-xs font-medium">
                            {event.category}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                            {event.status}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex justify-end space-x-2">
                            <button className="bg-green-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-green-600 transition-colors duration-200">
                              Approve
                            </button>
                            <button className="bg-red-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-red-600 transition-colors duration-200">
                              Reject
                            </button>
                            <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50 transition-all duration-200">
                              <MoreHorizontal className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'refunds' && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left py-4 px-6 font-semibold text-gray-900">User</th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-900">Event</th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-900">Amount</th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-900">Reason</th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-900">Status</th>
                      <th className="text-right py-4 px-6 font-semibold text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {refundRequests.map((request) => (
                      <tr key={request.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200">
                        <td className="py-4 px-6">
                          <div>
                            <p className="font-medium text-gray-900">{request.userName}</p>
                            <p className="text-sm text-gray-600">{request.userEmail}</p>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <p className="font-medium text-gray-900">{request.eventTitle}</p>
                          <p className="text-sm text-gray-600">Requested: {request.requestDate}</p>
                        </td>
                        <td className="py-4 px-6">
                          <span className="font-bold text-gray-900">${request.amount}</span>
                        </td>
                        <td className="py-4 px-6">
                          <p className="text-sm text-gray-600 max-w-xs truncate">{request.reason}</p>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                            {request.status}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex justify-end space-x-2">
                            <button className="bg-green-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-green-600 transition-colors duration-200">
                              Approve
                            </button>
                            <button className="bg-red-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-red-600 transition-colors duration-200">
                              Deny
                            </button>
                            <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50 transition-all duration-200">
                              <Eye className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;