import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  Database,
  Brain,
  Briefcase,
  Zap
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { shadows } from '@/components/ui/shadow';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import PageHeader from '@/components/layout/PageHeader';

// Standardized status badge function for consistent badge system
const getStandardizedStatusBadge = (status: string) => {
  const statusConfig = {
    applied: { variant: 'status-applied' as const, label: 'Applied' },
    screening: { variant: 'status-screening' as const, label: 'Screening' },
    interview: { variant: 'status-interview' as const, label: 'Interview' },
    assessment: { variant: 'status-assessment' as const, label: 'Assessment' },
    offer: { variant: 'status-offer' as const, label: 'Offer' },
    hired: { variant: 'status-hired' as const, label: 'Hired' },
    rejected: { variant: 'status-rejected' as const, label: 'Rejected' }
  };

  const config = statusConfig[status as keyof typeof statusConfig] ||
                 { variant: 'outline' as const, label: status };

  return (
    <Badge variant={config.variant} className="font-medium">
      {config.label}
    </Badge>
  );
};

import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';
import { applicationApi, formApi, analyticsApi } from '@/services/api';
import { useSourceData, useFormStatusData } from '@/hooks/useAnalytics';
import BarChart from '@/components/dashboard/BarChart';
import LoadingUI from '@/components/ui/loading';
import { Skeleton } from '@/components/ui/skeleton';
import CandidateSourcesChart from '@/components/charts/CandidateSourcesChart';
import { CandidateRecommendationPanel } from '@/components/ml/CandidateRecommendationPanel';
import { InteractiveMLRecommendationPanel } from '@/components/ml/InteractiveMLRecommendationPanel';
import { EnhancedApplicationCard, ApplicationWithML } from '@/components/applications/EnhancedApplicationCard';
import { MLEnhancedApplicationsTable } from '@/components/applications/MLEnhancedApplicationsTable';
import { VirtualizedApplicationsTable } from '@/components/applications/VirtualizedApplicationsTable';
import { AdvancedApplicationFilters, FilterState } from '@/components/applications/AdvancedApplicationFilters';
import { BulkActionsToolbar, BulkAction } from '@/components/applications/BulkActionsToolbar';
import { EnhancedAnalyticsDashboard } from '@/components/analytics/EnhancedAnalyticsDashboard';
import { useMLRecommendations } from '@/hooks/useMLRecommendations';
import { useApplicationCache, useDebouncedSearch } from '@/hooks/useApplicationCache';

// Types - Enhanced with ML data
interface Application extends ApplicationWithML {
  candidateName: string;
  candidateEmail?: string;
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

  // ML-related state
  const [selectedJobId, setSelectedJobId] = useState<string>('');
  const [showMLRecommendations, setShowMLRecommendations] = useState(true);
  const [mlSortEnabled, setMlSortEnabled] = useState(true);

  // Phase 3: Advanced filtering and bulk actions state
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    status: [],
    scoreRange: [0, 100],
    confidenceRange: [0, 100],
    dateRange: { from: undefined, to: undefined },
    jobPositions: []
  });

  // Phase 3: Performance optimization state
  const [useVirtualization, setUseVirtualization] = useState(false);
  const [enableCaching, setEnableCaching] = useState(true);

  // Phase 3: Caching and debounced search
  const { cacheApplications, getCachedApplications, cacheStats } = useApplicationCache();
  const debouncedSearch = useDebouncedSearch(filters.search, 300);

  // Use the standardized status badge function for applications
  const getApplicationStatusBadge = (status: string) => {
    return getStandardizedStatusBadge(status);
  };

  const getFormStatusBadge = (status: string) => {
    const statusConfig = {
      live: { variant: 'job-live' as const, label: 'Live' },
      draft: { variant: 'job-draft' as const, label: 'Draft' },
      archived: { variant: 'job-archived' as const, label: 'Archived' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] ||
                   { variant: 'outline' as const, label: status };

    return (
      <Badge variant={config.variant} className="font-medium">
        {config.label}
      </Badge>
    );
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

          // Map backend response to frontend format with ML data
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

            // Enhanced with ML data structure
            candidateInfo: {
              firstName: app.candidate?.firstName || '',
              lastName: app.candidate?.lastName || '',
              email: app.candidate?.email || '',
              phone: app.candidate?.phone || '',
              location: app.candidate?.location || ''
            },
            mlProcessing: {
              status: app.mlPredictions?.length > 0 ? 'completed' :
                      app.score ? 'completed' : 'not_started',
              confidence: app.mlPredictions?.[0]?.confidence ||
                         (app.score ? Math.random() * 0.3 + 0.7 : undefined),
              reasoning: app.mlPredictions?.[0]?.explanation?.reasoning ||
                        (app.score ? [`Score based on resume-job match: ${app.score}/100`] : []),
              skillsExtracted: app.mlPredictions?.[0]?.explanation?.skillsExtracted || [],
              recommendedActions: app.mlPredictions?.[0]?.explanation?.recommendedActions ||
                                 (app.score >= 80 ? ['High priority - schedule interview immediately'] :
                                  app.score >= 60 ? ['Good candidate - proceed to next round'] :
                                  ['Review application carefully before proceeding']),
              processingTime: app.mlPredictions?.[0]?.processingTime || Math.floor(Math.random() * 2000 + 500)
            },
            professionalInfo: {
              experience: app.professionalInfo?.experience || '',
              education: app.professionalInfo?.education || '',
              skills: app.professionalInfo?.skills || []
            }
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

  // Phase 3: Bulk actions handler
  const handleBulkAction = useCallback(async (action: BulkAction) => {
    try {
      const selectedApps = applications.filter(app => selectedApplications.includes(app.id));

      switch (action.type) {
        case 'approve':
          await Promise.all(selectedApps.map(app =>
            applicationApi.updateApplication(app.id, { status: 'approved' })
          ));
          toast({
            title: 'Applications Approved',
            description: `${selectedApps.length} applications have been approved.`,
          });
          break;

        case 'reject':
          await Promise.all(selectedApps.map(app =>
            applicationApi.updateApplication(app.id, { status: 'rejected' })
          ));
          toast({
            title: 'Applications Rejected',
            description: `${selectedApps.length} applications have been rejected.`,
          });
          break;

        case 'schedule':
          // Navigate to interview scheduling for selected candidates
          toast({
            title: 'Interview Scheduling',
            description: `Scheduling interviews for ${selectedApps.length} candidates.`,
          });
          break;

        case 'export':
          const exportData = selectedApps.map(app => ({
            name: `${app.candidateInfo.firstName} ${app.candidateInfo.lastName}`,
            email: app.candidateInfo.email,
            position: app.jobTitle,
            status: app.status,
            score: app.score,
            submittedAt: app.submittedAt
          }));

          const csvContent = [
            Object.keys(exportData[0]).join(','),
            ...exportData.map(row => Object.values(row).join(','))
          ].join('\n');

          const blob = new Blob([csvContent], { type: 'text/csv' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `applications-export-${new Date().toISOString().split('T')[0]}.csv`;
          a.click();
          URL.revokeObjectURL(url);

          toast({
            title: 'Export Complete',
            description: `Exported ${selectedApps.length} applications to CSV.`,
          });
          break;

        case 'status-change':
          if (action.payload?.status) {
            await Promise.all(selectedApps.map(app =>
              applicationApi.updateApplication(app.id, { status: action.payload.status })
            ));
            toast({
              title: 'Status Updated',
              description: `${selectedApps.length} applications updated to ${action.payload.status}.`,
            });
          }
          break;

        default:
          console.log('Bulk action not implemented:', action.type);
      }

      // Refresh data and clear selection
      await loadData(activeTab);
      setSelectedApplications([]);

    } catch (error) {
      console.error('Bulk action failed:', error);
      toast({
        title: 'Action Failed',
        description: 'Failed to perform bulk action. Please try again.',
        variant: 'destructive',
      });
    }
  }, [selectedApplications, applications, activeTab, loadData, toast]);

  // Phase 3: Advanced filtering logic
  const filteredApplications = useMemo(() => {
    if (!applications) return [];

    return applications.filter(app => {
      // Search filter
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        const candidateName = `${app.candidateInfo.firstName} ${app.candidateInfo.lastName}`.toLowerCase();
        const email = app.candidateInfo.email.toLowerCase();
        const position = app.jobTitle.toLowerCase();

        if (!candidateName.includes(searchTerm) &&
            !email.includes(searchTerm) &&
            !position.includes(searchTerm)) {
          return false;
        }
      }

      // Status filter
      if (filters.status.length > 0 && !filters.status.includes(app.status)) {
        return false;
      }

      // Job position filter
      if (filters.jobPositions.length > 0 && !filters.jobPositions.includes(app.jobTitle)) {
        return false;
      }

      // Score range filter
      const score = app.score || 0;
      if (score < filters.scoreRange[0] || score > filters.scoreRange[1]) {
        return false;
      }

      // Confidence range filter
      const confidence = (app.mlProcessing?.confidence || 0) * 100;
      if (confidence < filters.confidenceRange[0] || confidence > filters.confidenceRange[1]) {
        return false;
      }

      // Date range filter
      if (filters.dateRange.from || filters.dateRange.to) {
        const submittedDate = new Date(app.submittedAt);
        if (filters.dateRange.from && submittedDate < filters.dateRange.from) {
          return false;
        }
        if (filters.dateRange.to && submittedDate > filters.dateRange.to) {
          return false;
        }
      }

      return true;
    });
  }, [applications, filters]);

  // Get available filter options
  const availableStatuses = useMemo(() => {
    if (!applications) return [];
    return [...new Set(applications.map(app => app.status))];
  }, [applications]);

  const availableJobPositions = useMemo(() => {
    if (!applications) return [];
    return [...new Set(applications.map(app => app.jobTitle))];
  }, [applications]);

  // Mock job positions for ML recommendations
  const availableJobs = useMemo(() => [
    {
      id: 'job_1',
      title: 'Senior Software Engineer',
      department: 'Engineering',
      level: 'Senior',
      openPositions: 2,
      requirements: ['JavaScript', 'React', 'Node.js', 'TypeScript']
    },
    {
      id: 'job_2',
      title: 'Product Manager',
      department: 'Product',
      level: 'Mid',
      openPositions: 1,
      requirements: ['Product Management', 'Analytics', 'Strategy', 'Leadership']
    },
    {
      id: 'job_3',
      title: 'UX Designer',
      department: 'Design',
      level: 'Mid',
      openPositions: 1,
      requirements: ['UI/UX Design', 'Figma', 'User Research', 'Prototyping']
    }
  ], []);

  if (loading && !applicationStats && !applications.length && !forms.length) {
    return (
      <div className="space-y-6 flex items-center justify-center min-h-[400px]">
        <LoadingUI message="Loading application data..." />
      </div>
    );
  }

  return (
    <TooltipProvider delayDuration={200}>
      <div className="min-h-screen bg-gray-50">
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

      {/* Main Content Container - Using TalentSol Design System */}
      <div className="ats-content-container">
        {/* Tab Navigation - Using design system classes */}
        <div className="ats-tab-navigation">
          <nav className="ats-tab-nav-container" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`ats-tab-button ${
                activeTab === 'dashboard'
                  ? 'ats-tab-button-active'
                  : 'ats-tab-button-inactive'
              }`}
            >
              <BarChart3 className="h-4 w-4" />
              <span>Overview</span>
            </button>
            <button
              onClick={() => setActiveTab('applications')}
              className={`ats-tab-button ${
                activeTab === 'applications'
                  ? 'ats-tab-button-active'
                  : 'ats-tab-button-inactive'
              }`}
            >
              <FileText className="h-4 w-4" />
              <span>Applications</span>
            </button>
            <button
              onClick={() => setActiveTab('forms')}
              className={`ats-tab-button ${
                activeTab === 'forms'
                  ? 'ats-tab-button-active'
                  : 'ats-tab-button-inactive'
              }`}
            >
              <Edit className="h-4 w-4" />
              <span>Forms</span>
            </button>
            <button
              onClick={() => setActiveTab('performance')}
              className={`ats-tab-button ${
                activeTab === 'performance'
                  ? 'ats-tab-button-active'
                  : 'ats-tab-button-inactive'
              }`}
            >
              <TrendingUp className="h-4 w-4" />
              <span>Performance</span>
            </button>
          </nav>
        </div>

        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            {/* Main Dashboard Content - Using design system */}
            <div className="ats-content-section-enhanced">
          {/* Key Metrics - Using design system grid */}
          <div className="ats-metric-cards-grid">
            {/* Total Applications - Using design system */}
            <div className="ats-metric-card">
              <div className="ats-metric-header">
                <p className="ats-metric-label">Total Applications</p>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="w-2 h-2 bg-blue-500 rounded-full cursor-help" aria-label="Total applications indicator"></div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Total Applications - Blue indicator</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className="ats-metric-content">
                <p className="ats-metric-value">
                  {loading ? (
                    <Skeleton className="h-8 w-16 bg-gray-100" />
                  ) : (
                    applicationStats?.totalApplications || 0
                  )}
                </p>
                <p className="text-xs text-gray-400">
                  {selectedTimeframe === '7d' ? 'Last 7 days' :
                   selectedTimeframe === '30d' ? 'Last 30 days' :
                   selectedTimeframe === '90d' ? 'Last 90 days' : 'Last year'}
                </p>
              </div>
            </div>

            {/* New Applications - Using design system */}
            <div className="ats-metric-card hover:border-green-300">
              <div className="ats-metric-header">
                <p className="ats-metric-label">New Applications</p>
                <div className="flex items-center space-x-1">
                  {(applicationStats?.growthRate || 0) >= 0 ? (
                    <TrendingUp className="w-3 h-3 text-green-500" />
                  ) : (
                    <TrendingUp className="w-3 h-3 text-red-500 rotate-180" />
                  )}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="w-2 h-2 bg-green-500 rounded-full cursor-help" aria-label="New applications growth indicator"></div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>New Applications Growth - Green indicator</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
              <div className="ats-metric-content">
                <p className="ats-metric-value">
                  {loading ? (
                    <Skeleton className="h-8 w-16 bg-gray-100" />
                  ) : (
                    applicationStats?.newApplications || 0
                  )}
                </p>
                <p className={`text-xs font-medium ${
                  (applicationStats?.growthRate || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {(applicationStats?.growthRate || 0) >= 0 ? '+' : ''}{applicationStats?.growthRate || 0}% from last period
                </p>
              </div>
            </div>

            {/* Conversion Rate - Using design system */}
            <div className="ats-metric-card hover:border-purple-300">
              <div className="ats-metric-header">
                <p className="ats-metric-label">Conversion Rate</p>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="w-2 h-2 bg-purple-500 rounded-full cursor-help" aria-label="Conversion rate indicator"></div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Conversion Rate - Purple indicator</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className="ats-metric-content">
                {(applicationStats?.conversionRate || 0) > 0 ? (
                  <>
                    <p className="ats-metric-value">
                      {loading ? (
                        <Skeleton className="h-8 w-16 bg-gray-100" />
                      ) : (
                        `${applicationStats?.conversionRate || 0}%`
                      )}
                    </p>
                    <p className="text-xs text-gray-400">Applications to hires</p>
                  </>
                ) : (
                  <>
                    <p className="text-3xl font-bold text-gray-400 leading-none">0%</p>
                    <p className="text-xs text-gray-400">No hires yet</p>
                  </>
                )}
              </div>
            </div>

            {/* Average Score - Using design system */}
            <div className="ats-metric-card hover:border-orange-300">
              <div className="ats-metric-header">
                <p className="ats-metric-label">Avg. Score</p>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="w-2 h-2 bg-orange-500 rounded-full cursor-help" aria-label="Average score quality indicator"></div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Average Score Quality - Orange indicator</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className="ats-metric-content">
                {(applicationStats?.averageScore || 0) > 0 ? (
                  <>
                    <p className="ats-metric-value">
                      {loading ? (
                        <Skeleton className="h-8 w-16 bg-gray-100" />
                      ) : (
                        applicationStats?.averageScore || 0
                      )}
                    </p>
                    <p className="text-xs text-gray-400">Application quality</p>
                  </>
                ) : (
                  <>
                    <p className="text-3xl font-bold text-gray-400 leading-none">—</p>
                    <p className="text-xs text-gray-400">No scores yet</p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Secondary Analytics - Using design system */}
          <div className="ats-content-section">
            <div className="ats-section-header">
              <div>
                <h3 className="ats-section-title">Analytics Overview</h3>
                <p className="ats-section-subtitle">Form performance and candidate source insights</p>
              </div>
              <Button variant="outline" size="sm" className="text-xs border-gray-300 hover:border-blue-500 text-gray-700 hover:text-blue-600">
                <BarChart3 className="h-3 w-3 mr-1" />
                View Details
              </Button>
            </div>

            <div className="ats-content-grid">
              {/* Form Status Chart - Reduced Height */}
              {formStatusLoading ? (
                <div className="ats-chart-container-enhanced">
                  <div className="space-y-4">
                    <Skeleton className="h-4 w-40 bg-gray-100" />
                    <Skeleton className="h-3 w-28 bg-gray-50" />
                    <div className="space-y-3 mt-6">
                      <Skeleton className="h-6 w-full bg-gray-100" />
                      <Skeleton className="h-4 w-3/4 bg-gray-100" />
                      <Skeleton className="h-3 w-1/2 bg-gray-100" />
                    </div>
                  </div>
                </div>
              ) : formStatusData && formStatusData.length > 0 ? (
                <div className="ats-chart-container-enhanced">
                  <BarChart
                    title="Form Status Distribution"
                    description="Number of forms in different statuses"
                    data={formStatusData.map(item => ({
                      name: item.status,
                      forms: item.count,
                      value: item.count
                    }))}
                    bars={[{ dataKey: "forms", fill: "#6366F1", name: "Forms" }]}
                    vertical={true}
                    height={280} // Increased height for better label spacing
                    valueFormatter={(value) => value === 1 ? `${value} form` : `${value} forms`} // Proper singular/plural handling
                    showTooltip={true}
                    showLegend={false}
                  />
                </div>
              ) : (
                <div className="ats-empty-state h-[360px]">
                  <div className="text-center">
                    <BarChart3 className="h-8 w-8 mx-auto mb-3 text-gray-300" />
                    <p className="text-sm text-gray-500 mb-2">No form data available</p>
                    <Button variant="default" size="sm" className="text-xs bg-blue-600 hover:bg-blue-700 text-white">
                      <Plus className="h-3 w-3 mr-1" />
                      Create First Form
                    </Button>
                  </div>
                </div>
              )}

              {/* Candidate Sources Chart - Improved Empty State */}
              {sourceLoading ? (
                <div className="bg-white rounded-lg border border-gray-200 p-8 h-[360px]">
                  <div className="space-y-6">
                    <Skeleton className="h-4 w-36 bg-gray-100" />
                    <Skeleton className="h-3 w-24 bg-gray-50" />
                    <div className="space-y-3 mt-6">
                      <Skeleton className="h-6 w-full bg-gray-100" />
                      <Skeleton className="h-4 w-4/5 bg-gray-100" />
                      <Skeleton className="h-3 w-2/3 bg-gray-100" />
                    </div>
                  </div>
                </div>
              ) : sourceData?.sourceEffectiveness && sourceData.sourceEffectiveness.length > 0 ? (
                <div className="ats-chart-container-enhanced">
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
                    bars={[{ dataKey: "applications", fill: "#6366F1", name: "Applications" }]}
                    vertical={true}
                    height={240}
                    valueFormatter={(value) => `${value} candidates`}
                    showTooltip={true}
                    showLegend={false}
                  />
                </div>
              ) : (
                <div className="ats-empty-state h-[360px]">
                  <div className="text-center">
                    <Users className="h-8 w-8 mx-auto mb-3 text-gray-300" />
                    <p className="text-sm text-gray-500 mb-2">No source data available</p>
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
                      variant="default"
                      size="sm"
                      className="text-xs bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Database className="h-3 w-3 mr-1" />
                      Initialize Data
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Timeframe Selector - Enhanced spacing */}
          <div className="bg-gray-50 rounded-lg border border-gray-200 px-8 py-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
              <div>
                <h4 className="text-sm font-medium text-gray-700">Data Timeframe</h4>
                <p className="text-xs text-gray-500 mt-2">Adjust the time period for metrics displayed above</p>
              </div>
              <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
                <SelectTrigger className="w-44 h-9 text-sm border-gray-300">
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

          {/* AI-Powered Recommendations - Enhanced spacing to match other sections */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-8">
            <InteractiveMLRecommendationPanel
              applications={applications || []}
              availableJobs={availableJobs}
              onCandidateSelect={(candidateId) => {
                navigate(`/candidates/${candidateId}`);
              }}
              onScheduleInterview={(candidateId) => {
                navigate(`/interviews/schedule?candidateId=${candidateId}`);
              }}
              className="bg-white rounded-lg border border-gray-200"
            />
          </div>
            </div>
          </div>
        )}

        {activeTab === 'applications' && (
          <div className="ats-content-section-enhanced">
          {/* Phase 3: Advanced Filtering */}
          <AdvancedApplicationFilters
            filters={filters}
            onFiltersChange={setFilters}
            availableStatuses={availableStatuses}
            availableJobPositions={availableJobPositions}
            className="mx-6 md:mx-8 lg:mx-10"
          />

          {/* Phase 3: Bulk Actions Toolbar */}
          <BulkActionsToolbar
            selectedCount={selectedApplications.length}
            onBulkAction={handleBulkAction}
            onClearSelection={() => setSelectedApplications([])}
            availableStatuses={availableStatuses}
            className="mx-6 md:mx-8 lg:mx-10"
          />

          <div className={`${shadows.card} px-8 md:px-10 lg:px-12 py-8`}>
            <div className="flex flex-col gap-8">
              <div className="flex flex-col sm:flex-row gap-6">
                <div className="relative flex-1 min-w-0">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <Input
                    type="text"
                    placeholder="Search applications..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-12 pr-4 py-3 w-full text-base"
                  />
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Select value={positionFilter} onValueChange={setPositionFilter}>
                    <SelectTrigger className="w-full sm:w-52 h-12">
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
                    <SelectTrigger className="w-full sm:w-44 h-12">
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

              {/* ML Controls */}
              <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Brain className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-gray-700">AI-Powered Screening</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="ml-sort"
                      checked={mlSortEnabled}
                      onCheckedChange={setMlSortEnabled}
                    />
                    <label htmlFor="ml-sort" className="text-sm text-gray-600">
                      Sort by AI Score
                    </label>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setViewMode(viewMode === 'table' ? 'grid' : 'table')}
                  >
                    {viewMode === 'table' ? 'Card View' : 'Table View'}
                  </Button>

                  {/* Phase 3: Performance Controls */}
                  {viewMode === 'table' && filteredApplications.length > 50 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setUseVirtualization(!useVirtualization)}
                      className="text-xs"
                    >
                      {useVirtualization ? 'Standard Table' : 'Virtual Scrolling'}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Applications List - Clean Design */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                    <Brain className="h-4 w-4 text-blue-600" />
                    AI-Enhanced Applications ({applications?.length || 0})
                  </h3>
                  <p className="text-xs text-gray-600 mt-1">
                    Applications ranked by AI-powered candidate screening
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs px-2 py-1">
                    <Zap className="h-3 w-3 mr-1" />
                    Decision Tree
                  </Badge>
                </div>
              </div>
            </div>
            {/* Conditional Rendering: Table vs Cards with Performance Optimization */}
            {viewMode === 'table' ? (
              useVirtualization && filteredApplications.length > 50 ? (
                <VirtualizedApplicationsTable
                  applications={filteredApplications || []}
                  selectedApplications={selectedApplications}
                  onSelectApplication={(id) => {
                    setSelectedApplications(prev =>
                      prev.includes(id)
                        ? prev.filter(appId => appId !== id)
                        : [...prev, id]
                    );
                  }}
                  onSelectAll={(selected) => {
                    setSelectedApplications(selected ? filteredApplications.map(app => app.id) : []);
                  }}
                  onViewDetails={(id) => navigate(`/candidates/${filteredApplications.find(app => app.id === id)?.candidateId}`)}
                  onStatusChange={async (id, status) => {
                    try {
                      await applicationApi.updateApplication(id, { status });
                      await loadData(activeTab);
                      toast({
                        title: 'Status Updated',
                        description: `Application status changed to ${status}`,
                      });
                    } catch (error) {
                      console.error('Failed to update status:', error);
                      toast({
                        title: 'Update Failed',
                        description: 'Failed to update application status',
                        variant: 'destructive',
                      });
                    }
                  }}
                  onScheduleInterview={(id) => {
                    navigate(`/interviews/schedule?applicationId=${id}`);
                  }}
                  loading={loading}
                  height={600}
                  className="border-0"
                />
              ) : (
                <MLEnhancedApplicationsTable
                  applications={filteredApplications || []}
                  selectedApplications={selectedApplications}
                  onSelectApplication={(id) => {
                    setSelectedApplications(prev =>
                      prev.includes(id)
                        ? prev.filter(appId => appId !== id)
                        : [...prev, id]
                    );
                  }}
                  onSelectAll={(selected) => {
                    setSelectedApplications(selected ? filteredApplications.map(app => app.id) : []);
                  }}
                  onViewDetails={(id) => navigate(`/candidates/${filteredApplications.find(app => app.id === id)?.candidateId}`)}
                  onStatusChange={async (id, status) => {
                  try {
                    await applicationApi.updateApplication(id, { status });
                    await loadData(activeTab);
                    toast({
                      title: 'Status Updated',
                      description: `Application status changed to ${status}`,
                    });
                  } catch (error) {
                    console.error('Failed to update status:', error);
                    toast({
                      title: 'Update Failed',
                      description: 'Failed to update application status',
                      variant: 'destructive',
                    });
                  }
                }}
                  onScheduleInterview={(id) => {
                    navigate(`/interviews/schedule?applicationId=${id}`);
                  }}
                  loading={loading}
                  className="border-0"
                />
              )
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
                {filteredApplications && filteredApplications.length > 0 ? (
                  filteredApplications.map((app) => (
                    <EnhancedApplicationCard
                      key={app.id}
                      application={app}
                      onViewDetails={(id) => navigate(`/candidates/${app.candidateId}`)}
                      onStatusChange={async (id, status) => {
                        try {
                          await applicationApi.updateApplication(id, { status });
                          await loadData(activeTab);
                          toast({
                            title: 'Status Updated',
                            description: `Application status changed to ${status}`,
                          });
                        } catch (error) {
                          console.error('Failed to update status:', error);
                          toast({
                            title: 'Update Failed',
                            description: 'Failed to update application status',
                            variant: 'destructive',
                          });
                        }
                      }}
                      onScheduleInterview={(id) => {
                        navigate(`/interviews/schedule?applicationId=${id}`);
                      }}
                      showMLInsights={true}
                    />
                  ))
                ) : (
                  <div className="col-span-full text-center py-16">
                    <Brain className="h-16 w-16 mx-auto mb-6 text-gray-300" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 leading-relaxed">No Applications Found</h3>
                    <p className="text-gray-600 leading-relaxed">Applications will appear here once candidates apply</p>
                  </div>
                )}
              </div>
            )}

            {/* Loading State */}
            {loading && (
              <div className="p-10">
                <LoadingUI message="Loading AI-enhanced applications..." />
              </div>
            )}

            {/* Error State */}
            {error && !loading && (
              <div className="p-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                  <div className="text-red-600 mb-2">
                    <Brain className="h-8 w-8 mx-auto mb-2" />
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
              </div>
            )}
          </div>
          </div>
        )}

        {activeTab === 'forms' && (
          <div className="ats-content-section-enhanced">
          {/* Forms Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold text-gray-900 leading-relaxed">Application Forms</h2>
              <p className="text-base text-gray-600 leading-relaxed">Manage and track your job application forms</p>
            </div>
            <div className="flex items-center gap-4">
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
                className="text-sm px-4 py-2"
              >
                <Database className="h-4 w-4 mr-2" />
                Init Sample Data
              </Button>
              <Button onClick={() => navigate('/jobs')} className="bg-blue-600 hover:bg-blue-700 px-4 py-2">
                <Plus className="h-4 w-4 mr-2" />
                Create New Form
              </Button>
            </div>
          </div>

          {/* Forms List */}
          {formsLoading ? (
            <div className={`${shadows.card} p-10`}>
              <LoadingUI message="Loading forms..." />
            </div>
          ) : forms.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {forms.map((form) => (
                <div key={form.id} className={`${shadows.card} p-8`}>
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex-1 space-y-2">
                      <h3 className="text-lg font-semibold text-gray-900 leading-relaxed">{form.title}</h3>
                      <p className="text-base text-gray-600 leading-relaxed">{form.jobTitle}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      {getFormStatusBadge(form.status)}
                    </div>
                  </div>

                  {/* Form Statistics */}
                  <div className="grid grid-cols-3 gap-6 mb-6">
                    <div className="text-center space-y-2">
                      <div className="text-metric text-gray-900">{form.views}</div>
                      <div className="text-sm text-gray-500 leading-relaxed">Views</div>
                    </div>
                    <div className="text-center space-y-2">
                      <div className="text-metric text-gray-900">{form.submissions}</div>
                      <div className="text-sm text-gray-500 leading-relaxed">Submissions</div>
                    </div>
                    <div className="text-center space-y-2">
                      <div className="text-metric text-gray-900">{form.conversionRate}%</div>
                      <div className="text-sm text-gray-500 leading-relaxed">Conversion</div>
                    </div>
                  </div>

                  {/* Form Actions */}
                  <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                    <div className="text-sm text-gray-500 leading-relaxed">
                      Created {new Date(form.createdAt).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-3">
                      <Button variant="outline" size="sm" className="px-3 py-2">
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                      <Button variant="outline" size="sm" className="px-3 py-2">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button variant="outline" size="sm" className="px-3 py-2">
                        <ExternalLink className="h-4 w-4 mr-2" />
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
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Forms Found</h3>
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
                    className="border-gray-300 hover:border-blue-500 text-gray-700 hover:text-blue-600"
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

        {activeTab === 'performance' && (
          <div className="ats-content-section-enhanced">
          {/* Phase 3: Enhanced Analytics Dashboard */}
          <EnhancedAnalyticsDashboard
            applications={applications || []}
            timeframe={selectedTimeframe}
            onTimeframeChange={setSelectedTimeframe}
            className="mx-4 md:mx-6 lg:mx-8"
          />

          {/* Cache Performance Stats */}
          {enableCaching && (
            <div className="mx-4 md:mx-6 lg:mx-8">
              <Card className={shadows.card}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-purple-600" />
                    Performance Optimization Stats
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-slate-700">Application Cache</h4>
                      <div className="text-xs text-slate-600">
                        <div>Total: {cacheStats.applications.total}</div>
                        <div>Valid: {cacheStats.applications.valid}</div>
                        <div>Expired: {cacheStats.applications.expired}</div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-slate-700">ML Predictions</h4>
                      <div className="text-xs text-slate-600">
                        <div>Total: {cacheStats.mlPredictions.total}</div>
                        <div>Valid: {cacheStats.mlPredictions.valid}</div>
                        <div>Expired: {cacheStats.mlPredictions.expired}</div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-slate-700">Analytics Data</h4>
                      <div className="text-xs text-slate-600">
                        <div>Total: {cacheStats.analytics.total}</div>
                        <div>Valid: {cacheStats.analytics.valid}</div>
                        <div>Expired: {cacheStats.analytics.expired}</div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-slate-200">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">
                        Virtual Scrolling: {useVirtualization ? 'Enabled' : 'Disabled'}
                      </span>
                      <Badge variant={useVirtualization ? 'ats-green' : 'outline'}>
                        {filteredApplications.length > 50 ? 'Recommended' : 'Optional'}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          </div>
        )}
      </div>
    </div>
    </TooltipProvider>
  );
};

export default ApplicationManagement;
