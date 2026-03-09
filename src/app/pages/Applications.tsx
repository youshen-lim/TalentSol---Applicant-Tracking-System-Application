import { FileText, Plus, Search, ChevronDown } from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { useState } from "react";

const applications = [
  { id: 1, candidate: "Alex Johnson", avatar: "AJ", ac: "bg-blue-100 text-blue-700", role: "Senior Frontend Developer", dept: "Engineering", applied: "Apr 2, 2023", stage: "Interview 2", score: 88, source: "LinkedIn" },
  { id: 2, candidate: "Maria Garcia", avatar: "MG", ac: "bg-purple-100 text-purple-700", role: "Product Designer", dept: "Design", applied: "Apr 5, 2023", stage: "Screening", score: 74, source: "Career Site" },
  { id: 3, candidate: "James Wilson", avatar: "JW", ac: "bg-green-100 text-green-700", role: "Marketing Manager", dept: "Marketing", applied: "Apr 7, 2023", stage: "Interview 1", score: 81, source: "Referral" },
  { id: 4, candidate: "Emily Chen", avatar: "EC", ac: "bg-orange-100 text-orange-700", role: "Data Analyst", dept: "Analytics", applied: "Mar 28, 2023", stage: "Offer", score: 93, source: "Job Board" },
  { id: 5, candidate: "Robert Brown", avatar: "RB", ac: "bg-red-100 text-red-700", role: "UX Researcher", dept: "Design", applied: "Apr 10, 2023", stage: "Applied", score: 67, source: "LinkedIn" },
  { id: 6, candidate: "Sophia Lee", avatar: "SL", ac: "bg-teal-100 text-teal-700", role: "DevOps Engineer", dept: "Engineering", applied: "Apr 1, 2023", stage: "Interview 1", score: 79, source: "Direct" },
  { id: 7, candidate: "Daniel Martinez", avatar: "DM", ac: "bg-indigo-100 text-indigo-700", role: "Backend Developer", dept: "Engineering", applied: "Apr 8, 2023", stage: "Screening", score: 72, source: "Career Site" },
  { id: 8, candidate: "Olivia Taylor", avatar: "OT", ac: "bg-pink-100 text-pink-700", role: "HR Business Partner", dept: "Human Resources", applied: "Mar 20, 2023", stage: "Hired", score: 91, source: "Referral" },
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

const kanbanStages = ["Applied", "Screening", "Interview 1", "Interview 2", "Offer", "Hired"];

export function Applications() {
  const [view, setView] = useState<"list" | "kanban">("list");
  const [search, setSearch] = useState("");

  const filtered = applications.filter(
    (a) =>
      a.candidate.toLowerCase().includes(search.toLowerCase()) ||
      a.role.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        icon={FileText}
        iconColor="text-purple-600"
        iconBg="bg-purple-50"
        title="Application Management"
        subtitle="Review and manage all incoming job applications"
        actions={
          <>
            <div className="flex items-center border border-gray-200 rounded-md overflow-hidden bg-white">
              <button
                onClick={() => setView("list")}
                className={`px-3 py-1.5 text-[11px] font-medium transition-colors ${view === "list" ? "bg-gray-900 text-white" : "text-gray-600 hover:bg-gray-50"}`}
              >
                List
              </button>
              <button
                onClick={() => setView("kanban")}
                className={`px-3 py-1.5 text-[11px] font-medium transition-colors ${view === "kanban" ? "bg-gray-900 text-white" : "text-gray-600 hover:bg-gray-50"}`}
              >
                Kanban
              </button>
            </div>
            <button className="flex items-center gap-1.5 bg-gray-900 text-white px-3 py-1.5 rounded-md text-[12px] font-medium hover:bg-gray-800 transition-colors">
              <Plus size={13} />
              New Application
            </button>
          </>
        }
      />

      <div className="flex-1 p-6 overflow-y-auto">
        {/* Search row */}
        <div className="flex items-center gap-3 mb-5">
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-md px-3 py-1.5 flex-1 max-w-xs">
            <Search size={13} className="text-gray-400" />
            <input
              type="text"
              placeholder="Search applications..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="text-[12px] text-gray-600 placeholder-gray-400 outline-none flex-1"
            />
          </div>
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-md px-3 py-1.5 cursor-pointer">
            <span className="text-[12px] text-gray-600">All Departments</span>
            <ChevronDown size={13} className="text-gray-400" />
          </div>
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-md px-3 py-1.5 cursor-pointer">
            <span className="text-[12px] text-gray-600">All Stages</span>
            <ChevronDown size={13} className="text-gray-400" />
          </div>
          <span className="text-[11px] text-gray-400 ml-auto">{filtered.length} applications</span>
        </div>

        {view === "list" ? (
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left text-[11px] font-medium text-gray-500 px-4 py-3">Candidate</th>
                  <th className="text-left text-[11px] font-medium text-gray-500 px-4 py-3">Position</th>
                  <th className="text-left text-[11px] font-medium text-gray-500 px-4 py-3">Applied</th>
                  <th className="text-left text-[11px] font-medium text-gray-500 px-4 py-3">Stage</th>
                  <th className="text-left text-[11px] font-medium text-gray-500 px-4 py-3">Score</th>
                  <th className="text-left text-[11px] font-medium text-gray-500 px-4 py-3">Source</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((app, i) => (
                  <tr key={app.id} className={`border-b border-gray-50 hover:bg-gray-50 cursor-pointer ${i === filtered.length - 1 ? "border-b-0" : ""}`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-7 h-7 rounded-full ${app.ac} flex items-center justify-center shrink-0`}>
                          <span className="text-[9px] font-semibold">{app.avatar}</span>
                        </div>
                        <span className="text-[12px] font-medium text-gray-900">{app.candidate}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-[12px] text-gray-800">{app.role}</p>
                      <p className="text-[11px] text-gray-500">{app.dept}</p>
                    </td>
                    <td className="px-4 py-3 text-[11px] text-gray-500">{app.applied}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium ${stageColors[app.stage]}`}>{app.stage}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500 rounded-full" style={{ width: `${app.score}%` }} />
                        </div>
                        <span className="text-[11px] text-gray-600">{app.score}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[11px] text-gray-600">{app.source}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex gap-3 overflow-x-auto pb-2">
            {kanbanStages.map((stage) => {
              const stageApps = filtered.filter((a) => a.stage === stage);
              return (
                <div key={stage} className="min-w-[180px] flex-shrink-0">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-medium text-gray-700">{stage}</span>
                    <span className="text-[10px] text-gray-400 bg-gray-100 rounded-full px-1.5 py-0.5">{stageApps.length}</span>
                  </div>
                  <div className="space-y-2">
                    {stageApps.map((app) => (
                      <div key={app.id} className="bg-white border border-gray-200 rounded-lg p-3 cursor-pointer hover:shadow-sm transition-shadow">
                        <div className="flex items-center gap-2 mb-2">
                          <div className={`w-6 h-6 rounded-full ${app.ac} flex items-center justify-center shrink-0`}>
                            <span className="text-[8px] font-semibold">{app.avatar}</span>
                          </div>
                          <span className="text-[11px] font-medium text-gray-900 truncate">{app.candidate}</span>
                        </div>
                        <p className="text-[10px] text-gray-500 truncate">{app.role}</p>
                        <p className="text-[10px] text-gray-400 mt-1">{app.applied}</p>
                      </div>
                    ))}
                    {stageApps.length === 0 && (
                      <div className="bg-gray-50 border border-dashed border-gray-200 rounded-lg p-4 text-center">
                        <p className="text-[10px] text-gray-400">No applications</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
