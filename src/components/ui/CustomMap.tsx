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
  const embedUrl = `https://maps.google.com/maps?q=${encodedLocation}&t=&z=15&ie=UTF8&iwloc=&output=embed`;

  const handleMapClick = () => {
    window.open(mapsSearchUrl, '_blank');
  };

  const handleIframeError = () => {
    setMapError(true);
  };

  // Fallback designed map component
  const DesignedMap = () => (
    <div className="relative cursor-pointer group" style={{ height }} onClick={handleMapClick}>
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/30 to-neutral-800 flex items-center justify-center">
        {/* Animated Map Grid Background */}
        <div className="absolute inset-0 opacity-10">
          <svg width="100%" height="100%" className="text-gray-400">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* Central Location Pin */}
        <div className="relative z-10 text-center group-hover:scale-110 transition-transform duration-300">
          <div className="relative mb-4">
            <svg className="w-20 h-20 text-red-500 mx-auto drop-shadow-lg animate-bounce" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
            <div className="absolute top-16 left-1/2 transform -translate-x-1/2 w-8 h-4 bg-black/30 rounded-full blur-sm"></div>
          </div>

          <div className="bg-black/70 backdrop-blur-sm rounded-lg p-4 max-w-sm mx-auto">
            <h4 className="text-white font-semibold text-lg mb-2">📍 Event Location</h4>
            {!compact && <p className="text-gray-300 text-sm mb-3 line-clamp-2">{location}</p>}
            <div className="inline-flex items-center space-x-2 text-blue-400 font-medium group-hover:text-blue-300 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              <span>{compact ? 'View Map' : 'Click to Open in Google Maps'}</span>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-8 left-8 w-3 h-3 bg-blue-400 rounded-full opacity-60 animate-pulse"></div>
        <div className="absolute top-16 right-12 w-2 h-2 bg-green-400 rounded-full opacity-40 animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-12 left-16 w-2 h-2 bg-yellow-400 rounded-full opacity-50 animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-8 right-8 w-3 h-3 bg-purple-400 rounded-full opacity-30 animate-pulse" style={{animationDelay: '0.5s'}}></div>

        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>
    </div>
  );

  return (
    <div className={`rounded-xl overflow-hidden shadow-md bg-gradient-to-br from-neutral-700 to-neutral-800 ${className}`}>
      {!mapError ? (
        <div className="relative" style={{ height }}>
          {/* Real Google Maps Embed */}
          <iframe
            src={embedUrl}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            onError={handleIframeError}
            className="rounded-xl"
          />

          {/* Overlay for click handling */}
          <div
            className="absolute inset-0 bg-transparent cursor-pointer group"
            onClick={handleMapClick}
            title="Click to open in Google Maps"
          >
            {/* Corner Badge */}
            {showBadge && (
              <div className="absolute top-4 right-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-3 py-1 rounded-full text-xs font-medium shadow-lg opacity-90 group-hover:opacity-100 transition-opacity">
                Open in Google Maps
              </div>
            )}
          </div>
        </div>
      ) : (
        <DesignedMap />
      )}

      {/* Fallback badge for designed map */}
      {mapError && showBadge && (
        <div className="absolute top-4 right-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-3 py-1 rounded-full text-xs font-medium shadow-lg">
          Interactive Map
        </div>
      )}
    </div>
  );
};

export default CustomMap;
