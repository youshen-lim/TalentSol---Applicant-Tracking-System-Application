import { useState, useEffect } from "react";
import ReportHeader from "@/components/analytics/ReportHeader";
import { BarChart } from "@/components/dashboard/BarChart";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Plus } from "lucide-react";
import { analyticsApi } from "@/services/api";

const METRICS = [
  { id: "candidate-volume", label: "Candidate Volume" },
  { id: "time-to-hire", label: "Time to Hire" },
  { id: "offer-acceptance", label: "Offer Acceptance Rate" },
  { id: "pipeline-conversion", label: "Pipeline Conversion" },
  { id: "source-quality", label: "Source Quality" },
  { id: "interviewer-feedback", label: "Interviewer Feedback Score" },
  { id: "cost-per-hire", label: "Cost per Hire" },
  { id: "diversity-metrics", label: "Diversity Metrics" },
];

const DEFAULT_CHART_DATA = [
  { name: "Engineering", value: 145 },
  { name: "Product", value: 98 },
  { name: "Design", value: 74 },
  { name: "Marketing", value: 62 },
  { name: "Sales", value: 88 },
  { name: "HR", value: 41 },
];

const CoreReports = () => {
  const [reportName, setReportName] = useState("Custom Report — Q1 2026");
  const [chartView, setChartView] = useState("bar");
  const [enabledMetrics, setEnabledMetrics] = useState<string[]>(["candidate-volume"]);
  const [chartData, setChartData] = useState(DEFAULT_CHART_DATA);

  useEffect(() => {
    analyticsApi.getDashboardStats().then(response => {
      const raw = response.data || response;
      const topJobs: Array<any> = raw.topJobs || [];
      if (topJobs.length === 0) return;
      const deptMap: Record<string, number> = {};
      topJobs.forEach((job: any) => {
        const dept = job.department || 'Other';
        deptMap[dept] = (deptMap[dept] || 0) + (job.candidateCount || job.applicationCount || 0);
      });
      const realData = Object.entries(deptMap).map(([name, value]) => ({ name, value }));
      if (realData.length > 0) setChartData(realData);
    }).catch(() => { /* keep hardcoded fallback */ });
  }, []);

  const toggleMetric = (id: string) => {
    setEnabledMetrics((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  };

  const removeMetricChip = (id: string) => {
    setEnabledMetrics((prev) => prev.filter((m) => m !== id));
  };

  return (
    <div className="p-6 space-y-6">
      <ReportHeader title="Report Builder" saveLabel="Save Report" />

      <div className="flex gap-6 items-start">
        {/* Left: Config panel */}
        <div className="w-[340px] shrink-0 bg-white rounded-xl border border-gray-100 p-6 space-y-6">
          {/* Report Name */}
          <div>
            <label className="text-gray-700 block mb-1.5" style={{ fontSize: 13, fontWeight: 500 }}>
              Report Name
            </label>
            <input
              type="text"
              value={reportName}
              onChange={(e) => setReportName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300"
              style={{ fontSize: 13 }}
            />
          </div>

          {/* Filters */}
          <div>
            <p className="text-gray-700 mb-3" style={{ fontSize: 13, fontWeight: 600 }}>Filters</p>
            <div className="space-y-3">
              <div>
                <label className="text-gray-500 block mb-1" style={{ fontSize: 12 }}>Department</label>
                <Select defaultValue="all">
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="All Departments" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    <SelectItem value="engineering">Engineering</SelectItem>
                    <SelectItem value="product">Product</SelectItem>
                    <SelectItem value="design">Design</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="sales">Sales</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-gray-500 block mb-1" style={{ fontSize: 12 }}>Time Range</label>
                <Select defaultValue="q1-2026">
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Q1 2026" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="q1-2026">Q1 2026</SelectItem>
                    <SelectItem value="q4-2025">Q4 2025</SelectItem>
                    <SelectItem value="q3-2025">Q3 2025</SelectItem>
                    <SelectItem value="last-year">Last Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-gray-500 block mb-1" style={{ fontSize: 12 }}>Job Type</label>
                <Select defaultValue="all">
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="full-time">Full Time</SelectItem>
                    <SelectItem value="part-time">Part Time</SelectItem>
                    <SelectItem value="contract">Contract</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-gray-500 block mb-1" style={{ fontSize: 12 }}>Source</label>
                <Select defaultValue="all">
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="All Sources" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sources</SelectItem>
                    <SelectItem value="linkedin">LinkedIn</SelectItem>
                    <SelectItem value="referral">Referral</SelectItem>
                    <SelectItem value="career-site">Career Site</SelectItem>
                    <SelectItem value="job-board">Job Board</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Metrics checklist */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-gray-700" style={{ fontSize: 13, fontWeight: 600 }}>Metrics</p>
              <button className="flex items-center gap-1 text-indigo-600 hover:text-indigo-700" style={{ fontSize: 12 }}>
                <Plus size={12} />
                Add
              </button>
            </div>
            <div className="space-y-2">
              {METRICS.map((metric) => (
                <label key={metric.id} className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enabledMetrics.includes(metric.id)}
                    onChange={() => toggleMetric(metric.id)}
                    className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-gray-700" style={{ fontSize: 13 }}>{metric.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Chart preview + data table */}
        <div className="flex-1 min-w-0 space-y-4">
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            {/* Chart header */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-gray-900" style={{ fontSize: 14, fontWeight: 600 }}>{reportName}</p>
                <p className="text-gray-400 mt-0.5" style={{ fontSize: 12 }}>
                  Q1 2026 · All Departments · All Sources
                </p>
              </div>
              <div className="flex items-center bg-white border border-gray-200 rounded-lg overflow-hidden">
                {["Bar", "Line", "Table"].map((type) => (
                  <button
                    key={type}
                    onClick={() => setChartView(type.toLowerCase())}
                    className={`px-3 py-1.5 transition-all ${chartView === type.toLowerCase() ? "bg-indigo-600 text-white" : "text-gray-500 hover:text-gray-700"}`}
                    style={{ fontSize: 12 }}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Active metric chips */}
            {enabledMetrics.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {enabledMetrics.map((id) => {
                  const metric = METRICS.find((m) => m.id === id);
                  return (
                    <span key={id} className="flex items-center gap-1 px-2.5 py-1 bg-indigo-100 text-indigo-700 rounded-full" style={{ fontSize: 12 }}>
                      {metric?.label}
                      <button onClick={() => removeMetricChip(id)} className="hover:text-indigo-900">
                        <X size={11} />
                      </button>
                    </span>
                  );
                })}
              </div>
            )}

            <BarChart
              title=""
              description=""
              data={chartData}
              bars={[{ dataKey: "value", fill: "#4F46E5", name: "Candidate Volume" }]}
              vertical={false}
              height={280}
            />
          </div>

          {/* Data Preview table */}
          <div className="bg-white rounded-xl border border-gray-100">
            <div className="px-6 py-4 border-b border-gray-100">
              <p className="text-gray-900" style={{ fontSize: 13, fontWeight: 600 }}>Data Preview</p>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Department</TableHead>
                  <TableHead>Candidate Volume</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {chartData.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{row.name}</TableCell>
                    <TableCell>{row.value}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoreReports;
