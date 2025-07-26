/**
 * CreateEventCTA Component
 * 
 * Call-to-action component for hosts to create new events
 * Styled with Tickzy's purple/dark theme
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';

const CreateEventCTA: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 rounded-2xl p-8 border border-purple-500/20">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-6 md:mb-0">
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">
                Ready to create your next event?
              </h3>
              <p className="text-purple-200 text-lg">
                Reach thousands of potential attendees with Tickzy's powerful platform
              </p>
            </div>
            <button
              onClick={() => navigate('/create-event')}
              className="group relative bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:via-teal-400 hover:to-cyan-400 text-white font-bold px-8 py-4 rounded-xl transition-all duration-300 transform hover:scale-110 shadow-xl border-2 border-emerald-400/30 hover:border-emerald-300/50 shadow-emerald-500/25 hover:shadow-emerald-400/40 whitespace-nowrap tracking-wide"
            >
              <div className="flex items-center space-x-2">
                <svg
                  className="w-5 h-5 drop-shadow-sm"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
                <span>Create Event</span>
              </div>

              {/* Enhanced glow effect */}
              <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-30 transition-opacity duration-300 bg-gradient-to-r from-emerald-300 via-teal-300 to-cyan-300 blur-sm"></div>

              {/* Sparkle effect */}
              <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="absolute top-2 right-2 w-1 h-1 bg-white rounded-full animate-pulse"></div>
                <div className="absolute bottom-2 left-2 w-1 h-1 bg-white rounded-full animate-pulse delay-300"></div>
                <div className="absolute top-1/2 left-1/2 w-0.5 h-0.5 bg-white rounded-full animate-pulse delay-150"></div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CreateEventCTA;
