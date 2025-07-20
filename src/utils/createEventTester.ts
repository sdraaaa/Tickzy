/**
 * Create Event Feature Tester
 * 
 * This utility helps test the Create Event functionality with different user roles
 * and validates the complete workflow.
 */

import { createEvent } from '@/services/eventsService';
import { canUserCreateEvents } from '@/services/hostService';
import { auth } from '@/firebase';

interface TestEventData {
  title: string;
  description: string;
  category: string;
  date: string;
  time: string;
  location: string;
  price: number;
  attendees: number;
  image: string;
  highlights: string[];
  ticketTypes: Array<{
    id: number;
    name: string;
    price: number;
    description: string;
  }>;
  organizer: {
    name: string;
    rating: number;
    events: number;
    avatar: string;
  };
  createdBy: string;
  rating: number;
  status: 'pending';
}

/**
 * Generate test event data
 */
export const generateTestEventData = (createdBy: string): TestEventData => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  return {
    title: `Test Event ${Date.now()}`,
    description: 'This is a comprehensive test event created to validate the Create Event functionality. It includes all required fields and proper validation.',
    category: 'Music',
    date: tomorrow.toISOString().split('T')[0],
    time: '19:00',
    location: '123 Test Street, Test City, TC 12345',
    price: 25.99,
    attendees: 100,
    image: 'https://images.pexels.com/photos/1190298/pexels-photo-1190298.jpeg?auto=compress&cs=tinysrgb&w=800',
    highlights: [
      'Live music performance',
      'Food and beverages included',
      'Professional photography',
      'Networking opportunities'
    ],
    ticketTypes: [
      {
        id: 1,
        name: 'General Admission',
        price: 25.99,
        description: 'Standard event access with all amenities'
      },
      {
        id: 2,
        name: 'VIP Access',
        price: 49.99,
        description: 'Premium access with exclusive perks'
      }
    ],
    organizer: {
      name: 'Test Host',
      rating: 4.5,
      events: 1,
      avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=200'
    },
    createdBy,
    rating: 4.5,
    status: 'pending' as const
  };
};

/**
 * Test event creation permissions for current user
 */
export const testEventCreationPermissions = async (): Promise<{
  canCreate: boolean;
  userRole: string;
  hostStatus: string;
  message: string;
}> => {
  const user = auth.currentUser;
  
  if (!user) {
    return {
      canCreate: false,
      userRole: 'none',
      hostStatus: 'none',
      message: 'No user is currently authenticated'
    };
  }

  try {
    const canCreate = await canUserCreateEvents(user.uid);
    
    // Get user data to determine role and host status
    const { doc, getDoc } = await import('firebase/firestore');
    const { db } = await import('@/firebase');
    
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    const userData = userDoc.exists() ? userDoc.data() : {};
    
    const userRole = userData.role || 'user';
    const hostStatus = userData.hostStatus || 'none';
    
    let message = '';
    if (canCreate) {
      message = `✅ User can create events (Role: ${userRole}, Host Status: ${hostStatus})`;
    } else {
      if (userRole === 'user') {
        switch (hostStatus) {
          case 'none':
            message = '❌ User needs to apply to become a host';
            break;
          case 'pending':
            message = '⏳ Host application is pending approval';
            break;
          case 'rejected':
            message = '❌ Host application was rejected';
            break;
          default:
            message = '❌ User cannot create events';
        }
      } else {
        message = `❌ User cannot create events (Role: ${userRole}, Host Status: ${hostStatus})`;
      }
    }
    
    return {
      canCreate,
      userRole,
      hostStatus,
      message
    };
  } catch (error) {
    console.error('Error testing permissions:', error);
    return {
      canCreate: false,
      userRole: 'unknown',
      hostStatus: 'unknown',
      message: `❌ Error checking permissions: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
};

/**
 * Test event creation workflow
 */
export const testEventCreation = async (): Promise<{
  success: boolean;
  eventId?: string;
  message: string;
  error?: string;
}> => {
  const user = auth.currentUser;
  
  if (!user) {
    return {
      success: false,
      message: '❌ No user authenticated'
    };
  }

  try {
    // First check permissions
    const permissionTest = await testEventCreationPermissions();
    
    if (!permissionTest.canCreate) {
      return {
        success: false,
        message: `❌ Permission denied: ${permissionTest.message}`
      };
    }

    // Generate test event data
    const eventData = generateTestEventData(user.uid);
    
    console.log('🧪 Testing event creation with data:', eventData);
    
    // Attempt to create event
    const eventId = await createEvent(eventData);
    
    if (eventId) {
      return {
        success: true,
        eventId,
        message: `✅ Event created successfully! Event ID: ${eventId}`
      };
    } else {
      return {
        success: false,
        message: '❌ Event creation failed - no event ID returned'
      };
    }
  } catch (error: any) {
    console.error('Event creation test failed:', error);
    return {
      success: false,
      message: '❌ Event creation failed',
      error: error.message || 'Unknown error'
    };
  }
};

/**
 * Run comprehensive Create Event feature test
 */
export const runCreateEventTests = async (): Promise<void> => {
  console.log('🧪 Starting Create Event Feature Tests...\n');
  
  // Test 1: Check user authentication
  const user = auth.currentUser;
  console.log('1. Authentication Test:');
  if (user) {
    console.log(`   ✅ User authenticated: ${user.email}`);
  } else {
    console.log('   ❌ No user authenticated - please log in first');
    return;
  }
  
  // Test 2: Check permissions
  console.log('\n2. Permission Test:');
  const permissionTest = await testEventCreationPermissions();
  console.log(`   ${permissionTest.message}`);
  
  if (!permissionTest.canCreate) {
    console.log('\n❌ Cannot proceed with event creation tests - insufficient permissions');
    return;
  }
  
  // Test 3: Test event creation
  console.log('\n3. Event Creation Test:');
  const creationTest = await testEventCreation();
  console.log(`   ${creationTest.message}`);
  
  if (creationTest.error) {
    console.log(`   Error details: ${creationTest.error}`);
  }
  
  // Test 4: Validate event appears in host dashboard (if successful)
  if (creationTest.success && creationTest.eventId) {
    console.log('\n4. Event Retrieval Test:');
    try {
      const { getEventsByHost } = await import('@/services/eventsService');
      const hostEvents = await getEventsByHost(user.uid);
      const createdEvent = hostEvents.find(e => e.id === creationTest.eventId);
      
      if (createdEvent) {
        console.log('   ✅ Event found in host events list');
        console.log(`   Event status: ${createdEvent.status || 'unknown'}`);
      } else {
        console.log('   ⚠️ Event not found in host events list (may take a moment to sync)');
      }
    } catch (error) {
      console.log(`   ❌ Error retrieving host events: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  console.log('\n🏁 Create Event Feature Tests Complete!');
};

// Make functions available in browser console for debugging
if (typeof window !== 'undefined') {
  (window as any).testEventCreationPermissions = testEventCreationPermissions;
  (window as any).testEventCreation = testEventCreation;
  (window as any).runCreateEventTests = runCreateEventTests;
  (window as any).generateTestEventData = generateTestEventData;
}
