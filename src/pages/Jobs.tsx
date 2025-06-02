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
  AlertCircle
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

/**
 * Jobs page component
 * Displays job listings and allows for job management
 */

// Enhanced Job Data Structure
interface JobLocation {
  type: "remote" | "onsite" | "hybrid";
  city?: string;
  state?: string;
  country?: string;
  allowRemote: boolean;
}

interface JobSalary {
  min: number;
  max: number;
  currency: string;
  payFrequency: "annual" | "monthly" | "hourly";
}

interface JobPipeline {
  screening: number;
  interview: number;
  assessment: number;
  offer: number;
}

interface Job {
  id: string;
  title: string;
  department: string;
  location: JobLocation;
  employmentType: "full-time" | "part-time" | "contract" | "internship";
  experienceLevel: "entry" | "mid" | "senior" | "executive";
  salary: JobSalary;
  description: string;
  responsibilities: string[];
  requiredQualifications: string[];
  preferredQualifications: string[];
  skills: string[];
  benefits: string;
  status: "open" | "closed" | "draft" | "archived";
  visibility: "public" | "internal" | "private";
  postedDate: string;
  applicationDeadline?: string;
  maxApplicants?: number;
  currentApplicants: number;
  pipeline: JobPipeline;
  createdBy: string;
  lastModified: string;
  source: "internal" | "job_board" | "referral";
}

// Mock data for jobs with enhanced details
const mockJobs: Job[] = [
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
  },
  {
    id: "j4",
    title: "DevOps Engineer",
    department: "Engineering",
    location: {
      type: "remote",
      allowRemote: true,
      country: "US"
    },
    employmentType: "full-time",
    experienceLevel: "senior",
    salary: {
      min: 130000,
      max: 160000,
      currency: "USD",
      payFrequency: "annual"
    },
    description: "Build and maintain our cloud infrastructure and deployment pipelines...",
    responsibilities: ["Manage CI/CD pipelines", "Monitor system performance", "Automate deployments"],
    requiredQualifications: ["5+ years DevOps experience", "AWS/Azure expertise"],
    preferredQualifications: ["Kubernetes experience", "Infrastructure as Code"],
    skills: ["AWS", "Docker", "Kubernetes", "Terraform", "Jenkins"],
    benefits: "Remote work, tech stipend, professional development budget",
    status: "open",
    visibility: "public",
    postedDate: "2024-01-15T12:00:00Z",
    currentApplicants: 19,
    pipeline: {
      screening: 7,
      interview: 3,
      assessment: 1,
      offer: 0,
    },
    createdBy: "user_101",
    lastModified: "2024-01-16T09:30:00Z",
    source: "internal"
  },
  {
    id: "j5",
    title: "Sales Representative",
    department: "Sales",
    location: {
      type: "onsite",
      city: "Chicago",
      state: "IL",
      country: "US",
      allowRemote: false
    },
    employmentType: "full-time",
    experienceLevel: "mid",
    salary: {
      min: 65000,
      max: 85000,
      currency: "USD",
      payFrequency: "annual"
    },
    description: "Drive revenue growth by building relationships with enterprise clients...",
    responsibilities: ["Generate new leads", "Manage sales pipeline", "Close deals"],
    requiredQualifications: ["3+ years B2B sales", "CRM experience"],
    preferredQualifications: ["SaaS sales experience", "Enterprise sales"],
    skills: ["Salesforce", "Cold Calling", "Negotiation", "Lead Generation"],
    benefits: "Commission structure, car allowance, sales incentives",
    status: "open",
    visibility: "public",
    postedDate: "2023-12-20T10:00:00Z",
    maxApplicants: 50,
    currentApplicants: 50,
    pipeline: {
      screening: 18,
      interview: 10,
      assessment: 5,
      offer: 2,
    },
    createdBy: "user_202",
    lastModified: "2024-01-10T15:20:00Z",
    source: "job_board"
  },
  {
    id: "j6",
    title: "Marketing Specialist",
    department: "Marketing",
    location: {
      type: "hybrid",
      city: "Austin",
      state: "TX",
      country: "US",
      allowRemote: true
    },
    employmentType: "full-time",
    experienceLevel: "entry",
    salary: {
      min: 70000,
      max: 90000,
      currency: "USD",
      payFrequency: "annual"
    },
    description: "Execute marketing campaigns and analyze performance metrics...",
    responsibilities: ["Create marketing content", "Manage social media", "Analyze campaign performance"],
    requiredQualifications: ["2+ years marketing experience", "Digital marketing knowledge"],
    preferredQualifications: ["Content creation skills", "Analytics experience"],
    skills: ["Google Analytics", "Social Media", "Content Marketing", "SEO"],
    benefits: "Flexible schedule, marketing conference budget, creative freedom",
    status: "open",
    visibility: "public",
    postedDate: "2024-01-18T08:00:00Z",
    maxApplicants: 15,
    currentApplicants: 12,
    pipeline: {
      screening: 4,
      interview: 0,
      assessment: 0,
      offer: 0,
    },
    createdBy: "user_303",
    lastModified: "2024-01-18T08:00:00Z",
    source: "referral"
  },
];

// Utility functions
const formatSalary = (salary: JobSalary): string => {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: salary.currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  return `${formatter.format(salary.min)} - ${formatter.format(salary.max)}`;
};

const formatLocation = (location: JobLocation): string => {
  if (location.type === "remote") return "Remote";
  if (location.city && location.state) {
    return `${location.city}, ${location.state}`;
  }
  return location.type.charAt(0).toUpperCase() + location.type.slice(1);
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

  const totalInPipeline = Object.values(pipeline).reduce((a, b) => a + b, 0);
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
            <div className="font-medium">{pipeline[stage.key]}</div>
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

  const handleAction = (action: string) => {
    switch (action) {
      case 'edit':
        toast.atsBlue({
          title: "Edit Job",
          description: `Opening edit form for ${job.title}`,
        });
        break;
      case 'view-candidates':
        toast.atsBlue({
          title: "View Candidates",
          description: `Showing candidates for ${job.title}`,
        });
        break;
      case 'clone':
        toast.atsBlue({
          title: "Clone Job",
          description: `Creating a copy of ${job.title}`,
        });
        break;
      case 'close':
        toast.atsBlue({
          title: "Close Job",
          description: `${job.title} has been closed`,
        });
        break;
      case 'archive':
        toast.atsBlue({
          title: "Archive Job",
          description: `${job.title} has been archived`,
        });
        break;
      case 'delete':
        toast.atsBlue({
          title: "Delete Job",
          description: `${job.title} has been deleted`,
        });
        break;
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
  status: Job['status'][];
  departments: string[];
  locations: string[];
  employmentTypes: Job['employmentType'][];
  experienceLevel: Job['experienceLevel'][];
  salaryRange: [number, number];
  postedDateRange: string;
  applicationCount: [number, number];
}

// Enhanced Jobs Component
const Jobs = () => {
  const { toast } = useToast();

  // State management
  const [jobs, setJobs] = useState<Job[]>(mockJobs);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showFilterDialog, setShowFilterDialog] = useState(false);
  const [selectedJobs, setSelectedJobs] = useState<string[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);

  // Filter state
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

  const handleBulkAction = (action: string) => {
    const selectedJobTitles = jobs
      .filter(job => selectedJobs.includes(job.id))
      .map(job => job.title)
      .join(', ');

    toast.atsBlue({
      title: `Bulk ${action}`,
      description: `Applied ${action} to: ${selectedJobTitles}`,
    });

    setSelectedJobs([]);
    setShowBulkActions(false);
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

  const activeFilterCount = Object.values(filters).reduce((count, filter) => {
    if (Array.isArray(filter)) return count + filter.length;
    if (filter === 'all') return count;
    return count + 1;
  }, 0) - 2; // Subtract 2 for default salary and application ranges

  // Show bulk actions when jobs are selected
  useEffect(() => {
    setShowBulkActions(selectedJobs.length > 0);
  }, [selectedJobs]);

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

      {/* Job Cards Grid */}
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

      {/* Empty State */}
      {filteredJobs.length === 0 && (
        <Card className="p-12 text-center">
          <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
          <p className="text-gray-500 mb-4">
            {searchQuery || activeFilterCount > 0
              ? "Try adjusting your search or filters"
              : "Get started by creating your first job posting"
            }
          </p>
          {(!searchQuery && activeFilterCount === 0) && (
            <Button onClick={() => setShowCreateDialog(true)} className="bg-ats-blue hover:bg-ats-dark-blue">
              <Plus className="h-4 w-4 mr-2" />
              Create New Job
            </Button>
          )}
        </Card>
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
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Department *</Label>
                  <Select>
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
                  <Select>
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
                  <Select>
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
                  <Select>
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
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="min-salary">Minimum Salary ($) *</Label>
                  <Input
                    id="min-salary"
                    type="number"
                    placeholder="80000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max-salary">Maximum Salary ($) *</Label>
                  <Input
                    id="max-salary"
                    type="number"
                    placeholder="120000"
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
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="requirements">Required Qualifications *</Label>
                  <Textarea
                    id="requirements"
                    placeholder="List the must-have qualifications, skills, and experience..."
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="preferred">Preferred Qualifications</Label>
                  <Textarea
                    id="preferred"
                    placeholder="List nice-to-have qualifications and skills..."
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="benefits">Benefits & Perks</Label>
                  <Textarea
                    id="benefits"
                    placeholder="Describe the benefits, perks, and what makes your company great..."
                    rows={3}
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
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="visibility">Job Visibility</Label>
                  <Select>
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
              onClick={() => {
                toast.atsBlue({
                  title: "Job Created",
                  description: "Your job posting has been created successfully!",
                });
                setShowCreateDialog(false);
              }}
            >
              Create Job
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Jobs;
