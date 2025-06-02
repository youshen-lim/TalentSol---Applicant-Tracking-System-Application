import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  BarChart2,
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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface SidebarProps {
  className?: string;
}

interface NavItem {
  title: string;
  href: string;
  icon: React.ReactNode;
}

const Sidebar = ({ className }: SidebarProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  const navItems: NavItem[] = [
    {
      title: 'Dashboard',
      href: '/dashboard',
      icon: <Home className="h-5 w-5" />,
    },
    {
      title: 'Candidates',
      href: '/candidates/pipeline',
      icon: <Users className="h-5 w-5" />,
    },
    {
      title: 'Jobs',
      href: '/jobs',
      icon: <Briefcase className="h-5 w-5" />,
    },
    {
      title: 'Applications',
      href: '/applications',
      icon: <FileText className="h-5 w-5" />,
    },
    {
      title: 'Interviews',
      href: '/interviews',
      icon: <Calendar className="h-5 w-5" />,
    },
    {
      title: 'Analytics',
      href: '/analytics',
      icon: <BarChart2 className="h-5 w-5" />,
    },
    {
      title: 'Messages',
      href: '/messages',
      icon: <MessageSquare className="h-5 w-5" />,
    },
    {
      title: 'Documents',
      href: '/documents',
      icon: <Folder className="h-5 w-5" />,
    },
  ];

  return (
    <aside
      className={cn(
        "bg-white border-r border-ats-border-gray flex flex-col h-[calc(100vh-4rem)] sticky top-16 transition-all duration-300",
        collapsed ? "w-16" : "w-64",
        className
      )}
    >
      <div className="flex flex-col flex-1 py-4">
        <nav className="space-y-1 px-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href || location.pathname.startsWith(`${item.href}/`);

            return (
              <TooltipProvider key={item.href} delayDuration={0}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link
                      to={item.href}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                        isActive
                          ? "bg-ats-blue/10 text-ats-blue"
                          : "text-gray-600 hover:bg-ats-light-blue/10 hover:text-ats-blue"
                      )}
                    >
                      {item.icon}
                      {!collapsed && <span>{item.title}</span>}
                    </Link>
                  </TooltipTrigger>
                  {collapsed && <TooltipContent side="right">{item.title}</TooltipContent>}
                </Tooltip>
              </TooltipProvider>
            );
          })}
        </nav>

        <div className="mt-auto px-2">
          <Link
            to="/dashboard" /* Temporarily point to dashboard */
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
              location.pathname === '/settings'
                ? "bg-ats-blue/10 text-ats-blue"
                : "text-gray-600 hover:bg-ats-light-blue/10 hover:text-ats-blue"
            )}
          >
            <Settings className="h-5 w-5" />
            {!collapsed && <span>Settings</span>}
          </Link>
        </div>
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="self-end mb-4 mr-2 text-gray-600 hover:bg-ats-light-blue/10 hover:text-ats-blue"
        onClick={() => setCollapsed(!collapsed)}
      >
        {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </Button>
    </aside>
  );
};

export default Sidebar;