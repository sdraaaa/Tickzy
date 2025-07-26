/**
 * Dashboard Component
 *
 * Unified dashboard route with role-based views and tab system:
 * - Users/Hosts: HeroSection + Explore Events + My Dashboard tab
 * - Admins: Admin tools only (no HeroSection or Explore Events)
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import UnifiedNavbar from './ui/UnifiedNavbar';
import HeroSection from './ui/HeroSection';
import ExploreEvents from './ui/ExploreEvents';
import UserBookings from './ui/UserBookings';
import HostEvents from './ui/HostEvents';
import AdminPanel from './admin/AdminPanel';

// Dashboard View Types
type DashboardView = 'explore' | 'my-dashboard';

// Main Dashboard Component
const Dashboard: React.FC = () => {
  const { user, userData, loading } = useAuth();
  const [currentView, setCurrentView] = useState<DashboardView | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Scroll spy functionality
  useEffect(() => {
    const handleScroll = () => {
      const exploreSection = document.getElementById('explore-events');
      const myDashboardSection = document.getElementById('my-dashboard');

      if (!exploreSection || !myDashboardSection) return;

      const scrollPosition = window.scrollY;
      const windowHeight = window.innerHeight;
      const exploreTop = exploreSection.offsetTop - 100; // Account for navbar
      const myDashboardTop = myDashboardSection.offsetTop - 100;

      // Only highlight sections when they're actually visible and prominent
      if (scrollPosition >= myDashboardTop) {
        setCurrentView('my-dashboard');
      } else if (scrollPosition >= exploreTop) {
        setCurrentView('explore');
      } else {
        // When at the top (banner area), don't highlight any section
        setCurrentView(null);
      }
    };

    // Add scroll listener
    window.addEventListener('scroll', handleScroll);

    // Initial check
    handleScroll();

    // Cleanup
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Development role switcher
  const switchRole = async (newRole: 'user' | 'host' | 'admin') => {
    if (user && userData) {
      try {
        const userDocRef = doc(db, 'users', user.uid);
        await updateDoc(userDocRef, { role: newRole });
        window.location.reload();
      } catch (error) {
        console.error('Error updating role:', error);
      }
    }
  };

  // Handle navigation between views with smooth scrolling
  const handleNavigation = (view: DashboardView) => {
    setCurrentView(view);

    // Smooth scroll to appropriate section
    if (view === 'explore') {
      const exploreSection = document.getElementById('explore-events');
      if (exploreSection) {
        exploreSection.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    } else if (view === 'my-dashboard') {
      const myDashboardSection = document.getElementById('my-dashboard');
      if (myDashboardSection) {
        myDashboardSection.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    }
  };

  // Handle search from navbar
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // If searching, navigate to explore events section
    if (query.trim()) {
      handleNavigation('explore');
    }
  };

  // Dev role switcher
  const handleRoleChange = async (newRole: 'user' | 'host' | 'admin') => {
    if (!user) return;

    try {
      await updateDoc(doc(db, 'users', user.uid), {
        role: newRole,
        updatedAt: new Date()
      });

      // Refresh the page to update the UI
      window.location.reload();
    } catch (error) {
      console.error('Error updating role:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Admin users see only AdminPanel (no HeroSection or Explore Events)
  if (userData?.role === 'admin') {
    return (
      <div className="min-h-screen bg-black">
        <UnifiedNavbar onNavigate={handleNavigation} currentView={currentView} onSearch={handleSearch} />
        <AdminPanel />
      </div>
    );
  }

  // Users and Hosts see HeroSection + Explore Events + My Dashboard tab
  return (
    <div className="min-h-screen bg-black">
      <UnifiedNavbar onNavigate={handleNavigation} currentView={currentView} onSearch={handleSearch} />

      {/* HeroSection - Always shown for users and hosts */}
      <HeroSection isAuthenticated={true} showButtons={false} />

      {/* Explore Events Section */}
      <section id="explore-events">
        <ExploreEvents searchQuery={searchQuery} />
      </section>

      {/* My Dashboard Section */}
      <section id="my-dashboard">
        {userData?.role === 'user' && <UserBookings />}
        {userData?.role === 'host' && <HostEvents />}
      </section>
    </div>
  );
};

export default Dashboard;