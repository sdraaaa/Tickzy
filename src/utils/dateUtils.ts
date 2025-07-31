/**
 * Date and Time Utility Functions
 * 
 * Centralized utilities for handling event date/time comparisons
 * and determining if events are past, current, or upcoming
 */

/**
 * Check if an event has completely passed (both date and time)
 * @param eventDate - Event date string (YYYY-MM-DD format)
 * @param eventTime - Event time string (HH:MM format)
 * @returns boolean - true if event has passed, false if still upcoming/current
 */
export const isEventPast = (eventDate: string, eventTime: string): boolean => {
  try {
    // Create a complete datetime object for the event
    const eventDateTime = new Date(`${eventDate}T${eventTime}:00`);
    const now = new Date();
    
    // Event is past if the complete datetime has passed
    return eventDateTime < now;
  } catch (error) {
    console.error('Error parsing event date/time:', { eventDate, eventTime, error });
    // If there's an error parsing, assume event is not past (safer default)
    return false;
  }
};

/**
 * Check if an event is happening today
 * @param eventDate - Event date string (YYYY-MM-DD format)
 * @returns boolean - true if event is today
 */
export const isEventToday = (eventDate: string): boolean => {
  try {
    const eventDateObj = new Date(eventDate);
    const today = new Date();
    
    return eventDateObj.toDateString() === today.toDateString();
  } catch (error) {
    console.error('Error parsing event date:', { eventDate, error });
    return false;
  }
};

/**
 * Check if an event is upcoming (future date/time)
 * @param eventDate - Event date string (YYYY-MM-DD format)
 * @param eventTime - Event time string (HH:MM format)
 * @returns boolean - true if event is in the future
 */
export const isEventUpcoming = (eventDate: string, eventTime: string): boolean => {
  return !isEventPast(eventDate, eventTime);
};

/**
 * Get time remaining until event starts
 * @param eventDate - Event date string (YYYY-MM-DD format)
 * @param eventTime - Event time string (HH:MM format)
 * @returns object with days, hours, minutes remaining or null if past
 */
export const getTimeUntilEvent = (eventDate: string, eventTime: string) => {
  try {
    const eventDateTime = new Date(`${eventDate}T${eventTime}:00`);
    const now = new Date();
    const timeDiff = eventDateTime.getTime() - now.getTime();
    
    if (timeDiff <= 0) {
      return null; // Event has passed
    }
    
    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    
    return { days, hours, minutes };
  } catch (error) {
    console.error('Error calculating time until event:', { eventDate, eventTime, error });
    return null;
  }
};

/**
 * Format event date and time for display
 * @param eventDate - Event date string (YYYY-MM-DD format)
 * @param eventTime - Event time string (HH:MM format)
 * @returns formatted date/time string
 */
export const formatEventDateTime = (eventDate: string, eventTime: string): string => {
  try {
    const eventDateTime = new Date(`${eventDate}T${eventTime}:00`);
    return eventDateTime.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  } catch (error) {
    console.error('Error formatting event date/time:', { eventDate, eventTime, error });
    return `${eventDate} at ${eventTime}`;
  }
};
