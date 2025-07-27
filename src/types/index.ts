/**
 * Type definitions for Tickzy application
 */

import { Timestamp } from 'firebase/firestore';

// Event related types
export interface Event {
  id: string;
  title: string;
  description: string;
  date: string; // ISO date string
  time: string;
  location: string;
  price: number;
  tags: string[]; // Multiple tags for filtering
  category: string; // Primary category
  image: string;
  hostId: string;
  hostName: string;
  status: 'draft' | 'published' | 'cancelled' | 'completed' | 'pending' | 'rejected';
  totalTickets: number;
  ticketsSold: number;
  seatsLeft: number; // Available seats for booking
  capacity: number; // Total capacity (same as totalTickets)
  revenue: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Booking related types
export interface Booking {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  eventId: string;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  eventLocation: string;
  eventImage: string;
  ticketCount: number;
  ticketTier: 'regular' | 'vip' | 'premium';
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'attended' | 'booked';
  bookingDate: string;
  qrCode: string; // Generated QR code for ticket (base64 or data URL)
  qrCodeData: string; // QR code text data
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Notification types
export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'booking' | 'event' | 'system' | 'reminder';
  read: boolean;
  actionUrl?: string;
  createdAt: Timestamp;
}

// Search filters
export interface SearchFilters {
  query: string;
  category: string;
  tags: string[];
  location: string;
  priceRange: {
    min: number;
    max: number;
  };
  dateRange: {
    start: string;
    end: string;
  };
}

// Component props
export interface EventCardProps {
  event: Event;
  onBook?: (eventId: string) => void;
  onEdit?: (eventId: string) => void;
  showActions?: boolean;
}

export interface BookingCardProps {
  booking: Booking;
  onViewTicket?: (booking: Booking) => void;
  onCancel?: (bookingId: string) => void;
}

// Modal props
export interface TicketModalProps {
  booking: Booking | null;
  isOpen: boolean;
  onClose: () => void;
}

// API response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Pagination
export interface PaginationOptions {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
