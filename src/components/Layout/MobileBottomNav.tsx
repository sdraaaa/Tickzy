import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Search, Calendar, User, Plus } from 'lucide-react';

const MobileBottomNav: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Search, label: 'Search', path: '/search' },
    { icon: Plus, label: 'Create', path: '/host/create' },
    { icon: Calendar, label: 'Events', path: '/events' },
    { icon: User, label: 'Profile', path: '/profile' },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200">
      <div className="flex justify-around items-center py-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center px-3 py-2 rounded-xl transition-all duration-300 ${
                isActive
                  ? 'text-primary-500 bg-primary-50'
                  : 'text-gray-600 hover:text-primary-500 hover:bg-gray-50'
              }`}
            >
              <Icon className={`w-6 h-6 ${item.label === 'Create' && !isActive ? 'text-primary-500' : ''}`} />
              <span className="text-xs mt-1 font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomNav;