/**
 * UnifiedNavbar Component
 * 
 * Persistent navigation bar for all authenticated pages
 * Shows consistent navigation with role-based links and notifications
 */

import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface UnifiedNavbarProps {
  onNavigate?: (view: 'explore' | 'my-dashboard') => void;
  currentView?: 'explore' | 'my-dashboard';
}

const UnifiedNavbar: React.FC<UnifiedNavbarProps> = ({ onNavigate, currentView = 'explore' }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const { user, userData, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleLogoClick = () => {
    navigate('/dashboard');
  };

  const getNavItems = () => {
    if (userData?.role === 'admin') {
      return [
        { name: 'Admin Dashboard', view: 'explore' as const, current: true },
      ];
    }
    return [
      { name: 'Explore Events', view: 'explore' as const, current: currentView === 'explore' },
      { name: 'My Dashboard', view: 'my-dashboard' as const, current: currentView === 'my-dashboard' },
    ];
  };

  const navItems = getNavItems();

  const handleNavClick = (view: 'explore' | 'my-dashboard') => {
    if (onNavigate) {
      onNavigate(view);
    }
  };

  return (
    <nav className="bg-neutral-900 border-b border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Navigation */}
          <div className="flex items-center">
            <button
              onClick={handleLogoClick}
              className="text-2xl font-bold text-white tracking-wide hover:text-purple-400 transition-colors duration-200 mr-8"
            >
              Tickzy
            </button>

            {/* Desktop Navigation */}
            <div className="hidden md:flex space-x-8">
              {navItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => handleNavClick(item.view)}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                    item.current
                      ? 'text-white bg-purple-600'
                      : 'text-gray-300 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  {item.name}
                </button>
              ))}
            </div>
          </div>

          {/* Right side - User menu */}
          <div className="flex items-center space-x-4">
            {/* Notifications Bell - Only for non-admin users */}
            {userData?.role !== 'admin' && (
              <div className="relative">
                <button
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  className="relative p-2 text-gray-400 hover:text-white transition-colors duration-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="absolute -top-1 -right-1 bg-purple-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    3
                  </span>
                </button>

                {/* Notifications Sidebar */}
                {notificationsOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-neutral-800 rounded-md shadow-lg border border-gray-700 z-50">
                    <div className="p-4">
                      <h3 className="text-white font-semibold mb-3">Notifications</h3>
                      <div className="space-y-3">
                        <div className="flex items-start space-x-3 p-2 hover:bg-gray-700 rounded">
                          <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                          <div>
                            <p className="text-white text-sm">Event reminder: Tech Conference starts in 3 days</p>
                            <p className="text-gray-400 text-xs">2 hours ago</p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3 p-2 hover:bg-gray-700 rounded">
                          <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                          <div>
                            <p className="text-white text-sm">Booking confirmed for Summer Music Festival</p>
                            <p className="text-gray-400 text-xs">1 day ago</p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3 p-2 hover:bg-gray-700 rounded">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                          <div>
                            <p className="text-white text-sm">New event recommendation available</p>
                            <p className="text-gray-400 text-xs">3 days ago</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* User Avatar */}
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className={`w-10 h-10 bg-gradient-to-r ${
                  userData?.role === 'admin' ? 'from-red-500 to-orange-500' :
                  userData?.role === 'host' ? 'from-green-500 to-emerald-500' :
                  'from-purple-500 to-blue-500'
                } rounded-full flex items-center justify-center hover:scale-105 transition-transform duration-200`}
              >
                <span className="text-white text-sm font-medium">
                  {(user?.displayName || user?.email || 'U')[0].toUpperCase()}
                </span>
              </button>

              {/* Dropdown Menu */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-neutral-800 rounded-md shadow-lg border border-gray-700 z-50">
                  <div className="py-1">
                    <div className="px-4 py-2 border-b border-gray-700">
                      <div className="text-sm font-medium text-white">
                        {user?.displayName || user?.email?.split('@')[0]}
                      </div>
                      <div className="text-xs text-gray-400 capitalize">
                        {userData?.role}
                      </div>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700 transition-colors duration-200"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden">
        <div className="px-2 pt-2 pb-3 space-y-1 bg-neutral-800">
          {navItems.map((item) => (
            <button
              key={item.name}
              onClick={() => handleNavClick(item.view)}
              className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
                item.current
                  ? 'text-white bg-purple-600'
                  : 'text-gray-300 hover:text-white hover:bg-gray-700'
              }`}
            >
              {item.name}
            </button>
          ))}
        </div>
      </div>

      {/* Click outside to close dropdowns */}
      {(dropdownOpen || notificationsOpen) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setDropdownOpen(false);
            setNotificationsOpen(false);
          }}
        />
      )}
    </nav>
  );
};

export default UnifiedNavbar;
