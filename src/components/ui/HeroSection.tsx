/**
 * HeroSection Component
 *
 * Full-screen hero banner with concert background image
 * Clean and minimal design
 */

import React from 'react';

const HeroSection: React.FC = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image - Concert crowd with stage lights */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=2070&auto=format&fit=crop)'
        }}
      ></div>

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/70"></div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Main Heading */}
        <h1 className="text-6xl sm:text-7xl lg:text-8xl font-bold text-white mb-8 tracking-tight">
          Tickzy
        </h1>

        {/* Subtitle */}
        <p className="text-xl sm:text-2xl text-gray-200 mb-12 max-w-2xl mx-auto">
          Discover and book tickets for amazing events
        </p>

        {/* CTA Button */}
        <div className="flex justify-center">
          <button className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-bold px-12 py-4 rounded-full text-lg transition-all duration-300 transform hover:scale-105 shadow-2xl">
            Get Started
          </button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
