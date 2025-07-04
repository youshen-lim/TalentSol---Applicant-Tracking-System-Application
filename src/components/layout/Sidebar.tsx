import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useUI } from '@/store';
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
  icon: React.ReactNode;
}

const Sidebar = ({ className }: SidebarProps) => {
  const { sidebarCollapsed, toggleSidebar } = useUI();
  const location = useLocation();
  const navigate = useNavigate();

  const navItems: NavItem[] = [
    {
      title: 'Dashboard',
      href: '/dashboard',
      icon: <Home className="h-5 w-5" />,
    },
    {
      title: 'Candidates',
      href: '/candidates',
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
        sidebarCollapsed ? "w-16" : "w-64",
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
                      {!sidebarCollapsed && <span>{item.title}</span>}
                    </Link>
                  </TooltipTrigger>
                  {sidebarCollapsed && <TooltipContent side="right">{item.title}</TooltipContent>}
                </Tooltip>
              </TooltipProvider>
            );
          })}
        </nav>

        <div className="mt-auto px-2">
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors justify-start",
                        location.pathname.startsWith('/settings')
                          ? "bg-ats-blue/10 text-ats-blue"
                          : "text-gray-600 hover:bg-ats-light-blue/10 hover:text-ats-blue"
                      )}
                    >
                      <Settings className="h-5 w-5" />
                      {!sidebarCollapsed && <span>Settings</span>}
                    </Button>
                  </TooltipTrigger>
                </DropdownMenuTrigger>
                <DropdownMenuContent align={sidebarCollapsed ? "start" : "end"} side={sidebarCollapsed ? "right" : "top"}>
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
              {sidebarCollapsed && <TooltipContent side="right">Settings</TooltipContent>}
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="self-end mb-4 mr-2 text-gray-600 hover:bg-ats-light-blue/10 hover:text-ats-blue"
        onClick={toggleSidebar}
      >
        {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </Button>
    </aside>
  );
};

export default Sidebar;