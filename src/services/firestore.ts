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
  DocumentData,
  runTransaction,
  increment
} from 'firebase/firestore';
import { db } from '../firebase';
import { Event, Booking, Notification, SearchFilters, PaginatedResponse } from '../types';
import { getDefaultEventImage } from '../utils/defaultImage';
import QRCode from 'qrcode';

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
      const capacity = data.capacity || data.totalTickets || 0;
      const ticketsSold = data.ticketsSold || 0;
      const seatsLeft = data.seatsLeft !== undefined ? data.seatsLeft : Math.max(0, capacity - ticketsSold);

      const event: Event = {
        id: doc.id,
        title: data.title || 'Untitled Event',
        description: data.description || '',
        date: data.date || new Date().toISOString(),
        time: data.time || '00:00',
        location: typeof data.location === 'string' ? data.location :
                 data.location?._lat ? `${data.location._lat}, ${data.location._long}` : 'TBD',
        locationName: data.locationName || data.location || 'TBD',
        price: data.price || 0,
        capacity: capacity,
        totalTickets: capacity,
        seatsLeft: seatsLeft,
        image: data.image || getDefaultEventImage(),
        bannerURL: data.bannerURL || data.image || getDefaultEventImage(),
        hostName: data.hostName || 'Unknown Host',
        category: data.category || 'General',
        tags: Array.isArray(data.tags) ? data.tags : [],
        hostId: data.hostId || data.host_id || '',
        status: data.status || 'pending',
        ticketsSold: ticketsSold,
        revenue: data.revenue || 0,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt
      };

      allEvents.push(event);
    });

    // Filter for public display - show approved/published events that are not past
    const now = new Date();
    now.setHours(0, 0, 0, 0); // Reset time to start of day for comparison

    const publicEvents = allEvents.filter(event => {
      // Check if event is approved/published
      const isApproved = event.status === 'approved' ||
                        event.status === 'published' ||
                        event.status === 'active';

      // Check if event date hasn't passed
      const eventDate = new Date(event.date);
      const isUpcoming = eventDate >= now;

      // Check if event is not cancelled or deleted
      const isNotCancelled = event.status !== 'cancelled' &&
                            event.status !== 'deleted' &&
                            event.status !== 'rejected';

      return isApproved && isUpcoming && isNotCancelled;
    });



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

      const capacity = data.capacity || data.totalTickets || 0;
      const ticketsSold = data.ticketsSold || 0;
      const seatsLeft = data.seatsLeft !== undefined ? data.seatsLeft : Math.max(0, capacity - ticketsSold);

      const event: Event = {
        id: doc.id,
        title: data.title || 'Untitled Event',
        description: data.description || '',
        date: data.date || new Date().toISOString(),
        time: data.time || '00:00',
        location: typeof data.location === 'string' ? data.location :
                 data.location?._lat ? `${data.location._lat}, ${data.location._long}` : 'TBD',
        locationName: data.locationName || data.location || 'TBD',
        price: data.price || 0,
        capacity: capacity,
        totalTickets: capacity,
        seatsLeft: seatsLeft,
        image: data.image || getDefaultEventImage(),
        bannerURL: data.bannerURL || data.image || getDefaultEventImage(),
        hostName: data.hostName || 'Unknown Host',
        category: data.category || 'General',
        tags: Array.isArray(data.tags) ? data.tags : [],
        hostId: data.hostId || data.host_id || '',
        status: data.status || 'pending',
        ticketsSold: ticketsSold,
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
      const capacity = data.capacity || data.totalTickets || 0;
      const ticketsSold = data.ticketsSold || 0;
      const seatsLeft = data.seatsLeft !== undefined ? data.seatsLeft : Math.max(0, capacity - ticketsSold);

      return {
        id: eventDoc.id,
        title: data.title || 'Untitled Event',
        description: data.description || '',
        date: data.date || new Date().toISOString(),
        time: data.time || '00:00',
        location: typeof data.location === 'string' ? data.location :
                 data.location?._lat ? `${data.location._lat}, ${data.location._long}` : 'TBD',
        locationName: data.locationName || data.location || 'TBD',
        price: data.price || 0,
        capacity: capacity,
        totalTickets: capacity,
        seatsLeft: seatsLeft,
        image: data.image || getDefaultEventImage(),
        bannerURL: data.bannerURL || data.image || getDefaultEventImage(),
        hostName: data.hostName || 'Unknown Host',
        category: data.category || 'General',
        tags: Array.isArray(data.tags) ? data.tags : [],
        hostId: data.hostId || data.host_id || '',
        status: data.status || 'pending',
        ticketsSold: ticketsSold,
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

export const getBookingById = async (bookingId: string): Promise<Booking | null> => {
  try {
    if (!db) return null;

    const bookingDoc = await getDoc(doc(db, 'bookings', bookingId));
    if (bookingDoc.exists()) {
      const data = bookingDoc.data();
      return {
        id: bookingDoc.id,
        userId: data.userId,
        userEmail: data.userEmail,
        userName: data.userName,
        eventId: data.eventId,
        eventTitle: data.eventTitle,
        eventDate: data.eventDate,
        eventTime: data.eventTime,
        eventLocation: data.eventLocation,
        eventImage: data.eventImage,
        ticketCount: data.ticketCount,
        ticketTier: data.ticketTier,
        totalAmount: data.totalAmount,
        status: data.status,
        bookingDate: data.bookingDate,
        qrCode: data.qrCode,
        qrCodeData: data.qrCodeData,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching booking:', error);
    return null;
  }
};

// Check if user already has a booking for this event
export const checkExistingBooking = async (userId: string, eventId: string): Promise<boolean> => {
  try {
    if (!db) return false;

    const q = query(
      collection(db, 'bookings'),
      where('userId', '==', userId),
      where('eventId', '==', eventId),
      where('status', 'in', ['booked', 'confirmed', 'pending'])
    );

    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  } catch (error) {
    console.error('Error checking existing booking:', error);
    return false;
  }
};

// Generate QR code for booking
export const generateBookingQRCode = async (bookingId: string, eventId: string): Promise<{ qrCode: string; qrCodeData: string }> => {
  try {
    // Create readable text that any QR scanner can display
    const qrCodeData = `TICKZY TICKET
Booking ID: ${bookingId}
Event ID: ${eventId}
Valid Ticket - Show at venue
Scan Date: ${new Date().toLocaleDateString()}
Time: ${new Date().toLocaleTimeString()}`;

    const qrCode = await QRCode.toDataURL(qrCodeData, {
      width: 256,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    return { qrCode, qrCodeData };
  } catch (error) {
    console.error('Error generating QR code:', error);
    // Fallback to simple text format
    const qrCodeData = `TICKZY TICKET - Booking: ${bookingId}`;
    return { qrCode: '', qrCodeData };
  }
};

// Generate QR code with full event details
export const generateBookingQRCodeWithDetails = async (bookingId: string, eventId: string, eventData: Event): Promise<{ qrCode: string; qrCodeData: string }> => {
  try {
    // Create comprehensive ticket information that's readable when scanned
    const qrCodeData = `🎟️ TICKZY TICKET 🎟️

📅 EVENT: ${eventData.title}
📍 VENUE: ${eventData.location}
🗓️ DATE: ${new Date(eventData.date).toLocaleDateString()}
⏰ TIME: ${eventData.time}
💰 PRICE: $${eventData.price}

🎫 BOOKING DETAILS:
ID: ${bookingId}
Status: VALID TICKET
Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}

✅ Show this QR code at venue entrance
🌐 Verification: localhost:3000/ticket/${bookingId}`;

    const qrCode = await QRCode.toDataURL(qrCodeData, {
      width: 256,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    return { qrCode, qrCodeData };
  } catch (error) {
    console.error('Error generating detailed QR code:', error);
    // Fallback to basic QR code
    return generateBookingQRCode(bookingId, eventId);
  }
};

// Atomic booking creation with seat decrement
export const createBookingAtomic = async (
  userId: string,
  userEmail: string,
  userName: string,
  eventId: string,
  ticketCount: number = 1
): Promise<{ success: boolean; bookingId?: string; error?: string }> => {
  try {
    if (!db) return { success: false, error: 'Database not available' };

    // Check if user already has a booking for this event
    const hasExistingBooking = await checkExistingBooking(userId, eventId);
    if (hasExistingBooking) {
      return { success: false, error: 'You already have a booking for this event' };
    }

    // Use transaction to ensure atomicity
    const result = await runTransaction(db, async (transaction) => {
      // Get event document
      const eventRef = doc(db, 'events', eventId);
      const eventDoc = await transaction.get(eventRef);

      if (!eventDoc.exists()) {
        throw new Error('Event not found');
      }

      const eventData = eventDoc.data() as Event;

      // Check if event date has passed
      const eventDate = new Date(eventData.date);
      const now = new Date();
      now.setHours(0, 0, 0, 0); // Reset time to start of day for comparison

      if (eventDate < now) {
        throw new Error('This event has already passed and is no longer available for booking');
      }

      // Check if event is published/approved and has seats available
      if (eventData.status !== 'published' && eventData.status !== 'approved') {
        throw new Error('Event is not available for booking');
      }

      const currentSeatsLeft = eventData.seatsLeft || eventData.capacity || 0;
      if (currentSeatsLeft < ticketCount) {
        throw new Error(`Only ${currentSeatsLeft} seats available`);
      }

      // Create booking document
      const bookingRef = doc(collection(db, 'bookings'));
      const bookingId = bookingRef.id;

      // Generate QR code with event details
      const { qrCode, qrCodeData } = await generateBookingQRCodeWithDetails(bookingId, eventId, eventData);

      const bookingData: Omit<Booking, 'id'> = {
        userId,
        userEmail,
        userName,
        eventId,
        eventTitle: eventData.title,
        eventDate: eventData.date,
        eventTime: eventData.time,
        eventLocation: eventData.location,
        eventImage: eventData.image,
        ticketCount,
        ticketTier: 'regular',
        totalAmount: eventData.price * ticketCount,
        status: 'booked',
        bookingDate: new Date().toISOString(),
        qrCode,
        qrCodeData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };

      // Create booking
      transaction.set(bookingRef, bookingData);

      // Update event seats and tickets sold
      transaction.update(eventRef, {
        seatsLeft: increment(-ticketCount),
        ticketsSold: increment(ticketCount),
        revenue: increment(eventData.price * ticketCount),
        updatedAt: Timestamp.now()
      });

      return { bookingId, eventData, bookingData };
    });

    return {
      success: true,
      bookingId: result.bookingId,
      qrCode: result.bookingData.qrCode,
      bookingData: result.bookingData
    };
  } catch (error: any) {
    console.error('Error creating booking:', error);
    return { success: false, error: error.message || 'Failed to create booking' };
  }
};

// Notifications
export const getUserNotifications = async (userId: string): Promise<Notification[]> => {
  try {
    console.log('🔔 getUserNotifications called for userId:', userId);

    if (!db) {
      console.error('❌ Database not available in getUserNotifications');
      return [];
    }

    // Try with orderBy first, fallback to without if index not ready
    let q;
    try {
      q = query(
        collection(db, 'notifications'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(50)
      );
    } catch (indexError) {
      console.log('🔔 Index not ready, using query without orderBy');
      q = query(
        collection(db, 'notifications'),
        where('userId', '==', userId),
        limit(50)
      );
    }

    console.log('🔔 Executing notifications query...');
    const querySnapshot = await getDocs(q);
    console.log('🔔 Query completed, documents found:', querySnapshot.size);

    const notifications: Notification[] = [];

    querySnapshot.forEach((doc) => {
      const notificationData = {
        id: doc.id,
        ...doc.data()
      } as Notification;
      console.log('🔔 Found notification:', notificationData);
      notifications.push(notificationData);
    });

    // Sort by createdAt descending (newest first) - temporary until index is ready
    notifications.sort((a, b) => {
      const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt);
      const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt);
      return dateB.getTime() - dateA.getTime();
    });

    console.log('🔔 Total notifications returned:', notifications.length);
    return notifications;
  } catch (error: any) {
    console.error('❌ Error in getUserNotifications:', {
      error: error,
      message: error.message,
      code: error.code
    });
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


