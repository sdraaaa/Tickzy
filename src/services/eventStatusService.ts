/**
 * Event Status Service
 * 
 * Handles automatic status updates for events based on their date/time
 * Moves past events to 'completed' status and handles cleanup
 */

import { collection, getDocs, doc, updateDoc, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { isEventPast } from '../utils/dateUtils';

/**
 * Update event statuses based on current date/time
 * This should be called periodically to keep event statuses current
 */
export const updateEventStatuses = async (): Promise<void> => {
  try {
    console.log('🔄 Starting event status update...');
    
    // Get all active events (not already marked as completed/cancelled)
    const eventsQuery = query(
      collection(db, 'events'),
      where('status', 'in', ['published', 'approved', 'active', 'pending'])
    );
    
    const eventsSnapshot = await getDocs(eventsQuery);
    const updatePromises: Promise<void>[] = [];
    let updatedCount = 0;
    
    eventsSnapshot.forEach((eventDoc) => {
      const eventData = eventDoc.data();
      const eventId = eventDoc.id;
      
      // Check if event has passed
      if (eventData.date && eventData.time && isEventPast(eventData.date, eventData.time)) {
        // Update status to completed
        const updatePromise = updateDoc(doc(db, 'events', eventId), {
          status: 'completed',
          updatedAt: new Date()
        }).then(() => {
          console.log(`✅ Updated event ${eventId} (${eventData.title}) to completed status`);
          updatedCount++;
        }).catch((error) => {
          console.error(`❌ Failed to update event ${eventId}:`, error);
        });
        
        updatePromises.push(updatePromise);
      }
    });
    
    // Wait for all updates to complete
    await Promise.all(updatePromises);
    
    console.log(`🎯 Event status update complete: ${updatedCount} events updated`);
    
  } catch (error) {
    console.error('❌ Error updating event statuses:', error);
  }
};

/**
 * Get events that should be hidden from booking (past events)
 * @returns Array of event IDs that are past their date/time
 */
export const getPastEventIds = async (): Promise<string[]> => {
  try {
    const eventsSnapshot = await getDocs(collection(db, 'events'));
    const pastEventIds: string[] = [];
    
    eventsSnapshot.forEach((eventDoc) => {
      const eventData = eventDoc.data();
      
      if (eventData.date && eventData.time && isEventPast(eventData.date, eventData.time)) {
        pastEventIds.push(eventDoc.id);
      }
    });
    
    return pastEventIds;
  } catch (error) {
    console.error('Error getting past event IDs:', error);
    return [];
  }
};

/**
 * Check if an event should be bookable
 * @param eventDate - Event date string
 * @param eventTime - Event time string
 * @param eventStatus - Current event status
 * @returns boolean indicating if event can be booked
 */
export const isEventBookable = (eventDate: string, eventTime: string, eventStatus: string): boolean => {
  // Event must not be past
  if (isEventPast(eventDate, eventTime)) {
    return false;
  }
  
  // Event must have approved status
  const bookableStatuses = ['published', 'approved', 'active'];
  if (!bookableStatuses.includes(eventStatus)) {
    return false;
  }
  
  return true;
};

/**
 * Initialize automatic event status updates
 * Call this when the app starts to set up periodic updates
 */
export const initializeEventStatusUpdates = (): void => {
  // Update statuses immediately
  updateEventStatuses();
  
  // Set up periodic updates every 5 minutes
  setInterval(() => {
    updateEventStatuses();
  }, 5 * 60 * 1000); // 5 minutes
  
  console.log('🚀 Event status auto-update initialized (5-minute intervals)');
};
