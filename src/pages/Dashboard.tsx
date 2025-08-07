import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowUpRight, Users, Briefcase, Clock, Calendar, Download, Plus, BarChart2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { shadows } from "@/components/ui/shadow";
import StatCard from "@/components/dashboard/StatCard";
import LineChart from "@/components/dashboard/LineChart";
import BarChart from "@/components/dashboard/BarChart";
import ExportReportModal from "@/components/dashboard/ExportReportModal";
import AddCandidateModal from "@/components/dashboard/AddCandidateModal";
import PageHeader from "@/components/layout/PageHeader";
import LoadingUI from "@/components/ui/loading";

// Import API hooks
import { useDashboardStats, useRecruitmentData, useSourceData } from "@/hooks/useAnalytics";
import { useUpcomingInterviews } from "@/hooks/useInterviews";
import { applicationApi } from "@/services/api";

// Import chart enhancement utilities
import { calculateConversionRates, analyzeTrends, generateRankings, formatChartDates } from "@/utils/chartEnhancements";

/**
 * Dashboard page component
 * Displays key metrics and charts for the TalentSol ATS
 */
const Dashboard = () => {
  const navigate = useNavigate();
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [addCandidateModalOpen, setAddCandidateModalOpen] = useState(false);

  // API hooks for real data
  const { stats: dashboardStats, loading: statsLoading } = useDashboardStats();

  // Debug logging
  console.log('🔍 Dashboard Stats:', dashboardStats);
  console.log('🔍 Stats Loading:', statsLoading);
  const { data: recruitmentData, loading: recruitmentLoading } = useRecruitmentData();
  const { data: sourceData, loading: sourceLoading } = useSourceData();
  const { interviews: upcomingInterviews, loading: interviewsLoading } = useUpcomingInterviews();

  // Navigation handlers
  const handleViewAllInterviews = () => {
    navigate('/interviews');
  };

  const handleViewAllApplications = () => {
    navigate('/applications');
  };

  const handleViewAllJobs = () => {
    navigate('/jobs');
  };

  // Use data from analytics API instead of separate calls
  const recentApplications = dashboardStats?.recentApplications || [];
  const topJobs = dashboardStats?.topJobs || [];
  const applicationsLoading = statsLoading;
  const topJobsLoading = statsLoading;



  return (
    <div className="ats-page-layout">
      <div className="ats-content-container">
        <PageHeader
          title="Dashboard"
          subtitle="Overview of your recruitment operations"
          icon={BarChart2}
        >
          <Button
            variant="outline"
            size="sm"
            onClick={() => setExportModalOpen(true)}
            className="border-gray-300 hover:border-blue-500 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200"
          >
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button
            size="sm"
            onClick={() => setAddCandidateModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all duration-200"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Candidate
          </Button>
        </PageHeader>

        {/* Statistics Cards - Responsive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Candidates"
            value={statsLoading ? "..." : (dashboardStats?.summary?.totalCandidates?.toString() || "0")}
            description="Last 30 days"
            icon={<Users className="h-4 w-4 text-blue-600" />}
            change={dashboardStats?.changeMetrics?.totalCandidates ? {
              value: Math.abs(dashboardStats.changeMetrics.totalCandidates.change),
              positive: dashboardStats.changeMetrics.totalCandidates.change >= 0
            } : undefined}
          />
          <StatCard
            title="Open Positions"
            value={statsLoading ? "..." : (dashboardStats?.summary?.activeJobs?.toString() || "0")}
            description="Active job postings"
            icon={<Briefcase className="h-4 w-4 text-blue-600" />}
            change={dashboardStats?.changeMetrics?.activeJobs ? {
              value: Math.abs(dashboardStats.changeMetrics.activeJobs.change),
              positive: dashboardStats.changeMetrics.activeJobs.change >= 0
            } : undefined}
          />
          <StatCard
            title="Time to Hire"
            value={statsLoading ? "..." : (dashboardStats?.timeToHire?.averageDays ? `${dashboardStats.timeToHire.averageDays} days` : "0 days")}
            description="Average this quarter"
            icon={<Clock className="h-4 w-4 text-blue-600" />}
            change={dashboardStats?.changeMetrics?.timeToHire ? {
              value: Math.abs(dashboardStats.changeMetrics.timeToHire.change),
              positive: dashboardStats.changeMetrics.timeToHire.change <= 0 // For time to hire, lower is better
            } : undefined}
          />
          <StatCard
            title="Interviews This Week"
            value={interviewsLoading ? "..." : (upcomingInterviews?.length?.toString() || "0")}
            description={`${upcomingInterviews?.filter(i => {
              const today = new Date();
              const interviewDate = new Date(i.dateTime);
              return interviewDate.toDateString() === today.toDateString();
            }).length || 0} scheduled for today`}
            icon={<Calendar className="h-4 w-4 text-blue-600" />}
            change={dashboardStats?.changeMetrics?.interviews ? {
              value: Math.abs(dashboardStats.changeMetrics.interviews.change),
              positive: dashboardStats.changeMetrics.interviews.change >= 0
            } : undefined}
          />
        </div>

        {/* Charts Section - Responsive Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recruitment Pipeline Chart */}
          {recruitmentLoading ? (
            <div className={`${shadows.card} h-[400px]`}>
              <LoadingUI message="Loading recruitment data..." />
            </div>
          ) : recruitmentData?.data && recruitmentData.data.length > 0 ? (
            <div className={`${shadows.card} h-[400px]`}>
              <LineChart
                title="Recruitment Pipeline"
                description="Tracking applications, interviews, and offers"
                data={recruitmentData.data.map(item => ({
                  ...item,
                  name: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                }))}
                lines={[
                  { dataKey: "applications", stroke: "#2563EB", name: "Applications" },
                  { dataKey: "interviews", stroke: "#DC2626", name: "Interviews" },
                  { dataKey: "offers", stroke: "#059669", name: "Offers" },
                ]}
                height={400}
                showDots={true}
                showGrid={true}
                showTooltip={true}
                showLegend={true}
                valueFormatter={(value) => value.toString()}
                dateFormatter={(date) => date}
              />
            </div>
          ) : (
            <div className={`${shadows.card} p-6 h-[400px] flex items-center justify-center`}>
              <div className="text-center text-slate-500 text-base">No recruitment data available</div>
            </div>
          )}

          {/* Candidate Sources Chart */}
          {sourceLoading ? (
            <div className={`${shadows.card} h-[400px]`}>
              <LoadingUI message="Loading source data..." />
            </div>
          ) : sourceData?.sourceEffectiveness && sourceData.sourceEffectiveness.length > 0 ? (
            <div className={`${shadows.card} h-[400px]`}>
              <BarChart
                title="Candidate Sources"
                description="Breakdown of candidates by source"
                data={(() => {
                  const transformedData = sourceData.sourceEffectiveness
                    .map(item => ({
                      ...item,
                      name: item.source,
                      value: item.applications // Map applications to value for gradient coloring
                    }))
                    .sort((a, b) => (b.applications || 0) - (a.applications || 0)); // Sort by value descending

                  console.log('🔍 Source Data for Chart:', transformedData);
                  return transformedData;
                })()}
                bars={[{ dataKey: "applications", fill: "#2563EB", name: "Applications" }]}
                vertical={true}
                height={400}
                valueFormatter={(value) => `${value} candidates`}
                showTooltip={true}
                showLegend={false}
              />
            </div>
          ) : (
            <div className={`${shadows.card} p-6 h-[400px] flex items-center justify-center`}>
              <div className="text-center">
                <div className="text-slate-500 text-base mb-4">No source data available</div>
                <Button
                  onClick={async () => {
                    try {
                      await analyticsApi.initializeCandidateSources();
                      // Refresh source data
                      window.location.reload();
                    } catch (error) {
                      console.error('Failed to initialize sources:', error);
                    }
                  }}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Initialize Source Data
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Section Cards - Responsive Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

          {/* Upcoming Interviews Card */}
          <div className={`${shadows.card} flex flex-col h-[320px] sm:h-[350px]`}>
            <div className="p-6 pb-4 border-b border-slate-100">
              <h3 className="text-lg font-semibold text-slate-900">Upcoming Interviews</h3>
              <p className="text-sm text-slate-600 mt-1">Next 7 days</p>
            </div>

            <div className="p-6 space-y-3 flex-1 overflow-y-auto">
              {interviewsLoading ? (
                <LoadingUI message="Loading interviews..." />
              ) : upcomingInterviews && upcomingInterviews.length > 0 ? (
                upcomingInterviews.slice(0, 3).map((interview) => (
                  <div key={interview.id} className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100 hover:border-blue-200 transition-colors">
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-slate-900 truncate">{interview.candidateName}</div>
                      <div className="text-sm text-slate-600 truncate">{interview.position} • {interview.type}</div>
                    </div>
                    <div className="text-sm font-medium text-blue-600 ml-3 flex-shrink-0">
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
                <div className="text-center text-slate-500 py-8 text-base">No upcoming interviews</div>
              )}
            </div>

            <div className="p-6 pt-4 border-t border-slate-100">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleViewAllInterviews}
                className="justify-start w-fit px-0 text-blue-600 hover:text-blue-700 font-medium"
              >
                View all interviews
                <ArrowUpRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Recent Applications Card */}
          <div className={`${shadows.card} flex flex-col h-[320px] sm:h-[350px]`}>
            <div className="p-6 pb-4 border-b border-slate-100">
              <h3 className="text-lg font-semibold text-slate-900">Recent Applications</h3>
              <p className="text-sm text-slate-600 mt-1">Last 7 days</p>
            </div>

            <div className="p-6 space-y-3 flex-1 overflow-y-auto">
              {applicationsLoading ? (
                <div className="text-center text-slate-500 py-8 text-base">Loading applications...</div>
              ) : recentApplications && recentApplications.length > 0 ? (
                recentApplications.slice(0, 3).map((application) => (
                  <div key={application.candidateId} className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-100 hover:border-green-200 transition-colors">
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-slate-900 truncate">{application.candidateName}</div>
                      <div className="text-sm text-slate-600 truncate">{application.jobTitle}</div>
                    </div>
                    <div className="text-sm font-medium text-green-600 ml-3 flex-shrink-0">
                      {new Date(application.timestamp).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric'
                      })}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-slate-500 py-8 text-base">No recent applications</div>
              )}
            </div>

            <div className="p-6 pt-4 border-t border-slate-100">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleViewAllApplications}
                className="justify-start w-fit px-0 text-green-600 hover:text-green-700 font-medium"
              >
                View all applications
                <ArrowUpRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Top Job Openings Card */}
          <div className={`${shadows.card} flex flex-col h-[320px] sm:h-[350px] md:col-span-2 xl:col-span-1`}>
            <div className="p-6 pb-4 border-b border-slate-100">
              <h3 className="text-lg font-semibold text-slate-900">Top Job Openings</h3>
              <p className="text-sm text-slate-600 mt-1">By application volume</p>
            </div>

            <div className="p-6 space-y-3 flex-1 overflow-y-auto">
              {topJobsLoading ? (
                <LoadingUI message="Loading top jobs..." />
              ) : topJobs && topJobs.length > 0 ? (
                topJobs.map((job) => (
                  <div key={job.jobId} className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-violet-50 rounded-lg border border-purple-100 hover:border-purple-200 transition-colors">
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-slate-900 truncate">{job.jobTitle}</div>
                      <div className="text-sm text-slate-600 truncate">{job.department}</div>
                    </div>
                    <div className="text-sm font-medium text-purple-600 ml-3 flex-shrink-0">
                      {job.applicationCount} applications
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-slate-500 py-8 text-base">No job openings available</div>
              )}
            </div>

            <div className="p-6 pt-4 border-t border-slate-100">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleViewAllJobs}
                className="justify-start w-fit px-0 text-purple-600 hover:text-purple-700 font-medium"
              >
                View all jobs
                <ArrowUpRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
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
    </div>
  );
};

export default Dashboard;

