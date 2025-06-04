import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import GreenhouseStyleForm from '@/components/forms/GreenhouseStyleForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { applicationApi, formApi } from '@/services/api';
import { ApplicationFormSchema, Application } from '@/types/application';

interface JobInfo {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  department: string;
  employmentType: string;
  salaryRange?: {
    min: number;
    max: number;
    currency: string;
  };
}

const PublicApplicationPage: React.FC = () => {
  const { formSlug } = useParams<{ formSlug: string }>();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formSchema, setFormSchema] = useState<ApplicationFormSchema | null>(null);
  const [jobInfo, setJobInfo] = useState<JobInfo | null>(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const loadFormData = async () => {
      if (!formSlug) {
        setError('Invalid form URL');
        setLoading(false);
        return;
      }

      try {
        // Parse form slug: {job-slug}-{company-id}-{form-id}
        const parts = formSlug.split('-');
        if (parts.length < 3) {
          throw new Error('Invalid form URL format');
        }

        const formId = parts[parts.length - 1];
        const companyId = parts[parts.length - 2];
        
        console.log('🔍 Loading public form:', { formSlug, formId, companyId });

        // Load form schema
        const formResponse = await formApi.getForm(formId);
        console.log('📋 Form loaded:', formResponse);

        if (!formResponse || !formResponse.job) {
          throw new Error('Form not found or not available');
        }

        setFormSchema(formResponse);
        
        // Set job info from form response
        setJobInfo({
          id: formResponse.job.id,
          title: formResponse.job.title,
          company: formResponse.job.company?.name || 'Company',
          location: formResponse.job.location || 'Remote',
          description: formResponse.job.description || '',
          department: formResponse.job.department || '',
          employmentType: formResponse.job.employmentType || 'Full-time',
          salaryRange: formResponse.job.salaryRange
        });

        console.log('✅ Form and job data loaded successfully');
      } catch (error) {
        console.error('❌ Failed to load form:', error);
        setError(error instanceof Error ? error.message : 'Failed to load application form');
      } finally {
        setLoading(false);
      }
    };

    loadFormData();
  }, [formSlug]);

  const handleSubmitApplication = async (applicationData: Partial<Application>) => {
    if (!formSchema || !jobInfo) {
      throw new Error('Form data not available');
    }

    try {
      console.log('📤 Submitting application:', applicationData);

      // Submit application
      const response = await applicationApi.create({
        jobId: jobInfo.id,
        candidateInfo: {
          firstName: applicationData.candidateInfo?.firstName || '',
          lastName: applicationData.candidateInfo?.lastName || '',
          email: applicationData.candidateInfo?.email || '',
          phone: applicationData.candidateInfo?.phone || '',
        },
        customAnswers: applicationData.customAnswers || {},
        professionalInfo: applicationData.professionalInfo || {},
        metadata: {
          formId: formSchema.id,
          formVersion: formSchema.version,
          submissionSource: 'public_form',
          userAgent: navigator.userAgent,
          submittedAt: new Date().toISOString()
        }
      });

      console.log('✅ Application submitted successfully:', response);
      setSubmitted(true);
    } catch (error) {
      console.error('❌ Application submission failed:', error);
      throw error;
    }
  };

  const handleSaveDraft = async (applicationData: Partial<Application>) => {
    // For public forms, we might not want to save drafts
    // or we could implement a session-based draft system
    console.log('💾 Draft save requested (not implemented for public forms)');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading application form...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              Form Not Available
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">{error}</p>
            <div className="space-y-2">
              <p className="text-sm text-gray-500">
                This could happen if:
              </p>
              <ul className="text-sm text-gray-500 list-disc list-inside space-y-1">
                <li>The form has been archived or removed</li>
                <li>The URL is incorrect or expired</li>
                <li>The job posting is no longer active</li>
              </ul>
            </div>
            <Button 
              onClick={() => navigate('/')} 
              className="w-full mt-4"
              variant="outline"
            >
              Go to Homepage
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              Application Submitted
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-gray-600">
                Thank you for your interest in the <strong>{jobInfo?.title}</strong> position 
                at <strong>{jobInfo?.company}</strong>.
              </p>
              <p className="text-gray-600">
                Your application has been submitted successfully. Our team will review your 
                application and get back to you soon.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">What happens next?</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• You'll receive a confirmation email shortly</li>
                  <li>• Our team will review your application</li>
                  <li>• We'll contact you within 1-2 weeks if there's a match</li>
                </ul>
              </div>
              <Button 
                onClick={() => navigate('/')} 
                className="w-full"
                variant="outline"
              >
                Back to Homepage
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!formSchema || !jobInfo) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Form Data Missing</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              The application form data could not be loaded. Please try again later.
            </p>
            <Button 
              onClick={() => window.location.reload()} 
              className="w-full"
              variant="outline"
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <GreenhouseStyleForm
      schema={formSchema}
      job={jobInfo}
      onSubmit={handleSubmitApplication}
      onSaveDraft={handleSaveDraft}
      onClose={() => navigate('/')}
    />
  );
};

export default PublicApplicationPage;
