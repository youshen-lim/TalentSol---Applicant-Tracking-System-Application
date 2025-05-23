import { ArrowUpRight, Users, Briefcase, Clock, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import StatCard from "@/components/dashboard/StatCard";
import LineChart from "@/components/dashboard/LineChart";
import BarChart from "@/components/dashboard/BarChart";

/**
 * Dashboard page component
 * Displays key metrics and charts for the TalentSol ATS
 */
const Dashboard = () => {
  // Enhanced recruitment data with applications, interviews, and offers
  const recruitmentData = [
    { name: 'Jan', applications: 65, interviews: 28, offers: 15 },
    { name: 'Feb', applications: 59, interviews: 32, offers: 12 },
    { name: 'Mar', applications: 80, interviews: 45, offers: 18 },
    { name: 'Apr', applications: 81, interviews: 42, offers: 22 },
    { name: 'May', applications: 56, interviews: 30, offers: 19 },
    { name: 'Jun', applications: 55, interviews: 35, offers: 20 },
    { name: 'Jul', applications: 40, interviews: 22, offers: 8 },
  ];

  // Candidate source data
  const sourceData = [
    { name: 'LinkedIn', candidates: 45 },
    { name: 'Indeed', candidates: 30 },
    { name: 'Referrals', candidates: 25 },
    { name: 'Company Website', candidates: 20 },
    { name: 'Others', candidates: 10 },
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-gray-500">
            Overview of your recruitment operations
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="sm">
            Export Report
          </Button>
          <Button size="sm" className="bg-ats-blue hover:bg-ats-dark-blue">
            Add Candidate
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Candidates"
          value="342"
          description="Last 30 days"
          icon={<Users className="h-4 w-4 text-ats-blue" />}
          change={{ value: 12, positive: true }}
        />
        <StatCard
          title="Open Positions"
          value="18"
          description="Across 5 departments"
          icon={<Briefcase className="h-4 w-4 text-ats-blue" />}
          change={{ value: 3, positive: true }}
        />
        <StatCard
          title="Time to Hire"
          value="18 days"
          description="Average this quarter"
          icon={<Clock className="h-4 w-4 text-ats-blue" />}
          change={{ value: 5, positive: false }}
        />
        <StatCard
          title="Interviews This Week"
          value="24"
          description="8 scheduled for today"
          icon={<Calendar className="h-4 w-4 text-ats-blue" />}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <LineChart
          title="Recruitment Pipeline"
          description="Tracking applications, interviews, and offers"
          data={recruitmentData}
          lines={[
            { dataKey: "applications", stroke: "#3B82F6", name: "Applications" },
            { dataKey: "interviews", stroke: "#38BDF8", name: "Interviews" },
            { dataKey: "offers", stroke: "#4ADE80", name: "Offers" },
          ]}
        />
        <BarChart
          title="Candidate Sources"
          description="Breakdown of candidates by source"
          data={sourceData}
          bars={[{ dataKey: "candidates", fill: "#3B82F6", name: "Candidates" }]}
          vertical={true}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="bg-white p-6 rounded-lg border h-[280px] flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-medium">Upcoming Interviews</h3>
            <p className="text-sm text-gray-500">Next 7 days</p>
          </div>

          <div className="space-y-3 mt-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
              <div>
                <div className="font-medium">John Smith</div>
                <div className="text-xs text-gray-500">React Developer • Technical Interview</div>
              </div>
              <div className="text-xs font-medium">Today, 2:00 PM</div>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
              <div>
                <div className="font-medium">Emma Johnson</div>
                <div className="text-xs text-gray-500">Product Designer • Portfolio Review</div>
              </div>
              <div className="text-xs font-medium">Tomorrow, 11:00 AM</div>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
              <div>
                <div className="font-medium">Michael Brown</div>
                <div className="text-xs text-gray-500">Marketing Lead • First Interview</div>
              </div>
              <div className="text-xs font-medium">Jul 23, 3:30 PM</div>
            </div>
          </div>

          <Button variant="ghost" size="sm" className="justify-start w-fit px-0 text-ats-blue mt-3">
            View all interviews
            <ArrowUpRight className="ml-1 h-3 w-3" />
          </Button>
        </div>

        <div className="bg-white p-6 rounded-lg border h-[280px] flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-medium">Recent Applications</h3>
            <p className="text-sm text-gray-500">Last 7 days</p>
          </div>

          <div className="space-y-3 mt-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
              <div>
                <div className="font-medium">Sarah Wilson</div>
                <div className="text-xs text-gray-500">UX/UI Designer</div>
              </div>
              <div className="text-xs font-medium">2 hours ago</div>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
              <div>
                <div className="font-medium">David Lee</div>
                <div className="text-xs text-gray-500">Backend Engineer</div>
              </div>
              <div className="text-xs font-medium">Yesterday</div>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
              <div>
                <div className="font-medium">Lisa Chen</div>
                <div className="text-xs text-gray-500">Product Manager</div>
              </div>
              <div className="text-xs font-medium">Jul 20</div>
            </div>
          </div>

          <Button variant="ghost" size="sm" className="justify-start w-fit px-0 text-ats-blue mt-3">
            View all applications
            <ArrowUpRight className="ml-1 h-3 w-3" />
          </Button>
        </div>

        <div className="bg-white p-6 rounded-lg border h-[280px] flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-medium">Top Job Openings</h3>
            <p className="text-sm text-gray-500">By application volume</p>
          </div>

          <div className="space-y-3 mt-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
              <div>
                <div className="font-medium">Senior React Developer</div>
                <div className="text-xs text-gray-500">Engineering • Remote</div>
              </div>
              <div className="text-xs font-medium text-ats-blue">42 applications</div>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
              <div>
                <div className="font-medium">Product Designer</div>
                <div className="text-xs text-gray-500">Design • San Francisco</div>
              </div>
              <div className="text-xs font-medium text-ats-blue">36 applications</div>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
              <div>
                <div className="font-medium">Sales Representative</div>
                <div className="text-xs text-gray-500">Sales • New York</div>
              </div>
              <div className="text-xs font-medium text-ats-blue">29 applications</div>
            </div>
          </div>

          <Button variant="ghost" size="sm" className="justify-start w-fit px-0 text-ats-blue mt-3">
            View all jobs
            <ArrowUpRight className="ml-1 h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
