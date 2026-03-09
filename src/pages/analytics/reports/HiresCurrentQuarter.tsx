import { useState } from "react";
import ReportHeader from "@/components/analytics/ReportHeader";
import { BarChart } from "@/components/dashboard/BarChart";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const hiresData = [
  { name: 'Accounting', value: 2 },
  { name: 'Analytics', value: 2 },
  { name: 'BD', value: 6 },
  { name: 'Communications', value: 1 },
  { name: 'Compliance', value: 5 },
  { name: 'Cust. Success', value: 3 },
  { name: 'Data', value: 5 },
  { name: 'Design', value: 5 },
  { name: 'Engineering', value: 9 },
  { name: 'Facilities', value: 8 },
  { name: 'IT', value: 1 },
  { name: 'Sales', value: 1 },
];

const tableData = [
  { department: 'Accounting', recruiter: 'Adelle Winslow', candidate: 'Garnett West', count: 1 },
  { department: 'Accounting', recruiter: 'Helena Witsock', candidate: 'Adelle Winslow', count: 1 },
  { department: 'Analytics', recruiter: 'Amari Huel', candidate: 'Helena Witsock', count: 1 },
  { department: 'Analytics', recruiter: 'Daphney Dickinson', candidate: 'Taurean Macejkovic', count: 1 },
  { department: 'BD', recruiter: 'Dianna Gleason', candidate: 'Charity Okumeva', count: 2 },
  { department: 'BD', recruiter: 'Matya Vaum', candidate: 'Unspecified', count: 4 },
  { department: 'Communications', recruiter: 'Wilfred Upton', candidate: 'Jacynthe Rolfson', count: 1 },
  { department: 'Compliance', recruiter: 'Zola Christiansen', candidate: 'Abraham Johnston', count: 4 },
  { department: 'Compliance', recruiter: 'Aimee Funk', candidate: 'Shanon Mayert', count: 1 },
];

const HiresCurrentQuarter = () => {
  const [viewOption, setViewOption] = useState("visualization");
  const [timeRange, setTimeRange] = useState("quarter");

  const totalHires = hiresData.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="p-6 space-y-6">
      <ReportHeader title="Hires — Current Quarter" saveLabel="Save Report" />

      {/* Filter row */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="text-gray-500 block mb-1.5" style={{ fontSize: 12, fontWeight: 500 }}>Department</label>
            <Select defaultValue="all">
              <SelectTrigger className="w-full">
                <SelectValue placeholder="All Departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                <SelectItem value="engineering">Engineering</SelectItem>
                <SelectItem value="design">Design</SelectItem>
                <SelectItem value="analytics">Analytics</SelectItem>
                <SelectItem value="sales">Sales</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-gray-500 block mb-1.5" style={{ fontSize: 12, fontWeight: 500 }}>Time Range</label>
            <Select defaultValue={timeRange} onValueChange={setTimeRange}>
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
            <Select defaultValue="all">
              <SelectTrigger className="w-full">
                <SelectValue placeholder="All Types" />
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

      {/* Results row */}
      <div className="flex items-center justify-between">
        <h3 className="text-gray-900" style={{ fontSize: 14, fontWeight: 600 }}>Results</h3>
        <div className="flex items-center gap-3">
          <span className="text-gray-400" style={{ fontSize: 12 }}>Last Updated: 2 minutes ago</span>
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
          <BarChart
            title="Hires by Department"
            description={`Total: ${totalHires} hires (${timeRange === "quarter" ? "Current Quarter" : timeRange === "month" ? "Last Month" : "Last Year"})`}
            data={hiresData}
            bars={[{ dataKey: "value", fill: "#4F46E5", name: "Hires" }]}
            vertical={false}
            height={400}
          />
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Department</TableHead>
                <TableHead>Recruiter</TableHead>
                <TableHead>Candidate</TableHead>
                <TableHead>Count</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tableData.map((row, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{row.department}</TableCell>
                  <TableCell>{row.recruiter}</TableCell>
                  <TableCell>{row.candidate}</TableCell>
                  <TableCell>{row.count}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-6 text-center">
          <p className="text-indigo-600" style={{ fontSize: 32, fontWeight: 700 }}>{totalHires}</p>
          <p className="text-gray-500 mt-1" style={{ fontSize: 12 }}>Total Hires This Quarter</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-6 text-center">
          <p className="text-indigo-600" style={{ fontSize: 32, fontWeight: 700 }}>Engineering</p>
          <p className="text-gray-500 mt-1" style={{ fontSize: 12 }}>Top Hiring Department</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-6 text-center">
          <p className="text-indigo-600" style={{ fontSize: 32, fontWeight: 700 }}>9</p>
          <p className="text-gray-500 mt-1" style={{ fontSize: 12 }}>Most Hires (Engineering)</p>
        </div>
      </div>
    </div>
  );
};

export default HiresCurrentQuarter;
