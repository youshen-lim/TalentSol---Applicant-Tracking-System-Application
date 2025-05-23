import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ReportHeader from "@/components/analytics/ReportHeader";
import { LineChart } from "@/components/dashboard/LineChart";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

/**
 * PipelineMetrics component
 * Displays a report of candidate pipeline metrics
 */
const PipelineMetrics = () => {
  const [viewOption, setViewOption] = useState("visualization");
  const [timeRange, setTimeRange] = useState("quarter");

  // Sample data for the pipeline metrics
  const pipelineData = [
    { name: 'Applied', screening: 199, interview: 120, offer: 46, hired: 32 },
    { name: 'Screening', screening: 150, interview: 100, offer: 40, hired: 28 },
    { name: 'Interview 1', screening: 120, interview: 80, offer: 35, hired: 25 },
    { name: 'Interview 2', screening: 90, interview: 60, offer: 30, hired: 20 },
    { name: 'Interview 3', screening: 70, interview: 50, offer: 25, hired: 18 },
    { name: 'Offer', screening: 50, interview: 40, offer: 20, hired: 15 },
    { name: 'Hired', screening: 30, interview: 25, offer: 15, hired: 10 },
  ];

  // Sample data for the table view
  const tableData = [
    { stage: 'Applied', candidates: 199, conversionRate: '75%', timeInStage: '2 days' },
    { stage: 'Screening', candidates: 150, conversionRate: '80%', timeInStage: '5 days' },
    { stage: 'Interview 1', candidates: 120, conversionRate: '75%', timeInStage: '7 days' },
    { stage: 'Interview 2', candidates: 90, conversionRate: '78%', timeInStage: '5 days' },
    { stage: 'Interview 3', candidates: 70, conversionRate: '71%', timeInStage: '4 days' },
    { stage: 'Offer', candidates: 50, conversionRate: '60%', timeInStage: '3 days' },
    { stage: 'Hired', candidates: 30, conversionRate: '100%', timeInStage: '0 days' },
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
        title="Pipeline Metrics"
        subtitle="Core Report"
      />

      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Results</h3>
        <div className="text-sm text-gray-500">Last Updated: 5 minutes ago</div>
      </div>

      <Tabs defaultValue="visualization" value={viewOption} onValueChange={setViewOption}>
        <TabsList variant="ats-blue">
          <TabsTrigger value="visualization" variant="ats-blue">Visualization</TabsTrigger>
          <TabsTrigger value="table" variant="ats-blue">Table</TabsTrigger>
        </TabsList>
        <TabsContent value="visualization" className="pt-4">
          <Card>
            <CardContent className="p-6">
              <LineChart
                title="Pipeline Progression"
                description={`Candidate progression through pipeline stages (${timeRange === 'quarter' ? 'Current Quarter' : timeRange === 'month' ? 'Last Month' : 'Last Year'})`}
                data={pipelineData}
                lines={[
                  { dataKey: "screening", stroke: "#3B82F6", name: "Screening" },
                  { dataKey: "interview", stroke: "#60A5FA", name: "Interview" },
                  { dataKey: "offer", stroke: "#2563EB", name: "Offer" },
                  { dataKey: "hired", stroke: "#1E40AF", name: "Hired" },
                ]}
                height={400}
                variant="ats-blue"
              />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="table" className="pt-4">
          <Card>
            <CardContent className="p-0">
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
                  {tableData.map((row, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{row.stage}</TableCell>
                      <TableCell>{row.candidates}</TableCell>
                      <TableCell>{row.conversionRate}</TableCell>
                      <TableCell>{row.timeInStage}</TableCell>
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
              <div className="text-4xl font-bold text-ats-blue">46</div>
              <div className="text-sm text-gray-500 mt-1">Active Candidates</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-ats-blue">18%</div>
              <div className="text-sm text-gray-500 mt-1">Offer Acceptance Rate</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-ats-blue">24 days</div>
              <div className="text-sm text-gray-500 mt-1">Avg. Time to Hire</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PipelineMetrics;
