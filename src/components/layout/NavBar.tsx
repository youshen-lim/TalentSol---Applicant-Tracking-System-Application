import React from 'react';
import { Search, Bell, User, ChevronDown, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface NavBarProps {
  className?: string;
}

const NavBar = ({ className }: NavBarProps) => {
  return (
    <header className={cn("h-16 border-b bg-white sticky top-0 z-30 flex items-center justify-between px-6", className)}>
      {/* Left side - Logo */}
      <div className="flex items-center">
        {/* Logo */}
        <Link to="/dashboard">
          <div className="h-8 w-8 bg-ats-purple text-white rounded flex items-center justify-center font-bold">
            T
          </div>
        </Link>

        {/* App Name - visible on larger screens */}
        <div className="ml-3 hidden md:block">
          <h1 className="text-lg font-semibold text-gray-900">TalentSol</h1>
          <p className="text-xs text-gray-500">Applicant Tracking System</p>
        </div>
      </div>

      {/* Right side - Search, Notifications, User */}
      <div className="flex items-center space-x-4">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search"
            className="pl-10 py-2 pr-4 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ats-blue/20 focus:border-ats-blue"
          />
        </div>

        {/* Notifications */}
        <Button variant="ghost" size="icon">
          <Bell className="h-5 w-5 text-gray-600 hover:text-ats-blue" />
        </Button>

        {/* Settings - Added from original navbar */}
        <Button variant="ghost" size="icon" className="text-gray-600 hover:text-ats-blue">
          <Settings className="h-5 w-5" />
        </Button>

        {/* User Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center space-x-2 p-1 rounded-full">
              <div className="h-8 w-8 bg-ats-blue/10 text-ats-blue rounded-full flex items-center justify-center">
                <User className="h-4 w-4" />
              </div>
              <span className="hidden md:inline text-sm font-medium">Jane Doe</span>
              <ChevronDown className="h-4 w-4 text-gray-400" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Log out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default NavBar;