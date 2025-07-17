import { 
  doc, 
  updateDoc, 
  collection, 
  query, 
  where, 
  onSnapshot, 
  serverTimestamp,
  Timestamp,
  getDoc
} from 'firebase/firestore';
import { db } from '@/firebase';

export type HostStatus = 'none' | 'pending' | 'approved' | 'rejected';

export interface HostRequest {
  uid: string;
  email: string;
  displayName: string;
  hostStatus: HostStatus;
  hostRequestDate: string | null; // Convert to string for React rendering
  hostRequestMessage: string | null;
  hostApprovedDate: string | null; // Convert to string for React rendering
  hostApprovedBy: string | null;
  role: string;
}

const USERS_COLLECTION = 'users';

// Helper function to convert Firebase Timestamp to string for React rendering
const convertTimestamp = (timestamp: any): string | null => {
  if (!timestamp) return null;
  if (timestamp.toDate) {
    return timestamp.toDate().toLocaleDateString();
  }
  return null;
};

// Helper function to convert Firebase user data to HostRequest format
const convertToHostRequest = (doc: any): HostRequest => {
  const userData = doc.data();
  return {
    uid: doc.id,
    email: userData.email || '',
    displayName: userData.displayName || '',
    hostStatus: userData.hostStatus || 'none',
    hostRequestDate: convertTimestamp(userData.hostRequestDate),
    hostRequestMessage: userData.hostRequestMessage || null,
    hostApprovedDate: convertTimestamp(userData.hostApprovedDate),
    hostApprovedBy: userData.hostApprovedBy || null,
    role: userData.role || 'user'
  };
};

// Submit host request
export const submitHostRequest = async (
  userId: string, 
  requestMessage: string
): Promise<boolean> => {
  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    await updateDoc(userRef, {
      hostStatus: 'pending',
      hostRequestDate: serverTimestamp(),
      hostRequestMessage: requestMessage
    });
    return true;
  } catch (error) {
    console.error('Error submitting host request:', error);
    return false;
  }
};

// Get user's host status
export const getUserHostStatus = async (userId: string): Promise<HostStatus> => {
  try {
    const userDoc = await getDoc(doc(db, USERS_COLLECTION, userId));
    if (userDoc.exists()) {
      const userData = userDoc.data();
      return userData.hostStatus || 'none';
    }
    return 'none';
  } catch (error) {
    console.error('Error getting user host status:', error);
    return 'none';
  }
};

// Subscribe to user's host status changes
export const subscribeToUserHostStatus = (
  userId: string,
  callback: (hostData: Partial<HostRequest>) => void
) => {
  return onSnapshot(doc(db, USERS_COLLECTION, userId), (doc) => {
    if (doc.exists()) {
      const userData = doc.data();
      callback({
        hostStatus: userData.hostStatus || 'none',
        hostRequestDate: convertTimestamp(userData.hostRequestDate),
        hostRequestMessage: userData.hostRequestMessage || null,
        hostApprovedDate: convertTimestamp(userData.hostApprovedDate),
        hostApprovedBy: userData.hostApprovedBy || null
      });
    } else {
      callback({ hostStatus: 'none' });
    }
  }, (error) => {
    console.error('Error subscribing to user host status:', error);
    callback({ hostStatus: 'none' });
  });
};

// Get all pending host requests (for admins)
export const subscribeToPendingHostRequests = (
  callback: (requests: HostRequest[]) => void
) => {
  const q = query(
    collection(db, USERS_COLLECTION),
    where('hostStatus', '==', 'pending')
  );

  return onSnapshot(q, (snapshot) => {
    const requests: HostRequest[] = [];
    snapshot.forEach((doc) => {
      requests.push(convertToHostRequest(doc));
    });

    // Sort by request date (newest first) - now using string dates
    requests.sort((a, b) => {
      if (!a.hostRequestDate || !b.hostRequestDate) return 0;
      return new Date(b.hostRequestDate).getTime() - new Date(a.hostRequestDate).getTime();
    });

    callback(requests);
  }, (error) => {
    console.error('Error fetching pending host requests:', error);
    callback([]);
  });
};

// Approve host request (for admins)
export const approveHostRequest = async (
  userId: string, 
  adminId: string
): Promise<boolean> => {
  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    await updateDoc(userRef, {
      role: 'host',
      hostStatus: 'approved',
      hostApprovedDate: serverTimestamp(),
      hostApprovedBy: adminId
    });
    return true;
  } catch (error) {
    console.error('Error approving host request:', error);
    return false;
  }
};

// Reject host request (for admins)
export const rejectHostRequest = async (
  userId: string, 
  adminId: string
): Promise<boolean> => {
  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    await updateDoc(userRef, {
      hostStatus: 'rejected',
      hostApprovedDate: serverTimestamp(),
      hostApprovedBy: adminId
    });
    return true;
  } catch (error) {
    console.error('Error rejecting host request:', error);
    return false;
  }
};

// Get all host requests history (for admins)
export const subscribeToAllHostRequests = (
  callback: (requests: HostRequest[]) => void
) => {
  const q = query(
    collection(db, USERS_COLLECTION),
    where('hostStatus', 'in', ['pending', 'approved', 'rejected'])
  );

  return onSnapshot(q, (snapshot) => {
    const requests: HostRequest[] = [];
    snapshot.forEach((doc) => {
      const userData = doc.data();
      if (userData.hostRequestDate) { // Only include users who have made a request
        requests.push(convertToHostRequest(doc));
      }
    });

    // Sort by request date (newest first) - now using string dates
    requests.sort((a, b) => {
      if (!a.hostRequestDate || !b.hostRequestDate) return 0;
      return new Date(b.hostRequestDate).getTime() - new Date(a.hostRequestDate).getTime();
    });

    callback(requests);
  }, (error) => {
    console.error('Error fetching all host requests:', error);
    callback([]);
  });
};

// Check if user can create events (is approved host)
export const canUserCreateEvents = async (userId: string): Promise<boolean> => {
  try {
    const userDoc = await getDoc(doc(db, USERS_COLLECTION, userId));
    if (userDoc.exists()) {
      const userData = userDoc.data();
      return userData.role === 'host' && userData.hostStatus === 'approved';
    }
    return false;
  } catch (error) {
    console.error('Error checking user event creation permissions:', error);
    return false;
  }
};
