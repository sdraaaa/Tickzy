/**
 * Dashboard Component
 *
 * Unified dashboard route with role-based views and tab system:
 * - Users/Hosts: HeroSection + Explore Events + My Dashboard tab
 * - Admins: Admin tools only (no HeroSection or Explore Events)
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import UnifiedNavbar from './ui/UnifiedNavbar';
import HeroSection from './ui/HeroSection';
import ExploreEvents from './ui/ExploreEvents';
import UserBookings from './ui/UserBookings';
import HostEvents from './ui/HostEvents';
import AdminPanel from './ui/AdminPanel';

// Dashboard View Types
type DashboardView = 'explore' | 'my-dashboard';

// Main Dashboard Component
const Dashboard: React.FC = () => {
  const { user, userData, loading } = useAuth();
  const [currentView, setCurrentView] = useState<DashboardView>('explore');

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

  // Handle navigation between views
  const handleNavigation = (view: DashboardView) => {
    setCurrentView(view);

    // Scroll to appropriate section
    if (view === 'explore') {
      const exploreSection = document.getElementById('explore-events');
      if (exploreSection) {
        exploreSection.scrollIntoView({ behavior: 'smooth' });
      }
    } else if (view === 'my-dashboard') {
      const myDashboardSection = document.getElementById('my-dashboard');
      if (myDashboardSection) {
        myDashboardSection.scrollIntoView({ behavior: 'smooth' });
      }
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
        <UnifiedNavbar onNavigate={handleNavigation} currentView={currentView} />

        {/* Role Switcher for Development */}
        {process.env.NODE_ENV === 'development' && userData && (
          <div className="bg-neutral-800 p-4 m-4 rounded-lg border border-yellow-600">
            <p className="text-yellow-400 text-sm mb-2">🔧 DEV MODE - Current Role: <span className="text-purple-400 font-bold">{userData.role}</span></p>
            <div className="flex space-x-2">
              <button
                onClick={() => switchRole('user')}
                className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-sm"
              >
                Switch to User
              </button>
              <button
                onClick={() => switchRole('host')}
                className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-sm"
              >
                Switch to Host
              </button>
            </div>
          </div>
        )}

        <AdminPanel />
      </div>
    );
  }

  // Users and Hosts see HeroSection + Explore Events + My Dashboard tab
  return (
    <div className="min-h-screen bg-black">
      <UnifiedNavbar onNavigate={handleNavigation} currentView={currentView} />

      {/* Role Switcher for Development */}
      {process.env.NODE_ENV === 'development' && userData && (
        <div className="bg-neutral-800 p-4 m-4 rounded-lg border border-yellow-600">
          <p className="text-yellow-400 text-sm mb-2">🔧 DEV MODE - Current Role: <span className="text-purple-400 font-bold">{userData.role}</span></p>
          <div className="flex space-x-2">
            <button
              onClick={() => switchRole('user')}
              className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-sm"
            >
              Switch to User
            </button>
            <button
              onClick={() => switchRole('host')}
              className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-sm"
            >
              Switch to Host
            </button>
            <button
              onClick={() => switchRole('admin')}
              className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-sm"
            >
              Switch to Admin
            </button>
          </div>
        </div>
      )}

      {/* HeroSection - Always shown for users and hosts */}
      <HeroSection isAuthenticated={true} showButtons={false} />

      {/* Explore Events Section */}
      <ExploreEvents />

      {/* My Dashboard Section */}
      <div id="my-dashboard">
        {userData?.role === 'user' && <UserBookings />}
        {userData?.role === 'host' && <HostEvents />}
      </div>

      {/* Fallback for unknown roles */}
      {userData && !['user', 'host', 'admin'].includes(userData.role) && (
        <div className="text-white p-8 text-center">
          <p>Unknown role: {userData.role}</p>
          <p>Defaulting to explore events...</p>
          <ExploreEvents />
        </div>
      )}
    </div>
  );
};

export default Dashboard;