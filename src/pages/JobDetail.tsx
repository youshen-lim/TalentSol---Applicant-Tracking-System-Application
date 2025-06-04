import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  MapPin, 
  Clock, 
  DollarSign, 
  Calendar,
  Users,
  Edit,
  Share2,
  Bookmark,
  Building,
  Briefcase,
  GraduationCap,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useJob } from '@/hooks/useJobs';
import { formatLocation, formatSalary, getRelativeTime } from '@/pages/Jobs';
import { shadows } from '@/components/ui/shadow';

const JobDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const { job, loading, error } = useJob(id!);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { color: 'bg-gray-100 text-gray-800', label: 'Draft' },
      open: { color: 'bg-green-100 text-green-800', label: 'Open' },
      closed: { color: 'bg-red-100 text-red-800', label: 'Closed' },
      archived: { color: 'bg-yellow-100 text-yellow-800', label: 'Archived' },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    
    return (
      <Badge className={`${config.color} font-inter text-xs`}>
        {config.label}
      </Badge>
    );
  };

  const handleEdit = () => {
    navigate(`/jobs/${id}/edit`);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.atsBlue({
      title: "Link Copied",
      description: "Job link has been copied to clipboard",
    });
  };

  const handleApply = () => {
    // Navigate to public application form
    window.open(`/apply/${id}`, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 font-inter">Loading job details...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-inter font-semibold text-gray-900 mb-2">Job Not Found</h2>
              <p className="text-gray-600 font-inter mb-4">The job you're looking for doesn't exist or has been removed.</p>
              <Button onClick={() => navigate('/jobs')} variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Jobs
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/jobs')}
            className="text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Jobs
          </Button>
          
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleShare}>
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button variant="outline" onClick={handleEdit}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Job
            </Button>
            <Button onClick={handleApply} className="bg-blue-600 hover:bg-blue-700">
              Apply Now
            </Button>
          </div>
        </div>

        {/* Job Header Card */}
        <Card className={shadows.cardEnhanced}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <CardTitle className="text-2xl font-inter font-bold text-gray-900">
                    {job.title}
                  </CardTitle>
                  {getStatusBadge(job.status)}
                </div>
                
                <div className="flex items-center gap-6 text-gray-600">
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    <span className="font-inter">{job.company?.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4" />
                    <span className="font-inter">{job.department}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4" />
                    <span className="font-inter capitalize">{job.experienceLevel}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-inter">{formatLocation(job.location)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-inter capitalize">{job.employmentType}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-purple-600" />
                    <span className="text-sm font-inter">{formatSalary(job.salary)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-orange-600" />
                    <span className="text-sm font-inter">{getRelativeTime(job.postedDate)}</span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-4 w-4 text-blue-600" />
                  <span className="text-lg font-inter font-bold text-gray-900">
                    {job.currentApplicants}
                  </span>
                  <span className="text-sm font-inter text-gray-600">applications</span>
                </div>
                {job.maxApplicants && (
                  <p className="text-xs font-inter text-gray-500">
                    {job.maxApplicants - job.currentApplicants} spots remaining
                  </p>
                )}
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Job Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <Card className={shadows.card}>
              <CardHeader>
                <CardTitle className="font-inter">Job Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 font-inter leading-relaxed whitespace-pre-wrap">
                  {job.description}
                </p>
              </CardContent>
            </Card>

            {/* Responsibilities */}
            {job.responsibilities && job.responsibilities.length > 0 && (
              <Card className={shadows.card}>
                <CardHeader>
                  <CardTitle className="font-inter">Key Responsibilities</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {job.responsibilities.map((responsibility, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700 font-inter">{responsibility}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Requirements */}
            {job.requiredQualifications && job.requiredQualifications.length > 0 && (
              <Card className={shadows.card}>
                <CardHeader>
                  <CardTitle className="font-inter">Required Qualifications</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {job.requiredQualifications.map((qualification, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700 font-inter">{qualification}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Preferred Qualifications */}
            {job.preferredQualifications && job.preferredQualifications.length > 0 && (
              <Card className={shadows.card}>
                <CardHeader>
                  <CardTitle className="font-inter">Preferred Qualifications</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {job.preferredQualifications.map((qualification, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700 font-inter">{qualification}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Benefits */}
            {job.benefits && (
              <Card className={shadows.card}>
                <CardHeader>
                  <CardTitle className="font-inter">Benefits & Perks</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 font-inter leading-relaxed whitespace-pre-wrap">
                    {job.benefits}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Apply */}
            <Card className={shadows.card}>
              <CardHeader>
                <CardTitle className="font-inter">Apply for this Position</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button onClick={handleApply} className="w-full bg-blue-600 hover:bg-blue-700">
                  Apply Now
                </Button>
                <Button variant="outline" className="w-full">
                  <Bookmark className="h-4 w-4 mr-2" />
                  Save Job
                </Button>
                <Separator />
                <div className="text-center">
                  <p className="text-sm font-inter text-gray-600 mb-2">Share this job</p>
                  <Button variant="outline" size="sm" onClick={handleShare}>
                    <Share2 className="h-4 w-4 mr-2" />
                    Copy Link
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Skills */}
            {job.skills && job.skills.length > 0 && (
              <Card className={shadows.card}>
                <CardHeader>
                  <CardTitle className="font-inter">Required Skills</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {job.skills.map((skill, index) => (
                      <Badge key={index} variant="outline" className="font-inter text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Job Details */}
            <Card className={shadows.card}>
              <CardHeader>
                <CardTitle className="font-inter">Job Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm font-inter text-gray-600">Job ID</span>
                  <span className="text-sm font-inter font-medium">{job.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-inter text-gray-600">Posted</span>
                  <span className="text-sm font-inter font-medium">{getRelativeTime(job.postedDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-inter text-gray-600">Applications</span>
                  <span className="text-sm font-inter font-medium">{job.currentApplicants}</span>
                </div>
                {job.applicationDeadline && (
                  <div className="flex justify-between">
                    <span className="text-sm font-inter text-gray-600">Deadline</span>
                    <span className="text-sm font-inter font-medium">
                      {new Date(job.applicationDeadline).toLocaleDateString()}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-sm font-inter text-gray-600">Visibility</span>
                  <span className="text-sm font-inter font-medium capitalize">{job.visibility}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetail;
