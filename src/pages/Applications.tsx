import React, { useState } from 'react';
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
  Download
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';

import ApplicationFormBuilder from '@/components/forms/ApplicationFormBuilder';
import PublicApplicationForm from '@/components/forms/PublicApplicationForm';
import StandardApplicationForm from '@/components/forms/StandardApplicationForm';
import ApplicationReviewDashboard from '@/components/forms/ApplicationReviewDashboard';
import { ApplicationFormSchema, Application } from '@/types/application';

// Mock job data
const mockJob = {
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

// Mock application statistics
const applicationStats = {
  total: 156,
  new: 23,
  inReview: 45,
  interviewed: 12,
  hired: 3,
  conversionRate: 15.4,
  averageScore: 72,
  topSources: [
    { source: 'Company Website', count: 67, percentage: 43 },
    { source: 'LinkedIn', count: 45, percentage: 29 },
    { source: 'Indeed', count: 28, percentage: 18 },
    { source: 'Referrals', count: 16, percentage: 10 }
  ]
};

const Applications: React.FC = () => {
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [formSchema, setFormSchema] = useState<ApplicationFormSchema | null>(null);
  const [showFormBuilder, setShowFormBuilder] = useState(false);
  const [showPublicForm, setShowPublicForm] = useState(false);

  const handleSaveForm = (schema: ApplicationFormSchema) => {
    setFormSchema(schema);
    setShowFormBuilder(false);
    toast.atsBlue({
      title: 'Form Saved',
      description: 'Application form has been saved successfully.'
    });
  };

  const handlePreviewForm = (schema: ApplicationFormSchema) => {
    setFormSchema(schema);
    setShowPublicForm(true);
  };

  const handleSubmitApplication = async (application: Partial<Application>) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    toast.atsBlue({
      title: 'Application Submitted',
      description: 'Your application has been submitted successfully!'
    });
    
    setShowPublicForm(false);
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
        jobId={mockJob.id}
        initialSchema={formSchema || undefined}
        onSave={handleSaveForm}
        onPreview={handlePreviewForm}
      />
    );
  }

  if (showPublicForm) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <h1 className="text-xl font-semibold">Application Form Preview</h1>
            <Button variant="outline" onClick={() => setShowPublicForm(false)}>
              Close Preview
            </Button>
          </div>
        </div>
        <StandardApplicationForm
          job={mockJob}
          onSubmit={handleSubmitApplication}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <FileText className="h-6 w-6 text-ats-blue" />
            Application Management
          </h1>
          <p className="text-sm text-gray-500">
            Manage job application forms and review candidate submissions
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowFormBuilder(true)}>
            <Settings className="h-4 w-4 mr-2" />
            Form Builder
          </Button>
          <Button onClick={() => setShowPublicForm(true)} className="bg-ats-blue hover:bg-ats-dark-blue">
            <Eye className="h-4 w-4 mr-2" />
            Preview Application Form
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{applicationStats.total}</div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Applications</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{applicationStats.new}</div>
            <p className="text-xs text-muted-foreground">
              +5 this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{applicationStats.conversionRate}%</div>
            <p className="text-xs text-muted-foreground">
              +2.1% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{applicationStats.averageScore}</div>
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
          <TabsTrigger value="applications">Applications</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          {/* Quick Actions */}
          <Card>
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
                  onClick={() => setActiveTab('applications')}
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
                  <span>View Analytics</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
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

            <Card>
              <CardHeader>
                <CardTitle>Application Sources</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {applicationStats.topSources.map((source, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{source.source}</span>
                        <span>{source.count} ({source.percentage}%)</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-ats-blue h-2 rounded-full" 
                          style={{ width: `${source.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="applications">
          <ApplicationReviewDashboard
            jobId={mockJob.id}
            onApplicationAction={handleApplicationAction}
            onBulkAction={handleBulkAction}
          />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Application Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-gray-500">
                <BarChart3 className="h-12 w-12 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Analytics Dashboard</h3>
                <p>Detailed analytics and reporting features will be implemented here.</p>
                <p className="text-sm mt-2">
                  This will include conversion funnels, source attribution, quality metrics, and more.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Application Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">Form Configuration</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button 
                      variant="outline" 
                      className="h-16 flex-col gap-2"
                      onClick={() => setShowFormBuilder(true)}
                    >
                      <Settings className="h-5 w-5" />
                      <span>Edit Application Form</span>
                    </Button>
                    <Button variant="outline" className="h-16 flex-col gap-2">
                      <Mail className="h-5 w-5" />
                      <span>Email Templates</span>
                    </Button>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-4">Integration Settings</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button variant="outline" className="h-16 flex-col gap-2">
                      <Calendar className="h-5 w-5" />
                      <span>Calendar Integration</span>
                    </Button>
                    <Button variant="outline" className="h-16 flex-col gap-2">
                      <Download className="h-5 w-5" />
                      <span>Export Settings</span>
                    </Button>
                  </div>
                </div>

                <div className="text-center py-8 text-gray-500">
                  <p>Additional settings and configuration options will be implemented here.</p>
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
