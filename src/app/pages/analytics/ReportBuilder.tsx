import { Download, Save, Plus, ChevronDown, X } from "lucide-react";
import { ReportPageHeader } from "../../components/PageHeader";
import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const metrics = [
  "Candidate Volume",
  "Time to Hire",
  "Offer Acceptance Rate",
  "Pipeline Conversion",
  "Source Quality",
  "Interviewer Feedback Score",
  "Cost per Hire",
  "Diversity Metrics",
];

const demoData = [
  { label: "Engineering", value: 145 },
  { label: "Product", value: 98 },
  { label: "Design", value: 74 },
  { label: "Marketing", value: 62 },
  { label: "Sales", value: 88 },
  { label: "HR", value: 41 },
];

export function ReportBuilder() {
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(["Candidate Volume"]);
  const [reportName, setReportName] = useState("Custom Report — Q1 2026");

  const toggleMetric = (m: string) => {
    setSelectedMetrics((prev) =>
      prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]
    );
  };

  return (
    <div className="flex flex-col h-full">
      <ReportPageHeader
        reportHome="Report Home"
        reportName="Zone Report"
        title="Report Builder"
        actions={
          <>
            <button className="flex items-center gap-1.5 border border-gray-200 bg-white text-gray-700 px-3 py-1.5 rounded-md text-[12px] font-medium hover:bg-gray-50 transition-colors">
              <Download size={13} />
              Export
            </button>
            <button className="flex items-center gap-1.5 bg-blue-600 text-white px-3 py-1.5 rounded-md text-[12px] font-medium hover:bg-blue-700 transition-colors">
              <Save size={13} />
              Save Report
            </button>
          </>
        }
      />

      <div className="flex-1 p-6 overflow-y-auto">
        <div className="grid grid-cols-3 gap-5">
          {/* Left: Config */}
          <div className="space-y-4">
            {/* Report Name */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <label className="block text-[11px] font-medium text-gray-500 mb-1.5">Report Name</label>
              <input
                value={reportName}
                onChange={(e) => setReportName(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-md px-3 py-1.5 text-[12px] text-gray-800 outline-none focus:border-blue-400 transition-colors"
              />
            </div>

            {/* Filters */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h4 className="text-[12px] font-semibold text-gray-800 mb-3">Filters</h4>
              <div className="space-y-3">
                {[
                  { label: "Department", value: "All Departments" },
                  { label: "Time Range", value: "Q1 2026" },
                  { label: "Job Type", value: "All Types" },
                  { label: "Source", value: "All Sources" },
                ].map((f) => (
                  <div key={f.label}>
                    <label className="block text-[10px] font-medium text-gray-400 mb-1">{f.label}</label>
                    <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-md px-3 py-1.5 cursor-pointer hover:bg-gray-100 transition-colors">
                      <span className="text-[11px] text-gray-700">{f.value}</span>
                      <ChevronDown size={12} className="text-gray-400" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Metrics */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-[12px] font-semibold text-gray-800">Metrics</h4>
                <button className="flex items-center gap-1 text-blue-600 text-[11px]">
                  <Plus size={11} /> Add
                </button>
              </div>
              <div className="space-y-1">
                {metrics.map((m) => (
                  <label key={m} className="flex items-center gap-2 cursor-pointer py-1 hover:bg-gray-50 rounded px-1">
                    <input
                      type="checkbox"
                      checked={selectedMetrics.includes(m)}
                      onChange={() => toggleMetric(m)}
                      className="w-3.5 h-3.5 accent-blue-600"
                    />
                    <span className="text-[11px] text-gray-700">{m}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Preview */}
          <div className="col-span-2 space-y-4">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-[13px] font-semibold text-gray-900">{reportName}</h3>
                  <p className="text-[11px] text-gray-400">Q1 2026 · All Departments · All Sources</p>
                </div>
                <div className="flex gap-2">
                  {["Bar", "Line", "Table"].map((t) => (
                    <button key={t} className="px-3 py-1 text-[11px] font-medium border border-gray-200 rounded-md text-gray-600 hover:bg-gray-50 transition-colors">
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Selected metrics tags */}
              <div className="flex flex-wrap gap-1.5 mb-4">
                {selectedMetrics.map((m) => (
                  <div key={m} className="flex items-center gap-1 bg-blue-50 border border-blue-200 rounded-full px-2 py-0.5">
                    <span className="text-[10px] text-blue-700">{m}</span>
                    <button onClick={() => toggleMetric(m)} className="text-blue-400 hover:text-blue-600">
                      <X size={10} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Preview chart */}
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={demoData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#9ca3af" }} />
                  <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} />
                  <Tooltip contentStyle={{ fontSize: 11 }} />
                  <Bar dataKey="value" fill="#3b82f6" radius={[3, 3, 0, 0]} name={selectedMetrics[0] || "Value"} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Summary table */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h4 className="text-[12px] font-semibold text-gray-800 mb-3">Data Preview</h4>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left text-[11px] font-medium text-gray-500 pb-2">Department</th>
                    {selectedMetrics.slice(0, 3).map((m) => (
                      <th key={m} className="text-left text-[11px] font-medium text-gray-500 pb-2">{m}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {demoData.map((row) => (
                    <tr key={row.label} className="border-b border-gray-50">
                      <td className="text-[11px] text-gray-800 py-1.5">{row.label}</td>
                      <td className="text-[11px] text-gray-800 py-1.5">{row.value}</td>
                      {selectedMetrics.length > 1 && <td className="text-[11px] text-gray-800 py-1.5">{(row.value * 0.15).toFixed(1)}%</td>}
                      {selectedMetrics.length > 2 && <td className="text-[11px] text-gray-800 py-1.5">${Math.round(row.value * 4.2)}</td>}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
