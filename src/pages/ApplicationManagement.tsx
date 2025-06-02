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
  Bell,
  TrendingUp,
  Clock
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';

// Mock data - would come from API
const mockStats = {
  totalApplications: 156,
  newApplications: 23,
  conversionRate: 15.4,
  averageScore: 72,
  sourceStats: [
    { source: 'Company Website', count: 67, percentage: 43 },
    { source: 'LinkedIn', count: 45, percentage: 29 },
    { source: 'Indeed', count: 28, percentage: 18 },
    { source: 'Referrals', count: 16, percentage: 10 }
  ],
  recentApplications: [
    { 
      id: '1', 
      candidateName: 'Sarah Johnson', 
      jobTitle: 'Frontend Developer', 
      submittedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), 
      status: 'applied',
      score: 85 
    },
    { 
      id: '2', 
      candidateName: 'Michael Chen', 
      jobTitle: 'Backend Developer', 
      submittedAt: new Date(Date.now() - 4 * 60 * 60 * 1000), 
      status: 'reviewed',
      score: 92 
    },
    { 
      id: '3', 
      candidateName: 'Emily Davis', 
      jobTitle: 'UX Designer', 
      submittedAt: new Date(Date.now() - 6 * 60 * 60 * 1000), 
      status: 'shortlisted',
      score: 78 
    },
    { 
      id: '4', 
      candidateName: 'David Wilson', 
      jobTitle: 'Product Manager', 
      submittedAt: new Date(Date.now() - 24 * 60 * 60 * 1000), 
      status: 'interviewed',
      score: 88 
    }
  ]
};

const ApplicationManagement: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [stats, setStats] = useState(mockStats);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Format time ago
  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    return `${Math.floor(diffInHours / 24)} days ago`;
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'applied': return 'bg-blue-100 text-blue-800';
      case 'reviewed': return 'bg-yellow-100 text-yellow-800';
      case 'shortlisted': return 'bg-green-100 text-green-800';
      case 'interviewed': return 'bg-purple-100 text-purple-800';
      case 'hired': return 'bg-emerald-100 text-emerald-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleBuildForm = () => {
    // Navigate to the existing Applications page with form builder
    navigate('/applications');
    toast.atsBlue({
      title: 'Form Builder',
      description: 'Opening application form builder...'
    });
  };

  const handlePreviewForm = () => {
    // Navigate to the Application Form Preview page
    navigate('/applications/preview');
  };

  const handleViewAnalytics = () => {
    // Navigate to the Analytics page
    navigate('/analytics');
    toast.atsBlue({
      title: 'Analytics',
      description: 'Opening detailed analytics dashboard...'
    });
  };

  const handleReviewApplications = () => {
    // Navigate to the existing Applications page
    navigate('/applications');
    toast.atsBlue({
      title: 'Review Applications',
      description: 'Opening applications review dashboard...'
    });
  };

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
          <Button variant="outline" onClick={handleBuildForm}>
            <Settings className="h-4 w-4 mr-2" />
            Form Builder
          </Button>
          <Button onClick={handlePreviewForm} className="bg-ats-blue hover:bg-ats-dark-blue">
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
            <div className="text-2xl font-bold">{stats.totalApplications}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
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
            <div className="text-2xl font-bold">{stats.newApplications}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" />
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
            <div className="text-2xl font-bold">{stats.conversionRate}%</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
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
            <div className="text-2xl font-bold">{stats.averageScore}</div>
            <p className="text-xs text-muted-foreground">
              AI Quality Metric
            </p>
          </CardContent>
        </Card>
      </div>

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
              onClick={handleBuildForm}
            >
              <Settings className="h-6 w-6" />
              <span>Build Application Form</span>
            </Button>
            <Button
              variant="outline"
              className="h-20 flex-col gap-2"
              onClick={handleReviewApplications}
            >
              <Users className="h-6 w-6" />
              <span>Review Applications</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col gap-2"
              onClick={handleViewAnalytics}
            >
              <BarChart3 className="h-6 w-6" />
              <span>View Analytics</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Applications */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Applications</CardTitle>
            <div className="flex items-center gap-2">
              <Input
                placeholder="Search applications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-48"
              />
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentApplications.map((app) => (
                <div key={app.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex-1">
                    <p className="font-medium">{app.candidateName}</p>
                    <p className="text-sm text-gray-500">{app.jobTitle}</p>
                    <p className="text-xs text-gray-400">{formatTimeAgo(app.submittedAt)}</p>
                  </div>
                  <div className="text-right space-y-1">
                    <Badge className={`text-xs ${getStatusColor(app.status)}`}>
                      {app.status}
                    </Badge>
                    <div className="text-xs text-gray-500">
                      Score: {app.score}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Application Sources */}
        <Card>
          <CardHeader>
            <CardTitle>Application Sources</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.sourceStats.map((source, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{source.source}</span>
                    <span className="text-gray-500">{source.count} ({source.percentage}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-ats-blue h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${source.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ApplicationManagement;
