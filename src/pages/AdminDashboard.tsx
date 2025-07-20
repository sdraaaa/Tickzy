import React, { useState, useEffect } from 'react';
import { Users, CheckCircle, AlertTriangle, DollarSign, Calendar, Eye, Edit, Trash2, MoreHorizontal, Search, Filter, LogOut, UserCircle, Settings, UserCheck, UserX, Clock, FileText, AlertCircle, Check, X, Bug, MapPin, Star, ImageIcon, Download } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { subscribeToPendingHostRequests, subscribeToAllHostRequests, approveHostRequest, rejectHostRequest, HostRequest } from '@/services/hostService';
import { subscribeToAllEvents, subscribeToPendingEvents, Event } from '@/services/eventsService';
import { subscribeToEventApprovalStats, approveEvent, rejectEvent, bulkApproveEvents, bulkRejectEvents, EventApprovalStats } from '@/services/adminService';
import { useNotifications, createEventNotifications } from '@/components/Notifications/NotificationSystem';
import { logAdminDebugInfo, fixAdminRole, testEventApproval, isCurrentUserAdmin } from '@/utils/adminDebugger';

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
  const [debugMode, setDebugMode] = useState(false);
  const [viewingEvent, setViewingEvent] = useState<Event | null>(null);

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

  // Handle viewing event details in admin context
  const handleViewEvent = (event: Event) => {
    setViewingEvent(event);
  };

  const handleCloseEventView = () => {
    setViewingEvent(null);
  };

  // Debug functions
  const handleDebugInfo = async () => {
    await logAdminDebugInfo();
    addNotification({
      type: 'info',
      title: 'Debug Info',
      message: 'Check browser console for detailed debug information.',
      duration: 5000
    });
  };

  const handleFixAdminRole = async () => {
    try {
      const success = await fixAdminRole();
      if (success) {
        addNotification({
          type: 'success',
          title: 'Admin Role Fixed',
          message: 'Your admin role has been corrected. Please refresh the page.',
          duration: 7000
        });
      } else {
        addNotification({
          type: 'error',
          title: 'Fix Failed',
          message: 'Could not fix admin role. Check console for details.',
          duration: 7000
        });
      }
    } catch (error: any) {
      addNotification({
        type: 'error',
        title: 'Fix Failed',
        message: error.message || 'An error occurred while fixing admin role.',
        duration: 7000
      });
    }
  };

  const handleTestEventApproval = async () => {
    if (pendingEvents.length === 0) {
      addNotification({
        type: 'warning',
        title: 'No Events to Test',
        message: 'Create a pending event first to test approval.',
        duration: 5000
      });
      return;
    }

    const testEventId = pendingEvents[0].id;
    try {
      const result = await testEventApproval(testEventId);
      if (result.success) {
        addNotification({
          type: 'success',
          title: 'Test Successful',
          message: 'Event approval test passed! Check console for details.',
          duration: 7000
        });
      } else {
        addNotification({
          type: 'error',
          title: 'Test Failed',
          message: `Event approval test failed: ${result.error}`,
          duration: 7000
        });
      }
    } catch (error: any) {
      addNotification({
        type: 'error',
        title: 'Test Error',
        message: error.message || 'An error occurred during testing.',
        duration: 7000
      });
    }
  };

  // Emergency admin fix function - uses existing Firebase imports
  const handleEmergencyAdminFix = async () => {
    if (!currentUser) {
      console.error('❌ No authenticated user');
      return;
    }

    if (currentUser.email !== 'aleemsidra2205@gmail.com') {
      console.error('❌ Not the admin email');
      addNotification({
        type: 'error',
        title: 'Access Denied',
        message: 'Only the designated admin can use this function.',
        duration: 5000
      });
      return;
    }

    try {
      console.log('🚨 EMERGENCY ADMIN FIX STARTING...');
      console.log('Current user:', { uid: currentUser.uid, email: currentUser.email });
      console.log('Expected document path: users/' + currentUser.uid);

      // Use the same Firebase imports as the rest of the file
      const { doc, setDoc, getDoc } = await import('firebase/firestore');
      const { db } = await import('../firebase/index');

      const userDocRef = doc(db, 'users', currentUser.uid);

      console.log('📝 Creating admin document...');

      const adminData = {
        uid: currentUser.uid,
        email: currentUser.email,
        displayName: currentUser.displayName || 'Admin User',
        photoURL: currentUser.photoURL || null,
        role: 'admin',
        isPreConfigured: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      console.log('📄 Admin data to write:', adminData);

      await setDoc(userDocRef, adminData, { merge: true });

      console.log('✅ Admin document created successfully!');

      // Verify the document
      const verifyDoc = await getDoc(userDocRef);
      if (verifyDoc.exists()) {
        const data = verifyDoc.data();
        console.log('✅ VERIFICATION SUCCESSFUL:', data);
        console.log('✅ Role confirmed:', data.role);
        console.log('✅ Document exists at: users/' + currentUser.uid);

        addNotification({
          type: 'success',
          title: '🚨 EMERGENCY FIX COMPLETE',
          message: 'Admin role fixed! Refresh the page and try approving events now.',
          duration: 10000
        });
      } else {
        throw new Error('Document verification failed - document does not exist');
      }
    } catch (error: any) {
      console.error('❌ EMERGENCY FIX FAILED:', error);
      console.error('❌ Error details:', {
        code: error.code,
        message: error.message,
        stack: error.stack
      });
      addNotification({
        type: 'error',
        title: 'Emergency Fix Failed',
        message: 'Check console for error details: ' + error.message,
        duration: 10000
      });
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
    totalUsers: allHostRequests.length, // Only count users who have requested host status (real data)
    pendingHostRequests: pendingHostRequests.length,
    totalEvents: eventStats.totalEvents,
    pendingEvents: eventStats.pendingEvents,
    approvedEvents: eventStats.approvedEvents,
    approvedHosts: allHostRequests.filter(req => req.hostStatus === 'approved').length,
    monthlyRevenue: 0 // Revenue tracking will be implemented when booking system is complete
  };

  // Users data comes from Firebase - no mock data needed

  // Refund requests will come from Firebase when implemented - no mock data needed

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
    { id: 'refunds', name: 'Refund Requests', icon: AlertTriangle },
    { id: 'debug', name: 'Debug Admin', icon: Bug }
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
                    {allHostRequests.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center">
                          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 mb-2">No Users Found</h3>
                          <p className="text-gray-600">Users will appear here as they register and request host access.</p>
                        </td>
                      </tr>
                    ) : (
                      allHostRequests.map((user) => (
                        <tr key={user.uid} className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200">
                          <td className="py-4 px-6">
                            <div>
                              <p className="font-medium text-gray-900">{user.displayName || 'Unknown User'}</p>
                              <p className="text-sm text-gray-600">{user.email}</p>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                              user.role === 'host' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {user.role}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-gray-600">
                            {user.hostRequestDate ? new Date(user.hostRequestDate).toLocaleDateString() : 'N/A'}
                          </td>
                          <td className="py-4 px-6">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(user.hostStatus || 'none')}`}>
                              {user.hostStatus || 'none'}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-gray-600">
                            {user.hostStatus === 'approved' ? 'Host activities' : 'User activities'}
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex justify-end space-x-2">
                              <button
                                className="p-2 text-gray-400 hover:text-primary-500 rounded-lg hover:bg-primary-50 transition-all duration-200"
                                title="View User Details"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                className="p-2 text-gray-400 hover:text-blue-500 rounded-lg hover:bg-blue-50 transition-all duration-200"
                                title="Edit User"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
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
                                <button
                                  onClick={() => handleViewEvent(event)}
                                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                  title="View Event Details"
                                >
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
                    <tr>
                      <td colSpan={6} className="py-12 text-center">
                        <AlertTriangle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Refund System Coming Soon</h3>
                        <p className="text-gray-600">Refund request management will be available in a future update.</p>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'debug' && (
              <div className="p-6">
                <div className="max-w-4xl mx-auto">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Admin Debug Panel</h2>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                    <div className="flex items-center">
                      <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2" />
                      <p className="text-yellow-800">
                        <strong>Debug Mode:</strong> Use these tools to diagnose and fix admin permission issues.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Debug Information */}
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Debug Information</h3>
                      <p className="text-gray-600 mb-4">
                        Get detailed information about your admin account status, role verification, and permissions.
                      </p>
                      <button
                        onClick={handleDebugInfo}
                        className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Bug className="w-4 h-4 inline mr-2" />
                        Get Debug Info
                      </button>
                    </div>

                    {/* Fix Admin Role */}
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Fix Admin Role</h3>
                      <p className="text-gray-600 mb-4">
                        If your account doesn't have admin permissions, this will correct your role in Firestore.
                      </p>
                      <button
                        onClick={handleFixAdminRole}
                        className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors mb-3"
                      >
                        <Settings className="w-4 h-4 inline mr-2" />
                        Fix Admin Role
                      </button>

                      {/* Emergency Fix Button */}
                      <button
                        onClick={handleEmergencyAdminFix}
                        className="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                      >
                        🚨 EMERGENCY FIX
                      </button>
                      <p className="text-xs text-red-600 mt-2">
                        Use this if the regular fix doesn't work. Creates admin document directly.
                      </p>
                    </div>

                    {/* Test Event Approval */}
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Test Event Approval</h3>
                      <p className="text-gray-600 mb-4">
                        Test the event approval functionality with detailed error logging.
                      </p>
                      <button
                        onClick={handleTestEventApproval}
                        className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                      >
                        <CheckCircle className="w-4 h-4 inline mr-2" />
                        Test Event Approval
                      </button>
                    </div>

                    {/* Current Status */}
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Status</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Email:</span>
                          <span className="font-mono text-gray-900">{currentUser?.email}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">UID:</span>
                          <span className="font-mono text-gray-900">{currentUser?.uid}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Role:</span>
                          <span className="font-mono text-gray-900">{userData?.role}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Expected Admin:</span>
                          <span className={`font-mono ${currentUser?.email === 'aleemsidra2205@gmail.com' ? 'text-green-600' : 'text-red-600'}`}>
                            {currentUser?.email === 'aleemsidra2205@gmail.com' ? 'Yes' : 'No'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 bg-gray-50 border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Instructions</h3>
                    <ol className="list-decimal list-inside space-y-2 text-gray-700">
                      <li>First, click "Get Debug Info" and check the browser console for detailed information.</li>
                      <li>If your role is not "admin", click "Fix Admin Role" to correct it.</li>
                      <li>After fixing the role, refresh the page and try the event approval again.</li>
                      <li>Use "Test Event Approval" to verify that the approval functionality works.</li>
                      <li>If issues persist, check the Firestore security rules and ensure they allow admin operations.</li>
                    </ol>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Admin Event Details Modal */}
      {viewingEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Event Details (Admin View)</h2>
                <button
                  onClick={handleCloseEventView}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Event Image */}
                <div className="space-y-4">
                  <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                    {viewingEvent.image ? (
                      <img
                        src={viewingEvent.image}
                        alt={viewingEvent.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <ImageIcon className="w-16 h-16" />
                    </div>
                  </div>

                  {/* Event Status */}
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-600">Status:</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      viewingEvent.status === 'approved' ? 'bg-green-100 text-green-800' :
                      viewingEvent.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      viewingEvent.status === 'cancelled' ? 'bg-gray-100 text-gray-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {viewingEvent.status || 'pending'}
                    </span>
                  </div>
                </div>

                {/* Event Details */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{viewingEvent.title}</h3>
                    <p className="text-gray-600">{viewingEvent.description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Date</p>
                        <p className="font-medium">{viewingEvent.date}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Clock className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Time</p>
                        <p className="font-medium">{viewingEvent.time}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <MapPin className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Location</p>
                        <p className="font-medium">{viewingEvent.location}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <DollarSign className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Price</p>
                        <p className="font-medium">${viewingEvent.price}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Users className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Capacity</p>
                        <p className="font-medium">{viewingEvent.attendees}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Star className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Category</p>
                        <p className="font-medium">{viewingEvent.category}</p>
                      </div>
                    </div>
                  </div>

                  {/* Organizer Info */}
                  {viewingEvent.organizer && (
                    <div className="border-t pt-4">
                      <h4 className="font-medium text-gray-900 mb-2">Organizer</h4>
                      <div className="flex items-center space-x-3">
                        {viewingEvent.organizer.avatar && (
                          <img
                            src={viewingEvent.organizer.avatar}
                            alt={viewingEvent.organizer.name}
                            className="w-10 h-10 rounded-full"
                          />
                        )}
                        <div>
                          <p className="font-medium">{viewingEvent.organizer.name}</p>
                          <p className="text-sm text-gray-600">
                            {viewingEvent.organizer.events} events • {viewingEvent.organizer.rating} rating
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Venue Document */}
                  {(viewingEvent as any).venueDocument && (
                    <div className="border-t pt-4">
                      <h4 className="font-medium text-gray-900 mb-3">Venue Documentation</h4>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <FileText className="w-6 h-6 text-blue-600" />
                            <div>
                              <h5 className="font-medium text-blue-900">Venue Booking Document</h5>
                              <p className="text-sm text-blue-700">Uploaded by event organizer for verification</p>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => window.open((viewingEvent as any).venueDocument, '_blank')}
                              className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                            >
                              <Eye className="w-4 h-4" />
                              <span>View</span>
                            </button>
                            <button
                              onClick={() => {
                                const link = document.createElement('a');
                                link.href = (viewingEvent as any).venueDocument;
                                link.download = `venue-document-${viewingEvent.id}`;
                                link.click();
                              }}
                              className="flex items-center space-x-1 px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                            >
                              <Download className="w-4 h-4" />
                              <span>Download</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Admin Actions */}
                  {viewingEvent.status === 'pending' && (
                    <div className="border-t pt-4">
                      <h4 className="font-medium text-gray-900 mb-3">Admin Actions</h4>
                      <div className="flex space-x-3">
                        <button
                          onClick={() => {
                            handleApproveEvent(viewingEvent.id);
                            handleCloseEventView();
                          }}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                          Approve Event
                        </button>
                        <button
                          onClick={() => {
                            handleRejectEvent(viewingEvent.id);
                            handleCloseEventView();
                          }}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                          Reject Event
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;