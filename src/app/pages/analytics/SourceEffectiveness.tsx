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
  { source: "Career Site", candidates: 145 },
  { source: "LinkedIn", candidates: 120 },
  { source: "Job Board", candidates: 95 },
  { source: "Glassdoor", candidates: 65 },
  { source: "Direct Sourcing", candidates: 61 },
  { source: "Referrals", candidates: 55 },
  { source: "Agencies", candidates: 40 },
  { source: "Events", candidates: 10 },
];

const tableData = [
  { source: "Career Site", candidates: 145, hires: 22, rate: "15.2%", cost: "$320" },
  { source: "LinkedIn", candidates: 120, hires: 18, rate: "15.0%", cost: "$680" },
  { source: "Job Board", candidates: 95, hires: 12, rate: "12.6%", cost: "$450" },
  { source: "Glassdoor", candidates: 65, hires: 8, rate: "12.3%", cost: "$520" },
  { source: "Direct Sourcing", candidates: 61, hires: 9, rate: "14.8%", cost: "$800" },
  { source: "Referrals", candidates: 55, hires: 14, rate: "25.5%", cost: "$500" },
  { source: "Agencies", candidates: 40, hires: 7, rate: "17.5%", cost: "$1,200" },
  { source: "Events", candidates: 10, hires: 2, rate: "20.0%", cost: "$950" },
];

export function SourceEffectiveness() {
  const [viewMode, setViewMode] = useState<"visualization" | "table">("visualization");

  return (
    <div className="flex flex-col h-full">
      <ReportPageHeader
        title="Source Effectiveness"
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
            { label: "Chart Type", value: "Candidate Volume" },
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
              <span className="text-[10px] text-gray-400">Last Updated: 3 days ago</span>
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
              <p className="text-[12px] font-medium text-gray-700 text-center mb-1">Candidate Volume by Source</p>
              <p className="text-[11px] text-gray-400 text-center mb-4">Number of candidates from each source (Current Quarter)</p>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={data} margin={{ top: 10, right: 20, left: -10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="source" tick={{ fontSize: 10, fill: "#9ca3af" }} />
                  <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} domain={[0, 160]} ticks={[0, 40, 80, 120, 160]} />
                  <Tooltip contentStyle={{ fontSize: 11 }} />
                  <Legend formatter={(v) => <span style={{ fontSize: 11 }}>{v}</span>} />
                  <Bar dataKey="candidates" fill="#3b82f6" radius={[3, 3, 0, 0]} name="Candidates" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left text-[11px] font-medium text-gray-500 pb-2">Source</th>
                  <th className="text-left text-[11px] font-medium text-gray-500 pb-2">Candidates</th>
                  <th className="text-left text-[11px] font-medium text-gray-500 pb-2">Hires</th>
                  <th className="text-left text-[11px] font-medium text-gray-500 pb-2">Conv. Rate</th>
                  <th className="text-left text-[11px] font-medium text-gray-500 pb-2">Cost per Hire</th>
                </tr>
              </thead>
              <tbody>
                {tableData.map((row) => (
                  <tr key={row.source} className="border-b border-gray-50">
                    <td className="text-[12px] text-gray-800 py-2">{row.source}</td>
                    <td className="text-[12px] text-gray-800 py-2">{row.candidates}</td>
                    <td className="text-[12px] text-gray-800 py-2">{row.hires}</td>
                    <td className="text-[12px] text-gray-800 py-2">{row.rate}</td>
                    <td className="text-[12px] text-gray-800 py-2">{row.cost}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { value: "635", label: "Total Candidates" },
            { value: "25.5%", label: "Best Conversion Rate (Referrals)" },
            { value: "$500", label: "Lowest Cost Per Hire (Referrals)" },
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
