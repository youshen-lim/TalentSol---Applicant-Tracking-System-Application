import {
  LayoutDashboard,
  Users,
  Briefcase,
  Calendar,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
} from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

const stats = [
  {
    label: "Total Candidates",
    value: "1,284",
    change: "+12%",
    up: true,
    icon: Users,
    iconColor: "text-blue-600",
    iconBg: "bg-blue-50",
  },
  {
    label: "Open Positions",
    value: "38",
    change: "+5%",
    up: true,
    icon: Briefcase,
    iconColor: "text-green-600",
    iconBg: "bg-green-50",
  },
  {
    label: "Interviews This Week",
    value: "24",
    change: "-3%",
    up: false,
    icon: Calendar,
    iconColor: "text-purple-600",
    iconBg: "bg-purple-50",
  },
  {
    label: "Avg. Time to Hire",
    value: "24.6 days",
    change: "-2 days",
    up: true,
    icon: Clock,
    iconColor: "text-orange-600",
    iconBg: "bg-orange-50",
  },
];

const pipelineData = [
  { stage: "Applied", count: 320 },
  { stage: "Screening", count: 210 },
  { stage: "Interview 1", count: 140 },
  { stage: "Interview 2", count: 88 },
  { stage: "Offer", count: 42 },
  { stage: "Hired", count: 28 },
];

const hiringTrend = [
  { month: "Oct", hired: 18, applications: 280 },
  { month: "Nov", hired: 22, applications: 310 },
  { month: "Dec", hired: 15, applications: 240 },
  { month: "Jan", hired: 28, applications: 350 },
  { month: "Feb", hired: 24, applications: 320 },
  { month: "Mar", hired: 31, applications: 390 },
];

const recentActivity = [
  { type: "hired", candidate: "Alex Johnson", role: "Senior Developer", time: "2 hours ago", icon: CheckCircle, color: "text-green-500" },
  { type: "rejected", candidate: "Maria Garcia", role: "Product Designer", time: "4 hours ago", icon: XCircle, color: "text-red-400" },
  { type: "interview", candidate: "James Wilson", role: "Marketing Manager", time: "Yesterday", icon: Calendar, color: "text-blue-500" },
  { type: "hired", candidate: "Emily Chen", role: "Data Analyst", time: "Yesterday", icon: CheckCircle, color: "text-green-500" },
  { type: "interview", candidate: "Robert Brown", role: "UX Researcher", time: "2 days ago", icon: Calendar, color: "text-blue-500" },
];

const upcomingInterviews = [
  { candidate: "Sarah Miller", role: "Frontend Engineer", time: "Today, 2:00 PM", avatar: "SM" },
  { candidate: "David Park", role: "Backend Developer", time: "Today, 4:30 PM", avatar: "DP" },
  { candidate: "Lisa Turner", role: "Product Manager", time: "Tomorrow, 10:00 AM", avatar: "LT" },
  { candidate: "Mark Anderson", role: "DevOps Engineer", time: "Tomorrow, 1:00 PM", avatar: "MA" },
];

export function Dashboard() {
  return (
    <div className="flex flex-col h-full">
      <PageHeader
        icon={LayoutDashboard}
        title="Dashboard"
        subtitle="Overview of your recruiting pipeline and key hiring metrics"
        actions={
          <button className="flex items-center gap-1.5 bg-gray-900 text-white px-3 py-1.5 rounded-md text-[12px] font-medium hover:bg-gray-800 transition-colors">
            <Plus size={13} />
            Add Job Opening
          </button>
        }
      />

      <div className="flex-1 p-6 overflow-y-auto">
        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-8 h-8 rounded-md ${stat.iconBg} flex items-center justify-center`}>
                    <Icon size={16} className={stat.iconColor} />
                  </div>
                  <div className={`flex items-center gap-1 text-[11px] font-medium ${stat.up ? "text-green-600" : "text-red-500"}`}>
                    {stat.up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                    {stat.change}
                  </div>
                </div>
                <p className="text-[22px] font-semibold text-gray-900 leading-none mb-1">{stat.value}</p>
                <p className="text-[11px] text-gray-500">{stat.label}</p>
              </div>
            );
          })}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Pipeline */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-[13px] font-semibold text-gray-900">Hiring Pipeline</h3>
                <p className="text-[11px] text-gray-500">Candidates by stage</p>
              </div>
              <TrendingUp size={15} className="text-gray-400" />
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={pipelineData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="stage" tick={{ fontSize: 10, fill: "#9ca3af" }} />
                <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} />
                <Tooltip contentStyle={{ fontSize: 11 }} />
                <Bar dataKey="count" fill="#3b82f6" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Hiring Trend */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-[13px] font-semibold text-gray-900">Hiring Trend</h3>
                <p className="text-[11px] text-gray-500">Applications vs. hires (last 6 months)</p>
              </div>
              <TrendingUp size={15} className="text-gray-400" />
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={hiringTrend} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#9ca3af" }} />
                <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} />
                <Tooltip contentStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="applications" stroke="#93c5fd" strokeWidth={2} dot={false} name="Applications" />
                <Line type="monotone" dataKey="hired" stroke="#2563eb" strokeWidth={2} dot={false} name="Hired" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-2 gap-4">
          {/* Recent Activity */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="text-[13px] font-semibold text-gray-900 mb-3">Recent Activity</h3>
            <div className="space-y-3">
              {recentActivity.map((activity, i) => {
                const Icon = activity.icon;
                return (
                  <div key={i} className="flex items-start gap-3">
                    <Icon size={14} className={`${activity.color} mt-0.5 shrink-0`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] text-gray-800">
                        <span className="font-medium">{activity.candidate}</span>
                        <span className="text-gray-500"> — {activity.role}</span>
                      </p>
                      <p className="text-[11px] text-gray-400">{activity.time}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Upcoming Interviews */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="text-[13px] font-semibold text-gray-900 mb-3">Upcoming Interviews</h3>
            <div className="space-y-3">
              {upcomingInterviews.map((interview, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                    <span className="text-[9px] font-semibold text-blue-700">{interview.avatar}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-medium text-gray-800 truncate">{interview.candidate}</p>
                    <p className="text-[11px] text-gray-500 truncate">{interview.role}</p>
                  </div>
                  <span className="text-[11px] text-gray-400 shrink-0">{interview.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
