import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart2, Download, Plus, FileText, Brain } from "lucide-react";
import CoreReports from "./analytics/CoreReports";
import CustomReports from "./analytics/CustomReports";
import MLReports from "./analytics/MLReports";

/**
 * Analytics page component
 * Displays analytics and reports for the TalentSol ATS
 * Uses tabs to organize different types of reports
 */
const Analytics = () => {
  const [activeTab, setActiveTab] = useState("core");

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
          <p className="text-sm text-gray-500">
            View and create reports to analyze your recruitment data
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button size="sm" variant="default" className="bg-ats-blue hover:bg-ats-dark-blue text-white">
            <Plus className="h-4 w-4 mr-2" />
            Create Report
          </Button>
        </div>
      </div>

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
