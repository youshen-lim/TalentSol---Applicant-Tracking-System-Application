import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useUI } from '@/store';
import {
  BarChart3,
  Briefcase,
  Calendar,
  ChevronLeft,
  ChevronRight,
  FileText,
  Folder,
  Home,
  MessageSquare,
  Settings,
  Users,
  Zap,
  TrendingUp,
  Clock,
  GitBranch,
  LayoutDashboard,
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface SidebarProps {
  className?: string;
}

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
}

interface AnalyticsSubItem {
  title: string;
  href: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  { title: 'Dashboard',    href: '/dashboard',    icon: Home },
  { title: 'Candidates',   href: '/candidates',   icon: Users },
  { title: 'Jobs',         href: '/jobs',         icon: Briefcase },
  { title: 'Applications', href: '/applications', icon: FileText },
  { title: 'Interviews',   href: '/interviews',   icon: Calendar },
  { title: 'Messages',     href: '/messages',     icon: MessageSquare },
  { title: 'Documents',    href: '/documents',    icon: Folder },
];

const analyticsSubItems: AnalyticsSubItem[] = [
  { title: 'Source Effectiveness', href: '/analytics/reports/source-effectiveness', icon: TrendingUp },
  { title: 'Time to Hire',         href: '/analytics/reports/time-to-hire',         icon: Clock },
  { title: 'Pipeline Metrics',     href: '/analytics/reports/pipeline-metrics',     icon: GitBranch },
  { title: 'Report Builder',       href: '/analytics',                              icon: LayoutDashboard },
];

const Sidebar = ({ className }: SidebarProps) => {
  const { sidebarCollapsed, toggleSidebar } = useUI();
  const location = useLocation();
  const navigate = useNavigate();

  const isAnalyticsActive = location.pathname.startsWith('/analytics');

  return (
    <aside
      className={cn(
        'relative flex flex-col bg-sidebar border-r border-sidebar-border shrink-0 h-full transition-all duration-300 z-20',
        sidebarCollapsed ? 'w-16' : 'w-56',
        className
      )}
    >
      {/* Logo */}
      <div
        className={cn(
          'flex items-center gap-2.5 px-4 border-b border-sidebar-border',
          sidebarCollapsed ? 'justify-center py-4 min-h-14' : 'py-4 min-h-14'
        )}
      >
        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shrink-0">
          <Zap size={16} className="text-white" />
        </div>
        {!sidebarCollapsed && (
          <div className="overflow-hidden">
            <p className="text-sidebar-foreground leading-none" style={{ fontWeight: 700, fontSize: 14 }}>
              TalentSol
            </p>
            <p style={{ fontSize: 10, color: 'var(--color-muted-foreground)', fontWeight: 400 }}>
              Applicant Tracking System
            </p>
          </div>
        )}
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive =
            location.pathname === item.href ||
            location.pathname.startsWith(`${item.href}/`);

          return (
            <Tooltip key={item.href}>
              <TooltipTrigger asChild>
                <Link
                  to={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 group',
                    sidebarCollapsed && 'justify-center',
                    isActive
                      ? 'bg-accent text-primary'
                      : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground'
                  )}
                  style={{ fontSize: 13, fontWeight: isActive ? 600 : 500 }}
                >
                  <item.icon
                    size={18}
                    className={cn(
                      'shrink-0',
                      isActive ? 'text-primary' : 'text-sidebar-foreground/50 group-hover:text-sidebar-foreground'
                    )}
                  />
                  {!sidebarCollapsed && (
                    <span className="truncate flex-1">{item.title}</span>
                  )}
                  {isActive && !sidebarCollapsed && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                  )}
                </Link>
              </TooltipTrigger>
              {sidebarCollapsed && (
                <TooltipContent side="right">{item.title}</TooltipContent>
              )}
            </Tooltip>
          );
        })}

        {/* Analytics — with collapsible sub-nav */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              to="/analytics"
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 group',
                sidebarCollapsed && 'justify-center',
                isAnalyticsActive
                  ? 'bg-accent text-primary'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground'
              )}
              style={{ fontSize: 13, fontWeight: isAnalyticsActive ? 600 : 500 }}
            >
              <BarChart3
                size={18}
                className={cn(
                  'shrink-0',
                  isAnalyticsActive ? 'text-primary' : 'text-sidebar-foreground/50 group-hover:text-sidebar-foreground'
                )}
              />
              {!sidebarCollapsed && (
                <span className="truncate flex-1">Analytics</span>
              )}
              {isAnalyticsActive && !sidebarCollapsed && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
              )}
            </Link>
          </TooltipTrigger>
          {sidebarCollapsed && (
            <TooltipContent side="right">Analytics</TooltipContent>
          )}
        </Tooltip>

        {/* Analytics sub-items — visible when on any /analytics route */}
        {isAnalyticsActive && !sidebarCollapsed && (
          <div className="ml-4 pl-3 border-l border-sidebar-border space-y-0.5">
            {analyticsSubItems.map((sub) => {
              const isSubActive = location.pathname === sub.href || location.pathname.startsWith(`${sub.href}/`);
              return (
                <Link
                  key={sub.href}
                  to={sub.href}
                  className={cn(
                    'flex items-center gap-2.5 px-2.5 py-2 rounded-lg transition-all duration-150 group',
                    isSubActive
                      ? 'bg-accent text-primary'
                      : 'text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground'
                  )}
                  style={{ fontSize: 12, fontWeight: isSubActive ? 600 : 500 }}
                >
                  <sub.icon
                    size={14}
                    className={cn(
                      'shrink-0',
                      isSubActive ? 'text-primary' : 'text-sidebar-foreground/40 group-hover:text-sidebar-foreground'
                    )}
                  />
                  <span className="truncate">{sub.title}</span>
                </Link>
              );
            })}
          </div>
        )}
      </nav>

      {/* Settings at bottom */}
      <div className="px-2 pb-4 border-t border-sidebar-border pt-2">
        <Tooltip>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <TooltipTrigger asChild>
                <button
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 group',
                    sidebarCollapsed && 'justify-center',
                    location.pathname.startsWith('/settings')
                      ? 'bg-accent text-primary'
                      : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground'
                  )}
                  style={{ fontSize: 13, fontWeight: 500 }}
                >
                  <Settings
                    size={18}
                    className={cn(
                      'shrink-0',
                      location.pathname.startsWith('/settings')
                        ? 'text-primary'
                        : 'text-sidebar-foreground/50 group-hover:text-sidebar-foreground'
                    )}
                  />
                  {!sidebarCollapsed && <span>Settings</span>}
                </button>
              </TooltipTrigger>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align={sidebarCollapsed ? 'start' : 'end'}
              side={sidebarCollapsed ? 'right' : 'top'}
            >
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
          {sidebarCollapsed && (
            <TooltipContent side="right">Settings</TooltipContent>
          )}
        </Tooltip>
      </div>

      {/* Floating collapse toggle */}
      <button
        onClick={toggleSidebar}
        className="absolute -right-3 top-16 w-6 h-6 bg-sidebar border border-sidebar-border rounded-full flex items-center justify-center shadow-sm hover:bg-sidebar-accent transition-all z-10"
      >
        {sidebarCollapsed ? (
          <ChevronRight size={12} className="text-sidebar-foreground/60" />
        ) : (
          <ChevronLeft size={12} className="text-sidebar-foreground/60" />
        )}
      </button>
    </aside>
  );
};

export default Sidebar;
