import React, { useState, useEffect } from 'react';
import { Users, CheckCircle, AlertTriangle, DollarSign, Calendar, Eye, Edit, Trash2, MoreHorizontal, Search, Filter, LogOut, UserCircle, Settings, UserCheck, UserX, Clock, FileText, AlertCircle, Check, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { subscribeToPendingHostRequests, subscribeToAllHostRequests, approveHostRequest, rejectHostRequest, HostRequest } from '@/services/hostService';
import { subscribeToAllEvents, subscribeToPendingEvents, Event } from '@/services/eventsService';
import { subscribeToEventApprovalStats, approveEvent, rejectEvent, bulkApproveEvents, bulkRejectEvents, EventApprovalStats } from '@/services/adminService';
import { useNotifications, createEventNotifications } from '@/components/Notifications/NotificationSystem';

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('users');
  const [searchTerm, setSearchTerm] = useState('');
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const navigate = useNavigate();
  const { logout, currentUser, userData } = useAuth();
  const { addNotification } = useNotifications();

  // State for host requests
  const [pendingHostRequests, setPendingHostRequests] = useState<HostRequest[]>([]);
  const [allHostRequests, setAllHostRequests] = useState<HostRequest[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // State for event management
  const [pendingEvents, setPendingEvents] = useState<Event[]>([]);
  const [eventStats, setEventStats] = useState<EventApprovalStats>({
    totalEvents: 0,
    pendingEvents: 0,
    approvedEvents: 0,
    rejectedEvents: 0,
    cancelledEvents: 0
  });
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [processingEvents, setProcessingEvents] = useState<string[]>([]);

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

    // Subscribe to all events
    const unsubscribeEvents = subscribeToAllEvents((fetchedEvents) => {
      setEvents(fetchedEvents);
      setLoading(false);
    });

    // Subscribe to pending events
    const unsubscribePendingEvents = subscribeToPendingEvents((fetchedPendingEvents) => {
      setPendingEvents(fetchedPendingEvents);
    });

    // Subscribe to event approval stats
    const unsubscribeEventStats = subscribeToEventApprovalStats((stats) => {
      setEventStats(stats);
    });

    return () => {
      if (unsubscribePending) unsubscribePending();
      if (unsubscribeAll) unsubscribeAll();
      if (unsubscribeEvents) unsubscribeEvents();
      if (unsubscribePendingEvents) unsubscribePendingEvents();
      if (unsubscribeEventStats) unsubscribeEventStats();
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

  // Event approval functions
  const handleApproveEvent = async (eventId: string) => {
    if (!currentUser) return;

    const event = pendingEvents.find(e => e.id === eventId);
    const eventTitle = event?.title || 'Unknown Event';

    setProcessingEvents(prev => [...prev, eventId]);
    try {
      await approveEvent(eventId, currentUser.uid);
      addNotification(createEventNotifications.eventApproved(eventTitle));
      console.log(`✅ Event ${eventId} approved successfully`);
    } catch (error: any) {
      console.error('Error approving event:', error);
      addNotification({
        type: 'error',
        title: 'Approval Failed',
        message: error.message || 'Failed to approve event. Please try again.',
        duration: 7000
      });
    } finally {
      setProcessingEvents(prev => prev.filter(id => id !== eventId));
    }
  };

  const handleRejectEvent = async (eventId: string) => {
    if (!currentUser) return;

    const event = pendingEvents.find(e => e.id === eventId);
    const eventTitle = event?.title || 'Unknown Event';
    const reason = prompt('Please provide a reason for rejection (optional):');

    setProcessingEvents(prev => [...prev, eventId]);
    try {
      await rejectEvent(eventId, currentUser.uid, reason || undefined);
      addNotification(createEventNotifications.eventRejected(eventTitle, reason || undefined));
      console.log(`❌ Event ${eventId} rejected successfully`);
    } catch (error: any) {
      console.error('Error rejecting event:', error);
      addNotification({
        type: 'error',
        title: 'Rejection Failed',
        message: error.message || 'Failed to reject event. Please try again.',
        duration: 7000
      });
    } finally {
      setProcessingEvents(prev => prev.filter(id => id !== eventId));
    }
  };

  const handleBulkApprove = async () => {
    if (!currentUser || selectedEvents.length === 0) return;

    if (!confirm(`Are you sure you want to approve ${selectedEvents.length} events?`)) {
      return;
    }

    setProcessingEvents(prev => [...prev, ...selectedEvents]);
    try {
      const result = await bulkApproveEvents(selectedEvents, currentUser.uid);
      console.log(`✅ Bulk approval complete: ${result.successful.length} successful, ${result.failed.length} failed`);

      if (result.failed.length > 0) {
        addNotification(createEventNotifications.bulkApprovalPartial(result.successful.length, result.failed.length));
      } else {
        addNotification(createEventNotifications.bulkApprovalSuccess(result.successful.length));
      }

      setSelectedEvents([]);
    } catch (error: any) {
      console.error('Error in bulk approval:', error);
      addNotification({
        type: 'error',
        title: 'Bulk Approval Failed',
        message: 'Failed to approve events. Please try again.',
        duration: 7000
      });
    } finally {
      setProcessingEvents(prev => prev.filter(id => !selectedEvents.includes(id)));
    }
  };

  const handleBulkReject = async () => {
    if (!currentUser || selectedEvents.length === 0) return;

    const reason = prompt('Please provide a reason for rejection (optional):');

    if (!confirm(`Are you sure you want to reject ${selectedEvents.length} events?`)) {
      return;
    }

    setProcessingEvents(prev => [...prev, ...selectedEvents]);
    try {
      const result = await bulkRejectEvents(selectedEvents, currentUser.uid, reason || undefined);
      console.log(`❌ Bulk rejection complete: ${result.successful.length} successful, ${result.failed.length} failed`);

      if (result.failed.length > 0) {
        alert(`${result.successful.length} events rejected successfully. ${result.failed.length} events failed to reject.`);
      } else {
        alert(`All ${result.successful.length} events rejected successfully!`);
      }

      setSelectedEvents([]);
    } catch (error: any) {
      console.error('Error in bulk rejection:', error);
      alert('Failed to reject events. Please try again.');
    } finally {
      setProcessingEvents(prev => prev.filter(id => !selectedEvents.includes(id)));
    }
  };

  const toggleEventSelection = (eventId: string) => {
    setSelectedEvents(prev =>
      prev.includes(eventId)
        ? prev.filter(id => id !== eventId)
        : [...prev, eventId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedEvents.length === pendingEvents.length) {
      setSelectedEvents([]);
    } else {
      setSelectedEvents(pendingEvents.map(event => event.id));
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
    totalEvents: eventStats.totalEvents,
    pendingEvents: eventStats.pendingEvents,
    approvedEvents: eventStats.approvedEvents,
    approvedHosts: allHostRequests.filter(req => req.hostStatus === 'approved').length,
    monthlyRevenue: events.reduce((total, event) => {
      // Calculate revenue from approved events only
      if (event.status === 'approved') {
        const eventRevenue = (event.price || 0) * (event.attendees || 0);
        return total + eventRevenue;
      }
      return total;
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
    { id: 'events', name: 'Manage Events', icon: Calendar, badge: eventStats.totalEvents },
    { id: 'event-approvals', name: 'Event Approvals', icon: FileText, badge: eventStats.pendingEvents },
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

              <div className="bg-orange-50 p-4 rounded-xl">
                <div className="flex items-center">
                  <Clock className="w-8 h-8 text-orange-500" />
                  <div className="ml-3">
                    <p className="text-lg font-bold text-gray-900">{stats.pendingEvents}</p>
                    <p className="text-sm text-gray-600">Pending Events</p>
                  </div>
                </div>
              </div>

              <div className="bg-emerald-50 p-4 rounded-xl">
                <div className="flex items-center">
                  <CheckCircle className="w-8 h-8 text-emerald-500" />
                  <div className="ml-3">
                    <p className="text-lg font-bold text-gray-900">{stats.approvedEvents}</p>
                    <p className="text-sm text-gray-600">Approved Events</p>
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

            {activeTab === 'event-approvals' && (
              <div>
                <div className="p-6 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">Event Approvals</h2>
                      <p className="text-gray-600 mt-1">Review and approve pending events</p>
                    </div>
                    {selectedEvents.length > 0 && (
                      <div className="flex space-x-3">
                        <button
                          onClick={handleBulkApprove}
                          disabled={processingEvents.length > 0}
                          className="btn-primary flex items-center disabled:opacity-50"
                        >
                          <Check className="w-4 h-4 mr-2" />
                          Approve Selected ({selectedEvents.length})
                        </button>
                        <button
                          onClick={handleBulkReject}
                          disabled={processingEvents.length > 0}
                          className="btn-secondary flex items-center disabled:opacity-50"
                        >
                          <X className="w-4 h-4 mr-2" />
                          Reject Selected ({selectedEvents.length})
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {pendingEvents.length === 0 ? (
                  <div className="p-12 text-center">
                    <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Pending Events</h3>
                    <p className="text-gray-600">All events have been reviewed. Great job!</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="text-left py-4 px-6">
                            <input
                              type="checkbox"
                              checked={selectedEvents.length === pendingEvents.length && pendingEvents.length > 0}
                              onChange={toggleSelectAll}
                              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                            />
                          </th>
                          <th className="text-left py-4 px-6 font-semibold text-gray-900">Event</th>
                          <th className="text-left py-4 px-6 font-semibold text-gray-900">Host</th>
                          <th className="text-left py-4 px-6 font-semibold text-gray-900">Date</th>
                          <th className="text-left py-4 px-6 font-semibold text-gray-900">Category</th>
                          <th className="text-left py-4 px-6 font-semibold text-gray-900">Price</th>
                          <th className="text-left py-4 px-6 font-semibold text-gray-900">Submitted</th>
                          <th className="text-left py-4 px-6 font-semibold text-gray-900">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {pendingEvents.map((event) => (
                          <tr key={event.id} className="hover:bg-gray-50">
                            <td className="py-4 px-6">
                              <input
                                type="checkbox"
                                checked={selectedEvents.includes(event.id)}
                                onChange={() => toggleEventSelection(event.id)}
                                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                              />
                            </td>
                            <td className="py-4 px-6">
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
                            <td className="py-4 px-6 text-gray-600">{event.organizer?.name || 'Unknown'}</td>
                            <td className="py-4 px-6 text-gray-600">{event.date} • {event.time}</td>
                            <td className="py-4 px-6">
                              <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-xs font-medium">
                                {event.category}
                              </span>
                            </td>
                            <td className="py-4 px-6 text-gray-600">${event.price}</td>
                            <td className="py-4 px-6 text-gray-600">
                              {new Date(event.createdAt).toLocaleDateString()}
                            </td>
                            <td className="py-4 px-6">
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleApproveEvent(event.id)}
                                  disabled={processingEvents.includes(event.id)}
                                  className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                                  title="Approve Event"
                                >
                                  {processingEvents.includes(event.id) ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                                  ) : (
                                    <Check className="w-4 h-4" />
                                  )}
                                </button>
                                <button
                                  onClick={() => handleRejectEvent(event.id)}
                                  disabled={processingEvents.includes(event.id)}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                  title="Reject Event"
                                >
                                  {processingEvents.includes(event.id) ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                                  ) : (
                                    <X className="w-4 h-4" />
                                  )}
                                </button>
                                <Link
                                  to={`/event/${event.id}`}
                                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                  title="View Event Details"
                                >
                                  <Eye className="w-4 h-4" />
                                </Link>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
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