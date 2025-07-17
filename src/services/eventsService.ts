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

export interface Event {
  id: string;
  title: string;
  image: string;
  date: string;
  time: string;
  location: string;
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
  isPopular?: boolean;
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
    isPopular: Boolean(data.isPopular)
  };
};

// Get all events with real-time updates
export const subscribeToEvents = (callback: (events: Event[]) => void, category?: string) => {
  let q = query(collection(db, EVENTS_COLLECTION), orderBy('createdAt', 'desc'));
  
  if (category && category !== 'all') {
    q = query(collection(db, EVENTS_COLLECTION), 
      where('category', '==', category), 
      orderBy('createdAt', 'desc')
    );
  }

  return onSnapshot(q, (snapshot) => {
    const events: Event[] = [];
    snapshot.forEach((doc) => {
      events.push(convertFirebaseEvent(doc));
    });
    callback(events);
  }, (error) => {
    console.error('Error fetching events:', error);
    callback([]);
  });
};

// Get events with pagination
export const subscribeToEventsWithLimit = (
  callback: (events: Event[]) => void, 
  limitCount: number = 10,
  category?: string
) => {
  let q = query(
    collection(db, EVENTS_COLLECTION), 
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  );
  
  if (category && category !== 'all') {
    q = query(
      collection(db, EVENTS_COLLECTION), 
      where('category', '==', category), 
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
  }

  return onSnapshot(q, (snapshot) => {
    const events: Event[] = [];
    snapshot.forEach((doc) => {
      events.push(convertFirebaseEvent(doc));
    });
    callback(events);
  }, (error) => {
    console.error('Error fetching events with limit:', error);
    callback([]);
  });
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
    const docRef = await addDoc(collection(db, EVENTS_COLLECTION), {
      ...eventData,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating event:', error);
    return null;
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

// Get popular events (high rating or high attendees)
export const subscribeToPopularEvents = (callback: (events: Event[]) => void, limitCount: number = 6) => {
  const q = query(
    collection(db, EVENTS_COLLECTION), 
    where('rating', '>=', 4.5),
    orderBy('rating', 'desc'),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  );

  return onSnapshot(q, (snapshot) => {
    const events: Event[] = [];
    snapshot.forEach((doc) => {
      const eventData = convertFirebaseEvent(doc);
      eventData.isPopular = true;
      events.push(eventData);
    });
    callback(events);
  }, (error) => {
    console.error('Error fetching popular events:', error);
    callback([]);
  });
};
