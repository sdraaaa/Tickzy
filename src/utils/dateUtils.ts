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
    // Handle different date formats
    let eventDateTime: Date;

    // If eventDate is already an ISO string with time, use it directly
    if (eventDate.includes('T')) {
      eventDateTime = new Date(eventDate);
    } else {
      // Otherwise, combine date and time
      // Ensure we have proper format for date (YYYY-MM-DD)
      let formattedDate = eventDate;
      if (!eventDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
        // Try to parse and reformat if it's not in YYYY-MM-DD format
        const parsedDate = new Date(eventDate);
        if (!isNaN(parsedDate.getTime())) {
          formattedDate = parsedDate.toISOString().split('T')[0];
        }
      }

      // Ensure we have proper format for time (HH:MM)
      let formattedTime = eventTime || '00:00';
      if (!formattedTime.match(/^\d{2}:\d{2}$/)) {
        formattedTime = '00:00';
      }

      eventDateTime = new Date(`${formattedDate}T${formattedTime}:00`);
    }

    // Check if the date is valid
    if (isNaN(eventDateTime.getTime())) {
      console.error('❌ Invalid date created:', { eventDate, eventTime, eventDateTime });
      return false;
    }

    const now = new Date();
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

/**
 * Test function to verify date logic is working correctly
 * Call this from browser console: window.testDateLogic()
 */
export const testDateLogic = () => {
  console.log('🧪 Testing date logic...');

  // Test future event (should not be past)
  const futureDate = '2025-07-31';
  const futureTime = '20:00';
  const isFuturePast = isEventPast(futureDate, futureTime);
  console.log(`Future event (${futureDate} ${futureTime}):`, isFuturePast ? '❌ INCORRECTLY marked as past' : '✅ Correctly marked as future');

  // Test past event (should be past)
  const pastDate = '2023-01-01';
  const pastTime = '12:00';
  const isPastPast = isEventPast(pastDate, pastTime);
  console.log(`Past event (${pastDate} ${pastTime}):`, isPastPast ? '✅ Correctly marked as past' : '❌ INCORRECTLY marked as future');

  // Test today's event in the future (should not be past)
  const today = new Date().toISOString().split('T')[0];
  const futureTimeToday = '23:59';
  const isTodayFuturePast = isEventPast(today, futureTimeToday);
  console.log(`Today's future event (${today} ${futureTimeToday}):`, isTodayFuturePast ? '❌ INCORRECTLY marked as past' : '✅ Correctly marked as future');

  return {
    futureEventCorrect: !isFuturePast,
    pastEventCorrect: isPastPast,
    todayFutureEventCorrect: !isTodayFuturePast
  };
};

// Export for console testing
if (typeof window !== 'undefined') {
  (window as any).testDateLogic = testDateLogic;
}
