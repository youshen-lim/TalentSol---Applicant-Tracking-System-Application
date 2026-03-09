import { Building, TrendingUp, DollarSign } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";

const customReports = [
  {
    id: "engineering-hiring",
    title: "Engineering Hiring",
    description: "Track engineering recruitment metrics",
    icon: Building,
    lastUpdated: "5 hours ago",
    path: "/analytics/reports/engineering-hiring",
  },
  {
    id: "offer-acceptance-rate",
    title: "Offer Acceptance Rate",
    description: "Analyze offer acceptance by department",
    icon: TrendingUp,
    lastUpdated: "2 days ago",
    path: "/analytics/reports/offer-acceptance-rate",
  },
  {
    id: "salary-benchmarks",
    title: "Salary Benchmarks",
    description: "Compare compensation across roles",
    icon: DollarSign,
    lastUpdated: "1 week ago",
    path: "/analytics/reports/salary-benchmarks",
  },
];

const CustomReports = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-6">
        {customReports.map((report) => (
          <Link to={report.path} key={report.id} className="block">
            <div className="bg-white rounded-xl border border-indigo-100 p-5 hover:shadow-md transition-all cursor-pointer h-full">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-gray-900" style={{ fontSize: 14, fontWeight: 600 }}>{report.title}</p>
                  <p className="text-gray-500 mt-0.5" style={{ fontSize: 12 }}>{report.description}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center shrink-0">
                  <report.icon size={18} className="text-indigo-600" />
                </div>
              </div>
              <div className="flex items-center justify-between mt-4">
                <Badge variant="outline" className="text-xs">Custom Report</Badge>
                <span className="text-gray-400" style={{ fontSize: 11 }}>Updated: {report.lastUpdated}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="flex justify-center mt-8">
        <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-all">
          <Plus size={15} />
          <span style={{ fontSize: 13, fontWeight: 500 }}>Create Custom Report</span>
        </button>
      </div>
    </div>
  );
};

export default CustomReports;
