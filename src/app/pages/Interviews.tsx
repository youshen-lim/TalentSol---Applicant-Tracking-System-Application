import { Calendar, Plus, Clock, Video, MapPin, User } from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { useState } from "react";

const interviews = [
  { id: 1, candidate: "Sarah Miller", avatar: "SM", ac: "bg-blue-100 text-blue-700", role: "Frontend Engineer", interviewer: "Tom Roberts", date: "Mar 3, 2026", time: "2:00 PM", duration: "45 min", type: "Video Call", stage: "Interview 1", status: "Upcoming" },
  { id: 2, candidate: "David Park", avatar: "DP", ac: "bg-green-100 text-green-700", role: "Backend Developer", interviewer: "Lisa Chang", date: "Mar 3, 2026", time: "4:30 PM", duration: "60 min", type: "Video Call", stage: "Interview 2", status: "Upcoming" },
  { id: 3, candidate: "Lisa Turner", avatar: "LT", ac: "bg-purple-100 text-purple-700", role: "Product Manager", interviewer: "Ryan Scott", date: "Mar 4, 2026", time: "10:00 AM", duration: "45 min", type: "In-Person", stage: "Interview 1", status: "Scheduled" },
  { id: 4, candidate: "Mark Anderson", avatar: "MA", ac: "bg-orange-100 text-orange-700", role: "DevOps Engineer", interviewer: "Nancy Kim", date: "Mar 4, 2026", time: "1:00 PM", duration: "30 min", type: "Phone Screen", stage: "Screening", status: "Scheduled" },
  { id: 5, candidate: "Emma Wilson", avatar: "EW", ac: "bg-pink-100 text-pink-700", role: "UX Designer", interviewer: "Chris Baker", date: "Mar 5, 2026", time: "11:00 AM", duration: "60 min", type: "Video Call", stage: "Interview 2", status: "Scheduled" },
  { id: 6, candidate: "James Lee", avatar: "JL", ac: "bg-teal-100 text-teal-700", role: "Data Scientist", interviewer: "Tom Roberts", date: "Feb 28, 2026", time: "3:00 PM", duration: "45 min", type: "Video Call", stage: "Interview 1", status: "Completed" },
  { id: 7, candidate: "Anna Brown", avatar: "AB", ac: "bg-red-100 text-red-700", role: "Marketing Analyst", interviewer: "Lisa Chang", date: "Feb 27, 2026", time: "10:00 AM", duration: "30 min", type: "Phone Screen", stage: "Screening", status: "Completed" },
];

const statusColors: Record<string, string> = {
  Upcoming: "bg-blue-100 text-blue-700",
  Scheduled: "bg-yellow-100 text-yellow-700",
  Completed: "bg-green-100 text-green-700",
  Cancelled: "bg-red-100 text-red-600",
};

const tabs = ["All", "Upcoming", "Scheduled", "Completed"];

export function Interviews() {
  const [activeTab, setActiveTab] = useState("All");

  const filtered = activeTab === "All" ? interviews : interviews.filter((i) => i.status === activeTab);

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        icon={Calendar}
        iconColor="text-purple-600"
        iconBg="bg-purple-50"
        title="Interviews"
        subtitle="Schedule and manage candidate interviews across all stages"
        actions={
          <button className="flex items-center gap-1.5 bg-gray-900 text-white px-3 py-1.5 rounded-md text-[12px] font-medium hover:bg-gray-800 transition-colors">
            <Plus size={13} />
            Schedule Interview
          </button>
        }
      />

      <div className="flex-1 p-6 overflow-y-auto">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: "Today's Interviews", value: "2", color: "text-blue-600" },
            { label: "This Week", value: "5", color: "text-purple-600" },
            { label: "Completed", value: "2", color: "text-green-600" },
            { label: "Avg. Duration", value: "48 min", color: "text-orange-600" },
          ].map((s) => (
            <div key={s.label} className="bg-white border border-gray-200 rounded-lg p-4">
              <p className={`text-[22px] font-semibold ${s.color} leading-none mb-1`}>{s.value}</p>
              <p className="text-[11px] text-gray-500">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-5 border-b border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-[12px] font-medium border-b-2 transition-colors ${
                activeTab === tab
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab}
              <span className="ml-1.5 text-[10px] text-gray-400">
                ({tab === "All" ? interviews.length : interviews.filter((i) => i.status === tab).length})
              </span>
            </button>
          ))}
        </div>

        {/* Interview Cards */}
        <div className="space-y-3">
          {filtered.map((interview) => (
            <div key={interview.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow cursor-pointer">
              <div className="flex items-start gap-4">
                <div className={`w-8 h-8 rounded-full ${interview.ac} flex items-center justify-center shrink-0`}>
                  <span className="text-[10px] font-semibold">{interview.avatar}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-[13px] font-semibold text-gray-900">{interview.candidate}</p>
                      <p className="text-[11px] text-gray-500">{interview.role} · {interview.stage}</p>
                    </div>
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium ${statusColors[interview.status]}`}>
                      {interview.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-[11px] text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar size={11} />
                      {interview.date}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock size={11} />
                      {interview.time} · {interview.duration}
                    </div>
                    <div className="flex items-center gap-1">
                      {interview.type === "Video Call" ? <Video size={11} /> : interview.type === "In-Person" ? <MapPin size={11} /> : <Clock size={11} />}
                      {interview.type}
                    </div>
                    <div className="flex items-center gap-1">
                      <User size={11} />
                      {interview.interviewer}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
