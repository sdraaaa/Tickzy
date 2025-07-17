import { collection, addDoc, serverTimestamp, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/firebase';

const sampleEvents = [
  {
    title: 'Summer Music Festival 2024',
    image: 'https://images.pexels.com/photos/1190298/pexels-photo-1190298.jpeg?auto=compress&cs=tinysrgb&w=1200',
    date: 'August 15, 2024',
    time: '6:00 PM',
    location: 'Central Park, New York, NY',
    price: 89,
    category: 'Music',
    attendees: 1250,
    rating: 4.8,
    description: 'Join us for an unforgettable evening of music at the Summer Music Festival 2024. Featuring top artists from around the world, this outdoor concert promises to be the highlight of the summer.',
    highlights: ['World-class performers', 'Food trucks and vendors', 'VIP packages available', 'Professional sound system', 'Secure parking available'],
    ticketTypes: [
      { id: 1, name: 'General Admission', price: 89, description: 'Access to main event area' },
      { id: 2, name: 'VIP Package', price: 199, description: 'Premium seating + backstage access' },
      { id: 3, name: 'Early Bird', price: 69, description: 'Limited time offer', soldOut: true },
    ],
    organizer: { name: 'EventPro Productions', rating: 4.9, events: 127, avatar: 'https://images.pexels.com/photos/3184317/pexels-photo-3184317.jpeg?auto=compress&cs=tinysrgb&w=400' },
    createdBy: 'sample-host-1'
  },
  {
    title: 'Tech Conference 2024',
    image: 'https://images.pexels.com/photos/2774556/pexels-photo-2774556.jpeg?auto=compress&cs=tinysrgb&w=1200',
    date: 'September 20, 2024',
    time: '9:00 AM',
    location: 'Convention Center, San Francisco, CA',
    price: 299,
    category: 'Business',
    attendees: 500,
    rating: 4.6,
    description: 'The premier technology conference bringing together industry leaders, innovators, and developers. Learn about the latest trends in AI, blockchain, and software development.',
    highlights: ['Keynote speakers', 'Networking sessions', 'Hands-on workshops', 'Startup showcase', 'Free lunch included'],
    ticketTypes: [
      { id: 1, name: 'Standard Pass', price: 299, description: 'Access to all sessions and networking' },
      { id: 2, name: 'Premium Pass', price: 499, description: 'Standard + VIP lounge + exclusive dinners' },
      { id: 3, name: 'Student Discount', price: 149, description: 'Valid student ID required' },
    ],
    organizer: { name: 'TechEvents Inc', rating: 4.7, events: 89, avatar: 'https://images.pexels.com/photos/3184317/pexels-photo-3184317.jpeg?auto=compress&cs=tinysrgb&w=400' },
    createdBy: 'sample-host-2'
  },
  {
    title: 'Food & Wine Tasting',
    image: 'https://images.pexels.com/photos/1581384/pexels-photo-1581384.jpeg?auto=compress&cs=tinysrgb&w=1200',
    date: 'August 25, 2024',
    time: '7:00 PM',
    location: 'Downtown Restaurant, Chicago, IL',
    price: 125,
    category: 'Lifestyle',
    attendees: 75,
    rating: 4.9,
    description: 'An exquisite evening of fine dining featuring local wines paired with gourmet dishes prepared by award-winning chefs.',
    highlights: ['5-course tasting menu', 'Wine pairings', 'Meet the chef', 'Live jazz music', 'Recipe cards included'],
    ticketTypes: [
      { id: 1, name: 'Standard Tasting', price: 125, description: '5 courses with wine pairings' },
      { id: 2, name: 'Premium Experience', price: 199, description: 'Standard + chef interaction + premium wines' },
    ],
    organizer: { name: 'Culinary Experiences', rating: 4.8, events: 45, avatar: 'https://images.pexels.com/photos/3184317/pexels-photo-3184317.jpeg?auto=compress&cs=tinysrgb&w=400' },
    createdBy: 'sample-host-3'
  },
  {
    title: 'Art Gallery Opening',
    image: 'https://images.pexels.com/photos/1194420/pexels-photo-1194420.jpeg?auto=compress&cs=tinysrgb&w=1200',
    date: 'September 5, 2024',
    time: '6:30 PM',
    location: 'Modern Art Museum, Los Angeles, CA',
    price: 45,
    category: 'Arts',
    attendees: 200,
    rating: 4.4,
    description: 'Discover contemporary art from emerging and established artists in this exclusive gallery opening featuring interactive installations and live performances.',
    highlights: ['Artist meet & greet', 'Live art demonstrations', 'Complimentary refreshments', 'Exclusive previews', 'Art purchase opportunities'],
    ticketTypes: [
      { id: 1, name: 'General Admission', price: 45, description: 'Access to all exhibits and refreshments' },
      { id: 2, name: 'Collector Pass', price: 89, description: 'General + private viewing + artist catalog' },
    ],
    organizer: { name: 'Modern Art Collective', rating: 4.5, events: 67, avatar: 'https://images.pexels.com/photos/3184317/pexels-photo-3184317.jpeg?auto=compress&cs=tinysrgb&w=400' },
    createdBy: 'sample-host-4'
  },
  {
    title: 'Gaming Championship',
    image: 'https://images.pexels.com/photos/3165335/pexels-photo-3165335.jpeg?auto=compress&cs=tinysrgb&w=1200',
    date: 'October 1, 2024',
    time: '2:00 PM',
    location: 'Gaming Arena, Austin, TX',
    price: 65,
    category: 'Gaming',
    attendees: 800,
    rating: 4.7,
    description: 'The ultimate gaming competition featuring top esports teams competing in multiple game titles. Experience the thrill of professional gaming.',
    highlights: ['Live tournament matches', 'Meet pro gamers', 'Gaming demos', 'Merchandise booths', 'Food court'],
    ticketTypes: [
      { id: 1, name: 'General Seating', price: 65, description: 'Access to main arena and food court' },
      { id: 2, name: 'VIP Gaming Pass', price: 129, description: 'Premium seating + meet & greet + exclusive merch' },
      { id: 3, name: 'Competitor Pass', price: 199, description: 'Participate in amateur tournaments' },
    ],
    organizer: { name: 'Esports Arena', rating: 4.6, events: 156, avatar: 'https://images.pexels.com/photos/3184317/pexels-photo-3184317.jpeg?auto=compress&cs=tinysrgb&w=400' },
    createdBy: 'sample-host-5'
  },
  {
    title: 'Marathon & Fun Run',
    image: 'https://images.pexels.com/photos/2402777/pexels-photo-2402777.jpeg?auto=compress&cs=tinysrgb&w=800',
    date: 'September 15, 2024',
    time: '7:00 AM',
    location: 'City Park, Miami, FL',
    price: 35,
    category: 'Sports',
    attendees: 2000,
    rating: 4.5,
    description: 'Join thousands of runners in this exciting marathon and fun run event. Multiple distance options available for all fitness levels.',
    highlights: ['Multiple distance options', 'Professional timing', 'Finisher medals', 'Post-race refreshments', 'Family-friendly activities'],
    ticketTypes: [
      { id: 1, name: 'Fun Run (5K)', price: 35, description: 'Perfect for beginners and families' },
      { id: 2, name: 'Half Marathon', price: 55, description: '13.1 miles for experienced runners' },
      { id: 3, name: 'Full Marathon', price: 75, description: '26.2 miles for serious athletes' },
    ],
    organizer: { name: 'Miami Running Club', rating: 4.3, events: 78, avatar: 'https://images.pexels.com/photos/3184317/pexels-photo-3184317.jpeg?auto=compress&cs=tinysrgb&w=400' },
    createdBy: 'sample-host-6'
  }
];

export const seedEvents = async () => {
  try {
    console.log('Starting to seed events...');
    const eventsCollection = collection(db, 'events');
    
    for (const eventData of sampleEvents) {
      await addDoc(eventsCollection, {
        ...eventData,
        createdAt: serverTimestamp()
      });
      console.log(`Added event: ${eventData.title}`);
    }
    
    console.log('Successfully seeded all events!');
    return true;
  } catch (error) {
    console.error('Error seeding events:', error);
    return false;
  }
};

// Function to clear all existing events
export const clearEvents = async () => {
  try {
    console.log('Clearing existing events...');
    const eventsCollection = collection(db, 'events');
    const snapshot = await getDocs(eventsCollection);

    const deletePromises = snapshot.docs.map(eventDoc =>
      deleteDoc(doc(db, 'events', eventDoc.id))
    );

    await Promise.all(deletePromises);
    console.log(`Cleared ${snapshot.docs.length} existing events`);
    return true;
  } catch (error) {
    console.error('Error clearing events:', error);
    return false;
  }
};

// Function to clear and reseed events
export const clearAndSeedEvents = async () => {
  try {
    await clearEvents();
    await seedEvents();
    console.log('Successfully cleared and reseeded events!');
    return true;
  } catch (error) {
    console.error('Error clearing and seeding events:', error);
    return false;
  }
};

// Functions to call from browser console for testing
(window as any).seedEvents = seedEvents;
(window as any).clearEvents = clearEvents;
(window as any).clearAndSeedEvents = clearAndSeedEvents;
