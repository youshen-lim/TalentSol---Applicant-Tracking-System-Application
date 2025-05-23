import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import ReportHeader from "@/components/analytics/ReportHeader";
import { BarChart } from "@/components/dashboard/BarChart";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

/**
 * HiresCurrentQuarter component
 * Displays a report of hires in the current quarter
 * Based on the Ashby ATS interface shown in the image
 */
const HiresCurrentQuarter = () => {
  const [viewOption, setViewOption] = useState("visualization");

  // Sample data for the report
  const hiresData = [
    { name: 'Accounting', candidates: 2, color: '#8884d8' },
    { name: 'Analytics', candidates: 2, color: '#82ca9d' },
    { name: 'BD', candidates: 6, color: '#ffc658' },
    { name: 'Communications', candidates: 1, color: '#ff8042' },
    { name: 'Compliance', candidates: 5, color: '#0088fe' },
    { name: 'Customer Success', candidates: 3, color: '#00c49f' },
    { name: 'Data', candidates: 5, color: '#ffbb28' },
    { name: 'Design', candidates: 5, color: '#ff8042' },
    { name: 'Engineering', candidates: 9, color: '#8884d8' },
    { name: 'Facilities', candidates: 8, color: '#82ca9d' },
    { name: 'IT', candidates: 1, color: '#ffc658' },
    { name: 'Sales', candidates: 1, color: '#ff8042' },
  ];

  // Sample data for the table view
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

  return (
    <div className="space-y-8">
      <ReportHeader
        title="Hires in Current Quarter"
        subtitle="Build a Report"
        showLocationFilter={true}
        showUnsavedBadge={true}
      />

      <Card>
        <CardContent className="p-6">
          <div className="space-y-6">
            <div className="flex flex-col space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">1</span>
                  <h3 className="text-base font-medium">Application's Job's Department</h3>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4">
                    <path d="M4.5 6.5L7.5 9.5L10.5 6.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                  </svg>
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">2</span>
                  <h3 className="text-base font-medium">Application's Recruiter</h3>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4">
                    <path d="M4.5 6.5L7.5 9.5L10.5 6.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                  </svg>
                </Button>
              </div>
            </div>

            <Button variant="outline" size="sm" className="text-ats-blue border-ats-blue/20 hover:bg-ats-blue/10">
              <Plus className="h-4 w-4 mr-2" />
              Add Field to Group By
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="space-y-6">
            <h3 className="text-base font-medium flex items-center">
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2">
                <path d="M7.5 0.875C4.32 0.875 1.75 3.445 1.75 6.625C1.75 9.805 4.32 12.375 7.5 12.375C10.68 12.375 13.25 9.805 13.25 6.625C13.25 3.445 10.68 0.875 7.5 0.875ZM7.5 11.125C5.02 11.125 3 9.105 3 6.625C3 4.145 5.02 2.125 7.5 2.125C9.98 2.125 12 4.145 12 6.625C12 9.105 9.98 11.125 7.5 11.125Z" fill="currentColor"/>
                <path d="M7.5 3.375C7.5 3.72018 7.22018 4 6.875 4C6.52982 4 6.25 3.72018 6.25 3.375C6.25 3.02982 6.52982 2.75 6.875 2.75C7.22018 2.75 7.5 3.02982 7.5 3.375Z" fill="currentColor"/>
                <path d="M6.5 5.125C6.5 4.85886 6.71386 4.625 7 4.625C7.28614 4.625 7.5 4.83586 7.5 5.125V9.125C7.5 9.39114 7.28614 9.625 7 9.625C6.71386 9.625 6.5 9.41414 6.5 9.125V5.125Z" fill="currentColor"/>
              </svg>
              View Options
            </h3>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Show</label>
                <select className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm">
                  <option>Count</option>
                  <option>Sum</option>
                  <option>Average</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Chart</label>
                <select className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm">
                  <option>Bar</option>
                  <option>Line</option>
                  <option>Pie</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Sort</label>
                <select className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm">
                  <option>None</option>
                  <option>Ascending</option>
                  <option>Descending</option>
                </select>
              </div>
            </div>

            <Button variant="outline" size="sm" className="text-ats-blue border-ats-blue/20 hover:bg-ats-blue/10">
              <Plus className="h-4 w-4 mr-2" />
              Add Line
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Results</h3>
        <div className="text-sm text-gray-500">Last Updated: 2 minutes ago</div>
      </div>

      <Tabs defaultValue="visualization" value={viewOption} onValueChange={setViewOption}>
        <TabsList variant="ats-blue">
          <TabsTrigger value="visualization" variant="ats-blue">Visualization</TabsTrigger>
          <TabsTrigger value="table" variant="ats-blue">Table</TabsTrigger>
        </TabsList>
        <TabsContent value="visualization" className="pt-4">
          <Card>
            <CardContent className="p-6">
              <BarChart
                title="Hires by Department"
                description="Total: 48 hires in current quarter"
                data={hiresData}
                bars={[{ dataKey: "candidates", fill: "#3B82F6", name: "Hires" }]}
                vertical={false}
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
                    <TableHead>Department</TableHead>
                    <TableHead>Recruiter</TableHead>
                    <TableHead>Candidate</TableHead>
                    <TableHead className="text-right">Count</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tableData.map((row, index) => (
                    <TableRow key={index}>
                      <TableCell>{row.department}</TableCell>
                      <TableCell>{row.recruiter}</TableCell>
                      <TableCell>{row.candidate}</TableCell>
                      <TableCell className="text-right">{row.count}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button className="bg-ats-blue hover:bg-ats-dark-blue text-white">
          Export
        </Button>
      </div>
    </div>
  );
};

export default HiresCurrentQuarter;
