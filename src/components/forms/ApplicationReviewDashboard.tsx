import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  MessageSquare,
  Calendar,
  Star,
  Download,
  Mail,
  Phone,
  MapPin,
  Building,
  Clock,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
  Users,
  TrendingUp,
  Grid,
  List,
  SlidersHorizontal,
  Loader2,
  RefreshCw
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import { shadows } from '@/components/ui/shadow';

import { Application, ApplicationStatus } from '@/types/application';
import { useApplications } from '@/hooks/useApplications';
import ApplicationKanbanBoard from '@/components/applications/ApplicationKanbanBoard';

// Mock data for applications
const mockApplications: Application[] = [
  {
    id: 'app_001',
    jobId: 'job_123',
    status: 'new',
    submittedAt: '2024-01-20T10:30:00Z',
    lastModified: '2024-01-20T10:30:00Z',
    candidateInfo: {
      firstName: 'Sarah',
      lastName: 'Johnson',
      email: 'sarah.johnson@email.com',
      phone: '+1-555-0123',
      location: { city: 'San Francisco', state: 'CA', country: 'US' },
      workAuthorization: 'US Citizen',
      linkedinUrl: 'https://linkedin.com/in/sarahjohnson'
    },
    professionalInfo: {
      currentTitle: 'Senior Frontend Developer',
      currentCompany: 'Tech Corp',
      experience: '5-7 years',
      expectedSalary: { min: 130000, max: 150000, currency: 'USD', negotiable: true },
      noticePeriod: '2 weeks',
      remoteWork: true
    },
    documents: {
      resume: {
        id: 'doc_001',
        url: '/documents/resume_sarah.pdf',
        filename: 'Sarah_Johnson_Resume.pdf',
        originalName: 'Sarah_Johnson_Resume.pdf',
        fileSize: 245760,
        mimeType: 'application/pdf',
        uploadedAt: '2024-01-20T10:25:00Z',
        virusScanned: true,
        scanResult: 'clean'
      }
    },
    customAnswers: {},
    metadata: {
      source: 'company_website',
      ipAddress: '192.168.1.1',
      userAgent: 'Mozilla/5.0...',
      formVersion: '1.0',
      completionTime: 1200,
      gdprConsent: true,
      marketingConsent: false
    },
    scoring: {
      automaticScore: 85,
      skillMatches: ['React', 'TypeScript', 'Node.js'],
      qualificationsMet: true,
      experienceMatch: 90,
      salaryMatch: 85,
      locationMatch: 100,
      flags: []
    },
    activity: []
  },
  // Add more mock applications...
];

interface ApplicationReviewDashboardProps {
  jobId?: string;
  applications?: Application[];
  viewMode?: 'board' | 'list';
  onApplicationAction: (applicationId: string, action: string) => void;
  onBulkAction: (applicationIds: string[], action: string) => void;
}

const ApplicationReviewDashboard: React.FC<ApplicationReviewDashboardProps> = ({
  jobId,
  applications: propApplications,
  viewMode: propViewMode = 'list',
  onApplicationAction,
  onBulkAction
}) => {
  const { toast } = useToast();

  // State for filters and UI
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | 'all'>('all');
  const [scoreFilter, setScoreFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'board' | 'list'>(propViewMode);
  const [selectedApplications, setSelectedApplications] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<string>('submittedAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);

  // Update viewMode when prop changes
  useEffect(() => {
    setViewMode(propViewMode);
  }, [propViewMode]);

  // Use real API data with fallback to props or mock data
  const {
    applications: apiApplications,
    pagination,
    loading,
    error,
    refetch,
    updateApplication,
    bulkUpdateApplications
  } = useApplications({
    page: currentPage,
    limit: pageSize,
    jobId: jobId,
    status: statusFilter !== 'all' ? statusFilter : undefined,
    search: searchQuery || undefined,
  });

  // Determine which applications to use
  const applications = propApplications || apiApplications || mockApplications;

  // Filter and sort applications
  const filteredApplications = useMemo(() => {
    let filtered = applications.filter(app => {
      // Search filter
      const searchMatch = !searchQuery ||
        `${app.candidateInfo.firstName} ${app.candidateInfo.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.candidateInfo.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.professionalInfo.currentTitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.professionalInfo.currentCompany?.toLowerCase().includes(searchQuery.toLowerCase());

      // Status filter - only apply in list view, board view shows all statuses
      const statusMatch = viewMode === 'board' || statusFilter === 'all' || app.status === statusFilter;

      // Score filter
      const scoreMatch = scoreFilter === 'all' ||
        (scoreFilter === 'high' && app.scoring.automaticScore >= 80) ||
        (scoreFilter === 'medium' && app.scoring.automaticScore >= 60 && app.scoring.automaticScore < 80) ||
        (scoreFilter === 'low' && app.scoring.automaticScore < 60);

      return searchMatch && statusMatch && scoreMatch;
    });

    // Sort applications
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'name':
          aValue = `${a.candidateInfo.firstName} ${a.candidateInfo.lastName}`;
          bValue = `${b.candidateInfo.firstName} ${b.candidateInfo.lastName}`;
          break;
        case 'score':
          aValue = a.scoring.automaticScore;
          bValue = b.scoring.automaticScore;
          break;
        case 'submittedAt':
          aValue = new Date(a.submittedAt || 0);
          bValue = new Date(b.submittedAt || 0);
          break;
        default:
          return 0;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [applications, searchQuery, statusFilter, scoreFilter, sortBy, sortOrder, viewMode]);

  const getStatusBadge = (status: ApplicationStatus) => {
    const statusConfig = {
      draft: { color: 'bg-gray-500', label: 'Draft' },
      submitted: { color: 'bg-blue-500', label: 'Submitted' },
      new: { color: 'bg-green-500', label: 'New' },
      reviewed: { color: 'bg-yellow-500', label: 'Reviewed' },
      screening: { color: 'bg-orange-500', label: 'Screening' },
      phone_screen: { color: 'bg-purple-500', label: 'Phone Screen' },
      interview: { color: 'bg-indigo-500', label: 'Interview' },
      assessment: { color: 'bg-pink-500', label: 'Assessment' },
      reference_check: { color: 'bg-teal-500', label: 'Reference Check' },
      offer: { color: 'bg-emerald-500', label: 'Offer' },
      hired: { color: 'bg-green-600', label: 'Hired' },
      rejected: { color: 'bg-red-500', label: 'Rejected' },
      withdrawn: { color: 'bg-gray-400', label: 'Withdrawn' }
    };

    const config = statusConfig[status];
    return (
      <Badge className={`${config.color} text-white hover:${config.color}/80`}>
        {config.label}
      </Badge>
    );
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const handleApplicationAction = async (applicationId: string, action: string) => {
    try {
      // Handle different actions
      switch (action) {
        case 'view':
          // Just call the parent handler for view action
          onApplicationAction(applicationId, action);
          break;

        case 'interview':
          // Update status to interview
          const interviewSuccess = await updateApplication(applicationId, { status: 'interview' });
          if (interviewSuccess) {
            onApplicationAction(applicationId, action);
            toast.atsBlue({
              title: 'Status Updated',
              description: 'Application moved to interview stage'
            });
          }
          break;

        case 'reject':
          // Update status to rejected
          const rejectSuccess = await updateApplication(applicationId, { status: 'rejected' });
          if (rejectSuccess) {
            onApplicationAction(applicationId, action);
            toast.atsBlue({
              title: 'Application Rejected',
              description: 'Application has been rejected'
            });
          }
          break;

        case 'hire':
          // Update status to hired
          const hireSuccess = await updateApplication(applicationId, { status: 'hired' });
          if (hireSuccess) {
            onApplicationAction(applicationId, action);
            toast.atsBlue({
              title: 'Candidate Hired',
              description: 'Candidate has been hired'
            });
          }
          break;

        case 'note':
          // For now, just call parent handler
          onApplicationAction(applicationId, action);
          toast.atsBlue({
            title: 'Note Added',
            description: 'Note has been added to application'
          });
          break;

        default:
          onApplicationAction(applicationId, action);
      }
    } catch (error) {
      console.error('Failed to perform action:', error);
      toast({
        title: 'Error',
        description: 'Failed to perform action. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleStatusChange = async (applicationId: string, newStatus: ApplicationStatus) => {
    try {
      const success = await updateApplication(applicationId, { status: newStatus });
      if (success) {
        // The local state is already updated by the updateApplication function
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to update application status:', error);
      throw error;
    }
  };

  const handleSelectApplication = (applicationId: string) => {
    setSelectedApplications(prev => 
      prev.includes(applicationId)
        ? prev.filter(id => id !== applicationId)
        : [...prev, applicationId]
    );
  };

  const handleSelectAll = () => {
    if (selectedApplications.length === filteredApplications.length) {
      setSelectedApplications([]);
    } else {
      setSelectedApplications(filteredApplications.map(app => app.id));
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedApplications.length === 0) return;

    try {
      switch (action) {
        case 'interview':
          const interviewSuccess = await bulkUpdateApplications(selectedApplications, { status: 'interview' });
          if (interviewSuccess) {
            onBulkAction(selectedApplications, action);
            toast.atsBlue({
              title: 'Bulk Action Completed',
              description: `${selectedApplications.length} applications moved to interview stage`
            });
            setSelectedApplications([]);
          }
          break;

        case 'reject':
          const rejectSuccess = await bulkUpdateApplications(selectedApplications, { status: 'rejected' });
          if (rejectSuccess) {
            onBulkAction(selectedApplications, action);
            toast.atsBlue({
              title: 'Bulk Action Completed',
              description: `${selectedApplications.length} applications rejected`
            });
            setSelectedApplications([]);
          }
          break;

        case 'export':
          // Handle export action
          onBulkAction(selectedApplications, action);
          toast.atsBlue({
            title: 'Export Started',
            description: `Exporting ${selectedApplications.length} applications`
          });
          break;

        default:
          onBulkAction(selectedApplications, action);
      }
    } catch (error) {
      console.error('Failed to perform bulk action:', error);
      toast({
        title: 'Error',
        description: 'Failed to perform bulk action. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const ApplicationCard = ({ application }: { application: Application }) => (
    <Card className={`${shadows.card} cursor-pointer`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={selectedApplications.includes(application.id)}
              onChange={() => handleSelectApplication(application.id)}
              className="mt-1"
            />
            <Avatar className="h-10 w-10">
              <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${application.candidateInfo.firstName} ${application.candidateInfo.lastName}`} />
              <AvatarFallback>
                {application.candidateInfo.firstName[0]}{application.candidateInfo.lastName[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="font-semibold text-lg">
                {application.candidateInfo.firstName} {application.candidateInfo.lastName}
              </h3>
              <p className="text-sm text-gray-600">
                {application.professionalInfo.currentTitle} at {application.professionalInfo.currentCompany}
              </p>
              <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                <MapPin className="h-3 w-3" />
                {application.candidateInfo.location.city}, {application.candidateInfo.location.state}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {getStatusBadge(application.status)}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className={`h-8 w-8 ${shadows.button}`}>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className={shadows.dropdown}>
                <DropdownMenuItem onClick={() => handleApplicationAction(application.id, 'view')}>
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleApplicationAction(application.id, 'interview')}>
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Interview
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleApplicationAction(application.id, 'note')}>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Add Note
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleApplicationAction(application.id, 'reject')}>
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-gray-400" />
            <span className="truncate">{application.candidateInfo.email}</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-gray-400" />
            <span>{application.candidateInfo.phone}</span>
          </div>
          <div className="flex items-center gap-2">
            <Building className="h-4 w-4 text-gray-400" />
            <span>{application.professionalInfo.experience}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-gray-400" />
            <span>{new Date(application.submittedAt || '').toLocaleDateString()}</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Match Score:</span>
            <span className={`font-semibold ${getScoreColor(application.scoring.automaticScore)}`}>
              {application.scoring.automaticScore}%
            </span>
          </div>
          <div className="flex gap-1">
            {application.scoring.skillMatches.slice(0, 3).map((skill, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {skill}
              </Badge>
            ))}
            {application.scoring.skillMatches.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{application.scoring.skillMatches.length - 3}
              </Badge>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <Button 
            size="sm" 
            className="flex-1 bg-ats-blue hover:bg-ats-dark-blue"
            onClick={() => handleApplicationAction(application.id, 'view')}
          >
            <Eye className="h-3 w-3 mr-1" />
            View
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            className="flex-1"
            onClick={() => handleApplicationAction(application.id, 'interview')}
          >
            <Calendar className="h-3 w-3 mr-1" />
            Interview
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Users className="h-6 w-6 text-ats-blue" />
            Applications
            {loading && <Loader2 className="h-4 w-4 animate-spin text-ats-blue" />}
          </h1>
          <p className="text-sm text-gray-500">
            {loading ? (
              'Loading applications...'
            ) : error ? (
              `Error loading applications • Showing ${filteredApplications.length} cached result${filteredApplications.length !== 1 ? 's' : ''}`
            ) : (
              `Review and manage job applications • ${filteredApplications.length} application${filteredApplications.length !== 1 ? 's' : ''} found`
            )}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={loading}
            className={shadows.button}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleBulkAction('export')}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Filters - Show for both board and list view */}
      <Card className={shadows.card}>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search candidates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`pl-10 ${shadows.input}`}
              />
            </div>

            <div className="flex gap-2">
              {/* Only show status filter for list view, board view shows all statuses */}
              {viewMode === 'list' && (
                <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as ApplicationStatus | 'all')}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="applied">Applied</SelectItem>
                    <SelectItem value="reviewed">Reviewed</SelectItem>
                    <SelectItem value="screening">Screening</SelectItem>
                    <SelectItem value="interview">Interview</SelectItem>
                    <SelectItem value="assessment">Assessment</SelectItem>
                    <SelectItem value="offer">Offer</SelectItem>
                    <SelectItem value="hired">Hired</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              )}

              <Select value={scoreFilter} onValueChange={setScoreFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Score" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Scores</SelectItem>
                  <SelectItem value="high">High (80+)</SelectItem>
                  <SelectItem value="medium">Medium (60-79)</SelectItem>
                  <SelectItem value="low">Low (&lt;60)</SelectItem>
                </SelectContent>
              </Select>

              {viewMode === 'list' && (
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="submittedAt">Date Applied</SelectItem>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="score">Match Score</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedApplications.length > 0 && (
        <Card className={`bg-ats-blue/5 border-ats-blue/20 ${shadows.card}`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <input
                  type="checkbox"
                  checked={selectedApplications.length === filteredApplications.length}
                  onChange={handleSelectAll}
                />
                <span className="text-sm font-medium">
                  {selectedApplications.length} application{selectedApplications.length !== 1 ? 's' : ''} selected
                </span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className={shadows.button}
                  onClick={() => handleBulkAction('interview')}
                  disabled={loading}
                >
                  <Calendar className="h-4 w-4 mr-1" />
                  Schedule Interviews
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className={shadows.button}
                  onClick={() => handleBulkAction('reject')}
                  disabled={loading}
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  Reject
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className={shadows.button}
                  onClick={() => handleBulkAction('export')}
                  disabled={loading}
                >
                  <Download className="h-4 w-4 mr-1" />
                  Export
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Applications Grid/List */}
      {loading && applications.length === 0 ? (
        // Loading state
        <Card className={shadows.card}>
          <CardContent className="p-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-ats-blue" />
            <p className="text-gray-500">Loading applications...</p>
          </CardContent>
        </Card>
      ) : error && applications.length === 0 ? (
        // Error state
        <Card className={shadows.card}>
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-8 w-8 mx-auto mb-4 text-red-500" />
            <p className="text-gray-900 font-medium mb-2">Failed to load applications</p>
            <p className="text-gray-500 mb-4">{error}</p>
            <Button onClick={() => refetch()} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      ) : filteredApplications.length === 0 ? (
        // Empty state
        <Card className={shadows.card}>
          <CardContent className="p-8 text-center">
            <Users className="h-8 w-8 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-900 font-medium mb-2">No applications found</p>
            <p className="text-gray-500">
              {searchQuery || statusFilter !== 'all' || scoreFilter !== 'all'
                ? 'Try adjusting your filters to see more results.'
                : 'Applications will appear here once candidates start applying.'}
            </p>
          </CardContent>
        </Card>
      ) : viewMode === 'board' ? (
        <ApplicationKanbanBoard
          applications={filteredApplications}
          onApplicationAction={handleApplicationAction}
          onStatusChange={handleStatusChange}
          loading={loading}
        />
      ) : (
        <Card className={shadows.card}>
          <CardContent className="p-0">
            {/* List View Header */}
            <div className="border-b bg-gray-50 px-6 py-3">
              <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-600">
                <div className="col-span-1">
                  <input
                    type="checkbox"
                    checked={selectedApplications.length === filteredApplications.length}
                    onChange={handleSelectAll}
                  />
                </div>
                <div className="col-span-3">Candidate</div>
                <div className="col-span-2">Position</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-1">Score</div>
                <div className="col-span-2">Applied</div>
                <div className="col-span-1">Actions</div>
              </div>
            </div>

            {/* List View Items */}
            <div className="divide-y">
              {filteredApplications.map((application) => (
                <div key={application.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                  <div className="grid grid-cols-12 gap-4 items-center">
                    <div className="col-span-1">
                      <input
                        type="checkbox"
                        checked={selectedApplications.includes(application.id)}
                        onChange={() => handleSelectApplication(application.id)}
                      />
                    </div>

                    <div className="col-span-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${application.candidateInfo.firstName} ${application.candidateInfo.lastName}`} />
                          <AvatarFallback className="text-xs">
                            {application.candidateInfo.firstName[0]}{application.candidateInfo.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">
                            {application.candidateInfo.firstName} {application.candidateInfo.lastName}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {application.candidateInfo.email}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="col-span-2">
                      <p className="text-sm font-medium">{application.professionalInfo.currentTitle}</p>
                      <p className="text-xs text-gray-500">{application.professionalInfo.currentCompany}</p>
                    </div>

                    <div className="col-span-2">
                      {getStatusBadge(application.status)}
                    </div>

                    <div className="col-span-1">
                      <span className={`font-semibold text-sm ${getScoreColor(application.scoring.automaticScore)}`}>
                        {application.scoring.automaticScore}%
                      </span>
                    </div>

                    <div className="col-span-2">
                      <p className="text-sm">{new Date(application.submittedAt || '').toLocaleDateString()}</p>
                      <p className="text-xs text-gray-500">
                        {application.candidateInfo.location.city}, {application.candidateInfo.location.state}
                      </p>
                    </div>

                    <div className="col-span-1">
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 px-2"
                          onClick={() => handleApplicationAction(application.id, 'view')}
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 px-2"
                          onClick={() => handleApplicationAction(application.id, 'interview')}
                        >
                          <Calendar className="h-3 w-3" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="h-7 w-7 p-0">
                              <MoreHorizontal className="h-3 w-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className={shadows.dropdown}>
                            <DropdownMenuItem onClick={() => handleApplicationAction(application.id, 'view')}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleApplicationAction(application.id, 'interview')}>
                              <Calendar className="h-4 w-4 mr-2" />
                              Schedule Interview
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleApplicationAction(application.id, 'note')}>
                              <MessageSquare className="h-4 w-4 mr-2" />
                              Add Note
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleApplicationAction(application.id, 'reject')}>
                              <XCircle className="h-4 w-4 mr-2" />
                              Reject
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <Card className={shadows.card}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} applications
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={pagination.page <= 1 || loading}
                >
                  Previous
                </Button>
                <span className="text-sm text-gray-500">
                  Page {pagination.page} of {pagination.pages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(pagination.pages, prev + 1))}
                  disabled={pagination.page >= pagination.pages || loading}
                >
                  Next
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ApplicationReviewDashboard;
