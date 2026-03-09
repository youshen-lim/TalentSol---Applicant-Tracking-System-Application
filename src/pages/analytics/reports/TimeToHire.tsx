import { useState, useEffect, useMemo } from "react";
import ReportHeader from "@/components/analytics/ReportHeader";
import { BarChart } from "@/components/dashboard/BarChart";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { analyticsApi } from "@/services/api";

const TimeToHire = () => {
  const [viewOption, setViewOption] = useState("visualization");
  const [timeRange, setTimeRange] = useState("quarter");
  const [chartType, setChartType] = useState("department");
  const [department, setDepartment] = useState("all");
  const [jobType, setJobType] = useState("all");
  const [apiTimeData, setApiTimeData] = useState<any>(null);

  useEffect(() => {
    analyticsApi.getTimeToHire().then(response => {
      const raw = response.data || response;
      setApiTimeData(raw);
    }).catch(() => { /* keep hardcoded fallback */ });
  }, []);

  const departmentTimeData = [
    { name: 'Engineering', days: 32 },
    { name: 'Product', days: 28 },
    { name: 'Design', days: 24 },
    { name: 'Marketing', days: 21 },
    { name: 'Sales', days: 18 },
    { name: 'Cust. Success', days: 15 },
    { name: 'Finance', days: 30 },
    { name: 'HR', days: 22 },
    { name: 'Operations', days: 26 },
    { name: 'Legal', days: 35 },
  ];

  const candidateTimeData = [
    { name: 'Engineering', senior: 38, mid: 32, junior: 25 },
    { name: 'Product', senior: 34, mid: 28, junior: 22 },
    { name: 'Design', senior: 30, mid: 24, junior: 18 },
    { name: 'Marketing', senior: 28, mid: 21, junior: 16 },
    { name: 'Sales', senior: 24, mid: 18, junior: 14 },
    { name: 'Cust. Success', senior: 20, mid: 15, junior: 12 },
    { name: 'Finance', senior: 36, mid: 30, junior: 24 },
    { name: 'HR', senior: 28, mid: 22, junior: 18 },
    { name: 'Operations', senior: 32, mid: 26, junior: 20 },
    { name: 'Legal', senior: 40, mid: 35, junior: 30 },
  ];

  const tableData = [
    { department: 'Engineering', avgDays: 32, seniorDays: 38, midDays: 32, juniorDays: 25 },
    { department: 'Product', avgDays: 28, seniorDays: 34, midDays: 28, juniorDays: 22 },
    { department: 'Design', avgDays: 24, seniorDays: 30, midDays: 24, juniorDays: 18 },
    { department: 'Marketing', avgDays: 21, seniorDays: 28, midDays: 21, juniorDays: 16 },
    { department: 'Sales', avgDays: 18, seniorDays: 24, midDays: 18, juniorDays: 14 },
    { department: 'Customer Success', avgDays: 15, seniorDays: 20, midDays: 15, juniorDays: 12 },
    { department: 'Finance', avgDays: 30, seniorDays: 36, midDays: 30, juniorDays: 24 },
    { department: 'HR', avgDays: 22, seniorDays: 28, midDays: 22, juniorDays: 18 },
    { department: 'Operations', avgDays: 26, seniorDays: 32, midDays: 26, juniorDays: 20 },
    { department: 'Legal', avgDays: 35, seniorDays: 40, midDays: 35, juniorDays: 30 },
  ];

  const overallAvgDays = apiTimeData?.averageTimeToHire != null
    ? String(apiTimeData.averageTimeToHire)
    : '24.6';
  const deptAverages: Array<{ department: string; averageDays: number }> =
    apiTimeData?.departmentAverages || [];
  const longestDept = deptAverages.length > 0
    ? deptAverages.reduce((a, b) => a.averageDays >= b.averageDays ? a : b)
    : null;
  const shortestDept = deptAverages.length > 0
    ? deptAverages.reduce((a, b) => a.averageDays <= b.averageDays ? a : b)
    : null;

  const hardcodedDeptData = departmentTimeData;
  const filteredDeptData = useMemo(() => {
    const depts = deptAverages.length > 0
      ? deptAverages.map((d: any) => ({ name: d.department, days: Math.round(d.averageDays) }))
      : hardcodedDeptData;
    if (department === "all") return depts;
    return depts.filter((d: any) =>
      (d.name || '').toLowerCase() === department.toLowerCase()
    );
  }, [apiTimeData, department]);

  const filteredTableData = useMemo(() => {
    if (department === "all") return tableData;
    return tableData.filter(row =>
      row.department.toLowerCase() === department.toLowerCase()
    );
  }, [department]);

  return (
    <div className="p-6 space-y-6">
      <ReportHeader title="Time to Hire" />

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
                <SelectItem value="department">By Department</SelectItem>
                <SelectItem value="candidate">By Candidate Level</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Results section */}
      <div className="flex items-center justify-between">
        <h3 className="text-gray-900" style={{ fontSize: 14, fontWeight: 600 }}>Results</h3>
        <div className="flex items-center gap-3">
          <span className="text-gray-400" style={{ fontSize: 12 }}>Last Updated: 1 day ago</span>
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
          {chartType === "department" ? (
            <BarChart
              title="Average Time to Hire by Department"
              description={`Average days from application to hire (${timeRange === "quarter" ? "Current Quarter" : timeRange === "month" ? "Last Month" : "Last Year"})`}
              data={filteredDeptData}
              bars={[{ dataKey: "days", fill: "#4F46E5", name: "Days" }]}
              vertical={false}
              height={400}
            />
          ) : (
            <BarChart
              title="Average Time to Hire by Candidate Level"
              description={`Average days from application to hire by seniority level (${timeRange === "quarter" ? "Current Quarter" : timeRange === "month" ? "Last Month" : "Last Year"})`}
              data={candidateTimeData}
              bars={[
                { dataKey: "senior", fill: "#3730A3", name: "Senior" },
                { dataKey: "mid", fill: "#4F46E5", name: "Mid-level" },
                { dataKey: "junior", fill: "#818CF8", name: "Junior" },
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
                <TableHead>Department</TableHead>
                <TableHead>Avg. Time to Hire (Days)</TableHead>
                <TableHead>Senior Level (Days)</TableHead>
                <TableHead>Mid Level (Days)</TableHead>
                <TableHead>Junior Level (Days)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTableData.map((row, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{row.department}</TableCell>
                  <TableCell>{row.avgDays}</TableCell>
                  <TableCell>{row.seniorDays}</TableCell>
                  <TableCell>{row.midDays}</TableCell>
                  <TableCell>{row.juniorDays}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-6 text-center">
          <p className="text-indigo-600" style={{ fontSize: 32, fontWeight: 700 }}>{overallAvgDays}</p>
          <p className="text-gray-500 mt-1" style={{ fontSize: 12 }}>Overall Avg. Time to Hire (Days)</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-6 text-center">
          <p className="text-indigo-600" style={{ fontSize: 32, fontWeight: 700 }}>
            {longestDept ? Math.round(longestDept.averageDays) : 32}
          </p>
          <p className="text-gray-500 mt-1" style={{ fontSize: 12 }}>
            Longest Dept. Time to Hire ({longestDept ? longestDept.department : 'Engineering'})
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-6 text-center">
          <p className="text-indigo-600" style={{ fontSize: 32, fontWeight: 700 }}>
            {shortestDept ? Math.round(shortestDept.averageDays) : 15}
          </p>
          <p className="text-gray-500 mt-1" style={{ fontSize: 12 }}>
            Shortest Dept. Time to Hire ({shortestDept ? shortestDept.department : 'Customer Success'})
          </p>
        </div>
      </div>
    </div>
  );
};

export default TimeToHire;
