/**
 * Email Service using EmailJS
 * 
 * Handles welcome emails and other email communications
 */

import emailjs from '@emailjs/browser';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

// EmailJS Configuration - Using your actual values
const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID || 'service_tvda6av';
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || 'template_gan12wr';
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || 'W3q7yQau2TSYWOSI5';

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


      // Try multiple email variable names - your template might expect different names
      const templateParams = {
        // Common recipient email variable names
        to_email: data.userEmail,
        email: data.userEmail,
        user_email: data.userEmail,
        recipient_email: data.userEmail,

        // Common name variable names
        to_name: data.userName || 'User',
        name: data.userName || 'User',
        user_name: data.userName || 'User',
        recipient_name: data.userName || 'User',

        // Common message variables
        from_name: 'Tickzy',
        message: 'Welcome to Tickzy! Thank you for joining our platform.',
        subject: 'Welcome to Tickzy!',

        // Additional common variables
        reply_to: 'support@tickzy.com',
        company: 'Tickzy'
      };

      // Check if EmailJS is properly configured


      if (!EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID || !EMAILJS_PUBLIC_KEY) {
        console.error('❌ EmailJS not configured properly. Please check environment variables.');
        return false;
      }

      const response = await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        templateParams
      );

      if (response.status === 200) {
        return true;
      } else {
        console.error('Failed to send welcome email:', response);
        return false;
      }
    } catch (error: any) {
      console.error('❌ EmailJS Error Details:', {
        error: error,
        status: error.status,
        text: error.text,
        message: error.message
      });

      // Try to get more specific error info
      if (error.text) {
        console.error('❌ EmailJS Error Text:', error.text);
      }

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


}

// Export singleton instance
export const emailService = EmailService.getInstance();
export default emailService;
