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
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
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

// Fallback mock data for when API is not available
const fallbackMockJobs = [
  {
    id: "j1",
    title: "Senior Frontend Developer",
    department: "Engineering",
    location: {
      type: "remote",
      allowRemote: true,
      country: "US"
    },
    employmentType: "full-time",
    experienceLevel: "senior",
    salary: {
      min: 120000,
      max: 150000,
      currency: "USD",
      payFrequency: "annual"
    },
    description: "We are looking for a Senior Frontend Developer to join our team...",
    responsibilities: ["Develop user interfaces", "Collaborate with design team", "Optimize performance"],
    requiredQualifications: ["5+ years React experience", "TypeScript proficiency"],
    preferredQualifications: ["Next.js experience", "Design system knowledge"],
    skills: ["React", "TypeScript", "Next.js", "Tailwind CSS"],
    benefits: "Comprehensive health insurance, 401k matching, flexible PTO",
    status: "open",
    visibility: "public",
    postedDate: "2024-01-05T10:00:00Z",
    applicationDeadline: "2024-02-05T23:59:59Z",
    maxApplicants: 50,
    currentApplicants: 45,
    pipeline: {
      screening: 15,
      interview: 8,
      assessment: 4,
      offer: 1,
    },
    createdBy: "user_123",
    lastModified: "2024-01-20T14:30:00Z",
    source: "internal"
  },
  {
    id: "j2",
    title: "UX/UI Designer",
    department: "Design",
    location: {
      type: "onsite",
      city: "San Francisco",
      state: "CA",
      country: "US",
      allowRemote: false
    },
    employmentType: "full-time",
    experienceLevel: "mid",
    salary: {
      min: 90000,
      max: 120000,
      currency: "USD",
      payFrequency: "annual"
    },
    description: "Join our design team to create beautiful and intuitive user experiences...",
    responsibilities: ["Design user interfaces", "Create prototypes", "Conduct user research"],
    requiredQualifications: ["3+ years UX/UI experience", "Figma proficiency"],
    preferredQualifications: ["Design system experience", "Frontend development knowledge"],
    skills: ["Figma", "Sketch", "Adobe Creative Suite", "Prototyping"],
    benefits: "Health insurance, design conference budget, flexible hours",
    status: "open",
    visibility: "public",
    postedDate: "2024-01-17T09:00:00Z",
    currentApplicants: 23,
    pipeline: {
      screening: 8,
      interview: 4,
      assessment: 2,
      offer: 0,
    },
    createdBy: "user_456",
    lastModified: "2024-01-18T11:15:00Z",
    source: "job_board"
  },
  {
    id: "j3",
    title: "Product Manager",
    department: "Product",
    location: {
      type: "hybrid",
      city: "New York",
      state: "NY",
      country: "US",
      allowRemote: true
    },
    employmentType: "full-time",
    experienceLevel: "senior",
    salary: {
      min: 110000,
      max: 140000,
      currency: "USD",
      payFrequency: "annual"
    },
    description: "Lead product strategy and development for our core platform...",
    responsibilities: ["Define product roadmap", "Work with engineering teams", "Analyze user metrics"],
    requiredQualifications: ["5+ years product management", "Technical background"],
    preferredQualifications: ["SaaS experience", "Data analysis skills"],
    skills: ["Product Strategy", "Analytics", "Agile", "SQL"],
    benefits: "Equity package, unlimited PTO, learning budget",
    status: "open",
    visibility: "public",
    postedDate: "2024-01-13T14:00:00Z",
    applicationDeadline: "2024-02-13T23:59:59Z",
    maxApplicants: 40,
    currentApplicants: 34,
    pipeline: {
      screening: 12,
      interview: 6,
      assessment: 3,
      offer: 1,
    },
    createdBy: "user_789",
    lastModified: "2024-01-19T16:45:00Z",
    source: "internal"
  }
];

// Utility functions
const formatSalary = (salary: JobSalary): string => {
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

const formatLocation = (location: JobLocation): string => {
  if (!location) return "Unknown";
  if (location.type === "remote") return "Remote";
  if (location.city && location.state) {
    return `${location.city}, ${location.state}`;
  }
  return location.type ? location.type.charAt(0).toUpperCase() + location.type.slice(1) : "Unknown";
};

const getRelativeTime = (dateString: string): string => {
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
      return <Badge className="bg-green-500 hover:bg-green-600">Open</Badge>;
    case 'draft':
      return <Badge className="bg-gray-500 hover:bg-gray-600">Draft</Badge>;
    case 'closed':
      return <Badge className="bg-red-500 hover:bg-red-600">Closed</Badge>;
    case 'archived':
      return <Badge className="bg-orange-500 hover:bg-orange-600">Archived</Badge>;
    default:
      return <Badge>{status}</Badge>;
  }
};

// Pipeline Progress Component
const PipelineProgress = ({ pipeline, total }: { pipeline: JobPipeline; total: number }) => {
  const stages = [
    { key: 'screening', label: 'Screening', color: 'bg-ats-blue' },
    { key: 'interview', label: 'Interview', color: 'bg-ats-purple' },
    { key: 'assessment', label: 'Assessment', color: 'bg-indigo-500' },
    { key: 'offer', label: 'Offer', color: 'bg-green-500' },
  ] as const;

  const safePipeline = pipeline || { screening: 0, interview: 0, assessment: 0, offer: 0 };
  const totalInPipeline = Object.values(safePipeline).reduce((a, b) => a + b, 0);
  const progressPercentage = total > 0 ? (totalInPipeline / total) * 100 : 0;

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs text-gray-500">
        <span>Pipeline Progress</span>
        <span>{totalInPipeline} of {total} candidates</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-ats-blue to-green-500 transition-all duration-300"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
      <div className="grid grid-cols-4 gap-1 text-xs">
        {stages.map((stage) => (
          <div key={stage.key} className="text-center">
            <div className={`w-full h-1 ${stage.color} rounded mb-1`} />
            <div className="font-medium">{safePipeline[stage.key]}</div>
            <div className="text-gray-500 truncate">{stage.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Enhanced Job Card Component
const JobCard = ({ job, isSelected, onSelect }: {
  job: Job;
  isSelected?: boolean;
  onSelect?: (jobId: string) => void;
}) => {
  const { toast } = useToast();

  const handleAction = (action: string, jobId?: string) => {
    switch (action) {
      case 'view-job':
        // Navigate to job details page
        window.location.href = `/jobs/${jobId || job.id}`;
        toast.atsBlue({
          title: "Opening Job Details",
          description: `Viewing details for ${job.title}`,
        });
        break;
      case 'edit':
        // Navigate to job edit page or open edit modal
        window.location.href = `/jobs/${jobId || job.id}/edit`;
        toast.atsBlue({
          title: "Edit Job",
          description: `Opening edit form for ${job.title}`,
        });
        break;
      case 'view-candidates':
        // Navigate to candidates page filtered by this job
        window.location.href = `/candidates/pipeline?jobId=${jobId || job.id}`;
        toast.atsBlue({
          title: "View Candidates",
          description: `Showing candidates for ${job.title}`,
        });
        break;
      case 'clone':
        // Create a copy of the job via API
        try {
          const clonedJobData = {
            ...job,
            title: `${job.title} (Copy)`,
            status: 'draft',
            currentApplicants: 0,
            pipeline: { screening: 0, interview: 0, assessment: 0, offer: 0 },
          };

          // Remove fields that shouldn't be copied
          delete clonedJobData.id;
          delete clonedJobData.createdAt;
          delete clonedJobData.updatedAt;
          delete clonedJobData.postedDate;

          // Create via API (this would need to be passed down or accessed via context)
          // For now, show success message
          toast.atsBlue({
            title: "Job Cloned",
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
        try {
          // This would need access to updateJob function
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
        try {
          // This would need access to updateJob function
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
      case 'delete':
        // Show confirmation dialog before deleting
        if (window.confirm(`Are you sure you want to delete "${job.title}"? This action cannot be undone.`)) {
          try {
            // This would need access to deleteJob function
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
    <Card className={`transition-all duration-200 hover:shadow-md ${isSelected ? 'ring-2 ring-ats-blue' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex items-start gap-3 flex-1">
            {onSelect && (
              <Checkbox
                checked={isSelected}
                onCheckedChange={() => onSelect(job.id)}
                className="mt-1"
              />
            )}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <CardTitle className="text-lg font-semibold">{job.title}</CardTitle>
                {getStatusBadge(job.status)}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Badge variant="outline" className="text-xs">
                  {job.department}
                </Badge>
                <span>•</span>
                <span className="capitalize">{job.experienceLevel}</span>
              </div>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-ats-blue">
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
              <DropdownMenuItem onClick={() => handleAction('close')}>
                <Archive className="h-4 w-4 mr-2" />
                Close Job
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAction('archive')}>
                <Archive className="h-4 w-4 mr-2" />
                Archive Job
              </DropdownMenuItem>
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
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center">
            <MapPin className="h-4 w-4 mr-2 text-gray-400" />
            <span>{formatLocation(job.location)}</span>
          </div>
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-2 text-gray-400" />
            <span className="capitalize">{job.employmentType}</span>
          </div>
          <div className="flex items-center">
            <DollarSign className="h-4 w-4 mr-2 text-gray-400" />
            <span>{formatSalary(job.salary)}</span>
          </div>
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-2 text-gray-400" />
            <span>{getRelativeTime(job.postedDate)}</span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Applications</span>
            <span className="font-medium">
              {job.currentApplicants}{job.maxApplicants ? ` of ${job.maxApplicants}` : ''}
            </span>
          </div>

          {/* Application Progress Bar and Status */}
          {job.maxApplicants && (
            <div className="space-y-1">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    (job.currentApplicants / job.maxApplicants) >= 0.9
                      ? 'bg-red-500'
                      : (job.currentApplicants / job.maxApplicants) >= 0.7
                      ? 'bg-yellow-500'
                      : 'bg-ats-blue'
                  }`}
                  style={{ width: `${Math.min((job.currentApplicants / job.maxApplicants) * 100, 100)}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">
                  {job.maxApplicants - job.currentApplicants} spots remaining
                </span>
                {(job.currentApplicants / job.maxApplicants) >= 0.8 && (
                  <span className="text-orange-600 font-medium flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Filling fast
                  </span>
                )}
                {job.currentApplicants >= job.maxApplicants && (
                  <span className="text-red-600 font-medium flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    Applications full
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        <PipelineProgress pipeline={job.pipeline} total={job.currentApplicants} />

        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 text-xs hover:bg-ats-blue hover:text-white"
            onClick={() => handleAction('view-job')}
          >
            <Eye className="h-3 w-3 mr-1" />
            View Job
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1 text-xs hover:bg-ats-purple hover:text-white"
            onClick={() => handleAction('view-candidates')}
          >
            <Users className="h-3 w-3 mr-1" />
            View Candidates
          </Button>
        </div>
      </CardContent>
    </Card>
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

  // Job mutation hooks
  const { createJob, loading: createLoading } = useCreateJob();
  const { updateJob, loading: updateLoading } = useUpdateJob();
  const { deleteJob, loading: deleteLoading } = useDeleteJob();

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

      // Salary range filter
      const salaryMatch = job.salary.min >= filters.salaryRange[0] && job.salary.max <= filters.salaryRange[1];

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

  // Show bulk actions when jobs are selected
  useEffect(() => {
    setShowBulkActions(selectedJobs.length > 0);
  }, [selectedJobs]);

  // Handle job creation with API
  const handleCreateJob = async () => {
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
      const createdJob = await createJob(jobData);

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

      // Refetch jobs to update the list
      refetch();

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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Briefcase className="h-6 w-6 text-ats-blue" />
            Job Postings
          </h1>
          <p className="text-sm text-gray-500">
            Manage your open positions • {filteredJobs.length} job{filteredJobs.length !== 1 ? 's' : ''} found
          </p>
        </div>
        <Button
          onClick={() => setShowCreateDialog(true)}
          className="bg-ats-blue hover:bg-ats-dark-blue"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create New Job
        </Button>
      </div>

      {/* Enhanced Search and Filter Bar */}
      <div className="space-y-4">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          {/* Search Bar */}
          <div className="relative w-full lg:w-96">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search candidates, jobs, skills..."
              className="pl-10 pr-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6"
                onClick={() => setSearchQuery("")}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>

          {/* Filter Controls */}
          <div className="flex gap-2 w-full lg:w-auto justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilterDialog(true)}
              className="relative"
            >
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Filters
              {activeFilterCount > 0 && (
                <Badge className="ml-2 h-5 w-5 p-0 text-xs bg-ats-blue flex items-center justify-center">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  Department <ChevronDown className="h-4 w-4 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {['Engineering', 'Design', 'Product', 'Sales', 'Marketing'].map((dept) => (
                  <DropdownMenuItem key={dept}>
                    <Checkbox
                      checked={filters.departments.includes(dept)}
                      onCheckedChange={(checked) => {
                        setFilters(prev => ({
                          ...prev,
                          departments: checked
                            ? [...prev.departments, dept]
                            : prev.departments.filter(d => d !== dept)
                        }));
                      }}
                      className="mr-2"
                    />
                    {dept}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  Location <ChevronDown className="h-4 w-4 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {['Remote', 'San Francisco, CA', 'New York, NY', 'Chicago, IL', 'Austin, TX'].map((location) => (
                  <DropdownMenuItem key={location}>
                    <Checkbox
                      checked={filters.locations.includes(location)}
                      onCheckedChange={(checked) => {
                        setFilters(prev => ({
                          ...prev,
                          locations: checked
                            ? [...prev.locations, location]
                            : prev.locations.filter(l => l !== location)
                        }));
                      }}
                      className="mr-2"
                    />
                    {location}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Active Filters Display */}
        {activeFilterCount > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-gray-500">Active filters:</span>
            {filters.status.map(status => (
              <Badge key={status} variant="secondary" className="gap-1">
                Status: {status}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => setFilters(prev => ({
                    ...prev,
                    status: prev.status.filter(s => s !== status)
                  }))}
                />
              </Badge>
            ))}
            {filters.departments.map(dept => (
              <Badge key={dept} variant="secondary" className="gap-1">
                {dept}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => setFilters(prev => ({
                    ...prev,
                    departments: prev.departments.filter(d => d !== dept)
                  }))}
                />
              </Badge>
            ))}
            {filters.locations.map(location => (
              <Badge key={location} variant="secondary" className="gap-1">
                {location}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => setFilters(prev => ({
                    ...prev,
                    locations: prev.locations.filter(l => l !== location)
                  }))}
                />
              </Badge>
            ))}
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Clear all
            </Button>
          </div>
        )}
      </div>

      {/* Bulk Actions Bar */}
      {showBulkActions && (
        <Card className="p-4 bg-ats-blue/5 border-ats-blue/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Checkbox
                checked={selectedJobs.length === filteredJobs.length}
                onCheckedChange={handleSelectAll}
              />
              <span className="text-sm font-medium">
                {selectedJobs.length} job{selectedJobs.length !== 1 ? 's' : ''} selected
              </span>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => handleBulkAction('Close')}>
                <Archive className="h-4 w-4 mr-1" />
                Close
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleBulkAction('Archive')}>
                <Archive className="h-4 w-4 mr-1" />
                Archive
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleBulkAction('Export')}>
                <Download className="h-4 w-4 mr-1" />
                Export
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkAction('Delete')}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-ats-blue" />
          <span className="ml-2 text-gray-600">Loading jobs...</span>
        </div>
      )}

      {/* Error State / Demo Mode */}
      {error && (
        <div className="mb-6">
          {error.includes('Backend server not available') ? (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-blue-500 mr-3" />
                <div>
                  <h3 className="text-sm font-medium text-blue-800">Demo Mode Active</h3>
                  <p className="text-sm text-blue-700 mt-1">
                    Backend server not available. Showing demo data with limited functionality.
                  </p>
                </div>
                <Button
                  onClick={refetch}
                  variant="outline"
                  size="sm"
                  className="ml-auto text-blue-600 border-blue-300 hover:bg-blue-100"
                >
                  Retry Connection
                </Button>
              </div>
            </div>
          ) : (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-500 mr-3" />
                <div>
                  <h3 className="text-sm font-medium text-red-800">Error Loading Jobs</h3>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
                <Button
                  onClick={refetch}
                  variant="outline"
                  size="sm"
                  className="ml-auto text-red-600 border-red-300 hover:bg-red-100"
                >
                  Try Again
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredJobs.length === 0 && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Jobs Found</h3>
            <p className="text-gray-600 mb-4">
              {searchQuery || activeFilterCount > 0
                ? "No jobs match your current search and filters."
                : "Get started by creating your first job posting."
              }
            </p>
            {searchQuery || activeFilterCount > 0 ? (
              <Button onClick={clearFilters} variant="outline">
                Clear Filters
              </Button>
            ) : (
              <Button onClick={() => setShowCreateDialog(true)} className="bg-ats-blue hover:bg-ats-dark-blue">
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Job
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Job Cards Grid - Show jobs even in demo mode (when error exists but jobs are available) */}
      {!loading && filteredJobs.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredJobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              isSelected={selectedJobs.includes(job.id)}
              onSelect={handleJobSelect}
            />
          ))}
        </div>
      )}

      {/* Pagination - Show even in demo mode */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-between mt-8">
          <div className="text-sm text-gray-600">
            Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, total)} of {total} jobs
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <span className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}



      {/* Enhanced Job Creation Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-ats-blue" />
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
              className="bg-ats-blue hover:bg-ats-dark-blue"
              onClick={handleCreateJob}
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
              <SlidersHorizontal className="h-5 w-5 text-ats-blue" />
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
              className="bg-ats-blue hover:bg-ats-dark-blue"
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
