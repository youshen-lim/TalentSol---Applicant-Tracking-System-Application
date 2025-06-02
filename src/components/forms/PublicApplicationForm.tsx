import React, { useState, useEffect, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
  Upload,
  FileText,
  CheckCircle,
  AlertCircle,
  Send,
  Clock,
  MapPin,
  Building,
  DollarSign,
  User,
  Mail,
  Phone,
  Globe,
  Calendar,
  Briefcase,
  GraduationCap,
  FileUp,
  Shield
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/components/ui/use-toast';

import { 
  ApplicationFormSchema, 
  FormField, 
  FormSection, 
  Application,
  UploadedDocument 
} from '@/types/application';

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

interface PublicApplicationFormProps {
  schema: ApplicationFormSchema;
  job: JobInfo;
  onSubmit: (application: Partial<Application>) => Promise<void>;
  onSaveDraft?: (application: Partial<Application>) => Promise<void>;
  existingApplication?: Partial<Application>;
}

interface FileUploadState {
  file: File | null;
  uploading: boolean;
  progress: number;
  uploaded: UploadedDocument | null;
  error?: string;
}

const PublicApplicationForm: React.FC<PublicApplicationFormProps> = ({
  schema,
  job,
  onSubmit,
  onSaveDraft,
  existingApplication
}) => {
  const { toast } = useToast();
  const { control, handleSubmit, watch, setValue, getValues, formState: { errors } } = useForm({
    defaultValues: existingApplication || {}
  });

  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(schema.settings.autoSave);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [fileUploads, setFileUploads] = useState<Record<string, FileUploadState>>({});

  // Calculate progress
  const totalFields = schema.sections.reduce((total, section) => total + section.fields.length, 0);
  const filledFields = Object.keys(watch()).length;
  const progressPercentage = totalFields > 0 ? (filledFields / totalFields) * 100 : 0;

  // Auto-save functionality
  useEffect(() => {
    if (!autoSaveEnabled || !onSaveDraft) return;

    const interval = setInterval(() => {
      const formData = getValues();
      if (Object.keys(formData).length > 0) {
        onSaveDraft(formData).then(() => {
          setLastSaved(new Date());
        }).catch(() => {
          // Silent fail for auto-save
        });
      }
    }, 30000); // Auto-save every 30 seconds

    return () => clearInterval(interval);
  }, [autoSaveEnabled, onSaveDraft, getValues]);

  // File upload handler
  const handleFileUpload = useCallback(async (fieldId: string, file: File) => {
    setFileUploads(prev => ({
      ...prev,
      [fieldId]: {
        file,
        uploading: true,
        progress: 0,
        uploaded: null
      }
    }));

    try {
      // Simulate file upload with progress
      for (let progress = 0; progress <= 100; progress += 10) {
        await new Promise(resolve => setTimeout(resolve, 100));
        setFileUploads(prev => ({
          ...prev,
          [fieldId]: {
            ...prev[fieldId],
            progress
          }
        }));
      }

      // Simulate successful upload
      const uploadedDoc: UploadedDocument = {
        id: `doc_${Date.now()}`,
        url: `https://storage.example.com/${file.name}`,
        filename: file.name,
        originalName: file.name,
        fileSize: file.size,
        mimeType: file.type,
        uploadedAt: new Date().toISOString(),
        virusScanned: true,
        scanResult: 'clean'
      };

      setFileUploads(prev => ({
        ...prev,
        [fieldId]: {
          ...prev[fieldId],
          uploading: false,
          uploaded: uploadedDoc
        }
      }));

      setValue(fieldId, uploadedDoc);

      toast.atsBlue({
        title: 'File Uploaded',
        description: `${file.name} has been uploaded successfully.`
      });

    } catch (error) {
      setFileUploads(prev => ({
        ...prev,
        [fieldId]: {
          ...prev[fieldId],
          uploading: false,
          error: 'Upload failed. Please try again.'
        }
      }));

      toast.atsBlue({
        title: 'Upload Failed',
        description: 'There was an error uploading your file. Please try again.'
      });
    }
  }, [setValue, toast]);

  // Render form field based on type
  const renderField = (field: FormField) => {
    const fieldError = errors[field.id];

    switch (field.type) {
      case 'TEXT':
      case 'EMAIL':
      case 'PHONE':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Controller
              name={field.id}
              control={control}
              rules={{ required: field.required ? `${field.label} is required` : false }}
              render={({ field: formField }) => (
                <Input
                  {...formField}
                  id={field.id}
                  type={field.type.toLowerCase()}
                  placeholder={field.placeholder}
                  className={fieldError ? 'border-red-500' : ''}
                />
              )}
            />
            {field.description && (
              <p className="text-sm text-gray-500">{field.description}</p>
            )}
            {fieldError && (
              <p className="text-sm text-red-500">{fieldError.message}</p>
            )}
          </div>
        );

      case 'TEXTAREA':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Controller
              name={field.id}
              control={control}
              rules={{ required: field.required ? `${field.label} is required` : false }}
              render={({ field: formField }) => (
                <Textarea
                  {...formField}
                  id={field.id}
                  placeholder={field.placeholder}
                  rows={4}
                  className={fieldError ? 'border-red-500' : ''}
                />
              )}
            />
            {field.description && (
              <p className="text-sm text-gray-500">{field.description}</p>
            )}
            {fieldError && (
              <p className="text-sm text-red-500">{fieldError.message}</p>
            )}
          </div>
        );

      case 'SELECT':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Controller
              name={field.id}
              control={control}
              rules={{ required: field.required ? `${field.label} is required` : false }}
              render={({ field: formField }) => (
                <Select onValueChange={formField.onChange} value={formField.value}>
                  <SelectTrigger className={fieldError ? 'border-red-500' : ''}>
                    <SelectValue placeholder={field.placeholder} />
                  </SelectTrigger>
                  <SelectContent>
                    {field.options?.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {field.description && (
              <p className="text-sm text-gray-500">{field.description}</p>
            )}
            {fieldError && (
              <p className="text-sm text-red-500">{fieldError.message}</p>
            )}
          </div>
        );

      case 'RADIO':
        return (
          <div key={field.id} className="space-y-2">
            <Label>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Controller
              name={field.id}
              control={control}
              rules={{ required: field.required ? `${field.label} is required` : false }}
              render={({ field: formField }) => (
                <RadioGroup onValueChange={formField.onChange} value={formField.value}>
                  {field.options?.map((option) => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <RadioGroupItem value={option.value} id={`${field.id}-${option.value}`} />
                      <Label htmlFor={`${field.id}-${option.value}`}>{option.label}</Label>
                    </div>
                  ))}
                </RadioGroup>
              )}
            />
            {field.description && (
              <p className="text-sm text-gray-500">{field.description}</p>
            )}
            {fieldError && (
              <p className="text-sm text-red-500">{fieldError.message}</p>
            )}
          </div>
        );

      case 'FILE':
        const uploadState = fileUploads[field.id];
        return (
          <div key={field.id} className="space-y-2">
            <Label>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            
            {!uploadState?.uploaded ? (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-ats-blue transition-colors">
                <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    {uploadState?.uploading ? 'Uploading...' : 'Click to upload or drag and drop'}
                  </p>
                  {field.validation?.fileTypes && (
                    <p className="text-xs text-gray-500">
                      Supported formats: {field.validation.fileTypes.join(', ')}
                    </p>
                  )}
                  {field.validation?.maxFileSize && (
                    <p className="text-xs text-gray-500">
                      Max size: {Math.round(field.validation.maxFileSize / 1024 / 1024)}MB
                    </p>
                  )}
                </div>
                
                <input
                  type="file"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  accept={field.validation?.fileTypes?.join(',')}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleFileUpload(field.id, file);
                    }
                  }}
                  disabled={uploadState?.uploading}
                />
                
                {uploadState?.uploading && (
                  <div className="mt-4">
                    <Progress value={uploadState.progress} className="w-full" />
                    <p className="text-sm text-gray-500 mt-1">{uploadState.progress}% uploaded</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <FileText className="h-5 w-5 text-green-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-800">
                    {uploadState.uploaded.originalName}
                  </p>
                  <p className="text-xs text-green-600">
                    {Math.round(uploadState.uploaded.fileSize / 1024)} KB
                  </p>
                </div>
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
            )}
            
            {uploadState?.error && (
              <div className="flex items-center gap-2 text-red-600 text-sm">
                <AlertCircle className="h-4 w-4" />
                {uploadState.error}
              </div>
            )}
            
            {field.description && (
              <p className="text-sm text-gray-500">{field.description}</p>
            )}
            {fieldError && (
              <p className="text-sm text-red-500">{fieldError.message}</p>
            )}
          </div>
        );

      case 'DATE':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Controller
              name={field.id}
              control={control}
              rules={{ required: field.required ? `${field.label} is required` : false }}
              render={({ field: formField }) => (
                <Input
                  {...formField}
                  id={field.id}
                  type="date"
                  className={fieldError ? 'border-red-500' : ''}
                />
              )}
            />
            {field.description && (
              <p className="text-sm text-gray-500">{field.description}</p>
            )}
            {fieldError && (
              <p className="text-sm text-red-500">{fieldError.message}</p>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  const currentSection = schema.sections[currentStep];
  const isLastStep = currentStep === schema.sections.length - 1;
  const canProceed = currentSection?.fields.every(field => {
    if (!field.required) return true;
    const value = watch(field.id);
    return value !== undefined && value !== '' && value !== null;
  });

  const handleNext = () => {
    if (canProceed && currentStep < schema.sections.length - 1) {
      setCompletedSteps(prev => new Set([...prev, currentStep]));
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFormSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
      toast.atsBlue({
        title: 'Application Submitted',
        description: 'Your application has been submitted successfully!'
      });
    } catch (error) {
      toast.atsBlue({
        title: 'Submission Failed',
        description: 'There was an error submitting your application. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!onSaveDraft) return;
    
    try {
      const formData = getValues();
      await onSaveDraft(formData);
      setLastSaved(new Date());
      toast.atsBlue({
        title: 'Draft Saved',
        description: 'Your application draft has been saved.'
      });
    } catch (error) {
      toast.atsBlue({
        title: 'Save Failed',
        description: 'There was an error saving your draft.'
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{job.title}</h1>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Building className="h-4 w-4" />
                  {job.company}
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {job.location}
                </div>
                {job.salaryRange && (
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4" />
                    ${job.salaryRange.min.toLocaleString()} - ${job.salaryRange.max.toLocaleString()}
                  </div>
                )}
              </div>
            </div>
            
            {schema.settings.showProgress && (
              <div className="text-right">
                <div className="text-sm text-gray-600 mb-1">
                  Progress: {Math.round(progressPercentage)}%
                </div>
                <Progress value={progressPercentage} className="w-32" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          {/* Step Indicator */}
          {schema.settings.multiStep && (
            <div className="mb-8">
              <div className="flex items-center justify-between">
                {schema.sections.map((section, index) => (
                  <div key={section.id} className="flex items-center">
                    <div className={`
                      w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                      ${index === currentStep 
                        ? 'bg-ats-blue text-white' 
                        : completedSteps.has(index)
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 text-gray-600'
                      }
                    `}>
                      {completedSteps.has(index) ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        index + 1
                      )}
                    </div>
                    <div className="ml-2">
                      <p className={`text-sm font-medium ${
                        index === currentStep ? 'text-ats-blue' : 'text-gray-600'
                      }`}>
                        {section.title}
                      </p>
                    </div>
                    {index < schema.sections.length - 1 && (
                      <div className="w-16 h-px bg-gray-300 mx-4" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Current Section */}
          <Card>
            <CardHeader>
              <CardTitle>{currentSection.title}</CardTitle>
              {currentSection.description && (
                <p className="text-gray-600">{currentSection.description}</p>
              )}
            </CardHeader>
            <CardContent className="space-y-6">
              {currentSection.fields.map(renderField)}
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8">
            <div className="flex items-center gap-4">
              {currentStep > 0 && (
                <Button type="button" variant="outline" onClick={handlePrevious}>
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>
              )}
              
              {schema.settings.allowSave && onSaveDraft && (
                <Button type="button" variant="outline" onClick={handleSaveDraft}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Draft
                </Button>
              )}
            </div>

            <div className="flex items-center gap-4">
              {lastSaved && (
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <Clock className="h-4 w-4" />
                  Last saved: {lastSaved.toLocaleTimeString()}
                </div>
              )}
              
              {!isLastStep ? (
                <Button 
                  type="button" 
                  onClick={handleNext}
                  disabled={!canProceed}
                  className="bg-ats-blue hover:bg-ats-dark-blue"
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button 
                  type="submit"
                  disabled={!canProceed || isSubmitting}
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
          </div>
        </form>
      </div>
    </div>
  );
};

export default PublicApplicationForm;
