/**
 * HeroGreeting Component
 * 
 * Personalized welcome section for authenticated users
 * Shows user name and role-specific messaging
 */

import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

const HeroGreeting: React.FC = () => {
  const { user, userData } = useAuth();

  const getRoleMessage = () => {
    switch (userData?.role) {
      case 'admin':
        return "Manage your platform and oversee all operations";
      case 'host':
        return "Create amazing events and connect with your audience";
      default:
        return "Discover your next unforgettable experience";
    }
  };

  return (
    <section className="py-12 bg-gradient-to-r from-purple-900/30 to-blue-900/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Welcome back, {user?.displayName || user?.email?.split('@')[0]}! 👋
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            {getRoleMessage()}
          </p>
        </div>
      </div>
    </section>
  );
};

export default HeroGreeting;
