import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  Save,
  Upload,
  Activity,
  Award,
  Clock,
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

// ─── Types ──────────────────────────────────────────────────────────────────────

interface ProfileData {
  personalInfo: {
    name: string;
    email: string;
    phone: string;
    location: string;
    bio: string;
    title: string;
    department: string;
    joinDate: string;
  };
  avatar: string;
  stats: {
    candidatesReviewed: number;
    interviewsConducted: number;
    hiresMade: number;
    avgTimeToHire: string;
  };
  recentActivity: Array<{
    id: string;
    type: string;
    description: string;
    timestamp: string;
  }>;
  skills: string[];
  achievements: Array<{
    id: string;
    title: string;
    description: string;
    date: string;
  }>;
  security: {
    twoFactorEnabled: boolean;
    lastPasswordChange: string;
    loginHistory: Array<{
      id: string;
      timestamp: string;
      location: string;
      device: string;
      ipAddress: string;
    }>;
    accountPermissions: string[];
  };
  account: {
    createdDate: string;
    lastLogin: string;
    accountType: string;
    companyAssociation: string;
  };
}

// ─── Page ────────────────────────────────────────────────────────────────────────

const Profile = () => {
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && ['profile', 'account', 'security', 'activity'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const [profile, setProfile] = useState<ProfileData>({
    personalInfo: {
      name: 'Jane Doe',
      email: 'jane.doe@company.com',
      phone: '+1-555-0123',
      location: 'New York, NY',
      bio: 'Experienced HR Manager with 8+ years in talent acquisition and recruitment. Passionate about finding the right talent for growing organizations and building diverse, inclusive teams.',
      title: 'Senior HR Manager',
      department: 'Human Resources',
      joinDate: '2020-03-15',
    },
    avatar: '',
    stats: {
      candidatesReviewed: 1247,
      interviewsConducted: 342,
      hiresMade: 89,
      avgTimeToHire: '18 days',
    },
    recentActivity: [
      { id: '1', type: 'interview', description: 'Conducted interview with Sarah Johnson for UX Designer position', timestamp: '2 hours ago' },
      { id: '2', type: 'hire', description: 'Successfully hired Michael Brown as Senior Developer', timestamp: '1 day ago' },
      { id: '3', type: 'review', description: 'Reviewed 15 applications for Product Manager role', timestamp: '2 days ago' },
      { id: '4', type: 'meeting', description: 'Attended weekly recruitment strategy meeting', timestamp: '3 days ago' },
    ],
    skills: [
      'Talent Acquisition', 'Interview Techniques', 'Recruitment Strategy', 'Team Building',
      'Performance Management', 'HR Analytics', 'Diversity & Inclusion', 'Employer Branding',
    ],
    achievements: [
      { id: '1', title: 'Top Recruiter 2023', description: 'Achieved highest hiring success rate in the company', date: '2023-12-01' },
      { id: '2', title: 'Diversity Champion', description: 'Led initiative that increased diverse hiring by 40%', date: '2023-09-15' },
      { id: '3', title: 'Process Innovator', description: 'Implemented new ATS system reducing time-to-hire by 25%', date: '2023-06-01' },
    ],
    security: {
      twoFactorEnabled: false,
      lastPasswordChange: '2024-01-15',
      loginHistory: [
        { id: '1', timestamp: '2024-01-20 09:15:00', location: 'New York, NY', device: 'Chrome on Windows', ipAddress: '192.168.1.100' },
        { id: '2', timestamp: '2024-01-19 14:30:00', location: 'New York, NY', device: 'Safari on iPhone', ipAddress: '192.168.1.101' },
        { id: '3', timestamp: '2024-01-18 08:45:00', location: 'New York, NY', device: 'Chrome on Windows', ipAddress: '192.168.1.100' },
      ],
      accountPermissions: ['User Management', 'Job Posting', 'Candidate Review', 'Interview Scheduling', 'Report Generation'],
    },
    account: {
      createdDate: '2020-03-15',
      lastLogin: '2024-01-20 09:15:00',
      accountType: 'HR Manager',
      companyAssociation: 'TalentSol Inc.',
    },
  });

  const updatePersonalInfo = (field: keyof ProfileData['personalInfo'], value: string) =>
    setProfile(prev => ({ ...prev, personalInfo: { ...prev.personalInfo, [field]: value } }));

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setProfile(prev => ({ ...prev, avatar: e.target?.result as string }));
      reader.readAsDataURL(file);
      toast.atsBlue({ title: 'Profile picture updated', description: 'Your profile picture has been updated successfully.' });
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
    toast.atsBlue({ title: 'Profile updated', description: 'Your profile has been updated successfully.' });
  };

  const activityIconColor = (type: string) => {
    switch (type) {
      case 'interview': return 'text-indigo-600';
      case 'hire': return 'text-emerald-600';
      case 'review': return 'text-indigo-600';
      default: return 'text-gray-500';
    }
  };

  const initials = profile.personalInfo.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="p-6 space-y-4">

      {/* ── Page header ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
            <User size={16} className="text-indigo-600" />
          </div>
          <div>
            <h1 className="text-gray-900" style={{ fontSize: 20, fontWeight: 600 }}>Profile</h1>
            <p className="text-gray-500 mt-0.5" style={{ fontSize: 13 }}>
              Manage your personal information and view your activity
            </p>
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg transition-all disabled:opacity-60"
        >
          {isSaving
            ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            : <Save size={15} />
          }
          <span style={{ fontSize: 13, fontWeight: 500 }}>{isSaving ? 'Saving...' : 'Save Changes'}</span>
        </button>
      </div>

      {/* ── 3-col grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* ── Main content (left 2/3) ── */}
        <div className="lg:col-span-2 space-y-5">

          {/* Personal info */}
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h3 className="text-gray-900 mb-0.5" style={{ fontSize: 14, fontWeight: 600 }}>Personal Information</h3>
            <p className="text-gray-500 mb-5" style={{ fontSize: 13 }}>Update your personal details and contact information</p>

            {/* Avatar row */}
            <div className="flex items-center gap-4 mb-5">
              <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                {profile.avatar
                  ? <img src={profile.avatar} alt={profile.personalInfo.name} className="w-16 h-16 rounded-full object-cover" />
                  : <span className="text-indigo-700" style={{ fontSize: 22, fontWeight: 700 }}>{initials}</span>
                }
              </div>
              <div>
                <label htmlFor="avatar-upload" className="cursor-pointer">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 transition-all" style={{ fontSize: 13, fontWeight: 500, color: '#374151', display: 'inline-flex' }}>
                    <Upload size={13} />
                    Change Photo
                  </div>
                </label>
                <input id="avatar-upload" type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                <p className="text-gray-400 mt-1" style={{ fontSize: 11 }}>JPG, PNG or GIF. Max size 2MB.</p>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="name" style={{ fontSize: 13 }}>Full Name</Label>
                  <Input id="name" value={profile.personalInfo.name} onChange={(e) => updatePersonalInfo('name', e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="title" style={{ fontSize: 13 }}>Job Title</Label>
                  <Input id="title" value={profile.personalInfo.title} onChange={(e) => updatePersonalInfo('title', e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="email" style={{ fontSize: 13 }}>Email</Label>
                  <Input id="email" type="email" value={profile.personalInfo.email} onChange={(e) => updatePersonalInfo('email', e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="phone" style={{ fontSize: 13 }}>Phone</Label>
                  <Input id="phone" value={profile.personalInfo.phone} onChange={(e) => updatePersonalInfo('phone', e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="location" style={{ fontSize: 13 }}>Location</Label>
                  <Input id="location" value={profile.personalInfo.location} onChange={(e) => updatePersonalInfo('location', e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="department" style={{ fontSize: 13 }}>Department</Label>
                  <Input id="department" value={profile.personalInfo.department} onChange={(e) => updatePersonalInfo('department', e.target.value)} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="bio" style={{ fontSize: 13 }}>Bio</Label>
                <Textarea id="bio" value={profile.personalInfo.bio} onChange={(e) => updatePersonalInfo('bio', e.target.value)} rows={4} placeholder="Tell us about yourself..." />
              </div>
            </div>
          </div>

          {/* Skills */}
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h3 className="text-gray-900 mb-0.5" style={{ fontSize: 14, fontWeight: 600 }}>Skills & Expertise</h3>
            <p className="text-gray-500 mb-4" style={{ fontSize: 13 }}>Your areas of expertise and specialization</p>
            <div className="flex flex-wrap gap-2">
              {profile.skills.map((skill) => (
                <span key={skill} className="px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-full" style={{ fontSize: 12, fontWeight: 500 }}>
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Achievements */}
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h3 className="text-gray-900 mb-0.5" style={{ fontSize: 14, fontWeight: 600 }}>Achievements</h3>
            <p className="text-gray-500 mb-4" style={{ fontSize: 13 }}>Recognition and milestones in your career</p>
            <div className="space-y-4">
              {profile.achievements.map((achievement) => (
                <div key={achievement.id} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center shrink-0 mt-0.5">
                    <Award size={15} className="text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-900" style={{ fontSize: 13, fontWeight: 600 }}>{achievement.title}</p>
                    <p className="text-gray-600 mt-0.5" style={{ fontSize: 12 }}>{achievement.description}</p>
                    <p className="text-gray-400 mt-1" style={{ fontSize: 11 }}>
                      {new Date(achievement.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Right sidebar ── */}
        <div className="space-y-5">

          {/* Performance stats */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h3 className="text-gray-900 mb-0.5" style={{ fontSize: 14, fontWeight: 600 }}>Performance Stats</h3>
            <p className="text-gray-500 mb-4" style={{ fontSize: 12 }}>Your recruitment performance overview</p>
            <div className="space-y-3">
              {[
                { Icon: User,     color: 'text-indigo-600',  label: 'Candidates Reviewed',   value: profile.stats.candidatesReviewed },
                { Icon: Calendar, color: 'text-indigo-600',  label: 'Interviews Conducted',  value: profile.stats.interviewsConducted },
                { Icon: Award,    color: 'text-emerald-600', label: 'Successful Hires',       value: profile.stats.hiresMade },
                { Icon: Clock,    color: 'text-amber-600',   label: 'Avg. Time to Hire',     value: profile.stats.avgTimeToHire },
              ].map(({ Icon, color, label, value }) => (
                <div key={label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon size={13} className={color} />
                    <span className="text-gray-600" style={{ fontSize: 13 }}>{label}</span>
                  </div>
                  <span className="text-gray-900" style={{ fontSize: 13, fontWeight: 600 }}>{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h3 className="text-gray-900 mb-4" style={{ fontSize: 14, fontWeight: 600 }}>Recent Activity</h3>
            <div className="space-y-3">
              {profile.recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center shrink-0 mt-0.5">
                    <Activity size={12} className={activityIconColor(activity.type)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-700" style={{ fontSize: 12 }}>{activity.description}</p>
                    <p className="text-gray-400 mt-0.5" style={{ fontSize: 11 }}>{activity.timestamp}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Contact Info */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h3 className="text-gray-900 mb-4" style={{ fontSize: 14, fontWeight: 600 }}>Contact Information</h3>
            <div className="space-y-2.5">
              {[
                { Icon: Mail,     text: profile.personalInfo.email },
                { Icon: Phone,    text: profile.personalInfo.phone },
                { Icon: MapPin,   text: profile.personalInfo.location },
                { Icon: Calendar, text: `Joined ${new Date(profile.personalInfo.joinDate).toLocaleDateString()}` },
              ].map(({ Icon, text }) => (
                <div key={text} className="flex items-center gap-2">
                  <Icon size={13} className="text-gray-400 shrink-0" />
                  <span className="text-gray-600" style={{ fontSize: 13 }}>{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
