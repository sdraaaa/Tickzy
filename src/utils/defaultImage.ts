/**
 * Default image utilities for Tickzy
 * Provides fallback images when external URLs fail to load
 */

// Simple SVG placeholder as data URL - using URL encoding instead of base64
export const DEFAULT_EVENT_IMAGE = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#8B5CF6;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#3B82F6;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#grad)"/>
  <text x="50%" y="45%" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="24" font-weight="bold">Tickzy</text>
  <text x="50%" y="60%" text-anchor="middle" fill="rgba(255,255,255,0.8)" font-family="Arial, sans-serif" font-size="16">Event Image</text>
</svg>
`)}`;

// Alternative simple colored background
export const SIMPLE_PLACEHOLDER = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="#1f2937"/>
  <circle cx="200" cy="150" r="40" fill="#8B5CF6" opacity="0.3"/>
  <text x="50%" y="55%" text-anchor="middle" fill="#9CA3AF" font-family="Arial, sans-serif" font-size="18">Event</text>
</svg>
`)}`;

export const getDefaultEventImage = (): string => {
  return DEFAULT_EVENT_IMAGE;
};
