/**
 * Email Service using EmailJS
 * 
 * Handles welcome emails and other email communications
 */

import emailjs from '@emailjs/browser';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

// EmailJS Configuration
const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID || 'service_tickzy';
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || 'template_welcome';
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || 'your_public_key';

// Initialize EmailJS
emailjs.init(EMAILJS_PUBLIC_KEY);

export interface WelcomeEmailData {
  userEmail: string;
  userName: string;
  userFirstName?: string;
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
      console.log('🔄 Sending welcome email to:', data.userEmail);

      const templateParams = {
        to_email: data.userEmail,
        to_name: data.userName || data.userFirstName || 'New User',
        user_name: data.userName || data.userFirstName || 'New User',
        user_email: data.userEmail,
        platform_name: 'Tickzy',
        platform_url: window.location.origin,
        support_email: 'support@tickzy.com',
        current_year: new Date().getFullYear(),
        // Additional template variables
        welcome_message: `Welcome to Tickzy! We're excited to have you join our community of event enthusiasts.`,
        next_steps: 'Start by exploring events in your area or create your own event as a host.',
        dashboard_url: `${window.location.origin}/dashboard`,
        explore_url: `${window.location.origin}/explore`,
      };

      const response = await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        templateParams
      );

      if (response.status === 200) {
        console.log('✅ Welcome email sent successfully:', response);
        return true;
      } else {
        console.error('❌ Failed to send welcome email:', response);
        return false;
      }
    } catch (error) {
      console.error('❌ Error sending welcome email:', error);
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

      console.log('✅ Marked welcome email as sent for user:', userId);
    } catch (error) {
      console.error('❌ Error marking welcome email as sent:', error);
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
        console.log('📧 Welcome email already sent to user:', userEmail);
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
        console.log('🎉 Welcome email process completed for:', userEmail);
      } else {
        console.error('❌ Failed to send welcome email to:', userEmail);
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
   * Test email configuration
   */
  async testEmailConfiguration(): Promise<boolean> {
    try {
      const testParams = {
        to_email: 'test@example.com',
        to_name: 'Test User',
        message: 'This is a test email to verify EmailJS configuration.',
      };

      const response = await emailjs.send(
        EMAILJS_SERVICE_ID,
        'template_test', // Test template
        testParams
      );

      return response.status === 200;
    } catch (error) {
      console.error('Email configuration test failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const emailService = EmailService.getInstance();
export default emailService;
