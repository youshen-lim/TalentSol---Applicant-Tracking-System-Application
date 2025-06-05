import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Eye,
  Users,
  FileText,
  BarChart3,
  Filter,
  Search,
  Download,
  Clock,
  TrendingUp,
  Activity,
  Edit,
  RefreshCw,
  ChevronDown,
  MoreHorizontal,
  Trash2,
  ExternalLink,
  List,
  Grid,
  Database
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { shadows } from '@/components/ui/shadow';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import PageHeader from '@/components/layout/PageHeader';

import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';
import { applicationApi, formApi, analyticsApi } from '@/services/api';
import { useSourceData, useFormStatusData } from '@/hooks/useAnalytics';
import BarChart from '@/components/dashboard/BarChart';
import LoadingUI from '@/components/ui/loading';
import CandidateSourcesChart from '@/components/charts/CandidateSourcesChart';

// Types
interface Application {
  id: string;
  candidateName: string;
  candidateEmail?: string;
  jobTitle: string;
  status: string;
  score?: number;
  submittedAt: string;
  formId: string;
  candidateId?: string;
}

/**
 * Application Management page component
 * Consolidated from ApplicationsTest.tsx to be the primary application management interface
 * Provides comprehensive application tracking, form management, and analytics
 * Uses standardized TalentSol design system and PageHeader component
 */
const ApplicationManagement = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  // Enhanced responsive layout management
  const {
    isMobile,
    isTablet,
    shouldUseCardLayout,
    getColumnsForDevice,
    getGridClasses,
    shouldStackFormButtons,
    getModalSize
  } = useResponsiveLayout();

  // Source data for candidate sources chart
  const { data: sourceData, loading: sourceLoading } = useSourceData();

  // Form status data for form status chart
  const { data: formStatusData, loading: formStatusLoading } = useFormStatusData();

  // Enhanced state management for improved UX
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedTimeframe, setSelectedTimeframe] = useState('30d');
  const [applicationStats, setApplicationStats] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [forms, setForms] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [formPerformanceData, setFormPerformanceData] = useState<any>(null);

  // Tab counters state
  const [tabCounts, setTabCounts] = useState({
    applications: 0,
    forms: 0,
    performance: 0
  });

  // Loading states
  const [loading, setLoading] = useState(true);
  const [formsLoading, setFormsLoading] = useState(false);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Enhanced filtering and search state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [positionFilter, setPositionFilter] = useState('all');
  const [selectedApplications, setSelectedApplications] = useState<string[]>([]);
  const [sortField, setSortField] = useState('submittedAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Standardized badge functions following TalentSol design patterns
  const getApplicationStatusBadge = (status: string) => {
    switch (status) {
      case 'applied':
        return <Badge className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-0 shadow-sm">Applied</Badge>;
      case 'review':
      case 'screening':
        return <Badge className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white border-0 shadow-sm">Screening</Badge>;
      case 'interview':
        return <Badge className="bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white border-0 shadow-sm">Interview</Badge>;
      case 'offer':
        return <Badge className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white border-0 shadow-sm">Offer</Badge>;
      case 'hired':
        return <Badge className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white border-0 shadow-sm">Hired</Badge>;
      case 'rejected':
        return <Badge className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white border-0 shadow-sm">Rejected</Badge>;
      default:
        return <Badge className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white border-0 shadow-sm">{status}</Badge>;
    }
  };

  const getFormStatusBadge = (status: string) => {
    switch (status) {
      case 'live':
        return <Badge className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white border-0 shadow-sm">Live</Badge>;
      case 'draft':
        return <Badge className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white border-0 shadow-sm">Draft</Badge>;
      case 'archived':
        return <Badge className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white border-0 shadow-sm">Archived</Badge>;
      default:
        return <Badge className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white border-0 shadow-sm">{status}</Badge>;
    }
  };

  const getConversionRateBadge = (rate: number) => {
    if (rate >= 15) {
      return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">{rate}%</Badge>;
    } else if (rate >= 10) {
      return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">{rate}%</Badge>;
    } else {
      return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">{rate}%</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Load tab counts for display in navigation
  const loadTabCounts = useCallback(async () => {
    try {
      // Load applications count
      const applicationsResponse = await applicationApi.getApplications({ limit: 1 });
      const applicationsCount = applicationsResponse.pagination?.total || 0;

      // Load forms count
      const formsResponse = await formApi.getForms({ limit: 1 });
      const formsCount = formsResponse.pagination?.total || 0;

      // Performance count is same as forms count
      const performanceCount = formsCount;

      setTabCounts({
        applications: applicationsCount,
        forms: formsCount,
        performance: performanceCount
      });
    } catch (error) {
      console.error('Failed to load tab counts:', error);
      // Keep existing counts on error
    }
  }, []);

  // Load data based on active tab
  const loadData = useCallback(async (tabName: string) => {
    try {
      setLoading(true);
      setError(null);

      switch (tabName) {
        case 'dashboard':
          const overviewResponse = await applicationApi.getOverview({ timeframe: selectedTimeframe });
          setApplicationStats(overviewResponse);
          break;

        case 'applications':
          const applicationsResponse = await applicationApi.getApplications({
            limit: 50,
            status: statusFilter !== 'all' ? statusFilter : undefined,
            search: searchQuery || undefined
          });

          // Map backend response to frontend format
          const mappedApplications = (applicationsResponse.applications || []).map((app: any) => ({
            id: app.id,
            candidateName: `${app.candidate?.firstName || ''} ${app.candidate?.lastName || ''}`.trim() || 'Unknown',
            candidateEmail: app.candidate?.email || '',
            candidateId: app.candidate?.id || '',
            jobTitle: app.job?.title || 'Unknown Position',
            status: app.status || 'applied',
            score: app.score || null,
            submittedAt: app.submittedAt || new Date().toISOString(),
            formId: app.jobId || '', // Use jobId as formId for now
          }));

          setApplications(mappedApplications);

          // Update applications count
          setTabCounts(prev => ({
            ...prev,
            applications: applicationsResponse.pagination?.total || mappedApplications.length
          }));
          break;

        case 'forms':
          setFormsLoading(true);
          try {
            const formsResponse = await formApi.getForms({ limit: 50 });
            console.log('📋 Forms response:', formsResponse);

            // Map backend response to frontend format
            const mappedForms = (formsResponse.forms || []).map((form: any) => ({
              id: form.id,
              title: form.title,
              jobTitle: form.job?.title || 'Unknown Job',
              jobId: form.jobId,
              status: form.status || 'draft',
              submissions: form.submissionCount || 0,
              views: form.viewCount || 0,
              conversionRate: form.viewCount > 0 ?
                parseFloat(((form.submissionCount || 0) / form.viewCount * 100).toFixed(1)) : 0,
              createdAt: form.createdAt,
              updatedAt: form.updatedAt,
              publicUrl: form.publicUrl || '',
            }));

            setForms(mappedForms);

            // Update forms count
            setTabCounts(prev => ({
              ...prev,
              forms: formsResponse.pagination?.total || mappedForms.length,
              performance: formsResponse.pagination?.total || mappedForms.length
            }));
          } catch (error) {
            console.error('❌ Error loading forms:', error);
            // Create mock forms data
            setForms([
              {
                id: 'form_1',
                title: 'Software Engineer Application Form',
                jobTitle: 'Senior Software Engineer',
                jobId: 'job_1',
                status: 'live',
                submissions: 25,
                views: 150,
                conversionRate: 16.7,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                publicUrl: 'https://talentsol.com/apply/software-engineer'
              },
              {
                id: 'form_2',
                title: 'Product Manager Application Form',
                jobTitle: 'Product Manager',
                jobId: 'job_2',
                status: 'live',
                submissions: 15,
                views: 120,
                conversionRate: 12.5,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                publicUrl: 'https://talentsol.com/apply/product-manager'
              },
              {
                id: 'form_3',
                title: 'UX Designer Application Form',
                jobTitle: 'UX Designer',
                jobId: 'job_3',
                status: 'draft',
                submissions: 0,
                views: 0,
                conversionRate: 0,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                publicUrl: 'https://talentsol.com/apply/ux-designer'
              }
            ]);

            // Update forms count for mock data
            setTabCounts(prev => ({
              ...prev,
              forms: 3,
              performance: 3
            }));
          } finally {
            setFormsLoading(false);
          }
          break;

        case 'performance':
          setAnalyticsLoading(true);
          try {
            const formPerformanceResponse = await analyticsApi.getFormPerformanceAnalytics({ timeframe: selectedTimeframe });
            console.log('📈 Form Performance response:', formPerformanceResponse);
            setFormPerformanceData(formPerformanceResponse);
          } catch (error) {
            console.error('❌ Error loading form performance data:', error);
            // Create mock performance data
            setFormPerformanceData({
              summary: {
                totalForms: 3,
                totalViews: 750,
                totalSubmissions: 85,
                overallConversionRate: 11.3,
                averageViewsPerForm: 250,
                averageSubmissionsPerForm: 28
              },
              forms: [
                {
                  id: 'form_1',
                  title: 'Software Engineer Application Form',
                  jobTitle: 'Senior Software Engineer',
                  status: 'live',
                  totalViews: 350,
                  totalSubmissions: 45,
                  conversionRate: 12.9,
                  createdAt: new Date().toISOString()
                },
                {
                  id: 'form_2',
                  title: 'Product Manager Application Form',
                  jobTitle: 'Product Manager',
                  status: 'live',
                  totalViews: 280,
                  totalSubmissions: 25,
                  conversionRate: 8.9,
                  createdAt: new Date().toISOString()
                },
                {
                  id: 'form_3',
                  title: 'Designer Application Form',
                  jobTitle: 'UX Designer',
                  status: 'live',
                  totalViews: 120,
                  totalSubmissions: 15,
                  conversionRate: 12.5,
                  createdAt: new Date().toISOString()
                }
              ],
              topPerformingForms: [
                {
                  id: 'form_1',
                  title: 'Software Engineer Application Form',
                  jobTitle: 'Senior Software Engineer',
                  totalViews: 350,
                  totalSubmissions: 45,
                  conversionRate: 12.9
                },
                {
                  id: 'form_3',
                  title: 'Designer Application Form',
                  jobTitle: 'UX Designer',
                  totalViews: 120,
                  totalSubmissions: 15,
                  conversionRate: 12.5
                }
              ]
            });
          } finally {
            setAnalyticsLoading(false);
          }
          break;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : `Failed to load ${tabName} data`;
      console.error(`Failed to load ${tabName} data:`, err);
      setError(errorMessage);
      toast({
        title: 'Loading Error',
        description: `Failed to load ${tabName} data. Please try again.`,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [selectedTimeframe, statusFilter, searchQuery, toast]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadData(activeTab);
      toast({
        title: 'Data Refreshed',
        description: 'All data has been updated successfully.',
        variant: 'default',
      });
    } catch (error) {
      console.error('Failed to refresh data:', error);
      toast({
        title: 'Refresh Failed',
        description: 'Failed to refresh data. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setRefreshing(false);
    }
  }, [activeTab, loadData, toast]);

  // Load tab counts on component mount
  useEffect(() => {
    loadTabCounts();
  }, [loadTabCounts]);

  // Load initial data and reload when tab changes
  useEffect(() => {
    loadData(activeTab);
  }, [activeTab, loadData]);

  // Reload data when timeframe changes
  useEffect(() => {
    if (activeTab === 'dashboard' || activeTab === 'performance') {
      loadData(activeTab);
    }
  }, [selectedTimeframe, activeTab, loadData]);

  // Update tab counts when data changes
  useEffect(() => {
    if (applications.length > 0) {
      setTabCounts(prev => ({ ...prev, applications: applications.length }));
    }
  }, [applications]);

  useEffect(() => {
    if (forms.length > 0) {
      setTabCounts(prev => ({ ...prev, forms: forms.length, performance: forms.length }));
    }
  }, [forms]);

  if (loading && !applicationStats && !applications.length && !forms.length) {
    return (
      <div className="space-y-6 flex items-center justify-center min-h-[400px]">
        <LoadingUI message="Loading application data..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Application Management"
        subtitle="Monitor applications, manage forms, and track performance"
        icon={FileText}
      >
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={refreshing}
          className="border-gray-300 hover:border-blue-500 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={async () => {
            try {
              const exportData = await applicationApi.exportApplications();
              toast({
                title: 'Export Started',
                description: `Exporting ${exportData.count} applications...`,
              });
            } catch (error) {
              toast({
                title: 'Export Failed',
                description: 'Failed to export data. Please try again.',
                variant: 'destructive',
              });
            }
          }}
          className="border-gray-300 hover:border-blue-500 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200"
        >
          <Download className="h-4 w-4 mr-2" />
          Export Data
        </Button>
        <Button
          size="sm"
          onClick={() => navigate('/jobs')}
          className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all duration-200"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Job
        </Button>
      </PageHeader>

      {/* Enhanced Navigation Tabs - Mobile Responsive */}
      <div className={`${shadows.card} p-1`}>
        <div className="flex space-x-1">
          {[
            { id: 'dashboard', label: 'Overview', icon: BarChart3 },
            { id: 'applications', label: 'Applications', icon: FileText, count: tabCounts.applications },
            { id: 'forms', label: 'Forms', icon: Edit, count: tabCounts.forms },
            { id: 'performance', label: 'Performance', icon: TrendingUp, count: tabCounts.performance }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-3 rounded-lg font-medium text-sm transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                {Icon && <Icon className="h-4 w-4" />}
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    isActive
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-700'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 'dashboard' && (
        <div className={`${shadows.card} p-6 space-y-6`}>
          {/* Key Metrics - Mobile Responsive Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className={`${shadows.card} p-6`}>
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Applications</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {loading ? '...' : (applicationStats?.totalApplications || 0)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {selectedTimeframe === '7d' ? 'Last 7 days' :
                     selectedTimeframe === '30d' ? 'Last 30 days' :
                     selectedTimeframe === '90d' ? 'Last 90 days' : 'Last year'}
                  </p>
                </div>
              </div>
            </div>

            <div className={`${shadows.card} p-6`}>
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">New Applications</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {loading ? '...' : (applicationStats?.newApplications || 0)}
                  </p>
                  <p className={`text-xs mt-1 ${
                    (applicationStats?.growthRate || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {(applicationStats?.growthRate || 0) >= 0 ? '+' : ''}{applicationStats?.growthRate || 0}% from last period
                  </p>
                </div>
              </div>
            </div>

            <div className={`${shadows.card} p-6`}>
              <div className="flex items-center">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Activity className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {loading ? '...' : (applicationStats?.conversionRate || 0)}%
                  </p>
                  <p className="text-xs text-purple-600 mt-1">Applications to hires</p>
                </div>
              </div>
            </div>

            <div className={`${shadows.card} p-6`}>
              <div className="flex items-center">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <Clock className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Avg. Score</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {loading ? '...' : (applicationStats?.averageScore || 0)}
                  </p>
                  <p className="text-xs text-orange-600 mt-1">Application quality</p>
                </div>
              </div>
            </div>
          </div>

          {/* Charts Section - Responsive Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Form Status Chart */}
            {formStatusLoading ? (
              <div className={`${shadows.card} h-[400px]`}>
                <LoadingUI message="Loading form status data..." />
              </div>
            ) : formStatusData && formStatusData.length > 0 ? (
              <div className={`${shadows.card} h-[400px]`}>
                <BarChart
                  title="Form Status Distribution"
                  description="Number of forms in different statuses"
                  data={formStatusData.map(item => ({
                    name: item.status,
                    forms: item.count,
                    value: item.count
                  }))}
                  bars={[{ dataKey: "forms", fill: "#2563EB", name: "Forms" }]}
                  vertical={true}
                  height={400}
                  valueFormatter={(value) => `${value} forms`}
                  showTooltip={true}
                  showLegend={false}
                />
              </div>
            ) : (
              <div className={`${shadows.card} p-6 h-[400px] flex items-center justify-center`}>
                <div className="text-center text-slate-500 text-base">No form status data available</div>
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

          {/* Timeframe Selector */}
          <div className={`${shadows.card} p-4`}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h4 className="text-sm font-medium text-slate-900">Data Timeframe</h4>
                <p className="text-xs text-slate-600">Adjust the time period for metrics displayed above</p>
              </div>
              <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select timeframe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                  <SelectItem value="1y">Last year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}

      {/* Applications Tab */}
      {activeTab === 'applications' && (
        <div className="space-y-6">
          <div className={`${shadows.card} p-4`}>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1 min-w-0">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    type="text"
                    placeholder="Search applications..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 w-full"
                  />
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Select value={positionFilter} onValueChange={setPositionFilter}>
                    <SelectTrigger className="w-full sm:w-48">
                      <SelectValue placeholder="All Positions" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Positions</SelectItem>
                      <SelectItem value="product-manager">Product Manager</SelectItem>
                      <SelectItem value="ux-designer">UX Designer</SelectItem>
                      <SelectItem value="software-engineer">Software Engineer</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-40">
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="applied">Applied</SelectItem>
                      <SelectItem value="review">Review</SelectItem>
                      <SelectItem value="screening">Screening</SelectItem>
                      <SelectItem value="interview">Interview</SelectItem>
                      <SelectItem value="offer">Offer</SelectItem>
                      <SelectItem value="hired">Hired</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          {/* Applications Table */}
          <div className={`${shadows.card} overflow-hidden`}>
            <div className="px-6 py-4 border-b border-slate-100">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">
                    All Applications ({applications?.length || 0})
                  </h3>
                  <p className="text-sm text-slate-600 mt-1">Manage and review candidate applications</p>
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-100">
                    <TableHead className="w-12">
                      <Checkbox />
                    </TableHead>
                    <TableHead className="text-slate-700 font-medium">Candidate</TableHead>
                    <TableHead className="text-slate-700 font-medium">Position</TableHead>
                    <TableHead className="text-slate-700 font-medium">Status</TableHead>
                    <TableHead className="text-slate-700 font-medium">Score</TableHead>
                    <TableHead className="text-slate-700 font-medium">Submitted</TableHead>
                    <TableHead className="text-right text-slate-700 font-medium">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {applications && applications.length > 0 ? (
                    applications.map((app, index) => (
                      <TableRow key={app.id || index} className="hover:bg-slate-50 border-slate-100">
                        <TableCell>
                          <Checkbox />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                              <span className="text-sm font-medium text-white">
                                {app.candidateName?.split(' ').map(n => n[0]).join('') || 'N/A'}
                              </span>
                            </div>
                            <div className="ml-4 min-w-0">
                              <div className="text-sm font-medium text-slate-900 truncate">{app.candidateName || 'Unknown'}</div>
                              <div className="text-xs text-slate-500 truncate">{app.candidateEmail || ''}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-slate-900">{app.jobTitle || 'Unknown Position'}</TableCell>
                        <TableCell>
                          {getApplicationStatusBadge(app.status)}
                        </TableCell>
                        <TableCell className="text-sm text-slate-900">
                          {app.score ? `${app.score}/100` : 'N/A'}
                        </TableCell>
                        <TableCell className="text-sm text-slate-500">
                          {app.submittedAt ? formatDate(app.submittedAt) : 'N/A'}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="hover:bg-slate-100">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => navigate(`/candidates/${app.candidateId}`)}>
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Status
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                        <FileText className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                        <p>No applications found</p>
                        <p className="text-sm">Applications will appear here once submitted</p>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>

              {/* Loading State */}
              {loading && (
                <LoadingUI message="Loading applications..." />
              )}

              {/* Error State */}
              {error && !loading && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                  <div className="text-red-600 mb-2">
                    <svg className="h-8 w-8 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="text-lg font-medium">Error loading applications</h3>
                  </div>
                  <p className="text-red-600 mb-4">{error}</p>
                  <Button
                    onClick={() => loadData('applications')}
                    variant="outline"
                    className="text-red-600 border-red-300 hover:bg-red-50"
                  >
                    Try Again
                  </Button>
                </div>
              )}

              {/* Empty State */}
              {!loading && !error && (!applications || applications.length === 0) && (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Applications Found</h3>
                  <p className="text-gray-600 mb-4">No applications match your current filters</p>
                  <Button onClick={() => navigate('/jobs')} className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Post a Job
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Forms Tab */}
      {activeTab === 'forms' && (
        <div className="space-y-6">
          {/* Forms Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Application Forms</h2>
              <p className="text-sm text-gray-600 mt-1">Manage and track your job application forms</p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={async () => {
                  try {
                    await formApi.initSampleData();
                    loadData('forms'); // Reload forms data
                  } catch (error) {
                    console.error('Failed to initialize sample data:', error);
                  }
                }}
                variant="outline"
                className="text-sm"
              >
                <Database className="h-4 w-4 mr-2" />
                Init Sample Data
              </Button>
              <Button onClick={() => navigate('/jobs')} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Create New Form
              </Button>
            </div>
          </div>

          {/* Forms List */}
          {formsLoading ? (
            <div className={`${shadows.card} p-6`}>
              <LoadingUI message="Loading forms..." />
            </div>
          ) : forms.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {forms.map((form) => (
                <div key={form.id} className={`${shadows.card} p-6`}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">{form.title}</h3>
                      <p className="text-sm text-gray-600">{form.jobTitle}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {getFormStatusBadge(form.status)}
                    </div>
                  </div>

                  {/* Form Statistics */}
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">{form.views}</div>
                      <div className="text-xs text-gray-500">Views</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">{form.submissions}</div>
                      <div className="text-xs text-gray-500">Submissions</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">{form.conversionRate}%</div>
                      <div className="text-xs text-gray-500">Conversion</div>
                    </div>
                  </div>

                  {/* Form Actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="text-xs text-gray-500">
                      Created {new Date(form.createdAt).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button variant="outline" size="sm">
                        <ExternalLink className="h-4 w-4 mr-1" />
                        Share
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={`${shadows.card} p-6`}>
              <div className="text-center py-8">
                <Edit className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">No Forms Found</h3>
                <p className="text-slate-600 mb-4">Create application forms for your job postings to start collecting applications</p>
                <div className="flex items-center justify-center gap-3">
                  <Button
                    onClick={async () => {
                      try {
                        await formApi.initSampleData();
                        loadData('forms');
                      } catch (error) {
                        console.error('Failed to initialize sample data:', error);
                      }
                    }}
                    variant="outline"
                  >
                    <Database className="h-4 w-4 mr-2" />
                    Add Sample Forms
                  </Button>
                  <Button onClick={() => navigate('/jobs')} className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Form
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Performance Tab */}
      {activeTab === 'performance' && (
        <div className="space-y-6">
          {/* Performance Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Form Performance Analytics</h2>
              <p className="text-sm text-gray-600 mt-1">Track form traffic, conversion rates, and performance metrics</p>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={selectedTimeframe}
                onChange={(e) => setSelectedTimeframe(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
              </select>
              <Button onClick={() => navigate('/analytics')} variant="outline">
                <TrendingUp className="h-4 w-4 mr-2" />
                Full Analytics
              </Button>
            </div>
          </div>

          {analyticsLoading ? (
            <div className={`${shadows.card} p-6`}>
              <LoadingUI message="Loading performance data..." />
            </div>
          ) : formPerformanceData ? (
            <>
              {/* Performance Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className={`${shadows.card} p-6`}>
                  <div className="flex items-center">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <Edit className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Forms</p>
                      <p className="text-2xl font-bold text-gray-900">{formPerformanceData.summary?.totalForms || 0}</p>
                    </div>
                  </div>
                </div>

                <div className={`${shadows.card} p-6`}>
                  <div className="flex items-center">
                    <div className="p-3 bg-green-100 rounded-lg">
                      <Eye className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Views</p>
                      <p className="text-2xl font-bold text-gray-900">{formPerformanceData.summary?.totalViews || 0}</p>
                    </div>
                  </div>
                </div>

                <div className={`${shadows.card} p-6`}>
                  <div className="flex items-center">
                    <div className="p-3 bg-purple-100 rounded-lg">
                      <FileText className="h-6 w-6 text-purple-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Submissions</p>
                      <p className="text-2xl font-bold text-gray-900">{formPerformanceData.summary?.totalSubmissions || 0}</p>
                    </div>
                  </div>
                </div>

                <div className={`${shadows.card} p-6`}>
                  <div className="flex items-center">
                    <div className="p-3 bg-orange-100 rounded-lg">
                      <TrendingUp className="h-6 w-6 text-orange-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Avg Conversion</p>
                      <p className="text-2xl font-bold text-gray-900">{formPerformanceData.summary?.overallConversionRate || 0}%</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Top Performing Forms */}
              {formPerformanceData.topPerformingForms && formPerformanceData.topPerformingForms.length > 0 && (
                <div className={`${shadows.card} p-6`}>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Forms</h3>
                  <div className="space-y-4">
                    {formPerformanceData.topPerformingForms.slice(0, 5).map((form: any) => (
                      <div key={form.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{form.title}</h4>
                          <p className="text-sm text-gray-600">{form.jobTitle}</p>
                        </div>
                        <div className="flex items-center gap-6 text-sm">
                          <div className="text-center">
                            <div className="font-semibold text-gray-900">{form.totalViews}</div>
                            <div className="text-gray-500">Views</div>
                          </div>
                          <div className="text-center">
                            <div className="font-semibold text-gray-900">{form.totalSubmissions}</div>
                            <div className="text-gray-500">Submissions</div>
                          </div>
                          <div className="text-center">
                            {getConversionRateBadge(form.conversionRate)}
                            <div className="text-gray-500 mt-1">Conversion</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* All Forms Performance Table */}
              {formPerformanceData.forms && formPerformanceData.forms.length > 0 && (
                <div className={`${shadows.card} p-6`}>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">All Forms Performance</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Form</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Views</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submissions</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Conversion Rate</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {formPerformanceData.forms.map((form: any) => (
                          <tr key={form.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm font-medium text-gray-900">{form.title}</div>
                                <div className="text-sm text-gray-500">{form.jobTitle}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {getFormStatusBadge(form.status)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{form.totalViews}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{form.totalSubmissions}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {getConversionRateBadge(form.conversionRate)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(form.createdAt).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className={`${shadows.card} p-6`}>
              <div className="text-center py-8">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">No Performance Data</h3>
                <p className="text-slate-600 mb-4">Create and publish forms to start tracking performance metrics</p>
                <Button onClick={() => setActiveTab('forms')} className="bg-blue-600 hover:bg-blue-700">
                  <Edit className="h-4 w-4 mr-2" />
                  Manage Forms
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ApplicationManagement;
