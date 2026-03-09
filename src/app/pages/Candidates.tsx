import { Users, Plus, Search, Filter, ChevronDown, Mail, Phone, MapPin } from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { useState } from "react";

const candidates = [
  { id: 1, name: "Alex Johnson", role: "Senior Frontend Developer", email: "alex.j@email.com", phone: "+1 555-0101", location: "San Francisco, CA", stage: "Interview 2", source: "LinkedIn", applied: "Apr 2, 2023", avatar: "AJ", avatarColor: "bg-blue-100 text-blue-700" },
  { id: 2, name: "Maria Garcia", role: "Product Designer", email: "m.garcia@email.com", phone: "+1 555-0102", location: "New York, NY", stage: "Screening", source: "Career Site", applied: "Apr 5, 2023", avatar: "MG", avatarColor: "bg-purple-100 text-purple-700" },
  { id: 3, name: "James Wilson", role: "Marketing Manager", email: "j.wilson@email.com", phone: "+1 555-0103", location: "Austin, TX", stage: "Interview 1", source: "Referral", applied: "Apr 7, 2023", avatar: "JW", avatarColor: "bg-green-100 text-green-700" },
  { id: 4, name: "Emily Chen", role: "Data Analyst", email: "e.chen@email.com", phone: "+1 555-0104", location: "Seattle, WA", stage: "Offer", source: "Job Board", applied: "Mar 28, 2023", avatar: "EC", avatarColor: "bg-orange-100 text-orange-700" },
  { id: 5, name: "Robert Brown", role: "UX Researcher", email: "r.brown@email.com", phone: "+1 555-0105", location: "Boston, MA", stage: "Applied", source: "LinkedIn", applied: "Apr 10, 2023", avatar: "RB", avatarColor: "bg-red-100 text-red-700" },
  { id: 6, name: "Sophia Lee", role: "DevOps Engineer", email: "s.lee@email.com", phone: "+1 555-0106", location: "Chicago, IL", stage: "Interview 1", source: "Direct", applied: "Apr 1, 2023", avatar: "SL", avatarColor: "bg-teal-100 text-teal-700" },
  { id: 7, name: "Daniel Martinez", role: "Backend Developer", email: "d.martinez@email.com", phone: "+1 555-0107", location: "Denver, CO", stage: "Screening", source: "Career Site", applied: "Apr 8, 2023", avatar: "DM", avatarColor: "bg-indigo-100 text-indigo-700" },
  { id: 8, name: "Olivia Taylor", role: "HR Business Partner", email: "o.taylor@email.com", phone: "+1 555-0108", location: "Atlanta, GA", stage: "Hired", source: "Referral", applied: "Mar 20, 2023", avatar: "OT", avatarColor: "bg-pink-100 text-pink-700" },
];

const stageColors: Record<string, string> = {
  Applied: "bg-gray-100 text-gray-600",
  Screening: "bg-yellow-100 text-yellow-700",
  "Interview 1": "bg-blue-100 text-blue-700",
  "Interview 2": "bg-blue-100 text-blue-700",
  Offer: "bg-purple-100 text-purple-700",
  Hired: "bg-green-100 text-green-700",
  Rejected: "bg-red-100 text-red-600",
};

const stages = ["All Stages", "Applied", "Screening", "Interview 1", "Interview 2", "Offer", "Hired"];

export function Candidates() {
  const [search, setSearch] = useState("");
  const [selectedStage, setSelectedStage] = useState("All Stages");

  const filtered = candidates.filter((c) => {
    const matchSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.role.toLowerCase().includes(search.toLowerCase());
    const matchStage = selectedStage === "All Stages" || c.stage === selectedStage;
    return matchSearch && matchStage;
  });

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        icon={Users}
        title="Candidates"
        subtitle="Manage and track all candidates in your recruiting pipeline"
        actions={
          <button className="flex items-center gap-1.5 bg-gray-900 text-white px-3 py-1.5 rounded-md text-[12px] font-medium hover:bg-gray-800 transition-colors">
            <Plus size={13} />
            Add Candidate
          </button>
        }
      />

      <div className="flex-1 p-6 overflow-y-auto">
        {/* Filters */}
        <div className="flex items-center gap-3 mb-5">
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-md px-3 py-1.5 flex-1 max-w-xs">
            <Search size={13} className="text-gray-400 shrink-0" />
            <input
              type="text"
              placeholder="Search candidates..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="text-[12px] text-gray-600 placeholder-gray-400 outline-none flex-1"
            />
          </div>
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-md px-3 py-1.5 cursor-pointer">
            <Filter size={13} className="text-gray-400" />
            <span className="text-[12px] text-gray-600">Filter</span>
          </div>
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-md px-3 py-1.5 cursor-pointer">
            <span className="text-[12px] text-gray-600">{selectedStage}</span>
            <ChevronDown size={13} className="text-gray-400" />
          </div>
          <div className="ml-auto text-[11px] text-gray-400">
            {filtered.length} candidate{filtered.length !== 1 ? "s" : ""}
          </div>
        </div>

        {/* Stage filter pills */}
        <div className="flex gap-2 mb-5 flex-wrap">
          {stages.map((stage) => (
            <button
              key={stage}
              onClick={() => setSelectedStage(stage)}
              className={`px-3 py-1 rounded-full text-[11px] font-medium transition-colors ${
                selectedStage === stage
                  ? "bg-blue-600 text-white"
                  : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {stage}
            </button>
          ))}
        </div>

        {/* Candidates Table */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left text-[11px] font-medium text-gray-500 px-4 py-3">Candidate</th>
                <th className="text-left text-[11px] font-medium text-gray-500 px-4 py-3">Contact</th>
                <th className="text-left text-[11px] font-medium text-gray-500 px-4 py-3">Location</th>
                <th className="text-left text-[11px] font-medium text-gray-500 px-4 py-3">Stage</th>
                <th className="text-left text-[11px] font-medium text-gray-500 px-4 py-3">Source</th>
                <th className="text-left text-[11px] font-medium text-gray-500 px-4 py-3">Applied</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((candidate, i) => (
                <tr
                  key={candidate.id}
                  className={`border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors ${
                    i === filtered.length - 1 ? "border-b-0" : ""
                  }`}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-7 h-7 rounded-full ${candidate.avatarColor} flex items-center justify-center shrink-0`}>
                        <span className="text-[9px] font-semibold">{candidate.avatar}</span>
                      </div>
                      <div>
                        <p className="text-[12px] font-medium text-gray-900">{candidate.name}</p>
                        <p className="text-[11px] text-gray-500">{candidate.role}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <Mail size={10} className="text-gray-400" />
                        <span className="text-[11px] text-gray-600">{candidate.email}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Phone size={10} className="text-gray-400" />
                        <span className="text-[11px] text-gray-600">{candidate.phone}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <MapPin size={10} className="text-gray-400" />
                      <span className="text-[11px] text-gray-600">{candidate.location}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium ${stageColors[candidate.stage] || "bg-gray-100 text-gray-600"}`}>
                      {candidate.stage}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-[11px] text-gray-600">{candidate.source}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-[11px] text-gray-500">{candidate.applied}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
