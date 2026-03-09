import React, { useState } from 'react';
import {
  Search,
  Filter,
  Plus,
  FileText,
  Send,
  Clock,
  CheckCircle2,
  Eye,
  X,
  Brain,
  Pencil,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import DocumentRequestForm from "@/components/documents/DocumentRequestForm";
import { toast } from "sonner";
import { generateId } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

export type DocumentStatus = 'pending' | 'sent' | 'viewed' | 'signed' | 'rejected' | 'expired';
export type DocumentType = 'offer_letter' | 'contract' | 'nda' | 'background_check' | 'tax_form' | 'other';

export interface Document {
  id: string;
  title: string;
  type: DocumentType;
  candidateId: string;
  candidateName: string;
  status: DocumentStatus;
  createdAt: Date;
  updatedAt: Date;
  dueDate?: Date;
  signedAt?: Date;
  fileUrl?: string;
  notes?: string;
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const mockDocuments: Document[] = [
  {
    id: generateId(),
    title: 'Non-Disclosure Agreement',
    type: 'nda',
    candidateId: '1',
    candidateName: 'Bruce Bryant',
    status: 'sent',
    createdAt: new Date('2023-04-08'),
    updatedAt: new Date('2023-04-08'),
    dueDate: new Date('2023-04-18'),
  },
  {
    id: generateId(),
    title: 'Offer Letter – Senior Developer',
    type: 'offer_letter',
    candidateId: '1',
    candidateName: 'Bruce Bryant',
    status: 'pending',
    createdAt: new Date('2023-04-07'),
    updatedAt: new Date('2023-04-07'),
  },
  {
    id: generateId(),
    title: 'Employment Contract',
    type: 'contract',
    candidateId: '1',
    candidateName: 'Bruce Bryant',
    status: 'pending',
    createdAt: new Date('2023-04-07'),
    updatedAt: new Date('2023-04-07'),
  },
  {
    id: generateId(),
    title: 'Background Check Authorization',
    type: 'background_check',
    candidateId: '2',
    candidateName: 'Sara Henderson',
    status: 'signed',
    createdAt: new Date('2023-04-05'),
    updatedAt: new Date('2023-04-09'),
    signedAt: new Date('2023-04-09'),
  },
  {
    id: generateId(),
    title: 'W-4 Tax Form',
    type: 'tax_form',
    candidateId: '2',
    candidateName: 'Sara Henderson',
    status: 'viewed',
    createdAt: new Date('2023-04-06'),
    updatedAt: new Date('2023-04-07'),
    dueDate: new Date('2023-04-14'),
  },
  {
    id: generateId(),
    title: 'I-9 Employment Eligibility',
    type: 'other',
    candidateId: '3',
    candidateName: 'James Kim',
    status: 'sent',
    createdAt: new Date('2023-04-10'),
    updatedAt: new Date('2023-04-10'),
    dueDate: new Date('2023-04-20'),
  },
  {
    id: generateId(),
    title: 'Direct Deposit Form',
    type: 'other',
    candidateId: '4',
    candidateName: 'Maria Reyes',
    status: 'signed',
    createdAt: new Date('2023-04-06'),
    updatedAt: new Date('2023-04-08'),
    signedAt: new Date('2023-04-08'),
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const AVATAR_COLORS = [
  'bg-indigo-100 text-indigo-700',
  'bg-emerald-100 text-emerald-700',
  'bg-amber-100 text-amber-700',
  'bg-rose-100 text-rose-700',
  'bg-purple-100 text-purple-700',
  'bg-teal-100 text-teal-700',
  'bg-cyan-100 text-cyan-700',
];

function getAvatarColor(name: string) {
  const hash = name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

function getInitials(name: string) {
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
}

function formatDate(d: Date) {
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// ─── Status config ────────────────────────────────────────────────────────────

const statusConfig: Record<DocumentStatus, { icon: React.ElementType; color: string; bg: string; label: string }> = {
  sent:     { icon: Send,         color: 'text-blue-700',    bg: 'bg-blue-50',    label: 'Sent' },
  pending:  { icon: Pencil,       color: 'text-amber-700',   bg: 'bg-amber-50',   label: 'Pending' },
  signed:   { icon: CheckCircle2, color: 'text-emerald-700', bg: 'bg-emerald-50', label: 'Signed' },
  viewed:   { icon: Eye,          color: 'text-gray-600',    bg: 'bg-gray-100',   label: 'Viewed' },
  rejected: { icon: X,            color: 'text-red-700',     bg: 'bg-red-50',     label: 'Rejected' },
  expired:  { icon: Clock,        color: 'text-gray-600',    bg: 'bg-gray-100',   label: 'Expired' },
};

const TABS = ['All', 'Pending', 'Sent', 'Signed', 'Action Required'] as const;
type TabValue = typeof TABS[number];

// ─── Chat ─────────────────────────────────────────────────────────────────────

interface ChatMessage { role: 'user' | 'assistant'; text: string; }

const INITIAL_CHAT: ChatMessage[] = [
  {
    role: 'assistant',
    text: "Hello! I'm your document assistant. You can ask me about document status, request updates, or get information about document workflows.",
  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

const Documents = () => {
  const [documents, setDocuments] = useState<Document[]>(mockDocuments);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<TabValue>('All');
  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(INITIAL_CHAT);

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch =
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.candidateName.toLowerCase().includes(searchQuery.toLowerCase());
    if (activeTab === 'All') return matchesSearch;
    if (activeTab === 'Pending') return matchesSearch && doc.status === 'pending';
    if (activeTab === 'Sent') return matchesSearch && doc.status === 'sent';
    if (activeTab === 'Signed') return matchesSearch && doc.status === 'signed';
    if (activeTab === 'Action Required') return matchesSearch && (doc.status === 'viewed' || doc.status === 'rejected');
    return matchesSearch;
  });

  const handleSendChat = () => {
    if (!chatInput.trim()) return;
    setChatMessages((prev) => [
      ...prev,
      { role: 'user', text: chatInput },
      {
        role: 'assistant',
        text: `I can help with that. Regarding "${chatInput}" — based on the current document status, all pending documents are awaiting candidate action. Would you like me to send a reminder?`,
      },
    ]);
    setChatInput('');
  };

  return (
    <div className="flex flex-col overflow-hidden" style={{ height: 'calc(100vh - 56px)' }}>

      {/* ── Page header ── */}
      <div className="px-6 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
            <FileText size={16} className="text-indigo-600" />
          </div>
          <div>
            <h1 className="text-gray-900" style={{ fontSize: 20, fontWeight: 600 }}>Documents</h1>
            <p className="text-gray-500 mt-0.5" style={{ fontSize: 13 }}>
              Manage document workflows with candidates and employees
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsRequestDialogOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg transition-all"
        >
          <Plus size={15} />
          <span style={{ fontSize: 13, fontWeight: 500 }}>Request Document</span>
        </button>
      </div>

      {/* ── Body: left list + right assistant ── */}
      <div className="flex flex-1 min-h-0 gap-4 px-6 pb-6">

        {/* Left: document list */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">

          {/* Search + Filter */}
          <div className="flex items-center gap-3 mb-4 shrink-0">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 placeholder-gray-400 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300"
                style={{ fontSize: 13 }}
              />
            </div>
            <button className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 text-gray-600 transition-all">
              <Filter size={14} />
              <span style={{ fontSize: 13 }}>Filter</span>
            </button>
          </div>

          {/* Tabs */}
          <div className="flex items-center border-b border-gray-200 mb-2 shrink-0">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2.5 transition-all ${
                  activeTab === tab
                    ? 'text-indigo-600 border-b-2 border-indigo-600 -mb-px'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                style={{ fontSize: 13, fontWeight: activeTab === tab ? 600 : 400 }}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Document rows */}
          <div className="flex-1 overflow-y-auto">
            {filteredDocuments.map((doc) => {
              const status = statusConfig[doc.status] || statusConfig.pending;
              const StatusIcon = status.icon;
              const initials = getInitials(doc.candidateName);
              const avatarColor = getAvatarColor(doc.candidateName);
              const now = new Date();
              const isOverdue = doc.dueDate && doc.dueDate < now && doc.status !== 'signed';
              const dateLabel =
                doc.status === 'signed' && doc.signedAt
                  ? `Signed on ${formatDate(doc.signedAt)}`
                  : doc.status === 'sent'
                  ? `Sent on ${formatDate(doc.updatedAt)}`
                  : `Updated on ${formatDate(doc.updatedAt)}`;

              return (
                <div
                  key={doc.id}
                  className="flex items-center gap-4 py-4 border-b border-gray-100 hover:bg-gray-50 transition-all cursor-pointer"
                >
                  {/* Avatar */}
                  <div className={`w-9 h-9 rounded-full ${avatarColor} flex items-center justify-center shrink-0`}>
                    <span style={{ fontSize: 11, fontWeight: 700 }}>{initials}</span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-900 truncate" style={{ fontSize: 14, fontWeight: 600 }}>
                      {doc.title}
                    </p>
                    <p className="text-gray-400" style={{ fontSize: 12 }}>{doc.candidateName}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-gray-400" style={{ fontSize: 11 }}>{dateLabel}</span>
                      {doc.dueDate && (
                        <span
                          className={`px-1.5 py-0.5 rounded-full ${isOverdue ? 'bg-red-100 text-red-600' : 'text-gray-400'}`}
                          style={{ fontSize: 11, fontWeight: isOverdue ? 600 : 400 }}
                        >
                          Due {formatDate(doc.dueDate)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Status badge */}
                  <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full ${status.bg} shrink-0`}>
                    <StatusIcon size={12} className={status.color} />
                    <span style={{ fontSize: 12, fontWeight: 600 }} className={status.color}>
                      {status.label}
                    </span>
                  </div>
                </div>
              );
            })}

            {filteredDocuments.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                  <FileText size={22} className="text-gray-400" />
                </div>
                <p className="text-gray-700" style={{ fontSize: 14, fontWeight: 600 }}>No documents found</p>
              </div>
            )}
          </div>
        </div>

        {/* Right: Document Assistant */}
        <div className="w-80 shrink-0 bg-white rounded-xl border border-gray-100 flex flex-col min-h-0 overflow-hidden">

          {/* Chat header */}
          <div className="px-4 py-3 border-b border-gray-100 flex items-start gap-2 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0 mt-0.5">
              <Brain size={15} className="text-indigo-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p style={{ fontSize: 13, fontWeight: 700 }} className="text-gray-900">Document Assistant</p>
              <p style={{ fontSize: 11 }} className="text-gray-500">
                Ask about document status, workflows, or request actions.
              </p>
            </div>
            <button className="text-gray-400 hover:text-gray-600 mt-0.5 shrink-0">
              <X size={14} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {chatMessages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center mr-2 shrink-0 mt-0.5">
                    <Brain size={13} className="text-indigo-600" />
                  </div>
                )}
                <div
                  className={`max-w-[200px] rounded-xl px-3 py-2 ${
                    msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700'
                  }`}
                  style={{ fontSize: 12, lineHeight: 1.5 }}
                >
                  {msg.role === 'assistant' && (
                    <p style={{ fontSize: 10, fontWeight: 700 }} className="text-indigo-600 mb-1">
                      Assistant • {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  )}
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="p-3 border-t border-gray-100 shrink-0">
            <div className="flex items-center gap-2 bg-gray-50 rounded-xl border border-gray-200 px-3 py-2">
              <input
                type="text"
                placeholder="Type your message..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
                className="flex-1 bg-transparent outline-none text-gray-700 placeholder-gray-400"
                style={{ fontSize: 12 }}
              />
              <button
                onClick={handleSendChat}
                className="w-7 h-7 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center justify-center transition-all"
              >
                <Send size={12} />
              </button>
            </div>
            <p className="text-gray-400 text-center mt-2" style={{ fontSize: 10 }}>
              Powered by Claude AI • Ask about document status, workflows, or request actions
            </p>
          </div>
        </div>
      </div>

      {/* ── Request Document Dialog ── */}
      <Dialog open={isRequestDialogOpen} onOpenChange={setIsRequestDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Request Document</DialogTitle>
          </DialogHeader>
          <DocumentRequestForm
            onSubmit={(data) => {
              const newDocument: Document = {
                id: generateId(),
                title: data.title,
                type: data.type,
                candidateId: data.candidateId,
                candidateName: data.candidateName,
                status: 'pending',
                createdAt: new Date(),
                updatedAt: new Date(),
                dueDate: data.dueDate,
                notes: data.notes,
              };
              setDocuments([newDocument, ...documents]);
              setIsRequestDialogOpen(false);
              toast.success('Document request created', {
                description: `${data.title} has been requested from ${data.candidateName}`,
              });
            }}
            onCancel={() => setIsRequestDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Documents;
