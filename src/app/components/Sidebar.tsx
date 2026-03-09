import { useState } from "react";
import { NavLink, useLocation } from "react-router";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  FileText,
  Calendar,
  BarChart2,
  MessageSquare,
  Folder,
  Settings,
  ChevronDown,
  ChevronRight,
  Zap,
  TrendingUp,
  Clock,
  GitBranch,
} from "lucide-react";

const navItems = [
  { label: "Dashboard",    icon: LayoutDashboard, path: "/dashboard" },
  { label: "Candidates",   icon: Users,            path: "/candidates" },
  { label: "Jobs",         icon: Briefcase,        path: "/jobs" },
  { label: "Applications", icon: FileText,         path: "/applications" },
  { label: "Interviews",   icon: Calendar,         path: "/interviews" },
  {
    label: "Analytics",
    icon: BarChart2,
    path: "/analytics",
    children: [
      { label: "Source Effectiveness", icon: TrendingUp,  path: "/analytics/source-effectiveness" },
      { label: "Time to Hire",         icon: Clock,       path: "/analytics/time-to-hire" },
      { label: "Pipeline Metrics",     icon: GitBranch,   path: "/analytics/pipeline-metrics" },
      { label: "Report Builder",       icon: LayoutDashboard, path: "/analytics/reports" },
    ],
  },
  { label: "Messages",  icon: MessageSquare, path: "/messages" },
  { label: "Documents", icon: Folder,        path: "/documents" },
];

export function Sidebar() {
  const location = useLocation();
  const isAnalyticsActive = location.pathname.startsWith("/analytics");
  const [analyticsOpen, setAnalyticsOpen] = useState(isAnalyticsActive);

  return (
    <aside className="w-56 bg-white border-r border-gray-200 flex flex-col shrink-0">
      {/* Logo */}
      <div className="h-14 flex items-center gap-2.5 px-4 border-b border-gray-100 shrink-0">
        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shrink-0">
          <Zap size={16} className="text-white" />
        </div>
        <div className="min-w-0">
          <p className="text-indigo-600" style={{ fontSize: 14, fontWeight: 700, lineHeight: 1.2 }}>TalentSol</p>
          <p className="text-gray-400" style={{ fontSize: 10, lineHeight: 1.2 }}>Applicant Tracking System</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 px-2 overflow-y-auto space-y-0.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.children
            ? location.pathname.startsWith(item.path)
            : location.pathname === item.path;

          if (item.children) {
            return (
              <div key={item.label}>
                <button
                  onClick={() => setAnalyticsOpen(!analyticsOpen)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                    isActive
                      ? "bg-indigo-50 text-indigo-700"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <Icon size={18} className="shrink-0" />
                  <span className="flex-1 truncate" style={{ fontSize: 13, fontWeight: isActive ? 600 : 500 }}>{item.label}</span>
                  {analyticsOpen ? <ChevronDown size={13} className="shrink-0" /> : <ChevronRight size={13} className="shrink-0" />}
                </button>
                {analyticsOpen && (
                  <div className="mt-0.5 ml-2 pl-7 space-y-0.5 border-l border-gray-100">
                    {item.children.map((child) => (
                      <NavLink
                        key={child.path}
                        to={child.path}
                        className={({ isActive }) =>
                          `flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                            isActive
                              ? "text-indigo-600 bg-indigo-50"
                              : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
                          }`
                        }
                      >
                        <span style={{ fontSize: 12, fontWeight: 500 }}>{child.label}</span>
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                isActive
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <Icon size={18} className="shrink-0" />
              <span className="truncate" style={{ fontSize: 13, fontWeight: isActive ? 600 : 500 }}>{item.label}</span>
              {isActive && <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 ml-auto shrink-0" />}
            </NavLink>
          );
        })}
      </nav>

      {/* Settings */}
      <div className="border-t border-gray-100 px-2 py-3">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
              isActive
                ? "bg-indigo-50 text-indigo-700"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }`
          }
        >
          <Settings size={18} className="shrink-0" />
          <span style={{ fontSize: 13, fontWeight: 500 }}>Settings</span>
        </NavLink>
      </div>
    </aside>
  );
}
