/**
 * HeroSection Component
 *
 * Hero banner that adapts to authentication state
 * - Public: Shows general welcome message with CTA buttons
 * - Authenticated: Shows personalized welcome with user's name
 * Keeps the same visual design and layout
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface HeroSectionProps {
  isAuthenticated?: boolean;
  showButtons?: boolean;
}

const HeroSection: React.FC<HeroSectionProps> = ({
  isAuthenticated = false,
  showButtons = true
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();

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
          {isAuthenticated && user
            ? `Welcome back, ${user.displayName || user.email?.split('@')[0]}! Ready for your next adventure?`
            : 'Discover and book tickets for amazing events'
          }
        </p>

        {/* CTA Buttons - Only show if showButtons is true */}
        {showButtons && (
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {isAuthenticated ? (
              <button
                onClick={() => {
                  // Scroll to explore events section
                  const exploreSection = document.getElementById('explore-events');
                  if (exploreSection) {
                    exploreSection.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-bold px-12 py-4 rounded-full text-lg transition-all duration-300 transform hover:scale-105 shadow-2xl"
              >
                Explore Events
              </button>
            ) : (
              <>
                <button
                  onClick={() => navigate('/explore-events')}
                  className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-bold px-12 py-4 rounded-full text-lg transition-all duration-300 transform hover:scale-105 shadow-2xl"
                >
                  Explore Events
                </button>
                <button
                  onClick={() => navigate('/login')}
                  className="border-2 border-white text-white hover:bg-white hover:text-black font-bold px-12 py-4 rounded-full text-lg transition-all duration-300 transform hover:scale-105"
                >
                  Sign In
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default HeroSection;
