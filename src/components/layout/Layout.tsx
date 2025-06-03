import React from 'react';
import { Outlet } from 'react-router-dom';
import NavBar from './NavBar';
import Sidebar from './Sidebar';

/**
 * Main layout component for the TalentSol ATS application
 * Provides the overall structure with navbar, sidebar, and content area
 * Uses the blue color scheme from Tailwind configuration
 */
const Layout = () => {
  return (
    <div className="min-h-screen bg-ats-gray flex flex-col font-sans">
      <NavBar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 min-h-[calc(100vh-4rem)] overflow-y-auto border-t border-ats-border-gray font-sans">
          <div className="p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
