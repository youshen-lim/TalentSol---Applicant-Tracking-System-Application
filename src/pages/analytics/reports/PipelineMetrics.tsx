import { useState, useEffect } from "react";
import ReportHeader from "@/components/analytics/ReportHeader";
import { LineChart } from "@/components/dashboard/LineChart";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { analyticsApi } from "@/services/api";

const PIPELINE_STAGES = ['Applied', 'Screening', 'Interview 1', 'Interview 2', 'Offer', 'Hired', 'Rejected'];

const PipelineMetrics = () => {
  const [viewOption, setViewOption] = useState("visualization");
  const [timeRange, setTimeRange] = useState("quarter");
  const [department, setDepartment] = useState("all");
  const [jobType, setJobType] = useState("all");
  const [apiPipelineData, setApiPipelineData] = useState<any[]>([]);

  useEffect(() => {
    analyticsApi.getDashboardStats().then(response => {
      const raw = response.data || response;
      const statusItems: Array<{ status: string; count: number }> =
        raw.applicationsByStatus || raw.statusDistribution || [];
      if (statusItems.length > 0) {
        const mapped = PIPELINE_STAGES.map(stage => {
          const found = statusItems.find((s: any) =>
            s.status?.toLowerCase() === stage.toLowerCase() ||
            s.status?.toLowerCase().replace(/\s+/g, '') === stage.toLowerCase().replace(/\s+/g, '')
          );
          return { name: stage, value: found?.count || 0 };
        });
        setApiPipelineData(mapped);
      }
    }).catch(() => { /* keep hardcoded fallback */ });
  }, []);

  const pipelineData = [
    { name: 'Applied', screening: 199, interview: 120, offer: 46, hired: 32 },
    { name: 'Screening', screening: 150, interview: 100, offer: 40, hired: 28 },
    { name: 'Interview 1', screening: 120, interview: 80, offer: 35, hired: 25 },
    { name: 'Interview 2', screening: 90, interview: 60, offer: 30, hired: 20 },
    { name: 'Interview 3', screening: 70, interview: 50, offer: 25, hired: 18 },
    { name: 'Offer', screening: 50, interview: 40, offer: 20, hired: 15 },
    { name: 'Hired', screening: 30, interview: 25, offer: 15, hired: 10 },
  ];

  const tableData = [
    { stage: 'Applied', candidates: 199, conversionRate: '75%', timeInStage: '2 days' },
    { stage: 'Screening', candidates: 150, conversionRate: '80%', timeInStage: '5 days' },
    { stage: 'Interview 1', candidates: 120, conversionRate: '75%', timeInStage: '7 days' },
    { stage: 'Interview 2', candidates: 90, conversionRate: '78%', timeInStage: '5 days' },
    { stage: 'Interview 3', candidates: 70, conversionRate: '71%', timeInStage: '4 days' },
    { stage: 'Offer', candidates: 50, conversionRate: '60%', timeInStage: '3 days' },
    { stage: 'Hired', candidates: 30, conversionRate: '100%', timeInStage: '0 days' },
  ];

  const activeCandidates = apiPipelineData.length > 0
    ? apiPipelineData.filter(s => !['Hired', 'Rejected'].includes(s.name)).reduce((sum, s) => sum + (s.value || 0), 0)
    : 46;
  const offerCount = apiPipelineData.find(s => s.name === 'Offer')?.value || 0;
  const hiredCount = apiPipelineData.find(s => s.name === 'Hired')?.value || 0;
  const offerRate = offerCount > 0 ? Math.round((hiredCount / offerCount) * 100) : 18;

  return (
    <div className="p-6 space-y-6">
      <ReportHeader title="Pipeline Metrics" />

      {/* Filter row — 3 cols per screenshot 8 */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="text-gray-500 block mb-1.5" style={{ fontSize: 12, fontWeight: 500 }}>Department</label>
            <Select value={department} onValueChange={setDepartment}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select department" />
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
            <label className="text-gray-500 block mb-1.5" style={{ fontSize: 12, fontWeight: 500 }}>Time Range</label>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select time range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="month">Last Month</SelectItem>
                <SelectItem value="quarter">Current Quarter</SelectItem>
                <SelectItem value="year">Last Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-gray-500 block mb-1.5" style={{ fontSize: 12, fontWeight: 500 }}>Job Type</label>
            <Select value={jobType} onValueChange={setJobType}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select job type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Job Types</SelectItem>
                <SelectItem value="full-time">Full Time</SelectItem>
                <SelectItem value="part-time">Part Time</SelectItem>
                <SelectItem value="contract">Contract</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Results section */}
      <div className="flex items-center justify-between">
        <h3 className="text-gray-900" style={{ fontSize: 14, fontWeight: 600 }}>Results</h3>
        <div className="flex items-center gap-3">
          <span className="text-gray-400" style={{ fontSize: 12 }}>Last Updated: 5 minutes ago</span>
          <div className="flex items-center bg-white border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewOption("visualization")}
              className={`px-3 py-1.5 transition-all ${viewOption === "visualization" ? "bg-indigo-600 text-white" : "text-gray-500 hover:text-gray-700"}`}
              style={{ fontSize: 13 }}
            >
              Visualization
            </button>
            <button
              onClick={() => setViewOption("table")}
              className={`px-3 py-1.5 transition-all ${viewOption === "table" ? "bg-indigo-600 text-white" : "text-gray-500 hover:text-gray-700"}`}
              style={{ fontSize: 13 }}
            >
              Table
            </button>
          </div>
        </div>
      </div>

      {viewOption === "visualization" ? (
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <LineChart
            title="Pipeline Progression"
            description={`Candidate progression through pipeline stages (${timeRange === "quarter" ? "Current Quarter" : timeRange === "month" ? "Last Month" : "Last Year"})`}
            data={pipelineData}
            lines={[
              { dataKey: "screening", stroke: "#4F46E5", name: "Screening" },
              { dataKey: "interview", stroke: "#A855F7", name: "Interview" },
              { dataKey: "offer", stroke: "#10B981", name: "Offer" },
              { dataKey: "hired", stroke: "#EF4444", name: "Hired" },
            ]}
            height={400}
          />
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pipeline Stage</TableHead>
                <TableHead>Candidates</TableHead>
                <TableHead>Conversion Rate</TableHead>
                <TableHead>Avg. Time in Stage</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(apiPipelineData.length > 0 ? apiPipelineData : tableData).map((row: any, index: number) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{row.stage || row.name}</TableCell>
                  <TableCell>{row.candidates ?? row.value ?? 0}</TableCell>
                  <TableCell>{row.conversionRate || '—'}</TableCell>
                  <TableCell>{row.timeInStage || '—'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-6 text-center">
          <p className="text-indigo-600" style={{ fontSize: 32, fontWeight: 700 }}>{activeCandidates}</p>
          <p className="text-gray-500 mt-1" style={{ fontSize: 12 }}>Active Candidates</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-6 text-center">
          <p className="text-indigo-600" style={{ fontSize: 32, fontWeight: 700 }}>{offerRate}%</p>
          <p className="text-gray-500 mt-1" style={{ fontSize: 12 }}>Offer Acceptance Rate</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-6 text-center">
          <p className="text-indigo-600" style={{ fontSize: 32, fontWeight: 700 }}>24 days</p>
          <p className="text-gray-500 mt-1" style={{ fontSize: 12 }}>Avg. Time to Hire</p>
        </div>
      </div>
    </div>
  );
};

export default PipelineMetrics;
