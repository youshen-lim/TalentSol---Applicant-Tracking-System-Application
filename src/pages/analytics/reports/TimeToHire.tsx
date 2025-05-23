import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ReportHeader from "@/components/analytics/ReportHeader";
import { BarChart } from "@/components/dashboard/BarChart";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

/**
 * TimeToHire component
 * Displays a report of average time to hire metrics by department and candidate
 */
const TimeToHire = () => {
  const [viewOption, setViewOption] = useState("visualization");
  const [timeRange, setTimeRange] = useState("quarter");
  const [chartType, setChartType] = useState("department");

  // Sample data for time to hire by department
  const departmentTimeData = [
    { name: 'Engineering', days: 32, color: '#8884d8' },
    { name: 'Product', days: 28, color: '#82ca9d' },
    { name: 'Design', days: 24, color: '#ffc658' },
    { name: 'Marketing', days: 21, color: '#ff8042' },
    { name: 'Sales', days: 18, color: '#0088fe' },
    { name: 'Customer Success', days: 15, color: '#00c49f' },
    { name: 'Finance', days: 30, color: '#ffbb28' },
    { name: 'HR', days: 22, color: '#ff8042' },
    { name: 'Operations', days: 26, color: '#8884d8' },
    { name: 'Legal', days: 35, color: '#82ca9d' },
  ];

  // Sample data for time to hire by candidate by department
  const candidateTimeData = [
    { name: 'Engineering', senior: 38, mid: 32, junior: 25 },
    { name: 'Product', senior: 34, mid: 28, junior: 22 },
    { name: 'Design', senior: 30, mid: 24, junior: 18 },
    { name: 'Marketing', senior: 28, mid: 21, junior: 16 },
    { name: 'Sales', senior: 24, mid: 18, junior: 14 },
    { name: 'Customer Success', senior: 20, mid: 15, junior: 12 },
    { name: 'Finance', senior: 36, mid: 30, junior: 24 },
    { name: 'HR', senior: 28, mid: 22, junior: 18 },
    { name: 'Operations', senior: 32, mid: 26, junior: 20 },
    { name: 'Legal', senior: 40, mid: 35, junior: 30 },
  ];

  // Sample data for the table view
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

  // Department data for filtering
  const departments = [
    { value: 'all', label: 'All Departments' },
    { value: 'engineering', label: 'Engineering' },
    { value: 'product', label: 'Product' },
    { value: 'design', label: 'Design' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'sales', label: 'Sales' },
    { value: 'customer-success', label: 'Customer Success' },
  ];

  return (
    <div className="space-y-8">
      <ReportHeader
        title="Time to Hire"
        subtitle="Core Report"
      />

      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <label className="text-sm font-medium mb-2 block">Department</label>
              <Select defaultValue="all">
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept.value} value={dept.value}>
                      {dept.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Time Range</label>
              <Select defaultValue={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select time range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="month">Last Month</SelectItem>
                  <SelectItem value="quarter">Current Quarter</SelectItem>
                  <SelectItem value="year">Last Year</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Job Type</label>
              <Select defaultValue="all">
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select job type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Job Types</SelectItem>
                  <SelectItem value="full-time">Full Time</SelectItem>
                  <SelectItem value="part-time">Part Time</SelectItem>
                  <SelectItem value="contract">Contract</SelectItem>
                  <SelectItem value="internship">Internship</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Chart Type</label>
              <Select defaultValue={chartType} onValueChange={setChartType}>
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
        </CardContent>
      </Card>

      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Results</h3>
        <div className="text-sm text-gray-500">Last Updated: 1 day ago</div>
      </div>

      <Tabs defaultValue="visualization" value={viewOption} onValueChange={setViewOption}>
        <TabsList variant="ats-blue">
          <TabsTrigger value="visualization" variant="ats-blue">Visualization</TabsTrigger>
          <TabsTrigger value="table" variant="ats-blue">Table</TabsTrigger>
        </TabsList>
        <TabsContent value="visualization" className="pt-4">
          <Card>
            <CardContent className="p-6">
              {chartType === "department" ? (
                <BarChart
                  title="Average Time to Hire by Department"
                  description={`Average days from application to hire (${timeRange === 'quarter' ? 'Current Quarter' : timeRange === 'month' ? 'Last Month' : 'Last Year'})`}
                  data={departmentTimeData}
                  bars={[{ dataKey: "days", fill: "#3B82F6", name: "Days" }]}
                  vertical={false}
                  height={400}
                  variant="ats-blue"
                />
              ) : (
                <BarChart
                  title="Average Time to Hire by Candidate Level"
                  description={`Average days from application to hire by seniority level (${timeRange === 'quarter' ? 'Current Quarter' : timeRange === 'month' ? 'Last Month' : 'Last Year'})`}
                  data={candidateTimeData}
                  bars={[
                    { dataKey: "senior", fill: "#2563EB", name: "Senior" },
                    { dataKey: "mid", fill: "#3B82F6", name: "Mid-level" },
                    { dataKey: "junior", fill: "#60A5FA", name: "Junior" }
                  ]}
                  vertical={false}
                  height={400}
                  variant="ats-blue"
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="table" className="pt-4">
          <Card>
            <CardContent className="p-0">
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
                  {tableData.map((row, index) => (
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
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-ats-blue">24.6</div>
              <div className="text-sm text-gray-500 mt-1">Overall Avg. Time to Hire (Days)</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-ats-blue">32</div>
              <div className="text-sm text-gray-500 mt-1">Longest Dept. Time to Hire (Engineering)</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-ats-blue">15</div>
              <div className="text-sm text-gray-500 mt-1">Shortest Dept. Time to Hire (Customer Success)</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TimeToHire;
