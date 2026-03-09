import { useState } from "react";
import {
  Search,
  Plus,
  MessageSquare,
  Inbox,
  Send,
  FileText,
  Archive,
  Edit2,
} from "lucide-react";

// ─── Types ─────────────────────────────────────────────────────────────────────

interface Message {
  id: string;
  sender: string;
  initials: string;
  color: string;
  subject: string;
  preview: string;
  shortTime: string;
  read: boolean;
  folder: "inbox" | "sent" | "drafts" | "archived";
}

// ─── Mock data (matching screenshot) ─────────────────────────────────────────

const MESSAGES: Message[] = [
  {
    id: "1",
    sender: "John Smith",
    initials: "JS",
    color: "bg-indigo-100 text-indigo-700",
    subject: "Interview Feedback",
    preview: "I wanted to share my thoughts on the...",
    shortTime: "Today",
    read: false,
    folder: "inbox",
  },
  {
    id: "2",
    sender: "Sarah Johnson",
    initials: "SJ",
    color: "bg-emerald-100 text-emerald-700",
    subject: "New candidate application",
    preview: "We received a promising application for t...",
    shortTime: "Yesterday",
    read: false,
    folder: "inbox",
  },
  {
    id: "3",
    sender: "Michael Green",
    initials: "MG",
    color: "bg-teal-100 text-teal-700",
    subject: "Meeting rescheduled",
    preview: "The hiring meeting has been moved to T...",
    shortTime: "May 10",
    read: true,
    folder: "inbox",
  },
  {
    id: "4",
    sender: "Cindy Davis",
    initials: "CD",
    color: "bg-rose-100 text-rose-700",
    subject: "Onboarding documents",
    preview: "Please find attached the onboarding doc...",
    shortTime: "May 9",
    read: true,
    folder: "inbox",
  },
  {
    id: "5",
    sender: "David Wilson",
    initials: "DW",
    color: "bg-blue-100 text-blue-700",
    subject: "Quarterly hiring report",
    preview: "Here is the Q2 hiring report with our pro...",
    shortTime: "May 8",
    read: true,
    folder: "inbox",
  },
  {
    id: "6",
    sender: "Lisa Taylor",
    initials: "LT",
    color: "bg-purple-100 text-purple-700",
    subject: "Candidate withdrew application",
    preview: "Unfortunately, the candidate for the UX ...",
    shortTime: "May 2",
    read: true,
    folder: "inbox",
  },
  {
    id: "7",
    sender: "Robert Morrison",
    initials: "RM",
    color: "bg-amber-100 text-amber-700",
    subject: "Interview scheduling",
    preview: "Can we schedule the technical interviews ...",
    shortTime: "May 1",
    read: true,
    folder: "inbox",
  },
];

const FOLDERS = [
  { key: "inbox",    label: "Inbox",    Icon: Inbox,    count: 16 },
  { key: "sent",     label: "Sent",     Icon: Send,     count: 8  },
  { key: "drafts",   label: "Drafts",   Icon: FileText, count: 3  },
  { key: "archived", label: "Archived", Icon: Archive,  count: 6  },
] as const;

type FolderKey = typeof FOLDERS[number]["key"];

// ─── Page ──────────────────────────────────────────────────────────────────────

const Messages = () => {
  const [activeFolder, setActiveFolder] = useState<FolderKey>("inbox");
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [search, setSearch] = useState("");

  const filtered = MESSAGES.filter(
    (m) =>
      m.folder === activeFolder &&
      (search === "" ||
        m.sender.toLowerCase().includes(search.toLowerCase()) ||
        m.subject.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="flex flex-col overflow-hidden" style={{ height: "calc(100vh - 56px)" }}>

      {/* ── Page header ── */}
      <div className="px-6 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
            <MessageSquare size={16} className="text-indigo-600" />
          </div>
          <div>
            <h1 className="text-gray-900" style={{ fontSize: 20, fontWeight: 600 }}>Messages</h1>
            <p className="text-gray-500 mt-0.5" style={{ fontSize: 13 }}>
              Communicate with candidates, interviewers, and team members
            </p>
          </div>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg transition-all">
          <Plus size={15} />
          <span style={{ fontSize: 13, fontWeight: 500 }}>Compose</span>
        </button>
      </div>

      {/* ── 2-col content ── */}
      <div className="flex flex-1 min-h-0 border-t border-gray-200">

        {/* Left panel: search + folders + thread list */}
        <div className="w-72 shrink-0 border-r border-gray-200 bg-white flex flex-col min-h-0">

          {/* Search */}
          <div className="p-3 border-b border-gray-100 shrink-0">
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search messages..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20 text-gray-700 placeholder-gray-400"
                style={{ fontSize: 12 }}
              />
            </div>
          </div>

          {/* Folders */}
          <div className="p-2 border-b border-gray-100 shrink-0">
            {FOLDERS.map(({ key, label, Icon, count }) => (
              <button
                key={key}
                onClick={() => { setActiveFolder(key); setSelectedMessage(null); }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all ${
                  activeFolder === key
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
                style={{ fontSize: 13, fontWeight: activeFolder === key ? 600 : 400 }}
              >
                <div className="flex items-center gap-2">
                  <Icon size={14} />
                  <span>{label}</span>
                </div>
                <span
                  className={`px-1.5 py-0.5 rounded-full ${
                    activeFolder === key
                      ? "bg-indigo-200 text-indigo-700"
                      : "bg-gray-100 text-gray-500"
                  }`}
                  style={{ fontSize: 11, fontWeight: 600 }}
                >
                  {count}
                </span>
              </button>
            ))}
          </div>

          {/* Thread list */}
          <div className="flex-1 overflow-y-auto min-h-0">
            {filtered.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <p className="text-gray-400" style={{ fontSize: 13 }}>No messages</p>
              </div>
            ) : (
              filtered.map((msg) => (
                <button
                  key={msg.id}
                  onClick={() => setSelectedMessage(msg)}
                  className={`w-full text-left px-4 py-3.5 border-b border-gray-50 hover:bg-gray-50 transition-all ${
                    selectedMessage?.id === msg.id
                      ? "bg-indigo-50 border-l-2 border-l-indigo-500"
                      : ""
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <div className={`w-8 h-8 rounded-full ${msg.color} flex items-center justify-center shrink-0 mt-0.5`}>
                      <span style={{ fontSize: 11, fontWeight: 700 }}>{msg.initials}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span
                          className="text-gray-900 truncate"
                          style={{ fontSize: 13, fontWeight: msg.read ? 400 : 700 }}
                        >
                          {msg.sender}
                        </span>
                        <div className="flex items-center gap-1.5 shrink-0 ml-1">
                          <span style={{ fontSize: 10 }} className="text-gray-400">
                            {msg.shortTime}
                          </span>
                          {!msg.read && (
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                          )}
                        </div>
                      </div>
                      <p
                        className="text-indigo-600 truncate"
                        style={{ fontSize: 12, fontWeight: msg.read ? 400 : 600 }}
                      >
                        {msg.subject}
                      </p>
                      <p className="text-gray-400 truncate" style={{ fontSize: 11 }}>
                        {msg.preview}
                      </p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Right panel: empty state or message detail */}
        <div className="flex-1 bg-white flex flex-col items-center justify-center">
          {selectedMessage ? (
            <div className="w-full h-full flex flex-col">
              <div className="px-6 py-4 border-b border-gray-100">
                <p className="text-gray-900" style={{ fontSize: 16, fontWeight: 600 }}>
                  {selectedMessage.subject}
                </p>
                <div className="flex items-center gap-2.5 mt-2">
                  <div className={`w-7 h-7 rounded-full ${selectedMessage.color} flex items-center justify-center shrink-0`}>
                    <span style={{ fontSize: 10, fontWeight: 700 }}>{selectedMessage.initials}</span>
                  </div>
                  <p className="text-gray-500" style={{ fontSize: 13 }}>
                    {selectedMessage.sender} · {selectedMessage.shortTime}
                  </p>
                </div>
              </div>
              <div className="flex-1 flex items-center justify-center">
                <p className="text-gray-400" style={{ fontSize: 13 }}>
                  Select a different message or compose a reply.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center mb-4">
                <MessageSquare size={22} className="text-gray-400" />
              </div>
              <p className="text-gray-900" style={{ fontSize: 15, fontWeight: 600 }}>
                No message selected
              </p>
              <p className="text-gray-400 mt-1" style={{ fontSize: 13 }}>
                Select a message to view its contents
              </p>
              <button
                className="mt-4 flex items-center gap-2 text-indigo-600 hover:text-indigo-700 transition-colors"
                style={{ fontSize: 13 }}
              >
                <Edit2 size={14} />
                Compose new message
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;
