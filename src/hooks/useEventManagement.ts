/**
 * Event Management Hook
 * 
 * Custom hook for managing event-related state and operations
 * with real-time updates and proper error handling.
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Event, 
  subscribeToEvents, 
  subscribeToAllEvents, 
  subscribeToPendingEvents, 
  subscribeToHostEvents,
  subscribeToEventsByStatus 
} from '@/services/eventsService';
import { 
  EventApprovalStats, 
  subscribeToEventApprovalStats,
  approveEvent,
  rejectEvent,
  bulkApproveEvents,
  bulkRejectEvents
} from '@/services/adminService';

export type EventFilter = 'all' | 'approved' | 'pending' | 'rejected' | 'cancelled';

interface UseEventManagementOptions {
  filter?: EventFilter;
  hostId?: string;
  category?: string;
  autoSubscribe?: boolean;
}

interface UseEventManagementReturn {
  // State
  events: Event[];
  loading: boolean;
  error: string | null;
  stats: EventApprovalStats | null;
  
  // Actions
  approveEventAction: (eventId: string, reason?: string) => Promise<boolean>;
  rejectEventAction: (eventId: string, reason?: string) => Promise<boolean>;
  bulkApproveAction: (eventIds: string[]) => Promise<{ successful: string[]; failed: string[] }>;
  bulkRejectAction: (eventIds: string[], reason?: string) => Promise<{ successful: string[]; failed: string[] }>;
  
  // Utilities
  refreshEvents: () => void;
  clearError: () => void;
}

export const useEventManagement = (
  options: UseEventManagementOptions = {}
): UseEventManagementReturn => {
  const { currentUser, userData } = useAuth();
  const { 
    filter = 'all', 
    hostId, 
    category, 
    autoSubscribe = true 
  } = options;

  // State
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<EventApprovalStats | null>(null);

  // Subscribe to events based on filter and options
  useEffect(() => {
    if (!autoSubscribe) return;

    setLoading(true);
    setError(null);

    let unsubscribe: (() => void) | undefined;

    try {
      if (hostId) {
        // Subscribe to specific host's events
        unsubscribe = subscribeToHostEvents(hostId, (fetchedEvents) => {
          setEvents(fetchedEvents);
          setLoading(false);
        });
      } else if (filter === 'all' && userData?.role === 'admin') {
        // Admin view - all events
        unsubscribe = subscribeToAllEvents((fetchedEvents) => {
          setEvents(fetchedEvents);
          setLoading(false);
        });
      } else if (filter === 'pending') {
        // Pending events for admin approval
        unsubscribe = subscribeToPendingEvents((fetchedEvents) => {
          setEvents(fetchedEvents);
          setLoading(false);
        });
      } else if (filter !== 'all' && filter !== 'approved') {
        // Specific status filter
        unsubscribe = subscribeToEventsByStatus(filter, (fetchedEvents) => {
          setEvents(fetchedEvents);
          setLoading(false);
        });
      } else {
        // Public view - approved events only
        unsubscribe = subscribeToEvents((fetchedEvents) => {
          setEvents(fetchedEvents);
          setLoading(false);
        }, category);
      }
    } catch (err) {
      console.error('Error subscribing to events:', err);
      setError(err instanceof Error ? err.message : 'Failed to load events');
      setLoading(false);
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [filter, hostId, category, autoSubscribe, userData?.role]);

  // Subscribe to event approval stats (for admins)
  useEffect(() => {
    if (userData?.role !== 'admin') return;

    const unsubscribe = subscribeToEventApprovalStats((approvalStats) => {
      setStats(approvalStats);
    });

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [userData?.role]);

  // Approve event action
  const approveEventAction = useCallback(async (eventId: string, reason?: string): Promise<boolean> => {
    if (!currentUser || userData?.role !== 'admin') {
      setError('Only admins can approve events');
      return false;
    }

    try {
      await approveEvent(eventId, currentUser.uid, reason);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to approve event';
      setError(errorMessage);
      return false;
    }
  }, [currentUser, userData?.role]);

  // Reject event action
  const rejectEventAction = useCallback(async (eventId: string, reason?: string): Promise<boolean> => {
    if (!currentUser || userData?.role !== 'admin') {
      setError('Only admins can reject events');
      return false;
    }

    try {
      await rejectEvent(eventId, currentUser.uid, reason);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to reject event';
      setError(errorMessage);
      return false;
    }
  }, [currentUser, userData?.role]);

  // Bulk approve action
  const bulkApproveAction = useCallback(async (eventIds: string[]): Promise<{ successful: string[]; failed: string[] }> => {
    if (!currentUser || userData?.role !== 'admin') {
      setError('Only admins can approve events');
      return { successful: [], failed: eventIds };
    }

    try {
      const result = await bulkApproveEvents(eventIds, currentUser.uid);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to bulk approve events';
      setError(errorMessage);
      return { successful: [], failed: eventIds };
    }
  }, [currentUser, userData?.role]);

  // Bulk reject action
  const bulkRejectAction = useCallback(async (eventIds: string[], reason?: string): Promise<{ successful: string[]; failed: string[] }> => {
    if (!currentUser || userData?.role !== 'admin') {
      setError('Only admins can reject events');
      return { successful: [], failed: eventIds };
    }

    try {
      const result = await bulkRejectEvents(eventIds, currentUser.uid, reason);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to bulk reject events';
      setError(errorMessage);
      return { successful: [], failed: eventIds };
    }
  }, [currentUser, userData?.role]);

  // Refresh events manually
  const refreshEvents = useCallback(() => {
    setLoading(true);
    setError(null);
    // The useEffect will handle the actual refresh
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // State
    events,
    loading,
    error,
    stats,
    
    // Actions
    approveEventAction,
    rejectEventAction,
    bulkApproveAction,
    bulkRejectAction,
    
    // Utilities
    refreshEvents,
    clearError
  };
};

export default useEventManagement;
