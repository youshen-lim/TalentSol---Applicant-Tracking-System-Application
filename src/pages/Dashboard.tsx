import React, { useState } from "react";
import { ArrowUpRight, Users, Briefcase, Clock, Calendar, Download, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import StatCard from "@/components/dashboard/StatCard";
import LineChart from "@/components/dashboard/LineChart";
import BarChart from "@/components/dashboard/BarChart";
import ExportReportModal from "@/components/dashboard/ExportReportModal";
import AddCandidateModal from "@/components/dashboard/AddCandidateModal";

// Import API hooks
import { useDashboardStats, useRecruitmentData, useSourceData } from "@/hooks/useAnalytics";
import { useUpcomingInterviews } from "@/hooks/useInterviews";
import { applicationApi } from "@/services/api";

/**
 * Dashboard page component
 * Displays key metrics and charts for the TalentSol ATS
 */
const Dashboard = () => {
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [addCandidateModalOpen, setAddCandidateModalOpen] = useState(false);

  // API hooks for real data
  const { stats: dashboardStats, loading: statsLoading } = useDashboardStats();
  const { data: recruitmentData, loading: recruitmentLoading } = useRecruitmentData();
  const { data: sourceData, loading: sourceLoading } = useSourceData();
  const { interviews: upcomingInterviews, loading: interviewsLoading } = useUpcomingInterviews();

  // State for recent applications
  const [recentApplications, setRecentApplications] = React.useState<any[]>([]);
  const [applicationsLoading, setApplicationsLoading] = React.useState(true);

  // Load recent applications
  React.useEffect(() => {
    const loadRecentApplications = async () => {
      try {
        setApplicationsLoading(true);
        const response = await applicationApi.getApplications({ limit: 5, sortBy: 'createdAt', sortOrder: 'desc' });
        setRecentApplications(response.data || []);
      } catch (error) {
        console.error('Failed to load recent applications:', error);
        setRecentApplications([]);
      } finally {
        setApplicationsLoading(false);
      }
    };

    loadRecentApplications();
  }, []);

  // Fallback data for when API is not available
  const fallbackRecruitmentData = [
    { name: 'Jan', applications: 65, interviews: 28, offers: 15 },
    { name: 'Feb', applications: 59, interviews: 32, offers: 12 },
    { name: 'Mar', applications: 80, interviews: 45, offers: 18 },
    { name: 'Apr', applications: 81, interviews: 42, offers: 22 },
    { name: 'May', applications: 56, interviews: 30, offers: 19 },
    { name: 'Jun', applications: 55, interviews: 35, offers: 20 },
    { name: 'Jul', applications: 40, interviews: 22, offers: 8 },
  ];

  const fallbackSourceData = [
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
          <Button
            variant="outline"
            size="sm"
            onClick={() => setExportModalOpen(true)}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export Report
          </Button>
          <Button
            size="sm"
            className="bg-ats-blue hover:bg-ats-dark-blue flex items-center gap-2"
            onClick={() => setAddCandidateModalOpen(true)}
          >
            <Plus className="h-4 w-4" />
            Add Candidate
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Candidates"
          value={statsLoading ? "..." : (dashboardStats?.totalCandidates?.toString() || "342")}
          description="Last 30 days"
          icon={<Users className="h-4 w-4 text-ats-blue" />}
          change={{ value: 12, positive: true }}
        />
        <StatCard
          title="Open Positions"
          value={statsLoading ? "..." : (dashboardStats?.activeJobs?.toString() || "18")}
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
          value={interviewsLoading ? "..." : (upcomingInterviews?.length?.toString() || "24")}
          description="8 scheduled for today"
          icon={<Calendar className="h-4 w-4 text-ats-blue" />}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <LineChart
          title="Recruitment Pipeline"
          description="Tracking applications, interviews, and offers"
          data={recruitmentData?.data || fallbackRecruitmentData}
          lines={[
            { dataKey: "applications", stroke: "#3B82F6", name: "Applications" },
            { dataKey: "interviews", stroke: "#38BDF8", name: "Interviews" },
            { dataKey: "offers", stroke: "#4ADE80", name: "Offers" },
          ]}
        />
        <BarChart
          title="Candidate Sources"
          description="Breakdown of candidates by source"
          data={sourceData?.sources || fallbackSourceData}
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
            {interviewsLoading ? (
              <div className="text-center text-gray-500 py-4">Loading interviews...</div>
            ) : upcomingInterviews && upcomingInterviews.length > 0 ? (
              upcomingInterviews.slice(0, 3).map((interview) => (
                <div key={interview.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                  <div>
                    <div className="font-medium">{interview.candidateName}</div>
                    <div className="text-xs text-gray-500">{interview.position} • {interview.type}</div>
                  </div>
                  <div className="text-xs font-medium">
                    {new Date(interview.dateTime).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              ))
            ) : (
              <>
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
              </>
            )}
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
            {applicationsLoading ? (
              <div className="text-center text-gray-500 py-4">Loading applications...</div>
            ) : recentApplications && recentApplications.length > 0 ? (
              recentApplications.slice(0, 3).map((application) => (
                <div key={application.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                  <div>
                    <div className="font-medium">{application.candidateName || `${application.firstName} ${application.lastName}`}</div>
                    <div className="text-xs text-gray-500">{application.jobTitle || application.position}</div>
                  </div>
                  <div className="text-xs font-medium">
                    {new Date(application.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric'
                    })}
                  </div>
                </div>
              ))
            ) : (
              <>
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
              </>
            )}
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

      {/* Modals */}
      <ExportReportModal
        open={exportModalOpen}
        onOpenChange={setExportModalOpen}
      />
      <AddCandidateModal
        open={addCandidateModalOpen}
        onOpenChange={setAddCandidateModalOpen}
      />
    </div>
  );
};

export default Dashboard;
