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
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-8 py-4 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg whitespace-nowrap"
            >
              Create Event
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CreateEventCTA;
