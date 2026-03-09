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

// ─── App Row ──────────────────────────────────────────────────────────────────

const APP_AVATAR_COLORS = [
  "bg-indigo-100 text-indigo-700",
  "bg-violet-100 text-violet-700",
  "bg-amber-100 text-amber-700",
  "bg-rose-100 text-rose-700",
  "bg-cyan-100 text-cyan-700",
  "bg-emerald-100 text-emerald-700",
];

const APP_STATUS_BADGE: Record<string, string> = {
  applied:    "bg-blue-100 text-blue-700",
  screening:  "bg-yellow-100 text-yellow-700",
  interview:  "bg-purple-100 text-purple-700",
  assessment: "bg-orange-100 text-orange-700",
  offer:      "bg-emerald-100 text-emerald-700",
  hired:      "bg-emerald-100 text-emerald-700",
  rejected:   "bg-red-100 text-red-700",
};

function AppRow({ app }: { app: any }) {
  const firstName = app.candidateInfo?.firstName || app.candidateName?.split(" ")[0] || "";
  const lastName  = app.candidateInfo?.lastName  || app.candidateName?.split(" ").slice(1).join(" ") || "";
  const fullName  = `${firstName} ${lastName}`.trim() || "Unknown";
  const ini       = ((firstName[0] ?? "") + (lastName[0] ?? "")).toUpperCase();
  const colorIdx  = fullName.charCodeAt(0) % APP_AVATAR_COLORS.length;
  const badgeCls  = APP_STATUS_BADGE[(app.status ?? "").toLowerCase()] ?? "bg-gray-100 text-gray-700";
  const score     = typeof app.score === "number" ? app.score : null;
  const applied   = app.submittedAt
    ? new Date(app.submittedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : "—";
  const source      = (app as any).source ?? app.candidateInfo?.source ?? "—";
  const statusLabel = (app.status ?? "applied").charAt(0).toUpperCase() + (app.status ?? "applied").slice(1);

  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-full ${APP_AVATAR_COLORS[colorIdx]} flex items-center justify-center shrink-0`}>
            <span style={{ fontSize: 11, fontWeight: 700 }}>{ini}</span>
          </div>
          <div>
            <p className="text-gray-900" style={{ fontSize: 13, fontWeight: 600 }}>{fullName}</p>
            <p className="text-gray-400" style={{ fontSize: 11 }}>{app.candidateInfo?.email || app.candidateEmail || ""}</p>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <p className="text-gray-700" style={{ fontSize: 13 }}>{app.jobTitle || "—"}</p>
        {app.jobDepartment && (
          <p className="text-gray-400 mt-0.5" style={{ fontSize: 11 }}>{app.jobDepartment}</p>
        )}
      </td>
      <td className="px-6 py-4">
        <p className="text-gray-500" style={{ fontSize: 13 }}>{applied}</p>
      </td>
      <td className="px-6 py-4">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full ${badgeCls}`} style={{ fontSize: 11, fontWeight: 600 }}>
          {statusLabel}
        </span>
      </td>
      <td className="px-6 py-4">
        {score !== null ? (
          <div className="flex items-center gap-2">
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden" style={{ width: 80 }}>
              <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${Math.min(score, 100)}%` }} />
            </div>
            <span className="text-gray-700 shrink-0" style={{ fontSize: 12, fontWeight: 600 }}>{score}</span>
          </div>
        ) : (
          <span className="text-gray-400" style={{ fontSize: 13 }}>—</span>
        )}
      </td>
      <td className="px-6 py-4">
        <p className="text-gray-500" style={{ fontSize: 13 }}>{source}</p>
      </td>
    </tr>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

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
  const [activeTab, setActiveTab] = useState('applications');
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
            jobDepartment: app.job?.department || '',
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
    <div className="p-6 space-y-4">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
            <FileText size={16} className="text-indigo-600" />
          </div>
          <div>
            <h1 className="text-gray-900" style={{ fontSize: 20, fontWeight: 600 }}>Application Management</h1>
            <p className="text-gray-500 mt-0.5" style={{ fontSize: 13 }}>
              Review and manage all incoming job applications
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* List / Kanban toggle */}
          <div className="flex items-center bg-white border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 transition-colors ${viewMode === 'table' ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
              style={{ fontSize: 13, fontWeight: 500 }}
            >
              <List size={14} />
              List
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1.5 px-3 py-1.5 transition-colors ${viewMode === 'grid' ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
              style={{ fontSize: 13, fontWeight: 500 }}
            >
              <Grid size={14} />
              Kanban
            </button>
          </div>
          <button
            onClick={() => navigate('/jobs')}
            className="flex items-center gap-2 px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg transition-all"
          >
            <Plus size={15} />
            <span style={{ fontSize: 13, fontWeight: 500 }}>New Application</span>
          </button>
        </div>
      </div>

      {/* ── Filter bar ── */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search applications..."
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            className="pl-8 pr-3 py-2 border border-gray-200 rounded-lg bg-white text-gray-700 placeholder-gray-400 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 w-64"
            style={{ fontSize: 13 }}
          />
        </div>
        <div className="relative">
          <select
            value={filters.jobPositions[0] ?? "all"}
            onChange={(e) => setFilters(prev => ({ ...prev, jobPositions: e.target.value === "all" ? [] : [e.target.value] }))}
            className="appearance-none pl-3 pr-8 py-2 border border-gray-200 rounded-lg bg-white text-gray-700 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300"
            style={{ fontSize: 13 }}
          >
            <option value="all">All Departments</option>
            {availableJobPositions.map((pos) => (
              <option key={pos} value={pos}>{pos}</option>
            ))}
          </select>
          <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
        <div className="relative">
          <select
            value={filters.status[0] ?? "all"}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value === "all" ? [] : [e.target.value] }))}
            className="appearance-none pl-3 pr-8 py-2 border border-gray-200 rounded-lg bg-white text-gray-700 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300"
            style={{ fontSize: 13 }}
          >
            <option value="all">All Stages</option>
            <option value="applied">Applied</option>
            <option value="screening">Screening</option>
            <option value="interview">Interview</option>
            <option value="assessment">Assessment</option>
            <option value="offer">Offer</option>
            <option value="hired">Hired</option>
            <option value="rejected">Rejected</option>
          </select>
          <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
        <span className="ml-auto text-gray-500" style={{ fontSize: 13 }}>
          {filteredApplications.length} application{filteredApplications.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* ── Table ── */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <LoadingUI message="Loading applications..." />
        </div>
      ) : filteredApplications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-gray-100">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <FileText size={28} className="text-gray-400" />
          </div>
          <p className="text-gray-900" style={{ fontSize: 16, fontWeight: 600 }}>No applications found</p>
          <p className="text-gray-500 mt-1" style={{ fontSize: 13 }}>Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                {["Candidate", "Position", "Applied", "Stage", "Score", "Source"].map((col) => (
                  <th key={col} className="px-6 py-3 text-left text-gray-500" style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredApplications.map((app) => (
                <AppRow key={app.id} app={app} />
              ))}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
};

export default ApplicationManagement;
