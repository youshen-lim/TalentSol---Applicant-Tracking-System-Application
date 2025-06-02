/**
 * Application System Types for TalentSol ATS
 * Comprehensive type definitions for the application management system
 */

// Form Field Types
export type FormFieldType = 
  | 'TEXT' 
  | 'TEXTAREA' 
  | 'EMAIL' 
  | 'PHONE' 
  | 'SELECT' 
  | 'RADIO' 
  | 'CHECKBOX' 
  | 'FILE' 
  | 'DATE' 
  | 'NUMBER' 
  | 'SALARY' 
  | 'LOCATION';

export interface FormFieldValidation {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: string;
  fileTypes?: string[];
  maxFileSize?: number; // in bytes
  minSelection?: number;
  maxSelection?: number;
  dateRange?: {
    min?: string;
    max?: string;
  };
}

export interface FormFieldOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface FormField {
  id: string;
  type: FormFieldType;
  label: string;
  placeholder?: string;
  description?: string;
  required: boolean;
  validation?: FormFieldValidation;
  options?: FormFieldOption[]; // For SELECT, RADIO, CHECKBOX
  defaultValue?: any;
  conditional?: {
    dependsOn: string; // Field ID
    showWhen: string | string[]; // Value(s) that trigger visibility
  };
  order: number;
  section: string; // Section grouping
}

export interface FormSection {
  id: string;
  title: string;
  description?: string;
  order: number;
  fields: FormField[];
}

export interface ApplicationFormSchema {
  id: string;
  jobId: string;
  title: string;
  description?: string;
  sections: FormSection[];
  settings: {
    allowSave: boolean; // Allow saving draft
    autoSave: boolean; // Auto-save every 30 seconds
    showProgress: boolean; // Show completion progress
    multiStep: boolean; // Break into multiple steps
    deadline?: string; // Application deadline
    maxApplications?: number; // Limit submissions
    requireLogin: boolean; // Require candidate login
    gdprCompliance: boolean; // GDPR consent required
    eeocQuestions: boolean; // Include EEO questions
  };
  emailSettings: {
    confirmationTemplate: string;
    autoResponse: boolean;
    redirectUrl?: string;
  };
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  version: number;
}

// Application Data Types
export interface CandidateInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  location: {
    city?: string;
    state?: string;
    country?: string;
    zipCode?: string;
  };
  willingToRelocate?: boolean;
  workAuthorization: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  websiteUrl?: string;
}

export interface ProfessionalInfo {
  currentTitle?: string;
  currentCompany?: string;
  experience: string; // "0-1", "1-3", "3-5", "5-10", "10+"
  expectedSalary: {
    min: number;
    max: number;
    currency: string;
    negotiable: boolean;
  };
  noticePeriod: string;
  availableStartDate?: string;
  remoteWork: boolean;
  travelWillingness?: string;
}

export interface UploadedDocument {
  id: string;
  url: string;
  filename: string;
  originalName: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: string;
  parsedData?: any; // For resume parsing results
  virusScanned: boolean;
  scanResult?: 'clean' | 'infected' | 'pending';
}

export interface ApplicationDocuments {
  resume?: UploadedDocument;
  coverLetter?: UploadedDocument;
  portfolio?: UploadedDocument[];
  certifications?: UploadedDocument[];
  writingSamples?: UploadedDocument[];
  other?: UploadedDocument[];
}

export interface CustomAnswer {
  questionId: string;
  question: string;
  answer: any; // Can be string, number, array, etc.
  type: FormFieldType;
}

export interface ApplicationMetadata {
  source: 'company_website' | 'job_board' | 'referral' | 'social_media' | 'direct';
  referralCode?: string;
  ipAddress: string;
  userAgent: string;
  utmParams?: {
    source?: string;
    medium?: string;
    campaign?: string;
    term?: string;
    content?: string;
  };
  formVersion: string;
  completionTime: number; // seconds
  gdprConsent: boolean;
  marketingConsent: boolean;
  eeocData?: {
    gender?: string;
    ethnicity?: string;
    veteranStatus?: string;
    disabilityStatus?: string;
  };
}

export interface ApplicationScoring {
  automaticScore: number; // 0-100
  manualScore?: number; // Recruiter override
  skillMatches: string[];
  qualificationsMet: boolean;
  experienceMatch: number; // 0-100
  salaryMatch: number; // 0-100
  locationMatch: number; // 0-100
  flags: string[]; // Red flags or concerns
  aiInsights?: string[];
}

export interface ApplicationActivity {
  id: string;
  timestamp: string;
  action: string;
  actor: string; // 'candidate' | user ID
  details: string;
  metadata?: any;
}

export type ApplicationStatus = 
  | 'draft' 
  | 'submitted' 
  | 'new' 
  | 'reviewed' 
  | 'screening' 
  | 'phone_screen' 
  | 'interview' 
  | 'assessment' 
  | 'reference_check' 
  | 'offer' 
  | 'hired' 
  | 'rejected' 
  | 'withdrawn';

export interface Application {
  id: string;
  jobId: string;
  status: ApplicationStatus;
  submittedAt?: string;
  lastModified: string;
  
  // Core application data
  candidateInfo: CandidateInfo;
  professionalInfo: ProfessionalInfo;
  documents: ApplicationDocuments;
  customAnswers: Record<string, CustomAnswer>;
  
  // System metadata
  metadata: ApplicationMetadata;
  scoring: ApplicationScoring;
  activity: ApplicationActivity[];
  
  // Review data
  reviewNotes?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  tags?: string[];
  
  // Communication
  lastContactDate?: string;
  nextFollowUpDate?: string;
  communicationHistory?: string[];
}

// Form Builder Types
export interface FormFieldTemplate {
  type: FormFieldType;
  label: string;
  icon: string;
  description: string;
  defaultConfig: Partial<FormField>;
  validationOptions: FormFieldValidation;
}

export interface FormBuilderState {
  schema: ApplicationFormSchema;
  selectedField?: string;
  draggedField?: FormFieldTemplate;
  previewMode: boolean;
  isDirty: boolean;
}

// API Response Types
export interface ApplicationListResponse {
  applications: Application[];
  total: number;
  page: number;
  limit: number;
  filters: any;
}

export interface ApplicationFormResponse {
  schema: ApplicationFormSchema;
  job: {
    id: string;
    title: string;
    company: string;
    location: string;
    description: string;
  };
}

// Email Template Types
export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  type: 'confirmation' | 'status_update' | 'interview_invite' | 'rejection' | 'offer';
  variables: string[]; // Available template variables
  createdAt: string;
  updatedAt: string;
}

// Analytics Types
export interface ApplicationAnalytics {
  totalApplications: number;
  newApplications: number;
  conversionRate: number;
  averageTimeToHire: number;
  topSources: Array<{
    source: string;
    count: number;
    percentage: number;
  }>;
  statusDistribution: Array<{
    status: ApplicationStatus;
    count: number;
    percentage: number;
  }>;
  qualityMetrics: {
    averageScore: number;
    qualifiedCandidates: number;
    completionRate: number;
  };
}
