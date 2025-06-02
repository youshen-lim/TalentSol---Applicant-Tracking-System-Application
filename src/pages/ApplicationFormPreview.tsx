import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Upload,
  FileText,
  User,
  Briefcase,
  Shield,
  Send,
  Save,
  Eye
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';

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

interface ApplicationFormData {
  // Basic Information
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  currentLocation: string;

  // Professional Information
  currentJobTitle: string;
  currentCompany: string;
  yearsOfExperience: string;
  linkedinUrl: string;
  portfolioUrl: string;

  // Work Authorization
  workAuthorization: string;
  requireSponsorship: string;

  // Additional Information
  additionalInfo: string;
  startDate: string;
  
  // Privacy & Consent
  privacyConsent: boolean;
}

const ApplicationFormPreview: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  const { control, handleSubmit, formState: { errors }, watch } = useForm<ApplicationFormData>({
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      currentLocation: '',
      currentJobTitle: '',
      currentCompany: '',
      yearsOfExperience: '',
      linkedinUrl: '',
      portfolioUrl: '',
      workAuthorization: '',
      requireSponsorship: '',
      additionalInfo: '',
      startDate: '',
      privacyConsent: false,
    }
  });

  const onSubmit = async (data: ApplicationFormData) => {
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    toast.atsBlue({
      title: 'Application Submitted!',
      description: 'Thank you for your application. We will review it and get back to you soon.'
    });
    
    setIsSubmitting(false);
  };

  const handleClosePreview = () => {
    // Navigate back to the previous page or applications management
    navigate(-1); // Go back to previous page
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const getStepTitle = (step: number) => {
    switch (step) {
      case 1: return 'Basic Information';
      case 2: return 'Resume & Cover Letter';
      case 3: return 'Professional Information';
      case 4: return 'Work Authorization';
      default: return 'Application Form';
    }
  };

  const renderProgressBar = () => (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">
          Step {currentStep} of {totalSteps}: {getStepTitle(currentStep)}
        </span>
        <span className="text-sm text-gray-500">
          {Math.round((currentStep / totalSteps) * 100)}% Complete
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-ats-blue h-2 rounded-full transition-all duration-300" 
          style={{ width: `${(currentStep / totalSteps) * 100}%` }}
        />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={handleClosePreview}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Close Preview
            </Button>
            <div>
              <h1 className="text-xl font-semibold">Application Form Preview</h1>
              <p className="text-sm text-gray-500">Preview how candidates will see your application form</p>
            </div>
          </div>
          <Badge variant="outline" className="bg-blue-50 text-blue-700">
            <Eye className="h-3 w-3 mr-1" />
            Preview Mode
          </Badge>
        </div>
      </div>

      {/* Form Content */}
      <div className="max-w-4xl mx-auto p-6">
        {/* Job Header */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-ats-blue rounded-lg flex items-center justify-center text-white font-bold text-lg">
                T
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-900">{mockJob.title}</h2>
                <p className="text-gray-600">{mockJob.company}</p>
                <p className="text-sm text-gray-500">{mockJob.location} • {mockJob.employmentType}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {renderProgressBar()}

          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-ats-blue" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name *</Label>
                    <Controller
                      name="firstName"
                      control={control}
                      rules={{ required: 'First name is required' }}
                      render={({ field }) => (
                        <Input
                          {...field}
                          id="firstName"
                          placeholder="Enter your first name"
                          className={errors.firstName ? 'border-red-500' : ''}
                        />
                      )}
                    />
                    {errors.firstName && (
                      <p className="text-sm text-red-500">{errors.firstName.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Controller
                      name="lastName"
                      control={control}
                      rules={{ required: 'Last name is required' }}
                      render={({ field }) => (
                        <Input
                          {...field}
                          id="lastName"
                          placeholder="Enter your last name"
                          className={errors.lastName ? 'border-red-500' : ''}
                        />
                      )}
                    />
                    {errors.lastName && (
                      <p className="text-sm text-red-500">{errors.lastName.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Controller
                    name="email"
                    control={control}
                    rules={{ 
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address'
                      }
                    }}
                    render={({ field }) => (
                      <Input
                        {...field}
                        id="email"
                        type="email"
                        placeholder="Enter your email address"
                        className={errors.email ? 'border-red-500' : ''}
                      />
                    )}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500">{errors.email.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Controller
                      name="phone"
                      control={control}
                      rules={{ required: 'Phone number is required' }}
                      render={({ field }) => (
                        <Input
                          {...field}
                          id="phone"
                          type="tel"
                          placeholder="+1 (555) 123-4567"
                          className={errors.phone ? 'border-red-500' : ''}
                        />
                      )}
                    />
                    {errors.phone && (
                      <p className="text-sm text-red-500">{errors.phone.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="currentLocation">Current Location *</Label>
                    <Controller
                      name="currentLocation"
                      control={control}
                      rules={{ required: 'Current location is required' }}
                      render={({ field }) => (
                        <Input
                          {...field}
                          id="currentLocation"
                          placeholder="City, State/Country"
                          className={errors.currentLocation ? 'border-red-500' : ''}
                        />
                      )}
                    />
                    {errors.currentLocation && (
                      <p className="text-sm text-red-500">{errors.currentLocation.message}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Resume & Cover Letter */}
          {currentStep === 2 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-ats-blue" />
                  Resume & Cover Letter
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Resume *</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-ats-blue transition-colors">
                    <Upload className="h-8 w-8 mx-auto mb-4 text-gray-400" />
                    <p className="text-sm text-gray-600 mb-2">
                      Choose file or drag it here
                    </p>
                    <p className="text-xs text-gray-500">
                      PDF, DOC, DOCX up to 10MB
                    </p>
                    <Button variant="outline" className="mt-4">
                      Choose File
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Cover Letter</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-ats-blue transition-colors">
                    <Upload className="h-8 w-8 mx-auto mb-4 text-gray-400" />
                    <p className="text-sm text-gray-600 mb-2">
                      Choose file or drag it here
                    </p>
                    <p className="text-xs text-gray-500">
                      PDF, DOC, DOCX up to 10MB
                    </p>
                    <Button variant="outline" className="mt-4">
                      Choose File
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between">
            <Button 
              type="button" 
              variant="outline" 
              onClick={prevStep}
              disabled={currentStep === 1}
            >
              Previous
            </Button>
            
            {currentStep < totalSteps ? (
              <Button type="button" onClick={nextStep} className="bg-ats-blue hover:bg-ats-dark-blue">
                Next Step
              </Button>
            ) : (
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="bg-ats-blue hover:bg-ats-dark-blue"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Submit Application
                  </>
                )}
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApplicationFormPreview;
