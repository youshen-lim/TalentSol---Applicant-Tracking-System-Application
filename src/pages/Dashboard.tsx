import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowUpRight,
  Users,
  Briefcase,
  Clock,
  Calendar,
  Plus,
  TrendingUp,
  TrendingDown,
  Maximize2,
  LayoutDashboard,
} from "lucide-react";
import LineChart from "@/components/dashboard/LineChart";
import BarChart from "@/components/dashboard/BarChart";
import LoadingUI from "@/components/ui/loading";

// API hooks for real data
import { useDashboardStats, useRecruitmentData } from "@/hooks/useAnalytics";
import { useUpcomingInterviews } from "@/hooks/useInterviews";
import { useCandidatePipeline } from "@/hooks/useCandidates";

// ─── Local stat card matching Figma Make visual ───────────────────────────────
interface FmStatCardProps {
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  title: string;
  value: string;
  change?: { value: number; positive: boolean };
  subtitle?: string;
}

function FmStatCard({ icon: Icon, iconBg, iconColor, title, value, change, subtitle }: FmStatCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-lg ${iconBg} flex items-center justify-center shrink-0`}>
          <Icon size={18} className={iconColor} />
        </div>
        {change && (
          <span
            className={`flex items-center gap-0.5 ${change.positive ? "text-emerald-600" : "text-red-500"}`}
            style={{ fontSize: 12, fontWeight: 600 }}
          >
            {change.positive ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
            {change.positive ? "+" : ""}{change.value}%
          </span>
        )}
      </div>
      <p className="text-gray-900 mt-0.5" style={{ fontSize: 24, fontWeight: 700 }}>{value}</p>
      <p className="text-gray-500 mt-1" style={{ fontSize: 12, fontWeight: 500 }}>{title}</p>
    </div>
  );
}

// ─── Initials avatar helper ────────────────────────────────────────────────────
function InitialsAvatar({ name, bg, text }: { name: string; bg: string; text: string }) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  return (
    <div className={`w-8 h-8 rounded-full ${bg} flex items-center justify-center shrink-0`}>
      <span style={{ fontSize: 11, fontWeight: 700 }} className={text}>
        {initials}
      </span>
    </div>
  );
}

// ─── Dashboard ─────────────────────────────────────────────────────────────────
const Dashboard = () => {
  const navigate = useNavigate();

  // Real data hooks
  const { stats: dashboardStats, loading: statsLoading } = useDashboardStats();
  const { data: recruitmentData, loading: recruitmentLoading } = useRecruitmentData();
  const { pipeline: candidatePipeline, loading: pipelineLoading } = useCandidatePipeline();
  const { interviews: upcomingInterviews, loading: interviewsLoading } = useUpcomingInterviews();

  const recentApplications = dashboardStats?.recentApplications || [];

  return (
    <div className="p-6 space-y-6">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
            <LayoutDashboard size={16} className="text-indigo-600" />
          </div>
          <div>
            <h1 className="text-gray-900" style={{ fontSize: 20, fontWeight: 600 }}>Dashboard</h1>
            <p className="text-gray-500 mt-0.5" style={{ fontSize: 13 }}>
              Overview of your recruiting pipeline and key hiring metrics
            </p>
          </div>
        </div>
        <button
          onClick={() => navigate("/jobs/new")}
          className="flex items-center gap-2 px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg transition-all"
        >
          <Plus size={15} />
          <span style={{ fontSize: 13, fontWeight: 500 }}>Add Job Opening</span>
        </button>
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <FmStatCard
          icon={Users}
          iconBg="bg-indigo-50"
          iconColor="text-indigo-600"
          title="Total Candidates"
          value={statsLoading ? "…" : (dashboardStats?.summary?.totalCandidates?.toString() ?? "0")}
          change={
            dashboardStats?.changeMetrics?.totalCandidates
              ? { value: Math.abs(dashboardStats.changeMetrics.totalCandidates.change), positive: dashboardStats.changeMetrics.totalCandidates.change >= 0 }
              : undefined
          }
          subtitle="Last 30 days"
        />
        <FmStatCard
          icon={Briefcase}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-600"
          title="Open Positions"
          value={statsLoading ? "…" : (dashboardStats?.summary?.activeJobs?.toString() ?? "0")}
          change={
            dashboardStats?.changeMetrics?.activeJobs
              ? { value: Math.abs(dashboardStats.changeMetrics.activeJobs.change), positive: dashboardStats.changeMetrics.activeJobs.change >= 0 }
              : undefined
          }
          subtitle="Active job postings"
        />
        <FmStatCard
          icon={Calendar}
          iconBg="bg-purple-50"
          iconColor="text-purple-600"
          title="Interviews This Week"
          value={interviewsLoading ? "…" : (upcomingInterviews?.length?.toString() ?? "0")}
          change={
            dashboardStats?.changeMetrics?.totalCandidates
              ? { value: 3, positive: false }
              : undefined
          }
        />
        <FmStatCard
          icon={Clock}
          iconBg="bg-amber-50"
          iconColor="text-amber-600"
          title="Avg. Time to Hire"
          value={statsLoading ? "…" : (dashboardStats?.timeToHire?.averageDays ? `${dashboardStats.timeToHire.averageDays} days` : "0 days")}
          change={
            dashboardStats?.changeMetrics?.timeToHire
              ? { value: Math.abs(dashboardStats.changeMetrics.timeToHire.change), positive: dashboardStats.changeMetrics.timeToHire.change <= 0 }
              : undefined
          }
        />
      </div>

      {/* ── Charts ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Hiring Pipeline — bar chart by source/stage */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-gray-900" style={{ fontSize: 14, fontWeight: 600 }}>Hiring Pipeline</h3>
              <p className="text-gray-400 mt-0.5" style={{ fontSize: 12 }}>Candidates by stage</p>
            </div>
            <button className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-all text-gray-400 hover:text-gray-600">
              <Maximize2 size={14} />
            </button>
          </div>
          {pipelineLoading ? (
            <div className="h-[220px] flex items-center justify-center">
              <LoadingUI message="Loading pipeline data..." />
            </div>
          ) : candidatePipeline?.stages && candidatePipeline.stages.length > 0 ? (
            <BarChart
              title=""
              description=""
              data={candidatePipeline.stages.map((s) => ({ name: s.name, value: s.candidates.length }))}
              bars={[{ dataKey: "value", fill: "#4F46E5", name: "Candidates" }]}
              vertical={true}
              height={220}
              valueFormatter={(v) => `${v}`}
              showTooltip={true}
              showLegend={false}
            />
          ) : (
            <div className="h-[220px] flex items-center justify-center text-muted-foreground text-sm">
              No pipeline data available
            </div>
          )}
        </div>

        {/* Hiring Trend — line chart over time */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-gray-900" style={{ fontSize: 14, fontWeight: 600 }}>Hiring Trend</h3>
              <p className="text-gray-400 mt-0.5" style={{ fontSize: 12 }}>Applications vs. hires (last 6 months)</p>
            </div>
            <button className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-all text-gray-400 hover:text-gray-600">
              <Maximize2 size={14} />
            </button>
          </div>
          {recruitmentLoading ? (
            <div className="h-[220px] flex items-center justify-center">
              <LoadingUI message="Loading trend data..." />
            </div>
          ) : recruitmentData?.data && recruitmentData.data.length > 0 ? (
            <LineChart
              title=""
              description=""
              data={recruitmentData.data.map((item) => ({
                ...item,
                name: new Date(item.date).toLocaleDateString("en-US", { month: "short" }),
              }))}
              lines={[
                { dataKey: "applications", stroke: "#4F46E5", name: "Applications" },
                { dataKey: "offers", stroke: "#10B981", name: "Hires" },
              ]}
              height={220}
              showDots={false}
              showGrid={true}
              showTooltip={true}
              showLegend={false}
              valueFormatter={(v) => v.toString()}
              dateFormatter={(d) => d}
            />
          ) : (
            <div className="h-[220px] flex items-center justify-center text-muted-foreground text-sm">
              No trend data available
            </div>
          )}
        </div>
      </div>

      {/* ── Bottom cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Recent Activity */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-900" style={{ fontSize: 14, fontWeight: 600 }}>Recent Activity</h3>
          </div>
          <div className="space-y-3">
            {statsLoading ? (
              <p className="text-gray-500 text-center py-6" style={{ fontSize: 13 }}>Loading…</p>
            ) : recentApplications.length > 0 ? (
              recentApplications.slice(0, 5).map((application, i) => (
                <div key={application.candidateId} className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${i % 3 === 0 ? "bg-emerald-100" : i % 3 === 1 ? "bg-red-100" : "bg-gray-100"}`}>
                    {i % 3 === 0 ? (
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="5" stroke="#10B981" strokeWidth="1.5"/><path d="M3.5 6l1.8 1.8 3-3.6" stroke="#10B981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    ) : i % 3 === 1 ? (
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="5" stroke="#EF4444" strokeWidth="1.5"/><path d="M4 4l4 4M8 4l-4 4" stroke="#EF4444" strokeWidth="1.5" strokeLinecap="round"/></svg>
                    ) : (
                      <Calendar size={10} className="text-gray-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-900 truncate" style={{ fontSize: 13, fontWeight: 600 }}>
                      {application.candidateName}
                      <span className="text-gray-500 font-normal"> — {application.jobTitle}</span>
                    </p>
                    <p className="text-gray-500" style={{ fontSize: 11 }}>
                      {new Date(application.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-6" style={{ fontSize: 13 }}>No recent activity</p>
            )}
          </div>
        </div>

        {/* Upcoming Interviews */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-900" style={{ fontSize: 14, fontWeight: 600 }}>Upcoming Interviews</h3>
          </div>
          <div className="space-y-3">
            {interviewsLoading ? (
              <LoadingUI message="Loading interviews..." />
            ) : upcomingInterviews && upcomingInterviews.length > 0 ? (
              upcomingInterviews.slice(0, 5).map((interview) => {
                const d = new Date(interview.dateTime);
                const isToday = d.toDateString() === new Date().toDateString();
                const timeLabel = isToday ? "Today" : "Tomorrow";
                const timeStr = d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
                const avatarColors = ["bg-indigo-100 text-indigo-700", "bg-violet-100 text-violet-700", "bg-amber-100 text-amber-700", "bg-cyan-100 text-cyan-700", "bg-emerald-100 text-emerald-700"];
                const colorIdx = interview.candidateName.charCodeAt(0) % avatarColors.length;
                const ini = interview.candidateName.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase();
                return (
                  <div key={interview.id} className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full ${avatarColors[colorIdx]} flex items-center justify-center shrink-0`}>
                      <span style={{ fontSize: 11, fontWeight: 700 }}>{ini}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-900 truncate" style={{ fontSize: 13, fontWeight: 600 }}>
                        {interview.candidateName}
                      </p>
                      <p className="text-gray-500 truncate" style={{ fontSize: 11 }}>
                        {interview.position}
                      </p>
                    </div>
                    <span className="text-gray-500 shrink-0" style={{ fontSize: 11 }}>
                      {timeLabel}, {timeStr}
                    </span>
                  </div>
                );
              })
            ) : (
              <p className="text-gray-500 text-center py-6" style={{ fontSize: 13 }}>No upcoming interviews</p>
            )}
          </div>
          <button
            onClick={() => navigate("/interviews")}
            className="mt-4 flex items-center gap-1 text-indigo-600 hover:text-indigo-700 transition-colors"
            style={{ fontSize: 12, fontWeight: 500 }}
          >
            View all interviews <ArrowUpRight size={13} />
          </button>
        </div>
      </div>

    </div>
  );
};

export default Dashboard;
