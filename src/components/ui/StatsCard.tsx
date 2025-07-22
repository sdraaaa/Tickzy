/**
 * StatsCard Component
 * 
 * Reusable card component for displaying statistics and metrics
 */

import React from 'react';

interface StatsCardProps {
  title: string;
  value: string;
  change: string;
  color: 'red' | 'orange' | 'green' | 'blue' | 'purple';
  icon: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, change, color, icon }) => {
  const getColorClasses = (color: string) => {
    switch (color) {
      case 'red': return 'from-red-500 to-red-600 border-red-500/20';
      case 'orange': return 'from-orange-500 to-orange-600 border-orange-500/20';
      case 'green': return 'from-green-500 to-green-600 border-green-500/20';
      case 'blue': return 'from-blue-500 to-blue-600 border-blue-500/20';
      case 'purple': return 'from-purple-500 to-purple-600 border-purple-500/20';
      default: return 'from-gray-500 to-gray-600 border-gray-500/20';
    }
  };

  const getChangeColor = (change: string) => {
    if (change.includes('+')) return 'text-green-400';
    if (change.includes('-')) return 'text-red-400';
    return 'text-gray-400';
  };

  return (
    <div className="bg-neutral-800 rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 bg-gradient-to-r ${getColorClasses(color)} rounded-lg flex items-center justify-center border`}>
          <span className="text-2xl">{icon}</span>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-white">{value}</div>
          <div className={`text-sm ${getChangeColor(change)}`}>{change}</div>
        </div>
      </div>
      
      <div>
        <h3 className="text-gray-400 text-sm font-medium">{title}</h3>
      </div>
    </div>
  );
};

export default StatsCard;
