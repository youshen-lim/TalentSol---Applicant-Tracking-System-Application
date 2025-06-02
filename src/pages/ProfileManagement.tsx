import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Briefcase,
  Edit3,
  Save,
  Camera,
  Shield,
  Activity,
  Settings,
  Eye,
  EyeOff
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';

interface ProfileData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  bio: string;
  avatarUrl?: string;
}

interface SecurityData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const ProfileManagement: React.FC = () => {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  // Mock user data
  const [userData] = useState({
    id: 'user_123',
    firstName: 'Jane',
    lastName: 'Doe',
    email: 'jane.doe@talentsol.com',
    phone: '+1 (555) 123-4567',
    bio: 'HR Manager with 8+ years of experience in talent acquisition and recruitment. Passionate about building diverse teams and creating inclusive hiring processes.',
    avatarUrl: '',
    role: 'HR Manager',
    company: 'TalentSol Inc.',
    joinDate: '2022-03-15',
    lastLogin: '2024-01-20T10:30:00Z',
    totalApplicationsReviewed: 1247,
    totalInterviewsScheduled: 89,
    averageTimeToHire: '14 days'
  });

  const profileForm = useForm<ProfileData>({
    defaultValues: {
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      phone: userData.phone,
      bio: userData.bio,
      avatarUrl: userData.avatarUrl,
    }
  });

  const securityForm = useForm<SecurityData>({
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    }
  });

  const onProfileSubmit = async (data: ProfileData) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.atsBlue({
        title: 'Profile Updated',
        description: 'Your profile information has been updated successfully.'
      });
      
      setIsEditing(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update profile. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const onSecuritySubmit = async (data: SecurityData) => {
    if (data.newPassword !== data.confirmPassword) {
      toast({
        title: 'Error',
        description: 'New passwords do not match.',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.atsBlue({
        title: 'Password Changed',
        description: 'Your password has been updated successfully.'
      });
      
      securityForm.reset();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to change password. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <User className="h-6 w-6 text-ats-blue" />
            Profile Management
          </h1>
          <p className="text-sm text-gray-500">
            Manage your personal information and account settings
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Activity
          </TabsTrigger>
          <TabsTrigger value="preferences" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Preferences
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Overview */}
            <Card className="lg:col-span-1">
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="relative">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src={userData.avatarUrl} />
                      <AvatarFallback className="text-lg bg-ats-blue text-white">
                        {userData.firstName[0]}{userData.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <Button
                      size="sm"
                      variant="outline"
                      className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
                    >
                      <Camera className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold">{userData.firstName} {userData.lastName}</h3>
                    <p className="text-sm text-gray-500">{userData.role}</p>
                    <p className="text-sm text-gray-500">{userData.company}</p>
                  </div>

                  <div className="w-full space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Mail className="h-4 w-4" />
                      <span>{userData.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Phone className="h-4 w-4" />
                      <span>{userData.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span>Joined {formatDate(userData.joinDate)}</span>
                    </div>
                  </div>

                  <Badge variant="outline" className="bg-green-50 text-green-700">
                    Active
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Profile Form */}
            <Card className="lg:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Personal Information</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(!isEditing)}
                >
                  {isEditing ? (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Cancel
                    </>
                  ) : (
                    <>
                      <Edit3 className="h-4 w-4 mr-2" />
                      Edit
                    </>
                  )}
                </Button>
              </CardHeader>
              <CardContent>
                <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        {...profileForm.register('firstName')}
                        disabled={!isEditing}
                        className={!isEditing ? 'bg-gray-50' : ''}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        {...profileForm.register('lastName')}
                        disabled={!isEditing}
                        className={!isEditing ? 'bg-gray-50' : ''}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      {...profileForm.register('email')}
                      disabled={!isEditing}
                      className={!isEditing ? 'bg-gray-50' : ''}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      {...profileForm.register('phone')}
                      disabled={!isEditing}
                      className={!isEditing ? 'bg-gray-50' : ''}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      {...profileForm.register('bio')}
                      disabled={!isEditing}
                      className={!isEditing ? 'bg-gray-50' : ''}
                      rows={4}
                    />
                  </div>

                  {isEditing && (
                    <div className="flex gap-2">
                      <Button type="submit" className="bg-ats-blue hover:bg-ats-dark-blue">
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </Button>
                      <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                        Cancel
                      </Button>
                    </div>
                  )}
                </form>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={securityForm.handleSubmit(onSecuritySubmit)} className="space-y-4 max-w-md">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showPassword ? 'text' : 'password'}
                      {...securityForm.register('currentPassword', { required: true })}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type={showPassword ? 'text' : 'password'}
                    {...securityForm.register('newPassword', { required: true, minLength: 8 })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    {...securityForm.register('confirmPassword', { required: true })}
                  />
                </div>

                <Button type="submit" className="bg-ats-blue hover:bg-ats-dark-blue">
                  Change Password
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-ats-blue">{userData.totalApplicationsReviewed}</div>
                <p className="text-sm text-gray-500">Applications Reviewed</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-ats-blue">{userData.totalInterviewsScheduled}</div>
                <p className="text-sm text-gray-500">Interviews Scheduled</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-ats-blue">{userData.averageTimeToHire}</div>
                <p className="text-sm text-gray-500">Avg. Time to Hire</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Reviewed application from John Smith</p>
                    <p className="text-xs text-gray-500">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Scheduled interview with Sarah Johnson</p>
                    <p className="text-xs text-gray-500">4 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="h-2 w-2 bg-purple-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Updated job posting for Senior Developer</p>
                    <p className="text-xs text-gray-500">1 day ago</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preferences Tab */}
        <TabsContent value="preferences" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Account Preferences</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Last Login</Label>
                    <p className="text-sm text-gray-500">{formatDateTime(userData.lastLogin)}</p>
                  </div>
                </div>
                <Separator />
                <div className="text-center py-8 text-gray-500">
                  <Settings className="h-12 w-12 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Additional Preferences</h3>
                  <p>More preference options will be available here.</p>
                  <Button variant="outline" className="mt-4" onClick={() => setActiveTab('profile')}>
                    Go to Settings Page
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProfileManagement;
