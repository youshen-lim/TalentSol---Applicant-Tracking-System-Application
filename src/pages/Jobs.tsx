import { useState } from "react";
import { Search, Plus, Filter, MoreHorizontal, DollarSign, MapPin, Users, Calendar, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from '@/components/ui/badge';
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

// Mock data for jobs with enhanced details
const jobs = [
  {
    id: "j1",
    title: "Senior Frontend Developer",
    department: "Engineering",
    location: "Remote",
    type: "Full-time",
    salary: "$120,000 - $150,000",
    posted: "2 weeks ago",
    applicants: 45,
    status: "Active",
    progress: {
      screening: 15,
      interview: 8,
      assessment: 4,
      offer: 1,
    },
  },
  {
    id: "j2",
    title: "UX/UI Designer",
    department: "Design",
    location: "San Francisco, CA",
    type: "Full-time",
    salary: "$90,000 - $120,000",
    posted: "3 days ago",
    applicants: 23,
    status: "Active",
    progress: {
      screening: 8,
      interview: 4,
      assessment: 2,
      offer: 0,
    },
  },
  {
    id: "j3",
    title: "Product Manager",
    department: "Product",
    location: "New York, NY",
    type: "Full-time",
    salary: "$110,000 - $140,000",
    posted: "1 week ago",
    applicants: 34,
    status: "Active",
    progress: {
      screening: 12,
      interview: 6,
      assessment: 3,
      offer: 1,
    },
  },
  {
    id: "j4",
    title: "DevOps Engineer",
    department: "Engineering",
    location: "Remote",
    type: "Full-time",
    salary: "$130,000 - $160,000",
    posted: "5 days ago",
    applicants: 19,
    status: "Active",
    progress: {
      screening: 7,
      interview: 3,
      assessment: 1,
      offer: 0,
    },
  },
  {
    id: "j5",
    title: "Sales Representative",
    department: "Sales",
    location: "Chicago, IL",
    type: "Full-time",
    salary: "$65,000 - $85,000 + Commission",
    posted: "1 month ago",
    applicants: 52,
    status: "Active",
    progress: {
      screening: 18,
      interview: 10,
      assessment: 5,
      offer: 2,
    },
  },
  {
    id: "j6",
    title: "Marketing Specialist",
    department: "Marketing",
    location: "Austin, TX",
    type: "Full-time",
    salary: "$70,000 - $90,000",
    posted: "2 days ago",
    applicants: 12,
    status: "Active",
    progress: {
      screening: 4,
      interview: 0,
      assessment: 0,
      offer: 0,
    },
  },
];

// Get status badge color based on job status
const getStatusBadge = (status: string) => {
  switch (status) {
    case 'Active':
      return <Badge className="bg-green-500">Active</Badge>;
    case 'Draft':
      return <Badge className="bg-gray-500">Draft</Badge>;
    case 'Closed':
      return <Badge className="bg-red-500">Closed</Badge>;
    default:
      return <Badge>{status}</Badge>;
  }
};

const JobCard = ({ job }: { job: typeof jobs[0] }) => {
  const totalApplicantsInPipeline =
    job.progress.screening + job.progress.interview + job.progress.assessment + job.progress.offer;
  const progressPercentage = (totalApplicantsInPipeline / job.applicants) * 100;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{job.title}</CardTitle>
            <div className="text-sm text-gray-500 mt-1">{job.department}</div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Edit Job</DropdownMenuItem>
              <DropdownMenuItem>View Candidates</DropdownMenuItem>
              <DropdownMenuItem>Clone Job</DropdownMenuItem>
              <DropdownMenuItem className="text-red-600">Close Job</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center text-sm">
            <MapPin className="h-4 w-4 mr-2 text-gray-400" />
            {job.location}
          </div>
          <div className="flex items-center text-sm">
            <Briefcase className="h-4 w-4 mr-2 text-gray-400" />
            {job.type}
          </div>
          <div className="flex items-center text-sm">
            <DollarSign className="h-4 w-4 mr-2 text-gray-400" />
            {job.salary}
          </div>
          <div className="flex items-center text-sm">
            <Calendar className="h-4 w-4 mr-2 text-gray-400" />
            Posted {job.posted}
          </div>
        </div>

        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <div className="text-sm font-medium">Pipeline Progress</div>
            <div className="text-sm text-gray-500">
              {totalApplicantsInPipeline} of {job.applicants} applicants
            </div>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>

        <div className="grid grid-cols-4 gap-2 text-xs">
          <div className="text-center p-2 bg-gray-50 rounded">
            <div className="font-medium">{job.progress.screening}</div>
            <div className="text-gray-500 mt-1">Screening</div>
          </div>
          <div className="text-center p-2 bg-gray-50 rounded">
            <div className="font-medium">{job.progress.interview}</div>
            <div className="text-gray-500 mt-1">Interview</div>
          </div>
          <div className="text-center p-2 bg-gray-50 rounded">
            <div className="font-medium">{job.progress.assessment}</div>
            <div className="text-gray-500 mt-1">Assessment</div>
          </div>
          <div className="text-center p-2 bg-gray-50 rounded">
            <div className="font-medium">{job.progress.offer}</div>
            <div className="text-gray-500 mt-1">Offer</div>
          </div>
        </div>

        <div className="mt-4 flex justify-between">
          <Button variant="outline" size="sm" className="text-xs">
            View Job
          </Button>
          <Button variant="outline" size="sm" className="text-xs">
            <Users className="h-3 w-3 mr-1" />
            View Candidates
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const Jobs = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showDialog, setShowDialog] = useState(false);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const filteredJobs = jobs.filter(job =>
    job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Job Postings</h1>
          <p className="text-sm text-gray-500">
            Manage your open positions
          </p>
        </div>
        <Button
          onClick={() => setShowDialog(true)}
          className="bg-ats-blue hover:bg-ats-dark-blue"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create New Job
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search jobs..."
            className="pl-10 pr-4 py-2 border rounded-md w-full focus:outline-none focus:ring-2 focus:ring-ats-blue/20 focus:border-ats-blue"
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto justify-end">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline" size="sm">
            Department ▼
          </Button>
          <Button variant="outline" size="sm">
            Location ▼
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredJobs.map((job) => (
          <JobCard key={job.id} job={job} />
        ))}
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Job</DialogTitle>
          </DialogHeader>
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="job-title" className="block text-sm font-medium mb-1">
                  Job Title
                </label>
                <input
                  id="job-title"
                  className="w-full p-2 border rounded-md"
                  placeholder="e.g. Frontend Developer"
                />
              </div>
              <div>
                <label htmlFor="department" className="block text-sm font-medium mb-1">
                  Department
                </label>
                <select
                  id="department"
                  className="w-full p-2 border rounded-md"
                >
                  <option>Engineering</option>
                  <option>Design</option>
                  <option>Product</option>
                  <option>Marketing</option>
                  <option>Sales</option>
                </select>
              </div>
              <div>
                <label htmlFor="location" className="block text-sm font-medium mb-1">
                  Location
                </label>
                <input
                  id="location"
                  className="w-full p-2 border rounded-md"
                  placeholder="e.g. Remote, San Francisco, CA"
                />
              </div>
              <div>
                <label htmlFor="employment-type" className="block text-sm font-medium mb-1">
                  Employment Type
                </label>
                <select
                  id="employment-type"
                  className="w-full p-2 border rounded-md"
                >
                  <option>Full-time</option>
                  <option>Part-time</option>
                  <option>Contract</option>
                  <option>Internship</option>
                </select>
              </div>
              <div>
                <label htmlFor="min-salary" className="block text-sm font-medium mb-1">
                  Minimum Salary
                </label>
                <input
                  id="min-salary"
                  className="w-full p-2 border rounded-md"
                  placeholder="e.g. 80000"
                  type="number"
                />
              </div>
              <div>
                <label htmlFor="max-salary" className="block text-sm font-medium mb-1">
                  Maximum Salary
                </label>
                <input
                  id="max-salary"
                  className="w-full p-2 border rounded-md"
                  placeholder="e.g. 120000"
                  type="number"
                />
              </div>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium mb-1">
                Job Description
              </label>
              <textarea
                id="description"
                className="w-full p-2 border rounded-md h-32"
                placeholder="Enter job description..."
              ></textarea>
            </div>

            <div>
              <label htmlFor="requirements" className="block text-sm font-medium mb-1">
                Requirements
              </label>
              <textarea
                id="requirements"
                className="w-full p-2 border rounded-md h-32"
                placeholder="Enter job requirements..."
              ></textarea>
            </div>

            <div className="flex justify-end space-x-2 mt-6">
              <Button variant="outline" onClick={() => setShowDialog(false)}>
                Cancel
              </Button>
              <Button
                className="bg-ats-blue hover:bg-ats-dark-blue"
                onClick={() => {
                  setShowDialog(false);
                }}
              >
                Create Job
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Jobs;
