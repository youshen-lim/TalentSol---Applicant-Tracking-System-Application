import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { FixedSizeList as List } from 'react-window';
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

interface VirtualizedApplicationsTableProps {
  applications: ApplicationWithML[];
  selectedApplications: string[];
  onSelectApplication: (applicationId: string) => void;
  onSelectAll: (selected: boolean) => void;
  onViewDetails: (applicationId: string) => void;
  onStatusChange: (applicationId: string, newStatus: string) => void;
  onScheduleInterview: (applicationId: string) => void;
  loading?: boolean;
  className?: string;
  height?: number;
}

type SortField = 'name' | 'job' | 'status' | 'score' | 'submitted' | 'mlConfidence';
type SortDirection = 'asc' | 'desc';

const ITEM_HEIGHT = 72; // Height of each row in pixels

export const VirtualizedApplicationsTable: React.FC<VirtualizedApplicationsTableProps> = ({
  applications,
  selectedApplications,
  onSelectApplication,
  onSelectAll,
  onViewDetails,
  onStatusChange,
  onScheduleInterview,
  loading = false,
  className,
  height = 600
}) => {
  const [sortField, setSortField] = useState<SortField>('score');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const listRef = useRef<List>(null);

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
      setSortDirection('desc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="ml-2 h-4 w-4" />;
    }
    return sortDirection === 'asc' ? 
      <ArrowUp className="ml-2 h-4 w-4" /> : 
      <ArrowDown className="ml-2 h-4 w-4" />;
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      applied: { variant: 'outline' as const, label: 'Applied' },
      screening: { variant: 'ats-blue' as const, label: 'Screening' },
      interview: { variant: 'ats-purple' as const, label: 'Interview' },
      assessment: { variant: 'ats-yellow' as const, label: 'Assessment' },
      offer: { variant: 'ats-green' as const, label: 'Offer' },
      hired: { variant: 'ats-green' as const, label: 'Hired' },
      rejected: { variant: 'ats-red' as const, label: 'Rejected' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || 
                   { variant: 'outline' as const, label: status };

    return (
      <Badge variant={config.variant} className="text-xs">
        {config.label}
      </Badge>
    );
  };

  // Check if all applications are selected
  const allSelected = applications.length > 0 && selectedApplications.length === applications.length;
  const someSelected = selectedApplications.length > 0 && selectedApplications.length < applications.length;

  // Row renderer for virtual scrolling
  const Row = useCallback(({ index, style }: { index: number; style: React.CSSProperties }) => {
    const application = sortedApplications[index];
    const candidateName = `${application.candidateInfo.firstName} ${application.candidateInfo.lastName}`;
    const candidateInitials = `${application.candidateInfo.firstName[0]}${application.candidateInfo.lastName[0]}`;

    return (
      <div style={style} className="flex items-center border-b border-slate-200 hover:bg-slate-50 px-4">
        <div className="w-12 flex justify-center">
          <Checkbox
            checked={selectedApplications.includes(application.id)}
            onCheckedChange={() => onSelectApplication(application.id)}
          />
        </div>
        
        <div className="flex-1 flex items-center gap-3 min-w-0 py-3">
          <Avatar className="h-8 w-8 flex-shrink-0">
            <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${candidateName}`} />
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs">
              {candidateInitials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-medium text-slate-900 truncate">{candidateName}</div>
            <div className="text-xs text-slate-500 truncate">{application.candidateInfo.email}</div>
          </div>
        </div>

        <div className="w-32 text-sm text-slate-900 truncate">{application.jobTitle}</div>
        
        <div className="w-24 flex justify-center">{getStatusBadge(application.status)}</div>
        
        <div className="w-20 flex justify-center">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <div className="flex items-center gap-1">
                  <Brain className="h-3 w-3 text-blue-600" />
                  <span className="text-sm font-medium text-blue-600">
                    {application.score || 0}
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>AI Score: {application.score || 0}/100</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <div className="w-20 flex justify-center">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <div className="flex items-center gap-1">
                  <Zap className="h-3 w-3 text-purple-600" />
                  <span className="text-sm font-medium text-purple-600">
                    {Math.round((application.mlProcessing?.confidence || 0) * 100)}%
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>ML Confidence: {Math.round((application.mlProcessing?.confidence || 0) * 100)}%</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <div className="w-24 text-sm text-slate-500">
          {new Date(application.submittedAt).toLocaleDateString()}
        </div>

        <div className="w-16 flex justify-end">
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
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    );
  }, [sortedApplications, selectedApplications, onSelectApplication, onViewDetails, onScheduleInterview]);

  if (loading) {
    return (
      <div className={cn("rounded-md border", className)}>
        <div className="text-center py-8 text-gray-500">
          Loading applications...
        </div>
      </div>
    );
  }

  return (
    <div className={cn("rounded-md border", className)}>
      {/* Table Header */}
      <div className="flex items-center border-b border-slate-200 bg-slate-50 px-4 py-3">
        <div className="w-12 flex justify-center">
          <Checkbox
            checked={allSelected}
            indeterminate={someSelected}
            onCheckedChange={onSelectAll}
          />
        </div>
        
        <div className="flex-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 p-0 text-section-header text-slate-700 hover:text-slate-900"
            onClick={() => handleSort('name')}
          >
            Candidate
            {getSortIcon('name')}
          </Button>
        </div>

        <div className="w-32">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 p-0 text-section-header text-slate-700 hover:text-slate-900"
            onClick={() => handleSort('job')}
          >
            Position
            {getSortIcon('job')}
          </Button>
        </div>

        <div className="w-24 text-center">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 p-0 text-section-header text-slate-700 hover:text-slate-900"
            onClick={() => handleSort('status')}
          >
            Status
            {getSortIcon('status')}
          </Button>
        </div>

        <div className="w-20 text-center">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 p-0 text-section-header text-slate-700 hover:text-slate-900"
            onClick={() => handleSort('score')}
          >
            AI Score
            {getSortIcon('score')}
          </Button>
        </div>

        <div className="w-20 text-center">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 p-0 text-section-header text-slate-700 hover:text-slate-900"
            onClick={() => handleSort('mlConfidence')}
          >
            Confidence
            {getSortIcon('mlConfidence')}
          </Button>
        </div>

        <div className="w-24 text-center">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 p-0 text-section-header text-slate-700 hover:text-slate-900"
            onClick={() => handleSort('submitted')}
          >
            Submitted
            {getSortIcon('submitted')}
          </Button>
        </div>

        <div className="w-16 text-center">
          <span className="text-section-header text-slate-700">Actions</span>
        </div>
      </div>

      {/* Virtual Scrolling List */}
      {sortedApplications.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No applications found
        </div>
      ) : (
        <List
          ref={listRef}
          height={height}
          itemCount={sortedApplications.length}
          itemSize={ITEM_HEIGHT}
          width="100%"
        >
          {Row}
        </List>
      )}
    </div>
  );
};
