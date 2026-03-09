import React from 'react';
import { Outlet } from 'react-router-dom';
import NavBar from './NavBar';
import Sidebar from './Sidebar';

/**
 * Main layout — matches Figma Make structure:
 * flex h-screen (sidebar-left | header+content-right)
 * Page background: #F5F6FA
 */
const Layout = () => {
  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: '#F5F6FA' }}>
      {/* Left sidebar — full height */}
      <Sidebar />

      {/* Right: header + scrollable content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <NavBar />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
