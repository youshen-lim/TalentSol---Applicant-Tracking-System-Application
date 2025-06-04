import React, { useState } from 'react';
import { Search, Bell, User, ChevronDown, Settings, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';
import { useNotifications } from '@/hooks/useNotifications';
import { useUserProfile } from '@/hooks/useUserProfile';

interface NavBarProps {
  className?: string;
}

// Helper function to format timestamp
const formatTimestamp = (timestamp: string): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} hours ago`;

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays} days ago`;

  return date.toLocaleDateString();
};

const NavBar = ({ className }: NavBarProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  // Use real data hooks
  const {
    notifications,
    unreadCount,
    loading: notificationsLoading,
    markAsRead: markNotificationAsRead,
    markAllAsRead
  } = useNotifications();

  const {
    user,
    loading: userLoading
  } = useUserProfile();

  const markAsRead = (id: string) => {
    markNotificationAsRead([id]);
  };

  const handleLogout = () => {
    toast.atsBlue({
      title: "Logged out successfully",
      description: "You have been logged out of TalentSol",
    });
    navigate('/');
  };

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
            placeholder="Search candidates, jobs..."
            className="pl-10 py-2 pr-4 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ats-blue/20 focus:border-ats-blue w-64"
          />
        </div>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5 text-gray-600 hover:text-ats-blue" />
              {unreadCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                >
                  {unreadCount}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <div className="flex items-center justify-between p-2">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={markAllAsRead}
                  className="text-xs text-ats-blue hover:text-ats-dark-blue"
                >
                  Mark all read
                </Button>
              )}
            </div>
            <DropdownMenuSeparator />
            <div className="max-h-96 overflow-y-auto">
              {notificationsLoading ? (
                <div className="p-4 text-center text-gray-500 text-sm">
                  Loading notifications...
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-4 text-center text-gray-500 text-sm">
                  No notifications
                </div>
              ) : (
                notifications.map((notification) => (
                  <DropdownMenuItem
                    key={notification.id}
                    className={cn(
                      "flex flex-col items-start p-3 cursor-pointer",
                      !notification.isRead && "bg-ats-blue/5"
                    )}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="flex items-start justify-between w-full">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm">{notification.title}</p>
                          {!notification.isRead && (
                            <div className="h-2 w-2 bg-ats-blue rounded-full" />
                          )}
                        </div>
                        <p className="text-xs text-gray-600 mt-1">{notification.message}</p>
                        <p className="text-xs text-gray-400 mt-1">{formatTimestamp(notification.createdAt)}</p>
                      </div>
                    </div>
                  </DropdownMenuItem>
                ))
              )}
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-center text-ats-blue hover:text-ats-dark-blue">
              View all notifications
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Settings Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="text-gray-600 hover:text-ats-blue">
              <Settings className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Settings</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/settings?tab=account')}>
              Account Settings
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/settings?tab=company')}>
              Company Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/settings?tab=integrations')}>
              Integration Settings
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/settings?tab=notifications')}>
              Notification Preferences
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/settings?tab=security')}>
              Privacy & Security
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/help')}>
              Help & Support
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center space-x-2 p-1 rounded-full">
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={`${user.firstName} ${user.lastName}`}
                  className="h-8 w-8 rounded-full object-cover"
                />
              ) : (
                <div className="h-8 w-8 bg-ats-blue/10 text-ats-blue rounded-full flex items-center justify-center">
                  <User className="h-4 w-4" />
                </div>
              )}
              <span className="hidden md:inline text-sm font-medium">
                {userLoading ? '...' : user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email : 'User'}
              </span>
              <ChevronDown className="h-4 w-4 text-gray-400" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/profile')}>
              Profile Page
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/settings')}>
              Settings Page
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/profile?tab=account')}>
              Account Information
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/profile?tab=security')}>
              Change Password
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/profile?tab=activity')}>
              My Activity
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/help')}>
              Help Center
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default NavBar;