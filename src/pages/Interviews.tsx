import { useState, useMemo } from "react";
import {
  format,
  isToday,
  isTomorrow,
  startOfMonth,
  getDay,
  getDaysInMonth,
  startOfWeek,
  endOfWeek,
  isWithinInterval,
} from "date-fns";
import {
  Calendar,
  Clock,
  Search,
  Plus,
  ChevronLeft,
  ChevronRight,
  Video,
  MapPin,
  Phone,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RefreshCw,
  CalendarDays,
  UserPlus,
  Star,
  User,
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { useInterviews, useCreateInterview, useUpdateInterview, useDeleteInterview } from "@/hooks/useInterviews";
import { useRealTimeInterviews } from "@/hooks/useRealTimeInterviews";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import InterviewScheduler from "@/components/interviews/InterviewScheduler";
import LoadingUI from "@/components/ui/loading";

// ─── Types ────────────────────────────────────────────────────────────────────

type InterviewFormat = "Video" | "In-Person" | "Phone";
type TabKey = "all" | "upcoming" | "scheduled" | "completed";

// ─── Config maps ──────────────────────────────────────────────────────────────

const statusConfig: Record<string, { icon: any; color: string; bg: string; dot: string; label: string }> = {
  upcoming:         { icon: Clock,         color: "text-blue-700",    bg: "bg-blue-100",    dot: "bg-blue-500",    label: "Upcoming" },
  scheduled:        { icon: Clock,         color: "text-yellow-700",  bg: "bg-yellow-100",  dot: "bg-yellow-500",  label: "Scheduled" },
  completed:        { icon: CheckCircle2,  color: "text-emerald-700", bg: "bg-emerald-100", dot: "bg-emerald-500", label: "Completed" },
  cancelled:        { icon: XCircle,       color: "text-red-700",     bg: "bg-red-100",     dot: "bg-red-500",     label: "Cancelled" },
  rescheduled:      { icon: RefreshCw,     color: "text-amber-700",   bg: "bg-amber-100",   dot: "bg-amber-500",   label: "Rescheduled" },
  pending_feedback: { icon: AlertCircle,   color: "text-purple-700",  bg: "bg-purple-100",  dot: "bg-purple-500",  label: "Pending Feedback" },
};

const typeColors: Record<string, string> = {
  technical:    "bg-indigo-50 text-indigo-700",
  behavioral:   "bg-purple-50 text-purple-700",
  cultural_fit: "bg-cyan-50 text-cyan-700",
  final:        "bg-rose-50 text-rose-700",
  hr_screen:    "bg-emerald-50 text-emerald-700",
  panel:        "bg-amber-50 text-amber-700",
  portfolio:    "bg-violet-50 text-violet-700",
};

const AVATAR_COLORS = [
  "bg-indigo-100 text-indigo-700",
  "bg-violet-100 text-violet-700",
  "bg-amber-100 text-amber-700",
  "bg-rose-100 text-rose-700",
  "bg-cyan-100 text-cyan-700",
  "bg-emerald-100 text-emerald-700",
  "bg-teal-100 text-teal-700",
  "bg-fuchsia-100 text-fuchsia-700",
];

const TABS: Array<{ key: TabKey; label: string }> = [
  { key: "all",       label: "All" },
  { key: "upcoming",  label: "Upcoming" },
  { key: "scheduled", label: "Scheduled" },
  { key: "completed", label: "Completed" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function avatarColor(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) & 0xffffffff;
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function initials(name: string): string {
  return name.split(" ").map((n) => n[0] ?? "").join("").toUpperCase().slice(0, 2);
}

function deriveFormat(location: string | null | undefined): InterviewFormat {
  if (!location) return "Video";
  const lower = location.toLowerCase();
  if (lower.includes("phone") || lower.includes("call")) return "Phone";
  if (lower.startsWith("http") || lower.includes("zoom") || lower.includes("meet") || lower.includes("teams")) return "Video";
  return "In-Person";
}

function formatDuration(startTime?: string, endTime?: string): string {
  if (!startTime || !endTime) return "60 min";
  try {
    const [sh, sm] = startTime.split(":").map(Number);
    const [eh, em] = endTime.split(":").map(Number);
    const diff = (eh * 60 + em) - (sh * 60 + sm);
    if (diff <= 0) return "60 min";
    if (diff >= 60 && diff % 60 === 0) return `${diff / 60} hr`;
    if (diff >= 60) return `${Math.floor(diff / 60)} hr ${diff % 60} min`;
    return `${diff} min`;
  } catch {
    return "60 min";
  }
}

function formatDateLabel(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    if (isToday(d)) return "Today";
    if (isTomorrow(d)) return "Tomorrow";
    return format(d, "MMM d, yyyy");
  } catch {
    return dateStr;
  }
}

function formatTime(timeStr?: string, dateStr?: string): string {
  if (timeStr) {
    try {
      const [h, m] = timeStr.split(":").map(Number);
      const d = new Date();
      d.setHours(h, m, 0, 0);
      return format(d, "h:mm a");
    } catch { /* fall through */ }
  }
  if (dateStr) {
    try { return format(new Date(dateStr), "h:mm a"); } catch { /* fall through */ }
  }
  return "";
}

// Derive display status: scheduled interviews today → "upcoming"
function deriveDisplayStatus(interview: any): string {
  if (interview.status === "scheduled") {
    try {
      if (isToday(new Date(interview.dateTime))) return "upcoming";
    } catch { /* fall through */ }
  }
  return interview.status ?? "scheduled";
}

// Tab filter predicate
function matchesTab(iv: any, tab: TabKey): boolean {
  switch (tab) {
    case "upcoming": {
      try {
        const d = new Date(iv.dateTime);
        return (iv.status === "scheduled" || iv.status === "rescheduled") && (isToday(d) || isTomorrow(d));
      } catch { return false; }
    }
    case "scheduled": {
      try {
        const d = new Date(iv.dateTime);
        return (iv.status === "scheduled" || iv.status === "rescheduled") && !isToday(d) && !isTomorrow(d) && d > new Date();
      } catch { return false; }
    }
    case "completed": {
      return iv.status === "completed" || iv.status === "pending_feedback" || iv.status === "cancelled";
    }
    default: return true;
  }
}

// ─── Interview Row (flat list item) ───────────────────────────────────────────

function InterviewRow({ interview, onSelect }: { interview: any; onSelect: () => void }) {
  const displayStatus = deriveDisplayStatus(interview);
  const status = statusConfig[displayStatus] ?? statusConfig.scheduled;
  const fmt = deriveFormat(interview.location);
  const FormatIcon = fmt === "Video" ? Video : fmt === "Phone" ? Phone : MapPin;
  const typeKey = (interview.type ?? "technical").toLowerCase().replace(/ /g, "_");
  const typeLabel = (interview.type ?? "").replace(/_/g, " ");
  const color = avatarColor(interview.candidateId ?? interview.id ?? "");
  const ini = initials(interview.candidateName ?? "?");
  const timeStr = formatTime(interview.startTime, interview.dateTime);
  const dateLabel = formatDateLabel(interview.dateTime ?? "");
  const duration = formatDuration(interview.startTime, interview.endTime);
  const firstInterviewer = Array.isArray(interview.interviewers) ? interview.interviewers[0] : null;
  const formatLabel = fmt === "Video" ? "Video Call" : fmt === "Phone" ? "Phone Screen" : (interview.location ?? "In-Person");

  return (
    <div
      onClick={onSelect}
      className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 cursor-pointer transition-colors"
    >
      {/* Avatar */}
      <div className={`w-10 h-10 rounded-full ${color} flex items-center justify-center shrink-0`}>
        <span style={{ fontSize: 13, fontWeight: 700 }}>{ini}</span>
      </div>

      {/* Main content */}
      <div className="flex-1 min-w-0">
        <p className="text-gray-900 mb-0.5" style={{ fontSize: 14, fontWeight: 600 }}>
          {interview.candidateName}
        </p>
        <p className="text-gray-500 mb-1.5" style={{ fontSize: 12 }}>
          {interview.position ?? interview.jobTitle ?? ""}
          {typeLabel ? ` · ${typeLabel}` : ""}
        </p>
        <div className="flex items-center gap-4 flex-wrap">
          <span className="flex items-center gap-1 text-gray-500" style={{ fontSize: 12 }}>
            <Calendar size={11} className="text-gray-400 shrink-0" />
            {dateLabel}
          </span>
          {timeStr && (
            <span className="flex items-center gap-1 text-gray-500" style={{ fontSize: 12 }}>
              <Clock size={11} className="text-gray-400 shrink-0" />
              {timeStr} · {duration}
            </span>
          )}
          <span className="flex items-center gap-1 text-gray-500" style={{ fontSize: 12 }}>
            <FormatIcon size={11} className="text-gray-400 shrink-0" />
            {formatLabel}
          </span>
          {firstInterviewer && (
            <span className="flex items-center gap-1 text-gray-500" style={{ fontSize: 12 }}>
              <User size={11} className="text-gray-400 shrink-0" />
              {firstInterviewer}
            </span>
          )}
        </div>
      </div>

      {/* Status badge */}
      <span
        className={`px-2.5 py-1 rounded-full shrink-0 ${status.bg} ${status.color}`}
        style={{ fontSize: 11, fontWeight: 600 }}
      >
        {status.label}
      </span>
    </div>
  );
}

// ─── Detail Panel ─────────────────────────────────────────────────────────────

function DetailPanel({ interview, onClose, onUpdate, onDelete }: {
  interview: any;
  onClose: () => void;
  onUpdate: (id: string, data: any) => void;
  onDelete: (id: string) => void;
}) {
  const displayStatus = deriveDisplayStatus(interview);
  const status = statusConfig[displayStatus] ?? statusConfig.scheduled;
  const StatusIcon = status.icon;
  const fmt = deriveFormat(interview.location);
  const FormatIcon = fmt === "Video" ? Video : fmt === "Phone" ? Phone : MapPin;
  const typeKey = (interview.type ?? "technical").toLowerCase().replace(/ /g, "_");
  const typeBadge = typeColors[typeKey] ?? "bg-gray-100 text-gray-700";
  const typeLabel = (interview.type ?? "Interview").replace(/_/g, " ");
  const color = avatarColor(interview.candidateId ?? interview.id ?? "");
  const ini = initials(interview.candidateName ?? "?");
  const timeStr = formatTime(interview.startTime, interview.dateTime);
  const dateLabel = formatDateLabel(interview.dateTime ?? "");
  const duration = formatDuration(interview.startTime, interview.endTime);

  return (
    <div className="w-96 shrink-0 bg-white border-l border-gray-200 flex flex-col overflow-y-auto">
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-full ${color} flex items-center justify-center`}>
              <span style={{ fontSize: 15, fontWeight: 700 }}>{ini}</span>
            </div>
            <div>
              <h3 className="text-gray-900" style={{ fontSize: 16, fontWeight: 700 }}>{interview.candidateName}</h3>
              <p className="text-gray-500" style={{ fontSize: 13 }}>{interview.position ?? interview.jobTitle ?? ""}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400">
            <XCircle size={18} />
          </button>
        </div>

        {interview.title && (
          <div className="bg-gray-50 rounded-lg px-3 py-2 border border-gray-100">
            <p style={{ fontSize: 12, fontWeight: 600 }} className="text-gray-600">{interview.title}</p>
          </div>
        )}
      </div>

      {/* Details */}
      <div className="p-6 space-y-5">
        <div>
          <p style={{ fontSize: 12, fontWeight: 700 }} className="text-gray-400 uppercase tracking-wide mb-3">Interview Details</p>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar size={14} className="text-indigo-500" />
                <span style={{ fontSize: 13 }}>Date & Time</span>
              </div>
              <span style={{ fontSize: 13, fontWeight: 600 }} className="text-gray-900">{dateLabel} at {timeStr}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-gray-600">
                <Clock size={14} className="text-indigo-500" />
                <span style={{ fontSize: 13 }}>Duration</span>
              </div>
              <span style={{ fontSize: 13, fontWeight: 600 }} className="text-gray-900">{duration}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-gray-600">
                <FormatIcon size={14} className="text-indigo-500" />
                <span style={{ fontSize: 13 }}>Format</span>
              </div>
              <span style={{ fontSize: 13, fontWeight: 600 }} className="text-gray-900">{fmt}</span>
            </div>
            {interview.location && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin size={14} className="text-indigo-500" />
                  <span style={{ fontSize: 13 }}>Location</span>
                </div>
                <span style={{ fontSize: 13, fontWeight: 600 }} className="text-gray-900 truncate max-w-[150px]">{interview.location}</span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-gray-600">
                <Star size={14} className="text-indigo-500" />
                <span style={{ fontSize: 13 }}>Type</span>
              </div>
              <span className={`px-2 py-0.5 rounded-full ${typeBadge}`} style={{ fontSize: 12, fontWeight: 600 }}>
                {typeLabel}
              </span>
            </div>
          </div>
        </div>

        <div>
          <p style={{ fontSize: 12, fontWeight: 700 }} className="text-gray-400 uppercase tracking-wide mb-3">Status</p>
          <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${status.bg}`}>
            <div className={`w-2 h-2 rounded-full ${status.dot}`} />
            <StatusIcon size={14} className={status.color} />
            <span style={{ fontSize: 13, fontWeight: 600 }} className={status.color}>{status.label}</span>
          </div>
        </div>

        {interview.interviewers && interview.interviewers.length > 0 && (
          <div>
            <p style={{ fontSize: 12, fontWeight: 700 }} className="text-gray-400 uppercase tracking-wide mb-3">Interviewers</p>
            <div className="space-y-2">
              {interview.interviewers.map((iv: string, i: number) => (
                <div key={i} className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-full ${avatarColor(iv)} flex items-center justify-center`}>
                    <span style={{ fontSize: 11, fontWeight: 700 }}>{initials(iv)}</span>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 500 }} className="text-gray-700">{iv}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {interview.notes && (
          <div>
            <p style={{ fontSize: 12, fontWeight: 700 }} className="text-gray-400 uppercase tracking-wide mb-3">Notes</p>
            <div className="bg-gray-50 rounded-lg p-3">
              <p style={{ fontSize: 13 }} className="text-gray-600">{interview.notes}</p>
            </div>
          </div>
        )}

        {interview.application?.candidateInfo && (
          <div>
            <p style={{ fontSize: 12, fontWeight: 700 }} className="text-gray-400 uppercase tracking-wide mb-3">Candidate</p>
            <p style={{ fontSize: 13 }} className="text-gray-700">{interview.application.candidateInfo.email}</p>
          </div>
        )}

        <div className="pt-2 space-y-2">
          {(interview.status === "scheduled") && (
            <>
              <button className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-all" style={{ fontSize: 13, fontWeight: 600 }}>
                Join Interview
              </button>
              <button className="w-full py-2.5 border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-lg transition-all" style={{ fontSize: 13, fontWeight: 500 }}>
                Reschedule
              </button>
              <button
                onClick={() => { onDelete(interview.id); onClose(); }}
                className="w-full py-2.5 border border-red-200 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                style={{ fontSize: 13, fontWeight: 500 }}
              >
                Cancel Interview
              </button>
            </>
          )}
          {interview.status === "pending_feedback" && (
            <button className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-all" style={{ fontSize: 13, fontWeight: 600 }}>
              Submit Feedback
            </button>
          )}
          {interview.status === "completed" && (
            <>
              <button className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-all" style={{ fontSize: 13, fontWeight: 600 }}>
                View Full Report
              </button>
              <button className="w-full py-2.5 border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-lg transition-all" style={{ fontSize: 13, fontWeight: 500 }}>
                Move to Offer
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Calendar View ────────────────────────────────────────────────────────────

function CalendarView({ interviews }: { interviews: any[] }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const monthLabel = format(currentDate, "MMMM yyyy");
  const firstDayOfMonth = getDay(startOfMonth(currentDate));
  const daysInMonth = getDaysInMonth(currentDate);
  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const interviewsByDay = useMemo(() => {
    const map: Record<number, number> = {};
    for (const iv of interviews) {
      try {
        const d = new Date(iv.dateTime);
        if (d.getFullYear() === currentDate.getFullYear() && d.getMonth() === currentDate.getMonth()) {
          const day = d.getDate();
          map[day] = (map[day] ?? 0) + 1;
        }
      } catch { /* skip */ }
    }
    return map;
  }, [interviews, currentDate]);

  const dayGrid: (number | null)[] = [];
  for (let i = 0; i < firstDayOfMonth; i++) dayGrid.push(null);
  for (let d = 1; d <= daysInMonth; d++) dayGrid.push(d);

  const today = new Date();

  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <h3 className="text-gray-900" style={{ fontSize: 15, fontWeight: 700 }}>{monthLabel}</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
            className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-500"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-3 py-1 text-indigo-600 hover:bg-indigo-50 rounded-lg"
            style={{ fontSize: 13, fontWeight: 500 }}
          >
            Today
          </button>
          <button
            onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
            className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-500"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 border-b border-gray-100">
        {daysOfWeek.map((d) => (
          <div key={d} className="py-3 text-center">
            <span style={{ fontSize: 12, fontWeight: 600 }} className="text-gray-400">{d}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {dayGrid.map((day, i) => {
          const count = day ? (interviewsByDay[day] ?? 0) : 0;
          const isCurrentDay = day !== null &&
            today.getDate() === day &&
            today.getFullYear() === currentDate.getFullYear() &&
            today.getMonth() === currentDate.getMonth();
          return (
            <div
              key={i}
              className={`min-h-[90px] p-2 border-b border-r border-gray-50 ${day ? "hover:bg-gray-50 cursor-pointer" : ""} ${isCurrentDay ? "bg-indigo-50/30" : ""}`}
            >
              {day && (
                <>
                  <span
                    className={`inline-flex w-7 h-7 items-center justify-center rounded-full mb-1 ${isCurrentDay ? "bg-indigo-600 text-white" : "text-gray-700"}`}
                    style={{ fontSize: 13, fontWeight: isCurrentDay ? 700 : 400 }}
                  >
                    {day}
                  </span>
                  {count > 0 && (
                    <div className="px-1.5 py-0.5 bg-indigo-100 rounded text-indigo-700 truncate" style={{ fontSize: 10, fontWeight: 600 }}>
                      {count} interview{count > 1 ? "s" : ""}
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Error/friendly map ───────────────────────────────────────────────────────

const friendlyErrors: Record<string, string> = {
  'Invalid applicationId': 'The selected candidate application no longer exists.',
  'Interview not found': 'This interview has been deleted or is no longer available.',
  'Validation failed': 'Please check the form — some fields are invalid.',
};

// ─── Main Page ────────────────────────────────────────────────────────────────

const Interviews = () => {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<TabKey>("all");
  const [view, setView] = useState<"list" | "calendar">("list");
  const [selectedInterview, setSelectedInterview] = useState<any | null>(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  // Data hooks
  const { interviews, loading, error, refetch } = useInterviews();
  const { createInterview } = useCreateInterview();
  const { updateInterview } = useUpdateInterview();
  const { deleteInterview } = useDeleteInterview();
  const { isConnected } = useRealTimeInterviews();

  const handleApiError = (err: unknown, action: string) => {
    const raw = err instanceof Error ? err.message : "Unknown error";
    toast({ variant: "destructive", title: `${action} failed`, description: friendlyErrors[raw] ?? raw });
  };

  const handleSchedule = async (data: any) => {
    try {
      await createInterview(data);
      await refetch();
      setShowScheduleModal(false);
      toast({ title: "Interview scheduled", description: "Interview created successfully." });
    } catch (err) {
      handleApiError(err, "Schedule interview");
    }
  };

  const handleUpdate = async (id: string, data: any) => {
    try {
      await updateInterview(id, data);
      await refetch();
      toast({ title: "Interview updated" });
    } catch (err) {
      handleApiError(err, "Update interview");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteInterview(id);
      await refetch();
      toast({ title: "Interview cancelled" });
    } catch (err) {
      handleApiError(err, "Cancel interview");
    }
  };

  // Stats
  const stats = useMemo(() => {
    const now = new Date();
    const todayCount = interviews.filter((iv) => {
      try { return isToday(new Date(iv.dateTime)); } catch { return false; }
    }).length;
    const weekStart = startOfWeek(now, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
    const thisWeekCount = interviews.filter((iv) => {
      try { return isWithinInterval(new Date(iv.dateTime), { start: weekStart, end: weekEnd }); } catch { return false; }
    }).length;
    const completedCount = interviews.filter((iv) => iv.status === "completed").length;
    const durations = interviews
      .filter((iv) => iv.startTime && iv.endTime)
      .map((iv) => {
        try {
          const [sh, sm] = iv.startTime.split(":").map(Number);
          const [eh, em] = iv.endTime.split(":").map(Number);
          return (eh * 60 + em) - (sh * 60 + sm);
        } catch { return 0; }
      })
      .filter((d) => d > 0);
    const avgDuration = durations.length > 0
      ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
      : null;
    return { today: todayCount, thisWeek: thisWeekCount, completed: completedCount, avgDuration };
  }, [interviews]);

  // Tab counts
  const tabCounts = useMemo(() => ({
    all:       interviews.length,
    upcoming:  interviews.filter((iv) => matchesTab(iv, "upcoming")).length,
    scheduled: interviews.filter((iv) => matchesTab(iv, "scheduled")).length,
    completed: interviews.filter((iv) => matchesTab(iv, "completed")).length,
  }), [interviews]);

  // Filtered list (search + active tab)
  const filtered = useMemo(() => {
    return interviews.filter((iv) => {
      const matchSearch =
        !search ||
        (iv.candidateName ?? "").toLowerCase().includes(search.toLowerCase()) ||
        (iv.position ?? "").toLowerCase().includes(search.toLowerCase()) ||
        (iv.type ?? "").toLowerCase().includes(search.toLowerCase());
      return matchSearch && matchesTab(iv, activeTab);
    });
  }, [interviews, search, activeTab]);

  return (
    <div className="flex h-full" style={{ minHeight: "calc(100vh - 56px)" }}>
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="p-6 space-y-4 flex-1 overflow-y-auto">

          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center shrink-0">
                <Calendar size={16} className="text-purple-600" />
              </div>
              <div>
                <h1 className="text-gray-900" style={{ fontSize: 20, fontWeight: 600 }}>Interviews</h1>
                <p className="text-gray-500 mt-0.5" style={{ fontSize: 13 }}>
                  Schedule and manage candidate interviews across all stages
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowScheduleModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg transition-all"
            >
              <Plus size={15} />
              <span style={{ fontSize: 13, fontWeight: 500 }}>Schedule Interview</span>
            </button>
          </div>

          {/* Inline Stats Bar */}
          <div className="bg-white rounded-xl border border-gray-100">
            <div className="grid grid-cols-4 divide-x divide-gray-100">
              <div className="px-6 py-5">
                <p className="text-indigo-600" style={{ fontSize: 28, fontWeight: 700, lineHeight: 1.1 }}>{stats.today}</p>
                <p className="text-gray-500 mt-1" style={{ fontSize: 12, fontWeight: 500 }}>Today's Interviews</p>
              </div>
              <div className="px-6 py-5">
                <p className="text-indigo-600" style={{ fontSize: 28, fontWeight: 700, lineHeight: 1.1 }}>{stats.thisWeek}</p>
                <p className="text-gray-500 mt-1" style={{ fontSize: 12, fontWeight: 500 }}>This Week</p>
              </div>
              <div className="px-6 py-5">
                <p className="text-gray-900" style={{ fontSize: 28, fontWeight: 700, lineHeight: 1.1 }}>{stats.completed}</p>
                <p className="text-gray-500 mt-1" style={{ fontSize: 12, fontWeight: 500 }}>Completed</p>
              </div>
              <div className="px-6 py-5">
                <p className="text-amber-500" style={{ fontSize: 28, fontWeight: 700, lineHeight: 1.1 }}>
                  {stats.avgDuration !== null ? `${stats.avgDuration} min` : "–"}
                </p>
                <p className="text-gray-500 mt-1" style={{ fontSize: 12, fontWeight: 500 }}>Avg. Duration</p>
              </div>
            </div>
          </div>

          {/* Underline tabs */}
          <div className="flex items-end border-b border-gray-200">
            <div className="flex items-center">
              {TABS.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`relative px-4 py-3 transition-colors ${
                    activeTab === tab.key ? "text-indigo-600" : "text-gray-500 hover:text-gray-700"
                  }`}
                  style={{ fontSize: 13, fontWeight: activeTab === tab.key ? 600 : 500 }}
                >
                  {tab.label}{" "}
                  <span style={{ fontSize: 12 }} className={activeTab === tab.key ? "text-indigo-400" : "text-gray-400"}>
                    ({tabCounts[tab.key]})
                  </span>
                  {activeTab === tab.key && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-t" />
                  )}
                </button>
              ))}
              {/* Calendar view toggle */}
              <button
                onClick={() => setView(view === "list" ? "calendar" : "list")}
                className={`ml-2 px-3 py-2 rounded-lg transition-colors ${view === "calendar" ? "bg-indigo-50 text-indigo-600" : "text-gray-400 hover:text-gray-600"}`}
                style={{ fontSize: 12 }}
                title="Toggle calendar view"
              >
                <CalendarDays size={15} />
              </button>
            </div>
          </div>

          {/* Content */}
          {loading ? (
            <LoadingUI message="Loading interviews..." />
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
              <p className="text-red-700 font-medium mb-2">Error loading interviews</p>
              <p className="text-red-600 text-sm mb-4">{error}</p>
              <button
                onClick={refetch}
                className="px-4 py-2 border border-red-300 text-red-600 hover:bg-red-50 rounded-lg"
                style={{ fontSize: 13 }}
              >
                Try Again
              </button>
            </div>
          ) : view === "calendar" ? (
            <CalendarView interviews={interviews} />
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-xl border border-gray-100">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <Calendar size={28} className="text-gray-400" />
              </div>
              <p className="text-gray-900" style={{ fontSize: 16, fontWeight: 600 }}>No interviews found</p>
              <p className="text-gray-500 mt-1" style={{ fontSize: 13 }}>Try adjusting your filters or schedule an interview</p>
              <button
                onClick={() => setShowScheduleModal(true)}
                className="mt-4 flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-all"
                style={{ fontSize: 13, fontWeight: 500 }}
              >
                <Plus size={15} />
                Schedule Interview
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <div className="divide-y divide-gray-100">
                {filtered.map((iv) => (
                  <InterviewRow
                    key={iv.id}
                    interview={iv}
                    onSelect={() => setSelectedInterview(iv)}
                  />
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Detail Panel */}
      {selectedInterview && (
        <DetailPanel
          interview={selectedInterview}
          onClose={() => setSelectedInterview(null)}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
        />
      )}

      {/* Schedule Interview Modal */}
      <Dialog open={showScheduleModal} onOpenChange={setShowScheduleModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus size={18} className="text-indigo-600" />
              Schedule Interview
            </DialogTitle>
          </DialogHeader>
          <InterviewScheduler
            onInterviewScheduled={handleSchedule}
            loading={false}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Interviews;
