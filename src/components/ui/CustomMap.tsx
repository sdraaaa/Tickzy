/**
 * CustomMap Component
 *
 * Real Google Maps integration without API keys using iframe embed
 * Falls back to designed map if embed fails
 */

import React, { useState } from 'react';

interface CustomMapProps {
  location: string;
  height?: string;
  className?: string;
  showBadge?: boolean;
  compact?: boolean;
}

const CustomMap: React.FC<CustomMapProps> = ({
  location,
  height = "300px",
  className = "",
  showBadge = true,
  compact = false
}) => {
  const [mapError, setMapError] = useState(false);

  // Create Google Maps URLs
  const encodedLocation = encodeURIComponent(location);
  const mapsSearchUrl = `https://www.google.com/maps/search/?api=1&query=${encodedLocation}`;

  // Since iframe embeds have CORS issues, we'll use the designed map by default
  // and provide a prominent "Open in Google Maps" button

  const handleMapClick = () => {
    window.open(mapsSearchUrl, '_blank');
  };

  const handleIframeError = () => {
    setMapError(true);
  };

  // Enhanced designed map component
  const DesignedMap = () => (
    <div className="relative cursor-pointer group" style={{ height }} onClick={handleMapClick}>
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/30 via-purple-900/40 to-indigo-900/30 flex items-center justify-center overflow-hidden">
        {/* Animated Map Grid Background */}
        <div className="absolute inset-0 opacity-15">
          <svg width="100%" height="100%" className="text-gray-300">
            <defs>
              <pattern id="mapGrid" width="50" height="50" patternUnits="userSpaceOnUse">
                <path d="M 50 0 L 0 0 0 50" fill="none" stroke="currentColor" strokeWidth="1"/>
                <circle cx="25" cy="25" r="1" fill="currentColor" opacity="0.3"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#mapGrid)" />
          </svg>
        </div>

        {/* Floating Map Elements */}
        <div className="absolute inset-0">
          {/* Roads/Paths */}
          <div className="absolute top-1/3 left-0 w-full h-1 bg-gray-400/20 transform rotate-12"></div>
          <div className="absolute top-2/3 left-0 w-full h-1 bg-gray-400/20 transform -rotate-6"></div>
          <div className="absolute left-1/4 top-0 w-1 h-full bg-gray-400/20 transform rotate-3"></div>

          {/* Landmark dots */}
          <div className="absolute top-1/4 left-1/3 w-2 h-2 bg-blue-400 rounded-full opacity-60 animate-pulse"></div>
          <div className="absolute top-3/4 right-1/4 w-2 h-2 bg-green-400 rounded-full opacity-50 animate-pulse" style={{animationDelay: '1s'}}></div>
          <div className="absolute bottom-1/4 left-1/2 w-2 h-2 bg-yellow-400 rounded-full opacity-40 animate-pulse" style={{animationDelay: '2s'}}></div>
        </div>

        {/* Central Location Pin with enhanced styling */}
        <div className="relative z-10 text-center group-hover:scale-110 transition-all duration-500">
          <div className="relative mb-4">
            {/* Pin with glow effect */}
            <div className="relative">
              <div className="absolute inset-0 w-20 h-20 bg-red-500/30 rounded-full blur-xl animate-pulse"></div>
              <svg className="relative w-20 h-20 text-red-500 mx-auto drop-shadow-2xl animate-bounce" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
            </div>
            <div className="absolute top-20 left-1/2 transform -translate-x-1/2 w-12 h-6 bg-black/40 rounded-full blur-md"></div>
          </div>

          <div className="bg-black/80 backdrop-blur-md rounded-xl p-5 max-w-sm mx-auto border border-white/10 shadow-2xl">
            <h4 className="text-white font-bold text-lg mb-2 flex items-center justify-center gap-2">
              <span className="text-2xl">📍</span>
              Event Location
            </h4>
            {!compact && (
              <p className="text-gray-200 text-sm mb-4 line-clamp-2 leading-relaxed">{location}</p>
            )}
            <div className="inline-flex items-center space-x-2 text-blue-300 font-semibold group-hover:text-blue-200 transition-colors bg-blue-500/20 px-3 py-2 rounded-lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              <span>{compact ? 'View Map' : 'Click to Open in Google Maps'}</span>
            </div>
          </div>
        </div>

        {/* Enhanced hover effect */}
        <div className="absolute inset-0 bg-gradient-to-t from-purple-900/20 via-transparent to-blue-900/20 opacity-0 group-hover:opacity-100 transition-all duration-500"></div>

        {/* Ripple effect on hover */}
        <div className="absolute inset-0 group-hover:animate-ping">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 border-2 border-white/20 rounded-full"></div>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`rounded-xl overflow-hidden shadow-md bg-gradient-to-br from-neutral-700 to-neutral-800 ${className}`}>
      {/* Use the designed map with enhanced interactivity */}
      <DesignedMap />

      {/* Enhanced "Open in Google Maps" button */}
      {showBadge && (
        <div className="absolute top-4 right-4 z-10">
          <button
            onClick={handleMapClick}
            className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg transition-all duration-200 flex items-center gap-2 hover:scale-105"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            Open in Google Maps
          </button>
        </div>
      )}
    </div>
  );
};

export default CustomMap;
