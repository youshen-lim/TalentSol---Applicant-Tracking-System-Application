import React, { useState, useMemo } from 'react';
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
  SlidersHorizontal
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

import { Application, ApplicationStatus } from '@/types/application';

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
  onApplicationAction: (applicationId: string, action: string) => void;
  onBulkAction: (applicationIds: string[], action: string) => void;
}

const ApplicationReviewDashboard: React.FC<ApplicationReviewDashboardProps> = ({
  jobId,
  applications = mockApplications,
  onApplicationAction,
  onBulkAction
}) => {
  const { toast } = useToast();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | 'all'>('all');
  const [scoreFilter, setScoreFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedApplications, setSelectedApplications] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<string>('submittedAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Filter and sort applications
  const filteredApplications = useMemo(() => {
    let filtered = applications.filter(app => {
      // Search filter
      const searchMatch = !searchQuery || 
        `${app.candidateInfo.firstName} ${app.candidateInfo.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.candidateInfo.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.professionalInfo.currentTitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.professionalInfo.currentCompany?.toLowerCase().includes(searchQuery.toLowerCase());

      // Status filter
      const statusMatch = statusFilter === 'all' || app.status === statusFilter;

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
  }, [applications, searchQuery, statusFilter, scoreFilter, sortBy, sortOrder]);

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

  const handleApplicationAction = (applicationId: string, action: string) => {
    onApplicationAction(applicationId, action);
    
    const actionLabels = {
      view: 'Viewing application',
      interview: 'Moved to interview',
      reject: 'Application rejected',
      hire: 'Candidate hired',
      note: 'Note added'
    };

    toast.atsBlue({
      title: 'Action Completed',
      description: actionLabels[action as keyof typeof actionLabels] || 'Action completed'
    });
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

  const ApplicationCard = ({ application }: { application: Application }) => (
    <Card className="hover:shadow-md transition-shadow">
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
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
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
          </h1>
          <p className="text-sm text-gray-500">
            Review and manage job applications • {filteredApplications.length} application{filteredApplications.length !== 1 ? 's' : ''} found
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm" onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}>
            {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search candidates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as ApplicationStatus | 'all')}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="reviewed">Reviewed</SelectItem>
                  <SelectItem value="screening">Screening</SelectItem>
                  <SelectItem value="interview">Interview</SelectItem>
                  <SelectItem value="offer">Offer</SelectItem>
                  <SelectItem value="hired">Hired</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>

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
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedApplications.length > 0 && (
        <Card className="bg-ats-blue/5 border-ats-blue/20">
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
                <Button variant="outline" size="sm" onClick={() => onBulkAction(selectedApplications, 'interview')}>
                  <Calendar className="h-4 w-4 mr-1" />
                  Schedule Interviews
                </Button>
                <Button variant="outline" size="sm" onClick={() => onBulkAction(selectedApplications, 'reject')}>
                  <XCircle className="h-4 w-4 mr-1" />
                  Reject
                </Button>
                <Button variant="outline" size="sm" onClick={() => onBulkAction(selectedApplications, 'export')}>
                  <Download className="h-4 w-4 mr-1" />
                  Export
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Applications Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredApplications.map((application) => (
            <ApplicationCard key={application.id} application={application} />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            {/* List view implementation would go here */}
            <div className="p-4 text-center text-gray-500">
              List view implementation coming soon...
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {filteredApplications.length === 0 && (
        <Card className="p-12 text-center">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No applications found</h3>
          <p className="text-gray-500">
            {searchQuery || statusFilter !== 'all' || scoreFilter !== 'all'
              ? "Try adjusting your search or filters"
              : "No applications have been submitted yet"
            }
          </p>
        </Card>
      )}
    </div>
  );
};

export default ApplicationReviewDashboard;
