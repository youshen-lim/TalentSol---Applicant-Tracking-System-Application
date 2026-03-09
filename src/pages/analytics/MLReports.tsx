import { Brain, Sparkles, UserCheck, Zap, BarChart3 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { RecommendationAnalyticsDashboard } from "@/components/ml/RecommendationAnalyticsDashboard";

const mlReports = [
  {
    id: "candidate-recommendations",
    title: "Candidate Recommendations",
    description: "AI-powered candidate matches for open positions",
    icon: UserCheck,
    lastUpdated: "1 hour ago",
    path: "/analytics/reports/candidate-recommendations",
    beta: true,
    featured: false,
  },
  {
    id: "hiring-predictions",
    title: "Hiring Predictions",
    description: "Forecast hiring timelines based on historical data",
    icon: Sparkles,
    lastUpdated: "3 hours ago",
    path: "/analytics/reports/hiring-predictions",
    beta: true,
    featured: false,
  },
  {
    id: "talent-insights",
    title: "Talent Insights",
    description: "AI analysis of candidate pool and market trends",
    icon: Zap,
    lastUpdated: "1 day ago",
    path: "/analytics/reports/talent-insights",
    beta: true,
    featured: false,
  },
  {
    id: "ml-analytics",
    title: "ML Analytics Dashboard",
    description: "Real-time performance metrics and analytics for ML recommendation models",
    icon: BarChart3,
    lastUpdated: "Live",
    path: "/analytics/ml-dashboard",
    beta: false,
    featured: true,
  },
];

const MLReports = () => {
  return (
    <div className="space-y-6">
      {/* Info banner */}
      <div className="flex items-start gap-3 bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-3">
        <Brain size={16} className="text-indigo-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-gray-900" style={{ fontSize: 13, fontWeight: 600 }}>Machine Learning Reports</p>
          <p className="text-gray-500 mt-0.5" style={{ fontSize: 12 }}>
            These reports use machine learning to provide insights and recommendations.
            This is an experimental feature currently in beta.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {mlReports.map((report) => (
          <Link to={report.path} key={report.id} className="block">
            <div className={`bg-white rounded-xl border p-5 hover:shadow-md transition-all cursor-pointer h-full ${
              report.featured ? "border-indigo-200 ring-1 ring-indigo-100" : "border-gray-100"
            }`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-gray-900 truncate" style={{ fontSize: 14, fontWeight: 600 }}>{report.title}</p>
                    {report.beta && (
                      <Badge className="bg-indigo-600 text-white text-[10px] px-1.5 py-0 shrink-0">Beta</Badge>
                    )}
                    {report.featured && (
                      <Badge className="bg-emerald-600 text-white text-[10px] px-1.5 py-0 shrink-0">Live</Badge>
                    )}
                  </div>
                  <p className="text-gray-500" style={{ fontSize: 12 }}>{report.description}</p>
                </div>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ml-3 ${
                  report.featured ? "bg-indigo-100" : "bg-indigo-50"
                }`}>
                  <report.icon size={18} className="text-indigo-600" />
                </div>
              </div>
              <div className="flex items-center justify-between mt-4">
                <Badge variant="outline" className="text-xs">
                  {report.featured ? "Analytics Dashboard" : "ML Report"}
                </Badge>
                <span className="text-gray-400" style={{ fontSize: 11 }}>Updated: {report.lastUpdated}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Live ML Analytics Dashboard */}
      <div className="mt-8">
        <h3 className="text-gray-900 mb-4 flex items-center gap-2" style={{ fontSize: 16, fontWeight: 600 }}>
          <BarChart3 size={18} className="text-indigo-600" />
          Live ML Analytics Dashboard
        </h3>
        <RecommendationAnalyticsDashboard timeRange="30d" autoRefresh={true} />
      </div>
    </div>
  );
};

export default MLReports;
