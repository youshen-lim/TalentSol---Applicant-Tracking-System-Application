import { Briefcase, Plus, Search, MapPin, Users, Clock } from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { useState } from "react";

const jobs = [
  { id: 1, title: "Senior Frontend Developer", department: "Engineering", location: "San Francisco, CA", type: "Full-time", candidates: 45, daysOpen: 12, status: "Active" },
  { id: 2, title: "Product Designer", department: "Design", location: "Remote", type: "Full-time", candidates: 32, daysOpen: 8, status: "Active" },
  { id: 3, title: "Marketing Manager", department: "Marketing", location: "New York, NY", type: "Full-time", candidates: 28, daysOpen: 20, status: "Active" },
  { id: 4, title: "Data Analyst", department: "Analytics", location: "Chicago, IL", type: "Full-time", candidates: 19, daysOpen: 5, status: "Active" },
  { id: 5, title: "DevOps Engineer", department: "Engineering", location: "Remote", type: "Full-time", candidates: 15, daysOpen: 30, status: "Active" },
  { id: 6, title: "HR Business Partner", department: "Human Resources", location: "Austin, TX", type: "Full-time", candidates: 22, daysOpen: 14, status: "Active" },
  { id: 7, title: "Backend Developer", department: "Engineering", location: "Seattle, WA", type: "Full-time", candidates: 38, daysOpen: 7, status: "Paused" },
  { id: 8, title: "Content Strategist", department: "Marketing", location: "Remote", type: "Part-time", candidates: 11, daysOpen: 18, status: "Draft" },
  { id: 9, title: "Customer Success Manager", department: "Customer Success", location: "Boston, MA", type: "Full-time", candidates: 26, daysOpen: 10, status: "Active" },
  { id: 10, title: "Sales Director", department: "Sales", location: "New York, NY", type: "Full-time", candidates: 9, daysOpen: 25, status: "Active" },
];

const deptColors: Record<string, string> = {
  Engineering: "bg-blue-100 text-blue-700",
  Design: "bg-purple-100 text-purple-700",
  Marketing: "bg-orange-100 text-orange-700",
  Analytics: "bg-teal-100 text-teal-700",
  "Human Resources": "bg-pink-100 text-pink-700",
  "Customer Success": "bg-green-100 text-green-700",
  Sales: "bg-yellow-100 text-yellow-700",
};

const statusColors: Record<string, string> = {
  Active: "bg-green-100 text-green-700",
  Paused: "bg-yellow-100 text-yellow-700",
  Draft: "bg-gray-100 text-gray-600",
  Closed: "bg-red-100 text-red-600",
};

export function Jobs() {
  const [search, setSearch] = useState("");

  const filtered = jobs.filter(
    (j) =>
      j.title.toLowerCase().includes(search.toLowerCase()) ||
      j.department.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        icon={Briefcase}
        iconColor="text-green-600"
        iconBg="bg-green-50"
        title="Job Management"
        subtitle="Create and manage all open positions and job requisitions"
        actions={
          <button className="flex items-center gap-1.5 bg-gray-900 text-white px-3 py-1.5 rounded-md text-[12px] font-medium hover:bg-gray-800 transition-colors">
            <Plus size={13} />
            New Job Posting
          </button>
        }
      />

      <div className="flex-1 p-6 overflow-y-auto">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: "Total Openings", value: "38", sub: "across all departments" },
            { label: "Active Jobs", value: "31", sub: "currently accepting applications" },
            { label: "Total Applicants", value: "284", sub: "this quarter" },
            { label: "Avg. Time Open", value: "15 days", sub: "to fill a position" },
          ].map((s) => (
            <div key={s.label} className="bg-white border border-gray-200 rounded-lg p-4">
              <p className="text-[22px] font-semibold text-gray-900 leading-none mb-1">{s.value}</p>
              <p className="text-[12px] font-medium text-gray-700">{s.label}</p>
              <p className="text-[11px] text-gray-400 mt-0.5">{s.sub}</p>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="flex items-center gap-2 mb-4">
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-md px-3 py-1.5 flex-1 max-w-xs">
            <Search size={13} className="text-gray-400" />
            <input
              type="text"
              placeholder="Search jobs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="text-[12px] text-gray-600 placeholder-gray-400 outline-none flex-1"
            />
          </div>
          <span className="text-[11px] text-gray-400 ml-auto">{filtered.length} jobs</span>
        </div>

        {/* Job Cards */}
        <div className="grid grid-cols-2 gap-3">
          {filtered.map((job) => (
            <div key={job.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-[13px] font-semibold text-gray-900">{job.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium ${deptColors[job.department] || "bg-gray-100 text-gray-600"}`}>
                      {job.department}
                    </span>
                    <span className="text-[11px] text-gray-400">{job.type}</span>
                  </div>
                </div>
                <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium ${statusColors[job.status]}`}>
                  {job.status}
                </span>
              </div>
              <div className="flex items-center gap-4 text-[11px] text-gray-500">
                <div className="flex items-center gap-1">
                  <MapPin size={11} />
                  {job.location}
                </div>
                <div className="flex items-center gap-1">
                  <Users size={11} />
                  {job.candidates} applicants
                </div>
                <div className="flex items-center gap-1">
                  <Clock size={11} />
                  {job.daysOpen}d open
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
