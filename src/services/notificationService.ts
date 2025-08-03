/**
 * Notification Service
 * 
 * Handles creating and sending notifications for various events:
 * - Host creates event
 * - User books event  
 * - Admin deletes event
 * - Event goes live (approved)
 * - Event cancelled/deleted notifications
 */

import { addDoc, collection, Timestamp, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { Notification } from '../types';
import { emailService } from './emailService';

export interface NotificationData {
  userId: string;
  title: string;
  message: string;
  type: 'booking' | 'event' | 'system' | 'reminder';
  actionUrl?: string;
}

class NotificationService {
  /**
   * Create a notification in Firestore
   */
  async createNotification(data: NotificationData): Promise<string | null> {
    try {
      console.log('🔔 Creating notification with data:', data);
      console.log('🔔 Database instance:', db ? 'Available' : 'Not available');

      if (!db) {
        console.error('❌ Database not initialized');
        return null;
      }

      const notificationData = {
        ...data,
        read: false,
        createdAt: Timestamp.now()
      };

      const notificationDoc = await addDoc(collection(db, 'notifications'), notificationData);
      return notificationDoc.id;
    } catch (error: any) {

      // Log specific Firebase errors
      if (error.code) {
        console.error('❌ Firebase error code:', error.code);
      }

      return null;
    }
  }

  /**
   * Send notification when host creates an event
   */
  async notifyHostEventCreated(hostId: string, eventTitle: string, eventId: string): Promise<void> {
    console.log('🔔 notifyHostEventCreated called with:', { hostId, eventTitle, eventId });

    const result = await this.createNotification({
      userId: hostId,
      title: 'Event Created Successfully',
      message: `Your event "${eventTitle}" has been submitted for review. You'll be notified once it's approved.`,
      type: 'event',
      actionUrl: `/dashboard`
    });

    if (result) {
      console.log('✅ Host event creation notification sent successfully');
    } else {
      console.error('❌ Failed to send host event creation notification');
    }
  }

  /**
   * Send notification when user books an event
   */
  async notifyUserBookingConfirmed(
    userId: string, 
    eventTitle: string, 
    eventId: string,
    bookingId: string
  ): Promise<void> {
    await this.createNotification({
      userId: userId,
      title: 'Booking Confirmed',
      message: `Your booking for "${eventTitle}" has been confirmed. Check your email for details.`,
      type: 'booking',
      actionUrl: `/dashboard`
    });
  }

  /**
   * Send notification when event is approved and goes live
   */
  async notifyHostEventApproved(
    hostId: string, 
    eventTitle: string, 
    eventId: string,
    hostEmail: string,
    hostName: string
  ): Promise<void> {
    // Create in-app notification
    await this.createNotification({
      userId: hostId,
      title: 'Event Approved & Live!',
      message: `Congratulations! Your event "${eventTitle}" has been approved and is now live. Users can start booking tickets.`,
      type: 'event',
      actionUrl: `/event/${eventId}`
    });

    // Send email notification
    try {
      await emailService.sendEventNotification(
        hostEmail,
        hostName,
        eventTitle,
        'Your event is now live!',
        'Dashboard'
      );
    } catch (error) {
      console.error('Error sending host approval email:', error);
    }
  }

  /**
   * Send notifications when admin deletes an event
   */
  async notifyEventDeleted(eventId: string, eventTitle: string, hostId: string): Promise<void> {
    try {
      // 1. Notify the host
      await this.createNotification({
        userId: hostId,
        title: 'Event Cancelled',
        message: `Your event "${eventTitle}" has been cancelled by administration. If you have questions, please contact support.`,
        type: 'system',
        actionUrl: '/dashboard'
      });

      // 2. Find all users who booked this event and notify them
      const bookingsQuery = query(
        collection(db, 'bookings'),
        where('eventId', '==', eventId),
        where('status', 'in', ['booked', 'confirmed', 'pending'])
      );

      const bookingsSnapshot = await getDocs(bookingsQuery);
      
      const notificationPromises: Promise<void>[] = [];
      
      bookingsSnapshot.forEach((doc) => {
        const booking = doc.data();
        const notificationPromise = this.createNotification({
          userId: booking.userId,
          title: 'Event Cancelled - Refund Processing',
          message: `Unfortunately, "${eventTitle}" has been cancelled. Your refund will be processed within 3-5 business days.`,
          type: 'system',
          actionUrl: '/dashboard'
        }).then(() => {});
        
        notificationPromises.push(notificationPromise);
      });

      await Promise.all(notificationPromises);
      
      console.log(`📢 Sent deletion notifications for event: ${eventTitle}`);
    } catch (error) {
      console.error('Error sending event deletion notifications:', error);
    }
  }

  /**
   * Send notification when event is about to start (reminder)
   */
  async notifyEventReminder(
    userId: string, 
    eventTitle: string, 
    eventId: string,
    hoursUntilEvent: number
  ): Promise<void> {
    const timeText = hoursUntilEvent <= 24 
      ? `${hoursUntilEvent} hours` 
      : `${Math.floor(hoursUntilEvent / 24)} days`;

    await this.createNotification({
      userId: userId,
      title: 'Event Reminder',
      message: `"${eventTitle}" starts in ${timeText}. Don't forget to attend!`,
      type: 'reminder',
      actionUrl: `/event/${eventId}`
    });
  }

  /**
   * Send notification when host's event gets its first booking
   */
  async notifyHostFirstBooking(
    hostId: string, 
    eventTitle: string, 
    eventId: string,
    bookerName: string
  ): Promise<void> {
    await this.createNotification({
      userId: hostId,
      title: 'First Booking Received!',
      message: `Great news! ${bookerName} just booked a ticket for "${eventTitle}". Your event is gaining traction!`,
      type: 'event',
      actionUrl: `/dashboard`
    });
  }

  /**
   * Send notification when event is rejected by admin
   */
  async notifyHostEventRejected(
    hostId: string, 
    eventTitle: string, 
    reason?: string
  ): Promise<void> {
    const message = reason 
      ? `Your event "${eventTitle}" was not approved. Reason: ${reason}. You can edit and resubmit.`
      : `Your event "${eventTitle}" was not approved. Please review our guidelines and resubmit.`;

    await this.createNotification({
      userId: hostId,
      title: 'Event Not Approved',
      message: message,
      type: 'system',
      actionUrl: '/dashboard'
    });
  }

  /**
   * Bulk notify users about a new event in their interested categories
   */
  async notifyUsersNewEvent(
    eventTitle: string,
    eventId: string,
    eventTags: string[],
    eventDate: string
  ): Promise<void> {
    // This would require user preferences/interests to be stored
    // For now, we'll skip this but the structure is here for future implementation
    console.log(`📢 New event notification ready: ${eventTitle}`);
  }

  /**
   * Create a test notification (for development/testing)
   */
  async createTestNotification(userId: string): Promise<void> {
    await this.createNotification({
      userId: userId,
      title: 'Welcome to Tickzy!',
      message: 'Your notification system is working perfectly. You\'ll receive updates about bookings, events, and important announcements here.',
      type: 'system',
      actionUrl: '/dashboard'
    });
  }
}

export const notificationService = new NotificationService();


