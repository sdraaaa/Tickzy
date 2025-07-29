/**
 * ExploreEvents Component
 * 
 * Horizontal scrollable event carousel
 * Displays event cards in a BookMyShow-style layout
 */

import React from 'react';
import EventCard from '../ui/EventCard';
import { Event } from '../../types';

interface ExploreEventsProps {
  title: string;
  events?: Event[];
}

const ExploreEvents: React.FC<ExploreEventsProps> = ({ title, events }) => {
  // Sample events data
  const sampleEvents: Event[] = events || [
    {
      id: '1',
      title: 'Tech Conference 2024',
      description: 'Join industry leaders for cutting-edge technology discussions',
      date: '2024-12-15',
      time: '09:00',
      location: 'Convention Center',
      price: 99,
      tags: ['Technology', 'Conference', 'Networking'],
      category: 'Technology',
      image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400',
      hostId: 'sample-host-1',
      hostName: 'Tech Events Inc',
      status: 'published',
      totalTickets: 500,
      ticketsSold: 250,
      seatsLeft: 250,
      capacity: 500,
      revenue: 24750,
      createdAt: new Date() as any,
      updatedAt: new Date() as any
    },
    {
      id: '2',
      title: 'Summer Music Festival',
      description: 'Experience amazing live music from top artists',
      date: '2024-12-20',
      time: '18:00',
      location: 'City Park',
      price: 75,
      tags: ['Music', 'Festival', 'Outdoor'],
      category: 'Music',
      image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400',
      hostId: 'sample-host-2',
      hostName: 'Music Events Co',
      status: 'published',
      totalTickets: 1000,
      ticketsSold: 800,
      seatsLeft: 200,
      capacity: 1000,
      revenue: 60000,
      createdAt: new Date() as any,
      updatedAt: new Date() as any
    },
    {
      id: '3',
      title: 'Art & Design Workshop',
      description: 'Learn creative techniques from professional artists',
      date: '2024-12-25',
      time: '14:00',
      location: 'Art Studio',
      price: 45,
      tags: ['Art', 'Workshop', 'Creative'],
      category: 'Art',
      image: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400',
      hostId: 'sample-host-3',
      hostName: 'Creative Arts Studio',
      status: 'published',
      totalTickets: 30,
      ticketsSold: 15,
      seatsLeft: 15,
      capacity: 30,
      revenue: 675,
      createdAt: new Date() as any,
      updatedAt: new Date() as any
    },
    {
      id: '4',
      title: 'Food Festival',
      description: 'Taste delicious food from local restaurants',
      date: '2024-12-30',
      time: '12:00',
      location: 'Downtown Square',
      price: 25,
      tags: ['Food', 'Festival', 'Local'],
      category: 'Food',
      image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400',
      hostId: 'sample-host-4',
      hostName: 'Local Food Association',
      status: 'published',
      totalTickets: 2000,
      ticketsSold: 1500,
      seatsLeft: 500,
      capacity: 2000,
      revenue: 37500,
      createdAt: new Date() as any,
      updatedAt: new Date() as any
    },
    {
      id: '5',
      title: 'Comedy Night',
      description: 'Laugh out loud with top comedians',
      date: '2025-01-05',
      time: '20:00',
      location: 'Comedy Club',
      price: 35,
      tags: ['Comedy', 'Entertainment', 'Live'],
      category: 'Entertainment',
      image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400',
      hostId: 'sample-host-5',
      hostName: 'Comedy Club Productions',
      status: 'published',
      totalTickets: 150,
      ticketsSold: 120,
      seatsLeft: 30,
      capacity: 150,
      revenue: 4200,
      createdAt: new Date() as any,
      updatedAt: new Date() as any
    },
    {
      id: '6',
      title: 'Startup Pitch Event',
      description: 'Watch innovative startups pitch their ideas',
      date: '2025-01-10',
      time: '18:30',
      location: 'Business Center',
      price: 50,
      tags: ['Business', 'Startup', 'Networking'],
      category: 'Business',
      image: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=400',
      hostId: 'sample-host-6',
      hostName: 'Startup Hub',
      status: 'published',
      totalTickets: 200,
      ticketsSold: 150,
      seatsLeft: 50,
      capacity: 200,
      revenue: 7500,
      createdAt: new Date() as any,
      updatedAt: new Date() as any
    }
  ];

  return (
    <section className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-white">
            {title}
          </h2>
          <button className="text-purple-400 hover:text-purple-300 font-medium transition-colors duration-200">
            View All →
          </button>
        </div>

        {/* Horizontal Scrollable Container */}
        <div className="relative">
          <div className="flex overflow-x-auto gap-6 scrollbar-hide pb-4">
            {sampleEvents.map((event) => (
              <div key={event.id} className="flex-none w-80">
                <EventCard event={event} />
              </div>
            ))}
          </div>
          
          {/* Scroll Indicators */}
          <div className="absolute top-1/2 -left-4 transform -translate-y-1/2 hidden lg:block">
            <button className="w-12 h-12 bg-neutral-800 hover:bg-neutral-700 rounded-full flex items-center justify-center text-white shadow-lg transition-colors duration-200">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          </div>
          <div className="absolute top-1/2 -right-4 transform -translate-y-1/2 hidden lg:block">
            <button className="w-12 h-12 bg-neutral-800 hover:bg-neutral-700 rounded-full flex items-center justify-center text-white shadow-lg transition-colors duration-200">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile scroll hint */}
        <div className="md:hidden text-center mt-4">
          <p className="text-gray-400 text-sm">← Swipe to see more events →</p>
        </div>
      </div>

      {/* Custom CSS for hiding scrollbar is handled via inline styles above */}
    </section>
  );
};

export default ExploreEvents;
