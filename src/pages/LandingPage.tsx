/**
 * LandingPage Component
 *
 * Dark-themed public landing page for Tickzy platform
 * Features: Navbar, Hero Section, placeholder sections
 */

import React from 'react';
import LandingNavbar from '../components/Landing/LandingNavbar';
import HeroSection from '../components/ui/HeroSection';
import EventShowcase from '../components/Landing/EventShowcase';

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-black text-white">
      <LandingNavbar />
      <HeroSection />
      <EventShowcase />

      {/* Why Tickzy Section */}
      <section className="py-20 bg-neutral-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6 tracking-wide">
              Why Tickzy?
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              A modern platform for event discovery and ticket management.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <span className="text-3xl">🎫</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">
                Easy Booking
              </h3>
              <p className="text-gray-400 leading-relaxed">
                Simple and intuitive ticket booking process designed for everyone.
              </p>
            </div>

            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <span className="text-3xl">📱</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">
                Mobile Ready
              </h3>
              <p className="text-gray-400 leading-relaxed">
                Access your tickets on any device, anywhere you go.
              </p>
            </div>

            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <span className="text-3xl">🔒</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">
                Secure
              </h3>
              <p className="text-gray-400 leading-relaxed">
                Your data and payments are protected with modern security.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call-to-Action Section */}
      <section className="py-20 bg-gradient-to-r from-purple-900 via-blue-900 to-purple-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6 tracking-wide">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-gray-200 mb-10 max-w-2xl mx-auto">
            Join Tickzy and discover amazing events in your area.
          </p>
          {/* CTA buttons are now handled in EventShowcase component */}
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
