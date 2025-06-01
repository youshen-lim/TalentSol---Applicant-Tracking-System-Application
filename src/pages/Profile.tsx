import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
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
}

const Profile = () => {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

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
      {
        id: '1',
        type: 'interview',
        description: 'Conducted interview with Sarah Johnson for UX Designer position',
        timestamp: '2 hours ago',
      },
      {
        id: '2',
        type: 'hire',
        description: 'Successfully hired Michael Brown as Senior Developer',
        timestamp: '1 day ago',
      },
      {
        id: '3',
        type: 'review',
        description: 'Reviewed 15 applications for Product Manager role',
        timestamp: '2 days ago',
      },
      {
        id: '4',
        type: 'meeting',
        description: 'Attended weekly recruitment strategy meeting',
        timestamp: '3 days ago',
      },
    ],
    skills: [
      'Talent Acquisition',
      'Interview Techniques',
      'Recruitment Strategy',
      'Team Building',
      'Performance Management',
      'HR Analytics',
      'Diversity & Inclusion',
      'Employer Branding',
    ],
    achievements: [
      {
        id: '1',
        title: 'Top Recruiter 2023',
        description: 'Achieved highest hiring success rate in the company',
        date: '2023-12-01',
      },
      {
        id: '2',
        title: 'Diversity Champion',
        description: 'Led initiative that increased diverse hiring by 40%',
        date: '2023-09-15',
      },
      {
        id: '3',
        title: 'Process Innovator',
        description: 'Implemented new ATS system reducing time-to-hire by 25%',
        date: '2023-06-01',
      },
    ],
  });

  const updatePersonalInfo = (field: keyof ProfileData['personalInfo'], value: string) => {
    setProfile(prev => ({
      ...prev,
      personalInfo: { ...prev.personalInfo, [field]: value }
    }));
  };

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfile(prev => ({
          ...prev,
          avatar: e.target?.result as string
        }));
      };
      reader.readAsDataURL(file);
      
      toast.atsBlue({
        title: "Profile picture updated",
        description: "Your profile picture has been updated successfully.",
      });
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsSaving(false);
    
    toast.atsBlue({
      title: "Profile updated",
      description: "Your profile has been updated successfully.",
    });
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'interview':
        return <Calendar className="h-4 w-4 text-ats-blue" />;
      case 'hire':
        return <Award className="h-4 w-4 text-green-500" />;
      case 'review':
        return <User className="h-4 w-4 text-ats-purple" />;
      case 'meeting':
        return <Briefcase className="h-4 w-4 text-gray-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <User className="h-6 w-6 text-ats-blue" />
            Profile
          </h1>
          <p className="text-sm text-gray-500">
            Manage your personal information and view your activity
          </p>
        </div>
        <Button 
          onClick={handleSave} 
          disabled={isSaving}
          className="bg-ats-blue hover:bg-ats-dark-blue"
        >
          {isSaving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Information */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>
                Update your personal details and contact information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar Section */}
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={profile.avatar} alt={profile.personalInfo.name} />
                  <AvatarFallback className="text-lg bg-ats-blue/10 text-ats-blue">
                    {profile.personalInfo.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <Label htmlFor="avatar-upload" className="cursor-pointer">
                    <Button variant="outline" size="sm" asChild>
                      <span>
                        <Upload className="h-4 w-4 mr-2" />
                        Change Photo
                      </span>
                    </Button>
                  </Label>
                  <Input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    JPG, PNG or GIF. Max size 2MB.
                  </p>
                </div>
              </div>

              <Separator />

              {/* Basic Information */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={profile.personalInfo.name}
                    onChange={(e) => updatePersonalInfo('name', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="title">Job Title</Label>
                  <Input
                    id="title"
                    value={profile.personalInfo.title}
                    onChange={(e) => updatePersonalInfo('title', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.personalInfo.email}
                    onChange={(e) => updatePersonalInfo('email', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={profile.personalInfo.phone}
                    onChange={(e) => updatePersonalInfo('phone', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={profile.personalInfo.location}
                    onChange={(e) => updatePersonalInfo('location', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    value={profile.personalInfo.department}
                    onChange={(e) => updatePersonalInfo('department', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={profile.personalInfo.bio}
                  onChange={(e) => updatePersonalInfo('bio', e.target.value)}
                  rows={4}
                  placeholder="Tell us about yourself..."
                />
              </div>
            </CardContent>
          </Card>

          {/* Skills */}
          <Card>
            <CardHeader>
              <CardTitle>Skills & Expertise</CardTitle>
              <CardDescription>
                Your areas of expertise and specialization
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((skill) => (
                  <Badge key={skill} variant="secondary" className="bg-ats-blue/10 text-ats-blue">
                    {skill}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Achievements */}
          <Card>
            <CardHeader>
              <CardTitle>Achievements</CardTitle>
              <CardDescription>
                Recognition and milestones in your career
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {profile.achievements.map((achievement) => (
                  <div key={achievement.id} className="flex items-start gap-3">
                    <Award className="h-5 w-5 text-yellow-500 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-medium">{achievement.title}</h4>
                      <p className="text-sm text-gray-600">{achievement.description}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(achievement.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Performance Stats</CardTitle>
              <CardDescription>
                Your recruitment performance overview
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-ats-blue" />
                  <span className="text-sm">Candidates Reviewed</span>
                </div>
                <span className="font-semibold">{profile.stats.candidatesReviewed}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-ats-blue" />
                  <span className="text-sm">Interviews Conducted</span>
                </div>
                <span className="font-semibold">{profile.stats.interviewsConducted}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Successful Hires</span>
                </div>
                <span className="font-semibold">{profile.stats.hiresMade}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-ats-purple" />
                  <span className="text-sm">Avg. Time to Hire</span>
                </div>
                <span className="font-semibold">{profile.stats.avgTimeToHire}</span>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Your latest actions and updates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {profile.recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3">
                    {getActivityIcon(activity.type)}
                    <div className="flex-1">
                      <p className="text-sm">{activity.description}</p>
                      <p className="text-xs text-gray-400">{activity.timestamp}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Contact Info */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-gray-400" />
                <span>{profile.personalInfo.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-gray-400" />
                <span>{profile.personalInfo.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-gray-400" />
                <span>{profile.personalInfo.location}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span>Joined {new Date(profile.personalInfo.joinDate).toLocaleDateString()}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;
