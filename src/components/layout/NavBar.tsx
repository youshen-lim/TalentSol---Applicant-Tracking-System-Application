import React from 'react';
import { Search, Bell, ChevronRight, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
    <header
      className={cn(
        'h-14 bg-white border-b flex items-center px-6 gap-4 shrink-0 z-10',
        className
      )}
      style={{ borderColor: 'var(--color-border)' }}
    >
      {/* Search — left side, flex-1 */}
      <div className="flex-1 max-w-md hidden md:block">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search candidates, jobs..."
            className="w-full pl-9 pr-4 py-2 bg-input-background border border-sidebar-border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 text-foreground placeholder:text-muted-foreground"
            style={{ fontSize: 13 }}
          />
        </div>
      </div>

      {/* Right side — Notifications, Settings, User */}
      <div className="flex items-center gap-2 ml-auto">
        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="relative w-9 h-9 rounded-lg hover:bg-muted flex items-center justify-center transition-all">
              <Bell size={18} className="text-muted-foreground" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full" />
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <div className="flex items-center justify-between p-2">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={markAllAsRead}
                  className="text-xs text-indigo-600 hover:text-indigo-500"
                >
                  Mark all read
                </Button>
              )}
            </div>
            <DropdownMenuSeparator />
            <div className="max-h-96 overflow-y-auto">
              {notificationsLoading ? (
                <div className="p-4 text-center text-muted-foreground text-sm">
                  Loading notifications...
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground text-sm">
                  No notifications
                </div>
              ) : (
                notifications.map((notification) => (
                  <DropdownMenuItem
                    key={notification.id}
                    className={cn(
                      "flex flex-col items-start p-3 cursor-pointer",
                      !notification.isRead && "bg-indigo-50/50"
                    )}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="flex items-start justify-between w-full">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm">{notification.title}</p>
                          {!notification.isRead && (
                            <div className="h-2 w-2 bg-indigo-600 rounded-full" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{notification.message}</p>
                        <p className="text-xs text-muted-foreground/70 mt-1">{formatTimestamp(notification.createdAt)}</p>
                      </div>
                    </div>
                  </DropdownMenuItem>
                ))
              )}
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-center text-indigo-600 hover:text-indigo-500">
              View all notifications
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Settings Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="w-9 h-9 rounded-lg hover:bg-muted flex items-center justify-center transition-all">
              <Settings size={18} className="text-muted-foreground" />
            </button>
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
            <button className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-lg hover:bg-muted transition-all">
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={`${user.firstName} ${user.lastName}`}
                  className="w-7 h-7 rounded-full object-cover"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center">
                  <span style={{ fontSize: 11, fontWeight: 700 }} className="text-white">
                    {user
                      ? `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}` || 'U'
                      : 'U'}
                  </span>
                </div>
              )}
              <span className="hidden md:inline text-foreground" style={{ fontSize: 13, fontWeight: 500 }}>
                {userLoading ? '...' : user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email : 'User'}
              </span>
              <ChevronRight size={13} className="text-muted-foreground" />
            </button>
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
