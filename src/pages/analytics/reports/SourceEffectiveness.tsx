import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ReportHeader from "@/components/analytics/ReportHeader";
import { BarChart } from "@/components/dashboard/BarChart";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

/**
 * SourceEffectiveness component
 * Displays a report of candidate sources by volume and conversion rate
 */
const SourceEffectiveness = () => {
  const [viewOption, setViewOption] = useState("visualization");
  const [timeRange, setTimeRange] = useState("quarter");
  const [chartType, setChartType] = useState("volume");

  // Sample data for candidate volume by source
  const sourceVolumeData = [
    { name: 'Career Site', candidates: 145, color: '#8884d8' },
    { name: 'LinkedIn', candidates: 120, color: '#82ca9d' },
    { name: 'Job Board', candidates: 95, color: '#ffc658' },
    { name: 'BuiltIn', candidates: 65, color: '#ff8042' },
    { name: 'Direct Sourcing', candidates: 85, color: '#0088fe' },
    { name: 'Referrals', candidates: 55, color: '#00c49f' },
    { name: 'Agencies', candidates: 40, color: '#ffbb28' },
    { name: 'Events', candidates: 30, color: '#ff8042' },
  ];

  // Sample data for conversion rate by source
  const sourceConversionData = [
    { name: 'Career Site', applied: 145, screened: 80, interviewed: 45, offered: 20, hired: 15 },
    { name: 'LinkedIn', applied: 120, screened: 70, interviewed: 40, offered: 18, hired: 12 },
    { name: 'Job Board', applied: 95, screened: 50, interviewed: 30, offered: 12, hired: 8 },
    { name: 'BuiltIn', applied: 65, screened: 40, interviewed: 25, offered: 10, hired: 6 },
    { name: 'Direct Sourcing', applied: 85, screened: 60, interviewed: 35, offered: 15, hired: 10 },
    { name: 'Referrals', applied: 55, screened: 40, interviewed: 30, offered: 18, hired: 14 },
    { name: 'Agencies', applied: 40, screened: 30, interviewed: 20, offered: 12, hired: 8 },
    { name: 'Events', applied: 30, screened: 20, interviewed: 15, offered: 8, hired: 5 },
  ];

  // Sample data for the table view
  const tableData = [
    { source: 'Career Site', candidates: 145, screened: 80, interviewed: 45, offered: 20, hired: 15, conversionRate: '10.3%', costPerHire: '$1,250' },
    { source: 'LinkedIn', candidates: 120, screened: 70, interviewed: 40, offered: 18, hired: 12, conversionRate: '10.0%', costPerHire: '$1,800' },
    { source: 'Job Board', candidates: 95, screened: 50, interviewed: 30, offered: 12, hired: 8, conversionRate: '8.4%', costPerHire: '$950' },
    { source: 'BuiltIn', candidates: 65, screened: 40, interviewed: 25, offered: 10, hired: 6, conversionRate: '9.2%', costPerHire: '$1,100' },
    { source: 'Direct Sourcing', candidates: 85, screened: 60, interviewed: 35, offered: 15, hired: 10, conversionRate: '11.8%', costPerHire: '$1,500' },
    { source: 'Referrals', candidates: 55, screened: 40, interviewed: 30, offered: 18, hired: 14, conversionRate: '25.5%', costPerHire: '$500' },
    { source: 'Agencies', candidates: 40, screened: 30, interviewed: 20, offered: 12, hired: 8, conversionRate: '20.0%', costPerHire: '$3,200' },
    { source: 'Events', candidates: 30, screened: 20, interviewed: 15, offered: 8, hired: 5, conversionRate: '16.7%', costPerHire: '$2,100' },
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
        title="Source Effectiveness"
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
                  <SelectItem value="volume">Candidate Volume</SelectItem>
                  <SelectItem value="conversion">Conversion Rate</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Results</h3>
        <div className="text-sm text-gray-500">Last Updated: 3 days ago</div>
      </div>

      <Tabs defaultValue="visualization" value={viewOption} onValueChange={setViewOption}>
        <TabsList variant="ats-blue">
          <TabsTrigger value="visualization" variant="ats-blue">Visualization</TabsTrigger>
          <TabsTrigger value="table" variant="ats-blue">Table</TabsTrigger>
        </TabsList>
        <TabsContent value="visualization" className="pt-4">
          <Card>
            <CardContent className="p-6">
              {chartType === "volume" ? (
                <BarChart
                  title="Candidate Volume by Source"
                  description={`Number of candidates from each source (${timeRange === 'quarter' ? 'Current Quarter' : timeRange === 'month' ? 'Last Month' : 'Last Year'})`}
                  data={sourceVolumeData}
                  bars={[{ dataKey: "candidates", fill: "#3B82F6", name: "Candidates" }]}
                  vertical={false}
                  height={400}
                  variant="ats-blue"
                />
              ) : (
                <BarChart
                  title="Conversion Rate by Source"
                  description={`Candidate progression by source (${timeRange === 'quarter' ? 'Current Quarter' : timeRange === 'month' ? 'Last Month' : 'Last Year'})`}
                  data={sourceConversionData}
                  bars={[
                    { dataKey: "screened", fill: "#60A5FA", name: "Screened" },
                    { dataKey: "interviewed", fill: "#3B82F6", name: "Interviewed" },
                    { dataKey: "offered", fill: "#2563EB", name: "Offered" },
                    { dataKey: "hired", fill: "#1E40AF", name: "Hired" }
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
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-ats-blue">635</div>
              <div className="text-sm text-gray-500 mt-1">Total Candidates</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-ats-blue">25.5%</div>
              <div className="text-sm text-gray-500 mt-1">Best Conversion Rate (Referrals)</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-ats-blue">$500</div>
              <div className="text-sm text-gray-500 mt-1">Lowest Cost Per Hire (Referrals)</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SourceEffectiveness;
