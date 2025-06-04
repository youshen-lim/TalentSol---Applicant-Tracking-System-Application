import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useJob, useUpdateJob } from '@/hooks/useJobs';
import { shadows } from '@/components/ui/shadow';

const JobEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const { job, loading: jobLoading, error } = useJob(id!);
  const { updateJob, loading: updateLoading } = useUpdateJob();

  const [formData, setFormData] = useState({
    title: '',
    department: '',
    employmentType: '',
    experienceLevel: '',
    locationType: '',
    location: '',
    minSalary: '',
    maxSalary: '',
    description: '',
    requirements: '',
    preferred: '',
    benefits: '',
    maxApplicants: '',
    visibility: 'public',
    status: 'draft'
  });

  // Populate form when job loads
  useEffect(() => {
    if (job) {
      setFormData({
        title: job.title || '',
        department: job.department || '',
        employmentType: job.employmentType || '',
        experienceLevel: job.experienceLevel || '',
        locationType: job.location?.type || '',
        location: job.location?.city && job.location?.state 
          ? `${job.location.city}, ${job.location.state}` 
          : '',
        minSalary: job.salary?.min?.toString() || '',
        maxSalary: job.salary?.max?.toString() || '',
        description: job.description || '',
        requirements: job.requiredQualifications?.join('\n') || '',
        preferred: job.preferredQualifications?.join('\n') || '',
        benefits: job.benefits || '',
        maxApplicants: job.maxApplicants?.toString() || '',
        visibility: job.visibility || 'public',
        status: job.status || 'draft'
      });
    }
  }, [job]);

  const handleSave = async () => {
    // Validate required fields
    if (!formData.title || !formData.department || !formData.employmentType ||
        !formData.experienceLevel || !formData.minSalary || !formData.maxSalary ||
        !formData.description || !formData.requirements) {
      toast.atsBlue({
        title: "Validation Error",
        description: "Please fill in all required fields",
      });
      return;
    }

    try {
      // Prepare update data
      const updateData = {
        title: formData.title,
        department: formData.department,
        location: {
          type: formData.locationType as "remote" | "onsite" | "hybrid",
          city: formData.locationType !== 'remote' ? formData.location.split(',')[0]?.trim() : undefined,
          state: formData.locationType !== 'remote' ? formData.location.split(',')[1]?.trim() : undefined,
          country: "US",
          allowRemote: formData.locationType === 'remote' || formData.locationType === 'hybrid'
        },
        employmentType: formData.employmentType,
        experienceLevel: formData.experienceLevel,
        salary: {
          min: parseInt(formData.minSalary),
          max: parseInt(formData.maxSalary),
          currency: "USD",
          payFrequency: "annual"
        },
        description: formData.description,
        responsibilities: formData.description.split('\n').filter(line => line.trim()),
        requiredQualifications: formData.requirements.split('\n').filter(line => line.trim()),
        preferredQualifications: formData.preferred ? formData.preferred.split('\n').filter(line => line.trim()) : [],
        skills: [], // Could be extracted from description/requirements using AI API
        benefits: formData.benefits || '',
        status: formData.status,
        visibility: formData.visibility,
        maxApplicants: formData.maxApplicants ? parseInt(formData.maxApplicants) : undefined,
      };

      // Update job via API
      await updateJob(id!, updateData);

      toast.atsBlue({
        title: "Job Updated Successfully",
        description: `${formData.title} has been updated`,
      });

      // Navigate back to job detail
      navigate(`/jobs/${id}`);
    } catch (error) {
      toast.atsBlue({
        title: "Error Updating Job",
        description: error instanceof Error ? error.message : "Failed to update job",
      });
    }
  };

  const handleCancel = () => {
    navigate(`/jobs/${id}`);
  };

  if (jobLoading) {
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
              <h2 className="text-xl font-inter font-semibold text-gray-900 mb-2">Job Not Found</h2>
              <p className="text-gray-600 font-inter mb-4">The job you're trying to edit doesn't exist.</p>
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
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              onClick={handleCancel}
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <div>
              <h1 className="text-2xl font-inter font-bold text-gray-900">Edit Job</h1>
              <p className="text-gray-600 font-inter">Update job details and requirements</p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleCancel}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={updateLoading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {updateLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
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
        </div>

        {/* Edit Form */}
        <Card className={shadows.cardEnhanced}>
          <CardHeader>
            <CardTitle className="font-inter">Job Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-inter font-medium">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="job-title">Job Title *</Label>
                  <Input
                    id="job-title"
                    placeholder="e.g. Senior Frontend Developer"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Department *</Label>
                  <Select value={formData.department} onValueChange={(value) => setFormData(prev => ({ ...prev, department: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Engineering">Engineering</SelectItem>
                      <SelectItem value="Design">Design</SelectItem>
                      <SelectItem value="Product">Product</SelectItem>
                      <SelectItem value="Sales">Sales</SelectItem>
                      <SelectItem value="Marketing">Marketing</SelectItem>
                      <SelectItem value="Operations">Operations</SelectItem>
                      <SelectItem value="Finance">Finance</SelectItem>
                      <SelectItem value="HR">Human Resources</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="employment-type">Employment Type *</Label>
                  <Select value={formData.employmentType} onValueChange={(value) => setFormData(prev => ({ ...prev, employmentType: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select employment type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full-time">Full-time</SelectItem>
                      <SelectItem value="part-time">Part-time</SelectItem>
                      <SelectItem value="contract">Contract</SelectItem>
                      <SelectItem value="internship">Internship</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="experience-level">Experience Level *</Label>
                  <Select value={formData.experienceLevel} onValueChange={(value) => setFormData(prev => ({ ...prev, experienceLevel: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select experience level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="entry">Entry Level</SelectItem>
                      <SelectItem value="mid">Mid Level</SelectItem>
                      <SelectItem value="senior">Senior Level</SelectItem>
                      <SelectItem value="executive">Executive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <Separator />

            {/* Location & Compensation */}
            <div className="space-y-4">
              <h3 className="text-lg font-inter font-medium">Location & Compensation</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location-type">Location Type *</Label>
                  <Select value={formData.locationType} onValueChange={(value) => setFormData(prev => ({ ...prev, locationType: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select location type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="remote">Remote</SelectItem>
                      <SelectItem value="onsite">On-site</SelectItem>
                      <SelectItem value="hybrid">Hybrid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    placeholder="e.g. San Francisco, CA"
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    disabled={formData.locationType === 'remote'}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="min-salary">Minimum Salary ($) *</Label>
                  <Input
                    id="min-salary"
                    type="number"
                    placeholder="80000"
                    value={formData.minSalary}
                    onChange={(e) => setFormData(prev => ({ ...prev, minSalary: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max-salary">Maximum Salary ($) *</Label>
                  <Input
                    id="max-salary"
                    type="number"
                    placeholder="120000"
                    value={formData.maxSalary}
                    onChange={(e) => setFormData(prev => ({ ...prev, maxSalary: e.target.value }))}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Job Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-inter font-medium">Job Details</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="description">Job Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe the role, responsibilities, and what makes this position exciting..."
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="requirements">Required Qualifications *</Label>
                  <Textarea
                    id="requirements"
                    placeholder="List the must-have qualifications, skills, and experience (one per line)..."
                    rows={3}
                    value={formData.requirements}
                    onChange={(e) => setFormData(prev => ({ ...prev, requirements: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="preferred">Preferred Qualifications</Label>
                  <Textarea
                    id="preferred"
                    placeholder="List the nice-to-have qualifications and skills (one per line)..."
                    rows={3}
                    value={formData.preferred}
                    onChange={(e) => setFormData(prev => ({ ...prev, preferred: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="benefits">Benefits & Perks</Label>
                  <Textarea
                    id="benefits"
                    placeholder="Describe the benefits, perks, and what makes your company great..."
                    rows={3}
                    value={formData.benefits}
                    onChange={(e) => setFormData(prev => ({ ...prev, benefits: e.target.value }))}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Settings */}
            <div className="space-y-4">
              <h3 className="text-lg font-inter font-medium">Job Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max-applicants">Max Applicants</Label>
                  <Input
                    id="max-applicants"
                    type="number"
                    placeholder="e.g. 50"
                    value={formData.maxApplicants}
                    onChange={(e) => setFormData(prev => ({ ...prev, maxApplicants: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="visibility">Visibility</Label>
                  <Select value={formData.visibility} onValueChange={(value) => setFormData(prev => ({ ...prev, visibility: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select visibility" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="internal">Internal Only</SelectItem>
                      <SelectItem value="private">Private</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default JobEdit;
