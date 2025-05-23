import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart2, Users, TrendingUp, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

/**
 * CoreReports component
 * Displays standard/core reports for the TalentSol ATS
 */
const CoreReports = () => {
  // Sample core reports
  const coreReports = [
    {
      id: "hires-current-quarter",
      title: "Hires in Current Quarter",
      description: "Track hiring progress for the current quarter",
      icon: <Users className="h-5 w-5 text-ats-blue" />,
      lastUpdated: "2 minutes ago",
      path: "/analytics/reports/hires-current-quarter"
    },
    {
      id: "pipeline-metrics",
      title: "Pipeline Metrics",
      description: "Analyze candidate pipeline conversion rates",
      icon: <TrendingUp className="h-5 w-5 text-ats-blue" />,
      lastUpdated: "1 hour ago",
      path: "/analytics/reports/pipeline-metrics"
    },
    {
      id: "time-to-hire",
      title: "Time to Hire",
      description: "Measure average time to hire by department",
      icon: <Calendar className="h-5 w-5 text-ats-blue" />,
      lastUpdated: "1 day ago",
      path: "/analytics/reports/time-to-hire"
    },
    {
      id: "source-effectiveness",
      title: "Source Effectiveness",
      description: "Compare candidate sources by quality and volume",
      icon: <BarChart2 className="h-5 w-5 text-ats-blue" />,
      lastUpdated: "3 days ago",
      path: "/analytics/reports/source-effectiveness"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {coreReports.map((report) => (
          <Link to={report.path} key={report.id} className="block">
            <Card className="h-full hover:shadow-md transition-shadow cursor-pointer border-ats-blue/20">
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <div className="space-y-1">
                  <CardTitle className="text-lg font-medium">{report.title}</CardTitle>
                  <CardDescription>{report.description}</CardDescription>
                </div>
                <div className="h-10 w-10 bg-ats-blue/10 rounded-full flex items-center justify-center">
                  {report.icon}
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm">
                  <Badge variant="outline" className="text-xs">Core Report</Badge>
                  <span className="text-gray-500">Updated: {report.lastUpdated}</span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default CoreReports;
