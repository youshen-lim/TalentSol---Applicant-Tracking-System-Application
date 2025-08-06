import React, { useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  MoreHorizontal,
  Brain,
  Star,
  Eye,
  Calendar,
  MessageSquare,
  Zap,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { MLStatusIndicator } from '@/components/ml/MLProcessingStatus';
import { ApplicationWithML } from './EnhancedApplicationCard';

interface MLEnhancedApplicationsTableProps {
  applications: ApplicationWithML[];
  selectedApplications: string[];
  onSelectApplication: (applicationId: string) => void;
  onSelectAll: (selected: boolean) => void;
  onViewDetails: (applicationId: string) => void;
  onStatusChange: (applicationId: string, newStatus: string) => void;
  onScheduleInterview: (applicationId: string) => void;
  loading?: boolean;
  className?: string;
}

type SortField = 'name' | 'job' | 'status' | 'score' | 'submitted' | 'mlConfidence';
type SortDirection = 'asc' | 'desc';

/**
 * ML-Enhanced Applications Table
 * Integrates AI-powered candidate screening into the main applications workflow
 * Implements Don Norman's Design Principles:
 * - Visibility: ML scores and insights prominently displayed
 * - Feedback: Clear sorting and selection feedback
 * - Mapping: Intuitive connection between ML scores and hiring decisions
 * - Consistency: Maintains TalentSol table design patterns
 */
export const MLEnhancedApplicationsTable: React.FC<MLEnhancedApplicationsTableProps> = ({
  applications,
  selectedApplications,
  onSelectApplication,
  onSelectAll,
  onViewDetails,
  onStatusChange,
  onScheduleInterview,
  loading = false,
  className
}) => {
  const [sortField, setSortField] = useState<SortField>('score');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Sort applications with ML-first approach
  const sortedApplications = useMemo(() => {
    return [...applications].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case 'name':
          aValue = `${a.candidateInfo.firstName} ${a.candidateInfo.lastName}`;
          bValue = `${b.candidateInfo.firstName} ${b.candidateInfo.lastName}`;
          break;
        case 'job':
          aValue = a.jobTitle;
          bValue = b.jobTitle;
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'score':
          aValue = a.score || 0;
          bValue = b.score || 0;
          break;
        case 'submitted':
          aValue = new Date(a.submittedAt);
          bValue = new Date(b.submittedAt);
          break;
        case 'mlConfidence':
          aValue = a.mlProcessing?.confidence || 0;
          bValue = b.mlProcessing?.confidence || 0;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [applications, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc'); // Default to desc for scores
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="h-3 w-3" />;
    return sortDirection === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />;
  };

  const getScoreColor = (score?: number) => {
    if (!score) return 'text-gray-500';
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreTrend = (score?: number) => {
    if (!score) return null;
    if (score >= 80) return <TrendingUp className="h-3 w-3 text-green-500" />;
    if (score >= 60) return <TrendingUp className="h-3 w-3 text-blue-500" />;
    if (score >= 40) return <TrendingDown className="h-3 w-3 text-yellow-500" />;
    return <TrendingDown className="h-3 w-3 text-red-500" />;
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      applied: { label: 'Applied', color: 'bg-blue-100 text-blue-700' },
      screening: { label: 'Screening', color: 'bg-yellow-100 text-yellow-700' },
      interview: { label: 'Interview', color: 'bg-purple-100 text-purple-700' },
      offer: { label: 'Offer', color: 'bg-green-100 text-green-700' },
      rejected: { label: 'Rejected', color: 'bg-red-100 text-red-700' },
      hired: { label: 'Hired', color: 'bg-emerald-100 text-emerald-700' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.applied;
    return (
      <Badge className={cn('text-xs font-medium', config.color)}>
        {config.label}
      </Badge>
    );
  };

  const allSelected = applications.length > 0 && selectedApplications.length === applications.length;
  const someSelected = selectedApplications.length > 0 && selectedApplications.length < applications.length;

  return (
    <div className={cn("rounded-md border", className)}>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox
                checked={allSelected}
                indeterminate={someSelected}
                onCheckedChange={onSelectAll}
              />
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 p-0 font-medium text-slate-700 hover:text-slate-900"
                onClick={() => handleSort('name')}
              >
                Candidate
                {getSortIcon('name')}
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 p-0 font-medium text-slate-700 hover:text-slate-900"
                onClick={() => handleSort('job')}
              >
                Position
                {getSortIcon('job')}
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 p-0 font-medium text-slate-700 hover:text-slate-900"
                onClick={() => handleSort('status')}
              >
                Status
                {getSortIcon('status')}
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 p-0 font-medium text-slate-700 hover:text-slate-900 flex items-center gap-1"
                onClick={() => handleSort('score')}
              >
                <Brain className="h-3 w-3 text-blue-600" />
                AI Score
                {getSortIcon('score')}
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 p-0 font-medium text-slate-700 hover:text-slate-900"
                onClick={() => handleSort('mlConfidence')}
              >
                <Zap className="h-3 w-3 text-purple-600" />
                Confidence
                {getSortIcon('mlConfidence')}
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 p-0 font-medium text-slate-700 hover:text-slate-900"
                onClick={() => handleSort('submitted')}
              >
                Submitted
                {getSortIcon('submitted')}
              </Button>
            </TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                Loading applications...
              </TableCell>
            </TableRow>
          ) : sortedApplications.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                No applications found
              </TableCell>
            </TableRow>
          ) : (
            sortedApplications.map((application) => {
              const candidateName = `${application.candidateInfo.firstName} ${application.candidateInfo.lastName}`;
              const candidateInitials = `${application.candidateInfo.firstName[0]}${application.candidateInfo.lastName[0]}`;
              
              return (
                <TableRow key={application.id} className="hover:bg-gray-50">
                  <TableCell>
                    <Checkbox
                      checked={selectedApplications.includes(application.id)}
                      onCheckedChange={() => onSelectApplication(application.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${candidateName}`} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs">
                          {candidateInitials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-slate-900 truncate">{candidateName}</div>
                        <div className="text-xs text-slate-500 truncate">{application.candidateInfo.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-slate-900">{application.jobTitle}</TableCell>
                  <TableCell>{getStatusBadge(application.status)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className={cn('text-sm font-medium', getScoreColor(application.score))}>
                        {application.score ? `${application.score}/100` : 'N/A'}
                      </span>
                      {getScoreTrend(application.score)}
                      <MLStatusIndicator 
                        status={application.mlProcessing?.status || 'not_started'}
                        className="ml-1"
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    {application.mlProcessing?.confidence ? (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <span className="text-sm text-purple-600 font-medium">
                              {Math.round(application.mlProcessing.confidence * 100)}%
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Model prediction confidence</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ) : (
                      <span className="text-sm text-gray-400">N/A</span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-slate-500">
                    {new Date(application.submittedAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onViewDetails(application.id)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onScheduleInterview(application.id)}>
                          <Calendar className="h-4 w-4 mr-2" />
                          Schedule Interview
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onStatusChange(application.id, 'screening')}>
                          <Star className="h-4 w-4 mr-2" />
                          Move to Screening
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default MLEnhancedApplicationsTable;
