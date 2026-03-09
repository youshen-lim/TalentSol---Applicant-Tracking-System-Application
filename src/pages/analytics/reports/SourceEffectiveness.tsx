import { useState, useEffect } from "react";
import ReportHeader from "@/components/analytics/ReportHeader";
import { BarChart } from "@/components/dashboard/BarChart";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { analyticsApi } from "@/services/api";

const hardcodedVolumeData = [
  { name: 'Career Site', candidates: 145 },
  { name: 'LinkedIn', candidates: 120 },
  { name: 'Job Board', candidates: 95 },
  { name: 'Glassdoor', candidates: 70 },
  { name: 'Direct Sourcing', candidates: 85 },
  { name: 'Referrals', candidates: 55 },
  { name: 'Agencies', candidates: 40 },
  { name: 'Events', candidates: 30 },
];

const hardcodedConversionData = [
  { name: 'Career Site', screened: 80, interviewed: 45, offered: 20, hired: 15 },
  { name: 'LinkedIn', screened: 70, interviewed: 40, offered: 18, hired: 12 },
  { name: 'Job Board', screened: 50, interviewed: 30, offered: 12, hired: 8 },
  { name: 'Glassdoor', screened: 45, interviewed: 28, offered: 11, hired: 7 },
  { name: 'Direct Sourcing', screened: 60, interviewed: 35, offered: 15, hired: 10 },
  { name: 'Referrals', screened: 40, interviewed: 30, offered: 18, hired: 14 },
  { name: 'Agencies', screened: 30, interviewed: 20, offered: 12, hired: 8 },
  { name: 'Events', screened: 20, interviewed: 15, offered: 8, hired: 5 },
];

const hardcodedTableData = [
  { source: 'Career Site', candidates: 145, screened: 80, interviewed: 45, offered: 20, hired: 15, conversionRate: '10.3%', costPerHire: '$1,250' },
  { source: 'LinkedIn', candidates: 120, screened: 70, interviewed: 40, offered: 18, hired: 12, conversionRate: '10.0%', costPerHire: '$1,800' },
  { source: 'Job Board', candidates: 95, screened: 50, interviewed: 30, offered: 12, hired: 8, conversionRate: '8.4%', costPerHire: '$950' },
  { source: 'Glassdoor', candidates: 70, screened: 45, interviewed: 28, offered: 11, hired: 7, conversionRate: '10.0%', costPerHire: '$1,100' },
  { source: 'Direct Sourcing', candidates: 85, screened: 60, interviewed: 35, offered: 15, hired: 10, conversionRate: '11.8%', costPerHire: '$1,500' },
  { source: 'Referrals', candidates: 55, screened: 40, interviewed: 30, offered: 18, hired: 14, conversionRate: '25.5%', costPerHire: '$500' },
  { source: 'Agencies', candidates: 40, screened: 30, interviewed: 20, offered: 12, hired: 8, conversionRate: '20.0%', costPerHire: '$3,200' },
  { source: 'Events', candidates: 30, screened: 20, interviewed: 15, offered: 8, hired: 5, conversionRate: '16.7%', costPerHire: '$2,100' },
];

const SourceEffectiveness = () => {
  const [viewOption, setViewOption] = useState("visualization");
  const [timeRange, setTimeRange] = useState("quarter");
  const [chartType, setChartType] = useState("volume");
  const [department, setDepartment] = useState("all");
  const [jobType, setJobType] = useState("all");
  const [apiSourceData, setApiSourceData] = useState<any[] | null>(null);

  useEffect(() => {
    analyticsApi.getSourceData().then(response => {
      const raw = response.data || response;
      const sources = raw.sourceEffectiveness?.sources || raw.sourceEffectiveness || [];
      if (Array.isArray(sources) && sources.length > 0) setApiSourceData(sources);
    }).catch(() => { /* keep hardcoded fallback */ });
  }, []);

  const sourceVolumeData = apiSourceData
    ? apiSourceData.map((s: any) => ({ name: s.source || s.name, candidates: s.applications || s.candidates || 0 }))
    : hardcodedVolumeData;

  const sourceConversionData = apiSourceData
    ? apiSourceData.map((s: any) => ({ name: s.source || s.name, screened: s.interviews || s.screened || 0, interviewed: s.interviews || 0, offered: 0, hired: s.hires || s.hired || 0 }))
    : hardcodedConversionData;

  const tableData = apiSourceData
    ? apiSourceData.map((s: any) => ({
        source: s.source || s.name,
        candidates: s.applications || 0,
        screened: s.interviews || 0,
        interviewed: s.interviews || 0,
        offered: 0,
        hired: s.hires || 0,
        conversionRate: `${(s.hireRate || 0).toFixed(1)}%`,
        costPerHire: s.costPerHire > 0 ? `$${Math.round(s.costPerHire).toLocaleString()}` : 'N/A',
      }))
    : hardcodedTableData;

  const totalCandidates = apiSourceData
    ? apiSourceData.reduce((sum: number, s: any) => sum + (s.applications || 0), 0)
    : 635;

  const bestSource = apiSourceData && apiSourceData.length > 0
    ? apiSourceData.reduce((best: any, s: any) => (s.hireRate || 0) > (best.hireRate || 0) ? s : best)
    : null;

  const lowestCostSource = apiSourceData && apiSourceData.length > 0
    ? apiSourceData.filter((s: any) => s.hires > 0).reduce((low: any, s: any) => !low || s.costPerHire < low.costPerHire ? s : low, null)
    : null;

  return (
    <div className="p-6 space-y-6">
      <ReportHeader title="Source Effectiveness" />

      {/* Filter row */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <div className="grid grid-cols-4 gap-4">
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
          <div>
            <label className="text-gray-500 block mb-1.5" style={{ fontSize: 12, fontWeight: 500 }}>Chart Type</label>
            <Select value={chartType} onValueChange={setChartType}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select chart type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="volume">Candidate Volume</SelectItem>
                <SelectItem value="conversion">Conversion Rate</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Results section */}
      <div className="flex items-center justify-between">
        <h3 className="text-gray-900" style={{ fontSize: 14, fontWeight: 600 }}>Results</h3>
        <div className="flex items-center gap-3">
          <span className="text-gray-400" style={{ fontSize: 12 }}>Last Updated: 3 days ago</span>
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
          {chartType === "volume" ? (
            <BarChart
              title="Candidate Volume by Source"
              description={`Number of candidates from each source (${timeRange === "quarter" ? "Current Quarter" : timeRange === "month" ? "Last Month" : "Last Year"})`}
              data={sourceVolumeData}
              bars={[{ dataKey: "candidates", fill: "#4F46E5", name: "Candidates" }]}
              vertical={false}
              height={400}
            />
          ) : (
            <BarChart
              title="Conversion Rate by Source"
              description={`Candidate progression by source (${timeRange === "quarter" ? "Current Quarter" : timeRange === "month" ? "Last Month" : "Last Year"})`}
              data={sourceConversionData}
              bars={[
                { dataKey: "screened", fill: "#818CF8", name: "Screened" },
                { dataKey: "interviewed", fill: "#6366F1", name: "Interviewed" },
                { dataKey: "offered", fill: "#4F46E5", name: "Offered" },
                { dataKey: "hired", fill: "#3730A3", name: "Hired" },
              ]}
              vertical={false}
              height={400}
            />
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Source</TableHead>
                <TableHead>Candidates</TableHead>
                <TableHead>Screened</TableHead>
                <TableHead>Interviewed</TableHead>
                <TableHead>Offered</TableHead>
                <TableHead>Hired</TableHead>
                <TableHead>Conversion Rate</TableHead>
                <TableHead>Cost Per Hire</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tableData.map((row, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{row.source}</TableCell>
                  <TableCell>{row.candidates}</TableCell>
                  <TableCell>{row.screened}</TableCell>
                  <TableCell>{row.interviewed}</TableCell>
                  <TableCell>{row.offered}</TableCell>
                  <TableCell>{row.hired}</TableCell>
                  <TableCell>{row.conversionRate}</TableCell>
                  <TableCell>{row.costPerHire}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-6 text-center">
          <p className="text-indigo-600" style={{ fontSize: 32, fontWeight: 700 }}>{totalCandidates}</p>
          <p className="text-gray-500 mt-1" style={{ fontSize: 12 }}>Total Candidates</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-6 text-center">
          <p className="text-indigo-600" style={{ fontSize: 32, fontWeight: 700 }}>
            {bestSource ? `${(bestSource.hireRate || 0).toFixed(1)}%` : '25.5%'}
          </p>
          <p className="text-gray-500 mt-1" style={{ fontSize: 12 }}>
            Best Conversion Rate ({bestSource ? (bestSource.source || bestSource.name) : 'Referrals'})
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-6 text-center">
          <p className="text-indigo-600" style={{ fontSize: 32, fontWeight: 700 }}>
            {lowestCostSource ? `$${Math.round(lowestCostSource.costPerHire).toLocaleString()}` : '$500'}
          </p>
          <p className="text-gray-500 mt-1" style={{ fontSize: 12 }}>
            Lowest Cost Per Hire ({lowestCostSource ? (lowestCostSource.source || lowestCostSource.name) : 'Referrals'})
          </p>
        </div>
      </div>
    </div>
  );
};

export default SourceEffectiveness;
