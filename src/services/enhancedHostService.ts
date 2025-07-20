/**
 * Enhanced Host Service with Improved Real-time Synchronization
 * 
 * This service provides enhanced real-time synchronization for host requests with better error handling,
 * connection monitoring, and fallback mechanisms.
 */

import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  doc,
  updateDoc,
  serverTimestamp,
  Timestamp,
  Unsubscribe
} from 'firebase/firestore';
import { db } from '@/firebase';
import { HostRequest, HostStatus } from './hostService';

// Enhanced subscription class for host requests
export class EnhancedHostSubscription {
  private unsubscribe: Unsubscribe | null = null;
  private retryCount = 0;
  private maxRetries = 3;
  private retryDelay = 1000;
  private isActive = false;

  constructor(
    private queryBuilder: () => any,
    private callback: (requests: HostRequest[]) => void,
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

  private convertTimestamp(timestamp: any): string | null {
    if (!timestamp) return null;
    if (timestamp instanceof Timestamp) {
      return timestamp.toDate().toISOString();
    }
    if (timestamp.toDate && typeof timestamp.toDate === 'function') {
      return timestamp.toDate().toISOString();
    }
    return null;
  }

  private convertToHostRequest(doc: any): HostRequest {
    const userData = doc.data();
    return {
      uid: doc.id,
      email: userData.email || '',
      displayName: userData.displayName || '',
      hostStatus: userData.hostStatus || 'none',
      hostRequestDate: this.convertTimestamp(userData.hostRequestDate),
      hostRequestMessage: userData.hostRequestMessage || null,
      hostApprovedDate: this.convertTimestamp(userData.hostApprovedDate),
      hostApprovedBy: userData.hostApprovedBy || null,
      role: userData.role || 'user'
    };
  }

  private subscribe() {
    try {
      const query = this.queryBuilder();
      
      this.unsubscribe = onSnapshot(
        query,
        (snapshot) => {
          console.log(`📡 Host requests real-time update: ${snapshot.size} requests`);
          
          const requests: HostRequest[] = [];
          snapshot.forEach((doc) => {
            try {
              const request = this.convertToHostRequest(doc);
              requests.push(request);
            } catch (error) {
              console.error('Error converting host request document:', error);
            }
          });
          
          // Sort by request date (newest first)
          requests.sort((a, b) => {
            if (!a.hostRequestDate || !b.hostRequestDate) return 0;
            return new Date(b.hostRequestDate).getTime() - new Date(a.hostRequestDate).getTime();
          });
          
          this.callback(requests);
          this.retryCount = 0; // Reset retry count on successful update
        },
        (error) => {
          console.error('Host requests real-time subscription error:', error);
          
          if (this.errorCallback) {
            this.errorCallback(error);
          }
          
          // Retry logic
          if (this.retryCount < this.maxRetries && this.isActive) {
            this.retryCount++;
            console.log(`🔄 Retrying host requests subscription (${this.retryCount}/${this.maxRetries}) in ${this.retryDelay}ms...`);
            
            setTimeout(() => {
              if (this.isActive) {
                this.subscribe();
              }
            }, this.retryDelay * this.retryCount);
          } else {
            console.error('❌ Max retries reached for host requests subscription');
          }
        }
      );
      
    } catch (error) {
      console.error('Error setting up host requests subscription:', error);
      if (this.errorCallback) {
        this.errorCallback(error as Error);
      }
    }
  }
}

// Enhanced pending host requests subscription
export const subscribeToPendingHostRequestsEnhanced = (
  callback: (requests: HostRequest[]) => void,
  errorCallback?: (error: Error) => void
): EnhancedHostSubscription => {
  
  const queryBuilder = () => {
    return query(
      collection(db, 'users'),
      where('hostStatus', '==', 'pending')
    );
  };

  const subscription = new EnhancedHostSubscription(queryBuilder, callback, errorCallback);
  subscription.start();
  return subscription;
};

// Enhanced all host requests subscription
export const subscribeToAllHostRequestsEnhanced = (
  callback: (requests: HostRequest[]) => void,
  errorCallback?: (error: Error) => void
): EnhancedHostSubscription => {
  
  const queryBuilder = () => {
    return query(
      collection(db, 'users'),
      where('hostStatus', 'in', ['pending', 'approved', 'rejected'])
    );
  };

  const subscription = new EnhancedHostSubscription(queryBuilder, callback, errorCallback);
  subscription.start();
  return subscription;
};

// Enhanced host request submission with real-time verification
export const submitHostRequestEnhanced = async (
  userId: string, 
  requestMessage: string
): Promise<{ success: boolean; verified: boolean }> => {
  try {
    console.log(`🔄 Submitting host request for user ${userId}...`);
    
    // Update the user's host status
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      hostStatus: 'pending',
      hostRequestDate: serverTimestamp(),
      hostRequestMessage: requestMessage
    });
    
    console.log(`✅ Host request submitted for user ${userId}`);

    // Verify the update propagated to real-time listeners
    return new Promise((resolve) => {
      let verified = false;
      const timeout = setTimeout(() => {
        if (!verified) {
          console.warn('⚠️ Host request real-time verification timed out');
          resolve({ success: true, verified: false });
        }
      }, 5000);

      // Listen for the request to appear in pending requests
      const verificationQuery = query(
        collection(db, 'users'),
        where('hostStatus', '==', 'pending')
      );

      const unsubscribe = onSnapshot(verificationQuery, (snapshot) => {
        const foundRequest = snapshot.docs.find(doc => doc.id === userId);
        if (foundRequest && !verified) {
          verified = true;
          clearTimeout(timeout);
          unsubscribe();
          console.log(`✅ Host request real-time verification successful for user ${userId}`);
          resolve({ success: true, verified: true });
        }
      }, (error) => {
        console.error('Host request verification subscription error:', error);
        clearTimeout(timeout);
        resolve({ success: true, verified: false });
      });
    });

  } catch (error) {
    console.error('Error submitting host request:', error);
    throw error;
  }
};

// Enhanced host request approval with real-time verification
export const approveHostRequestEnhanced = async (
  userId: string, 
  adminId: string
): Promise<{ success: boolean; verified: boolean }> => {
  try {
    console.log(`🔄 Approving host request for user ${userId}...`);
    
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      role: 'host',
      hostStatus: 'approved',
      hostApprovedDate: serverTimestamp(),
      hostApprovedBy: adminId
    });
    
    console.log(`✅ Host request approved for user ${userId}`);

    // Verify the update propagated to real-time listeners
    return new Promise((resolve) => {
      let verified = false;
      const timeout = setTimeout(() => {
        if (!verified) {
          console.warn('⚠️ Host approval real-time verification timed out');
          resolve({ success: true, verified: false });
        }
      }, 5000);

      // Listen for the user to appear in approved requests
      const verificationQuery = query(
        collection(db, 'users'),
        where('hostStatus', '==', 'approved')
      );

      const unsubscribe = onSnapshot(verificationQuery, (snapshot) => {
        const foundRequest = snapshot.docs.find(doc => doc.id === userId);
        if (foundRequest && !verified) {
          verified = true;
          clearTimeout(timeout);
          unsubscribe();
          console.log(`✅ Host approval real-time verification successful for user ${userId}`);
          resolve({ success: true, verified: true });
        }
      }, (error) => {
        console.error('Host approval verification subscription error:', error);
        clearTimeout(timeout);
        resolve({ success: true, verified: false });
      });
    });

  } catch (error) {
    console.error('Error approving host request:', error);
    throw error;
  }
};

// Enhanced host request rejection with real-time verification
export const rejectHostRequestEnhanced = async (
  userId: string, 
  adminId: string
): Promise<{ success: boolean; verified: boolean }> => {
  try {
    console.log(`🔄 Rejecting host request for user ${userId}...`);
    
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      hostStatus: 'rejected',
      hostApprovedDate: serverTimestamp(),
      hostApprovedBy: adminId
    });
    
    console.log(`✅ Host request rejected for user ${userId}`);

    // Verify the update propagated to real-time listeners
    return new Promise((resolve) => {
      let verified = false;
      const timeout = setTimeout(() => {
        if (!verified) {
          console.warn('⚠️ Host rejection real-time verification timed out');
          resolve({ success: true, verified: false });
        }
      }, 5000);

      // Listen for the user to appear in rejected requests
      const verificationQuery = query(
        collection(db, 'users'),
        where('hostStatus', '==', 'rejected')
      );

      const unsubscribe = onSnapshot(verificationQuery, (snapshot) => {
        const foundRequest = snapshot.docs.find(doc => doc.id === userId);
        if (foundRequest && !verified) {
          verified = true;
          clearTimeout(timeout);
          unsubscribe();
          console.log(`✅ Host rejection real-time verification successful for user ${userId}`);
          resolve({ success: true, verified: true });
        }
      }, (error) => {
        console.error('Host rejection verification subscription error:', error);
        clearTimeout(timeout);
        resolve({ success: true, verified: false });
      });
    });

  } catch (error) {
    console.error('Error rejecting host request:', error);
    throw error;
  }
};

// Make functions available in browser console for debugging
if (typeof window !== 'undefined') {
  (window as any).subscribeToPendingHostRequestsEnhanced = subscribeToPendingHostRequestsEnhanced;
  (window as any).subscribeToAllHostRequestsEnhanced = subscribeToAllHostRequestsEnhanced;
  (window as any).submitHostRequestEnhanced = submitHostRequestEnhanced;
  (window as any).approveHostRequestEnhanced = approveHostRequestEnhanced;
  (window as any).rejectHostRequestEnhanced = rejectHostRequestEnhanced;
}
