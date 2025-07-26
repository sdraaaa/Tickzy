/**
 * Admin Logger Service
 * 
 * Centralized logging service for all admin actions and system events
 */

import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';

export interface AdminLogEntry {
  adminId: string;
  adminEmail: string;
  action: string;
  targetType: 'user' | 'event' | 'hostRequest' | 'system';
  targetId: string;
  targetName?: string;
  details: string;
  timestamp: any;
  metadata?: Record<string, any>;
}

class AdminLogger {
  private static instance: AdminLogger;

  private constructor() {}

  public static getInstance(): AdminLogger {
    if (!AdminLogger.instance) {
      AdminLogger.instance = new AdminLogger();
    }
    return AdminLogger.instance;
  }

  /**
   * Log an admin action to the database
   */
  async logAction(entry: Omit<AdminLogEntry, 'timestamp'>): Promise<void> {
    try {
      if (!db) {
        console.warn('Database not initialized, skipping log entry');
        return;
      }

      const logEntry: AdminLogEntry = {
        ...entry,
        timestamp: Timestamp.now()
      };

      await addDoc(collection(db, 'adminLogs'), logEntry);
      console.log('Admin action logged:', logEntry);
    } catch (error) {
      console.error('Failed to log admin action:', error);
      // Don't throw error to avoid breaking the main action
    }
  }

  /**
   * Log host request approval
   */
  async logHostRequestApproval(
    adminId: string,
    adminEmail: string,
    requestId: string,
    userEmail: string,
    userName?: string
  ): Promise<void> {
    await this.logAction({
      adminId,
      adminEmail,
      action: 'approved',
      targetType: 'hostRequest',
      targetId: requestId,
      targetName: userName || userEmail,
      details: `Host request approved for ${userName || userEmail}. User is now a host.`,
      metadata: {
        userEmail,
        userName,
        newRole: 'host'
      }
    });
  }

  /**
   * Log host request rejection
   */
  async logHostRequestRejection(
    adminId: string,
    adminEmail: string,
    requestId: string,
    userEmail: string,
    reason: string,
    userName?: string
  ): Promise<void> {
    await this.logAction({
      adminId,
      adminEmail,
      action: 'rejected',
      targetType: 'hostRequest',
      targetId: requestId,
      targetName: userName || userEmail,
      details: `Host request rejected for ${userName || userEmail}. Reason: ${reason}`,
      metadata: {
        userEmail,
        userName,
        rejectionReason: reason
      }
    });
  }

  /**
   * Log event approval
   */
  async logEventApproval(
    adminId: string,
    adminEmail: string,
    eventId: string,
    eventTitle: string,
    hostEmail?: string
  ): Promise<void> {
    await this.logAction({
      adminId,
      adminEmail,
      action: 'approved',
      targetType: 'event',
      targetId: eventId,
      targetName: eventTitle,
      details: `Event "${eventTitle}" approved and published${hostEmail ? ` for host ${hostEmail}` : ''}.`,
      metadata: {
        eventTitle,
        hostEmail,
        newStatus: 'approved'
      }
    });
  }

  /**
   * Log event rejection
   */
  async logEventRejection(
    adminId: string,
    adminEmail: string,
    eventId: string,
    eventTitle: string,
    reason: string,
    hostEmail?: string
  ): Promise<void> {
    await this.logAction({
      adminId,
      adminEmail,
      action: 'rejected',
      targetType: 'event',
      targetId: eventId,
      targetName: eventTitle,
      details: `Event "${eventTitle}" rejected${hostEmail ? ` for host ${hostEmail}` : ''}. Reason: ${reason}`,
      metadata: {
        eventTitle,
        hostEmail,
        rejectionReason: reason,
        newStatus: 'rejected'
      }
    });
  }

  /**
   * Log user role update
   */
  async logUserRoleUpdate(
    adminId: string,
    adminEmail: string,
    userId: string,
    userEmail: string,
    oldRole: string,
    newRole: string,
    userName?: string
  ): Promise<void> {
    await this.logAction({
      adminId,
      adminEmail,
      action: 'updated',
      targetType: 'user',
      targetId: userId,
      targetName: userName || userEmail,
      details: `User role updated for ${userName || userEmail}: ${oldRole} → ${newRole}`,
      metadata: {
        userEmail,
        userName,
        oldRole,
        newRole,
        updateType: 'role'
      }
    });
  }

  /**
   * Log user activation/deactivation
   */
  async logUserStatusUpdate(
    adminId: string,
    adminEmail: string,
    userId: string,
    userEmail: string,
    newStatus: 'active' | 'inactive',
    userName?: string
  ): Promise<void> {
    await this.logAction({
      adminId,
      adminEmail,
      action: newStatus === 'active' ? 'activated' : 'deactivated',
      targetType: 'user',
      targetId: userId,
      targetName: userName || userEmail,
      details: `User ${userName || userEmail} ${newStatus === 'active' ? 'activated' : 'deactivated'}`,
      metadata: {
        userEmail,
        userName,
        newStatus,
        updateType: 'status'
      }
    });
  }

  /**
   * Log event deletion
   */
  async logEventDeletion(
    adminId: string,
    adminEmail: string,
    eventId: string,
    eventTitle: string,
    hostEmail?: string
  ): Promise<void> {
    await this.logAction({
      adminId,
      adminEmail,
      action: 'deleted',
      targetType: 'event',
      targetId: eventId,
      targetName: eventTitle,
      details: `Event "${eventTitle}" deleted${hostEmail ? ` (hosted by ${hostEmail})` : ''}`,
      metadata: {
        eventTitle,
        hostEmail,
        actionType: 'deletion'
      }
    });
  }

  /**
   * Log host request deletion
   */
  async logHostRequestDeletion(
    adminId: string,
    adminEmail: string,
    requestId: string,
    userEmail: string,
    userName?: string
  ): Promise<void> {
    await this.logAction({
      adminId,
      adminEmail,
      action: 'deleted',
      targetType: 'hostRequest',
      targetId: requestId,
      targetName: userName || userEmail,
      details: `Host request deleted for ${userName || userEmail}`,
      metadata: {
        userEmail,
        userName,
        actionType: 'deletion'
      }
    });
  }

  /**
   * Log system events (like user registration, event creation, etc.)
   */
  async logSystemEvent(
    action: string,
    details: string,
    targetType: 'user' | 'event' | 'hostRequest' | 'system' = 'system',
    targetId?: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    await this.logAction({
      adminId: 'system',
      adminEmail: 'system@tickzy.com',
      action,
      targetType,
      targetId: targetId || 'system',
      details,
      metadata
    });
  }
}

// Export singleton instance
export const adminLogger = AdminLogger.getInstance();
export default adminLogger;
