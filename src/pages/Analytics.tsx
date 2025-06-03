import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart2, Download, Plus, FileText, Brain } from "lucide-react";
import CoreReports from "./analytics/CoreReports";
import CustomReports from "./analytics/CustomReports";
import MLReports from "./analytics/MLReports";
import PageHeader from "@/components/layout/PageHeader";

/**
 * Analytics page component
 * Displays analytics and reports for the TalentSol ATS
 * Uses tabs to organize different types of reports
 */
const Analytics = () => {
  const [activeTab, setActiveTab] = useState("core");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics"
        subtitle="View and create reports to analyze your recruitment data"
        icon={BarChart2}
      >
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
        <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
          <Plus className="h-4 w-4 mr-2" />
          Create Report
        </Button>
      </PageHeader>

      <Tabs
        defaultValue="core"
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-3 mb-6" variant="ats-blue">
          <TabsTrigger value="core" className="flex items-center" variant="ats-blue">
            <FileText className="h-4 w-4 mr-2" />
            Core Reports
          </TabsTrigger>
          <TabsTrigger value="custom" className="flex items-center" variant="ats-blue">
            <BarChart2 className="h-4 w-4 mr-2" />
            Custom Reports
          </TabsTrigger>
          <TabsTrigger value="ml" className="flex items-center" variant="ats-blue">
            <Brain className="h-4 w-4 mr-2" />
            ML Reports
          </TabsTrigger>
        </TabsList>

        <TabsContent value="core" className="space-y-6">
          <CoreReports />
        </TabsContent>

        <TabsContent value="custom" className="space-y-6">
          <CustomReports />
        </TabsContent>

        <TabsContent value="ml" className="space-y-6">
          <MLReports />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Analytics;
