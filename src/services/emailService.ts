/**
 * Email Service using EmailJS
 * 
 * Handles welcome emails and other email communications
 */

import emailjs from '@emailjs/browser';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

// EmailJS Configuration - Using hardcoded values for reliability
const EMAILJS_SERVICE_ID = 'service_tvda6av';
const EMAILJS_TEMPLATE_ID = 'template_gan12wr';
const EMAILJS_BOOKING_TEMPLATE_ID = 'template_booking_confirmation';
const EMAILJS_PUBLIC_KEY = 'W3q7yQau2TSYWOSI5';

// Initialize EmailJS
emailjs.init(EMAILJS_PUBLIC_KEY);

// Debug function to test EmailJS configuration
export const testEmailJSConfiguration = () => {
  console.log('📧 EmailJS Configuration:');
  console.log('Service ID:', EMAILJS_SERVICE_ID);
  console.log('Template ID:', EMAILJS_TEMPLATE_ID);
  console.log('Public Key:', EMAILJS_PUBLIC_KEY);
  console.log('EmailJS initialized:', !!emailjs);
};

// Test function to send a test email
export const sendTestEmail = async (testEmail: string = 'test@example.com') => {
  console.log('🧪 Sending test email to:', testEmail);
  const emailService = EmailService.getInstance();
  const result = await emailService.sendWelcomeEmail({
    userEmail: testEmail,
    userName: 'Test User',
    userFirstName: 'Test'
  });
  console.log('🧪 Test email result:', result);
  return result;
};



export interface WelcomeEmailData {
  userEmail: string;
  userName: string;
  userFirstName?: string;
}

export interface BookingConfirmationEmailData {
  userEmail: string;
  userName: string;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  eventLocation: string;
  bookingId: string;
  totalAmount: number;
  ticketCount: number;
  qrCode?: string; // Base64 QR code image
}

class EmailService {
  private static instance: EmailService;

  private constructor() {}

  public static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  /**
   * Send welcome email to new user
   */
  async sendWelcomeEmail(data: WelcomeEmailData): Promise<boolean> {
    try {
      console.log('📧 Attempting to send welcome email to:', data.userEmail);

      // Simplified template parameters - using most common EmailJS variable names
      const templateParams = {
        to_email: data.userEmail,
        to_name: data.userName || 'User',
        from_name: 'Tickzy Team',
        message: `Welcome to Tickzy, ${data.userFirstName || data.userName || 'User'}! Thank you for joining our event platform. We're excited to have you on board!`,
        subject: 'Welcome to Tickzy - Your Event Journey Starts Here!',
        reply_to: 'support@tickzy.com'
      };

      console.log('📧 Template params:', templateParams);
      console.log('📧 Using Service ID:', EMAILJS_SERVICE_ID);
      console.log('📧 Using Template ID:', EMAILJS_TEMPLATE_ID);

      if (!EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID || !EMAILJS_PUBLIC_KEY) {
        console.error('❌ EmailJS configuration missing');
        return false;
      }

      const response = await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        templateParams
      );

      console.log('✅ EmailJS response:', response);
      return response.status === 200;
    } catch (error: any) {
      console.error('❌ EmailJS Error:', {
        error: error,
        status: error.status,
        text: error.text,
        message: error.message
      });
      return false;
    }
  }

  /**
   * Check if welcome email has been sent to user
   */
  async hasWelcomeEmailBeenSent(userId: string): Promise<boolean> {
    try {
      if (!db) return false;

      const userDocRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        return userData.welcomeEmailSent === true;
      }

      return false;
    } catch (error) {
      console.error('Error checking welcome email status:', error);
      return false;
    }
  }

  /**
   * Mark welcome email as sent in Firestore
   */
  async markWelcomeEmailSent(userId: string): Promise<void> {
    try {
      if (!db) return;

      const userDocRef = doc(db, 'users', userId);
      await updateDoc(userDocRef, {
        welcomeEmailSent: true,
        welcomeEmailSentAt: new Date(),
        updatedAt: new Date()
      });
    } catch (error) {
      // Silent fail
    }
  }

  /**
   * Send welcome email if not already sent
   */
  async sendWelcomeEmailIfNeeded(
    userId: string,
    userEmail: string,
    userName: string
  ): Promise<void> {
    try {
      // Check if welcome email has already been sent
      const alreadySent = await this.hasWelcomeEmailBeenSent(userId);

      if (alreadySent) {
        return;
      }

      // Send welcome email
      const emailSent = await this.sendWelcomeEmail({
        userEmail,
        userName,
        userFirstName: userName.split(' ')[0] // Extract first name
      });

      if (emailSent) {
        // Mark as sent in Firestore
        await this.markWelcomeEmailSent(userId);
      }
    } catch (error) {
      console.error('❌ Error in welcome email process:', error);
    }
  }

  /**
   * Send event notification email
   */
  async sendEventNotification(
    userEmail: string,
    userName: string,
    eventTitle: string,
    eventDate: string,
    eventLocation: string
  ): Promise<boolean> {
    try {
      const templateParams = {
        to_email: userEmail,
        to_name: userName,
        event_title: eventTitle,
        event_date: eventDate,
        event_location: eventLocation,
        platform_name: 'Tickzy',
        dashboard_url: `${window.location.origin}/dashboard`,
      };

      const response = await emailjs.send(
        EMAILJS_SERVICE_ID,
        'template_event_notification', // Different template for event notifications
        templateParams
      );

      return response.status === 200;
    } catch (error) {
      console.error('Error sending event notification:', error);
      return false;
    }
  }

  /**
   * Send host approval notification
   */
  async sendHostApprovalNotification(
    userEmail: string,
    userName: string
  ): Promise<boolean> {
    try {
      const templateParams = {
        to_email: userEmail,
        to_name: userName,
        platform_name: 'Tickzy',
        dashboard_url: `${window.location.origin}/dashboard`,
        create_event_url: `${window.location.origin}/create-event`,
      };

      const response = await emailjs.send(
        EMAILJS_SERVICE_ID,
        'template_host_approval', // Different template for host approval
        templateParams
      );

      return response.status === 200;
    } catch (error) {
      console.error('Error sending host approval notification:', error);
      return false;
    }
  }

  /**
   * Send booking confirmation email with QR code
   */
  async sendBookingConfirmationEmail(data: BookingConfirmationEmailData): Promise<boolean> {
    try {
      if (!EMAILJS_SERVICE_ID || !EMAILJS_BOOKING_TEMPLATE_ID || !EMAILJS_PUBLIC_KEY) {
        console.error('❌ EmailJS not configured properly for booking confirmation.');
        return false;
      }

      // Validate email data
      if (!data.userEmail || !data.userName) {
        console.error('❌ Missing required email data:', { userEmail: data.userEmail, userName: data.userName });
        return false;
      }

      const templateParams = {
        // Multiple email field formats for compatibility
        to_email: data.userEmail,
        email: data.userEmail,
        user_email: data.userEmail,
        recipient_email: data.userEmail,

        // Multiple name field formats for compatibility
        to_name: data.userName,
        name: data.userName,
        user_name: data.userName,
        recipient_name: data.userName,

        // Event information
        event_title: data.eventTitle,
        event_name: data.eventTitle,
        event_date: data.eventDate,
        event_time: data.eventTime,
        event_location: data.eventLocation,
        event_venue: data.eventLocation,

        // Booking information
        booking_id: data.bookingId,
        ticket_count: String(data.ticketCount),
        total_amount: String(data.totalAmount),
        total_price: `$${data.totalAmount}`,

        // QR Code (if available)
        qr_code: data.qrCode || 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',

        // Platform information
        from_name: 'Tickzy',
        platform_name: 'Tickzy',
        company: 'Tickzy',
        subject: `Booking Confirmation - ${data.eventTitle}`,
        message: `Your booking for ${data.eventTitle} has been confirmed! Booking ID: ${data.bookingId}`,

        // URLs and support
        dashboard_url: 'http://localhost:3000/dashboard',
        support_email: 'support@tickzy.com',
        reply_to: 'support@tickzy.com'
      };

      const response = await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_BOOKING_TEMPLATE_ID, // Using dedicated booking confirmation template
        templateParams
      );

      return response.status === 200;
    } catch (error: any) {
      return false;
    }
  }


}

// Export singleton instance
export const emailService = EmailService.getInstance();
export default emailService;

// Expose functions globally for testing in browser console
if (typeof window !== 'undefined') {
  (window as any).testEmailJS = testEmailJSConfiguration;
  (window as any).sendTestEmail = sendTestEmail;
  (window as any).emailService = emailService;
}
