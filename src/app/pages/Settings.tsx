import {
  Settings as SettingsIcon,
  User,
  Bell,
  Shield,
  Palette,
  Globe,
  CreditCard,
  Users,
  Building2,
  Plug,
  Mail,
  GitBranch,
  FileText,
  ClipboardList,
  ChevronRight,
  Camera,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  GripVertical,
  Check,
  X,
  AlertCircle,
  ExternalLink,
  Crown,
  Zap,
  RefreshCw,
  Copy,
  Download,
} from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { useState } from "react";

// ─── Types ───────────────────────────────────────────────────────────────────

type SectionKey =
  | "profile"
  | "security"
  | "company"
  | "team"
  | "notifications"
  | "pipeline"
  | "templates"
  | "scorecards"
  | "integrations"
  | "email"
  | "appearance"
  | "localization"
  | "billing";

// ─── Sidebar nav ─────────────────────────────────────────────────────────────

const navGroups = [
  {
    label: "Account",
    items: [
      { key: "profile" as SectionKey, label: "Profile", icon: User },
      { key: "security" as SectionKey, label: "Security", icon: Shield },
    ],
  },
  {
    label: "Workspace",
    items: [
      { key: "company" as SectionKey, label: "Company", icon: Building2 },
      { key: "team" as SectionKey, label: "Team Members", icon: Users },
      { key: "notifications" as SectionKey, label: "Notifications", icon: Bell },
    ],
  },
  {
    label: "Recruiting",
    items: [
      { key: "pipeline" as SectionKey, label: "Pipeline Stages", icon: GitBranch },
      { key: "templates" as SectionKey, label: "Job Templates", icon: FileText },
      { key: "scorecards" as SectionKey, label: "Scorecards", icon: ClipboardList },
    ],
  },
  {
    label: "Integrations",
    items: [
      { key: "integrations" as SectionKey, label: "Integrations", icon: Plug },
      { key: "email" as SectionKey, label: "Email", icon: Mail },
    ],
  },
  {
    label: "System",
    items: [
      { key: "appearance" as SectionKey, label: "Appearance", icon: Palette },
      { key: "localization" as SectionKey, label: "Localization", icon: Globe },
      { key: "billing" as SectionKey, label: "Billing & Plan", icon: CreditCard },
    ],
  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
        checked ? "bg-blue-600" : "bg-gray-200"
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${
          checked ? "translate-x-4" : "translate-x-0"
        }`}
      />
    </button>
  );
}

function SectionCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      {children}
    </div>
  );
}

function SectionBlock({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="p-5">
      <div className="mb-4">
        <h3 className="text-[13px] font-semibold text-gray-900">{title}</h3>
        {description && <p className="text-[11px] text-gray-500 mt-0.5">{description}</p>}
      </div>
      {children}
    </div>
  );
}

function FieldRow({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between py-3 border-t border-gray-100 first:border-t-0">
      <div className="flex-1 min-w-0 mr-6">
        <p className="text-[12px] font-medium text-gray-800">{label}</p>
        {hint && <p className="text-[11px] text-gray-400 mt-0.5">{hint}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

function StyledInput({
  defaultValue,
  placeholder,
  type = "text",
}: {
  defaultValue?: string;
  placeholder?: string;
  type?: string;
}) {
  return (
    <input
      type={type}
      defaultValue={defaultValue}
      placeholder={placeholder}
      className="w-full bg-gray-50 border border-gray-200 rounded-md px-3 py-1.5 text-[12px] text-gray-800 outline-none focus:border-blue-400 focus:bg-white transition-colors"
    />
  );
}

function SaveButton({ label = "Save Changes" }: { label?: string }) {
  return (
    <button className="bg-gray-900 text-white px-4 py-1.5 rounded-md text-[12px] font-medium hover:bg-gray-800 transition-colors">
      {label}
    </button>
  );
}

// ─── Sections ─────────────────────────────────────────────────────────────────

function ProfileSection() {
  return (
    <div className="space-y-4">
      <SectionCard>
        <SectionBlock title="Personal Information" description="Your name and contact details visible to your team">
          {/* Avatar */}
          <div className="flex items-center gap-4 mb-5 pb-5 border-b border-gray-100">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center">
                <span className="text-white text-xl font-semibold">J</span>
              </div>
              <button className="absolute -bottom-1 -right-1 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-sm hover:bg-gray-50 transition-colors">
                <Camera size={11} className="text-gray-600" />
              </button>
            </div>
            <div>
              <p className="text-[13px] font-semibold text-gray-900">Jana Doe</p>
              <p className="text-[11px] text-gray-500">HR Manager · TalentSol</p>
              <div className="flex items-center gap-2 mt-1.5">
                <button className="text-[11px] text-blue-600 hover:underline">Upload photo</button>
                <span className="text-gray-300">·</span>
                <button className="text-[11px] text-gray-400 hover:underline">Remove</button>
              </div>
            </div>
          </div>

          {/* Fields */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "First Name", value: "Jana" },
              { label: "Last Name", value: "Doe" },
              { label: "Email Address", value: "jana.doe@company.com" },
              { label: "Phone Number", value: "+1 555-0199" },
              { label: "Job Title", value: "HR Manager" },
              { label: "Department", value: "Human Resources" },
            ].map((field) => (
              <div key={field.label}>
                <label className="block text-[11px] font-medium text-gray-500 mb-1">{field.label}</label>
                <StyledInput defaultValue={field.value} />
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-4 mt-2 border-t border-gray-100">
            <SaveButton />
          </div>
        </SectionBlock>
      </SectionCard>

      <SectionCard>
        <SectionBlock title="Preferences" description="Your personal workspace preferences">
          <FieldRow label="Language" hint="Display language for your account">
            <select className="bg-gray-50 border border-gray-200 rounded-md px-3 py-1.5 text-[12px] text-gray-800 outline-none focus:border-blue-400 transition-colors">
              <option>English (US)</option>
              <option>English (UK)</option>
              <option>Spanish</option>
            </select>
          </FieldRow>
          <FieldRow label="Time Zone" hint="Used for scheduling and calendar events">
            <select className="bg-gray-50 border border-gray-200 rounded-md px-3 py-1.5 text-[12px] text-gray-800 outline-none focus:border-blue-400 transition-colors">
              <option>Pacific Time (PT)</option>
              <option>Eastern Time (ET)</option>
              <option>UTC</option>
            </select>
          </FieldRow>
        </SectionBlock>
      </SectionCard>
    </div>
  );
}

function SecuritySection() {
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [twoFa, setTwoFa] = useState(false);

  const sessions = [
    { device: "Chrome on macOS", location: "San Francisco, CA", time: "Active now", current: true },
    { device: "Safari on iPhone 15", location: "San Francisco, CA", time: "2 hours ago", current: false },
    { device: "Chrome on Windows", location: "New York, NY", time: "3 days ago", current: false },
  ];

  return (
    <div className="space-y-4">
      <SectionCard>
        <SectionBlock title="Change Password" description="Use a strong password with at least 12 characters">
          <div className="space-y-3">
            {[
              { label: "Current Password", show: showCurrent, toggle: () => setShowCurrent(!showCurrent) },
              { label: "New Password", show: showNew, toggle: () => setShowNew(!showNew) },
              { label: "Confirm New Password", show: showNew, toggle: () => setShowNew(!showNew) },
            ].map((field) => (
              <div key={field.label}>
                <label className="block text-[11px] font-medium text-gray-500 mb-1">{field.label}</label>
                <div className="relative">
                  <input
                    type={field.show ? "text" : "password"}
                    placeholder="••••••••"
                    className="w-full bg-gray-50 border border-gray-200 rounded-md px-3 py-1.5 pr-9 text-[12px] text-gray-800 outline-none focus:border-blue-400 focus:bg-white transition-colors"
                  />
                  <button
                    type="button"
                    onClick={field.toggle}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {field.show ? <EyeOff size={13} /> : <Eye size={13} />}
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-end pt-4 mt-2 border-t border-gray-100">
            <SaveButton label="Update Password" />
          </div>
        </SectionBlock>
      </SectionCard>

      <SectionCard>
        <SectionBlock title="Two-Factor Authentication" description="Add a second layer of protection to your account">
          <FieldRow
            label="Authenticator App"
            hint="Use an app like Google Authenticator or Authy"
          >
            <div className="flex items-center gap-3">
              <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${twoFa ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                {twoFa ? "Enabled" : "Disabled"}
              </span>
              <ToggleSwitch checked={twoFa} onChange={setTwoFa} />
            </div>
          </FieldRow>
          {twoFa && (
            <div className="mt-3 p-3 bg-green-50 border border-green-100 rounded-md flex items-start gap-2">
              <Check size={13} className="text-green-600 mt-0.5 shrink-0" />
              <p className="text-[11px] text-green-700">Two-factor authentication is active. Your account has enhanced security.</p>
            </div>
          )}
        </SectionBlock>
      </SectionCard>

      <SectionCard>
        <SectionBlock title="Active Sessions" description="Manage devices where you're currently signed in">
          <div className="space-y-0">
            {sessions.map((session, i) => (
              <div
                key={i}
                className={`flex items-center justify-between py-3 ${i > 0 ? "border-t border-gray-100" : ""}`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-md flex items-center justify-center mt-0.5">
                    <Shield size={14} className="text-gray-500" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-[12px] font-medium text-gray-800">{session.device}</p>
                      {session.current && (
                        <span className="text-[10px] font-medium px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded-full">Current</span>
                      )}
                    </div>
                    <p className="text-[11px] text-gray-400">{session.location} · {session.time}</p>
                  </div>
                </div>
                {!session.current && (
                  <button className="text-[11px] text-red-500 hover:text-red-700 font-medium transition-colors">
                    Revoke
                  </button>
                )}
              </div>
            ))}
          </div>
          <div className="pt-3 border-t border-gray-100">
            <button className="text-[12px] text-red-500 font-medium hover:text-red-700 transition-colors">
              Sign out all other sessions
            </button>
          </div>
        </SectionBlock>
      </SectionCard>
    </div>
  );
}

function CompanySection() {
  return (
    <div className="space-y-4">
      <SectionCard>
        <SectionBlock title="Company Profile" description="Basic information about your organization">
          <div className="flex items-center gap-4 mb-5 pb-5 border-b border-gray-100">
            <div className="w-14 h-14 rounded-lg bg-blue-600 flex items-center justify-center">
              <span className="text-white text-lg font-bold">T</span>
            </div>
            <div>
              <p className="text-[13px] font-semibold text-gray-900">TalentSol Inc.</p>
              <p className="text-[11px] text-gray-500">talentsol.com</p>
              <button className="text-[11px] text-blue-600 mt-1 hover:underline">Upload company logo</button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Company Name", value: "TalentSol Inc." },
              { label: "Industry", value: "Technology" },
              { label: "Company Size", value: "51–200 employees" },
              { label: "Website", value: "https://talentsol.com" },
              { label: "Headquarters", value: "San Francisco, CA" },
              { label: "Founded", value: "2019" },
            ].map((field) => (
              <div key={field.label}>
                <label className="block text-[11px] font-medium text-gray-500 mb-1">{field.label}</label>
                <StyledInput defaultValue={field.value} />
              </div>
            ))}
          </div>

          <div className="mt-3">
            <label className="block text-[11px] font-medium text-gray-500 mb-1">Company Description</label>
            <textarea
              defaultValue="TalentSol is a modern applicant tracking system helping teams hire smarter and faster."
              rows={3}
              className="w-full bg-gray-50 border border-gray-200 rounded-md px-3 py-1.5 text-[12px] text-gray-800 outline-none focus:border-blue-400 focus:bg-white transition-colors resize-none"
            />
          </div>

          <div className="flex justify-end pt-4 mt-2 border-t border-gray-100">
            <SaveButton />
          </div>
        </SectionBlock>
      </SectionCard>

      <SectionCard>
        <SectionBlock title="Careers Page" description="Customize your public-facing job board">
          <FieldRow label="Public careers URL" hint="Share this link with candidates">
            <div className="flex items-center gap-2">
              <code className="text-[11px] bg-gray-100 px-2 py-1 rounded text-gray-600">talentsol.com/careers/acme</code>
              <button className="text-gray-400 hover:text-gray-600 transition-colors">
                <Copy size={13} />
              </button>
              <button className="text-gray-400 hover:text-gray-600 transition-colors">
                <ExternalLink size={13} />
              </button>
            </div>
          </FieldRow>
        </SectionBlock>
      </SectionCard>
    </div>
  );
}

function TeamSection() {
  const [inviteEmail, setInviteEmail] = useState("");

  const members = [
    { name: "Jana Doe", email: "jana.doe@company.com", role: "Admin", avatar: "JD", color: "bg-blue-100 text-blue-700", status: "Active", you: true },
    { name: "Marcus Lee", email: "marcus.lee@company.com", role: "Recruiter", avatar: "ML", color: "bg-green-100 text-green-700", status: "Active", you: false },
    { name: "Sarah Kim", email: "sarah.kim@company.com", role: "Hiring Manager", avatar: "SK", color: "bg-purple-100 text-purple-700", status: "Active", you: false },
    { name: "Tom Bradley", email: "tom.b@company.com", role: "Recruiter", avatar: "TB", color: "bg-orange-100 text-orange-700", status: "Invited", you: false },
    { name: "Amy Zhao", email: "amy.z@company.com", role: "Viewer", avatar: "AZ", color: "bg-pink-100 text-pink-700", status: "Active", you: false },
  ];

  const roles = ["Admin", "Recruiter", "Hiring Manager", "Viewer"];

  return (
    <div className="space-y-4">
      <SectionCard>
        <SectionBlock title="Invite Team Member" description="Add colleagues to your TalentSol workspace">
          <div className="flex items-center gap-2">
            <input
              type="email"
              placeholder="colleague@company.com"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              className="flex-1 bg-gray-50 border border-gray-200 rounded-md px-3 py-1.5 text-[12px] text-gray-800 outline-none focus:border-blue-400 focus:bg-white transition-colors"
            />
            <select className="bg-gray-50 border border-gray-200 rounded-md px-3 py-1.5 text-[12px] text-gray-700 outline-none focus:border-blue-400 transition-colors">
              {roles.map((r) => <option key={r}>{r}</option>)}
            </select>
            <button className="flex items-center gap-1.5 bg-gray-900 text-white px-3 py-1.5 rounded-md text-[12px] font-medium hover:bg-gray-800 transition-colors shrink-0">
              <Plus size={13} />
              Invite
            </button>
          </div>
        </SectionBlock>
      </SectionCard>

      <SectionCard>
        <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
          <p className="text-[12px] font-semibold text-gray-700">Members ({members.length})</p>
          <p className="text-[11px] text-gray-400">3 of 25 seats used</p>
        </div>
        <div>
          {members.map((member, i) => (
            <div
              key={member.email}
              className={`flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors ${i > 0 ? "border-t border-gray-50" : ""}`}
            >
              <div className={`w-8 h-8 rounded-full ${member.color} flex items-center justify-center shrink-0`}>
                <span className="text-[10px] font-semibold">{member.avatar}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-[12px] font-medium text-gray-900">{member.name}</p>
                  {member.you && (
                    <span className="text-[10px] text-gray-400">(you)</span>
                  )}
                </div>
                <p className="text-[11px] text-gray-500">{member.email}</p>
              </div>
              <select
                defaultValue={member.role}
                className="bg-transparent border border-gray-200 rounded-md px-2 py-1 text-[11px] text-gray-600 outline-none hover:border-gray-300 transition-colors"
              >
                {roles.map((r) => <option key={r}>{r}</option>)}
              </select>
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                member.status === "Active" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
              }`}>
                {member.status}
              </span>
              {!member.you && (
                <button className="text-gray-300 hover:text-red-400 transition-colors ml-1">
                  <Trash2 size={13} />
                </button>
              )}
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}

function NotificationsSection() {
  const [prefs, setPrefs] = useState<Record<string, boolean>>({
    new_application: true,
    interview_scheduled: true,
    offer_accepted: true,
    offer_rejected: false,
    doc_signed: true,
    team_messages: true,
    weekly_digest: false,
    stage_moved: true,
    score_submitted: false,
    offer_expiring: true,
  });

  const toggle = (key: string) => setPrefs((p) => ({ ...p, [key]: !p[key] }));

  const groups = [
    {
      title: "Candidate Activity",
      items: [
        { key: "new_application", label: "New candidate application", sub: "Notified when a new application arrives for a role you own" },
        { key: "stage_moved", label: "Candidate stage change", sub: "When a candidate is moved to a new pipeline stage" },
        { key: "score_submitted", label: "Scorecard submitted", sub: "When an interviewer submits a scorecard" },
      ],
    },
    {
      title: "Interviews & Offers",
      items: [
        { key: "interview_scheduled", label: "Interview scheduled", sub: "Reminders for upcoming interviews on your calendar" },
        { key: "offer_accepted", label: "Offer accepted", sub: "When a candidate accepts an offer" },
        { key: "offer_rejected", label: "Offer declined", sub: "When a candidate declines an offer" },
        { key: "offer_expiring", label: "Offer expiring soon", sub: "24 hours before an offer expires" },
      ],
    },
    {
      title: "Team & System",
      items: [
        { key: "doc_signed", label: "Document signed", sub: "When a candidate signs a required document" },
        { key: "team_messages", label: "Team messages", sub: "New messages from team members mentioning you" },
        { key: "weekly_digest", label: "Weekly digest email", sub: "A weekly summary of your hiring activity every Monday" },
      ],
    },
  ];

  return (
    <div className="space-y-4">
      {groups.map((group) => (
        <SectionCard key={group.title}>
          <SectionBlock title={group.title}>
            {group.items.map((item, i) => (
              <div
                key={item.key}
                className={`flex items-center justify-between py-3 ${i > 0 ? "border-t border-gray-100" : ""}`}
              >
                <div>
                  <p className="text-[12px] font-medium text-gray-800">{item.label}</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">{item.sub}</p>
                </div>
                <ToggleSwitch checked={prefs[item.key]} onChange={() => toggle(item.key)} />
              </div>
            ))}
          </SectionBlock>
        </SectionCard>
      ))}
    </div>
  );
}

function PipelineSection() {
  const [stages, setStages] = useState([
    { id: 1, name: "Applied", color: "bg-gray-400", count: 320, editable: false },
    { id: 2, name: "Screening", color: "bg-yellow-400", count: 210, editable: false },
    { id: 3, name: "Phone Interview", color: "bg-blue-400", count: 140, editable: false },
    { id: 4, name: "Technical Interview", color: "bg-blue-600", count: 88, editable: false },
    { id: 5, name: "Final Interview", color: "bg-purple-400", count: 42, editable: false },
    { id: 6, name: "Offer", color: "bg-orange-400", count: 28, editable: false },
    { id: 7, name: "Hired", color: "bg-green-500", count: 18, editable: false },
  ]);

  const removeStage = (id: number) => setStages((s) => s.filter((st) => st.id !== id));

  const colorOptions = [
    "bg-gray-400", "bg-blue-400", "bg-blue-600", "bg-purple-400",
    "bg-yellow-400", "bg-orange-400", "bg-green-500", "bg-red-400", "bg-teal-400",
  ];

  return (
    <div className="space-y-4">
      <SectionCard>
        <SectionBlock
          title="Pipeline Stages"
          description="Define and order the stages in your hiring pipeline. Changes affect all jobs."
        >
          <div className="space-y-2">
            {stages.map((stage, i) => (
              <div
                key={stage.id}
                className="flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-lg px-3 py-2.5 group"
              >
                <GripVertical size={14} className="text-gray-300 shrink-0 cursor-grab" />
                <div className={`w-2.5 h-2.5 rounded-full ${stage.color} shrink-0`} />
                <span className="text-[12px] font-medium text-gray-800 flex-1">{stage.name}</span>
                <span className="text-[11px] text-gray-400">{stage.count} candidates</span>
                {i !== 0 && i !== stages.length - 1 && (
                  <button
                    onClick={() => removeStage(stage.id)}
                    className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 transition-all"
                  >
                    <X size={13} />
                  </button>
                )}
              </div>
            ))}
          </div>
          <button className="mt-3 w-full flex items-center justify-center gap-1.5 border border-dashed border-gray-200 rounded-lg py-2 text-[12px] text-gray-400 hover:border-blue-300 hover:text-blue-500 transition-colors">
            <Plus size={13} />
            Add Stage
          </button>
          <div className="flex justify-end pt-4 mt-2 border-t border-gray-100">
            <SaveButton />
          </div>
        </SectionBlock>
      </SectionCard>

      <SectionCard>
        <SectionBlock title="Stage Automation" description="Automatically move candidates or trigger actions based on stage changes">
          <FieldRow label="Auto-advance on scorecard complete" hint="Move to next stage when all scorecards are submitted">
            <ToggleSwitch checked={false} onChange={() => {}} />
          </FieldRow>
          <FieldRow label="Auto-reject after 30 days in screening" hint="Automatically reject candidates who are idle in Screening">
            <ToggleSwitch checked={false} onChange={() => {}} />
          </FieldRow>
          <FieldRow label="Send email when stage changes" hint="Notify candidates automatically on every stage transition">
            <ToggleSwitch checked={true} onChange={() => {}} />
          </FieldRow>
        </SectionBlock>
      </SectionCard>
    </div>
  );
}

const integrations = [
  {
    name: "LinkedIn",
    description: "Post jobs and source candidates directly from LinkedIn Recruiter",
    logo: "LI",
    logoColor: "bg-blue-700",
    connected: true,
    plan: null,
  },
  {
    name: "Slack",
    description: "Get notifications and collaborate with your team in Slack channels",
    logo: "SL",
    logoColor: "bg-purple-600",
    connected: true,
    plan: null,
  },
  {
    name: "Google Calendar",
    description: "Sync interviews automatically with Google Calendar for your team",
    logo: "GC",
    logoColor: "bg-red-500",
    connected: false,
    plan: null,
  },
  {
    name: "Greenhouse",
    description: "Migrate data and sync candidates from Greenhouse ATS",
    logo: "GH",
    logoColor: "bg-green-600",
    connected: false,
    plan: null,
  },
  {
    name: "DocuSign",
    description: "Send offer letters and collect e-signatures via DocuSign",
    logo: "DS",
    logoColor: "bg-yellow-600",
    connected: false,
    plan: "Business",
  },
  {
    name: "Workday",
    description: "Push hired candidates and data to Workday HRIS automatically",
    logo: "WD",
    logoColor: "bg-indigo-600",
    connected: false,
    plan: "Enterprise",
  },
];

function IntegrationsSection() {
  const [connectedState, setConnectedState] = useState<Record<string, boolean>>(
    Object.fromEntries(integrations.map((i) => [i.name, i.connected]))
  );

  return (
    <div className="space-y-4">
      <SectionCard>
        <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-[13px] font-semibold text-gray-900">Connected Apps</p>
            <p className="text-[11px] text-gray-500">Extend TalentSol by connecting your favorite tools</p>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
            <div className="w-2 h-2 rounded-full bg-green-400" />
            {Object.values(connectedState).filter(Boolean).length} connected
          </div>
        </div>
        <div className="divide-y divide-gray-50">
          {integrations.map((integration) => (
            <div key={integration.name} className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors">
              <div className={`w-10 h-10 rounded-lg ${integration.logoColor} flex items-center justify-center shrink-0`}>
                <span className="text-white text-[11px] font-bold">{integration.logo}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-[12px] font-semibold text-gray-900">{integration.name}</p>
                  {integration.plan && (
                    <span className="flex items-center gap-0.5 text-[10px] font-medium px-1.5 py-0.5 bg-amber-50 text-amber-600 border border-amber-200 rounded-full">
                      <Crown size={9} />
                      {integration.plan}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-gray-400 truncate">{integration.description}</p>
              </div>
              {integration.plan ? (
                <button className="flex items-center gap-1 text-[11px] font-medium text-amber-600 px-3 py-1.5 border border-amber-200 bg-amber-50 rounded-md hover:bg-amber-100 transition-colors shrink-0">
                  <Zap size={11} />
                  Upgrade
                </button>
              ) : connectedState[integration.name] ? (
                <div className="flex items-center gap-2 shrink-0">
                  <span className="flex items-center gap-1 text-[11px] text-green-600 font-medium">
                    <Check size={11} />
                    Connected
                  </span>
                  <button
                    onClick={() => setConnectedState((s) => ({ ...s, [integration.name]: false }))}
                    className="text-[11px] text-gray-400 px-2 py-1 border border-gray-200 rounded-md hover:border-red-200 hover:text-red-500 transition-colors"
                  >
                    Disconnect
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConnectedState((s) => ({ ...s, [integration.name]: true }))}
                  className="text-[11px] font-medium text-gray-700 px-3 py-1.5 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors shrink-0"
                >
                  Connect
                </button>
              )}
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}

function EmailSection() {
  const [signature, setSignature] = useState("Best regards,\nJana Doe\nHR Manager, TalentSol\njana.doe@company.com");

  return (
    <div className="space-y-4">
      <SectionCard>
        <SectionBlock title="Email Sender" description="Configure how outbound emails appear to candidates">
          <FieldRow label="From name" hint="Name shown to candidates in your emails">
            <input
              defaultValue="Jana Doe · TalentSol"
              className="bg-gray-50 border border-gray-200 rounded-md px-3 py-1.5 text-[12px] text-gray-800 outline-none focus:border-blue-400 transition-colors w-52"
            />
          </FieldRow>
          <FieldRow label="Reply-to address" hint="Candidates' replies will go to this address">
            <input
              defaultValue="recruiting@company.com"
              className="bg-gray-50 border border-gray-200 rounded-md px-3 py-1.5 text-[12px] text-gray-800 outline-none focus:border-blue-400 transition-colors w-52"
            />
          </FieldRow>
        </SectionBlock>
      </SectionCard>

      <SectionCard>
        <SectionBlock title="Email Signature" description="Appended automatically to outbound emails sent to candidates">
          <textarea
            value={signature}
            onChange={(e) => setSignature(e.target.value)}
            rows={5}
            className="w-full bg-gray-50 border border-gray-200 rounded-md px-3 py-2 text-[12px] text-gray-800 outline-none focus:border-blue-400 focus:bg-white transition-colors resize-none font-mono"
          />
          <div className="flex justify-end pt-3">
            <SaveButton />
          </div>
        </SectionBlock>
      </SectionCard>

      <SectionCard>
        <SectionBlock title="Email Templates" description="Reusable templates for common candidate communications">
          {[
            { name: "Application Received", trigger: "On application submit", last: "2 days ago" },
            { name: "Interview Invitation", trigger: "Manual or automated", last: "1 week ago" },
            { name: "Offer Letter", trigger: "When moving to Offer stage", last: "3 weeks ago" },
            { name: "Rejection Notice", trigger: "On candidate rejection", last: "1 month ago" },
          ].map((tpl, i) => (
            <div key={tpl.name} className={`flex items-center justify-between py-3 ${i > 0 ? "border-t border-gray-100" : ""}`}>
              <div>
                <p className="text-[12px] font-medium text-gray-800">{tpl.name}</p>
                <p className="text-[11px] text-gray-400">{tpl.trigger} · Edited {tpl.last}</p>
              </div>
              <button className="text-[11px] text-blue-600 hover:underline">Edit</button>
            </div>
          ))}
          <button className="mt-3 w-full flex items-center justify-center gap-1.5 border border-dashed border-gray-200 rounded-lg py-2 text-[12px] text-gray-400 hover:border-blue-300 hover:text-blue-500 transition-colors">
            <Plus size={13} />
            New Template
          </button>
        </SectionBlock>
      </SectionCard>
    </div>
  );
}

function BillingSection() {
  return (
    <div className="space-y-4">
      {/* Current Plan */}
      <SectionCard>
        <div className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-[13px] font-semibold text-gray-900">Current Plan</h3>
              <p className="text-[11px] text-gray-500 mt-0.5">You are on the Growth plan</p>
            </div>
            <span className="flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1 bg-blue-50 text-blue-700 border border-blue-100 rounded-full">
              <Zap size={11} />
              Growth
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-4">
            {[
              { label: "Active Jobs", value: "38", limit: "50" },
              { label: "Team Members", value: "5", limit: "25" },
              { label: "Candidates (MTD)", value: "284", limit: "Unlimited" },
            ].map((usage) => (
              <div key={usage.label} className="bg-gray-50 rounded-lg p-3">
                <p className="text-[11px] text-gray-500">{usage.label}</p>
                <p className="text-[18px] font-semibold text-gray-900 mt-0.5">{usage.value}</p>
                <p className="text-[10px] text-gray-400">of {usage.limit}</p>
                {usage.limit !== "Unlimited" && (
                  <div className="mt-2 h-1 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${(parseInt(usage.value) / parseInt(usage.limit)) * 100}%` }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div>
              <p className="text-[12px] text-gray-700">
                <span className="font-semibold">$299/month</span>
                <span className="text-gray-400"> · Billed annually · Next renewal Mar 7, 2027</span>
              </p>
            </div>
            <div className="flex gap-2">
              <button className="px-3 py-1.5 border border-gray-200 rounded-md text-[12px] text-gray-600 hover:bg-gray-50 transition-colors">
                Manage Plan
              </button>
              <button className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-900 text-white rounded-md text-[12px] font-medium hover:bg-gray-800 transition-colors">
                <Crown size={12} />
                Upgrade to Business
              </button>
            </div>
          </div>
        </div>
      </SectionCard>

      {/* Payment Method */}
      <SectionCard>
        <SectionBlock title="Payment Method">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-7 bg-gray-900 rounded flex items-center justify-center">
                <span className="text-white text-[9px] font-bold">VISA</span>
              </div>
              <div>
                <p className="text-[12px] font-medium text-gray-800">Visa ending in 4242</p>
                <p className="text-[11px] text-gray-400">Expires 08 / 2027</p>
              </div>
            </div>
            <button className="text-[11px] text-blue-600 hover:underline">Update</button>
          </div>
        </SectionBlock>
      </SectionCard>

      {/* Billing History */}
      <SectionCard>
        <SectionBlock title="Billing History" description="Download past invoices for your records">
          {[
            { date: "Feb 7, 2026", amount: "$299.00", status: "Paid" },
            { date: "Jan 7, 2026", amount: "$299.00", status: "Paid" },
            { date: "Dec 7, 2025", amount: "$299.00", status: "Paid" },
            { date: "Nov 7, 2025", amount: "$299.00", status: "Paid" },
          ].map((invoice, i) => (
            <div key={invoice.date} className={`flex items-center justify-between py-2.5 ${i > 0 ? "border-t border-gray-100" : ""}`}>
              <div className="flex items-center gap-3">
                <span className="text-[12px] text-gray-700">{invoice.date}</span>
                <span className="text-[10px] font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">{invoice.status}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[12px] font-medium text-gray-900">{invoice.amount}</span>
                <button className="text-gray-400 hover:text-gray-600 transition-colors">
                  <Download size={13} />
                </button>
              </div>
            </div>
          ))}
        </SectionBlock>
      </SectionCard>
    </div>
  );
}

function ComingSoonSection({ sectionKey }: { sectionKey: SectionKey }) {
  const all = navGroups.flatMap((g) => g.items);
  const section = all.find((s) => s.key === sectionKey);
  const Icon = section?.icon || SettingsIcon;

  const descriptions: Record<string, string> = {
    templates: "Create reusable job description templates to speed up job posting across your team.",
    scorecards: "Build structured interview scorecards with custom criteria and rating scales.",
    appearance: "Customize the look and feel of your TalentSol workspace and careers page.",
    localization: "Set date formats, number conventions, and translations for your team.",
  };

  return (
    <SectionCard>
      <div className="p-10 flex flex-col items-center justify-center text-center">
        <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mb-4">
          <Icon size={22} className="text-gray-400" />
        </div>
        <p className="text-[13px] font-semibold text-gray-700">{section?.label} Settings</p>
        <p className="text-[12px] text-gray-400 mt-1.5 max-w-xs">
          {descriptions[sectionKey] || "This section is currently under development and will be available soon."}
        </p>
        <button className="mt-4 flex items-center gap-1.5 text-[12px] text-blue-600 font-medium hover:underline">
          <RefreshCw size={12} />
          Check for updates
        </button>
      </div>
    </SectionCard>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function Settings() {
  const [activeSection, setActiveSection] = useState<SectionKey>("profile");

  const all = navGroups.flatMap((g) => g.items);
  const activeItem = all.find((s) => s.key === activeSection);

  const sectionTitles: Record<SectionKey, { title: string; description: string }> = {
    profile: { title: "Profile", description: "Personal information and workspace preferences" },
    security: { title: "Security", description: "Password, two-factor authentication, and active sessions" },
    company: { title: "Company", description: "Organization details and public careers page settings" },
    team: { title: "Team Members", description: "Manage access, roles, and invitations for your workspace" },
    notifications: { title: "Notifications", description: "Control which events trigger alerts for your account" },
    pipeline: { title: "Pipeline Stages", description: "Customize hiring stages and stage automation rules" },
    templates: { title: "Job Templates", description: "Reusable templates to speed up job posting" },
    scorecards: { title: "Scorecards", description: "Structured interview evaluation frameworks" },
    integrations: { title: "Integrations", description: "Connect TalentSol with third-party tools and services" },
    email: { title: "Email", description: "Sender settings, signatures, and outbound email templates" },
    appearance: { title: "Appearance", description: "Customize your workspace theme and branding" },
    localization: { title: "Localization", description: "Date formats, language, and regional settings" },
    billing: { title: "Billing & Plan", description: "Manage your subscription, usage, and payment details" },
  };

  const renderContent = () => {
    switch (activeSection) {
      case "profile": return <ProfileSection />;
      case "security": return <SecuritySection />;
      case "company": return <CompanySection />;
      case "team": return <TeamSection />;
      case "notifications": return <NotificationsSection />;
      case "pipeline": return <PipelineSection />;
      case "integrations": return <IntegrationsSection />;
      case "email": return <EmailSection />;
      case "billing": return <BillingSection />;
      default: return <ComingSoonSection sectionKey={activeSection} />;
    }
  };

  const info = sectionTitles[activeSection];

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        icon={SettingsIcon}
        iconColor="text-gray-600"
        iconBg="bg-gray-100"
        title="Settings"
        subtitle="Manage your account, workspace, and system configuration"
      />

      <div className="flex flex-1 overflow-hidden">
        {/* ── Left sidebar ── */}
        <div className="w-[200px] bg-white border-r border-gray-200 flex-col shrink-0 overflow-y-auto hidden md:flex">
          <nav className="py-3 px-2">
            {navGroups.map((group) => (
              <div key={group.label} className="mb-4">
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-3 mb-1">
                  {group.label}
                </p>
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeSection === item.key;
                  return (
                    <button
                      key={item.key}
                      onClick={() => setActiveSection(item.key)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md transition-colors text-left group ${
                        isActive
                          ? "bg-blue-50 text-blue-700"
                          : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
                      }`}
                    >
                      <Icon
                        size={13}
                        className={`shrink-0 ${isActive ? "text-blue-600" : "text-gray-400 group-hover:text-gray-600"}`}
                      />
                      <span className="text-[12px] font-medium truncate">{item.label}</span>
                      {isActive && <ChevronRight size={11} className="ml-auto shrink-0 text-blue-400" />}
                    </button>
                  );
                })}
              </div>
            ))}
          </nav>
        </div>

        {/* ── Main content ── */}
        <div className="flex-1 overflow-y-auto bg-gray-50">
          {/* Section header */}
          <div className="sticky top-0 z-10 bg-gray-50 border-b border-gray-200 px-6 py-3 flex items-center gap-3">
            {activeItem && (
              <>
                <activeItem.icon size={15} className="text-gray-400 shrink-0" />
                <div>
                  <p className="text-[13px] font-semibold text-gray-900">{info.title}</p>
                  <p className="text-[11px] text-gray-400">{info.description}</p>
                </div>
              </>
            )}
          </div>

          {/* Section content */}
          <div className="p-6 max-w-2xl">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
}
