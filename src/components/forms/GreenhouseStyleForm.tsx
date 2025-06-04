import React, { useState, useEffect } from 'react';
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
  Shield,
  ArrowLeft,
  X,
  ChevronRight,
  ChevronLeft,
  Save,
  Plus,
  Minus
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

interface GreenhouseStyleFormProps {
  schema: ApplicationFormSchema;
  job: JobInfo;
  onSubmit: (application: Partial<Application>) => Promise<void>;
  onSaveDraft?: (application: Partial<Application>) => Promise<void>;
  existingApplication?: Partial<Application>;
  onClose?: () => void;
}

const GreenhouseStyleForm: React.FC<GreenhouseStyleFormProps> = ({
  schema,
  job,
  onSubmit,
  onSaveDraft,
  existingApplication,
  onClose
}) => {
  const { toast } = useToast();
  const { control, handleSubmit, watch, setValue, getValues, formState: { errors } } = useForm({
    defaultValues: existingApplication || {}
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['personal']));

  // Toggle section expansion
  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  // Render form field based on type with Greenhouse styling
  const renderField = (field: FormField) => {
    const fieldError = errors[field.id];
    const baseInputClasses = "w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors";
    const errorClasses = fieldError ? "border-red-500 focus:ring-red-500 focus:border-red-500" : "";

    switch (field.type) {
      case 'TEXT':
      case 'EMAIL':
      case 'PHONE':
        return (
          <div key={field.id} className="mb-4">
            <Label htmlFor={field.id} className="block text-sm font-medium text-gray-700 mb-1">
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
                  className={`${baseInputClasses} ${errorClasses}`}
                />
              )}
            />
            {field.description && (
              <p className="text-xs text-gray-500 mt-1">{field.description}</p>
            )}
            {fieldError && (
              <p className="text-xs text-red-500 mt-1">{fieldError.message}</p>
            )}
          </div>
        );

      case 'TEXTAREA':
        return (
          <div key={field.id} className="mb-4">
            <Label htmlFor={field.id} className="block text-sm font-medium text-gray-700 mb-1">
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
                  className={`${baseInputClasses} ${errorClasses} resize-none`}
                />
              )}
            />
            {field.description && (
              <p className="text-xs text-gray-500 mt-1">{field.description}</p>
            )}
            {fieldError && (
              <p className="text-xs text-red-500 mt-1">{fieldError.message}</p>
            )}
          </div>
        );

      case 'SELECT':
        return (
          <div key={field.id} className="mb-4">
            <Label htmlFor={field.id} className="block text-sm font-medium text-gray-700 mb-1">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Controller
              name={field.id}
              control={control}
              rules={{ required: field.required ? `${field.label} is required` : false }}
              render={({ field: formField }) => (
                <Select onValueChange={formField.onChange} value={formField.value}>
                  <SelectTrigger className={`${baseInputClasses} ${errorClasses}`}>
                    <SelectValue placeholder={field.placeholder || "Select an option"} />
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
              <p className="text-xs text-gray-500 mt-1">{field.description}</p>
            )}
            {fieldError && (
              <p className="text-xs text-red-500 mt-1">{fieldError.message}</p>
            )}
          </div>
        );

      case 'RADIO':
        return (
          <div key={field.id} className="mb-4">
            <Label className="block text-sm font-medium text-gray-700 mb-2">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Controller
              name={field.id}
              control={control}
              rules={{ required: field.required ? `${field.label} is required` : false }}
              render={({ field: formField }) => (
                <RadioGroup onValueChange={formField.onChange} value={formField.value} className="space-y-2">
                  {field.options?.map((option) => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <RadioGroupItem value={option.value} id={`${field.id}-${option.value}`} />
                      <Label htmlFor={`${field.id}-${option.value}`} className="text-sm text-gray-700">
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              )}
            />
            {field.description && (
              <p className="text-xs text-gray-500 mt-1">{field.description}</p>
            )}
            {fieldError && (
              <p className="text-xs text-red-500 mt-1">{fieldError.message}</p>
            )}
          </div>
        );

      case 'CHECKBOX':
        return (
          <div key={field.id} className="mb-4">
            <Label className="block text-sm font-medium text-gray-700 mb-2">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Controller
              name={field.id}
              control={control}
              rules={{ required: field.required ? `${field.label} is required` : false }}
              render={({ field: formField }) => (
                <div className="space-y-2">
                  {field.options?.map((option) => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`${field.id}-${option.value}`}
                        checked={formField.value?.includes(option.value)}
                        onCheckedChange={(checked) => {
                          const currentValue = formField.value || [];
                          if (checked) {
                            formField.onChange([...currentValue, option.value]);
                          } else {
                            formField.onChange(currentValue.filter((v: string) => v !== option.value));
                          }
                        }}
                      />
                      <Label htmlFor={`${field.id}-${option.value}`} className="text-sm text-gray-700">
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </div>
              )}
            />
            {field.description && (
              <p className="text-xs text-gray-500 mt-1">{field.description}</p>
            )}
            {fieldError && (
              <p className="text-xs text-red-500 mt-1">{fieldError.message}</p>
            )}
          </div>
        );

      case 'FILE':
        return (
          <div key={field.id} className="mb-4">
            <Label className="block text-sm font-medium text-gray-700 mb-1">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <div className="border-2 border-dashed border-gray-300 rounded-md p-4 text-center hover:border-blue-400 transition-colors">
              <Upload className="mx-auto h-6 w-6 text-gray-400 mb-2" />
              <p className="text-sm text-gray-600 mb-1">Click to upload or drag and drop</p>
              {field.validation?.fileTypes && (
                <p className="text-xs text-gray-500">
                  Supported formats: {field.validation.fileTypes.join(', ')}
                </p>
              )}
              <input
                type="file"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                accept={field.validation?.fileTypes?.join(',')}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setValue(field.id, file.name);
                  }
                }}
              />
            </div>
            {field.description && (
              <p className="text-xs text-gray-500 mt-1">{field.description}</p>
            )}
            {fieldError && (
              <p className="text-xs text-red-500 mt-1">{fieldError.message}</p>
            )}
          </div>
        );

      case 'DATE':
        return (
          <div key={field.id} className="mb-4">
            <Label htmlFor={field.id} className="block text-sm font-medium text-gray-700 mb-1">
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
                  className={`${baseInputClasses} ${errorClasses}`}
                />
              )}
            />
            {field.description && (
              <p className="text-xs text-gray-500 mt-1">{field.description}</p>
            )}
            {fieldError && (
              <p className="text-xs text-red-500 mt-1">{fieldError.message}</p>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  const handleFormSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
      toast({
        title: 'Application Submitted',
        description: 'Your application has been submitted successfully!',
        variant: 'default',
      });
    } catch (error) {
      toast({
        title: 'Submission Failed',
        description: 'There was an error submitting your application. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-600 rounded flex items-center justify-center">
                <span className="text-white font-bold text-sm">G</span>
              </div>
              <span className="text-sm text-gray-600">Greenhouse</span>
            </div>
            {onClose && (
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-8">
            {/* Job Header */}
            <div className="mb-8">
              <h1 className="text-2xl font-semibold text-gray-900 mb-2">{job.title}</h1>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <Building className="h-4 w-4" />
                  <span>{job.company}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <MapPin className="h-4 w-4" />
                  <span>{job.location}</span>
                </div>
                {job.employmentType && (
                  <div className="flex items-center space-x-1">
                    <Briefcase className="h-4 w-4" />
                    <span>{job.employmentType}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
              {schema.sections.map((section, index) => (
                <div key={section.id} className="border border-gray-200 rounded-lg">
                  <button
                    type="button"
                    onClick={() => toggleSection(section.id)}
                    className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <h3 className="text-lg font-medium text-gray-900">{section.title}</h3>
                    {expandedSections.has(section.id) ? (
                      <Minus className="h-5 w-5 text-gray-500" />
                    ) : (
                      <Plus className="h-5 w-5 text-gray-500" />
                    )}
                  </button>
                  
                  {expandedSections.has(section.id) && (
                    <div className="px-6 pb-6">
                      {section.description && (
                        <p className="text-sm text-gray-600 mb-4">{section.description}</p>
                      )}
                      <div className="space-y-4">
                        {section.fields.map(renderField)}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {/* Submit Button */}
              <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                <div className="text-sm text-gray-500">
                  All fields marked with * are required
                </div>
                <div className="flex space-x-3">
                  {onSaveDraft && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => onSaveDraft(getValues())}
                      className="px-6"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save Draft
                    </Button>
                  )}
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-8 bg-green-600 hover:bg-green-700 text-white"
                  >
                    {isSubmitting ? (
                      <>
                        <Clock className="h-4 w-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Submit Application
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GreenhouseStyleForm;
