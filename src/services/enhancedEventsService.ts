/**
 * Enhanced Events Service with Improved Real-time Synchronization
 * 
 * This service provides enhanced real-time synchronization for events with better error handling,
 * connection monitoring, and fallback mechanisms.
 */

import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  doc,
  updateDoc,
  serverTimestamp,
  enableNetwork,
  disableNetwork,
  connectFirestoreEmulator,
  Unsubscribe
} from 'firebase/firestore';
import { db } from '@/firebase';
import { Event } from './eventsService';

// Connection state management
let isOnline = true;
let connectionListeners: Array<(online: boolean) => void> = [];

// Enhanced subscription with connection monitoring
export class EnhancedEventSubscription {
  private unsubscribe: Unsubscribe | null = null;
  private retryCount = 0;
  private maxRetries = 3;
  private retryDelay = 1000;
  private isActive = false;

  constructor(
    private queryBuilder: () => any,
    private callback: (events: Event[]) => void,
    private errorCallback?: (error: Error) => void
  ) {}

  start() {
    if (this.isActive) return;
    this.isActive = true;
    this.subscribe();
  }

  stop() {
    this.isActive = false;
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
  }

  private subscribe() {
    try {
      const query = this.queryBuilder();
      
      this.unsubscribe = onSnapshot(
        query,
        (snapshot) => {
          console.log(`📡 Real-time update received: ${snapshot.size} events`);
          
          const events: Event[] = [];
          snapshot.forEach((doc) => {
            try {
              const data = doc.data();
              const event: Event = {
                id: doc.id,
                title: data.title || '',
                description: data.description || '',
                image: data.image || '',
                date: data.date || '',
                time: data.time || '',
                location: data.location || '',
                price: Number(data.price) || 0,
                category: data.category || 'Other',
                attendees: Number(data.attendees) || 0,
                rating: Number(data.rating) || 0,
                highlights: Array.isArray(data.highlights) ? data.highlights : [],
                ticketTypes: Array.isArray(data.ticketTypes) ? data.ticketTypes : [],
                organizer: data.organizer || { name: 'Unknown', rating: 0, events: 0, avatar: '' },
                createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
                createdBy: data.createdBy || '',
                status: data.status || 'pending',
                isPopular: Boolean(data.isPopular)
              };
              events.push(event);
            } catch (error) {
              console.error('Error converting event document:', error);
            }
          });
          
          this.callback(events);
          this.retryCount = 0; // Reset retry count on successful update
        },
        (error) => {
          console.error('Real-time subscription error:', error);
          
          if (this.errorCallback) {
            this.errorCallback(error);
          }
          
          // Retry logic
          if (this.retryCount < this.maxRetries && this.isActive) {
            this.retryCount++;
            console.log(`🔄 Retrying subscription (${this.retryCount}/${this.maxRetries}) in ${this.retryDelay}ms...`);
            
            setTimeout(() => {
              if (this.isActive) {
                this.subscribe();
              }
            }, this.retryDelay * this.retryCount);
          } else {
            console.error('❌ Max retries reached for real-time subscription');
          }
        }
      );
      
    } catch (error) {
      console.error('Error setting up subscription:', error);
      if (this.errorCallback) {
        this.errorCallback(error as Error);
      }
    }
  }
}

// Enhanced public events subscription with retry logic
export const subscribeToEventsEnhanced = (
  callback: (events: Event[]) => void,
  category?: string,
  errorCallback?: (error: Error) => void
): EnhancedEventSubscription => {
  
  const queryBuilder = () => {
    let q = query(
      collection(db, 'events'),
      where('status', '==', 'approved'),
      orderBy('createdAt', 'desc')
    );

    if (category && category !== 'all') {
      q = query(
        collection(db, 'events'),
        where('status', '==', 'approved'),
        where('category', '==', category),
        orderBy('createdAt', 'desc')
      );
    }

    return q;
  };

  const subscription = new EnhancedEventSubscription(queryBuilder, callback, errorCallback);
  subscription.start();
  return subscription;
};

// Enhanced admin events subscription
export const subscribeToAllEventsEnhanced = (
  callback: (events: Event[]) => void,
  errorCallback?: (error: Error) => void
): EnhancedEventSubscription => {
  
  const queryBuilder = () => {
    return query(
      collection(db, 'events'),
      orderBy('createdAt', 'desc')
    );
  };

  const subscription = new EnhancedEventSubscription(queryBuilder, callback, errorCallback);
  subscription.start();
  return subscription;
};

// Enhanced pending events subscription
export const subscribeToPendingEventsEnhanced = (
  callback: (events: Event[]) => void,
  errorCallback?: (error: Error) => void
): EnhancedEventSubscription => {
  
  const queryBuilder = () => {
    return query(
      collection(db, 'events'),
      where('status', '==', 'pending'),
      orderBy('createdAt', 'desc')
    );
  };

  const subscription = new EnhancedEventSubscription(queryBuilder, callback, errorCallback);
  subscription.start();
  return subscription;
};

// Enhanced event approval with real-time verification
export const approveEventEnhanced = async (
  eventId: string, 
  adminId: string, 
  reason?: string
): Promise<{ success: boolean; verified: boolean }> => {
  try {
    console.log(`🔄 Approving event ${eventId}...`);
    
    // Update the event status
    const updateData: any = {
      status: 'approved',
      statusUpdatedAt: serverTimestamp(),
      statusUpdatedBy: adminId
    };

    if (reason) {
      updateData.approvalReason = reason;
    }

    await updateDoc(doc(db, 'events', eventId), updateData);
    console.log(`✅ Event ${eventId} status updated to approved`);

    // Verify the update propagated to real-time listeners
    return new Promise((resolve) => {
      let verified = false;
      const timeout = setTimeout(() => {
        if (!verified) {
          console.warn('⚠️ Real-time verification timed out');
          resolve({ success: true, verified: false });
        }
      }, 5000);

      // Listen for the event to appear in approved events
      const verificationQuery = query(
        collection(db, 'events'),
        where('status', '==', 'approved')
      );

      const unsubscribe = onSnapshot(verificationQuery, (snapshot) => {
        const foundEvent = snapshot.docs.find(doc => doc.id === eventId);
        if (foundEvent && !verified) {
          verified = true;
          clearTimeout(timeout);
          unsubscribe();
          console.log(`✅ Real-time verification successful for event ${eventId}`);
          resolve({ success: true, verified: true });
        }
      }, (error) => {
        console.error('Verification subscription error:', error);
        clearTimeout(timeout);
        resolve({ success: true, verified: false });
      });
    });

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

// Connection monitoring
export const monitorFirestoreConnection = () => {
  // Monitor online/offline status
  const handleOnline = () => {
    console.log('🌐 Network connection restored');
    isOnline = true;
    enableNetwork(db).catch(console.error);
    connectionListeners.forEach(listener => listener(true));
  };

  const handleOffline = () => {
    console.log('📴 Network connection lost');
    isOnline = false;
    connectionListeners.forEach(listener => listener(false));
  };

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
};

// Add connection listener
export const addConnectionListener = (listener: (online: boolean) => void) => {
  connectionListeners.push(listener);
  return () => {
    connectionListeners = connectionListeners.filter(l => l !== listener);
  };
};

// Get connection status
export const isFirestoreOnline = () => isOnline;

// Force reconnection
export const forceFirestoreReconnection = async () => {
  try {
    console.log('🔄 Forcing Firestore reconnection...');
    await disableNetwork(db);
    await new Promise(resolve => setTimeout(resolve, 1000));
    await enableNetwork(db);
    console.log('✅ Firestore reconnection completed');
  } catch (error) {
    console.error('❌ Error during forced reconnection:', error);
  }
};

// Make functions available in browser console for debugging
if (typeof window !== 'undefined') {
  (window as any).subscribeToEventsEnhanced = subscribeToEventsEnhanced;
  (window as any).subscribeToAllEventsEnhanced = subscribeToAllEventsEnhanced;
  (window as any).subscribeToPendingEventsEnhanced = subscribeToPendingEventsEnhanced;
  (window as any).approveEventEnhanced = approveEventEnhanced;
  (window as any).monitorFirestoreConnection = monitorFirestoreConnection;
  (window as any).forceFirestoreReconnection = forceFirestoreReconnection;
  (window as any).isFirestoreOnline = isFirestoreOnline;
}
