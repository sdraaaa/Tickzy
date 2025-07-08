import React from 'react';
import { Outlet } from 'react-router-dom';
import DesktopNavbar from './DesktopNavbar';
import MobileBottomNav from './MobileBottomNav';

const Layout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <DesktopNavbar />
      <main className="pb-20 md:pb-0">
        <Outlet />
      </main>
      <MobileBottomNav />
    </div>
  );
};

export default Layout;