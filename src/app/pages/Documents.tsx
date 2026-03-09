import { File, Plus, Search, Filter, Send, Pen, CheckCircle, Eye, Bot, X, type LucideIcon } from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { useState } from "react";

const documents = [
  { id: 1, title: "Non-Disclosure Agreement", person: "Bruce Bryant", avatar: "BB", ac: "bg-blue-100 text-blue-700", sent: "Sent on Apr 8, 2023", due: "Due Apr 18, 2023", status: "Sent" },
  { id: 2, title: "Offer Letter – Senior Developer", person: "Bruce Bryant", avatar: "BB", ac: "bg-blue-100 text-blue-700", sent: "Updated on Apr 7, 2023", due: null, status: "Pending" },
  { id: 3, title: "Employment Contract", person: "Bruce Bryant", avatar: "BB", ac: "bg-blue-100 text-blue-700", sent: "Updated on Apr 7, 2023", due: null, status: "Pending" },
  { id: 4, title: "Background Check Authorization", person: "Sara Henderson", avatar: "SH", ac: "bg-purple-100 text-purple-700", sent: "Signed on Apr 9, 2023", due: null, status: "Signed" },
  { id: 5, title: "W-4 Tax Form", person: "Sara Henderson", avatar: "SH", ac: "bg-purple-100 text-purple-700", sent: "Updated on Apr 7, 2023", due: "Due Apr 14, 2023", status: "Viewed" },
  { id: 6, title: "I-9 Employment Eligibility", person: "James Kim", avatar: "JK", ac: "bg-green-100 text-green-700", sent: "Sent on Apr 10, 2023", due: "Due Apr 20, 2023", status: "Sent" },
  { id: 7, title: "Direct Deposit Form", person: "Maria Reyes", avatar: "MR", ac: "bg-orange-100 text-orange-700", sent: "Signed on Apr 6, 2023", due: null, status: "Signed" },
];

const statusColors: Record<string, string> = {
  Sent: "text-blue-600",
  Pending: "text-yellow-600",
  Signed: "text-green-600",
  Viewed: "text-gray-500",
  "Action Required": "text-red-600",
};

const statusIcons: Record<string, LucideIcon> = {
  Sent: Send,
  Pending: Pen,
  Signed: CheckCircle,
  Viewed: Eye,
};

const tabs = ["All", "Pending", "Sent", "Signed", "Action Required"];

const aiMessages = [
  {
    role: "assistant",
    content: "Hello! I'm your document assistant. You can ask me about document status, request updates, or get information about document workflows.",
    time: "4:00 PM",
  },
];

export function Documents() {
  const [activeTab, setActiveTab] = useState("All");
  const [showAI, setShowAI] = useState(true);
  const [aiInput, setAiInput] = useState("");
  const [search, setSearch] = useState("");

  const filtered = documents.filter((d) => {
    const matchTab = activeTab === "All" || d.status === activeTab;
    const matchSearch = d.title.toLowerCase().includes(search.toLowerCase()) || d.person.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        icon={File}
        iconColor="text-blue-600"
        iconBg="bg-blue-50"
        title="Documents"
        subtitle="Manage document workflows with candidates and employees"
        actions={
          <button className="flex items-center gap-1.5 bg-gray-900 text-white px-3 py-1.5 rounded-md text-[12px] font-medium hover:bg-gray-800 transition-colors">
            <Plus size={13} />
            Request Document
          </button>
        }
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Search + filter bar */}
          <div className="bg-white border-b border-gray-200 px-5 py-3">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex items-center gap-2 bg-gray-100 rounded-md px-3 py-1.5 flex-1 max-w-xs">
                <Search size={13} className="text-gray-400" />
                <input
                  type="text"
                  placeholder="Search documents..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="text-[12px] bg-transparent text-gray-600 placeholder-gray-400 outline-none flex-1"
                />
              </div>
              <button className="flex items-center gap-1.5 border border-gray-200 bg-white px-3 py-1.5 rounded-md text-[12px] text-gray-600 hover:bg-gray-50 transition-colors">
                <Filter size={12} />
                Filter
              </button>
            </div>
            <div className="flex border-b border-gray-100 -mb-3">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-1.5 text-[12px] font-medium border-b-2 transition-colors ${
                    activeTab === tab
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Document list */}
          <div className="flex-1 overflow-y-auto bg-white">
            {filtered.map((doc) => {
              const StatusIcon = statusIcons[doc.status] || Send;
              return (
                <div key={doc.id} className="flex items-center gap-3 px-5 py-3.5 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors">
                  <div className={`w-7 h-7 rounded-full ${doc.ac} flex items-center justify-center shrink-0`}>
                    <span className="text-[9px] font-semibold">{doc.avatar}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-gray-900">{doc.title}</p>
                    <p className="text-[11px] text-gray-500">{doc.person}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-[10px] text-gray-400">{doc.sent}</span>
                      {doc.due && <span className="text-[10px] text-orange-500">⏰ {doc.due}</span>}
                    </div>
                  </div>
                  <div className={`flex items-center gap-1 ${statusColors[doc.status]}`}>
                    <StatusIcon size={12} />
                    <span className="text-[11px] font-medium">{doc.status}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* AI Assistant Panel */}
        {showAI && (
          <div className="w-[300px] bg-white border-l border-gray-200 flex flex-col shrink-0">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-blue-100 rounded-md flex items-center justify-center">
                  <Bot size={14} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-[12px] font-semibold text-gray-900">Document Assistant</p>
                  <p className="text-[10px] text-gray-400">Ask about document status, workflows, or request actions</p>
                </div>
              </div>
              <button onClick={() => setShowAI(false)} className="text-gray-400 hover:text-gray-600">
                <X size={14} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {aiMessages.map((msg, i) => (
                <div key={i} className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                  {msg.role === "assistant" && (
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                      <Bot size={12} className="text-blue-600" />
                    </div>
                  )}
                  <div className={`max-w-[200px] ${msg.role === "assistant" ? "" : "ml-auto"}`}>
                    <div className={`rounded-lg px-3 py-2 ${msg.role === "assistant" ? "bg-gray-100" : "bg-blue-600"}`}>
                      <p className={`text-[11px] leading-snug ${msg.role === "assistant" ? "text-gray-700" : "text-white"}`}>{msg.content}</p>
                    </div>
                    <p className="text-[10px] text-gray-400 mt-0.5 px-1">Assistant · {msg.time}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 border-t border-gray-100">
              <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                <input
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 bg-transparent text-[11px] text-gray-600 placeholder-gray-400 outline-none"
                />
                <button className="bg-blue-600 text-white w-6 h-6 rounded-md flex items-center justify-center hover:bg-blue-700 transition-colors">
                  <Send size={10} />
                </button>
              </div>
              <p className="text-[9px] text-gray-400 text-center mt-1.5">Powered by Claude AI · Ask about document status, workflows, or request actions</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}