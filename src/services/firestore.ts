/**
 * Firestore service functions for Tickzy
 */

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
  startAfter,
  Timestamp,
  QueryDocumentSnapshot,
  DocumentData
} from 'firebase/firestore';
import { db } from '../firebase';
import { Event, Booking, Notification, SearchFilters, PaginatedResponse } from '../types';
import { getDefaultEventImage } from '../utils/defaultImage';

// Events
export const getEvents = async (filters?: Partial<SearchFilters>): Promise<Event[]> => {
  try {
    if (!db) {
      return [];
    }

    // Get all events
    let q = query(
      collection(db, 'events'),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const allEvents: Event[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();

      // Handle different data structures
      const event: Event = {
        id: doc.id,
        title: data.title || 'Untitled Event',
        description: data.description || '',
        date: data.date || new Date().toISOString(),
        time: data.time || '00:00',
        location: typeof data.location === 'string' ? data.location :
                 data.location?._lat ? `${data.location._lat}, ${data.location._long}` : 'TBD',
        price: data.price || 0,
        capacity: data.capacity || 0,
        image: data.image || getDefaultEventImage(),
        tags: Array.isArray(data.tags) ? data.tags : [],
        hostId: data.hostId || data.host_id || '',
        status: data.status || 'pending',
        ticketsSold: data.ticketsSold || 0,
        revenue: data.revenue || 0,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt
      };

      allEvents.push(event);
    });

    // Filter for public display - show approved/published events
    const publicEvents = allEvents.filter(event =>
      event.status === 'approved' ||
      event.status === 'published' ||
      event.status === 'active'
    );



    // Apply additional filters if provided
    let filteredEvents = publicEvents;

    if (filters?.category && filters.category !== 'all') {
      filteredEvents = filteredEvents.filter(event =>
        event.tags.some(tag => tag.toLowerCase().includes(filters.category!.toLowerCase()))
      );
    }

    if (filters?.query) {
      const searchQuery = filters.query.toLowerCase();
      filteredEvents = filteredEvents.filter(event =>
        event.title.toLowerCase().includes(searchQuery) ||
        event.description.toLowerCase().includes(searchQuery) ||
        (typeof event.location === 'string' && event.location.toLowerCase().includes(searchQuery)) ||
        event.tags.some(tag => tag.toLowerCase().includes(searchQuery))
      );
    }

    if (filters?.tags && filters.tags.length > 0) {
      filteredEvents = filteredEvents.filter(event =>
        filters.tags!.some(tag => event.tags.includes(tag))
      );
    }

    return filteredEvents;
  } catch (error) {
    return [];
  }
};

export const getAllEvents = async (): Promise<Event[]> => {
  try {
    if (!db) {
      return [];
    }

    const q = query(
      collection(db, 'events'),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);

    const events: Event[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();

      const event: Event = {
        id: doc.id,
        title: data.title || 'Untitled Event',
        description: data.description || '',
        date: data.date || new Date().toISOString(),
        time: data.time || '00:00',
        location: typeof data.location === 'string' ? data.location :
                 data.location?._lat ? `${data.location._lat}, ${data.location._long}` : 'TBD',
        price: data.price || 0,
        capacity: data.capacity || 0,
        image: data.image || getDefaultEventImage(),
        tags: Array.isArray(data.tags) ? data.tags : [],
        hostId: data.hostId || data.host_id || '',
        status: data.status || 'pending',
        ticketsSold: data.ticketsSold || 0,
        revenue: data.revenue || 0,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt
      };

      events.push(event);
    });

    return events;
  } catch (error) {
    return [];
  }
};

export const getEventById = async (eventId: string): Promise<Event | null> => {
  try {
    if (!db) return null;

    const eventDoc = await getDoc(doc(db, 'events', eventId));
    if (eventDoc.exists()) {
      const data = eventDoc.data();
      return {
        id: eventDoc.id,
        title: data.title || 'Untitled Event',
        description: data.description || '',
        date: data.date || new Date().toISOString(),
        time: data.time || '00:00',
        location: typeof data.location === 'string' ? data.location :
                 data.location?._lat ? `${data.location._lat}, ${data.location._long}` : 'TBD',
        price: data.price || 0,
        capacity: data.capacity || 0,
        image: data.image || getDefaultEventImage(),
        tags: Array.isArray(data.tags) ? data.tags : [],
        hostId: data.hostId || data.host_id || '',
        status: data.status || 'pending',
        ticketsSold: data.ticketsSold || 0,
        revenue: data.revenue || 0,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt
      } as Event;
    }
    return null;
  } catch (error) {
    return null;
  }
};

export const getEventsByHost = async (hostId: string, userEmail?: string): Promise<Event[]> => {
  try {
    if (!db) return [];

    // First try to find events by hostId
    const q1 = query(
      collection(db, 'events'),
      where('hostId', '==', hostId),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot1 = await getDocs(q1);
    const events: Event[] = [];

    querySnapshot1.forEach((doc) => {
      const data = doc.data();

      // Ensure proper data structure with defaults
      const event: Event = {
        id: doc.id,
        title: data.title || 'Untitled Event',
        description: data.description || '',
        date: data.date || new Date().toISOString(),
        time: data.time || '00:00',
        location: typeof data.location === 'string' ? data.location :
                 data.location?._lat ? `${data.location._lat}, ${data.location._long}` : 'TBD',
        price: data.price || 0,
        capacity: data.capacity || 0,
        image: data.image || getDefaultEventImage(),
        tags: Array.isArray(data.tags) ? data.tags : [],
        hostId: data.hostId || data.host_id || '',
        status: data.status || 'pending',
        ticketsSold: data.ticketsSold || 0,
        revenue: data.revenue || 0,
        totalTickets: data.totalTickets || data.capacity || 0,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt
      };

      events.push(event);
    });

    // Always try querying by createdBy field as well (don't wait for hostId to be empty)
    try {
      const q2 = query(
        collection(db, 'events'),
        where('createdBy', '==', hostId),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot2 = await getDocs(q2);

      querySnapshot2.forEach((doc) => {
        const data = doc.data();

        // Check if this event is already in the events array (avoid duplicates)
        const existingEvent = events.find(e => e.id === doc.id);
        if (!existingEvent) {
          const event: Event = {
            id: doc.id,
            title: data.title || 'Untitled Event',
            description: data.description || '',
            date: data.date || new Date().toISOString(),
            time: data.time || '00:00',
            location: typeof data.location === 'string' ? data.location :
                     data.location?._lat ? `${data.location._lat}, ${data.location._long}` : 'TBD',
            price: data.price || 0,
            capacity: data.capacity || 0,
            image: data.image || getDefaultEventImage(),
            tags: Array.isArray(data.tags) ? data.tags : [],
            hostId: data.hostId || data.host_id || data.createdBy || '',
            status: data.status || 'pending',
            ticketsSold: data.ticketsSold || 0,
            revenue: data.revenue || 0,
            totalTickets: data.totalTickets || data.capacity || 0,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt
          };

          events.push(event);
        }
      });
    } catch (error) {
      // Silently handle error
    }

    return events;
  } catch (error) {
    return [];
  }
};

// Bookings
export const getUserBookings = async (userId: string): Promise<Booking[]> => {
  try {
    if (!db) return [];

    const q = query(
      collection(db, 'bookings'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const bookings: Booking[] = [];

    querySnapshot.forEach((doc) => {
      bookings.push({
        id: doc.id,
        ...doc.data()
      } as Booking);
    });

    return bookings;
  } catch (error) {
    return [];
  }
};

export const createBooking = async (bookingData: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>): Promise<string | null> => {
  try {
    if (!db) return null;

    const docRef = await addDoc(collection(db, 'bookings'), {
      ...bookingData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });

    return docRef.id;
  } catch (error) {
    return null;
  }
};

export const updateBooking = async (bookingId: string, updates: Partial<Booking>): Promise<boolean> => {
  try {
    if (!db) return false;

    await updateDoc(doc(db, 'bookings', bookingId), {
      ...updates,
      updatedAt: Timestamp.now()
    });

    return true;
  } catch (error) {
    return false;
  }
};

// Notifications
export const getUserNotifications = async (userId: string): Promise<Notification[]> => {
  try {
    if (!db) return [];

    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(50)
    );

    const querySnapshot = await getDocs(q);
    const notifications: Notification[] = [];

    querySnapshot.forEach((doc) => {
      notifications.push({
        id: doc.id,
        ...doc.data()
      } as Notification);
    });

    return notifications;
  } catch (error) {
    return [];
  }
};

export const markNotificationAsRead = async (notificationId: string): Promise<boolean> => {
  try {
    if (!db) return false;

    await updateDoc(doc(db, 'notifications', notificationId), {
      read: true
    });

    return true;
  } catch (error) {
    return false;
  }
};

// Utility functions
export const generateQRCode = (bookingId: string, eventId: string): string => {
  // Simple QR code data - in production, this would be more secure
  return `tickzy://ticket/${bookingId}/${eventId}`;
};

export const formatEventDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const formatEventTime = (timeString: string): string => {
  const [hours, minutes] = timeString.split(':');
  const date = new Date();
  date.setHours(parseInt(hours), parseInt(minutes));
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
};

// Admin logging function
export const logAdminAction = async (
  adminId: string,
  adminEmail: string,
  action: string,
  targetType: 'user' | 'event' | 'hostRequest',
  targetId: string,
  details: string,
  targetName?: string
): Promise<boolean> => {
  try {
    if (!db) return false;

    await addDoc(collection(db, 'adminLogs'), {
      adminId,
      adminEmail,
      action,
      targetType,
      targetId,
      targetName,
      details,
      timestamp: Timestamp.now()
    });

    return true;
  } catch (error) {
    return false;
  }
};

// Development utility functions for testing admin functionality
export const createSampleHostRequest = async (userId: string, userEmail: string): Promise<boolean> => {
  try {
    if (!db) return false;

    await addDoc(collection(db, 'hostRequests'), {
      userId,
      userEmail,
      reason: 'I want to host events for my local community and have experience organizing meetups.',
      experience: 'I have organized 5+ community events with 50+ attendees each.',
      status: 'pending',
      createdAt: Timestamp.now()
    });

    return true;
  } catch (error) {
    return false;
  }
};

export const createSampleEvent = async (hostId: string): Promise<boolean> => {
  try {
    if (!db) return false;

    await addDoc(collection(db, 'events'), {
      title: 'Sample Tech Meetup',
      description: 'A sample event for testing admin functionality',
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
      time: '18:00',
      location: 'Tech Hub Downtown',
      price: 25,
      capacity: 100,
      image: getDefaultEventImage(),
      tags: ['technology', 'networking'],
      hostId,
      status: 'pending',
      ticketsSold: 0,
      revenue: 0,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });

    return true;
  } catch (error) {
    return false;
  }
};
