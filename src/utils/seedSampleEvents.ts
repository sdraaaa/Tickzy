/**
 * Seed Sample Events Utility
 * 
 * Creates sample approved events for testing the application
 */

import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/firebase';

const EVENTS_COLLECTION = 'events';

interface SampleEvent {
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
  status: 'approved';
  isPopular?: boolean;
}

/**
 * Sample events data
 */
const getSampleEvents = (): SampleEvent[] => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);
  
  const nextMonth = new Date();
  nextMonth.setDate(nextMonth.getDate() + 30);

  return [
    {
      title: 'Tech Conference 2024',
      description: 'Join us for the biggest tech conference of the year featuring industry leaders, innovative workshops, and networking opportunities.',
      category: 'Technology',
      date: tomorrow.toISOString().split('T')[0],
      time: '09:00',
      location: 'MJCET Convention Center, Hyderabad',
      price: 99.99,
      attendees: 500,
      image: 'https://images.pexels.com/photos/2774556/pexels-photo-2774556.jpeg?auto=compress&cs=tinysrgb&w=800',
      highlights: [
        'Keynote speakers from top tech companies',
        'Hands-on workshops',
        'Networking lunch included',
        'Certificate of participation'
      ],
      ticketTypes: [
        {
          id: 1,
          name: 'Early Bird',
          price: 79.99,
          description: 'Limited time offer with full access'
        },
        {
          id: 2,
          name: 'Regular',
          price: 99.99,
          description: 'Standard conference access'
        },
        {
          id: 3,
          name: 'VIP',
          price: 149.99,
          description: 'Premium access with exclusive perks'
        }
      ],
      organizer: {
        name: 'Tech Events Hyderabad',
        rating: 4.8,
        events: 15,
        avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=200'
      },
      createdBy: 'sample-host-1',
      rating: 4.8,
      status: 'approved' as const,
      isPopular: true
    },
    {
      title: 'Live Music Night',
      description: 'Experience an unforgettable evening of live music featuring local and international artists in an intimate venue.',
      category: 'Music',
      date: nextWeek.toISOString().split('T')[0],
      time: '19:30',
      location: 'Shilparamam Cultural Center, Hyderabad',
      price: 45.00,
      attendees: 200,
      image: 'https://images.pexels.com/photos/1190298/pexels-photo-1190298.jpeg?auto=compress&cs=tinysrgb&w=800',
      highlights: [
        'Live performances by 5 artists',
        'Food and beverages available',
        'Professional sound system',
        'Meet & greet with artists'
      ],
      ticketTypes: [
        {
          id: 1,
          name: 'General Admission',
          price: 45.00,
          description: 'Standing room with full access'
        },
        {
          id: 2,
          name: 'Premium Seating',
          price: 75.00,
          description: 'Reserved seating with better view'
        }
      ],
      organizer: {
        name: 'Hyderabad Music Society',
        rating: 4.6,
        events: 8,
        avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=200'
      },
      createdBy: 'sample-host-2',
      rating: 4.6,
      status: 'approved' as const
    },
    {
      title: 'Food Festival 2024',
      description: 'Discover the flavors of Hyderabad and beyond at our annual food festival featuring over 50 food stalls and cooking demonstrations.',
      category: 'Food',
      date: nextMonth.toISOString().split('T')[0],
      time: '11:00',
      location: 'Hitec City Convention Center, Hyderabad',
      price: 25.00,
      attendees: 1000,
      image: 'https://images.pexels.com/photos/1267320/pexels-photo-1267320.jpeg?auto=compress&cs=tinysrgb&w=800',
      highlights: [
        '50+ food stalls',
        'Live cooking demonstrations',
        'Cultural performances',
        'Family-friendly activities'
      ],
      ticketTypes: [
        {
          id: 1,
          name: 'Day Pass',
          price: 25.00,
          description: 'Full day access to all activities'
        },
        {
          id: 2,
          name: 'Family Pack',
          price: 80.00,
          description: 'Entry for 4 people with bonus vouchers'
        }
      ],
      organizer: {
        name: 'Hyderabad Food Council',
        rating: 4.7,
        events: 12,
        avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=200'
      },
      createdBy: 'sample-host-3',
      rating: 4.7,
      status: 'approved' as const,
      isPopular: true
    },
    {
      title: 'Art Exhibition: Modern Perspectives',
      description: 'Explore contemporary art from emerging and established artists in this curated exhibition showcasing diverse artistic expressions.',
      category: 'Art',
      date: tomorrow.toISOString().split('T')[0],
      time: '10:00',
      location: 'State Gallery of Art, Hyderabad',
      price: 15.00,
      attendees: 150,
      image: 'https://images.pexels.com/photos/1839919/pexels-photo-1839919.jpeg?auto=compress&cs=tinysrgb&w=800',
      highlights: [
        'Works by 25+ artists',
        'Guided tours available',
        'Artist meet & greet',
        'Art workshop sessions'
      ],
      ticketTypes: [
        {
          id: 1,
          name: 'Standard Entry',
          price: 15.00,
          description: 'Access to all exhibition areas'
        },
        {
          id: 2,
          name: 'Guided Tour',
          price: 25.00,
          description: 'Entry plus professional guided tour'
        }
      ],
      organizer: {
        name: 'Hyderabad Art Collective',
        rating: 4.5,
        events: 6,
        avatar: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=200'
      },
      createdBy: 'sample-host-4',
      rating: 4.5,
      status: 'approved' as const
    }
  ];
};

/**
 * Create sample events in Firestore
 */
export const createSampleEvents = async (): Promise<void> => {
  try {
    console.log('🌱 Creating sample events...');
    
    const sampleEvents = getSampleEvents();
    const promises = sampleEvents.map(async (eventData) => {
      const eventToCreate = {
        ...eventData,
        createdAt: serverTimestamp()
      };
      
      const docRef = await addDoc(collection(db, EVENTS_COLLECTION), eventToCreate);
      console.log(`✅ Created event: ${eventData.title} (ID: ${docRef.id})`);
      return docRef.id;
    });
    
    await Promise.all(promises);
    console.log('🎉 All sample events created successfully!');
    
  } catch (error) {
    console.error('❌ Error creating sample events:', error);
    throw error;
  }
};

/**
 * Check if sample events already exist
 */
export const checkSampleEventsExist = async (): Promise<boolean> => {
  try {
    // This is a simple check - in a real app you might want to check for specific event titles
    // For now, we'll just return false to allow re-seeding
    return false;
  } catch (error) {
    console.error('Error checking for existing events:', error);
    return false;
  }
};

// Make functions available in browser console for debugging
if (typeof window !== 'undefined') {
  (window as any).createSampleEvents = createSampleEvents;
  (window as any).checkSampleEventsExist = checkSampleEventsExist;
}
