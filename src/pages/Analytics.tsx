import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart2, Download, Plus, FileText, Brain } from "lucide-react";
import CoreReports from "./analytics/CoreReports";
import CustomReports from "./analytics/CustomReports";
import MLReports from "./analytics/MLReports";

const Analytics = () => {
  const [activeTab, setActiveTab] = useState("core");

  return (
    <div className="p-6 space-y-5">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
            <BarChart2 size={16} className="text-indigo-600" />
          </div>
          <div>
            <h1 className="text-gray-900" style={{ fontSize: 20, fontWeight: 600 }}>Analytics</h1>
            <p className="text-gray-500 mt-0.5" style={{ fontSize: 13 }}>
              View and create reports to analyze your recruitment data
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 text-gray-700 transition-all">
            <Download size={15} />
            <span style={{ fontSize: 13, fontWeight: 500 }}>Export</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-all">
            <Plus size={15} />
            <span style={{ fontSize: 13, fontWeight: 500 }}>Create Report</span>
          </button>
        </div>
      </div>

      <Tabs defaultValue="core" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="core" className="flex items-center gap-2">
            <FileText size={14} />
            Core Reports
          </TabsTrigger>
          <TabsTrigger value="custom" className="flex items-center gap-2">
            <BarChart2 size={14} />
            Custom Reports
          </TabsTrigger>
          <TabsTrigger value="ml" className="flex items-center gap-2">
            <Brain size={14} />
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
