import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Sparkles, UserCheck, Zap, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { RecommendationAnalyticsDashboard } from "@/components/ml/RecommendationAnalyticsDashboard";

/**
 * MLReports component
 * Displays machine learning generated reports for the TalentSol ATS
 */
const MLReports = () => {
  // Sample ML reports
  const mlReports = [
    {
      id: "candidate-recommendations",
      title: "Candidate Recommendations",
      description: "AI-powered candidate matches for open positions",
      icon: <UserCheck className="h-5 w-5 text-ats-blue" />,
      lastUpdated: "1 hour ago",
      path: "/analytics/reports/candidate-recommendations",
      beta: true
    },
    {
      id: "hiring-predictions",
      title: "Hiring Predictions",
      description: "Forecast hiring timelines based on historical data",
      icon: <Sparkles className="h-5 w-5 text-ats-blue" />,
      lastUpdated: "3 hours ago",
      path: "/analytics/reports/hiring-predictions",
      beta: true
    },
    {
      id: "talent-insights",
      title: "Talent Insights",
      description: "AI analysis of candidate pool and market trends",
      icon: <Zap className="h-5 w-5 text-ats-blue" />,
      lastUpdated: "1 day ago",
      path: "/analytics/reports/talent-insights",
      beta: true
    },
    {
      id: "ml-analytics",
      title: "ML Analytics Dashboard",
      description: "Real-time performance metrics and analytics for ML recommendation models",
      icon: <BarChart3 className="h-5 w-5 text-ats-blue" />,
      lastUpdated: "Live",
      path: "/analytics/ml-dashboard",
      beta: false,
      featured: true
    }
  ];

  return (
    <div className="space-y-6">
      <Alert className="bg-ats-blue/5 border-ats-blue/20">
        <Brain className="h-4 w-4 text-ats-blue" />
        <AlertTitle>Machine Learning Reports</AlertTitle>
        <AlertDescription>
          These reports use machine learning to provide insights and recommendations.
          This is an experimental feature currently in beta.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mlReports.map((report) => (
          <Link to={report.path} key={report.id} className="block">
            <Card className={`h-full hover:shadow-md transition-shadow cursor-pointer border-ats-blue/20 ${
              report.featured ? 'ring-2 ring-ats-blue/30 bg-gradient-to-br from-ats-blue/5 to-transparent' : ''
            }`}>
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-lg font-medium">{report.title}</CardTitle>
                    {report.beta && (
                      <Badge className="bg-ats-blue text-white">Beta</Badge>
                    )}
                    {report.featured && (
                      <Badge className="bg-green-600 text-white">Live</Badge>
                    )}
                  </div>
                  <CardDescription>{report.description}</CardDescription>
                </div>
                <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                  report.featured ? 'bg-ats-blue/20' : 'bg-ats-blue/10'
                }`}>
                  {report.icon}
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm">
                  <Badge variant="outline" className="text-xs">
                    {report.featured ? 'Analytics Dashboard' : 'ML Report'}
                  </Badge>
                  <span className="text-gray-500">Updated: {report.lastUpdated}</span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Featured ML Analytics Dashboard */}
      <div className="mt-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-ats-blue" />
          Live ML Analytics Dashboard
        </h3>
        <RecommendationAnalyticsDashboard
          timeRange="30d"
          autoRefresh={true}
        />
      </div>
    </div>
  );
};

export default MLReports;
