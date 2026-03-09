import { Download, Save, ChevronDown } from "lucide-react";
import { ReportPageHeader } from "../../components/PageHeader";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useState } from "react";

const data = [
  { dept: "Engineering", days: 33 },
  { dept: "Product", days: 28 },
  { dept: "Design", days: 24 },
  { dept: "Marketing", days: 21 },
  { dept: "Sales", days: 16 },
  { dept: "Cust. Success", days: 15 },
  { dept: "Finance", days: 30 },
  { dept: "HR", days: 22 },
  { dept: "Operations", days: 26 },
  { dept: "Legal", days: 36 },
];

export function TimeToHire() {
  const [viewMode, setViewMode] = useState<"visualization" | "table">("visualization");

  return (
    <div className="flex flex-col h-full">
      <ReportPageHeader
        title="Time to Hire"
        actions={
          <>
            <button className="flex items-center gap-1.5 border border-gray-200 bg-white text-gray-700 px-3 py-1.5 rounded-md text-[12px] font-medium hover:bg-gray-50 transition-colors">
              <Download size={13} />
              Export
            </button>
            <button className="flex items-center gap-1.5 bg-blue-600 text-white px-3 py-1.5 rounded-md text-[12px] font-medium hover:bg-blue-700 transition-colors">
              <Save size={13} />
              Save
            </button>
          </>
        }
      />

      <div className="flex-1 p-6 overflow-y-auto">
        {/* Filters */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-5 grid grid-cols-4 gap-4">
          {[
            { label: "Department", value: "All Departments" },
            { label: "Time Range", value: "Current Quarter" },
            { label: "Job Type", value: "All Job Types" },
            { label: "Chart Type", value: "By Department" },
          ].map((f) => (
            <div key={f.label}>
              <label className="block text-[11px] font-medium text-gray-500 mb-1.5">{f.label}</label>
              <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-md px-3 py-1.5 cursor-pointer hover:bg-gray-100 transition-colors">
                <span className="text-[12px] text-gray-700">{f.value}</span>
                <ChevronDown size={13} className="text-gray-400" />
              </div>
            </div>
          ))}
        </div>

        {/* Results */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[13px] font-semibold text-gray-900">Results</h3>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-gray-400">Last Updated: 1 day ago</span>
              <div className="flex border border-gray-200 rounded-md overflow-hidden">
                <button
                  onClick={() => setViewMode("visualization")}
                  className={`px-3 py-1 text-[11px] font-medium transition-colors ${viewMode === "visualization" ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-50"}`}
                >
                  Visualization
                </button>
                <button
                  onClick={() => setViewMode("table")}
                  className={`px-3 py-1 text-[11px] font-medium transition-colors ${viewMode === "table" ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-50"}`}
                >
                  Table
                </button>
              </div>
            </div>
          </div>

          {viewMode === "visualization" ? (
            <div>
              <p className="text-[12px] font-medium text-gray-700 text-center mb-1">Average Time to Hire by Department</p>
              <p className="text-[11px] text-gray-400 text-center mb-4">Average days from application to hire (Current Quarter)</p>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={data} margin={{ top: 10, right: 20, left: -10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="dept" tick={{ fontSize: 10, fill: "#9ca3af" }} />
                  <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} domain={[0, 40]} ticks={[0, 9, 18, 27, 36]} />
                  <Tooltip contentStyle={{ fontSize: 11 }} />
                  <Legend formatter={(v) => <span style={{ fontSize: 11 }}>{v}</span>} />
                  <Bar dataKey="days" fill="#3b82f6" radius={[3, 3, 0, 0]} name="Days" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left text-[11px] font-medium text-gray-500 pb-2">Department</th>
                  <th className="text-left text-[11px] font-medium text-gray-500 pb-2">Avg. Days</th>
                  <th className="text-left text-[11px] font-medium text-gray-500 pb-2">vs. Avg.</th>
                </tr>
              </thead>
              <tbody>
                {data.map((row) => (
                  <tr key={row.dept} className="border-b border-gray-50">
                    <td className="text-[12px] text-gray-800 py-2">{row.dept}</td>
                    <td className="text-[12px] text-gray-800 py-2">{row.days} days</td>
                    <td className={`text-[12px] py-2 ${row.days > 24.6 ? "text-red-500" : "text-green-600"}`}>
                      {row.days > 24.6 ? `+${(row.days - 24.6).toFixed(1)}` : `-${(24.6 - row.days).toFixed(1)}`} days
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { value: "24.6", label: "Overall Avg. Time to Hire (Days)" },
            { value: "32", label: "Longest Dept. Time to Hire (Engineering)" },
            { value: "15", label: "Shortest Dept. Time to Hire (Customer Success)" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white border border-gray-200 rounded-lg p-4 text-center">
              <p className="text-[26px] font-semibold text-blue-600 leading-none mb-1">{stat.value}</p>
              <p className="text-[11px] text-gray-500">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
