import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
  Upload,
  FileText,
  CheckCircle,
  AlertCircle,
  Send,
  User,
  Mail,
  Phone,
  Globe,
  Calendar,
  Briefcase,
  GraduationCap,
  FileUp,
  Shield,
  MapPin,
  Building,
  DollarSign
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/components/ui/use-toast';

interface JobInfo {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  department: string;
  employmentType: string;
}

interface StandardApplicationFormProps {
  job: JobInfo;
  onSubmit: (data: any) => Promise<void>;
}

const StandardApplicationForm: React.FC<StandardApplicationFormProps> = ({
  job,
  onSubmit
}) => {
  const { toast } = useToast();
  const { control, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm();
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, File>>({});

  const handleFileUpload = (fieldName: string, file: File) => {
    setUploadedFiles(prev => ({ ...prev, [fieldName]: file }));
  };

  const handleFormSubmit = async (data: any) => {
    try {
      await onSubmit({ ...data, files: uploadedFiles });
      toast.atsBlue({
        title: 'Application Submitted',
        description: 'Thank you for your application! We will review it and get back to you soon.'
      });
    } catch (error) {
      toast.atsBlue({
        title: 'Submission Failed',
        description: 'There was an error submitting your application. Please try again.'
      });
    }
  };

  const FileUploadField = ({ name, label, required = false, accept = ".pdf,.doc,.docx" }: {
    name: string;
    label: string;
    required?: boolean;
    accept?: string;
  }) => (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
        {uploadedFiles[name] ? (
          <div className="flex items-center justify-center gap-2 text-green-600">
            <CheckCircle className="h-5 w-5" />
            <span className="text-sm font-medium">{uploadedFiles[name].name}</span>
          </div>
        ) : (
          <>
            <FileUp className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600 mb-2">Choose file or drag here</p>
            <p className="text-xs text-gray-500">PDF, DOC, DOCX up to 10MB</p>
          </>
        )}
        <input
          type="file"
          accept={accept}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFileUpload(name, file);
          }}
        />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-6 py-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Building className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">{job.company}</h1>
              <p className="text-sm text-gray-600">{job.location}</p>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{job.title}</h2>
          <p className="text-gray-600">{job.department} • {job.employmentType}</p>
        </div>
      </div>

      {/* Application Form */}
      <div className="max-w-2xl mx-auto px-6 py-8">
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
          
          {/* Basic Information */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <User className="h-5 w-5 text-blue-600" />
              Basic Information
            </h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">
                    First Name *
                  </Label>
                  <Controller
                    name="firstName"
                    control={control}
                    rules={{ required: 'First name is required' }}
                    render={({ field }) => (
                      <Input
                        {...field}
                        id="firstName"
                        className={`mt-1 ${errors.firstName ? 'border-red-500' : ''}`}
                        placeholder="Enter your first name"
                      />
                    )}
                  />
                  {errors.firstName && (
                    <p className="text-sm text-red-500 mt-1">{errors.firstName.message}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="lastName" className="text-sm font-medium text-gray-700">
                    Last Name *
                  </Label>
                  <Controller
                    name="lastName"
                    control={control}
                    rules={{ required: 'Last name is required' }}
                    render={({ field }) => (
                      <Input
                        {...field}
                        id="lastName"
                        className={`mt-1 ${errors.lastName ? 'border-red-500' : ''}`}
                        placeholder="Enter your last name"
                      />
                    )}
                  />
                  {errors.lastName && (
                    <p className="text-sm text-red-500 mt-1">{errors.lastName.message}</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email Address *
                </Label>
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
                      className={`mt-1 ${errors.email ? 'border-red-500' : ''}`}
                      placeholder="your.email@example.com"
                    />
                  )}
                />
                {errors.email && (
                  <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                  Phone Number *
                </Label>
                <Controller
                  name="phone"
                  control={control}
                  rules={{ required: 'Phone number is required' }}
                  render={({ field }) => (
                    <Input
                      {...field}
                      id="phone"
                      type="tel"
                      className={`mt-1 ${errors.phone ? 'border-red-500' : ''}`}
                      placeholder="+1 (555) 123-4567"
                    />
                  )}
                />
                {errors.phone && (
                  <p className="text-sm text-red-500 mt-1">{errors.phone.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="location" className="text-sm font-medium text-gray-700">
                  Current Location
                </Label>
                <Controller
                  name="location"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      id="location"
                      className="mt-1"
                      placeholder="City, State/Country"
                    />
                  )}
                />
              </div>
            </div>
          </div>

          {/* Resume & Cover Letter */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              Resume & Cover Letter
            </h3>
            
            <div className="space-y-6">
              <FileUploadField
                name="resume"
                label="Resume"
                required={true}
              />
              
              <FileUploadField
                name="coverLetter"
                label="Cover Letter"
                required={false}
              />
            </div>
          </div>

          {/* Professional Information */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-blue-600" />
              Professional Information
            </h3>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="currentTitle" className="text-sm font-medium text-gray-700">
                  Current Job Title
                </Label>
                <Controller
                  name="currentTitle"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      id="currentTitle"
                      className="mt-1"
                      placeholder="e.g. Senior Software Engineer"
                    />
                  )}
                />
              </div>

              <div>
                <Label htmlFor="currentCompany" className="text-sm font-medium text-gray-700">
                  Current Company
                </Label>
                <Controller
                  name="currentCompany"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      id="currentCompany"
                      className="mt-1"
                      placeholder="e.g. Tech Corp Inc."
                    />
                  )}
                />
              </div>

              <div>
                <Label htmlFor="experience" className="text-sm font-medium text-gray-700">
                  Years of Experience
                </Label>
                <Controller
                  name="experience"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select experience level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0-1">0-1 years</SelectItem>
                        <SelectItem value="1-3">1-3 years</SelectItem>
                        <SelectItem value="3-5">3-5 years</SelectItem>
                        <SelectItem value="5-10">5-10 years</SelectItem>
                        <SelectItem value="10+">10+ years</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div>
                <Label htmlFor="linkedinUrl" className="text-sm font-medium text-gray-700">
                  LinkedIn Profile
                </Label>
                <Controller
                  name="linkedinUrl"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      id="linkedinUrl"
                      className="mt-1"
                      placeholder="https://linkedin.com/in/yourprofile"
                    />
                  )}
                />
              </div>

              <div>
                <Label htmlFor="portfolioUrl" className="text-sm font-medium text-gray-700">
                  Portfolio/Website
                </Label>
                <Controller
                  name="portfolioUrl"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      id="portfolioUrl"
                      className="mt-1"
                      placeholder="https://yourportfolio.com"
                    />
                  )}
                />
              </div>
            </div>
          </div>

          {/* Work Authorization */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-600" />
              Work Authorization
            </h3>
            
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-700">
                  Are you authorized to work in the United States? *
                </Label>
                <Controller
                  name="workAuthorization"
                  control={control}
                  rules={{ required: 'Work authorization status is required' }}
                  render={({ field }) => (
                    <RadioGroup onValueChange={field.onChange} value={field.value} className="mt-2">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id="auth-yes" />
                        <Label htmlFor="auth-yes">Yes</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="auth-no" />
                        <Label htmlFor="auth-no">No</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="visa" id="auth-visa" />
                        <Label htmlFor="auth-visa">Yes, with visa sponsorship</Label>
                      </div>
                    </RadioGroup>
                  )}
                />
                {errors.workAuthorization && (
                  <p className="text-sm text-red-500 mt-1">{errors.workAuthorization.message}</p>
                )}
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700">
                  Will you require visa sponsorship now or in the future?
                </Label>
                <Controller
                  name="visaSponsorship"
                  control={control}
                  render={({ field }) => (
                    <RadioGroup onValueChange={field.onChange} value={field.value} className="mt-2">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id="visa-yes" />
                        <Label htmlFor="visa-yes">Yes</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="visa-no" />
                        <Label htmlFor="visa-no">No</Label>
                      </div>
                    </RadioGroup>
                  )}
                />
              </div>
            </div>
          </div>

          {/* Additional Questions */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Additional Information
            </h3>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="whyInterested" className="text-sm font-medium text-gray-700">
                  Why are you interested in this role?
                </Label>
                <Controller
                  name="whyInterested"
                  control={control}
                  render={({ field }) => (
                    <Textarea
                      {...field}
                      id="whyInterested"
                      className="mt-1"
                      rows={4}
                      placeholder="Tell us what interests you about this position and our company..."
                    />
                  )}
                />
              </div>

              <div>
                <Label htmlFor="availableStartDate" className="text-sm font-medium text-gray-700">
                  When can you start?
                </Label>
                <Controller
                  name="availableStartDate"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      id="availableStartDate"
                      type="date"
                      className="mt-1"
                    />
                  )}
                />
              </div>
            </div>
          </div>

          {/* Privacy & Consent */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Privacy & Consent
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Controller
                  name="privacyConsent"
                  control={control}
                  rules={{ required: 'You must agree to the privacy policy' }}
                  render={({ field }) => (
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="mt-1"
                    />
                  )}
                />
                <div className="text-sm">
                  <Label className="text-gray-700">
                    I consent to the processing of my personal data for recruitment purposes. *
                  </Label>
                  <p className="text-gray-500 mt-1">
                    By submitting this application, you agree to our{' '}
                    <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a> and{' '}
                    <a href="#" className="text-blue-600 hover:underline">Terms of Service</a>.
                  </p>
                </div>
              </div>
              {errors.privacyConsent && (
                <p className="text-sm text-red-500">{errors.privacyConsent.message}</p>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-base font-medium"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Submitting Application...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Submit Application
                </>
              )}
            </Button>
            <p className="text-center text-sm text-gray-500 mt-3">
              Please review your information before submitting.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StandardApplicationForm;
