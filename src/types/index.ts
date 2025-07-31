/**
 * Type definitions for Tickzy application
 */

import { Timestamp } from 'firebase/firestore';

// Ticket tier types
export interface TicketTier {
  id: string;
  name: string; // e.g., "General Admission", "VIP", "Premium"
  price: number;
  seats: number; // Available seats for this tier
  saleStart?: string; // ISO date string - when sales start
  saleEnd?: string; // ISO date string - when sales end
  description?: string; // Optional description of tier benefits
}

// Event related types
export interface Event {
  id: string;
  title: string;
  description: string;
  date: string; // ISO date string
  time: string;
  location: string;
  locationName: string; // Human-readable location name for map display
  price: number;
  tags: string[]; // Multiple tags for filtering
  category: string; // Primary category
  image: string;
  bannerURL: string; // Required banner image URL
  hostId: string;
  hostName: string;
  status: 'draft' | 'published' | 'cancelled' | 'completed' | 'pending' | 'rejected';
  totalTickets: number;
  ticketsSold: number;
  seatsLeft: number; // Available seats for booking
  capacity: number; // Total capacity (same as totalTickets)
  revenue: number;
  ticketTiers?: TicketTier[]; // Optional ticket tiers for different pricing
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
  type: 'booking' | 'event' | 'system' | 'reminder' | 'approval' | 'cancellation';
  read: boolean;
  actionUrl?: string;
  eventId?: string; // Optional reference to related event
  bookingId?: string; // Optional reference to related booking
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
