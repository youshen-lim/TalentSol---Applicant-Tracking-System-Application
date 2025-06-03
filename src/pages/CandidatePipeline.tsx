import React, { useState, useMemo, useEffect, useCallback } from "react";
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

/**
 * CandidatePipeline page component
 * Displays a kanban board view of candidates in the hiring pipeline
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

const CandidatePipeline = () => {
  const { toast } = useToast();
  const [viewCandidateId, setViewCandidateId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [selectedJob, setSelectedJob] = useState('all');
  const [viewMode, setViewMode] = useState<'board' | 'list'>('board');
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [addCandidateModalOpen, setAddCandidateModalOpen] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Convert mock data to state for proper reactivity
  const [candidates, setCandidates] = useState<Candidate[]>(mockCandidates);

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

  // Sample jobs for filter dropdown
  const jobs = [
    { id: 'all', title: 'All Jobs' },
    { id: 'fe-dev', title: 'Frontend Developer' },
    { id: 'be-dev', title: 'Backend Developer' },
    { id: 'pm', title: 'Product Manager' },
    { id: 'ux', title: 'UX Designer' },
    { id: 'ds', title: 'Data Scientist' },
    { id: 'devops', title: 'DevOps Engineer' },
    { id: 'qa', title: 'QA Engineer' },
    { id: 'marketing', title: 'Marketing Lead' },
  ];

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
  const handleCandidateStatusChange = (candidateId: string, newStatus: string) => {
    setCandidates(prevCandidates => {
      const updatedCandidates = prevCandidates.map(candidate =>
        candidate.id === candidateId
          ? { ...candidate, stage: newStatus }
          : candidate
      );

      // Show success toast
      const movedCandidate = updatedCandidates.find(c => c.id === candidateId);
      if (movedCandidate) {
        toast.atsBlue({
          title: "Candidate moved",
          description: `${movedCandidate.name} moved to ${stages.find(s => s.id === newStatus)?.name || newStatus}`,
        });
      }

      return updatedCandidates;
    });
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

      // Job position filter
      if (selectedJob !== 'all') {
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
  }, [candidates, debouncedSearchQuery, selectedJob, filters]);

  // Update stages with filtered candidates
  const filteredStages = useMemo(() => {
    return stages.map(stage => ({
      ...stage,
      candidates: filteredCandidates.filter(c => c.stage === stage.id)
    }));
  }, [filteredCandidates]);

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
    <div className="space-y-6">
      <PageHeader
        title="Candidate Pipeline"
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

      {/* Active Filters Display */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-gray-500">Active filters:</span>
          {debouncedSearchQuery && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Search: "{debouncedSearchQuery}"
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => {
                  setSearchQuery('');
                  setDebouncedSearchQuery('');
                  setShowSuggestions(false);
                  setSearchSuggestions([]);
                }}
              />
            </Badge>
          )}
          {selectedJob !== 'all' && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Job: {jobs.find(j => j.id === selectedJob)?.title}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => setSelectedJob('all')}
              />
            </Badge>
          )}
          {filters.skills.map(skill => (
            <Badge key={skill} variant="secondary" className="flex items-center gap-1">
              Skill: {skill}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => setFilters(prev => ({
                  ...prev,
                  skills: prev.skills.filter(s => s !== skill)
                }))}
              />
            </Badge>
          ))}
          {filters.rating && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Rating: {filters.rating}+ stars
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => setFilters(prev => ({ ...prev, rating: null }))}
              />
            </Badge>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearFilters}
            className="text-xs"
          >
            Clear all
          </Button>
        </div>
      )}

      {/* View Toggle and Results Summary - Responsive */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
          <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'board' | 'list')} className="w-auto">
            <TabsList className="grid w-full grid-cols-2 sm:w-auto">
              <TabsTrigger value="board" className="text-xs sm:text-sm">Board View</TabsTrigger>
              <TabsTrigger value="list" className="text-xs sm:text-sm">List View</TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="text-xs sm:text-sm text-gray-500">
            <span className="font-medium">{filteredCandidates.length}</span> candidate{filteredCandidates.length !== 1 ? 's' : ''} found
            {debouncedSearchQuery && (
              <span className="ml-2 text-ats-blue">
                for "<span className="font-medium">{debouncedSearchQuery}</span>"
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      {viewMode === 'board' ? (
        <KanbanBoard
          initialStages={filteredStages}
          onViewCandidate={handleViewCandidate}
          onAddCandidate={() => setAddCandidateModalOpen(true)}
          onCandidateStatusChange={handleCandidateStatusChange}
        />
      ) : (
        <div className="bg-white rounded-lg border overflow-hidden">
          {/* List View Header - Responsive */}
          <div className="hidden md:grid grid-cols-12 gap-4 p-4 border-b bg-gray-50 font-medium text-sm">
            <div className="col-span-3">Candidate</div>
            <div className="col-span-2">Position</div>
            <div className="col-span-2">Stage</div>
            <div className="col-span-2">Rating</div>
            <div className="col-span-2">Last Activity</div>
            <div className="col-span-1">Actions</div>
          </div>
          <div className="divide-y">
            {filteredCandidates.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium mb-2">No candidates found</h3>
                <p className="text-sm">Try adjusting your search or filter criteria</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearFilters}
                  className="mt-4"
                >
                  Clear all filters
                </Button>
              </div>
            ) : (
              filteredCandidates.map((candidate) => (
                <div key={candidate.id} className="md:grid md:grid-cols-12 md:gap-4 p-4 md:items-center hover:bg-gray-50">
                  {/* Mobile Layout */}
                  <div className="md:hidden space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 bg-ats-blue/10 text-ats-blue rounded-full flex items-center justify-center font-medium text-sm">
                          {candidate.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <div className="font-medium">{candidate.name}</div>
                          <div className="text-sm text-gray-600">{candidate.position}</div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewCandidate(candidate.id)}
                        className="h-8 w-8 p-0"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="flex items-center justify-between">
                      <Badge
                        variant={
                          candidate.stage === 'offer' ? 'default' :
                          candidate.stage === 'rejected' ? 'destructive' :
                          'secondary'
                        }
                        className={
                          candidate.stage === 'offer' ? 'bg-green-100 text-green-800' :
                          candidate.stage === 'rejected' ? '' :
                          'bg-ats-blue/10 text-ats-blue'
                        }
                      >
                        {stages.find(s => s.id === candidate.stage)?.name || candidate.stage}
                      </Badge>

                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, index) => (
                          <Star
                            key={index}
                            className={`h-3 w-3 ${
                              index < (candidate.rating || 0)
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                        <span className="text-xs text-gray-500 ml-1">
                          ({candidate.rating || 0})
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        <span className="truncate">{candidate.email}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{candidate.lastActivity}</span>
                      </div>
                    </div>

                    {candidate.tags && candidate.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {candidate.tags.slice(0, 3).map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {candidate.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{candidate.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Desktop Layout */}
                  <div className="hidden md:contents">
                    <div className="col-span-3 flex items-center space-x-3">
                      <div className="h-10 w-10 bg-ats-blue/10 text-ats-blue rounded-full flex items-center justify-center font-medium">
                        {candidate.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <div className="font-medium">{candidate.name}</div>
                        <div className="text-xs text-gray-500 flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {candidate.email}
                        </div>
                        {candidate.phone && (
                          <div className="text-xs text-gray-500 flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {candidate.phone}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="col-span-2">
                      <div className="font-medium">{candidate.position}</div>
                      {candidate.tags && candidate.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {candidate.tags.slice(0, 2).map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {candidate.tags.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{candidate.tags.length - 2}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="col-span-2">
                      <Badge
                        variant={
                          candidate.stage === 'offer' ? 'default' :
                          candidate.stage === 'rejected' ? 'destructive' :
                          'secondary'
                        }
                        className={
                          candidate.stage === 'offer' ? 'bg-green-100 text-green-800' :
                          candidate.stage === 'rejected' ? '' :
                          'bg-ats-blue/10 text-ats-blue'
                        }
                      >
                        {stages.find(s => s.id === candidate.stage)?.name || candidate.stage}
                      </Badge>
                    </div>
                    <div className="col-span-2">
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, index) => (
                          <Star
                            key={index}
                            className={`h-4 w-4 ${
                              index < (candidate.rating || 0)
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                        <span className="text-sm text-gray-500 ml-1">
                          ({candidate.rating || 0})
                        </span>
                      </div>
                    </div>
                    <div className="col-span-2">
                      <div className="text-sm flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-gray-400" />
                        {candidate.lastActivity}
                      </div>
                    </div>
                    <div className="col-span-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewCandidate(candidate.id)}
                        className="h-8 w-8 p-0"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
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

      <Dialog open={!!viewCandidateId} onOpenChange={closeDialog}>
        <DialogContent className="max-w-2xl">
          {viewCandidateId && (
            <>
              <DialogHeader>
                <DialogTitle>Candidate Profile</DialogTitle>
                <DialogDescription>
                  View and manage candidate details
                </DialogDescription>
              </DialogHeader>
              <div className="mt-4 space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="h-16 w-16 bg-ats-blue/10 text-ats-blue rounded-full flex items-center justify-center text-2xl">
                    {getCandidate(viewCandidateId)?.name.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">
                      {getCandidate(viewCandidateId)?.name}
                    </h2>
                    <p className="text-gray-500">
                      {getCandidate(viewCandidateId)?.position}
                    </p>
                    <div className="mt-2 flex space-x-4">
                      <p className="text-sm">
                        <span className="font-medium">Email:</span>{" "}
                        {getCandidate(viewCandidateId)?.email}
                      </p>
                      {getCandidate(viewCandidateId)?.phone && (
                        <p className="text-sm">
                          <span className="font-medium">Phone:</span>{" "}
                          {getCandidate(viewCandidateId)?.phone}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium mb-2">Stage</h3>
                      <div className="bg-gray-100 text-gray-800 inline-block px-3 py-1 rounded-full text-sm">
                        {stages.find(s => s.id === getCandidate(viewCandidateId)?.stage)?.name || getCandidate(viewCandidateId)?.stage}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium mb-2">Tags</h3>
                      <div className="flex flex-wrap gap-2">
                        {getCandidate(viewCandidateId)?.tags?.map((tag, index) => (
                          <div key={index} className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs">
                            {tag}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium mb-2">Rating</h3>
                      <div className="flex">
                        {Array.from({ length: 5 }).map((_, index) => (
                          <svg
                            key={index}
                            className={`h-5 w-5 ${
                              index < (getCandidate(viewCandidateId)?.rating || 0)
                                ? "text-yellow-400 fill-current"
                                : "text-gray-300"
                            }`}
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium mb-2">Activity</h3>
                      <div className="border rounded-md p-3 space-y-2">
                        <div>
                          <p className="text-xs text-gray-500">2 days ago</p>
                          <p className="text-sm">Application received</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Yesterday</p>
                          <p className="text-sm">Resume screened by HR</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Today</p>
                          <p className="text-sm">Scheduled for initial interview</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium mb-2">Notes</h3>
                      <textarea
                        className="w-full p-2 border rounded-md text-sm h-24"
                        placeholder="Add notes about this candidate..."
                      ></textarea>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button variant="outline">Schedule Interview</Button>
                  <div className="space-x-2">
                    <Button variant="outline" onClick={closeDialog}>
                      Close
                    </Button>
                    <Button
                      className="bg-ats-blue hover:bg-ats-dark-blue"
                      onClick={() => {
                        toast.success("Candidate profile updated!");
                        closeDialog();
                      }}
                    >
                      Save Changes
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CandidatePipeline;