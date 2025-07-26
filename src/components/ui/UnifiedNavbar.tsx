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
  currentView?: 'explore' | 'my-dashboard' | null;
  onSearch?: (query: string) => void;
}

const UnifiedNavbar: React.FC<UnifiedNavbarProps> = ({ onNavigate, currentView = null, onSearch }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const { user, userData, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      // Handle logout error silently
    }
  };

  const handleLogoClick = () => {
    if (user) {
      // Check if we're already on the dashboard
      if (location.pathname === '/dashboard') {
        // If on dashboard, scroll to hero banner
        const heroSection = document.getElementById('hero-banner');
        if (heroSection) {
          heroSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      } else {
        // If on another page, navigate to dashboard and scroll to banner
        navigate('/dashboard');
        setTimeout(() => {
          const heroSection = document.getElementById('hero-banner');
          if (heroSection) {
            heroSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
          } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }, 100);
      }
    } else {
      navigate('/');
    }
  };

  const getNavItems = () => {
    if (userData?.role === 'admin') {
      return [
        { name: 'Admin Control Panel', view: 'explore' as const, current: true },
      ];
    }
    return [
      { name: 'Explore Events', view: 'explore' as const, current: currentView === 'explore' },
      { name: 'My Dashboard', view: 'my-dashboard' as const, current: currentView === 'my-dashboard' },
    ];
  };

  const getRoleBasedActions = () => {
    if (userData?.role === 'host') {
      return [
        {
          name: 'Create Event',
          path: '/create-event',
          style: 'primary',
          description: 'Host a new event'
        }
      ];
    } else if (userData?.role === 'user') {
      return [
        {
          name: 'Become a Host',
          path: '/request-host',
          style: 'secondary',
          description: 'Apply to host events'
        }
      ];
    }
    return [];
  };

  const navItems = getNavItems();
  const roleActions = getRoleBasedActions();

  const handleNavClick = (view: 'explore' | 'my-dashboard') => {
    if (onNavigate) {
      onNavigate(view);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim() && onSearch) {
      onSearch(searchQuery.trim());
      // Navigate to explore events if not already there
      if (location.pathname === '/dashboard' && onNavigate) {
        onNavigate('explore');
      }
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);

    // Real-time search for better UX
    if (onSearch) {
      onSearch(query);
    }
  };

  return (
    <nav className="bg-neutral-900 border-b border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-16">
          {/* Logo and Navigation */}
          <div className="flex items-center">
            <button
              onClick={handleLogoClick}
              className="text-2xl font-bold text-white tracking-wide hover:text-purple-400 transition-colors duration-200 mr-8"
            >
              Tickzy
            </button>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              {navItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => handleNavClick(item.view)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 transform ${
                    item.current
                      ? 'text-white bg-gradient-to-r from-purple-600 to-blue-600 shadow-lg scale-105'
                      : 'text-gray-300 hover:text-white hover:bg-gray-800 hover:scale-105'
                  }`}
                >
                  {item.name}
                </button>
              ))}

              {/* Role-based Action Buttons */}
              {roleActions.map((action) => {
                const isPrimary = action.style === 'primary';
                return (
                  <button
                    key={action.name}
                    onClick={() => navigate(action.path)}
                    className={`group relative px-6 py-2.5 font-bold rounded-xl transition-all duration-300 transform hover:scale-110 shadow-xl ${
                      isPrimary
                        ? 'bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:via-teal-400 hover:to-cyan-400 text-white border-2 border-emerald-400/30 hover:border-emerald-300/50 shadow-emerald-500/25 hover:shadow-emerald-400/40'
                        : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white border border-indigo-500/20'
                    }`}
                    title={action.description}
                  >
                    <div className="flex items-center space-x-2">
                      <svg
                        className={`w-5 h-5 ${isPrimary ? 'drop-shadow-sm' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        {isPrimary ? (
                          // Plus icon for Create Event with thicker stroke
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                        ) : (
                          // Arrow up icon for Become Host
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        )}
                      </svg>
                      <span className={isPrimary ? 'tracking-wide' : ''}>{action.name}</span>
                    </div>

                    {/* Enhanced glow effect for primary button */}
                    <div className={`absolute inset-0 rounded-xl opacity-0 group-hover:opacity-30 transition-opacity duration-300 ${
                      isPrimary
                        ? 'bg-gradient-to-r from-emerald-300 via-teal-300 to-cyan-300 blur-sm'
                        : 'bg-gradient-to-r from-indigo-400 to-purple-400'
                    }`}></div>

                    {/* Additional sparkle effect for primary button */}
                    {isPrimary && (
                      <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                        <div className="absolute top-1 right-1 w-1 h-1 bg-white rounded-full animate-pulse"></div>
                        <div className="absolute bottom-1 left-1 w-1 h-1 bg-white rounded-full animate-pulse delay-300"></div>
                        <div className="absolute top-1/2 left-1/2 w-0.5 h-0.5 bg-white rounded-full animate-pulse delay-150"></div>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Center - Search Bar (only for non-admin users) */}
          {userData?.role !== 'admin' && (
            <div className="flex-1 max-w-md mx-6 hidden lg:block">
              <form onSubmit={handleSearchSubmit} className="relative">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg
                      className={`h-4 w-4 transition-colors duration-200 ${
                        searchFocused ? 'text-purple-400' : 'text-gray-400'
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    onFocus={() => setSearchFocused(true)}
                    onBlur={() => setSearchFocused(false)}
                    placeholder="Search events..."
                    className={`block w-full pl-9 pr-4 py-1.5 text-sm border rounded-lg bg-neutral-800 text-white placeholder-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                      searchFocused
                        ? 'border-purple-500 bg-neutral-700'
                        : 'border-gray-600 hover:border-gray-500'
                    }`}
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery('');
                        if (onSearch) onSearch('');
                      }}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white transition-colors duration-200"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              </form>
            </div>
          )}

          {/* Right side - User menu */}
          <div className="flex items-center space-x-4 ml-auto">
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
                  {/* TODO: Show notification count when there are notifications */}
                </button>

                {/* Notifications Sidebar */}
                {notificationsOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-neutral-800 rounded-md shadow-lg border border-gray-700 z-50">
                    <div className="p-4">
                      <h3 className="text-white font-semibold mb-3">Notifications</h3>
                      {/* Empty State - TODO: Replace with real notifications */}
                      <div className="text-center py-8">
                        <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
                          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <p className="text-gray-400 text-sm">You have no notifications yet.</p>
                        <p className="text-gray-500 text-xs mt-1">We'll notify you about important updates and events.</p>
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
              className={`block w-full text-left px-4 py-3 rounded-lg text-base font-medium transition-all duration-300 ${
                item.current
                  ? 'text-white bg-gradient-to-r from-purple-600 to-blue-600 shadow-lg'
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
