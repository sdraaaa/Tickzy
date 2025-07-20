/**
 * Admin Service for Event Management
 * 
 * This service provides admin-specific functions for managing events,
 * including approval workflows, bulk operations, and statistics.
 */

import { 
  collection, 
  doc, 
  getDocs, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  serverTimestamp,
  getCountFromServer
} from 'firebase/firestore';
import { db } from '@/firebase';
import { Event } from './eventsService';

export interface EventApprovalStats {
  totalEvents: number;
  pendingEvents: number;
  approvedEvents: number;
  rejectedEvents: number;
  cancelledEvents: number;
}

export interface EventApprovalAction {
  eventId: string;
  action: 'approve' | 'reject' | 'cancel';
  adminId: string;
  timestamp: string;
  reason?: string;
}

const EVENTS_COLLECTION = 'events';

/**
 * Get event approval statistics
 */
export const getEventApprovalStats = async (): Promise<EventApprovalStats> => {
  try {
    const [totalQuery, pendingQuery, approvedQuery, rejectedQuery, cancelledQuery] = await Promise.all([
      getCountFromServer(collection(db, EVENTS_COLLECTION)),
      getCountFromServer(query(collection(db, EVENTS_COLLECTION), where('status', '==', 'pending'))),
      getCountFromServer(query(collection(db, EVENTS_COLLECTION), where('status', '==', 'approved'))),
      getCountFromServer(query(collection(db, EVENTS_COLLECTION), where('status', '==', 'rejected'))),
      getCountFromServer(query(collection(db, EVENTS_COLLECTION), where('status', '==', 'cancelled')))
    ]);

    return {
      totalEvents: totalQuery.data().count,
      pendingEvents: pendingQuery.data().count,
      approvedEvents: approvedQuery.data().count,
      rejectedEvents: rejectedQuery.data().count,
      cancelledEvents: cancelledQuery.data().count
    };
  } catch (error) {
    console.error('Error getting event approval stats:', error);
    return {
      totalEvents: 0,
      pendingEvents: 0,
      approvedEvents: 0,
      rejectedEvents: 0,
      cancelledEvents: 0
    };
  }
};

/**
 * Subscribe to event approval statistics with real-time updates
 */
export const subscribeToEventApprovalStats = (
  callback: (stats: EventApprovalStats) => void
) => {
  // Subscribe to all events and calculate stats in real-time
  const q = query(collection(db, EVENTS_COLLECTION));

  return onSnapshot(q, (snapshot) => {
    const stats: EventApprovalStats = {
      totalEvents: 0,
      pendingEvents: 0,
      approvedEvents: 0,
      rejectedEvents: 0,
      cancelledEvents: 0
    };

    snapshot.forEach((doc) => {
      const data = doc.data();
      const status = data.status || 'pending';
      
      stats.totalEvents++;
      
      switch (status) {
        case 'pending':
          stats.pendingEvents++;
          break;
        case 'approved':
          stats.approvedEvents++;
          break;
        case 'rejected':
          stats.rejectedEvents++;
          break;
        case 'cancelled':
          stats.cancelledEvents++;
          break;
      }
    });

    callback(stats);
  }, (error) => {
    console.error('Error subscribing to event approval stats:', error);
    callback({
      totalEvents: 0,
      pendingEvents: 0,
      approvedEvents: 0,
      rejectedEvents: 0,
      cancelledEvents: 0
    });
  });
};

/**
 * Approve event with optional reason
 */
export const approveEvent = async (
  eventId: string, 
  adminId: string, 
  reason?: string
): Promise<boolean> => {
  try {
    const updateData: any = {
      status: 'approved',
      statusUpdatedAt: serverTimestamp(),
      statusUpdatedBy: adminId
    };

    if (reason) {
      updateData.approvalReason = reason;
    }

    await updateDoc(doc(db, EVENTS_COLLECTION, eventId), updateData);
    
    console.log(`✅ Event ${eventId} approved by admin ${adminId}`);
    return true;
  } catch (error: any) {
    console.error('Error approving event:', error);
    
    if (error.code === 'permission-denied') {
      throw new Error('You do not have permission to approve events.');
    } else if (error.code === 'not-found') {
      throw new Error('Event not found.');
    } else {
      throw new Error('Failed to approve event. Please try again.');
    }
  }
};

/**
 * Reject event with optional reason
 */
export const rejectEvent = async (
  eventId: string,
  adminId: string,
  reason?: string
): Promise<boolean> => {
  try {
    const updateData: any = {
      status: 'rejected',
      statusUpdatedAt: serverTimestamp(),
      statusUpdatedBy: adminId
    };

    if (reason) {
      updateData.rejectionReason = reason;
    }

    await updateDoc(doc(db, EVENTS_COLLECTION, eventId), updateData);

    console.log(`❌ Event ${eventId} rejected by admin ${adminId}`);
    return true;
  } catch (error: any) {
    console.error('Error rejecting event:', error);

    if (error.code === 'permission-denied') {
      throw new Error('You do not have permission to reject events.');
    } else if (error.code === 'not-found') {
      throw new Error('Event not found.');
    } else {
      throw new Error('Failed to reject event. Please try again.');
    }
  }
};

/**
 * Delete event permanently (admin only)
 */
export const deleteEvent = async (
  eventId: string,
  adminId: string
): Promise<boolean> => {
  try {
    const { deleteDoc } = await import('firebase/firestore');
    await deleteDoc(doc(db, EVENTS_COLLECTION, eventId));

    console.log(`🗑️ Event ${eventId} deleted by admin ${adminId}`);
    return true;
  } catch (error: any) {
    console.error('Error deleting event:', error);

    if (error.code === 'permission-denied') {
      throw new Error('You do not have permission to delete events.');
    } else if (error.code === 'not-found') {
      throw new Error('Event not found.');
    } else {
      throw new Error('Failed to delete event. Please try again.');
    }
  }
};

/**
 * Cancel event (can be done by admin or host)
 */
export const cancelEvent = async (
  eventId: string, 
  userId: string, 
  reason?: string
): Promise<boolean> => {
  try {
    const updateData: any = {
      status: 'cancelled',
      statusUpdatedAt: serverTimestamp(),
      statusUpdatedBy: userId
    };

    if (reason) {
      updateData.cancellationReason = reason;
    }

    await updateDoc(doc(db, EVENTS_COLLECTION, eventId), updateData);
    
    console.log(`🚫 Event ${eventId} cancelled by user ${userId}`);
    return true;
  } catch (error: any) {
    console.error('Error cancelling event:', error);
    
    if (error.code === 'permission-denied') {
      throw new Error('You do not have permission to cancel this event.');
    } else if (error.code === 'not-found') {
      throw new Error('Event not found.');
    } else {
      throw new Error('Failed to cancel event. Please try again.');
    }
  }
};

/**
 * Bulk approve multiple events
 */
export const bulkApproveEvents = async (
  eventIds: string[], 
  adminId: string
): Promise<{ successful: string[]; failed: string[] }> => {
  const successful: string[] = [];
  const failed: string[] = [];

  console.log(`🔄 Bulk approving ${eventIds.length} events...`);

  for (const eventId of eventIds) {
    try {
      await approveEvent(eventId, adminId);
      successful.push(eventId);
    } catch (error) {
      console.error(`Failed to approve event ${eventId}:`, error);
      failed.push(eventId);
    }
  }

  console.log(`✅ Bulk approval complete: ${successful.length} successful, ${failed.length} failed`);
  return { successful, failed };
};

/**
 * Bulk reject multiple events
 */
export const bulkRejectEvents = async (
  eventIds: string[], 
  adminId: string,
  reason?: string
): Promise<{ successful: string[]; failed: string[] }> => {
  const successful: string[] = [];
  const failed: string[] = [];

  console.log(`🔄 Bulk rejecting ${eventIds.length} events...`);

  for (const eventId of eventIds) {
    try {
      await rejectEvent(eventId, adminId, reason);
      successful.push(eventId);
    } catch (error) {
      console.error(`Failed to reject event ${eventId}:`, error);
      failed.push(eventId);
    }
  }

  console.log(`❌ Bulk rejection complete: ${successful.length} successful, ${failed.length} failed`);
  return { successful, failed };
};

/**
 * Get events that need admin attention (pending for too long)
 */
export const getEventsNeedingAttention = async (daysOld: number = 7): Promise<Event[]> => {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const q = query(
      collection(db, EVENTS_COLLECTION),
      where('status', '==', 'pending'),
      where('createdAt', '<=', cutoffDate),
      orderBy('createdAt', 'asc')
    );

    const snapshot = await getDocs(q);
    const events: Event[] = [];

    snapshot.forEach((doc) => {
      const data = doc.data();
      events.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString()
      } as Event);
    });

    return events;
  } catch (error) {
    console.error('Error getting events needing attention:', error);
    return [];
  }
};
