import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  onSnapshot, 
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';
import { db } from '@/firebase';
import { isIndexError, logIndexInstructions, markIndexIssues } from '@/utils/firestoreIndexHelper';

export interface Event {
  id: string;
  title: string;
  image: string;
  date: string;
  time: string;
  location: string; // Human-readable address (for backward compatibility)
  locationName?: string; // Human-readable address (new field)
  locationCoords?: { latitude: number; longitude: number }; // Coordinates (new field)
  price: number;
  category: string;
  attendees: number;
  rating: number;
  description: string;
  highlights: string[];
  ticketTypes: TicketType[];
  organizer: Organizer;
  createdAt: string; // Always convert to string for React rendering
  createdBy: string;
  status?: 'pending' | 'approved' | 'rejected' | 'cancelled'; // Event approval status
  isPopular?: boolean;
  venueDocument?: string; // Firebase Storage URL for venue booking document
  rejectionReason?: string; // Reason for rejection (admin only)
  statusUpdatedAt?: any; // Timestamp when status was last updated
  statusUpdatedBy?: string; // Admin ID who updated the status
}

export interface TicketType {
  id: number;
  name: string;
  price: number;
  description: string;
  soldOut?: boolean;
}

export interface Organizer {
  name: string;
  rating: number;
  events: number;
  avatar: string;
}

const EVENTS_COLLECTION = 'events';

// Helper function to safely convert any value to string
const safeStringify = (value: any): string => {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  if (typeof value === 'boolean') return String(value);
  if (typeof value === 'object') {
    // Handle Firebase Timestamp
    if (value.toDate && typeof value.toDate === 'function') {
      return value.toDate().toISOString();
    }
    // Handle Firebase GeoPoint
    if (value._lat !== undefined && value._long !== undefined) {
      return `${value._lat}, ${value._long}`;
    }
    // Handle arrays
    if (Array.isArray(value)) {
      return value.map(safeStringify).join(', ');
    }
    // For other objects, return empty string to avoid React errors
    return '';
  }
  return String(value);
};

// Helper function to convert Firebase data to React-safe format
const convertFirebaseEvent = (doc: any): Event => {
  const data = doc.data();

  return {
    id: doc.id,
    title: safeStringify(data.title) || 'Untitled Event',
    image: safeStringify(data.image) || '',
    date: safeStringify(data.date) || '',
    time: safeStringify(data.time) || '',
    location: safeStringify(data.location) || '',
    price: Number(data.price) || 0,
    category: safeStringify(data.category) || 'Other',
    attendees: Number(data.attendees) || 0,
    rating: Number(data.rating) || 0,
    description: safeStringify(data.description) || '',
    highlights: Array.isArray(data.highlights) ? data.highlights.map(safeStringify) : [],
    ticketTypes: Array.isArray(data.ticketTypes) ? data.ticketTypes : [],
    organizer: data.organizer || { name: 'Unknown', rating: 0, events: 0, avatar: '' },
    createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
    createdBy: safeStringify(data.createdBy) || '',
    status: data.status || 'pending', // Default to pending if not set
    isPopular: Boolean(data.isPopular)
  };
};

// Get all APPROVED events with real-time updates (for public areas)
export const subscribeToEvents = (callback: (events: Event[]) => void, category?: string) => {
  try {
    let q = query(
      collection(db, EVENTS_COLLECTION),
      where('status', '==', 'approved'),
      orderBy('createdAt', 'desc')
    );

    if (category && category !== 'all') {
      q = query(
        collection(db, EVENTS_COLLECTION),
        where('status', '==', 'approved'),
        where('category', '==', category),
        orderBy('createdAt', 'desc')
      );
    }

    return onSnapshot(q, (snapshot) => {
      const events: Event[] = [];
      snapshot.forEach((doc) => {
        const event = convertFirebaseEvent(doc);
        if (event) {
          events.push(event);
        }
      });
      callback(events);
    }, (error) => {
      console.error('Error fetching approved events:', error);

      if (isIndexError(error)) {
        markIndexIssues();
        logIndexInstructions(error);
      }

      callback([]);
    });
  } catch (error) {
    console.error('Error setting up events subscription:', error);
    callback([]);
    return () => {}; // Return empty unsubscribe function
  }
};

// Get APPROVED events with pagination (for public areas)
export const subscribeToEventsWithLimit = (
  callback: (events: Event[]) => void,
  limitCount: number = 10,
  category?: string
) => {
  try {
    let q = query(
      collection(db, EVENTS_COLLECTION),
      where('status', '==', 'approved'),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    if (category && category !== 'all') {
      q = query(
        collection(db, EVENTS_COLLECTION),
        where('status', '==', 'approved'),
        where('category', '==', category),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
    }

    return onSnapshot(q, (snapshot) => {
      const events: Event[] = [];
      snapshot.forEach((doc) => {
        const event = convertFirebaseEvent(doc);
        if (event) {
          events.push(event);
        }
      });
      callback(events);
    }, (error) => {
      console.error('Error fetching approved events with limit:', error);

      if (error.code === 'failed-precondition' && error.message.includes('index')) {
        console.error('🔥 FIRESTORE INDEX REQUIRED - Using fallback query');
        // Fallback: Get all events and filter client-side (temporary solution)
        const fallbackQuery = query(collection(db, EVENTS_COLLECTION), limit(limitCount));
        return onSnapshot(fallbackQuery, (snapshot) => {
          const events: Event[] = [];
          snapshot.forEach((doc) => {
            const event = convertFirebaseEvent(doc);
            if (event && event.status === 'approved') {
              events.push(event);
            }
          });
          // Sort by createdAt client-side
          events.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          callback(events.slice(0, limitCount));
        });
      }

      callback([]);
    });
  } catch (error) {
    console.error('Error setting up events subscription with limit:', error);
    callback([]);
    return () => {}; // Return empty unsubscribe function
  }
};

// Get single event by ID
export const getEventById = async (eventId: string): Promise<Event | null> => {
  try {
    const eventDoc = await getDoc(doc(db, EVENTS_COLLECTION, eventId));
    if (eventDoc.exists()) {
      return convertFirebaseEvent(eventDoc);
    }
    return null;
  } catch (error) {
    console.error('Error fetching event:', error);
    return null;
  }
};

// Subscribe to single event by ID with real-time updates
export const subscribeToEvent = (eventId: string, callback: (event: Event | null) => void) => {
  return onSnapshot(doc(db, EVENTS_COLLECTION, eventId), (doc) => {
    if (doc.exists()) {
      callback(convertFirebaseEvent(doc));
    } else {
      callback(null);
    }
  }, (error) => {
    console.error('Error subscribing to event:', error);
    callback(null);
  });
};

// Create new event (for hosts)
export const createEvent = async (eventData: Omit<Event, 'id' | 'createdAt'>): Promise<string | null> => {
  try {
    // Validate required fields
    if (!eventData.title?.trim()) {
      throw new Error('Event title is required');
    }
    if (!eventData.description?.trim()) {
      throw new Error('Event description is required');
    }
    if (!eventData.location?.trim()) {
      throw new Error('Event location is required');
    }
    if (!eventData.date) {
      throw new Error('Event date is required');
    }
    if (!eventData.time) {
      throw new Error('Event time is required');
    }
    if (!eventData.image?.trim()) {
      throw new Error('Event image URL is required');
    }
    if (!eventData.createdBy) {
      throw new Error('Event creator ID is required');
    }

    // Prepare event data with defaults
    const eventToCreate = {
      ...eventData,
      status: eventData.status || 'pending', // Default to pending approval
      rating: eventData.rating || 4.5,
      isPopular: eventData.isPopular || false,
      createdAt: serverTimestamp()
    };

    console.log('Creating event in Firestore:', eventToCreate);

    const docRef = await addDoc(collection(db, EVENTS_COLLECTION), eventToCreate);

    console.log('Event created successfully with ID:', docRef.id);
    return docRef.id;
  } catch (error: any) {
    console.error('Error creating event:', error);

    // Re-throw the error so it can be handled by the calling component
    if (error.code === 'permission-denied') {
      throw new Error('You do not have permission to create events. Please ensure you are an approved host.');
    } else if (error.code === 'network-request-failed') {
      throw new Error('Network error. Please check your internet connection and try again.');
    } else if (error.message) {
      throw error; // Re-throw custom validation errors
    } else {
      throw new Error('Failed to create event. Please try again.');
    }
  }
};

// Update event (for hosts/admins)
export const updateEvent = async (eventId: string, eventData: Partial<Event>): Promise<boolean> => {
  try {
    await updateDoc(doc(db, EVENTS_COLLECTION, eventId), eventData);
    return true;
  } catch (error) {
    console.error('Error updating event:', error);
    return false;
  }
};

// Delete event (for hosts/admins)
export const deleteEvent = async (eventId: string): Promise<boolean> => {
  try {
    await deleteDoc(doc(db, EVENTS_COLLECTION, eventId));
    return true;
  } catch (error) {
    console.error('Error deleting event:', error);
    return false;
  }
};

// Get events by host ID
export const getEventsByHost = async (hostId: string): Promise<Event[]> => {
  try {
    const q = query(
      collection(db, EVENTS_COLLECTION),
      where('createdBy', '==', hostId),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const events: Event[] = [];

    querySnapshot.forEach((doc) => {
      const event = convertFirestoreEvent(doc);
      if (event) {
        events.push(event);
      }
    });

    return events;
  } catch (error) {
    console.error('Error fetching host events:', error);
    return [];
  }
};

// Subscribe to events by host ID (real-time updates) - Shows ALL host events regardless of status
export const subscribeToHostEvents = (
  hostId: string,
  callback: (events: Event[]) => void
) => {
  const q = query(
    collection(db, EVENTS_COLLECTION),
    where('createdBy', '==', hostId),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const events: Event[] = [];
    snapshot.forEach((doc) => {
      const event = convertFirebaseEvent(doc);
      if (event) {
        events.push(event);
      }
    });
    callback(events);
  }, (error) => {
    console.error('Error subscribing to host events:', error);
    callback([]);
  });
};

// Get events by category
export const getEventsByCategory = async (category: string): Promise<Event[]> => {
  try {
    const q = query(
      collection(db, EVENTS_COLLECTION), 
      where('category', '==', category),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    const events: Event[] = [];
    snapshot.forEach((doc) => {
      events.push(convertFirebaseEvent(doc));
    });
    return events;
  } catch (error) {
    console.error('Error fetching events by category:', error);
    return [];
  }
};

// Get events created by specific user (for hosts)
export const subscribeToUserEvents = (userId: string, callback: (events: Event[]) => void) => {
  const q = query(
    collection(db, EVENTS_COLLECTION), 
    where('createdBy', '==', userId),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const events: Event[] = [];
    snapshot.forEach((doc) => {
      events.push(convertFirebaseEvent(doc));
    });
    callback(events);
  }, (error) => {
    console.error('Error fetching user events:', error);
    callback([]);
  });
};

// Get popular APPROVED events (high rating or high attendees)
export const subscribeToPopularEvents = (callback: (events: Event[]) => void, limitCount: number = 6) => {
  const q = query(
    collection(db, EVENTS_COLLECTION),
    where('status', '==', 'approved'),
    where('rating', '>=', 4.5),
    orderBy('rating', 'desc'),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  );

  return onSnapshot(q, (snapshot) => {
    const events: Event[] = [];
    snapshot.forEach((doc) => {
      const eventData = convertFirebaseEvent(doc);
      if (eventData) {
        eventData.isPopular = true;
        events.push(eventData);
      }
    });
    callback(events);
  }, (error) => {
    console.error('Error fetching popular approved events:', error);
    callback([]);
  });
};

// ===== ADMIN FUNCTIONS =====

// Subscribe to ALL events (for admin dashboard)
export const subscribeToAllEvents = (callback: (events: Event[]) => void) => {
  const q = query(
    collection(db, EVENTS_COLLECTION),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const events: Event[] = [];
    snapshot.forEach((doc) => {
      const event = convertFirebaseEvent(doc);
      if (event) {
        events.push(event);
      }
    });
    callback(events);
  }, (error) => {
    console.error('Error subscribing to all events:', error);
    callback([]);
  });
};

// Subscribe to PENDING events (for admin approval queue)
export const subscribeToPendingEvents = (callback: (events: Event[]) => void) => {
  const q = query(
    collection(db, EVENTS_COLLECTION),
    where('status', '==', 'pending'),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const events: Event[] = [];
    snapshot.forEach((doc) => {
      const event = convertFirebaseEvent(doc);
      if (event) {
        events.push(event);
      }
    });
    callback(events);
  }, (error) => {
    console.error('Error subscribing to pending events:', error);
    callback([]);
  });
};

// Subscribe to events by status (for admin filtering)
export const subscribeToEventsByStatus = (
  status: 'pending' | 'approved' | 'rejected' | 'cancelled',
  callback: (events: Event[]) => void
) => {
  const q = query(
    collection(db, EVENTS_COLLECTION),
    where('status', '==', status),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const events: Event[] = [];
    snapshot.forEach((doc) => {
      const event = convertFirebaseEvent(doc);
      if (event) {
        events.push(event);
      }
    });
    callback(events);
  }, (error) => {
    console.error(`Error subscribing to ${status} events:`, error);
    callback([]);
  });
};

// Update event status (admin only)
export const updateEventStatus = async (
  eventId: string,
  status: 'pending' | 'approved' | 'rejected' | 'cancelled',
  adminId: string
): Promise<boolean> => {
  try {
    await updateDoc(doc(db, EVENTS_COLLECTION, eventId), {
      status,
      statusUpdatedAt: serverTimestamp(),
      statusUpdatedBy: adminId
    });

    console.log(`Event ${eventId} status updated to ${status} by admin ${adminId}`);
    return true;
  } catch (error: any) {
    console.error('Error updating event status:', error);

    if (error.code === 'permission-denied') {
      throw new Error('You do not have permission to update event status. Only admins can approve/reject events.');
    } else if (error.code === 'not-found') {
      throw new Error('Event not found.');
    } else {
      throw new Error('Failed to update event status. Please try again.');
    }
  }
};

// Bulk approve events (admin only)
export const bulkApproveEvents = async (eventIds: string[], adminId: string): Promise<{
  successful: string[];
  failed: string[];
}> => {
  const successful: string[] = [];
  const failed: string[] = [];

  for (const eventId of eventIds) {
    try {
      await updateEventStatus(eventId, 'approved', adminId);
      successful.push(eventId);
    } catch (error) {
      console.error(`Failed to approve event ${eventId}:`, error);
      failed.push(eventId);
    }
  }

  return { successful, failed };
};

// Bulk reject events (admin only)
export const bulkRejectEvents = async (eventIds: string[], adminId: string): Promise<{
  successful: string[];
  failed: string[];
}> => {
  const successful: string[] = [];
  const failed: string[] = [];

  for (const eventId of eventIds) {
    try {
      await updateEventStatus(eventId, 'rejected', adminId);
      successful.push(eventId);
    } catch (error) {
      console.error(`Failed to reject event ${eventId}:`, error);
      failed.push(eventId);
    }
  }

  return { successful, failed };
};
