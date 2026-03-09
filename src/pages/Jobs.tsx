import { useState, useEffect, useMemo } from "react";
import {
  Search,
  Plus,
  Filter,
  MoreHorizontal,
  DollarSign,
  MapPin,
  Users,
  Calendar,
  Briefcase,
  Clock,
  Eye,
  Edit,
  Copy,
  Archive,
  Trash2,
  X,
  ChevronDown,
  SlidersHorizontal,
  Download,
  CheckSquare,
  Square,
  AlertCircle,
  Loader2,
  RotateCcw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { shadows } from "@/components/ui/shadow";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

// API and Data Hooks
import { useJobs, useCreateJob, useUpdateJob, useDeleteJob, Job } from '@/hooks/useJobs';
import { jobsApi } from '@/services/api';
import { multiApiClient } from '@/services/multiApiClient';
import PageHeader from '@/components/layout/PageHeader';
import LoadingUI from '@/components/ui/loading';

/**
 * Jobs page component
 * Displays job listings and allows for job management
 */

// Enhanced Job Data Structure - Updated to match API
interface JobLocation {
  type: string;
  city?: string;
  state?: string;
  country: string;
  allowRemote: boolean;
}

interface JobSalary {
  min: number;
  max: number;
  currency: string;
  payFrequency?: string;
}

interface JobPipeline {
  screening: number;
  interview: number;
  assessment: number;
  offer: number;
}

// Job interface imported from useJobs hook

// Note: Fallback mock data is handled in the useJobs hook

// Utility functions - exported for use in other components
export const formatSalary = (salary: JobSalary): string => {
  if (!salary || typeof salary.min !== 'number' || typeof salary.max !== 'number') {
    return "Salary not specified";
  }
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: salary.currency || 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  return `${formatter.format(salary.min)} - ${formatter.format(salary.max)}`;
};

export const formatLocation = (location: JobLocation): string => {
  if (!location) return "Unknown";
  if (location.type === "remote") return "Remote";
  if (location.city && location.state) {
    return `${location.city}, ${location.state}`;
  }
  return location.type ? location.type.charAt(0).toUpperCase() + location.type.slice(1) : "Unknown";
};

export const getRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) return "Today";
  if (diffInDays === 1) return "1 day ago";
  if (diffInDays < 7) return `${diffInDays} days ago`;
  if (diffInDays < 14) return "1 week ago";
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
  return `${Math.floor(diffInDays / 30)} month${Math.floor(diffInDays / 30) > 1 ? 's' : ''} ago`;
};

// Get status badge color based on job status
const getStatusBadge = (status: Job['status']) => {
  switch (status) {
    case 'open':
      return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-0">Open</Badge>;
    case 'draft':
      return <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100 border-0">Draft</Badge>;
    case 'closed':
      return <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-0">Closed</Badge>;
    case 'archived':
      return <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100 border-0">Archived</Badge>;
    default:
      return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-0">{status}</Badge>;
  }
};

// Pipeline Progress Component
const PipelineProgress = ({ pipeline, total }: { pipeline: JobPipeline; total: number }) => {
  const stages = [
    { key: 'screening', label: 'Screening', color: 'bg-indigo-600', bgColor: 'bg-indigo-50', textColor: 'text-indigo-700' },
    { key: 'interview', label: 'Interview', color: 'bg-purple-500', bgColor: 'bg-purple-50', textColor: 'text-purple-700' },
    { key: 'assessment', label: 'Assessment', color: 'bg-indigo-500', bgColor: 'bg-indigo-50', textColor: 'text-indigo-700' },
    { key: 'offer', label: 'Offer', color: 'bg-green-500', bgColor: 'bg-green-50', textColor: 'text-green-700' },
  ] as const;

  const safePipeline = pipeline || { screening: 0, interview: 0, assessment: 0, offer: 0 };
  const totalInPipeline = Object.values(safePipeline).reduce((a, b) => a + b, 0);
  const progressPercentage = total > 0 ? (totalInPipeline / total) * 100 : 0;

  return (
    <div className="space-y-3 bg-gray-50 rounded-lg p-4">
      <div className="flex justify-between text-sm">
        <span className="font-medium text-gray-700">Pipeline Progress</span>
        <span className="font-semibold text-gray-900">{totalInPipeline} of {total} candidates</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <div
          className="h-full bg-indigo-600 transition-all duration-500"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
      <div className="grid grid-cols-4 gap-2 text-xs">
        {stages.map((stage) => (
          <div key={stage.key} className={`text-center p-2 rounded-lg ${stage.bgColor}`}>
            <div className={`w-full h-2 ${stage.color} rounded-full mb-2`} />
            <div className={`font-inter font-bold text-lg ${stage.textColor}`}>{safePipeline[stage.key]}</div>
            <div className={`text-sm font-inter font-medium truncate ${stage.textColor}`}>{stage.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Enhanced Job Card Component
const JobCard = ({
  job,
  isSelected,
  onSelect,
  onUpdate,
  onCreate,
  onDelete,
  onRefetch
}: {
  job: Job;
  isSelected?: boolean;
  onSelect?: (jobId: string) => void;
  onUpdate?: (jobId: string, data: Partial<Job>) => Promise<any>;
  onCreate?: (data: Partial<Job>) => Promise<any>;
  onDelete?: (jobId: string) => Promise<any>;
  onRefetch?: () => void;
}) => {
  const { toast } = useToast();

  const handleAction = async (action: string, jobId?: string) => {
    const targetJobId = jobId || job.id;

    switch (action) {
      case 'view-job':
        // Navigate to job details page
        window.location.href = `/jobs/${targetJobId}`;
        toast.atsBlue({
          title: "Opening Job Details",
          description: `Viewing details for ${job.title}`,
        });
        break;
      case 'edit':
        // Navigate to job edit page
        window.location.href = `/jobs/${targetJobId}/edit`;
        toast.atsBlue({
          title: "Edit Job",
          description: `Opening edit form for ${job.title}`,
        });
        break;
      case 'view-candidates':
        // Navigate to candidates page filtered by this job
        window.location.href = `/candidates?jobId=${targetJobId}`;
        toast.atsBlue({
          title: "View Candidates",
          description: `Showing candidates for ${job.title}`,
        });
        break;
      case 'clone':
        // Create a copy of the job via API
        if (!onCreate) {
          toast.atsBlue({
            title: "Clone Failed",
            description: "Clone functionality not available",
          });
          return;
        }

        try {
          const clonedJobData = {
            title: `${job.title} (Copy)`,
            department: job.department,
            location: job.location,
            employmentType: job.employmentType,
            experienceLevel: job.experienceLevel,
            salary: job.salary,
            description: job.description,
            responsibilities: job.responsibilities,
            requiredQualifications: job.requiredQualifications,
            preferredQualifications: job.preferredQualifications,
            skills: job.skills,
            benefits: job.benefits,
            status: 'draft',
            visibility: job.visibility,
            maxApplicants: job.maxApplicants,
            source: 'internal'
          };

          await onCreate(clonedJobData);
          onRefetch?.(); // Refresh the job list

          toast.atsBlue({
            title: "Job Cloned Successfully",
            description: `Created a copy of ${job.title}`,
          });
        } catch (error) {
          toast.atsBlue({
            title: "Clone Failed",
            description: `Failed to clone ${job.title}`,
          });
        }
        break;
      case 'close':
        // Update job status to closed via API
        if (!onUpdate) {
          toast.atsBlue({
            title: "Close Failed",
            description: "Update functionality not available",
          });
          return;
        }

        try {
          await onUpdate(targetJobId, { status: 'closed' });
          onRefetch?.(); // Refresh the job list

          toast.atsBlue({
            title: "Job Closed",
            description: `${job.title} has been closed to new applications`,
          });
        } catch (error) {
          toast.atsBlue({
            title: "Close Failed",
            description: `Failed to close ${job.title}`,
          });
        }
        break;
      case 'archive':
        // Update job status to archived via API
        if (!onUpdate) {
          toast.atsBlue({
            title: "Archive Failed",
            description: "Update functionality not available",
          });
          return;
        }

        try {
          await onUpdate(targetJobId, { status: 'archived' });
          onRefetch?.(); // Refresh the job list

          toast.atsBlue({
            title: "Job Archived",
            description: `${job.title} has been archived`,
          });
        } catch (error) {
          toast.atsBlue({
            title: "Archive Failed",
            description: `Failed to archive ${job.title}`,
          });
        }
        break;
      case 'reopen':
        // Update job status from archived to open via API
        if (!onUpdate) {
          toast.atsBlue({
            title: "Reopen Failed",
            description: "Update functionality not available",
          });
          return;
        }

        try {
          await onUpdate(targetJobId, { status: 'open' });
          onRefetch?.(); // Refresh the job list

          toast.atsBlue({
            title: "Job Reopened",
            description: `${job.title} has been reopened and is now accepting applications`,
          });
        } catch (error) {
          toast.atsBlue({
            title: "Reopen Failed",
            description: `Failed to reopen ${job.title}`,
          });
        }
        break;
      case 'delete':
        // Delete job via API with confirmation
        if (!onDelete) {
          toast.atsBlue({
            title: "Delete Failed",
            description: "Delete functionality not available",
          });
          return;
        }

        if (window.confirm(`Are you sure you want to delete "${job.title}"? This action cannot be undone.`)) {
          try {
            await onDelete(targetJobId);
            onRefetch?.(); // Refresh the job list

            toast.atsBlue({
              title: "Job Deleted",
              description: `${job.title} has been permanently deleted`,
            });
          } catch (error) {
            toast.atsBlue({
              title: "Delete Failed",
              description: `Failed to delete ${job.title}`,
            });
          }
        }
        break;
      default:
        console.warn(`Unknown action: ${action}`);
    }
  };

  return (
    <Card className={`${shadows.cardEnhanced} ${isSelected ? 'ring-2 ring-blue-500 border-blue-300' : ''}`}>
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start">
          <div className="flex items-start gap-3 flex-1">
            {onSelect && (
              <Checkbox
                checked={isSelected}
                onCheckedChange={() => onSelect(job.id)}
                className="mt-1 data-[state=checked]:bg-indigo-600"
              />
            )}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <CardTitle className="text-lg font-inter font-semibold text-gray-900">{job.title}</CardTitle>
                {getStatusBadge(job.status)}
                {/* Application Count Badge - Integrated with Status */}
                <Badge
                  variant="outline"
                  className={`text-xs font-inter flex items-center gap-1 ${
                    job.currentApplicants >= 10
                      ? 'bg-indigo-50 text-indigo-700 border-indigo-100'
                      : 'bg-gray-50 text-gray-700 border-gray-200'
                  }`}
                >
                  <Users className="h-3 w-3" />
                  {job.currentApplicants} {job.currentApplicants === 1 ? 'app' : 'apps'}
                </Badge>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Badge variant="outline" className="text-xs font-inter bg-indigo-50 text-indigo-700 border-indigo-100">
                  {job.department}
                </Badge>
                <span className="text-gray-400">•</span>
                <span className="capitalize text-sm text-gray-600 font-inter font-medium">{job.experienceLevel}</span>
                {/* Application Limit Indicator - Contextual Information */}
                {job.maxApplicants && (
                  <>
                    <span className="text-gray-400">•</span>
                    <span className="text-xs text-gray-500 font-inter">
                      {job.maxApplicants - job.currentApplicants} spots left
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-indigo-600 hover:bg-indigo-50">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleAction('edit')}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Job
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAction('view-candidates')}>
                <Eye className="h-4 w-4 mr-2" />
                View Candidates
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAction('clone')}>
                <Copy className="h-4 w-4 mr-2" />
                Clone Job
              </DropdownMenuItem>
              <DropdownMenuSeparator />

              {/* Show different actions based on job status */}
              {job.status === 'archived' ? (
                <DropdownMenuItem onClick={() => handleAction('reopen')} className="text-green-600 focus:text-green-600">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reopen Job
                </DropdownMenuItem>
              ) : (
                <>
                  {job.status !== 'closed' && (
                    <DropdownMenuItem onClick={() => handleAction('close')}>
                      <Archive className="h-4 w-4 mr-2" />
                      Close Job
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={() => handleAction('archive')}>
                    <Archive className="h-4 w-4 mr-2" />
                    Archive Job
                  </DropdownMenuItem>
                </>
              )}

              <DropdownMenuItem
                onClick={() => handleAction('delete')}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Job
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 pt-0">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-50">
              <MapPin className="h-4 w-4 text-indigo-600" />
            </div>
            <span className="text-sm text-gray-600 font-inter">{formatLocation(job.location)}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-50">
              <Clock className="h-4 w-4 text-green-600" />
            </div>
            <span className="capitalize text-sm text-gray-600 font-inter">{job.employmentType}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-50">
              <DollarSign className="h-4 w-4 text-purple-600" />
            </div>
            <span className="text-sm text-gray-600 font-inter">{formatSalary(job.salary)}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-orange-50">
              <Calendar className="h-4 w-4 text-orange-600" />
            </div>
            <span className="text-sm text-gray-600 font-inter">{getRelativeTime(job.postedDate)}</span>
          </div>
        </div>

        {/* Application Progress - Progressive Disclosure */}
        {job.maxApplicants && (job.currentApplicants / job.maxApplicants) >= 0.7 && (
          <div className="space-y-2">
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className={`h-2 rounded-full transition-all duration-500 ${
                  (job.currentApplicants / job.maxApplicants) >= 0.9
                    ? 'bg-red-500'
                    : 'bg-amber-500'
                }`}
                style={{ width: `${Math.min((job.currentApplicants / job.maxApplicants) * 100, 100)}%` }}
              />
            </div>
            <div className="flex items-center justify-center">
              {(job.currentApplicants / job.maxApplicants) >= 0.9 ? (
                <span className="text-xs text-red-600 font-inter font-semibold flex items-center gap-1 bg-red-50 px-2 py-1 rounded-full">
                  <AlertCircle className="h-3 w-3" />
                  Applications full
                </span>
              ) : (
                <span className="text-xs text-orange-600 font-inter font-semibold flex items-center gap-1 bg-orange-50 px-2 py-1 rounded-full">
                  <Clock className="h-3 w-3" />
                  Filling fast
                </span>
              )}
            </div>
          </div>
        )}

        <PipelineProgress pipeline={job.pipeline} total={job.currentApplicants} />

        <div className="flex gap-3 pt-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 border-gray-300 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 transition-all duration-200"
            onClick={() => handleAction('view-job')}
          >
            <Eye className="h-4 w-4 mr-2" />
            View Job
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1 border-gray-300 hover:border-purple-500 hover:bg-purple-50 hover:text-purple-600 transition-all duration-200"
            onClick={() => handleAction('view-candidates')}
          >
            <Users className="h-4 w-4 mr-2" />
            View Candidates
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// ─── Flat job row (screenshot layout) ────────────────────────────────────────
const JobRow = ({ job }: { job: Job }) => {
  const daysOpen = Math.floor((Date.now() - new Date(job.postedDate).getTime()) / (1000 * 60 * 60 * 24));

  const deptColors: Record<string, string> = {
    Engineering:       "bg-indigo-100 text-indigo-700",
    Design:            "bg-pink-100 text-pink-700",
    Product:           "bg-violet-100 text-violet-700",
    Marketing:         "bg-amber-100 text-amber-700",
    Sales:             "bg-emerald-100 text-emerald-700",
    Analytics:         "bg-cyan-100 text-cyan-700",
    "Human Resources": "bg-rose-100 text-rose-700",
    "Customer Success":"bg-teal-100 text-teal-700",
  };
  const deptCls = deptColors[job.department] ?? "bg-gray-100 text-gray-700";

  const statusMap: Record<string, { label: string; cls: string }> = {
    open:     { label: "Active",   cls: "bg-emerald-100 text-emerald-700" },
    paused:   { label: "Paused",   cls: "bg-yellow-100 text-yellow-700" },
    draft:    { label: "Draft",    cls: "bg-gray-100 text-gray-700" },
    closed:   { label: "Closed",   cls: "bg-red-100 text-red-700" },
    archived: { label: "Archived", cls: "bg-orange-100 text-orange-700" },
  };
  const statusInfo = statusMap[job.status] ?? { label: job.status, cls: "bg-gray-100 text-gray-700" };
  const typeLabel = (job.employmentType ?? "full-time").replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase());

  return (
    <div
      onClick={() => { window.location.href = `/jobs/${job.id}`; }}
      className="flex items-start justify-between px-5 py-4 hover:bg-gray-50 cursor-pointer transition-colors"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1.5">
          <p className="text-gray-900" style={{ fontSize: 13, fontWeight: 600 }}>{job.title}</p>
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full font-medium ${deptCls}`} style={{ fontSize: 11 }}>{job.department}</span>
          <span className="inline-flex items-center px-2 py-0.5 rounded-full font-medium bg-gray-100 text-gray-700" style={{ fontSize: 11 }}>{typeLabel}</span>
        </div>
        <div className="flex items-center gap-4 text-gray-500" style={{ fontSize: 12 }}>
          <span className="flex items-center gap-1"><MapPin size={11} />{formatLocation(job.location)}</span>
          <span className="flex items-center gap-1"><Users size={11} />{job.currentApplicants} applicants</span>
          <span className="flex items-center gap-1"><Clock size={11} />{daysOpen}d open</span>
        </div>
      </div>
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full font-medium shrink-0 ml-3 ${statusInfo.cls}`} style={{ fontSize: 11 }}>
        {statusInfo.label}
      </span>
    </div>
  );
};

// Filter interfaces
interface JobFilters {
  status: string[];
  departments: string[];
  locations: string[];
  employmentTypes: string[];
  experienceLevel: string[];
  salaryRange: [number, number];
  postedDateRange: string;
  applicationCount: [number, number];
}

// Enhanced Jobs Component
const Jobs = () => {
  const { toast } = useToast();

  // State management
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showFilterDialog, setShowFilterDialog] = useState(false);
  const [selectedJobs, setSelectedJobs] = useState<string[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);

  // Filter state - Must be declared before useJobs hook
  const [filters, setFilters] = useState<JobFilters>({
    status: [],
    departments: [],
    locations: [],
    employmentTypes: [],
    experienceLevel: [],
    salaryRange: [0, 200000],
    postedDateRange: 'all',
    applicationCount: [0, 100],
  });

  // API Integration - Replace mock data with real data
  const {
    jobs,
    loading,
    error,
    totalPages,
    total,
    refetch
  } = useJobs({
    page: currentPage,
    limit: pageSize,
    search: debouncedSearchQuery,
    status: filters.status.length > 0 ? filters.status.join(',') : undefined,
    department: filters.departments.length > 0 ? filters.departments.join(',') : undefined,
  });



  // Job mutation hooks with refetch callback
  const { createJob, loading: createLoading } = useCreateJob();
  const { updateJob, loading: updateLoading } = useUpdateJob();
  const { deleteJob, loading: deleteLoading } = useDeleteJob();

  // Enhanced mutation functions that trigger refetch
  const handleCreateJob = async (jobData: Partial<Job>) => {
    const result = await createJob(jobData);
    refetch(); // Refresh the job list
    return result;
  };

  const handleUpdateJob = async (id: string, jobData: Partial<Job>) => {
    const result = await updateJob(id, jobData);
    refetch(); // Refresh the job list
    return result;
  };

  const handleDeleteJob = async (id: string) => {
    const result = await deleteJob(id);
    refetch(); // Refresh the job list
    return result;
  };

  // Form state for job creation
  const [newJobForm, setNewJobForm] = useState({
    title: '',
    department: '',
    employmentType: '',
    experienceLevel: '',
    locationType: '',
    location: '',
    minSalary: '',
    maxSalary: '',
    description: '',
    requirements: '',
    preferred: '',
    benefits: '',
    maxApplicants: '',
    visibility: 'public'
  });

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Filter and search logic
  const filteredJobs = useMemo(() => {
    return jobs.filter(job => {
      // Search filter
      const searchMatch = !debouncedSearchQuery ||
        job.title.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        job.department.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        formatLocation(job.location).toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        job.skills.some(skill => skill.toLowerCase().includes(debouncedSearchQuery.toLowerCase()));

      // Status filter
      const statusMatch = filters.status.length === 0 || filters.status.includes(job.status);

      // Department filter
      const departmentMatch = filters.departments.length === 0 || filters.departments.includes(job.department);

      // Location filter
      const locationMatch = filters.locations.length === 0 ||
        filters.locations.includes(formatLocation(job.location)) ||
        (filters.locations.includes('Remote') && job.location.type === 'remote');

      // Employment type filter
      const employmentMatch = filters.employmentTypes.length === 0 || filters.employmentTypes.includes(job.employmentType);

      // Experience level filter
      const experienceMatch = filters.experienceLevel.length === 0 || filters.experienceLevel.includes(job.experienceLevel);

      // Salary range filter - check if job salary overlaps with filter range
      const salaryMatch = job.salary && (
        (job.salary.min <= filters.salaryRange[1] && job.salary.max >= filters.salaryRange[0])
      );

      // Application count filter
      const applicationMatch = job.currentApplicants >= filters.applicationCount[0] &&
        job.currentApplicants <= filters.applicationCount[1];

      return searchMatch && statusMatch && departmentMatch && locationMatch &&
             employmentMatch && experienceMatch && salaryMatch && applicationMatch;
    });
  }, [jobs, debouncedSearchQuery, filters]);

  // Handler functions
  const handleJobSelect = (jobId: string) => {
    setSelectedJobs(prev =>
      prev.includes(jobId)
        ? prev.filter(id => id !== jobId)
        : [...prev, jobId]
    );
  };

  const handleSelectAll = () => {
    if (selectedJobs.length === filteredJobs.length) {
      setSelectedJobs([]);
    } else {
      setSelectedJobs(filteredJobs.map(job => job.id));
    }
  };

  const handleBulkAction = async (action: string) => {
    const selectedJobTitles = jobs
      .filter(job => selectedJobs.includes(job.id))
      .map(job => job.title)
      .join(', ');

    try {
      // Perform the actual bulk operation via API
      switch (action.toLowerCase()) {
        case 'close':
          // Update multiple jobs to closed status
          await Promise.all(
            selectedJobs.map(jobId =>
              updateJob(jobId, { status: 'closed' })
            )
          );
          break;
        case 'archive':
          // Update multiple jobs to archived status
          await Promise.all(
            selectedJobs.map(jobId =>
              updateJob(jobId, { status: 'archived' })
            )
          );
          break;
        case 'reopen':
          // Update multiple jobs from archived to open status
          await Promise.all(
            selectedJobs.map(jobId =>
              updateJob(jobId, { status: 'open' })
            )
          );
          break;
        case 'delete':
          if (window.confirm(`Are you sure you want to delete ${selectedJobs.length} job${selectedJobs.length !== 1 ? 's' : ''}? This action cannot be undone.`)) {
            // Delete multiple jobs
            await Promise.all(
              selectedJobs.map(jobId => deleteJob(jobId))
            );
          } else {
            return; // Don't show success message if cancelled
          }
          break;
        case 'export':
          // Create CSV export (no API call needed)
          const selectedJobsData = jobs.filter(job => selectedJobs.includes(job.id));
          const csvContent = [
            ['Title', 'Department', 'Location', 'Status', 'Applications', 'Posted Date'].join(','),
            ...selectedJobsData.map(job => [
              `"${job.title}"`,
              `"${job.department}"`,
              `"${formatLocation(job.location)}"`,
              `"${job.status}"`,
              job.currentApplicants,
              `"${new Date(job.postedDate).toLocaleDateString()}"`
            ].join(','))
          ].join('\n');

          const blob = new Blob([csvContent], { type: 'text/csv' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `jobs_export_${new Date().toISOString().split('T')[0]}.csv`;
          a.click();
          window.URL.revokeObjectURL(url);
          break;
      }

      // Refetch jobs to update the list (except for export)
      if (action.toLowerCase() !== 'export') {
        refetch();
      }

      toast.atsBlue({
        title: `Bulk ${action} Completed`,
        description: `Applied ${action} to: ${selectedJobTitles}`,
      });

      setSelectedJobs([]);
      setShowBulkActions(false);
    } catch (error) {
      toast.atsBlue({
        title: `Bulk ${action} Failed`,
        description: error instanceof Error ? error.message : `Failed to ${action} selected jobs`,
      });
    }
  };

  const clearFilters = () => {
    setFilters({
      status: [],
      departments: [],
      locations: [],
      employmentTypes: [],
      experienceLevel: [],
      salaryRange: [0, 200000],
      postedDateRange: 'all',
      applicationCount: [0, 100],
    });
  };

  const activeFilterCount = (() => {
    let count = 0;

    // Count array filters (status, departments, locations, etc.)
    if (filters.status.length > 0) count += filters.status.length;
    if (filters.departments.length > 0) count += filters.departments.length;
    if (filters.locations.length > 0) count += filters.locations.length;
    if (filters.employmentTypes.length > 0) count += filters.employmentTypes.length;
    if (filters.experienceLevel.length > 0) count += filters.experienceLevel.length;

    // Count salary range filter (only if not default)
    if (filters.salaryRange[0] !== 0 || filters.salaryRange[1] !== 200000) count += 1;

    // Count application count filter (only if not default)
    if (filters.applicationCount[0] !== 0 || filters.applicationCount[1] !== 100) count += 1;

    // Count posted date range filter (only if not 'all')
    if (filters.postedDateRange !== 'all') count += 1;

    return count;
  })();

  // Stat card computations
  const activeJobs = useMemo(() => jobs.filter(j => j.status === 'open').length, [jobs]);
  const totalApplicants = useMemo(() => jobs.reduce((acc, j) => acc + (j.currentApplicants || 0), 0), [jobs]);
  const avgTimeOpen = useMemo(() => {
    if (jobs.length === 0) return 0;
    const totalDays = jobs.reduce((acc, j) => {
      const days = Math.floor((Date.now() - new Date(j.postedDate).getTime()) / (1000 * 60 * 60 * 24));
      return acc + Math.max(0, days);
    }, 0);
    return Math.round(totalDays / jobs.length);
  }, [jobs]);

  // Show bulk actions when jobs are selected
  useEffect(() => {
    setShowBulkActions(selectedJobs.length > 0);
  }, [selectedJobs]);

  // Handle job creation from dialog
  const handleCreateJobFromDialog = async () => {
    // Validate required fields
    if (!newJobForm.title || !newJobForm.department || !newJobForm.employmentType ||
        !newJobForm.experienceLevel || !newJobForm.minSalary || !newJobForm.maxSalary ||
        !newJobForm.description || !newJobForm.requirements) {
      toast.atsBlue({
        title: "Validation Error",
        description: "Please fill in all required fields",
      });
      return;
    }

    try {
      // Create new job object for API
      const jobData = {
        title: newJobForm.title,
        department: newJobForm.department,
        location: {
          type: newJobForm.locationType as "remote" | "onsite" | "hybrid",
          city: newJobForm.locationType !== 'remote' ? newJobForm.location.split(',')[0]?.trim() : undefined,
          state: newJobForm.locationType !== 'remote' ? newJobForm.location.split(',')[1]?.trim() : undefined,
          country: "US",
          allowRemote: newJobForm.locationType === 'remote' || newJobForm.locationType === 'hybrid'
        },
        employmentType: newJobForm.employmentType,
        experienceLevel: newJobForm.experienceLevel,
        salary: {
          min: parseInt(newJobForm.minSalary),
          max: parseInt(newJobForm.maxSalary),
          currency: "USD",
          payFrequency: "annual"
        },
        description: newJobForm.description,
        responsibilities: newJobForm.description.split('\n').filter(line => line.trim()),
        requiredQualifications: newJobForm.requirements.split('\n').filter(line => line.trim()),
        preferredQualifications: newJobForm.preferred ? newJobForm.preferred.split('\n').filter(line => line.trim()) : [],
        skills: [], // Could be extracted from description/requirements using AI API
        benefits: newJobForm.benefits || '',
        status: "draft",
        visibility: newJobForm.visibility,
        maxApplicants: newJobForm.maxApplicants ? parseInt(newJobForm.maxApplicants) : undefined,
        source: "internal"
      };

      // Create job via API
      const createdJob = await handleCreateJob(jobData);

      // Reset form
      setNewJobForm({
        title: '',
        department: '',
        employmentType: '',
        experienceLevel: '',
        locationType: '',
        location: '',
        minSalary: '',
        maxSalary: '',
        description: '',
        requirements: '',
        preferred: '',
        benefits: '',
        maxApplicants: '',
        visibility: 'public'
      });

      // Close dialog and show success
      setShowCreateDialog(false);

      // Jobs list will be automatically updated by handleCreateJob

      toast.atsBlue({
        title: "Job Created Successfully",
        description: `${createdJob.title} has been created as a draft`,
      });
    } catch (error) {
      toast.atsBlue({
        title: "Error Creating Job",
        description: error instanceof Error ? error.message : "Failed to create job",
      });
    }
  };

  return (
    <div className="p-6 space-y-4">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
            <Briefcase size={16} className="text-amber-600" />
          </div>
          <div>
            <h1 className="text-gray-900" style={{ fontSize: 20, fontWeight: 600 }}>Job Management</h1>
            <p className="text-gray-500 mt-0.5" style={{ fontSize: 13 }}>
              Create and manage all open positions and job requisitions
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowCreateDialog(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg transition-all"
        >
          <Plus size={15} />
          <span style={{ fontSize: 13, fontWeight: 500 }}>New Job Posting</span>
        </button>
      </div>

      {/* ── Inline stats bar ── */}
      <div className="bg-white rounded-xl border border-gray-100">
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-gray-100">
          {[
            { label: "Total Openings",   desc: "across all departments",          value: loading ? "…" : (total?.toString() ?? filteredJobs.length.toString()) },
            { label: "Active Jobs",      desc: "currently accepting applications", value: loading ? "…" : activeJobs.toString() },
            { label: "Total Applicants", desc: "this quarter",                     value: loading ? "…" : totalApplicants.toString() },
            { label: "Avg. Time Open",   desc: "to fill a position",               value: loading ? "…" : `${avgTimeOpen} days` },
          ].map(({ label, desc, value }) => (
            <div key={label} className="px-6 py-5">
              <p className="text-gray-900" style={{ fontSize: 28, fontWeight: 700, lineHeight: 1.1 }}>{value}</p>
              <p className="text-gray-500 mt-1" style={{ fontSize: 12, fontWeight: 500 }}>{label}</p>
              <p className="text-gray-400 mt-0.5" style={{ fontSize: 11 }}>{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Search bar ── */}
      <div className="flex items-center gap-3">
        <div className="flex-1 relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            placeholder="Search jobs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 bg-white text-foreground placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300"
            style={{ fontSize: 13 }}
          />
        </div>
        <span className="text-gray-500 shrink-0" style={{ fontSize: 13 }}>
          {filteredJobs.length} job{filteredJobs.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* ── Loading ── */}
      {loading && <LoadingUI message="Loading jobs..." />}

      {/* ── Error banner ── */}
      {error && !loading && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 flex items-center gap-3">
          <span className="text-amber-700 flex-1" style={{ fontSize: 13 }}>
            {error.includes('Backend') ? 'Demo mode — backend not available.' : `Error: ${error}`}
          </span>
          <button onClick={refetch} className="text-amber-700 underline shrink-0" style={{ fontSize: 12 }}>Retry</button>
        </div>
      )}

      {/* ── 2-column job rows ── */}
      {!loading && filteredJobs.length > 0 && (
        <div className="grid grid-cols-2 gap-4">
          {filteredJobs.map((job) => (
            <div key={job.id} className="bg-white rounded-xl border border-gray-100 hover:shadow-md transition-all">
              <JobRow job={job} />
            </div>
          ))}
        </div>
      )}

      {/* ── Empty state ── */}
      {!loading && filteredJobs.length === 0 && (
        <div className="py-12 text-center">
          <Briefcase size={32} className="mx-auto mb-3 text-gray-300" />
          <p className="text-gray-500" style={{ fontSize: 14 }}>
            {searchQuery || activeFilterCount > 0 ? "No jobs match your current filters." : "No job postings yet."}
          </p>
        </div>
      )}

      {/* Enhanced Job Creation Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-indigo-600" />
              Create New Job
            </DialogTitle>
            <DialogDescription>
              Fill in the details below to create a new job posting
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="job-title">Job Title *</Label>
                  <Input
                    id="job-title"
                    placeholder="e.g. Senior Frontend Developer"
                    value={newJobForm.title}
                    onChange={(e) => setNewJobForm(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Department *</Label>
                  <Select value={newJobForm.department} onValueChange={(value) => setNewJobForm(prev => ({ ...prev, department: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="engineering">Engineering</SelectItem>
                      <SelectItem value="design">Design</SelectItem>
                      <SelectItem value="product">Product</SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                      <SelectItem value="sales">Sales</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="employment-type">Employment Type *</Label>
                  <Select value={newJobForm.employmentType} onValueChange={(value) => setNewJobForm(prev => ({ ...prev, employmentType: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full-time">Full-time</SelectItem>
                      <SelectItem value="part-time">Part-time</SelectItem>
                      <SelectItem value="contract">Contract</SelectItem>
                      <SelectItem value="internship">Internship</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="experience-level">Experience Level *</Label>
                  <Select value={newJobForm.experienceLevel} onValueChange={(value) => setNewJobForm(prev => ({ ...prev, experienceLevel: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="entry">Entry Level</SelectItem>
                      <SelectItem value="mid">Mid Level</SelectItem>
                      <SelectItem value="senior">Senior Level</SelectItem>
                      <SelectItem value="executive">Executive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <Separator />

            {/* Location & Compensation */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Location & Compensation</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location-type">Location Type *</Label>
                  <Select value={newJobForm.locationType} onValueChange={(value) => setNewJobForm(prev => ({ ...prev, locationType: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select location type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="remote">Remote</SelectItem>
                      <SelectItem value="onsite">On-site</SelectItem>
                      <SelectItem value="hybrid">Hybrid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">City, State</Label>
                  <Input
                    id="location"
                    placeholder="e.g. San Francisco, CA"
                    value={newJobForm.location}
                    onChange={(e) => setNewJobForm(prev => ({ ...prev, location: e.target.value }))}
                    disabled={newJobForm.locationType === 'remote'}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="min-salary">Minimum Salary ($) *</Label>
                  <Input
                    id="min-salary"
                    type="number"
                    placeholder="80000"
                    value={newJobForm.minSalary}
                    onChange={(e) => setNewJobForm(prev => ({ ...prev, minSalary: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max-salary">Maximum Salary ($) *</Label>
                  <Input
                    id="max-salary"
                    type="number"
                    placeholder="120000"
                    value={newJobForm.maxSalary}
                    onChange={(e) => setNewJobForm(prev => ({ ...prev, maxSalary: e.target.value }))}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Job Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Job Details</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="description">Job Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe the role, responsibilities, and what makes this position exciting..."
                    rows={4}
                    value={newJobForm.description}
                    onChange={(e) => setNewJobForm(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="requirements">Required Qualifications *</Label>
                  <Textarea
                    id="requirements"
                    placeholder="List the must-have qualifications, skills, and experience..."
                    rows={3}
                    value={newJobForm.requirements}
                    onChange={(e) => setNewJobForm(prev => ({ ...prev, requirements: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="preferred">Preferred Qualifications</Label>
                  <Textarea
                    id="preferred"
                    placeholder="List nice-to-have qualifications and skills..."
                    rows={3}
                    value={newJobForm.preferred}
                    onChange={(e) => setNewJobForm(prev => ({ ...prev, preferred: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="benefits">Benefits & Perks</Label>
                  <Textarea
                    id="benefits"
                    placeholder="Describe the benefits, perks, and what makes your company great..."
                    rows={3}
                    value={newJobForm.benefits}
                    onChange={(e) => setNewJobForm(prev => ({ ...prev, benefits: e.target.value }))}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Posting Settings */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Posting Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="max-applicants">Maximum Applicants</Label>
                  <Input
                    id="max-applicants"
                    type="number"
                    placeholder="50"
                    value={newJobForm.maxApplicants}
                    onChange={(e) => setNewJobForm(prev => ({ ...prev, maxApplicants: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="visibility">Job Visibility</Label>
                  <Select value={newJobForm.visibility} onValueChange={(value) => setNewJobForm(prev => ({ ...prev, visibility: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select visibility" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="internal">Internal Only</SelectItem>
                      <SelectItem value="private">Private</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button
              className="bg-indigo-600 hover:bg-indigo-700"
              onClick={handleCreateJobFromDialog}
              disabled={createLoading}
            >
              {createLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Job'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Advanced Filter Dialog */}
      <Dialog open={showFilterDialog} onOpenChange={setShowFilterDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <SlidersHorizontal className="h-5 w-5 text-indigo-600" />
              Advanced Filters
            </DialogTitle>
            <DialogDescription>
              Refine your job search with advanced filtering options
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Status Filter */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Job Status</Label>
              <div className="flex flex-wrap gap-2">
                {['open', 'closed', 'draft', 'archived'].map((status) => (
                  <div key={status} className="flex items-center space-x-2">
                    <Checkbox
                      id={`status-${status}`}
                      checked={filters.status.includes(status as Job['status'])}
                      onCheckedChange={(checked) => {
                        setFilters(prev => ({
                          ...prev,
                          status: checked
                            ? [...prev.status, status as Job['status']]
                            : prev.status.filter(s => s !== status)
                        }));
                      }}
                    />
                    <Label htmlFor={`status-${status}`} className="capitalize text-sm">
                      {status}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Employment Type Filter */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Employment Type</Label>
              <div className="flex flex-wrap gap-2">
                {['full-time', 'part-time', 'contract', 'internship'].map((type) => (
                  <div key={type} className="flex items-center space-x-2">
                    <Checkbox
                      id={`type-${type}`}
                      checked={filters.employmentTypes.includes(type as Job['employmentType'])}
                      onCheckedChange={(checked) => {
                        setFilters(prev => ({
                          ...prev,
                          employmentTypes: checked
                            ? [...prev.employmentTypes, type as Job['employmentType']]
                            : prev.employmentTypes.filter(t => t !== type)
                        }));
                      }}
                    />
                    <Label htmlFor={`type-${type}`} className="capitalize text-sm">
                      {type.replace('-', ' ')}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Experience Level Filter */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Experience Level</Label>
              <div className="flex flex-wrap gap-2">
                {['entry', 'mid', 'senior', 'executive'].map((level) => (
                  <div key={level} className="flex items-center space-x-2">
                    <Checkbox
                      id={`level-${level}`}
                      checked={filters.experienceLevel.includes(level as Job['experienceLevel'])}
                      onCheckedChange={(checked) => {
                        setFilters(prev => ({
                          ...prev,
                          experienceLevel: checked
                            ? [...prev.experienceLevel, level as Job['experienceLevel']]
                            : prev.experienceLevel.filter(l => l !== level)
                        }));
                      }}
                    />
                    <Label htmlFor={`level-${level}`} className="capitalize text-sm">
                      {level} Level
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Salary Range Filter */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">
                Salary Range: ${filters.salaryRange[0].toLocaleString()} - ${filters.salaryRange[1].toLocaleString()}
              </Label>
              <Slider
                value={filters.salaryRange}
                onValueChange={(value) => setFilters(prev => ({ ...prev, salaryRange: value as [number, number] }))}
                max={300000}
                min={0}
                step={5000}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>$0</span>
                <span>$300,000+</span>
              </div>
            </div>

            <Separator />

            {/* Application Count Filter */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">
                Application Count: {filters.applicationCount[0]} - {filters.applicationCount[1]}
              </Label>
              <Slider
                value={filters.applicationCount}
                onValueChange={(value) => setFilters(prev => ({ ...prev, applicationCount: value as [number, number] }))}
                max={100}
                min={0}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>0 applications</span>
                <span>100+ applications</span>
              </div>
            </div>

            <Separator />

            {/* Posted Date Range */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Posted Date</Label>
              <Select
                value={filters.postedDateRange}
                onValueChange={(value) => setFilters(prev => ({ ...prev, postedDateRange: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This week</SelectItem>
                  <SelectItem value="month">This month</SelectItem>
                  <SelectItem value="quarter">This quarter</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={clearFilters}>
              Clear All Filters
            </Button>
            <Button variant="outline" onClick={() => setShowFilterDialog(false)}>
              Cancel
            </Button>
            <Button
              className="bg-indigo-600 hover:bg-indigo-700"
              onClick={() => {
                setShowFilterDialog(false);
                toast.atsBlue({
                  title: "Filters Applied",
                  description: `Applied ${activeFilterCount} filter${activeFilterCount !== 1 ? 's' : ''}`,
                });
              }}
            >
              Apply Filters
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Jobs;
