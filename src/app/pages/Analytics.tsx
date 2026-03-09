import { BarChart2, TrendingUp, Clock, Target, Users } from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { useNavigate } from "react-router";
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
  Legend,
} from "recharts";

const sourceData = [
  { source: "Career Site", candidates: 145 },
  { source: "LinkedIn", candidates: 120 },
  { source: "Job Board", candidates: 95 },
  { source: "Glassdoor", candidates: 65 },
  { source: "Direct Sourcing", candidates: 61 },
  { source: "Referrals", candidates: 55 },
  { source: "Agencies", candidates: 40 },
  { source: "Events", candidates: 10 },
];

const timeToHireData = [
  { dept: "Engineering", days: 33 },
  { dept: "Product", days: 28 },
  { dept: "Design", days: 24 },
  { dept: "Marketing", days: 21 },
  { dept: "Sales", dept_short: "Sales", days: 16 },
  { dept: "Cust. Success", days: 15 },
  { dept: "Finance", days: 30 },
  { dept: "HR", days: 22 },
];

const reports = [
  { title: "Source Effectiveness", icon: Target, desc: "Analyze which sources bring the best candidates", path: "/analytics/source-effectiveness", color: "text-blue-600", bg: "bg-blue-50" },
  { title: "Time to Hire", icon: Clock, desc: "Track time-to-fill across departments and roles", path: "/analytics/time-to-hire", color: "text-purple-600", bg: "bg-purple-50" },
  { title: "Pipeline Metrics", icon: TrendingUp, desc: "Monitor candidate progression through stages", path: "/analytics/pipeline-metrics", color: "text-green-600", bg: "bg-green-50" },
  { title: "Report Builder", icon: BarChart2, desc: "Create custom reports with your own parameters", path: "/analytics/report-builder", color: "text-orange-600", bg: "bg-orange-50" },
];

export function Analytics() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        icon={BarChart2}
        iconColor="text-indigo-600"
        iconBg="bg-indigo-50"
        title="Analytics"
        subtitle="Gain insights into your hiring performance with data-driven reports"
      />

      <div className="flex-1 p-6 overflow-y-auto">
        {/* KPIs */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: "Total Candidates", value: "635", sub: "this quarter", icon: Users },
            { label: "Avg. Time to Hire", value: "24.6 days", sub: "overall average", icon: Clock },
            { label: "Offer Acceptance Rate", value: "18%", sub: "current quarter", icon: Target },
            { label: "Best Conversion Rate", value: "25.5%", sub: "via Referrals", icon: TrendingUp },
          ].map((kpi) => {
            const Icon = kpi.icon;
            return (
              <div key={kpi.label} className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Icon size={14} className="text-gray-400" />
                  <span className="text-[11px] text-gray-500">{kpi.label}</span>
                </div>
                <p className="text-[22px] font-semibold text-gray-900 leading-none">{kpi.value}</p>
                <p className="text-[11px] text-gray-400 mt-1">{kpi.sub}</p>
              </div>
            );
          })}
        </div>

        {/* Report Cards */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {reports.map((report) => {
            const Icon = report.icon;
            return (
              <button
                key={report.title}
                onClick={() => navigate(report.path)}
                className="bg-white border border-gray-200 rounded-lg p-4 text-left hover:border-blue-300 hover:shadow-sm transition-all"
              >
                <div className={`w-8 h-8 ${report.bg} rounded-md flex items-center justify-center mb-3`}>
                  <Icon size={16} className={report.color} />
                </div>
                <p className="text-[12px] font-semibold text-gray-900">{report.title}</p>
                <p className="text-[11px] text-gray-500 mt-1 leading-snug">{report.desc}</p>
                <p className={`text-[11px] ${report.color} mt-2 font-medium`}>View Report →</p>
              </button>
            );
          })}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="text-[13px] font-semibold text-gray-900 mb-1">Candidate Volume by Source</h3>
            <p className="text-[11px] text-gray-400 mb-4">Number of candidates from each source (Current Quarter)</p>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={sourceData} margin={{ top: 0, right: 0, left: -20, bottom: 30 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="source" tick={{ fontSize: 9, fill: "#9ca3af" }} angle={-30} textAnchor="end" />
                <YAxis tick={{ fontSize: 9, fill: "#9ca3af" }} />
                <Tooltip contentStyle={{ fontSize: 11 }} />
                <Bar dataKey="candidates" fill="#3b82f6" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="text-[13px] font-semibold text-gray-900 mb-1">Avg. Time to Hire by Department</h3>
            <p className="text-[11px] text-gray-400 mb-4">Average days from application to hire (Current Quarter)</p>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={timeToHireData} margin={{ top: 0, right: 0, left: -20, bottom: 30 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="dept" tick={{ fontSize: 9, fill: "#9ca3af" }} angle={-30} textAnchor="end" />
                <YAxis tick={{ fontSize: 9, fill: "#9ca3af" }} />
                <Tooltip contentStyle={{ fontSize: 11 }} />
                <Bar dataKey="days" fill="#3b82f6" radius={[3, 3, 0, 0]} name="Days" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
