import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Settings,
  Eye,
  Users,
  FileText,
  BarChart3,
  Filter,
  Search,
  Calendar,
  Mail,
  Download,
  Star,
  Clock,
  AlertCircle,
  Grid,
  List,
  CheckCircle,
  Briefcase,
  MoreHorizontal
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { shadows } from '@/components/ui/shadow';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import ApplicationFormBuilder from '@/components/forms/ApplicationFormBuilder';
import PublicApplicationForm from '@/components/forms/PublicApplicationForm';
import StandardApplicationForm from '@/components/forms/StandardApplicationForm';
import ApplicationReviewDashboard from '@/components/forms/ApplicationReviewDashboard';
import { ApplicationFormSchema, Application } from '@/types/application';
import PageHeader from '@/components/layout/PageHeader';

// Import API hooks
import { applicationApi, formApi } from '@/services/api';
import { useJobs } from '@/hooks/useJobs';
import { useDashboardStats } from '@/hooks/useAnalytics';

// Default job data for form building (will be replaced with API data)
const defaultJob = {
  id: 'job_123',
  title: 'Senior Frontend Developer',
  company: 'TalentSol Inc.',
  location: 'San Francisco, CA',
  description: 'We are looking for a Senior Frontend Developer to join our growing team...',
  department: 'Engineering',
  employmentType: 'Full-time',
  salaryRange: {
    min: 120000,
    max: 150000,
    currency: 'USD'
  }
};

const Applications: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  // API hooks
  const { jobs, loading: jobsLoading } = useJobs({ limit: 1, status: 'open' });
  const { stats: dashboardStats, loading: statsLoading } = useDashboardStats();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [formSchema, setFormSchema] = useState<ApplicationFormSchema | null>(null);
  const [showFormBuilder, setShowFormBuilder] = useState(false);
  const [showPublicForm, setShowPublicForm] = useState(false);
  const [applicationStats, setApplicationStats] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'board' | 'list'>('board');
  const [forms, setForms] = useState<any[]>([]);
  const [formsLoading, setFormsLoading] = useState(false);

  // Get the first available job or use default
  const currentJob = jobs?.[0] || defaultJob;

  // Load application statistics with better error handling
  useEffect(() => {
    const loadApplicationStats = async () => {
      try {
        console.log('🔍 Fetching application stats for company comp_1...');
        const response = await applicationApi.getStats();
        console.log('📊 Application stats received:', response);

        // Check if data is valid
        if (response && typeof response === 'object') {
          console.log('✅ Using real API data:', response);

          // Map the API response to match frontend expectations
          const mappedStats = {
            total: response.totalApplications || 0,
            new: response.newApplications || 0,
            conversionRate: response.conversionRate || 0,
            averageScore: response.averageScore || 0,
            topSources: response.sourceStats || [
              { source: 'Company Website', count: Math.floor((response.totalApplications || 0) * 0.43), percentage: 43 },
              { source: 'LinkedIn', count: Math.floor((response.totalApplications || 0) * 0.29), percentage: 29 },
              { source: 'Indeed', count: Math.floor((response.totalApplications || 0) * 0.18), percentage: 18 },
              { source: 'Referrals', count: Math.floor((response.totalApplications || 0) * 0.10), percentage: 10 }
            ],
            applicationsByStatus: response.applicationsByStatus || [],
            recentApplications: response.recentApplications?.map(app => ({
              name: app.candidateName,
              position: app.jobTitle,
              time: new Date(app.submittedAt).toLocaleString(),
              score: app.score || 0,
              status: app.status
            })) || [
              { name: 'Sarah Johnson', position: 'Frontend Developer', time: '2 hours ago', score: 85, status: 'applied' },
              { name: 'Michael Chen', position: 'Backend Developer', time: '4 hours ago', score: 92, status: 'reviewed' },
              { name: 'Emily Davis', position: 'UX Designer', time: '6 hours ago', score: 78, status: 'shortlisted' },
              { name: 'David Wilson', position: 'Product Manager', time: '1 day ago', score: 88, status: 'interviewed' }
            ]
          };

          setApplicationStats(mappedStats);
          console.log('✅ Real data loaded and mapped successfully:', mappedStats);

          // Show success message for real data
          if (response.totalApplications > 0 || response.newApplications > 0) {
            toast({
              title: 'Success',
              description: `Loaded ${response.totalApplications} applications from database.`,
              variant: 'default',
            });
          }
        } else {
          console.warn('⚠️ Invalid data received, using mock data');
          setApplicationStats({
            total: 156,
            new: 23,
            conversionRate: 15.4,
            averageScore: 72,
            topSources: [
              { source: 'Company Website', count: 67, percentage: 43 },
              { source: 'LinkedIn', count: 45, percentage: 29 },
              { source: 'Indeed', count: 28, percentage: 18 },
              { source: 'Referrals', count: 16, percentage: 10 }
            ]
          });
        }
      } catch (error) {
        console.error('❌ Failed to load application stats:', error);
        // Fallback to mock data
        setApplicationStats({
          total: 156,
          new: 23,
          conversionRate: 15.4,
          averageScore: 72,
          topSources: [
            { source: 'Company Website', count: 67, percentage: 43 },
            { source: 'LinkedIn', count: 45, percentage: 29 },
            { source: 'Indeed', count: 28, percentage: 18 },
            { source: 'Referrals', count: 16, percentage: 10 }
          ]
        });
        toast({
          title: 'Warning',
          description: 'API error. Using sample data. Please check your connection.',
          variant: 'destructive',
        });
      }
    };

    loadApplicationStats();
  }, [toast]);

  // Load forms from backend
  useEffect(() => {
    const loadForms = async () => {
      try {
        setFormsLoading(true);
        console.log('🔍 Fetching forms from backend...');
        const response = await formApi.getForms({ limit: 50 });
        console.log('📋 Forms received:', response);

        if (response && response.forms) {
          setForms(response.forms);
          console.log('✅ Forms loaded successfully:', response.forms.length);
        } else {
          console.warn('⚠️ No forms data received');
          setForms([]);
        }
      } catch (error) {
        console.error('❌ Failed to load forms:', error);
        setForms([]);
        toast({
          title: 'Warning',
          description: 'Failed to load forms. Using sample data.',
          variant: 'destructive',
        });
      } finally {
        setFormsLoading(false);
      }
    };

    loadForms();
  }, [toast]);

  const handleSaveForm = async (schema: ApplicationFormSchema) => {
    try {
      console.log('💾 Saving form to backend:', schema);

      if (schema.id && schema.id.startsWith('form_')) {
        // Create new form
        const response = await formApi.createForm(schema);
        console.log('✅ Form created:', response);

        // Reload forms
        const formsResponse = await formApi.getForms({ limit: 50 });
        if (formsResponse && formsResponse.forms) {
          setForms(formsResponse.forms);
        }
      } else {
        // Update existing form
        const response = await formApi.updateForm(schema.id, schema);
        console.log('✅ Form updated:', response);

        // Reload forms
        const formsResponse = await formApi.getForms({ limit: 50 });
        if (formsResponse && formsResponse.forms) {
          setForms(formsResponse.forms);
        }
      }

      setFormSchema(schema);
      setShowFormBuilder(false);
      toast({
        title: 'Form Saved',
        description: 'Application form has been saved successfully.',
        variant: 'default',
      });
    } catch (error) {
      console.error('❌ Failed to save form:', error);
      toast({
        title: 'Save Failed',
        description: 'Failed to save form. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handlePreviewForm = (schema: ApplicationFormSchema) => {
    setFormSchema(schema);
    setShowPublicForm(true);
  };

  const handleSubmitApplication = async (application: Partial<Application>) => {
    try {
      await applicationApi.submitApplication(application);

      toast.atsBlue({
        title: 'Application Submitted',
        description: 'Your application has been submitted successfully!'
      });

      setShowPublicForm(false);
    } catch (error) {
      toast.atsBlue({
        title: 'Submission Failed',
        description: 'Failed to submit application. Please try again.'
      });
    }
  };

  const handleApplicationAction = (applicationId: string, action: string) => {
    console.log(`Action ${action} on application ${applicationId}`);
  };

  const handleBulkAction = (applicationIds: string[], action: string) => {
    console.log(`Bulk action ${action} on applications:`, applicationIds);
  };

  if (showFormBuilder) {
    return (
      <ApplicationFormBuilder
        jobId={currentJob.id}
        initialSchema={formSchema || undefined}
        onSave={handleSaveForm}
        onPreview={handlePreviewForm}
        onClose={() => setShowFormBuilder(false)}
        onNavigateToPreview={() => {
          setShowFormBuilder(false);
          navigate('/applications/preview');
        }}
      />
    );
  }

  if (showPublicForm) {
    const defaultSchema = {
      id: 'default_form',
      jobId: currentJob.id,
      title: 'Job Application Form',
      description: 'Please fill out this form to apply for the position.',
      sections: [
        {
          id: 'personal',
          title: 'Personal Information',
          description: 'Basic candidate details',
          order: 0,
          fields: [
            {
              id: 'firstName',
              type: 'TEXT' as const,
              label: 'First Name',
              placeholder: 'Enter your first name',
              required: true,
              order: 0,
              section: 'personal'
            },
            {
              id: 'lastName',
              type: 'TEXT' as const,
              label: 'Last Name',
              placeholder: 'Enter your last name',
              required: true,
              order: 1,
              section: 'personal'
            },
            {
              id: 'email',
              type: 'EMAIL' as const,
              label: 'Email Address',
              placeholder: 'your.email@example.com',
              required: true,
              order: 2,
              section: 'personal'
            },
            {
              id: 'phone',
              type: 'PHONE' as const,
              label: 'Phone Number',
              placeholder: '+1 (555) 123-4567',
              required: false,
              order: 3,
              section: 'personal'
            }
          ]
        },
        {
          id: 'professional',
          title: 'Professional Information',
          description: 'Work experience and skills',
          order: 1,
          fields: [
            {
              id: 'experience',
              type: 'TEXTAREA' as const,
              label: 'Work Experience',
              placeholder: 'Describe your relevant work experience...',
              required: true,
              order: 0,
              section: 'professional'
            },
            {
              id: 'skills',
              type: 'TEXTAREA' as const,
              label: 'Skills',
              placeholder: 'List your relevant skills...',
              required: false,
              order: 1,
              section: 'professional'
            }
          ]
        },
        {
          id: 'documents',
          title: 'Documents',
          description: 'Resume, cover letter, and other files',
          order: 2,
          fields: [
            {
              id: 'resume',
              type: 'FILE' as const,
              label: 'Resume',
              placeholder: 'Upload your resume',
              required: true,
              order: 0,
              section: 'documents',
              validation: {
                fileTypes: ['.pdf', '.doc', '.docx'],
                maxFileSize: 5242880
              }
            },
            {
              id: 'coverLetter',
              type: 'FILE' as const,
              label: 'Cover Letter',
              placeholder: 'Upload your cover letter (optional)',
              required: false,
              order: 1,
              section: 'documents',
              validation: {
                fileTypes: ['.pdf', '.doc', '.docx'],
                maxFileSize: 5242880
              }
            }
          ]
        }
      ],
      settings: {
        allowSave: true,
        autoSave: true,
        showProgress: true,
        multiStep: true,
        requireLogin: false,
        gdprCompliance: true,
        eeocQuestions: false
      },
      emailSettings: {
        confirmationTemplate: 'default',
        autoResponse: true
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'current_user',
      version: 1
    };

    return (
      <PublicApplicationForm
        schema={formSchema || defaultSchema}
        job={currentJob}
        onSubmit={handleSubmitApplication}
        onClose={() => setShowPublicForm(false)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Application Management"
        subtitle="Manage job application forms and review candidate submissions"
        icon={FileText}
      >
        <Button variant="outline" onClick={() => setShowFormBuilder(true)}>
          <Settings className="h-4 w-4 mr-2" />
          Form Builder
        </Button>
        <Button onClick={() => setShowPublicForm(true)} className="bg-blue-600 hover:bg-blue-700 text-white">
          <Eye className="h-4 w-4 mr-2" />
          Preview Application Form
        </Button>
      </PageHeader>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className={shadows.cardEnhanced}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? '...' : (applicationStats?.total || dashboardStats?.totalApplications || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card className={shadows.cardEnhanced}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Applications</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? '...' : (applicationStats?.new || dashboardStats?.newApplications || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              +5 this week
            </p>
          </CardContent>
        </Card>

        <Card className={shadows.cardEnhanced}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? '...' : (applicationStats?.conversionRate || dashboardStats?.conversionRate || 0)}%
            </div>
            <p className="text-xs text-muted-foreground">
              +2.1% from last month
            </p>
          </CardContent>
        </Card>

        <Card className={shadows.cardEnhanced}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? '...' : (applicationStats?.averageScore || dashboardStats?.averageScore || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Quality metric
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="forms">Application Forms</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          {/* Quick Actions */}
          <Card className={shadows.card}>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button 
                  variant="outline" 
                  className="h-20 flex-col gap-2"
                  onClick={() => setShowFormBuilder(true)}
                >
                  <Settings className="h-6 w-6" />
                  <span>Build Application Form</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-20 flex-col gap-2"
                  onClick={() => navigate('/candidates')}
                >
                  <Users className="h-6 w-6" />
                  <span>Review Applications</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-20 flex-col gap-2"
                  onClick={() => setActiveTab('analytics')}
                >
                  <BarChart3 className="h-6 w-6" />
                  <span>Form Analytics</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className={shadows.card}>
              <CardHeader>
                <CardTitle>Recent Applications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: 'Sarah Johnson', position: 'Frontend Developer', time: '2 hours ago', score: 85 },
                    { name: 'Michael Chen', position: 'Backend Developer', time: '4 hours ago', score: 92 },
                    { name: 'Emily Davis', position: 'UX Designer', time: '6 hours ago', score: 78 },
                    { name: 'David Wilson', position: 'Product Manager', time: '1 day ago', score: 88 }
                  ].map((app, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{app.name}</p>
                        <p className="text-sm text-gray-500">{app.position}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline" className="mb-1">
                          Score: {app.score}
                        </Badge>
                        <p className="text-xs text-gray-500">{app.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className={shadows.card}>
              <CardHeader>
                <CardTitle>Application Sources</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {applicationStats?.topSources && applicationStats.topSources.length > 0 ? (
                    applicationStats.topSources.map((source, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>{source.source}</span>
                          <span>{source.count} ({source.percentage}%)</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-ats-blue h-2 rounded-full transition-all duration-300"
                            style={{ width: `${source.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))
                  ) : applicationStats === null ? (
                    // Loading state
                    <div className="space-y-4">
                      <div className="animate-pulse">
                        <div className="flex justify-between mb-2">
                          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                          <div className="h-4 bg-gray-200 rounded w-16"></div>
                        </div>
                        <div className="h-2 bg-gray-200 rounded w-full mb-4"></div>

                        <div className="flex justify-between mb-2">
                          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                          <div className="h-4 bg-gray-200 rounded w-16"></div>
                        </div>
                        <div className="h-2 bg-gray-200 rounded w-full mb-4"></div>

                        <div className="flex justify-between mb-2">
                          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                          <div className="h-4 bg-gray-200 rounded w-16"></div>
                        </div>
                        <div className="h-2 bg-gray-200 rounded w-full"></div>
                      </div>
                    </div>
                  ) : (
                    // No data state
                    <div className="text-center py-8 text-gray-500">
                      <div className="mb-4">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      </div>
                      <p className="text-sm font-medium">No application source data available</p>
                      <p className="text-xs text-gray-400 mt-1">Data will appear here once applications are submitted</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="forms" className="space-y-6">
          {/* Application Forms Management */}
          <div className="space-y-6">
            {/* Header with Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Application Forms</h2>
                <p className="text-sm text-gray-500">Create, manage, and publish job application forms</p>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Import Form
                </Button>
                <Button onClick={() => setShowFormBuilder(true)} className="bg-ats-blue hover:bg-ats-dark-blue text-white">
                  <Settings className="h-4 w-4 mr-2" />
                  Create New Form
                </Button>
              </div>
            </div>

            {/* Forms Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className={shadows.card}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Forms</p>
                      <p className="text-2xl font-bold text-gray-900">3</p>
                    </div>
                    <FileText className="h-8 w-8 text-ats-blue" />
                  </div>
                </CardContent>
              </Card>

              <Card className={shadows.card}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Live Forms</p>
                      <p className="text-2xl font-bold text-green-600">2</p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className={shadows.card}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Draft Forms</p>
                      <p className="text-2xl font-bold text-yellow-600">1</p>
                    </div>
                    <Clock className="h-8 w-8 text-yellow-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className={shadows.card}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Form Views</p>
                      <p className="text-2xl font-bold text-ats-blue">1,247</p>
                    </div>
                    <Eye className="h-8 w-8 text-ats-blue" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Forms List */}
            <Card className={shadows.card}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Application Forms</CardTitle>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Filter className="h-4 w-4 mr-2" />
                      Filter
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Form Item 1 - Live */}
                  <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <FileText className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">Frontend Developer Application</h3>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <CheckCircle className="h-3 w-3 text-green-500" />
                            Live
                          </span>
                          <span>Created 2 days ago</span>
                          <span>127 submissions</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        Preview
                      </Button>
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Share URL
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="h-4 w-4 mr-2" />
                            View Analytics
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Settings className="h-4 w-4 mr-2" />
                            Clone Form
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Download className="h-4 w-4 mr-2" />
                            Export Data
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <Clock className="h-4 w-4 mr-2" />
                            Archive
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">
                            <AlertCircle className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  {/* Form Item 2 - Live */}
                  <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <FileText className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">Product Manager Application</h3>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <CheckCircle className="h-3 w-3 text-green-500" />
                            Live
                          </span>
                          <span>Created 1 week ago</span>
                          <span>89 submissions</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        Preview
                      </Button>
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Share URL
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="h-4 w-4 mr-2" />
                            View Analytics
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Settings className="h-4 w-4 mr-2" />
                            Clone Form
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Download className="h-4 w-4 mr-2" />
                            Export Data
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <Clock className="h-4 w-4 mr-2" />
                            Archive
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">
                            <AlertCircle className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  {/* Form Item 3 - Draft */}
                  <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                        <FileText className="h-5 w-5 text-yellow-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">UX Designer Application</h3>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3 text-yellow-500" />
                            Draft
                          </span>
                          <span>Created 3 days ago</span>
                          <span>0 submissions</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4 mr-2" />
                        Continue Editing
                      </Button>
                      <Button size="sm" className="bg-ats-blue hover:bg-ats-dark-blue text-white">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Publish
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="h-4 w-4 mr-2" />
                            Preview
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Settings className="h-4 w-4 mr-2" />
                            Clone Form
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">
                            <AlertCircle className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* URL Sharing Modal/Section */}
            <Card className={shadows.card}>
              <CardHeader>
                <CardTitle>Share Application Forms</CardTitle>
                <CardDescription>
                  Copy and share public URLs for your live application forms
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-sm">Frontend Developer Application</p>
                      <p className="text-xs text-gray-500">{window.location.origin}/apply/frontend-developer-comp1-form1</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(`${window.location.origin}/apply/frontend-developer-comp1-form1`);
                        toast({
                          title: 'URL Copied',
                          description: 'Public form URL copied to clipboard',
                          variant: 'default',
                        });
                      }}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Copy URL
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-sm">Product Manager Application</p>
                      <p className="text-xs text-gray-500">{window.location.origin}/apply/product-manager-comp1-form2</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(`${window.location.origin}/apply/product-manager-comp1-form2`);
                        toast({
                          title: 'URL Copied',
                          description: 'Public form URL copied to clipboard',
                          variant: 'default',
                        });
                      }}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Copy URL
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          {/* Form Analytics Overview */}
          <div className="space-y-6">
            {/* Header */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Form Analytics</h2>
              <p className="text-sm text-gray-500">Track performance and conversion metrics for your application forms</p>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className={shadows.card}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Form Views</p>
                      <p className="text-2xl font-bold text-gray-900">1,247</p>
                      <p className="text-xs text-green-600">+12% from last month</p>
                    </div>
                    <Eye className="h-8 w-8 text-ats-blue" />
                  </div>
                </CardContent>
              </Card>

              <Card className={shadows.card}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Form Submissions</p>
                      <p className="text-2xl font-bold text-green-600">216</p>
                      <p className="text-xs text-green-600">+8% from last month</p>
                    </div>
                    <FileText className="h-8 w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className={shadows.card}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Conversion Rate</p>
                      <p className="text-2xl font-bold text-ats-blue">17.3%</p>
                      <p className="text-xs text-red-600">-2% from last month</p>
                    </div>
                    <BarChart3 className="h-8 w-8 text-ats-blue" />
                  </div>
                </CardContent>
              </Card>

              <Card className={shadows.card}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Avg. Completion Time</p>
                      <p className="text-2xl font-bold text-yellow-600">8.5m</p>
                      <p className="text-xs text-green-600">-1.2m from last month</p>
                    </div>
                    <Clock className="h-8 w-8 text-yellow-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className={shadows.card}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-ats-blue" />
                  Form Conversion Funnel
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { stage: 'Form Views', count: 1247, percentage: 100, color: 'bg-blue-500' },
                    { stage: 'Started Forms', count: 892, percentage: 72, color: 'bg-green-500' },
                    { stage: 'Completed Forms', count: 216, percentage: 17, color: 'bg-purple-500' },
                    { stage: 'Qualified Submissions', count: 156, percentage: 13, color: 'bg-orange-500' },
                    { stage: 'Moved to Interview', count: 89, percentage: 7, color: 'bg-emerald-500' }
                  ].map((stage, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{stage.stage}</span>
                        <span className="text-gray-600">{stage.count} ({stage.percentage}%)</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className={`${stage.color} h-3 rounded-full transition-all duration-500`}
                          style={{ width: `${stage.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className={shadows.card}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-ats-blue" />
                  Traffic Sources
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { source: 'Company Website', count: 543, percentage: 43.5 },
                    { source: 'LinkedIn', count: 312, percentage: 25.0 },
                    { source: 'Indeed', count: 189, percentage: 15.2 },
                    { source: 'Referrals', count: 134, percentage: 10.7 },
                    { source: 'Other', count: 69, percentage: 5.6 }
                  ].map((source, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{source.source}</p>
                        <p className="text-xs text-gray-500">{source.count} form views</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-ats-blue">{source.percentage}%</p>
                        <p className="text-xs text-gray-500">of total traffic</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Form Performance Trends */}
          <Card className={shadows.card}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-ats-blue" />
                Form Performance Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-ats-blue mb-1">
                    89
                  </div>
                  <p className="text-sm text-gray-600">Form Views This Week</p>
                  <p className="text-xs text-green-600 mt-1">+12% from last week</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-ats-blue mb-1">
                    312
                  </div>
                  <p className="text-sm text-gray-600">Form Views This Month</p>
                  <p className="text-xs text-green-600 mt-1">+8% from last month</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-ats-blue mb-1">
                    17.3%
                  </div>
                  <p className="text-sm text-gray-600">Avg. Conversion Rate</p>
                  <p className="text-xs text-red-600 mt-1">-2% from last month</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Form Quality Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className={shadows.card}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-ats-blue" />
                  Form Completion Quality
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { label: 'Complete (100% fields)', count: 156, color: 'bg-green-500' },
                    { label: 'Mostly Complete (80-99%)', count: 43, color: 'bg-blue-500' },
                    { label: 'Partial (60-79%)', count: 12, color: 'bg-yellow-500' },
                    { label: 'Incomplete (40-59%)', count: 4, color: 'bg-orange-500' },
                    { label: 'Abandoned (<40%)', count: 1, color: 'bg-red-500' }
                  ].map((quality, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${quality.color}`} />
                        <span className="text-sm">{quality.label}</span>
                      </div>
                      <span className="text-sm font-medium">{quality.count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className={shadows.card}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-ats-blue" />
                  Form Completion Times
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 border rounded-lg">
                    <div>
                      <p className="font-medium text-sm">Avg. Completion Time</p>
                      <p className="text-xs text-gray-500">Start to submit</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-ats-blue">8.5 min</p>
                      <p className="text-xs text-green-600">-1.2 min improvement</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center p-3 border rounded-lg">
                    <div>
                      <p className="font-medium text-sm">Median Time</p>
                      <p className="text-xs text-gray-500">50th percentile</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-ats-blue">6.2 min</p>
                      <p className="text-xs text-gray-500">Stable</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center p-3 border rounded-lg">
                    <div>
                      <p className="font-medium text-sm">Abandonment Rate</p>
                      <p className="text-xs text-gray-500">Started but not completed</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-ats-blue">28.4%</p>
                      <p className="text-xs text-red-600">+3% increase</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          {/* Application Form Settings */}
          <Card className={shadows.card}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-ats-blue" />
                Application Form Configuration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Button
                  variant="outline"
                  className={`h-20 flex-col gap-2 ${shadows.button}`}
                  onClick={() => setShowFormBuilder(true)}
                >
                  <Settings className="h-6 w-6 text-ats-blue" />
                  <span className="font-medium">Edit Application Form</span>
                  <span className="text-xs text-gray-500">Customize form fields</span>
                </Button>
                <Button variant="outline" className={`h-20 flex-col gap-2 ${shadows.button}`}>
                  <Mail className="h-6 w-6 text-ats-blue" />
                  <span className="font-medium">Email Templates</span>
                  <span className="text-xs text-gray-500">Auto-response emails</span>
                </Button>
                <Button variant="outline" className={`h-20 flex-col gap-2 ${shadows.button}`}>
                  <FileText className="h-6 w-6 text-ats-blue" />
                  <span className="font-medium">Form Analytics</span>
                  <span className="text-xs text-gray-500">Completion rates</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Application Processing Settings */}
          <Card className={shadows.card}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-ats-blue" />
                Application Processing
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">Automatic Actions</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium text-sm">Auto-acknowledge applications</p>
                          <p className="text-xs text-gray-500">Send confirmation emails</p>
                        </div>
                        <input type="checkbox" defaultChecked className="rounded" />
                      </div>
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium text-sm">Auto-score applications</p>
                          <p className="text-xs text-gray-500">ML-based scoring</p>
                        </div>
                        <input type="checkbox" defaultChecked className="rounded" />
                      </div>
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium text-sm">Duplicate detection</p>
                          <p className="text-xs text-gray-500">Flag duplicate applications</p>
                        </div>
                        <input type="checkbox" defaultChecked className="rounded" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">Notification Settings</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium text-sm">New application alerts</p>
                          <p className="text-xs text-gray-500">Instant notifications</p>
                        </div>
                        <input type="checkbox" defaultChecked className="rounded" />
                      </div>
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium text-sm">Daily digest emails</p>
                          <p className="text-xs text-gray-500">Summary of applications</p>
                        </div>
                        <input type="checkbox" defaultChecked className="rounded" />
                      </div>
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium text-sm">Weekly reports</p>
                          <p className="text-xs text-gray-500">Analytics summaries</p>
                        </div>
                        <input type="checkbox" className="rounded" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Integration & Export Settings */}
          <Card className={shadows.card}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5 text-ats-blue" />
                Integration & Export
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Button variant="outline" className={`h-20 flex-col gap-2 ${shadows.button}`}>
                  <Calendar className="h-6 w-6 text-ats-blue" />
                  <span className="font-medium">Calendar Integration</span>
                  <span className="text-xs text-gray-500">Google, Outlook</span>
                </Button>
                <Button variant="outline" className={`h-20 flex-col gap-2 ${shadows.button}`}>
                  <Download className="h-6 w-6 text-ats-blue" />
                  <span className="font-medium">Export Settings</span>
                  <span className="text-xs text-gray-500">CSV, PDF formats</span>
                </Button>
                <Button variant="outline" className={`h-20 flex-col gap-2 ${shadows.button}`}>
                  <Mail className="h-6 w-6 text-ats-blue" />
                  <span className="font-medium">Email Integration</span>
                  <span className="text-xs text-gray-500">SMTP configuration</span>
                </Button>
                <Button variant="outline" className={`h-20 flex-col gap-2 ${shadows.button}`}>
                  <Filter className="h-6 w-6 text-ats-blue" />
                  <span className="font-medium">API Access</span>
                  <span className="text-xs text-gray-500">Third-party tools</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Privacy & Compliance */}
          <Card className={shadows.card}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-ats-blue" />
                Privacy & Compliance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900">Data Retention</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <span className="text-sm">Application data retention</span>
                        <select className="text-sm border rounded px-2 py-1">
                          <option>2 years</option>
                          <option>3 years</option>
                          <option>5 years</option>
                          <option>Indefinite</option>
                        </select>
                      </div>
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <span className="text-sm">Document storage period</span>
                        <select className="text-sm border rounded px-2 py-1">
                          <option>1 year</option>
                          <option>2 years</option>
                          <option>3 years</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900">Compliance</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium text-sm">GDPR Compliance</p>
                          <p className="text-xs text-gray-500">EU data protection</p>
                        </div>
                        <input type="checkbox" defaultChecked className="rounded" />
                      </div>
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium text-sm">EEOC Compliance</p>
                          <p className="text-xs text-gray-500">Equal opportunity</p>
                        </div>
                        <input type="checkbox" defaultChecked className="rounded" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Applications;
