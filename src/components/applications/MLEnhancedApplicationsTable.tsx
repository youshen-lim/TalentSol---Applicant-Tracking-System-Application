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
  TrendingDown,
  CheckCircle,
  AlertCircle,
  Clock
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

  // Enhanced ML Score Component with Comprehensive Tooltips
  const MLScoreWithTooltip = ({ application }: { application: ApplicationWithML }) => {
    const score = application.score || 0;
    const mlProcessing = application.mlProcessing;
    const confidence = mlProcessing?.confidence || 0;

    const getScoreColor = (score: number) => {
      if (score >= 80) return 'text-green-600';
      if (score >= 70) return 'text-blue-600';
      if (score >= 60) return 'text-yellow-600';
      return 'text-red-600';
    };

    const getConfidenceIcon = (confidence: number) => {
      if (confidence >= 0.9) return <CheckCircle className="h-3 w-3 text-green-500" />;
      if (confidence >= 0.7) return <AlertCircle className="h-3 w-3 text-yellow-500" />;
      return <Clock className="h-3 w-3 text-red-500" />;
    };

    const getRecommendationColor = (score: number) => {
      if (score >= 80) return 'text-green-600 bg-green-50 border-green-200';
      if (score >= 70) return 'text-blue-600 bg-blue-50 border-blue-200';
      if (score >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      return 'text-red-600 bg-red-50 border-red-200';
    };

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-2 cursor-help hover:bg-blue-50 rounded-md px-2 py-1 transition-colors">
              <Brain className="h-4 w-4 text-blue-600" />
              <span className={cn('text-sm font-medium', getScoreColor(score))}>
                {score > 0 ? `${score}/100` : 'N/A'}
              </span>
              {getScoreTrend(score)}
            </div>
          </TooltipTrigger>
          <TooltipContent className="max-w-sm p-0 bg-white border border-slate-200 shadow-lg" side="top">
            <div className="p-4 space-y-4">
              {/* Header */}
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <Brain className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-section-header text-slate-900">Decision Tree Analysis</p>
                  <p className="text-xs text-slate-500">AI-powered candidate evaluation</p>
                </div>
              </div>

              {/* Score and Confidence */}
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center">
                  <div className={cn('text-2xl font-bold', getScoreColor(score))}>
                    {score > 0 ? score : 'N/A'}
                  </div>
                  <div className="text-xs text-slate-500">AI Score</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    {getConfidenceIcon(confidence)}
                    <span className="text-lg font-semibold text-slate-700">
                      {Math.round(confidence * 100)}%
                    </span>
                  </div>
                  <div className="text-xs text-slate-500">Confidence</div>
                </div>
              </div>

              {/* Key Factors */}
              {mlProcessing?.reasoning && mlProcessing.reasoning.length > 0 && (
                <div>
                  <p className="font-medium text-slate-900 text-sm mb-2">Key Factors:</p>
                  <ul className="space-y-1">
                    {mlProcessing.reasoning.slice(0, 3).map((reason, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-slate-600">
                        <span className="text-blue-500 mt-1">•</span>
                        <span>{reason}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Skills Extracted */}
              {mlProcessing?.skillsExtracted && mlProcessing.skillsExtracted.length > 0 && (
                <div>
                  <p className="font-medium text-slate-900 text-sm mb-2">Skills Identified:</p>
                  <div className="flex flex-wrap gap-1">
                    {mlProcessing.skillsExtracted.slice(0, 4).map((skill, idx) => (
                      <Badge key={idx} variant="ats-blue-subtle" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommended Actions */}
              {mlProcessing?.recommendedActions && mlProcessing.recommendedActions.length > 0 && (
                <div className={cn('p-3 rounded-lg border', getRecommendationColor(score))}>
                  <p className="font-medium text-sm mb-1">Recommended Action:</p>
                  <p className="text-xs">
                    {mlProcessing.recommendedActions[0]}
                  </p>
                </div>
              )}

              {/* Processing Info */}
              <div className="pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Model: Decision Tree</span>
                  <span>Processed: {mlProcessing?.processingTime || 0}ms</span>
                </div>
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  // Enhanced ML Confidence Component with Detailed Tooltips
  const MLConfidenceWithTooltip = ({ application }: { application: ApplicationWithML }) => {
    const confidence = application.mlProcessing?.confidence || 0;
    const status = application.mlProcessing?.status || 'not_started';

    const getConfidenceColor = (confidence: number) => {
      if (confidence >= 0.9) return 'text-green-600';
      if (confidence >= 0.7) return 'text-blue-600';
      if (confidence >= 0.5) return 'text-yellow-600';
      return 'text-red-600';
    };

    const getConfidenceLabel = (confidence: number) => {
      if (confidence >= 0.9) return 'Very High';
      if (confidence >= 0.7) return 'High';
      if (confidence >= 0.5) return 'Medium';
      return 'Low';
    };

    if (status === 'not_started' || status === 'processing') {
      return (
        <div className="flex items-center gap-1">
          <MLStatusIndicator status={status} className="text-xs" />
        </div>
      );
    }

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-1 cursor-help hover:bg-purple-50 rounded-md px-2 py-1 transition-colors">
              <Zap className="h-3 w-3 text-purple-600" />
              <span className={cn('text-sm font-medium', getConfidenceColor(confidence))}>
                {Math.round(confidence * 100)}%
              </span>
            </div>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs p-0 bg-white border border-slate-200 shadow-lg" side="top">
            <div className="p-3 space-y-3">
              {/* Header */}
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <Zap className="h-4 w-4 text-purple-600" />
                <div>
                  <p className="font-semibold text-slate-900 text-sm">ML Confidence</p>
                  <p className="text-xs text-slate-500">Model prediction reliability</p>
                </div>
              </div>

              {/* Confidence Details */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Confidence Level:</span>
                  <span className={cn('font-medium text-sm', getConfidenceColor(confidence))}>
                    {getConfidenceLabel(confidence)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Numerical Score:</span>
                  <span className="font-medium text-sm text-slate-900">
                    {Math.round(confidence * 100)}%
                  </span>
                </div>

                {/* Confidence Bar */}
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div
                    className={cn(
                      'h-2 rounded-full transition-all duration-300',
                      confidence >= 0.9 ? 'bg-green-500' :
                      confidence >= 0.7 ? 'bg-blue-500' :
                      confidence >= 0.5 ? 'bg-yellow-500' : 'bg-red-500'
                    )}
                    style={{ width: `${confidence * 100}%` }}
                  />
                </div>
              </div>

              {/* Interpretation */}
              <div className="pt-2 border-t border-slate-100">
                <p className="text-xs text-slate-600">
                  {confidence >= 0.9 ? 'Very reliable prediction - high confidence in recommendation' :
                   confidence >= 0.7 ? 'Reliable prediction - good confidence in recommendation' :
                   confidence >= 0.5 ? 'Moderate prediction - review additional factors' :
                   'Low confidence - manual review recommended'}
                </p>
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
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
                className="h-8 p-0 text-section-header text-slate-700 hover:text-slate-900"
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
                className="h-8 p-0 text-section-header text-slate-700 hover:text-slate-900"
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
                className="h-8 p-0 text-section-header text-slate-700 hover:text-slate-900"
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
                className="h-8 p-0 text-section-header text-slate-700 hover:text-slate-900 flex items-center gap-1"
                onClick={() => handleSort('score')}
              >
                <Brain className="h-4 w-4 text-blue-600" />
                AI Score
                {getSortIcon('score')}
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 p-0 text-section-header text-slate-700 hover:text-slate-900 flex items-center gap-1"
                onClick={() => handleSort('mlConfidence')}
              >
                <Zap className="h-4 w-4 text-purple-600" />
                Confidence
                {getSortIcon('mlConfidence')}
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 p-0 text-section-header text-slate-700 hover:text-slate-900"
                onClick={() => handleSort('submitted')}
              >
                Submitted
                {getSortIcon('submitted')}
              </Button>
            </TableHead>
            <TableHead className="text-right">
              <span className="text-section-header text-slate-700">Actions</span>
            </TableHead>
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
                    <MLScoreWithTooltip application={application} />
                  </TableCell>
                  <TableCell>
                    <MLConfidenceWithTooltip application={application} />
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
