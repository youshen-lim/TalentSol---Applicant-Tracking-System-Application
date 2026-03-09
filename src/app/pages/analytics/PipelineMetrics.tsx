import { Download, Save, ChevronDown } from "lucide-react";
import { ReportPageHeader } from "../../components/PageHeader";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useState } from "react";

const data = [
  { stage: "Applied", screening: 320, interview: 320, offer: 320, hired: 320 },
  { stage: "Screening", screening: 210, interview: 210, offer: 210, hired: 210 },
  { stage: "Interview 1", screening: 140, interview: 140, offer: 140, hired: 140 },
  { stage: "Interview 2", screening: 88, interview: 88, offer: 88, hired: 88 },
  { stage: "Interview 3", screening: 55, interview: 55, offer: 55, hired: 55 },
  { stage: "Offer", screening: 30, interview: 30, offer: 30, hired: 30 },
  { stage: "Hired", screening: 18, interview: 18, offer: 18, hired: 18 },
];

const lineData = [
  { stage: "Applied", Screening: 320, Interview: 210, Offer: 88, Hired: 42 },
  { stage: "Screening", Screening: 210, Interview: 140, Offer: 55, Hired: 28 },
  { stage: "Interview 1", Screening: 140, Interview: 88, Offer: 30, Hired: 18 },
  { stage: "Interview 2", Screening: 60, Interview: 45, Offer: 20, Hired: 12 },
  { stage: "Interview 3", Screening: 30, Interview: 22, Offer: 12, Hired: 8 },
  { stage: "Offer", Screening: 15, Interview: 12, Offer: 8, Hired: 5 },
  { stage: "Hired", Screening: 8, Interview: 6, Offer: 4, Hired: 2 },
];

export function PipelineMetrics() {
  const [viewMode, setViewMode] = useState<"visualization" | "table">("visualization");

  return (
    <div className="flex flex-col h-full">
      <ReportPageHeader
        title="Pipeline Metrics"
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
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-5 grid grid-cols-3 gap-4">
          {[
            { label: "Department", value: "All Departments" },
            { label: "Time Range", value: "Current Quarter" },
            { label: "Job Type", value: "All Job Types" },
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
              <span className="text-[10px] text-gray-400">Last Updated: 5 minutes ago</span>
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
              <p className="text-[12px] font-medium text-gray-700 text-center mb-1">Pipeline Progression</p>
              <p className="text-[11px] text-gray-400 text-center mb-4">Candidate progression through pipeline stages (Current Quarter)</p>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={lineData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="stage" tick={{ fontSize: 10, fill: "#9ca3af" }} />
                  <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} />
                  <Tooltip contentStyle={{ fontSize: 11 }} />
                  <Legend formatter={(v) => <span style={{ fontSize: 11 }}>{v}</span>} />
                  <Line type="monotone" dataKey="Screening" stroke="#2563eb" strokeWidth={1.5} dot={{ r: 2 }} strokeDasharray="4 2" />
                  <Line type="monotone" dataKey="Interview" stroke="#7c3aed" strokeWidth={1.5} dot={{ r: 2 }} strokeDasharray="4 2" />
                  <Line type="monotone" dataKey="Offer" stroke="#059669" strokeWidth={1.5} dot={{ r: 2 }} strokeDasharray="4 2" />
                  <Line type="monotone" dataKey="Hired" stroke="#dc2626" strokeWidth={1.5} dot={{ r: 2 }} strokeDasharray="4 2" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  {["Stage", "Candidates", "Drop-off Rate", "Conversion"].map((h) => (
                    <th key={h} className="text-left text-[11px] font-medium text-gray-500 pb-2">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { stage: "Applied", count: 320, dropoff: "—", conv: "100%" },
                  { stage: "Screening", count: 210, dropoff: "34.4%", conv: "65.6%" },
                  { stage: "Interview 1", count: 140, dropoff: "33.3%", conv: "43.8%" },
                  { stage: "Interview 2", count: 88, dropoff: "37.1%", conv: "27.5%" },
                  { stage: "Offer", count: 42, dropoff: "52.3%", conv: "13.1%" },
                  { stage: "Hired", count: 28, dropoff: "33.3%", conv: "8.8%" },
                ].map((row) => (
                  <tr key={row.stage} className="border-b border-gray-50">
                    <td className="text-[12px] text-gray-800 py-2">{row.stage}</td>
                    <td className="text-[12px] text-gray-800 py-2">{row.count}</td>
                    <td className="text-[12px] text-red-500 py-2">{row.dropoff}</td>
                    <td className="text-[12px] text-green-600 py-2">{row.conv}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { value: "46", label: "Active Candidates" },
            { value: "18%", label: "Offer Acceptance Rate" },
            { value: "24 days", label: "Avg. Time to Hire" },
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
