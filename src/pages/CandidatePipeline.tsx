import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import KanbanBoard from "@/components/candidates/KanbanBoard";
import { toast } from "sonner";
import { Candidate } from "@/components/candidates/CandidateCard";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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
    stage: "Applied",
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
    stage: "Interview",
    tags: ["Figma", "UI/UX"],
    lastActivity: "Scheduled interview yesterday",
    rating: 5,
  },
  {
    id: "c3",
    name: "Michael Brown",
    email: "michael.brown@example.com",
    position: "Backend Developer",
    stage: "Applied",
    tags: ["Node.js", "MongoDB"],
    lastActivity: "Applied 5 days ago",
    rating: 3,
  },
  {
    id: "c4",
    name: "Sarah Wilson",
    email: "sarah.wilson@example.com",
    position: "Product Manager",
    stage: "Assessment",
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
    stage: "Screening",
    tags: ["AWS", "Docker"],
    lastActivity: "Scheduled screening call",
    rating: 4,
  },
  {
    id: "c6",
    name: "Lisa Chen",
    email: "lisa.chen@example.com",
    position: "Marketing Specialist",
    stage: "Offer",
    tags: ["SEO", "Content"],
    lastActivity: "Sent offer letter today",
    rating: 5,
  },
  {
    id: "c7",
    name: "James Johnson",
    email: "james.johnson@example.com",
    position: "Data Scientist",
    stage: "Interview",
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
    stage: "Rejected",
    tags: ["Vue", "CSS"],
    lastActivity: "Rejected 3 days ago",
    rating: 2,
  },
  {
    id: "c9",
    name: "Robert Miller",
    email: "robert.miller@example.com",
    position: "QA Engineer",
    stage: "Applied",
    tags: ["Testing", "Selenium"],
    lastActivity: "Applied 1 day ago",
    rating: 3,
  },
];

const stages = [
  {
    id: "applied",
    name: "Applied",
    candidates: mockCandidates.filter((c) => c.stage === "Applied"),
  },
  {
    id: "screening",
    name: "Screening",
    candidates: mockCandidates.filter((c) => c.stage === "Screening"),
  },
  {
    id: "interview",
    name: "Interview",
    candidates: mockCandidates.filter((c) => c.stage === "Interview"),
  },
  {
    id: "assessment",
    name: "Assessment",
    candidates: mockCandidates.filter((c) => c.stage === "Assessment"),
  },
  {
    id: "offer",
    name: "Offer",
    candidates: mockCandidates.filter((c) => c.stage === "Offer"),
  },
  {
    id: "rejected",
    name: "Rejected",
    candidates: mockCandidates.filter((c) => c.stage === "Rejected"),
  },
];

const CandidatePipeline = () => {
  const [viewCandidateId, setViewCandidateId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedJob, setSelectedJob] = useState('all');

  // Sample jobs for filter dropdown
  const jobs = [
    { id: 'all', title: 'All Jobs' },
    { id: 'fe-dev', title: 'Frontend Developer' },
    { id: 'be-dev', title: 'Backend Developer' },
    { id: 'pm', title: 'Product Manager' },
    { id: 'ux', title: 'UX Designer' },
  ];

  const handleViewCandidate = (id: string) => {
    setViewCandidateId(id);
  };

  const closeDialog = () => {
    setViewCandidateId(null);
  };

  const getCandidate = (id: string) => {
    return mockCandidates.find((c) => c.id === id);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Candidate Pipeline</h1>
          <p className="text-sm text-gray-500">
            Manage and track candidates through your recruitment process
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="sm">
            Filter
          </Button>
          <Button size="sm" className="bg-ats-blue hover:bg-ats-dark-blue">
            Add Candidate
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 md:flex-row">
        <div className="flex-1">
          <Input
            placeholder="Search candidates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>
        <Select value={selectedJob} onValueChange={setSelectedJob}>
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="Filter by job" />
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

      <Tabs defaultValue="board" className="w-full">
        <TabsList>
          <TabsTrigger value="board">Board View</TabsTrigger>
          <TabsTrigger value="list">List View</TabsTrigger>
        </TabsList>
        <TabsContent value="board" className="mt-4">
          <KanbanBoard
            initialStages={stages}
            onViewCandidate={handleViewCandidate}
          />
        </TabsContent>
        <TabsContent value="list">
          <div className="bg-white rounded-lg border overflow-hidden">
            <div className="grid grid-cols-12 gap-4 p-4 border-b bg-gray-50 font-medium text-sm">
              <div className="col-span-3">Name</div>
              <div className="col-span-3">Position</div>
              <div className="col-span-2">Stage</div>
              <div className="col-span-2">Last Activity</div>
              <div className="col-span-2">Action</div>
            </div>
            <div className="divide-y">
              {mockCandidates.map((candidate) => (
                <div key={candidate.id} className="grid grid-cols-12 gap-4 p-4 items-center">
                  <div className="col-span-3 flex items-center space-x-3">
                    <div className="h-8 w-8 bg-ats-blue/10 text-ats-blue rounded-full flex items-center justify-center">
                      {candidate.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-medium">{candidate.name}</div>
                      <div className="text-xs text-gray-500">{candidate.email}</div>
                    </div>
                  </div>
                  <div className="col-span-3">{candidate.position}</div>
                  <div className="col-span-2">
                    <span className="inline-block px-2 py-1 text-xs rounded-full bg-gray-100">
                      {candidate.stage}
                    </span>
                  </div>
                  <div className="col-span-2 text-sm">{candidate.lastActivity}</div>
                  <div className="col-span-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewCandidate(candidate.id)}
                    >
                      View Profile
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>

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
                        {getCandidate(viewCandidateId)?.stage}
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