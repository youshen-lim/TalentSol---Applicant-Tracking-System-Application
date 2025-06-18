import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { shadows } from "@/components/ui/shadow";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Search,
  Filter,
  Plus,
  Download,
  MoreHorizontal,
  Users,
  Calendar,
  Mail,
  Phone,
  MapPin,
  Star,
  X,
  Clock,
  Zap,
  Briefcase
} from "lucide-react";
import KanbanBoard from "@/components/candidates/KanbanBoard";
import CandidateFilterModal, { FilterOptions } from "@/components/candidates/CandidateFilterModal";
import AddCandidateModal from "@/components/dashboard/AddCandidateModal";
import { Candidate } from "@/components/candidates/CandidateCard";
import { toast } from "sonner";
import { useToast } from "@/components/ui/use-toast";
import PageHeader from "@/components/layout/PageHeader";
import { useCandidatePipeline } from "@/hooks/useCandidates";
import { useJobs } from "@/hooks/useJobs";
import LoadingUI from "@/components/ui/loading";

/**
 * Candidates page component
 * Displays candidates in both kanban board and list views
 * Consolidated from the previous CandidatePipeline page
 * Uses the blue color scheme as per user preference
 */

// Mock data for candidates and stages
const mockCandidates: Candidate[] = [
  {
    id: "c1",
    name: "John Smith",
    email: "john.smith@example.com",
    phone: "+1 (555) 123-4567",
    position: "Frontend Developer",
    stage: "applied",
    tags: ["React", "TypeScript"],
    lastActivity: "Applied 2 days ago",
    rating: 4,
  },
  {
    id: "c2",
    name: "Emma Johnson",
    email: "emma.johnson@example.com",
    phone: "+1 (555) 987-6543",
    position: "UX Designer",
    stage: "interview",
    tags: ["Figma", "UI/UX"],
    lastActivity: "Scheduled interview yesterday",
    rating: 5,
  },
  {
    id: "c3",
    name: "Michael Brown",
    email: "michael.brown@example.com",
    position: "Backend Developer",
    stage: "applied",
    tags: ["Node.js", "MongoDB"],
    lastActivity: "Applied 5 days ago",
    rating: 3,
  },
  {
    id: "c4",
    name: "Sarah Wilson",
    email: "sarah.wilson@example.com",
    position: "Product Manager",
    stage: "assessment",
    tags: ["Agile", "Scrum"],
    lastActivity: "Completed assessment today",
    rating: 4,
  },
  {
    id: "c5",
    name: "David Lee",
    email: "david.lee@example.com",
    phone: "+1 (555) 555-5555",
    position: "DevOps Engineer",
    stage: "screening",
    tags: ["AWS", "Docker"],
    lastActivity: "Scheduled screening call",
    rating: 4,
  },
  {
    id: "c6",
    name: "Lisa Chen",
    email: "lisa.chen@example.com",
    position: "Marketing Specialist",
    stage: "offer",
    tags: ["SEO", "Content"],
    lastActivity: "Sent offer letter today",
    rating: 5,
  },
  {
    id: "c7",
    name: "James Johnson",
    email: "james.johnson@example.com",
    position: "Data Scientist",
    stage: "interview",
    tags: ["Python", "ML"],
    lastActivity: "Interview scheduled for tomorrow",
    rating: 4,
  },
  {
    id: "c8",
    name: "Emily Davis",
    email: "emily.davis@example.com",
    phone: "+1 (555) 222-3333",
    position: "Frontend Developer",
    stage: "rejected",
    tags: ["Vue", "CSS"],
    lastActivity: "Rejected 3 days ago",
    rating: 2,
  },
  {
    id: "c9",
    name: "Robert Miller",
    email: "robert.miller@example.com",
    position: "QA Engineer",
    stage: "applied",
    tags: ["Testing", "Selenium"],
    lastActivity: "Applied 1 day ago",
    rating: 3,
  },
  {
    id: "c10",
    name: "Rachel Green",
    email: "rachel.green@example.com",
    phone: "+1 (555) 456-7890",
    position: "Product Manager",
    stage: "applied",
    tags: ["Product Strategy", "Roadmapping", "Analytics"],
    lastActivity: "Applied 6 days ago",
    rating: 4,
  },
  {
    id: "c11",
    name: "Alex Chen",
    email: "alex.chen@example.com",
    phone: "+1 (555) 567-8901",
    position: "Data Scientist",
    stage: "applied",
    tags: ["Python", "Machine Learning", "TensorFlow"],
    lastActivity: "Applied 1 week ago",
    rating: 5,
  },
  {
    id: "c12",
    name: "Maria Rodriguez",
    email: "maria.rodriguez@example.com",
    phone: "+1 (555) 678-9012",
    position: "UX Designer",
    stage: "applied",
    tags: ["Figma", "User Research", "Prototyping"],
    lastActivity: "Applied 3 days ago",
    rating: 4,
  },
  {
    id: "c13",
    name: "Daniel Thompson",
    email: "daniel.thompson@example.com",
    phone: "+1 (555) 789-0123",
    position: "Frontend Developer",
    stage: "applied",
    tags: ["Vue.js", "JavaScript", "CSS"],
    lastActivity: "Applied 5 days ago",
    rating: 3,
  },
  {
    id: "c14",
    name: "Sophie Turner",
    email: "sophie.turner@example.com",
    phone: "+1 (555) 890-1234",
    position: "Marketing Lead",
    stage: "screening",
    tags: ["Digital Marketing", "Content Strategy", "SEO"],
    lastActivity: "Phone screening completed",
    rating: 4,
  },
  {
    id: "c15",
    name: "James Wilson",
    email: "james.wilson@example.com",
    phone: "+1 (555) 901-2345",
    position: "Backend Developer",
    stage: "assessment",
    tags: ["Java", "Spring Boot", "Microservices"],
    lastActivity: "Technical assessment sent",
    rating: 4,
  },
  {
    id: "c16",
    name: "Amanda White",
    email: "amanda.white@example.com",
    phone: "+1 (555) 012-3456",
    position: "Sales Representative",
    stage: "rejected",
    tags: ["B2B Sales", "CRM", "Salesforce"],
    lastActivity: "Application declined",
    rating: 2,
  },
  {
    id: "c17",
    name: "Kevin Martinez",
    email: "kevin.martinez@example.com",
    phone: "+1 (555) 123-7890",
    position: "Frontend Developer",
    stage: "offer",
    tags: ["React", "Next.js", "TypeScript"],
    lastActivity: "Offer letter sent yesterday",
    rating: 5,
  },
  {
    id: "c18",
    name: "Jennifer Taylor",
    email: "jennifer.taylor@example.com",
    phone: "+1 (555) 234-8901",
    position: "UX Designer",
    stage: "interview",
    tags: ["Figma", "Adobe XD", "User Research"],
    lastActivity: "Final interview scheduled",
    rating: 4,
  },
  {
    id: "c19",
    name: "Christopher Lee",
    email: "christopher.lee@example.com",
    phone: "+1 (555) 345-9012",
    position: "DevOps Engineer",
    stage: "assessment",
    tags: ["Kubernetes", "AWS", "Terraform"],
    lastActivity: "Technical assessment in progress",
    rating: 4,
  },
  {
    id: "c20",
    name: "Michelle Garcia",
    email: "michelle.garcia@example.com",
    phone: "+1 (555) 456-0123",
    position: "Product Manager",
    stage: "screening",
    tags: ["Product Strategy", "Agile", "Analytics"],
    lastActivity: "Phone screening completed",
    rating: 5,
  },
];

const stages = [
  {
    id: "applied",
    name: "Applied",
    candidates: mockCandidates.filter((c) => c.stage === "applied"),
  },
  {
    id: "screening",
    name: "Screening",
    candidates: mockCandidates.filter((c) => c.stage === "screening"),
  },
  {
    id: "interview",
    name: "Interview",
    candidates: mockCandidates.filter((c) => c.stage === "interview"),
  },
  {
    id: "assessment",
    name: "Assessment",
    candidates: mockCandidates.filter((c) => c.stage === "assessment"),
  },
  {
    id: "offer",
    name: "Offer",
    candidates: mockCandidates.filter((c) => c.stage === "offer"),
  },
  {
    id: "rejected",
    name: "Rejected",
    candidates: mockCandidates.filter((c) => c.stage === "rejected"),
  },
];

const Candidates = () => {
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const jobIdFromUrl = searchParams.get('jobId');

  const [viewCandidateId, setViewCandidateId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [selectedJob, setSelectedJob] = useState(jobIdFromUrl || 'all');
  const [viewMode, setViewMode] = useState<'board' | 'list'>('board');
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [addCandidateModalOpen, setAddCandidateModalOpen] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Get stage badge with gradient styling (matching Jobs page design)
  const getStageBadge = (stage: string) => {
    // Helper function to format stage text properly
    const formatStageText = (stageId: string) => {
      const stageData = stages.find(s => s.id === stageId);
      if (stageData) {
        return stageData.name; // Use the proper name from API
      }
      // Fallback: capitalize first letter of each word
      return stageId.split(' ').map(word =>
        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      ).join(' ');
    };

    switch (stage) {
      case 'applied':
        return <Badge className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-0 shadow-sm">{formatStageText(stage)}</Badge>;
      case 'screening':
        return <Badge className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-0 shadow-sm">{formatStageText(stage)}</Badge>;
      case 'interview':
        return <Badge className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white border-0 shadow-sm">{formatStageText(stage)}</Badge>;
      case 'assessment':
        return <Badge className="bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white border-0 shadow-sm">{formatStageText(stage)}</Badge>;
      case 'offer':
        return <Badge className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white border-0 shadow-sm">{formatStageText(stage)}</Badge>;
      case 'hired':
        return <Badge className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white border-0 shadow-sm">{formatStageText(stage)}</Badge>;
      case 'rejected':
        return <Badge className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white border-0 shadow-sm">{formatStageText(stage)}</Badge>;
      default:
        return <Badge className="bg-gradient-to-r from-gray-500 to-gray-600 text-white border-0 shadow-sm">{formatStageText(stage)}</Badge>;
    }
  };

  // Use real API data
  const { pipeline, loading, error, refetch } = useCandidatePipeline();
  const { jobs: allJobs, loading: jobsLoading } = useJobs();

  // Extract candidates and stages from pipeline data
  const candidates = useMemo(() => {
    if (!pipeline?.stages) {
      return [];
    }
    return pipeline.stages.flatMap(stage => stage.candidates);
  }, [pipeline]);

  const stages = useMemo(() => {
    if (!pipeline?.stages) {
      return [];
    }
    return pipeline.stages;
  }, [pipeline]);

  // Filter state
  const [filters, setFilters] = useState<FilterOptions>({
    jobPosition: 'all',
    dateRange: { from: undefined, to: undefined },
    rating: null,
    skills: [],
    sources: [],
    stages: [],
    lastActivity: 'all'
  });

  // Jobs for filter dropdown - combine real jobs with legacy options
  const jobs = useMemo(() => {
    const baseJobs = [{ id: 'all', title: 'All Jobs' }];

    // Add real jobs from API
    if (allJobs && allJobs.length > 0) {
      const realJobs = allJobs.map(job => ({
        id: job.id,
        title: job.title
      }));
      return [...baseJobs, ...realJobs];
    }

    // Fallback to legacy position-based options
    return [
      ...baseJobs,
      { id: 'fe-dev', title: 'Frontend Developer' },
      { id: 'be-dev', title: 'Backend Developer' },
      { id: 'pm', title: 'Product Manager' },
      { id: 'ux', title: 'UX Designer' },
      { id: 'ds', title: 'Data Scientist' },
      { id: 'devops', title: 'DevOps Engineer' },
      { id: 'qa', title: 'QA Engineer' },
      { id: 'marketing', title: 'Marketing Lead' },
    ];
  }, [allJobs]);

  const handleViewCandidate = (id: string) => {
    setViewCandidateId(id);
  };

  const closeDialog = () => {
    setViewCandidateId(null);
  };

  const getCandidate = (id: string) => {
    return candidates.find((c) => c.id === id);
  };

  // Handle candidate status change from drag-and-drop
  const handleCandidateStatusChange = async (candidateId: string, newStatus: string) => {
    try {
      // Find the candidate to get their name for the toast
      const candidate = candidates.find(c => c.id === candidateId);
      const stageName = stages.find(s => s.id === newStatus)?.name || newStatus;

      // Update the candidate stage via API
      const response = await fetch(`/api/candidates/${candidateId}/stage`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ stage: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update candidate stage');
      }

      // Show success toast
      if (candidate) {
        toast.atsBlue({
          title: "Candidate moved",
          description: `${candidate.name} moved to ${stageName}`,
        });
      }

      // Refetch the pipeline data to get updated state
      refetch();
    } catch (error) {
      console.error('Error updating candidate stage:', error);
      toast({
        title: "Error",
        description: "Failed to update candidate stage. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300); // 300ms delay

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Generate search suggestions
  const generateSearchSuggestions = useCallback((query: string) => {
    if (!query || query.length < 2) {
      setSearchSuggestions([]);
      return;
    }

    const suggestions = new Set<string>();
    const lowerQuery = query.toLowerCase();

    // Add candidate names
    candidates.forEach(candidate => {
      if (candidate.name.toLowerCase().includes(lowerQuery)) {
        suggestions.add(candidate.name);
      }
      // Add positions
      if (candidate.position.toLowerCase().includes(lowerQuery)) {
        suggestions.add(candidate.position);
      }
      // Add skills/tags
      candidate.tags?.forEach(tag => {
        if (tag.toLowerCase().includes(lowerQuery)) {
          suggestions.add(tag);
        }
      });
    });

    // Add stage names
    stages.forEach(stage => {
      if (stage.name.toLowerCase().includes(lowerQuery)) {
        suggestions.add(stage.name);
      }
    });

    // Convert to array and limit to 8 suggestions
    setSearchSuggestions(Array.from(suggestions).slice(0, 8));
  }, [candidates]);

  // Handle search input change
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    generateSearchSuggestions(value);
    setShowSuggestions(value.length > 0);
  };

  // Handle suggestion selection
  const handleSuggestionSelect = (suggestion: string) => {
    setSearchQuery(suggestion);
    setDebouncedSearchQuery(suggestion);
    setShowSuggestions(false);
    setSearchSuggestions([]);
  };

  const handleClearFilters = () => {
    setFilters({
      jobPosition: 'all',
      dateRange: { from: undefined, to: undefined },
      rating: null,
      skills: [],
      sources: [],
      stages: [],
      lastActivity: 'all'
    });
    setSearchQuery('');
    setDebouncedSearchQuery('');
    setSelectedJob('all');
    setShowSuggestions(false);
    setSearchSuggestions([]);
  };

  // Export functionality
  const handleExportData = () => {
    const exportData = filteredCandidates.map(candidate => ({
      Name: candidate.name,
      Email: candidate.email,
      Phone: candidate.phone || 'N/A',
      Position: candidate.position,
      Stage: stages.find(s => s.id === candidate.stage)?.name || candidate.stage,
      Rating: candidate.rating || 'N/A',
      Skills: candidate.tags?.join(', ') || 'N/A',
      'Last Activity': candidate.lastActivity || 'N/A'
    }));

    // Convert to CSV
    const headers = Object.keys(exportData[0] || {});
    const csvContent = [
      headers.join(','),
      ...exportData.map(row =>
        headers.map(header => `"${row[header as keyof typeof row] || ''}"`).join(',')
      )
    ].join('\n');

    // Download CSV file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `candidate-pipeline-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.atsBlue({
      title: "Export completed",
      description: `Exported ${filteredCandidates.length} candidates to CSV file`,
    });
  };

  // Filter candidates based on search query, job selection, and advanced filters
  const filteredCandidates = useMemo(() => {
    return candidates.filter(candidate => {
      // Search query filter - Enhanced with more comprehensive search
      if (debouncedSearchQuery) {
        const query = debouncedSearchQuery.toLowerCase().trim();
        if (query.length === 0) return true; // Empty search shows all

        const matchesSearch =
          candidate.name.toLowerCase().includes(query) ||
          candidate.email.toLowerCase().includes(query) ||
          candidate.position.toLowerCase().includes(query) ||
          candidate.phone?.toLowerCase().includes(query) ||
          candidate.lastActivity?.toLowerCase().includes(query) ||
          candidate.tags?.some(tag => tag.toLowerCase().includes(query)) ||
          // Search by stage name
          stages.find(s => s.id === candidate.stage)?.name.toLowerCase().includes(query) ||
          // Search by rating (e.g., "5 star", "4+")
          (query.includes('star') && candidate.rating?.toString().includes(query.replace(/[^\d]/g, ''))) ||
          // Search by ID for exact matches
          candidate.id.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      // Job position filter - support both job IDs and position types
      if (selectedJob !== 'all') {
        // Check if it's a specific job ID (from URL parameter)
        if (jobIdFromUrl && selectedJob === jobIdFromUrl) {
          // Filter by actual job ID - check if candidate has applications for this job
          const hasApplicationForJob = candidate.applications?.some(app => app.jobId === selectedJob);
          if (!hasApplicationForJob) {
            return false;
          }
        } else {
          // Legacy position-based filtering
          const jobMap: Record<string, string[]> = {
            'fe-dev': ['Frontend Developer'],
            'be-dev': ['Backend Developer'],
            'pm': ['Product Manager'],
            'ux': ['UX Designer'],
            'ds': ['Data Scientist'],
            'devops': ['DevOps Engineer'],
            'qa': ['QA Engineer'],
            'marketing': ['Marketing Lead', 'Marketing Specialist'],
          };
          if (jobMap[selectedJob] && !jobMap[selectedJob].includes(candidate.position)) {
            return false;
          }
        }
      }

      // Advanced filters
      if (filters.jobPosition !== 'all') {
        const positionMap: Record<string, string[]> = {
          'frontend-developer': ['Frontend Developer'],
          'backend-developer': ['Backend Developer'],
          'fullstack-developer': ['Fullstack Developer'],
          'ux-designer': ['UX Designer'],
          'product-manager': ['Product Manager'],
          'data-scientist': ['Data Scientist'],
          'devops-engineer': ['DevOps Engineer'],
          'marketing-lead': ['Marketing Lead', 'Marketing Specialist'],
        };
        if (positionMap[filters.jobPosition] && !positionMap[filters.jobPosition].includes(candidate.position)) {
          return false;
        }
      }

      // Rating filter
      if (filters.rating !== null && (candidate.rating || 0) < filters.rating) {
        return false;
      }

      // Skills filter
      if (filters.skills.length > 0) {
        const hasMatchingSkill = filters.skills.some(skill =>
          candidate.tags?.some(tag => tag.toLowerCase().includes(skill.toLowerCase()))
        );
        if (!hasMatchingSkill) return false;
      }

      // Stages filter
      if (filters.stages.length > 0) {
        const stageMatches = filters.stages.some(filterStage => {
          // Convert filter stage names to lowercase for comparison
          const normalizedFilterStage = filterStage.toLowerCase();
          return candidate.stage === normalizedFilterStage;
        });
        if (!stageMatches) return false;
      }

      return true;
    });
  }, [candidates, debouncedSearchQuery, selectedJob, filters, jobIdFromUrl, stages]);

  // Update stages with filtered candidates
  const filteredStages = useMemo(() => {
    return stages.map(stage => ({
      ...stage,
      candidates: filteredCandidates.filter(c => c.stage === stage.id)
    }));
  }, [stages, filteredCandidates]);

  // Count active filters
  const activeFiltersCount = [
    filters.jobPosition !== 'all',
    filters.dateRange.from || filters.dateRange.to,
    filters.rating !== null,
    filters.skills.length > 0,
    filters.sources.length > 0,
    filters.stages.length > 0,
    filters.lastActivity !== 'all',
    debouncedSearchQuery.length > 0,
    selectedJob !== 'all'
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 -m-6 p-6">
      <div className="max-w-full space-y-6">
        <PageHeader
          title="Candidates"
          subtitle="Manage and track candidates through your recruitment process"
          icon={Users}
        >
        <Button
          variant="outline"
          size="sm"
          onClick={() => setFilterModalOpen(true)}
          className="border-gray-300 hover:border-blue-500 hover:text-blue-600 transition-colors"
        >
          <Filter className="h-4 w-4 mr-2" />
          Filter
          {activeFiltersCount > 0 && (
            <Badge className="ml-2 h-5 w-5 p-0 text-xs bg-blue-600 hover:bg-blue-700 flex items-center justify-center">
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleExportData}
          className="border-gray-300 hover:border-blue-500 hover:text-blue-600 transition-colors"
        >
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
        <Button
          size="sm"
          onClick={() => setAddCandidateModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Candidate
        </Button>
      </PageHeader>

      {/* Search and Quick Filters - Responsive */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search candidates, jobs, skills..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            onFocus={() => setShowSuggestions(searchQuery.length > 0 && searchSuggestions.length > 0)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)} // Delay to allow suggestion clicks
            className="pl-10 w-full text-sm sm:text-base"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-gray-100"
              onClick={() => {
                setSearchQuery('');
                setDebouncedSearchQuery('');
                setShowSuggestions(false);
                setSearchSuggestions([]);
              }}
            >
              <X className="h-3 w-3" />
            </Button>
          )}

          {/* Search Suggestions Dropdown */}
          {showSuggestions && searchSuggestions.length > 0 && (
            <div className={`absolute top-full left-0 right-0 mt-1 ${shadows.dropdown} z-50 max-h-64 overflow-y-auto`}>
              <div className="p-2">
                <div className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                  <Zap className="h-3 w-3" />
                  Quick suggestions
                </div>
                {searchSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 rounded-md flex items-center gap-2"
                    onClick={() => handleSuggestionSelect(suggestion)}
                  >
                    {/* Determine suggestion type and show appropriate icon */}
                    {candidates.some(c => c.name === suggestion) && (
                      <Users className="h-3 w-3 text-ats-blue" />
                    )}
                    {candidates.some(c => c.position === suggestion) && (
                      <Briefcase className="h-3 w-3 text-ats-purple" />
                    )}
                    {candidates.some(c => c.tags?.includes(suggestion)) && (
                      <Star className="h-3 w-3 text-yellow-500" />
                    )}
                    {stages.some(s => s.name === suggestion) && (
                      <Clock className="h-3 w-3 text-green-500" />
                    )}
                    <span>{suggestion}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="flex gap-3">
          <Select value={selectedJob} onValueChange={setSelectedJob}>
            <SelectTrigger className="w-full sm:w-[200px] lg:w-[220px]">
              <SelectValue placeholder="All Jobs" />
            </SelectTrigger>
            <SelectContent>
              {jobs.map((job) => (
                <SelectItem key={job.id} value={job.id}>
                  {job.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <LoadingUI message="Loading candidates..." />
      )}

      {/* Error State / Demo Mode */}
      {error && (
        <div className="mb-8">
          {error.includes('Backend server not available') ? (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 shadow-lg">
              <div className="flex items-center">
                <svg className="h-6 w-6 text-blue-500 mr-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="flex-1">
                  <h3 className="text-lg font-inter font-semibold text-blue-900">Demo Mode Active</h3>
                  <p className="text-sm font-inter text-blue-700 mt-1">
                    Backend server not available. Showing demo data with limited functionality.
                  </p>
                  <p className="text-xs font-inter text-blue-600 mt-2">
                    Error: {error}
                  </p>
                </div>
                <Button
                  onClick={refetch}
                  variant="outline"
                  size="sm"
                  className="border-blue-300 text-blue-600 hover:bg-blue-50"
                >
                  Retry Connection
                </Button>
              </div>
            </div>
          ) : (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <div className="text-red-600 mb-2">
                <svg className="h-8 w-8 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-lg font-medium">Error loading candidates</h3>
              </div>
              <p className="text-red-600 mb-4">{error}</p>
              <Button
                onClick={refetch}
                variant="outline"
                className="border-red-300 text-red-600 hover:bg-red-50"
              >
                Try Again
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Main Content - Show candidates even in demo mode (when error exists but pipeline is available) */}
      {!loading && filteredStages.length > 0 && (
        <>
          {viewMode === 'board' ? (
            <KanbanBoard
              initialStages={filteredStages}
              onViewCandidate={handleViewCandidate}
              onAddCandidate={() => setAddCandidateModalOpen(true)}
              onCandidateStatusChange={handleCandidateStatusChange}
            />
          ) : (
            <div>List view placeholder</div>
          )}
        </>
      )}

      {/* Empty State */}
      {!loading && !error && filteredStages.length === 0 && (
        <div className="text-center py-12">
          <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Candidates Found</h3>
          <p className="text-gray-600 mb-4">No candidates match your current filters</p>
          <Button onClick={() => setAddCandidateModalOpen(true)} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Add Candidate
          </Button>
        </div>
      )}

      {/* Modals */}
      <CandidateFilterModal
        open={filterModalOpen}
        onOpenChange={setFilterModalOpen}
        filters={filters}
        onFiltersChange={setFilters}
        onClearFilters={handleClearFilters}
      />

      <AddCandidateModal
        open={addCandidateModalOpen}
        onOpenChange={setAddCandidateModalOpen}
      />
      </div>
    </div>
  );
};

export default Candidates;
