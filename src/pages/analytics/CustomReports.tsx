import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart2, Users, TrendingUp, Calendar, DollarSign, Building } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

/**
 * CustomReports component
 * Displays user-created custom reports for the TalentSol ATS
 */
const CustomReports = () => {
  // Sample custom reports
  const customReports = [
    {
      id: "engineering-hiring",
      title: "Engineering Hiring",
      description: "Track engineering recruitment metrics",
      icon: <Building className="h-5 w-5 text-ats-blue" />,
      lastUpdated: "5 hours ago",
      path: "/analytics/reports/engineering-hiring"
    },
    {
      id: "offer-acceptance-rate",
      title: "Offer Acceptance Rate",
      description: "Analyze offer acceptance by department",
      icon: <TrendingUp className="h-5 w-5 text-ats-blue" />,
      lastUpdated: "2 days ago",
      path: "/analytics/reports/offer-acceptance-rate"
    },
    {
      id: "salary-benchmarks",
      title: "Salary Benchmarks",
      description: "Compare compensation across roles",
      icon: <DollarSign className="h-5 w-5 text-ats-blue" />,
      lastUpdated: "1 week ago",
      path: "/analytics/reports/salary-benchmarks"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {customReports.map((report) => (
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
                  <Badge variant="outline" className="text-xs">Custom Report</Badge>
                  <span className="text-gray-500">Updated: {report.lastUpdated}</span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="flex justify-center mt-8">
        <Button className="bg-ats-blue hover:bg-ats-dark-blue text-white">
          Create Custom Report
        </Button>
      </div>
    </div>
  );
};

export default CustomReports;
