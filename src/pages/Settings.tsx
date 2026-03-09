import React, { useState, useEffect } from 'react';
import { userApi } from '@/services/api';
import { useSearchParams } from 'react-router-dom';
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
  Crown,
  Zap,
  RefreshCw,
  Copy,
  Download,
  ExternalLink,
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

// ─── Types ────────────────────────────────────────────────────────────────────

type SectionKey =
  | 'profile' | 'security'
  | 'company' | 'team' | 'notifications'
  | 'pipeline' | 'templates' | 'scorecards'
  | 'integrations' | 'email'
  | 'appearance' | 'localization' | 'billing';

// ─── Nav groups ───────────────────────────────────────────────────────────────

const navGroups = [
  {
    label: 'Account',
    items: [
      { key: 'profile' as SectionKey, label: 'Profile', icon: User },
      { key: 'security' as SectionKey, label: 'Security', icon: Shield },
    ],
  },
  {
    label: 'Workspace',
    items: [
      { key: 'company' as SectionKey, label: 'Company', icon: Building2 },
      { key: 'team' as SectionKey, label: 'Team Members', icon: Users },
      { key: 'notifications' as SectionKey, label: 'Notifications', icon: Bell },
    ],
  },
  {
    label: 'Recruiting',
    items: [
      { key: 'pipeline' as SectionKey, label: 'Pipeline Stages', icon: GitBranch },
      { key: 'templates' as SectionKey, label: 'Job Templates', icon: FileText },
      { key: 'scorecards' as SectionKey, label: 'Scorecards', icon: ClipboardList },
    ],
  },
  {
    label: 'Integrations',
    items: [
      { key: 'integrations' as SectionKey, label: 'Integrations', icon: Plug },
      { key: 'email' as SectionKey, label: 'Email', icon: Mail },
    ],
  },
  {
    label: 'System',
    items: [
      { key: 'appearance' as SectionKey, label: 'Appearance', icon: Palette },
      { key: 'localization' as SectionKey, label: 'Localization', icon: Globe },
      { key: 'billing' as SectionKey, label: 'Billing & Plan', icon: CreditCard },
    ],
  },
];

const allNavItems = navGroups.flatMap(g => g.items);

const sectionMeta: Record<SectionKey, { title: string; description: string }> = {
  profile:       { title: 'Profile',         description: 'Personal information and workspace preferences' },
  security:      { title: 'Security',        description: 'Password, two-factor authentication, and active sessions' },
  company:       { title: 'Company',         description: 'Organization details and public careers page settings' },
  team:          { title: 'Team Members',    description: 'Manage access, roles, and invitations for your workspace' },
  notifications: { title: 'Notifications',  description: 'Control which events trigger alerts for your account' },
  pipeline:      { title: 'Pipeline Stages', description: 'Customize hiring stages and stage automation rules' },
  templates:     { title: 'Job Templates',  description: 'Reusable templates to speed up job posting' },
  scorecards:    { title: 'Scorecards',     description: 'Structured interview evaluation frameworks' },
  integrations:  { title: 'Integrations',   description: 'Connect TalentSol with third-party tools and services' },
  email:         { title: 'Email',          description: 'Sender settings, signatures, and outbound email templates' },
  appearance:    { title: 'Appearance',     description: 'Customize your workspace theme and branding' },
  localization:  { title: 'Localization',   description: 'Date formats, language, and regional settings' },
  billing:       { title: 'Billing & Plan', description: 'Manage your subscription, usage, and payment details' },
};

// ─── Reusable helpers ─────────────────────────────────────────────────────────

function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
        checked ? 'bg-indigo-600' : 'bg-gray-200'
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${
          checked ? 'translate-x-4' : 'translate-x-0'
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
        <h3 className="text-gray-900" style={{ fontSize: 13, fontWeight: 600 }}>{title}</h3>
        {description && (
          <p className="text-gray-500 mt-0.5" style={{ fontSize: 11 }}>{description}</p>
        )}
      </div>
      {children}
    </div>
  );
}

function FieldRow({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between py-3 border-t border-gray-100">
      <div className="flex-1 min-w-0 mr-6">
        <p className="text-gray-800" style={{ fontSize: 12, fontWeight: 500 }}>{label}</p>
        {hint && <p className="text-gray-400 mt-0.5" style={{ fontSize: 11 }}>{hint}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

function StyledInput({
  defaultValue,
  placeholder,
  type = 'text',
  className = '',
}: {
  defaultValue?: string;
  placeholder?: string;
  type?: string;
  className?: string;
}) {
  return (
    <input
      type={type}
      defaultValue={defaultValue}
      placeholder={placeholder}
      className={`w-full bg-gray-50 border border-gray-200 rounded-md px-3 py-1.5 text-gray-800 outline-none focus:border-indigo-400 focus:bg-white transition-colors ${className}`}
      style={{ fontSize: 12 }}
    />
  );
}

function SaveButton({ label = 'Save Changes', onClick }: { label?: string; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="bg-gray-900 text-white px-4 py-1.5 rounded-md hover:bg-gray-800 transition-colors"
      style={{ fontSize: 12, fontWeight: 500 }}
    >
      {label}
    </button>
  );
}

// ─── Coming Soon placeholder ──────────────────────────────────────────────────

function ComingSoon({ sectionKey }: { sectionKey: SectionKey }) {
  const item = allNavItems.find(i => i.key === sectionKey);
  const Icon = item?.icon || SettingsIcon;
  const descriptions: Record<string, string> = {
    templates:    'Create reusable job description templates to speed up job posting across your team.',
    scorecards:   'Build structured interview scorecards with custom criteria and rating scales.',
    appearance:   'Customize the look and feel of your TalentSol workspace and careers page.',
    localization: 'Set date formats, number conventions, and translations for your team.',
  };
  return (
    <SectionCard>
      <div className="p-10 flex flex-col items-center justify-center text-center">
        <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mb-4">
          <Icon size={22} className="text-gray-400" />
        </div>
        <p className="text-gray-700" style={{ fontSize: 13, fontWeight: 600 }}>{item?.label} Settings</p>
        <p className="text-gray-400 mt-1.5 max-w-xs" style={{ fontSize: 12 }}>
          {descriptions[sectionKey] || 'This section is currently under development and will be available soon.'}
        </p>
        <button className="mt-4 flex items-center gap-1.5 text-indigo-600 font-medium hover:underline" style={{ fontSize: 12 }}>
          <RefreshCw size={12} />
          Check for updates
        </button>
      </div>
    </SectionCard>
  );
}

// ─── Section: Profile ─────────────────────────────────────────────────────────

function ProfileSection({ onSave }: { onSave: (data: any) => void }) {
  const [profile, setProfile] = useState({
    firstName: 'Jana',
    lastName: 'Doe',
    email: 'jana.doe@company.com',
    phone: '+1 555-0199',
    jobTitle: 'HR Manager',
    department: 'Human Resources',
  });

  const fields: { label: string; key: keyof typeof profile }[] = [
    { label: 'First Name', key: 'firstName' },
    { label: 'Last Name', key: 'lastName' },
    { label: 'Email Address', key: 'email' },
    { label: 'Phone Number', key: 'phone' },
    { label: 'Job Title', key: 'jobTitle' },
    { label: 'Department', key: 'department' },
  ];

  return (
    <div className="space-y-4">
      <SectionCard>
        <SectionBlock title="Personal Information" description="Your name and contact details visible to your team">
          {/* Avatar */}
          <div className="flex items-center gap-4 mb-5 pb-5 border-b border-gray-100">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-indigo-600 flex items-center justify-center">
                <span className="text-white text-xl font-semibold">J</span>
              </div>
              <button className="absolute -bottom-1 -right-1 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-sm hover:bg-gray-50 transition-colors">
                <Camera size={11} className="text-gray-600" />
              </button>
            </div>
            <div>
              <p className="text-gray-900" style={{ fontSize: 13, fontWeight: 600 }}>{profile.firstName} {profile.lastName}</p>
              <p className="text-gray-500" style={{ fontSize: 11 }}>{profile.jobTitle} · TalentSol</p>
              <div className="flex items-center gap-2 mt-1.5">
                <button className="text-indigo-600 hover:underline" style={{ fontSize: 11 }}>Upload photo</button>
                <span className="text-gray-300">·</span>
                <button className="text-gray-400 hover:underline" style={{ fontSize: 11 }}>Remove</button>
              </div>
            </div>
          </div>

          {/* Fields */}
          <div className="grid grid-cols-2 gap-3">
            {fields.map(field => (
              <div key={field.label}>
                <label className="block text-gray-500 mb-1" style={{ fontSize: 11, fontWeight: 500 }}>{field.label}</label>
                <input
                  type="text"
                  value={profile[field.key]}
                  onChange={e => setProfile(p => ({ ...p, [field.key]: e.target.value }))}
                  className="w-full bg-gray-50 border border-gray-200 rounded-md px-3 py-1.5 text-gray-800 outline-none focus:border-indigo-400 focus:bg-white transition-colors"
                  style={{ fontSize: 12 }}
                />
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-4 mt-2 border-t border-gray-100">
            <SaveButton onClick={() => onSave(profile)} />
          </div>
        </SectionBlock>
      </SectionCard>

      <SectionCard>
        <SectionBlock title="Preferences" description="Your personal workspace preferences">
          <FieldRow label="Language" hint="Display language for your account">
            <select
              className="bg-gray-50 border border-gray-200 rounded-md px-3 py-1.5 text-gray-800 outline-none focus:border-indigo-400 transition-colors"
              style={{ fontSize: 12 }}
            >
              <option>English (US)</option>
              <option>English (UK)</option>
              <option>Spanish</option>
            </select>
          </FieldRow>
          <FieldRow label="Time Zone" hint="Used for scheduling and calendar events">
            <select
              className="bg-gray-50 border border-gray-200 rounded-md px-3 py-1.5 text-gray-800 outline-none focus:border-indigo-400 transition-colors"
              style={{ fontSize: 12 }}
            >
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

// ─── Section: Security ────────────────────────────────────────────────────────

function SecuritySection({ onSave }: { onSave: (data: any) => void }) {
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [twoFa, setTwoFa] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const sessions = [
    { device: 'Chrome on macOS', location: 'San Francisco, CA', time: 'Active now', current: true },
    { device: 'Safari on iPhone 15', location: 'San Francisco, CA', time: '2 hours ago', current: false },
    { device: 'Chrome on Windows', location: 'New York, NY', time: '3 days ago', current: false },
  ];

  const passwordFields = [
    { label: 'Current Password', show: showCurrent, toggle: () => setShowCurrent(v => !v), value: currentPassword, onChange: setCurrentPassword },
    { label: 'New Password', show: showNew, toggle: () => setShowNew(v => !v), value: newPassword, onChange: setNewPassword },
    { label: 'Confirm New Password', show: showNew, toggle: () => setShowNew(v => !v), value: confirmPassword, onChange: setConfirmPassword },
  ];

  return (
    <div className="space-y-4">
      <SectionCard>
        <SectionBlock title="Change Password" description="Use a strong password with at least 12 characters">
          <div className="space-y-3">
            {passwordFields.map(field => (
              <div key={field.label}>
                <label className="block text-gray-500 mb-1" style={{ fontSize: 11, fontWeight: 500 }}>{field.label}</label>
                <div className="relative">
                  <input
                    type={field.show ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={field.value}
                    onChange={e => field.onChange(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-md px-3 py-1.5 pr-9 text-gray-800 outline-none focus:border-indigo-400 focus:bg-white transition-colors"
                    style={{ fontSize: 12 }}
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
            <SaveButton label="Update Password" onClick={() => onSave({ currentPassword, newPassword })} />
          </div>
        </SectionBlock>
      </SectionCard>

      <SectionCard>
        <SectionBlock title="Two-Factor Authentication" description="Add a second layer of protection to your account">
          <FieldRow label="Authenticator App" hint="Use an app like Google Authenticator or Authy">
            <div className="flex items-center gap-3">
              <span
                className={`px-2 py-0.5 rounded-full ${twoFa ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}
                style={{ fontSize: 11, fontWeight: 500 }}
              >
                {twoFa ? 'Enabled' : 'Disabled'}
              </span>
              <ToggleSwitch checked={twoFa} onChange={setTwoFa} />
            </div>
          </FieldRow>
          {twoFa && (
            <div className="mt-3 p-3 bg-green-50 border border-green-100 rounded-md flex items-start gap-2">
              <Check size={13} className="text-green-600 mt-0.5 shrink-0" />
              <p className="text-green-700" style={{ fontSize: 11 }}>Two-factor authentication is active. Your account has enhanced security.</p>
            </div>
          )}
        </SectionBlock>
      </SectionCard>

      <SectionCard>
        <SectionBlock title="Active Sessions" description="Manage devices where you're currently signed in">
          <div>
            {sessions.map((session, i) => (
              <div
                key={i}
                className={`flex items-center justify-between py-3 ${i > 0 ? 'border-t border-gray-100' : ''}`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-md flex items-center justify-center mt-0.5">
                    <Shield size={14} className="text-gray-500" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-gray-800" style={{ fontSize: 12, fontWeight: 500 }}>{session.device}</p>
                      {session.current && (
                        <span className="px-1.5 py-0.5 bg-indigo-50 text-indigo-600 rounded-full" style={{ fontSize: 10, fontWeight: 500 }}>
                          Current
                        </span>
                      )}
                    </div>
                    <p className="text-gray-400" style={{ fontSize: 11 }}>{session.location} · {session.time}</p>
                  </div>
                </div>
                {!session.current && (
                  <button className="text-red-500 hover:text-red-700 transition-colors" style={{ fontSize: 11, fontWeight: 500 }}>
                    Revoke
                  </button>
                )}
              </div>
            ))}
          </div>
          <div className="pt-3 border-t border-gray-100">
            <button className="text-red-500 hover:text-red-700 transition-colors" style={{ fontSize: 12, fontWeight: 500 }}>
              Sign out all other sessions
            </button>
          </div>
        </SectionBlock>
      </SectionCard>
    </div>
  );
}

// ─── Section: Company ─────────────────────────────────────────────────────────

function CompanySection({ onSave }: { onSave: () => void }) {
  return (
    <div className="space-y-4">
      <SectionCard>
        <SectionBlock title="Company Profile" description="Basic information about your organization">
          <div className="flex items-center gap-4 mb-5 pb-5 border-b border-gray-100">
            <div className="w-14 h-14 rounded-lg bg-indigo-600 flex items-center justify-center">
              <span className="text-white text-lg font-bold">T</span>
            </div>
            <div>
              <p className="text-gray-900" style={{ fontSize: 13, fontWeight: 600 }}>TalentSol Inc.</p>
              <p className="text-gray-500" style={{ fontSize: 11 }}>talentsol.com</p>
              <button className="text-indigo-600 mt-1 hover:underline" style={{ fontSize: 11 }}>Upload company logo</button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Company Name', value: 'TalentSol Inc.' },
              { label: 'Industry', value: 'Technology' },
              { label: 'Company Size', value: '51–200 employees' },
              { label: 'Website', value: 'https://talentsol.com' },
              { label: 'Headquarters', value: 'San Francisco, CA' },
              { label: 'Founded', value: '2019' },
            ].map(field => (
              <div key={field.label}>
                <label className="block text-gray-500 mb-1" style={{ fontSize: 11, fontWeight: 500 }}>{field.label}</label>
                <StyledInput defaultValue={field.value} />
              </div>
            ))}
          </div>

          <div className="mt-3">
            <label className="block text-gray-500 mb-1" style={{ fontSize: 11, fontWeight: 500 }}>Company Description</label>
            <textarea
              defaultValue="TalentSol is a modern applicant tracking system helping teams hire smarter and faster."
              rows={3}
              className="w-full bg-gray-50 border border-gray-200 rounded-md px-3 py-1.5 text-gray-800 outline-none focus:border-indigo-400 focus:bg-white transition-colors resize-none"
              style={{ fontSize: 12 }}
            />
          </div>

          <div className="flex justify-end pt-4 mt-2 border-t border-gray-100">
            <SaveButton onClick={onSave} />
          </div>
        </SectionBlock>
      </SectionCard>

      <SectionCard>
        <SectionBlock title="Careers Page" description="Customize your public-facing job board">
          <FieldRow label="Public careers URL" hint="Share this link with candidates">
            <div className="flex items-center gap-2">
              <code className="bg-gray-100 px-2 py-1 rounded text-gray-600" style={{ fontSize: 11 }}>
                talentsol.com/careers/acme
              </code>
              <button className="text-gray-400 hover:text-gray-600 transition-colors"><Copy size={13} /></button>
              <button className="text-gray-400 hover:text-gray-600 transition-colors"><ExternalLink size={13} /></button>
            </div>
          </FieldRow>
        </SectionBlock>
      </SectionCard>
    </div>
  );
}

// ─── Section: Team Members ────────────────────────────────────────────────────

function TeamSection() {
  const [inviteEmail, setInviteEmail] = useState('');
  const roles = ['Admin', 'Recruiter', 'Hiring Manager', 'Viewer'];
  const members = [
    { name: 'Jana Doe', email: 'jana.doe@company.com', role: 'Admin', avatar: 'JD', color: 'bg-blue-100 text-blue-700', status: 'Active', you: true },
    { name: 'Marcus Lee', email: 'marcus.lee@company.com', role: 'Recruiter', avatar: 'ML', color: 'bg-green-100 text-green-700', status: 'Active', you: false },
    { name: 'Sarah Kim', email: 'sarah.kim@company.com', role: 'Hiring Manager', avatar: 'SK', color: 'bg-purple-100 text-purple-700', status: 'Active', you: false },
    { name: 'Tom Bradley', email: 'tom.b@company.com', role: 'Recruiter', avatar: 'TB', color: 'bg-orange-100 text-orange-700', status: 'Invited', you: false },
    { name: 'Amy Zhao', email: 'amy.z@company.com', role: 'Viewer', avatar: 'AZ', color: 'bg-pink-100 text-pink-700', status: 'Active', you: false },
  ];

  return (
    <div className="space-y-4">
      <SectionCard>
        <SectionBlock title="Invite Team Member" description="Add colleagues to your TalentSol workspace">
          <div className="flex items-center gap-2">
            <input
              type="email"
              placeholder="colleague@company.com"
              value={inviteEmail}
              onChange={e => setInviteEmail(e.target.value)}
              className="flex-1 bg-gray-50 border border-gray-200 rounded-md px-3 py-1.5 text-gray-800 outline-none focus:border-indigo-400 focus:bg-white transition-colors"
              style={{ fontSize: 12 }}
            />
            <select
              className="bg-gray-50 border border-gray-200 rounded-md px-3 py-1.5 text-gray-700 outline-none focus:border-indigo-400 transition-colors"
              style={{ fontSize: 12 }}
            >
              {roles.map(r => <option key={r}>{r}</option>)}
            </select>
            <button
              className="flex items-center gap-1.5 bg-gray-900 text-white px-3 py-1.5 rounded-md hover:bg-gray-800 transition-colors shrink-0"
              style={{ fontSize: 12, fontWeight: 500 }}
            >
              <Plus size={13} />
              Invite
            </button>
          </div>
        </SectionBlock>
      </SectionCard>

      <SectionCard>
        <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
          <p className="text-gray-700" style={{ fontSize: 12, fontWeight: 600 }}>Members ({members.length})</p>
          <p className="text-gray-400" style={{ fontSize: 11 }}>3 of 25 seats used</p>
        </div>
        <div>
          {members.map((member, i) => (
            <div
              key={member.email}
              className={`flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors ${i > 0 ? 'border-t border-gray-50' : ''}`}
            >
              <div className={`w-8 h-8 rounded-full ${member.color} flex items-center justify-center shrink-0`}>
                <span style={{ fontSize: 10, fontWeight: 600 }}>{member.avatar}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-gray-900" style={{ fontSize: 12, fontWeight: 500 }}>{member.name}</p>
                  {member.you && <span className="text-gray-400" style={{ fontSize: 10 }}>(you)</span>}
                </div>
                <p className="text-gray-500" style={{ fontSize: 11 }}>{member.email}</p>
              </div>
              <select
                defaultValue={member.role}
                className="bg-transparent border border-gray-200 rounded-md px-2 py-1 text-gray-600 outline-none hover:border-gray-300 transition-colors"
                style={{ fontSize: 11 }}
              >
                {roles.map(r => <option key={r}>{r}</option>)}
              </select>
              <span
                className={`px-2 py-0.5 rounded-full ${member.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}
                style={{ fontSize: 10, fontWeight: 500 }}
              >
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

// ─── Section: Notifications ───────────────────────────────────────────────────

function NotificationsSection({ onToggle }: { onToggle?: (key: string, value: boolean) => void }) {
  const [prefs, setPrefs] = useState<Record<string, boolean>>({
    new_application:      true,
    stage_moved:          true,
    score_submitted:      false,
    interview_scheduled:  true,
    offer_accepted:       true,
    offer_rejected:       false,
    offer_expiring:       true,
    doc_signed:           true,
    team_messages:        true,
    weekly_digest:        false,
  });

  const toggle = (key: string) => {
    const newValue = !prefs[key];
    setPrefs(p => ({ ...p, [key]: newValue }));
    onToggle?.(key, newValue);
  };

  const groups = [
    {
      title: 'Candidate Activity',
      items: [
        { key: 'new_application', label: 'New candidate application', sub: 'Notified when a new application arrives for a role you own' },
        { key: 'stage_moved', label: 'Candidate stage change', sub: 'When a candidate is moved to a new pipeline stage' },
        { key: 'score_submitted', label: 'Scorecard submitted', sub: 'When an interviewer submits a scorecard' },
      ],
    },
    {
      title: 'Interviews & Offers',
      items: [
        { key: 'interview_scheduled', label: 'Interview scheduled', sub: 'Reminders for upcoming interviews on your calendar' },
        { key: 'offer_accepted', label: 'Offer accepted', sub: 'When a candidate accepts an offer' },
        { key: 'offer_rejected', label: 'Offer declined', sub: 'When a candidate declines an offer' },
        { key: 'offer_expiring', label: 'Offer expiring soon', sub: '24 hours before an offer expires' },
      ],
    },
    {
      title: 'Team & System',
      items: [
        { key: 'doc_signed', label: 'Document signed', sub: 'When a candidate signs a required document' },
        { key: 'team_messages', label: 'Team messages', sub: 'New messages from team members mentioning you' },
        { key: 'weekly_digest', label: 'Weekly digest email', sub: 'A weekly summary of your hiring activity every Monday' },
      ],
    },
  ];

  return (
    <div className="space-y-4">
      {groups.map(group => (
        <SectionCard key={group.title}>
          <SectionBlock title={group.title}>
            {group.items.map((item, i) => (
              <div
                key={item.key}
                className={`flex items-center justify-between py-3 ${i > 0 ? 'border-t border-gray-100' : ''}`}
              >
                <div>
                  <p className="text-gray-800" style={{ fontSize: 12, fontWeight: 500 }}>{item.label}</p>
                  <p className="text-gray-400 mt-0.5" style={{ fontSize: 11 }}>{item.sub}</p>
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

// ─── Section: Pipeline Stages ─────────────────────────────────────────────────

function PipelineSection({ onSave }: { onSave: () => void }) {
  const [stages, setStages] = useState([
    { id: 1, name: 'Applied', color: 'bg-gray-400', count: 320 },
    { id: 2, name: 'Screening', color: 'bg-yellow-400', count: 210 },
    { id: 3, name: 'Phone Interview', color: 'bg-blue-400', count: 140 },
    { id: 4, name: 'Technical Interview', color: 'bg-blue-600', count: 88 },
    { id: 5, name: 'Final Interview', color: 'bg-purple-400', count: 42 },
    { id: 6, name: 'Offer', color: 'bg-orange-400', count: 28 },
    { id: 7, name: 'Hired', color: 'bg-green-500', count: 18 },
  ]);

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
                <span className="text-gray-800 flex-1" style={{ fontSize: 12, fontWeight: 500 }}>{stage.name}</span>
                <span className="text-gray-400" style={{ fontSize: 11 }}>{stage.count} candidates</span>
                {i !== 0 && i !== stages.length - 1 && (
                  <button
                    onClick={() => setStages(s => s.filter(st => st.id !== stage.id))}
                    className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 transition-all"
                  >
                    <X size={13} />
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            className="mt-3 w-full flex items-center justify-center gap-1.5 border border-dashed border-gray-200 rounded-lg py-2 text-gray-400 hover:border-indigo-300 hover:text-indigo-500 transition-colors"
            style={{ fontSize: 12 }}
          >
            <Plus size={13} />
            Add Stage
          </button>
          <div className="flex justify-end pt-4 mt-2 border-t border-gray-100">
            <SaveButton onClick={onSave} />
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

// ─── Section: Integrations ────────────────────────────────────────────────────

const integrationList = [
  { name: 'LinkedIn', description: 'Post jobs and source candidates directly from LinkedIn Recruiter', logo: 'LI', logoColor: 'bg-blue-700', connected: true, plan: null },
  { name: 'Slack', description: 'Get notifications and collaborate with your team in Slack channels', logo: 'SL', logoColor: 'bg-purple-600', connected: true, plan: null },
  { name: 'Google Calendar', description: 'Sync interviews automatically with Google Calendar for your team', logo: 'GC', logoColor: 'bg-red-500', connected: false, plan: null },
  { name: 'Greenhouse', description: 'Migrate data and sync candidates from Greenhouse ATS', logo: 'GH', logoColor: 'bg-green-600', connected: false, plan: null },
  { name: 'DocuSign', description: 'Send offer letters and collect e-signatures via DocuSign', logo: 'DS', logoColor: 'bg-yellow-600', connected: false, plan: 'Business' },
  { name: 'Workday', description: 'Push hired candidates and data to Workday HRIS automatically', logo: 'WD', logoColor: 'bg-indigo-600', connected: false, plan: 'Enterprise' },
];

function IntegrationsSection() {
  const [connected, setConnected] = useState<Record<string, boolean>>(
    Object.fromEntries(integrationList.map(i => [i.name, i.connected]))
  );

  return (
    <div className="space-y-4">
      <SectionCard>
        <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-gray-900" style={{ fontSize: 13, fontWeight: 600 }}>Connected Apps</p>
            <p className="text-gray-500" style={{ fontSize: 11 }}>Extend TalentSol by connecting your favorite tools</p>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-green-400" />
            <span className="text-gray-500" style={{ fontSize: 11 }}>
              {Object.values(connected).filter(Boolean).length} connected
            </span>
          </div>
        </div>
        <div className="divide-y divide-gray-50">
          {integrationList.map(integration => (
            <div key={integration.name} className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors">
              <div className={`w-10 h-10 rounded-lg ${integration.logoColor} flex items-center justify-center shrink-0`}>
                <span className="text-white" style={{ fontSize: 11, fontWeight: 700 }}>{integration.logo}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-gray-900" style={{ fontSize: 12, fontWeight: 600 }}>{integration.name}</p>
                  {integration.plan && (
                    <span
                      className="flex items-center gap-0.5 px-1.5 py-0.5 bg-amber-50 text-amber-600 border border-amber-200 rounded-full"
                      style={{ fontSize: 10, fontWeight: 500 }}
                    >
                      <Crown size={9} />
                      {integration.plan}
                    </span>
                  )}
                </div>
                <p className="text-gray-400 truncate" style={{ fontSize: 11 }}>{integration.description}</p>
              </div>
              {integration.plan ? (
                <button
                  className="flex items-center gap-1 text-amber-600 px-3 py-1.5 border border-amber-200 bg-amber-50 rounded-md hover:bg-amber-100 transition-colors shrink-0"
                  style={{ fontSize: 11, fontWeight: 500 }}
                >
                  <Zap size={11} />
                  Upgrade
                </button>
              ) : connected[integration.name] ? (
                <div className="flex items-center gap-2 shrink-0">
                  <span className="flex items-center gap-1 text-green-600" style={{ fontSize: 11, fontWeight: 500 }}>
                    <Check size={11} />
                    Connected
                  </span>
                  <button
                    onClick={() => setConnected(s => ({ ...s, [integration.name]: false }))}
                    className="text-gray-400 px-2 py-1 border border-gray-200 rounded-md hover:border-red-200 hover:text-red-500 transition-colors"
                    style={{ fontSize: 11 }}
                  >
                    Disconnect
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConnected(s => ({ ...s, [integration.name]: true }))}
                  className="text-gray-700 px-3 py-1.5 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors shrink-0"
                  style={{ fontSize: 11, fontWeight: 500 }}
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

// ─── Section: Email ───────────────────────────────────────────────────────────

function EmailSection({ onSave }: { onSave: () => void }) {
  const [signature, setSignature] = useState(
    'Best regards,\nJana Doe\nHR Manager, TalentSol\njana.doe@company.com'
  );

  return (
    <div className="space-y-4">
      <SectionCard>
        <SectionBlock title="Email Sender" description="Configure how outbound emails appear to candidates">
          <FieldRow label="From name" hint="Name shown to candidates in your emails">
            <input
              defaultValue="Jana Doe · TalentSol"
              className="bg-gray-50 border border-gray-200 rounded-md px-3 py-1.5 text-gray-800 outline-none focus:border-indigo-400 transition-colors w-52"
              style={{ fontSize: 12 }}
            />
          </FieldRow>
          <FieldRow label="Reply-to address" hint="Candidates' replies will go to this address">
            <input
              defaultValue="recruiting@company.com"
              className="bg-gray-50 border border-gray-200 rounded-md px-3 py-1.5 text-gray-800 outline-none focus:border-indigo-400 transition-colors w-52"
              style={{ fontSize: 12 }}
            />
          </FieldRow>
        </SectionBlock>
      </SectionCard>

      <SectionCard>
        <SectionBlock title="Email Signature" description="Appended automatically to outbound emails sent to candidates">
          <textarea
            value={signature}
            onChange={e => setSignature(e.target.value)}
            rows={5}
            className="w-full bg-gray-50 border border-gray-200 rounded-md px-3 py-2 text-gray-800 outline-none focus:border-indigo-400 focus:bg-white transition-colors resize-none font-mono"
            style={{ fontSize: 12 }}
          />
          <div className="flex justify-end pt-3">
            <SaveButton onClick={onSave} />
          </div>
        </SectionBlock>
      </SectionCard>

      <SectionCard>
        <SectionBlock title="Email Templates" description="Reusable templates for common candidate communications">
          {[
            { name: 'Application Received', trigger: 'On application submit', last: '2 days ago' },
            { name: 'Interview Invitation', trigger: 'Manual or automated', last: '1 week ago' },
            { name: 'Offer Letter', trigger: 'When moving to Offer stage', last: '3 weeks ago' },
            { name: 'Rejection Notice', trigger: 'On candidate rejection', last: '1 month ago' },
          ].map((tpl, i) => (
            <div
              key={tpl.name}
              className={`flex items-center justify-between py-3 ${i > 0 ? 'border-t border-gray-100' : ''}`}
            >
              <div>
                <p className="text-gray-800" style={{ fontSize: 12, fontWeight: 500 }}>{tpl.name}</p>
                <p className="text-gray-400" style={{ fontSize: 11 }}>{tpl.trigger} · Edited {tpl.last}</p>
              </div>
              <button className="text-indigo-600 hover:underline" style={{ fontSize: 11 }}>Edit</button>
            </div>
          ))}
          <button
            className="mt-3 w-full flex items-center justify-center gap-1.5 border border-dashed border-gray-200 rounded-lg py-2 text-gray-400 hover:border-indigo-300 hover:text-indigo-500 transition-colors"
            style={{ fontSize: 12 }}
          >
            <Plus size={13} />
            New Template
          </button>
        </SectionBlock>
      </SectionCard>
    </div>
  );
}

// ─── Section: Billing ─────────────────────────────────────────────────────────

function BillingSection() {
  return (
    <div className="space-y-4">
      <SectionCard>
        <div className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-gray-900" style={{ fontSize: 13, fontWeight: 600 }}>Current Plan</h3>
              <p className="text-gray-500 mt-0.5" style={{ fontSize: 11 }}>You are on the Growth plan</p>
            </div>
            <span
              className="flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-full"
              style={{ fontSize: 11, fontWeight: 600 }}
            >
              <Zap size={11} />
              Growth
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-4">
            {[
              { label: 'Active Jobs', value: '38', limit: '50' },
              { label: 'Team Members', value: '5', limit: '25' },
              { label: 'Candidates (MTD)', value: '284', limit: 'Unlimited' },
            ].map(usage => (
              <div key={usage.label} className="bg-gray-50 rounded-lg p-3">
                <p className="text-gray-500" style={{ fontSize: 11 }}>{usage.label}</p>
                <p className="text-gray-900 mt-0.5" style={{ fontSize: 18, fontWeight: 600 }}>{usage.value}</p>
                <p className="text-gray-400" style={{ fontSize: 10 }}>of {usage.limit}</p>
                {usage.limit !== 'Unlimited' && (
                  <div className="mt-2 h-1 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-500 rounded-full"
                      style={{ width: `${(parseInt(usage.value) / parseInt(usage.limit)) * 100}%` }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <p className="text-gray-700" style={{ fontSize: 12 }}>
              <span style={{ fontWeight: 600 }}>$299/month</span>
              <span className="text-gray-400"> · Billed annually · Next renewal Mar 7, 2027</span>
            </p>
            <div className="flex gap-2">
              <button
                className="px-3 py-1.5 border border-gray-200 rounded-md text-gray-600 hover:bg-gray-50 transition-colors"
                style={{ fontSize: 12 }}
              >
                Manage Plan
              </button>
              <button
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors"
                style={{ fontSize: 12, fontWeight: 500 }}
              >
                <Crown size={12} />
                Upgrade to Business
              </button>
            </div>
          </div>
        </div>
      </SectionCard>

      <SectionCard>
        <SectionBlock title="Payment Method">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-7 bg-gray-900 rounded flex items-center justify-center">
                <span className="text-white" style={{ fontSize: 9, fontWeight: 700 }}>VISA</span>
              </div>
              <div>
                <p className="text-gray-800" style={{ fontSize: 12, fontWeight: 500 }}>Visa ending in 4242</p>
                <p className="text-gray-400" style={{ fontSize: 11 }}>Expires 08 / 2027</p>
              </div>
            </div>
            <button className="text-indigo-600 hover:underline" style={{ fontSize: 11 }}>Update</button>
          </div>
        </SectionBlock>
      </SectionCard>

      <SectionCard>
        <SectionBlock title="Billing History" description="Download past invoices for your records">
          {[
            { date: 'Feb 7, 2026', amount: '$299.00' },
            { date: 'Jan 7, 2026', amount: '$299.00' },
            { date: 'Dec 7, 2025', amount: '$299.00' },
            { date: 'Nov 7, 2025', amount: '$299.00' },
          ].map((invoice, i) => (
            <div
              key={invoice.date}
              className={`flex items-center justify-between py-2.5 ${i > 0 ? 'border-t border-gray-100' : ''}`}
            >
              <div className="flex items-center gap-3">
                <span className="text-gray-700" style={{ fontSize: 12 }}>{invoice.date}</span>
                <span className="text-green-600 bg-green-50 px-2 py-0.5 rounded-full" style={{ fontSize: 10, fontWeight: 500 }}>Paid</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-gray-900" style={{ fontSize: 12, fontWeight: 500 }}>{invoice.amount}</span>
                <button className="text-gray-400 hover:text-gray-600 transition-colors"><Download size={13} /></button>
              </div>
            </div>
          ))}
        </SectionBlock>
      </SectionCard>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

const Settings = () => {
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeSection, setActiveSection] = useState<SectionKey>('profile');

  useEffect(() => {
    const tab = searchParams.get('tab') as SectionKey | null;
    if (tab && allNavItems.some(n => n.key === tab)) {
      setActiveSection(tab);
    }
  }, [searchParams]);

  const handleTabChange = (key: SectionKey) => {
    setActiveSection(key);
    setSearchParams({ tab: key });
  };

  const handleSave = () => {
    toast({ title: 'Settings saved', description: 'Your changes have been saved successfully.' });
  };

  const handleSaveProfile = async (data: any) => {
    try {
      await userApi.updateProfile(data);
      toast({ title: 'Profile saved', description: 'Your profile has been updated.' });
    } catch {
      toast({ title: 'Error', description: 'Failed to save profile.', variant: 'destructive' });
    }
  };

  const handleSaveSecurity = async (data: any) => {
    try {
      await userApi.changePassword({ currentPassword: data.currentPassword, newPassword: data.newPassword });
      toast({ title: 'Password changed', description: 'Your password has been updated.' });
    } catch {
      toast({ title: 'Error', description: 'Failed to change password.', variant: 'destructive' });
    }
  };

  const handleNotificationChange = async (key: string, value: boolean) => {
    try {
      await userApi.updateSettings({ [key]: value } as any);
    } catch {
      // toggle already updated locally — silent fail acceptable
    }
  };

  const activeItem = allNavItems.find(i => i.key === activeSection);
  const meta = sectionMeta[activeSection];

  const renderContent = () => {
    switch (activeSection) {
      case 'profile':       return <ProfileSection onSave={handleSaveProfile} />;
      case 'security':      return <SecuritySection onSave={handleSaveSecurity} />;
      case 'company':       return <CompanySection onSave={handleSave} />;
      case 'team':          return <TeamSection />;
      case 'notifications': return <NotificationsSection onToggle={handleNotificationChange} />;
      case 'pipeline':      return <PipelineSection onSave={handleSave} />;
      case 'integrations':  return <IntegrationsSection />;
      case 'email':         return <EmailSection onSave={handleSave} />;
      case 'billing':       return <BillingSection />;
      default:              return <ComingSoon sectionKey={activeSection} />;
    }
  };

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 56px)' }}>

      {/* ── Page header ── */}
      <div className="px-6 py-5 flex items-center gap-3 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
          <SettingsIcon size={16} className="text-gray-600" />
        </div>
        <div>
          <h1 className="text-gray-900" style={{ fontSize: 20, fontWeight: 600 }}>Settings</h1>
          <p className="text-gray-500 mt-0.5" style={{ fontSize: 13 }}>
            Manage your account, workspace, and system configuration
          </p>
        </div>
      </div>

      {/* ── Two-column layout ── */}
      <div className="flex flex-1 min-h-0 border-t border-gray-200">

        {/* Left sidebar */}
        <div className="w-[200px] bg-white border-r border-gray-200 shrink-0 overflow-y-auto">
          <nav className="py-3 px-2">
            {navGroups.map(group => (
              <div key={group.label} className="mb-4">
                <p
                  className="text-gray-400 uppercase tracking-wider px-3 mb-1"
                  style={{ fontSize: 10, fontWeight: 600 }}
                >
                  {group.label}
                </p>
                {group.items.map(item => {
                  const Icon = item.icon;
                  const isActive = activeSection === item.key;
                  return (
                    <button
                      key={item.key}
                      onClick={() => handleTabChange(item.key)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md transition-colors text-left group ${
                        isActive
                          ? 'bg-indigo-50 text-indigo-700'
                          : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
                      }`}
                    >
                      <Icon
                        size={13}
                        className={`shrink-0 ${isActive ? 'text-indigo-600' : 'text-gray-400 group-hover:text-gray-600'}`}
                      />
                      <span className="truncate" style={{ fontSize: 12, fontWeight: 500 }}>{item.label}</span>
                      {isActive && <ChevronRight size={11} className="ml-auto shrink-0 text-indigo-400" />}
                    </button>
                  );
                })}
              </div>
            ))}
          </nav>
        </div>

        {/* Content area */}
        <div className="flex-1 overflow-y-auto bg-[#F5F6FA]">

          {/* Sticky section sub-header */}
          <div className="sticky top-0 z-10 bg-[#F5F6FA] border-b border-gray-200 px-6 py-3 flex items-center gap-3">
            {activeItem && (
              <>
                <activeItem.icon size={15} className="text-gray-400 shrink-0" />
                <div>
                  <p className="text-gray-900" style={{ fontSize: 13, fontWeight: 600 }}>{meta.title}</p>
                  <p className="text-gray-400" style={{ fontSize: 11 }}>{meta.description}</p>
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
};

export default Settings;
