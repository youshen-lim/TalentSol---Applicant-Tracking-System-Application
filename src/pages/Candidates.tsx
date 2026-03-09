import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Search,
  Filter,
  Plus,
  Users,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";
import CandidateFilterModal, { FilterOptions } from "@/components/candidates/CandidateFilterModal";
import AddCandidateModal from "@/components/dashboard/AddCandidateModal";
import { Candidate } from "@/components/candidates/CandidateCard";
import { toast } from "sonner";
import { useToast } from "@/components/ui/use-toast";
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

// ─── Stage tabs config ────────────────────────────────────────────────────────

const STAGE_TABS = [
  { value: "all",         label: "All Stages" },
  { value: "applied",     label: "Applied" },
  { value: "screening",   label: "Screening" },
  { value: "interview",   label: "Interview 1" },
  { value: "interview2",  label: "Interview 2" },
  { value: "offer",       label: "Offer" },
  { value: "hired",       label: "Hired" },
];

const CAND_AVATAR_COLORS = [
  "bg-indigo-100 text-indigo-700",
  "bg-violet-100 text-violet-700",
  "bg-amber-100 text-amber-700",
  "bg-rose-100 text-rose-700",
  "bg-cyan-100 text-cyan-700",
  "bg-emerald-100 text-emerald-700",
  "bg-teal-100 text-teal-700",
  "bg-fuchsia-100 text-fuchsia-700",
];

// ─── Candidate table row ──────────────────────────────────────────────────────

function CandidateRow({
  candidate,
  getStageBadge,
  onView,
}: {
  candidate: any;
  getStageBadge: (stage: string) => React.ReactNode;
  onView: () => void;
}) {
  const colorIdx = candidate.name ? candidate.name.charCodeAt(0) % CAND_AVATAR_COLORS.length : 0;
  const color = CAND_AVATAR_COLORS[colorIdx];
  const ini = (candidate.name ?? "?")
    .split(" ")
    .map((n: string) => n[0] ?? "")
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div
      onClick={onView}
      className="grid px-6 py-3.5 hover:bg-gray-50 cursor-pointer transition-colors items-center"
      style={{ gridTemplateColumns: "2fr 2fr 1.5fr 1fr 1fr 1fr" }}
    >
      {/* Candidate */}
      <div className="flex items-center gap-3 min-w-0">
        <div className={`w-8 h-8 rounded-full ${color} flex items-center justify-center shrink-0`}>
          <span style={{ fontSize: 11, fontWeight: 700 }}>{ini}</span>
        </div>
        <div className="min-w-0">
          <p className="text-gray-900 truncate" style={{ fontSize: 13, fontWeight: 600 }}>{candidate.name}</p>
          <p className="text-gray-500 truncate" style={{ fontSize: 11 }}>{candidate.position}</p>
        </div>
      </div>

      {/* Contact */}
      <div className="flex flex-col justify-center gap-0.5 min-w-0">
        {candidate.email && (
          <div className="flex items-center gap-1.5 min-w-0">
            <Mail size={11} className="text-gray-400 shrink-0" />
            <span className="truncate text-gray-600" style={{ fontSize: 12 }}>{candidate.email}</span>
          </div>
        )}
        {candidate.phone && (
          <div className="flex items-center gap-1.5">
            <Phone size={11} className="text-gray-400 shrink-0" />
            <span className="text-gray-600" style={{ fontSize: 12 }}>{candidate.phone}</span>
          </div>
        )}
      </div>

      {/* Location */}
      <div className="flex items-center">
        {(candidate as any).location ? (
          <div className="flex items-center gap-1.5">
            <MapPin size={11} className="text-gray-400 shrink-0" />
            <span className="text-gray-600" style={{ fontSize: 12 }}>{(candidate as any).location}</span>
          </div>
        ) : (
          <span className="text-gray-400" style={{ fontSize: 12 }}>—</span>
        )}
      </div>

      {/* Stage */}
      <div className="flex items-center">{getStageBadge(candidate.stage)}</div>

      {/* Source */}
      <div className="flex items-center">
        <span className="text-gray-600" style={{ fontSize: 12 }}>{(candidate as any).source ?? "—"}</span>
      </div>

      {/* Applied */}
      <div className="flex items-center">
        <span className="text-gray-500" style={{ fontSize: 12 }}>{candidate.lastActivity ?? "—"}</span>
      </div>
    </div>
  );
}

// ─── Candidates Page ──────────────────────────────────────────────────────────

const Candidates = () => {
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const jobIdFromUrl = searchParams.get('jobId');

  const [viewCandidateId, setViewCandidateId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [selectedJob, setSelectedJob] = useState(jobIdFromUrl || 'all');
  const [stageTabFilter, setStageTabFilter] = useState("all");
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [addCandidateModalOpen, setAddCandidateModalOpen] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Get stage badge
  const getStageBadge = (stage: string) => {
    const formatStageText = (stageId: string) => {
      const stageData = stages.find(s => s.id === stageId);
      if (stageData) return stageData.name;
      return stageId.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
    };
    const classMap: Record<string, string> = {
      applied:    "bg-blue-100 text-blue-700",
      screening:  "bg-yellow-100 text-yellow-700",
      interview:  "bg-purple-100 text-purple-700",
      assessment: "bg-orange-100 text-orange-700",
      offer:      "bg-emerald-100 text-emerald-700",
      hired:      "bg-emerald-100 text-emerald-700",
      rejected:   "bg-red-100 text-red-700",
    };
    const cls = classMap[stage] ?? "bg-gray-100 text-gray-700";
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full font-medium ${cls}`} style={{ fontSize: 11 }}>
        {formatStageText(stage)}
      </span>
    );
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

  // Rows filtered by the stage pill tab
  const tableRows = useMemo(() => {
    if (stageTabFilter === "all") return filteredCandidates;
    const stageKey = stageTabFilter === "interview2" ? "interview" : stageTabFilter;
    return filteredCandidates.filter(c => c.stage === stageKey);
  }, [filteredCandidates, stageTabFilter]);

  return (
    <div className="p-6 space-y-5">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
            <Users size={16} className="text-indigo-600" />
          </div>
          <div>
            <h1 className="text-gray-900" style={{ fontSize: 20, fontWeight: 600 }}>Candidates</h1>
            <p className="text-gray-500 mt-0.5" style={{ fontSize: 13 }}>
              Manage and track all candidates in your recruiting pipeline
            </p>
          </div>
        </div>
        <button
          onClick={() => setAddCandidateModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg transition-all"
        >
          <Plus size={15} />
          <span style={{ fontSize: 13, fontWeight: 500 }}>Add Candidate</span>
        </button>
      </div>

      {/* ── Search + Filter bar ── */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            placeholder="Search candidates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-64 pl-9 pr-4 py-2 rounded-lg border border-gray-200 bg-white text-foreground placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300"
            style={{ fontSize: 13 }}
          />
        </div>
        <button
          onClick={() => setFilterModalOpen(true)}
          className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 text-gray-700 transition-all"
          style={{ fontSize: 13 }}
        >
          <Filter size={14} />
          Filter
          {activeFiltersCount > 0 && (
            <span className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full bg-indigo-600 text-white" style={{ fontSize: 10, fontWeight: 700 }}>
              {activeFiltersCount}
            </span>
          )}
        </button>
        <div className="flex-1" />
        <span className="text-gray-500" style={{ fontSize: 13 }}>
          {tableRows.length} candidate{tableRows.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* ── Stage pill tabs ── */}
      <div className="flex items-center gap-2 flex-wrap">
        {STAGE_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setStageTabFilter(tab.value)}
            className={`px-3 py-1.5 rounded-full font-medium transition-all ${
              stageTabFilter === tab.value
                ? "bg-indigo-600 text-white"
                : "border border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
            }`}
            style={{ fontSize: 12 }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Loading ── */}
      {loading && <LoadingUI message="Loading candidates..." />}

      {/* ── Error banner ── */}
      {error && !loading && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 flex items-center gap-3">
          <span className="text-amber-700 flex-1" style={{ fontSize: 13 }}>
            {error.includes('Backend') ? 'Demo mode — backend not available.' : `Error: ${error}`}
          </span>
          <button onClick={refetch} className="text-amber-700 underline shrink-0" style={{ fontSize: 12 }}>
            Retry
          </button>
        </div>
      )}

      {/* ── Table ── */}
      {!loading && (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          {/* Table header */}
          <div
            className="grid px-6 py-3 border-b border-gray-100 bg-gray-50/80"
            style={{ gridTemplateColumns: "2fr 2fr 1.5fr 1fr 1fr 1fr" }}
          >
            {["Candidate", "Contact", "Location", "Stage", "Source", "Applied"].map((h) => (
              <span
                key={h}
                className="text-gray-500 font-medium"
                style={{ fontSize: 11, letterSpacing: "0.04em", textTransform: "uppercase" }}
              >
                {h}
              </span>
            ))}
          </div>

          {/* Rows */}
          <div className="divide-y divide-gray-100">
            {tableRows.length > 0 ? (
              tableRows.map((c) => (
                <CandidateRow
                  key={c.id}
                  candidate={c}
                  getStageBadge={getStageBadge}
                  onView={() => handleViewCandidate(c.id)}
                />
              ))
            ) : (
              <div className="py-12 text-center">
                <Users size={32} className="mx-auto mb-3 text-gray-300" />
                <p className="text-gray-500" style={{ fontSize: 14 }}>
                  No candidates match your current filters
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Modals ── */}
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
  );
};

export default Candidates;
