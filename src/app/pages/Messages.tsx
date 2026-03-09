import { MessageSquare, Plus, Search, Inbox, Send, FileEdit, Archive, PenSquare } from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { useState } from "react";

const messages = [
  { id: 1, from: "John Smith", avatar: "JS", ac: "bg-blue-100 text-blue-700", subject: "Interview Feedback", preview: "I wanted to share my thoughts on the candidate...", time: "Today, 10:35 AM", unread: true, folder: "Inbox" },
  { id: 2, from: "Sarah Johnson", avatar: "SJ", ac: "bg-purple-100 text-purple-700", subject: "New candidate application", preview: "We received a promising application for the Sen...", time: "Yesterday, 3:46 PM", unread: false, folder: "Inbox" },
  { id: 3, from: "Michael Green", avatar: "MG", ac: "bg-green-100 text-green-700", subject: "Meeting rescheduled", preview: "The hiring meeting has been moved to Thursday ...", time: "May 10, 2023", unread: false, folder: "Inbox" },
  { id: 4, from: "Cindy Davis", avatar: "CD", ac: "bg-orange-100 text-orange-700", subject: "Onboarding documents", preview: "Please find attached the onboarding documents ...", time: "May 9, 2023", unread: false, folder: "Inbox" },
  { id: 5, from: "David Wilson", avatar: "DW", ac: "bg-teal-100 text-teal-700", subject: "Quarterly hiring report", preview: "Here is the Q2 hiring report with our progress ag...", time: "May 8, 2023", unread: false, folder: "Inbox" },
  { id: 6, from: "Lisa Taylor", avatar: "LT", ac: "bg-red-100 text-red-700", subject: "Candidate withdrew application", preview: "Unfortunately, the candidate for the UX Designer...", time: "May 2, 2023", unread: false, folder: "Inbox" },
  { id: 7, from: "Robert Morrison", avatar: "RM", ac: "bg-indigo-100 text-indigo-700", subject: "Interview scheduling", preview: "Can we schedule the technical interviews for Ne...", time: "May 1, 2023", unread: false, folder: "Inbox" },
  { id: 8, from: "HR Team", avatar: "HR", ac: "bg-pink-100 text-pink-700", subject: "Offer letter template", preview: "I've updated the offer letter template for Q2...", time: "Apr 28, 2023", unread: false, folder: "Sent" },
  { id: 9, from: "Engineering Leads", avatar: "EL", ac: "bg-yellow-100 text-yellow-700", subject: "Headcount planning", preview: "Sharing the revised headcount plan for Q3...", time: "Apr 25, 2023", unread: false, folder: "Sent" },
  { id: 10, from: "John Smith", avatar: "JS", ac: "bg-blue-100 text-blue-700", subject: "Follow-up on candidate", preview: "Draft: Following up on the candidate we discussed...", time: "Apr 22, 2023", unread: false, folder: "Drafts" },
];

const folders = [
  { label: "Inbox", icon: Inbox, key: "Inbox", count: 16 },
  { label: "Sent", icon: Send, key: "Sent", count: 8 },
  { label: "Drafts", icon: FileEdit, key: "Drafts", count: 3 },
  { label: "Archived", icon: Archive, key: "Archived", count: 6 },
];

export function Messages() {
  const [activeFolder, setActiveFolder] = useState("Inbox");
  const [selectedMessage, setSelectedMessage] = useState<number | null>(null);
  const [search, setSearch] = useState("");

  const folderMessages = messages.filter((m) => m.folder === activeFolder);
  const displayed = folderMessages.filter(
    (m) =>
      m.subject.toLowerCase().includes(search.toLowerCase()) ||
      m.from.toLowerCase().includes(search.toLowerCase())
  );

  const selected = messages.find((m) => m.id === selectedMessage);

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        icon={MessageSquare}
        iconColor="text-blue-600"
        iconBg="bg-blue-50"
        title="Messages"
        subtitle="Communicate with candidates, interviewers, and team members"
        actions={
          <button className="flex items-center gap-1.5 bg-gray-900 text-white px-3 py-1.5 rounded-md text-[12px] font-medium hover:bg-gray-800 transition-colors">
            <Plus size={13} />
            Compose
          </button>
        }
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar folders */}
        <div className="w-[160px] bg-white border-r border-gray-200 flex flex-col shrink-0">
          <div className="p-3">
            <div className="flex items-center gap-2 bg-gray-100 rounded-md px-2.5 py-1.5">
              <Search size={12} className="text-gray-400" />
              <input
                type="text"
                placeholder="Search messages"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="text-[11px] bg-transparent text-gray-600 placeholder-gray-400 outline-none flex-1 min-w-0"
              />
            </div>
          </div>
          <nav className="px-2 space-y-0.5">
            {folders.map((folder) => {
              const Icon = folder.icon;
              return (
                <button
                  key={folder.key}
                  onClick={() => { setActiveFolder(folder.key); setSelectedMessage(null); }}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md transition-colors ${
                    activeFolder === folder.key ? "bg-blue-50 text-blue-700" : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon size={13} />
                    <span className="text-[12px] font-medium">{folder.label}</span>
                  </div>
                  <span className={`text-[10px] ${activeFolder === folder.key ? "text-blue-600" : "text-gray-400"}`}>
                    {folder.count}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Message list */}
        <div className="w-[260px] bg-white border-r border-gray-200 flex flex-col shrink-0 overflow-y-auto">
          {displayed.length === 0 ? (
            <div className="flex-1 flex items-center justify-center p-6 text-center">
              <p className="text-[12px] text-gray-400">No messages found</p>
            </div>
          ) : (
            displayed.map((msg) => (
              <button
                key={msg.id}
                onClick={() => setSelectedMessage(msg.id)}
                className={`flex items-start gap-2.5 p-3 border-b border-gray-100 text-left hover:bg-gray-50 transition-colors ${
                  selectedMessage === msg.id ? "bg-blue-50" : ""
                }`}
              >
                <div className={`w-7 h-7 rounded-full ${msg.ac} flex items-center justify-center shrink-0 mt-0.5`}>
                  <span className="text-[9px] font-semibold">{msg.avatar}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className={`text-[12px] truncate ${msg.unread ? "font-semibold text-gray-900" : "font-medium text-gray-700"}`}>
                      {msg.from}
                    </span>
                    <span className="text-[10px] text-gray-400 shrink-0 ml-1">{msg.time.split(",")[0]}</span>
                  </div>
                  <p className={`text-[11px] truncate ${msg.unread ? "font-medium text-gray-800" : "text-gray-600"}`}>{msg.subject}</p>
                  <p className="text-[10px] text-gray-400 truncate">{msg.preview}</p>
                </div>
                {msg.unread && <div className="w-1.5 h-1.5 bg-blue-600 rounded-full shrink-0 mt-1.5" />}
              </button>
            ))
          )}
        </div>

        {/* Message detail */}
        <div className="flex-1 bg-gray-50 flex flex-col">
          {selected ? (
            <div className="flex flex-col h-full">
              <div className="bg-white border-b border-gray-200 px-6 py-4">
                <h2 className="text-[14px] font-semibold text-gray-900 mb-1">{selected.subject}</h2>
                <div className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded-full ${selected.ac} flex items-center justify-center`}>
                    <span className="text-[8px] font-semibold">{selected.avatar}</span>
                  </div>
                  <span className="text-[11px] text-gray-600">{selected.from}</span>
                  <span className="text-[11px] text-gray-400">· {selected.time}</span>
                </div>
              </div>
              <div className="flex-1 p-6">
                <div className="bg-white rounded-lg border border-gray-200 p-5">
                  <p className="text-[13px] text-gray-700 leading-relaxed">{selected.preview}</p>
                  <p className="text-[13px] text-gray-700 leading-relaxed mt-4">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation.
                  </p>
                  <p className="text-[13px] text-gray-700 mt-4">Best regards,<br />{selected.from}</p>
                </div>
              </div>
              <div className="p-4 bg-white border-t border-gray-200">
                <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5">
                  <input className="flex-1 bg-transparent text-[12px] text-gray-600 placeholder-gray-400 outline-none" placeholder="Type your reply..." />
                  <button className="bg-blue-600 text-white px-3 py-1 rounded-md text-[11px] font-medium hover:bg-blue-700 transition-colors">Reply</button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                <MessageSquare size={20} className="text-gray-400" />
              </div>
              <p className="text-[13px] font-medium text-gray-600 mb-1">No message selected</p>
              <p className="text-[11px] text-gray-400 mb-4">Select a message to view its contents</p>
              <button className="flex items-center gap-1.5 text-blue-600 text-[12px] hover:underline">
                <PenSquare size={13} />
                Compose new message
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
