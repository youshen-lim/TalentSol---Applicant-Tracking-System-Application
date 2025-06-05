import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Settings as SettingsIcon,
  User,
  Bell,
  Shield,
  Palette,
  Link,
  Save,
  Eye,
  EyeOff,
  Briefcase,
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { shadows } from '@/components/ui/shadow';
import PageHeader from '@/components/layout/PageHeader';

interface SettingsData {
  account: {
    name: string;
    email: string;
    phone: string;
    bio: string;
    timezone: string;
    language: string;
  };
  notifications: {
    email: boolean;
    browser: boolean;
    mobile: boolean;
    newApplications: boolean;
    interviewReminders: boolean;
    systemUpdates: boolean;
    weeklyReports: boolean;
  };
  privacy: {
    profileVisibility: string;
    activityTracking: boolean;
    dataSharing: boolean;
    analyticsOptIn: boolean;
  };
  appearance: {
    theme: string;
    compactMode: boolean;
    sidebarCollapsed: boolean;
  };
  integrations: {
    linkedin: boolean;
    indeed: boolean;
    slack: boolean;
    calendar: boolean;
  };
  security: {
    twoFactorEnabled: boolean;
    sessionTimeout: string;
    passwordLastChanged: string;
  };
}

const Settings = () => {
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('account');
  const [showPassword, setShowPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Handle URL parameters for tab navigation
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && ['account', 'company', 'notifications', 'privacy', 'appearance', 'integrations', 'security'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const [settings, setSettings] = useState<SettingsData>({
    account: {
      name: 'Jane Doe',
      email: 'jane.doe@company.com',
      phone: '+1-555-0123',
      bio: 'HR Manager with 8+ years of experience in talent acquisition and recruitment.',
      timezone: 'America/New_York',
      language: 'en',
    },
    notifications: {
      email: true,
      browser: true,
      mobile: false,
      newApplications: true,
      interviewReminders: true,
      systemUpdates: false,
      weeklyReports: true,
    },
    privacy: {
      profileVisibility: 'team',
      activityTracking: true,
      dataSharing: false,
      analyticsOptIn: true,
    },
    appearance: {
      theme: 'light',
      compactMode: false,
      sidebarCollapsed: false,
    },
    integrations: {
      linkedin: true,
      indeed: false,
      slack: true,
      calendar: true,
    },
    security: {
      twoFactorEnabled: false,
      sessionTimeout: '8h',
      passwordLastChanged: '2024-01-15',
    },
  });

  const updateAccount = (field: keyof SettingsData['account'], value: string) => {
    setSettings(prev => ({
      ...prev,
      account: { ...prev.account, [field]: value }
    }));
  };

  const updateNotifications = (field: keyof SettingsData['notifications'], value: boolean) => {
    setSettings(prev => ({
      ...prev,
      notifications: { ...prev.notifications, [field]: value }
    }));
  };

  const updatePrivacy = (field: keyof SettingsData['privacy'], value: any) => {
    setSettings(prev => ({
      ...prev,
      privacy: { ...prev.privacy, [field]: value }
    }));
  };

  const updateAppearance = (field: keyof SettingsData['appearance'], value: any) => {
    setSettings(prev => ({
      ...prev,
      appearance: { ...prev.appearance, [field]: value }
    }));
  };

  const updateIntegrations = (field: keyof SettingsData['integrations'], value: boolean) => {
    setSettings(prev => ({
      ...prev,
      integrations: { ...prev.integrations, [field]: value }
    }));
  };

  const updateSecurity = (field: keyof SettingsData['security'], value: any) => {
    setSettings(prev => ({
      ...prev,
      security: { ...prev.security, [field]: value }
    }));
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setSearchParams({ tab: value });
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsSaving(false);
    
    toast.atsBlue({
      title: "Settings saved",
      description: "Your settings have been updated successfully.",
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        subtitle="Manage your account settings and preferences"
        icon={SettingsIcon}
      >
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-blue-600 hover:bg-blue-700 text-white"
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
      </PageHeader>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="account" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Account
          </TabsTrigger>
          <TabsTrigger value="company" className="flex items-center gap-2">
            <Briefcase className="h-4 w-4" />
            Company
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="privacy" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Privacy
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Appearance
          </TabsTrigger>
          <TabsTrigger value="integrations" className="flex items-center gap-2">
            <Link className="h-4 w-4" />
            Integrations
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Security
          </TabsTrigger>
        </TabsList>

        <TabsContent value="account" className="space-y-6">
          <Card className={shadows.card}>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>
                Update your personal details and contact information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={settings.account.name}
                    onChange={(e) => updateAccount('name', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={settings.account.email}
                    onChange={(e) => updateAccount('email', e.target.value)}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={settings.account.phone}
                    onChange={(e) => updateAccount('phone', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select value={settings.account.timezone} onValueChange={(value) => updateAccount('timezone', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/New_York">Eastern Time</SelectItem>
                      <SelectItem value="America/Chicago">Central Time</SelectItem>
                      <SelectItem value="America/Denver">Mountain Time</SelectItem>
                      <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                      <SelectItem value="Europe/London">GMT</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={settings.account.bio}
                  onChange={(e) => updateAccount('bio', e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="company" className="space-y-6">
          <Card className={shadows.card}>
            <CardHeader>
              <CardTitle>Company Profile</CardTitle>
              <CardDescription>
                Manage your company information and settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company-name">Company Name</Label>
                  <Input
                    id="company-name"
                    value="TalentSol Inc."
                    readOnly
                    className="bg-gray-50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company-size">Company Size</Label>
                  <Input
                    id="company-size"
                    value="50-200 employees"
                    readOnly
                    className="bg-gray-50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="industry">Industry</Label>
                  <Input
                    id="industry"
                    value="Technology"
                    readOnly
                    className="bg-gray-50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="founded">Founded</Label>
                  <Input
                    id="founded"
                    value="2018"
                    readOnly
                    className="bg-gray-50"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="company-description">Company Description</Label>
                <Textarea
                  id="company-description"
                  value="TalentSol is a leading provider of AI-powered applicant tracking systems, helping companies streamline their recruitment processes and find the best talent efficiently."
                  readOnly
                  className="bg-gray-50"
                  rows={3}
                />
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Company Settings</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Allow Public Job Listings</Label>
                      <p className="text-sm text-gray-500">Make job postings visible on public job boards</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Enable Candidate Referrals</Label>
                      <p className="text-sm text-gray-500">Allow employees to refer candidates</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Automated Screening</Label>
                      <p className="text-sm text-gray-500">Use AI to pre-screen applications</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card className={shadows.card}>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Choose how you want to receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="text-sm font-medium">Delivery Methods</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="email-notifications">Email Notifications</Label>
                      <p className="text-sm text-gray-500">Receive notifications via email</p>
                    </div>
                    <Switch
                      id="email-notifications"
                      checked={settings.notifications.email}
                      onCheckedChange={(checked) => updateNotifications('email', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="browser-notifications">Browser Notifications</Label>
                      <p className="text-sm text-gray-500">Show notifications in your browser</p>
                    </div>
                    <Switch
                      id="browser-notifications"
                      checked={settings.notifications.browser}
                      onCheckedChange={(checked) => updateNotifications('browser', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="mobile-notifications">Mobile Push Notifications</Label>
                      <p className="text-sm text-gray-500">Receive push notifications on mobile</p>
                    </div>
                    <Switch
                      id="mobile-notifications"
                      checked={settings.notifications.mobile}
                      onCheckedChange={(checked) => updateNotifications('mobile', checked)}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="text-sm font-medium">Notification Types</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="new-applications">New Applications</Label>
                      <p className="text-sm text-gray-500">When new candidates apply</p>
                    </div>
                    <Switch
                      id="new-applications"
                      checked={settings.notifications.newApplications}
                      onCheckedChange={(checked) => updateNotifications('newApplications', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="interview-reminders">Interview Reminders</Label>
                      <p className="text-sm text-gray-500">Upcoming interview notifications</p>
                    </div>
                    <Switch
                      id="interview-reminders"
                      checked={settings.notifications.interviewReminders}
                      onCheckedChange={(checked) => updateNotifications('interviewReminders', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="system-updates">System Updates</Label>
                      <p className="text-sm text-gray-500">Product updates and maintenance</p>
                    </div>
                    <Switch
                      id="system-updates"
                      checked={settings.notifications.systemUpdates}
                      onCheckedChange={(checked) => updateNotifications('systemUpdates', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="weekly-reports">Weekly Reports</Label>
                      <p className="text-sm text-gray-500">Weekly recruitment summary</p>
                    </div>
                    <Switch
                      id="weekly-reports"
                      checked={settings.notifications.weeklyReports}
                      onCheckedChange={(checked) => updateNotifications('weeklyReports', checked)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Privacy Settings</CardTitle>
              <CardDescription>
                Control your privacy and data sharing preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="profile-visibility">Profile Visibility</Label>
                  <Select 
                    value={settings.privacy.profileVisibility} 
                    onValueChange={(value) => updatePrivacy('profileVisibility', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="team">Team Only</SelectItem>
                      <SelectItem value="private">Private</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-gray-500">Who can see your profile information</p>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="activity-tracking">Activity Tracking</Label>
                    <p className="text-sm text-gray-500">Allow tracking of your activity for analytics</p>
                  </div>
                  <Switch
                    id="activity-tracking"
                    checked={settings.privacy.activityTracking}
                    onCheckedChange={(checked) => updatePrivacy('activityTracking', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="data-sharing">Data Sharing</Label>
                    <p className="text-sm text-gray-500">Share anonymized data to improve the platform</p>
                  </div>
                  <Switch
                    id="data-sharing"
                    checked={settings.privacy.dataSharing}
                    onCheckedChange={(checked) => updatePrivacy('dataSharing', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="analytics-opt-in">Analytics Opt-in</Label>
                    <p className="text-sm text-gray-500">Help improve our services with usage analytics</p>
                  </div>
                  <Switch
                    id="analytics-opt-in"
                    checked={settings.privacy.analyticsOptIn}
                    onCheckedChange={(checked) => updatePrivacy('analyticsOptIn', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Appearance Settings</CardTitle>
              <CardDescription>
                Customize the look and feel of your interface
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="theme">Theme</Label>
                  <Select 
                    value={settings.appearance.theme} 
                    onValueChange={(value) => updateAppearance('theme', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="compact-mode">Compact Mode</Label>
                    <p className="text-sm text-gray-500">Use a more compact interface layout</p>
                  </div>
                  <Switch
                    id="compact-mode"
                    checked={settings.appearance.compactMode}
                    onCheckedChange={(checked) => updateAppearance('compactMode', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="sidebar-collapsed">Collapsed Sidebar</Label>
                    <p className="text-sm text-gray-500">Start with sidebar collapsed by default</p>
                  </div>
                  <Switch
                    id="sidebar-collapsed"
                    checked={settings.appearance.sidebarCollapsed}
                    onCheckedChange={(checked) => updateAppearance('sidebarCollapsed', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Third-party Integrations</CardTitle>
              <CardDescription>
                Connect with external services and platforms
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="linkedin-integration">LinkedIn</Label>
                    <p className="text-sm text-gray-500">Import candidates from LinkedIn</p>
                  </div>
                  <Switch
                    id="linkedin-integration"
                    checked={settings.integrations.linkedin}
                    onCheckedChange={(checked) => updateIntegrations('linkedin', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="indeed-integration">Indeed</Label>
                    <p className="text-sm text-gray-500">Sync job postings with Indeed</p>
                  </div>
                  <Switch
                    id="indeed-integration"
                    checked={settings.integrations.indeed}
                    onCheckedChange={(checked) => updateIntegrations('indeed', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="slack-integration">Slack</Label>
                    <p className="text-sm text-gray-500">Send notifications to Slack channels</p>
                  </div>
                  <Switch
                    id="slack-integration"
                    checked={settings.integrations.slack}
                    onCheckedChange={(checked) => updateIntegrations('slack', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="calendar-integration">Calendar</Label>
                    <p className="text-sm text-gray-500">Sync interviews with your calendar</p>
                  </div>
                  <Switch
                    id="calendar-integration"
                    checked={settings.integrations.calendar}
                    onCheckedChange={(checked) => updateIntegrations('calendar', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Manage your account security and authentication
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="two-factor">Two-Factor Authentication</Label>
                    <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                  </div>
                  <Switch
                    id="two-factor"
                    checked={settings.security.twoFactorEnabled}
                    onCheckedChange={(checked) => updateSecurity('twoFactorEnabled', checked)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="session-timeout">Session Timeout</Label>
                  <Select 
                    value={settings.security.sessionTimeout} 
                    onValueChange={(value) => updateSecurity('sessionTimeout', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1h">1 Hour</SelectItem>
                      <SelectItem value="4h">4 Hours</SelectItem>
                      <SelectItem value="8h">8 Hours</SelectItem>
                      <SelectItem value="24h">24 Hours</SelectItem>
                      <SelectItem value="never">Never</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-gray-500">Automatically log out after inactivity</p>
                </div>

                <div className="space-y-2">
                  <Label>Password</Label>
                  <div className="flex gap-2">
                    <Input
                      type={showPassword ? "text" : "password"}
                      value="••••••••••••"
                      readOnly
                      className="flex-1"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <Button variant="outline">
                      Change Password
                    </Button>
                  </div>
                  <p className="text-sm text-gray-500">
                    Last changed: {settings.security.passwordLastChanged}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
