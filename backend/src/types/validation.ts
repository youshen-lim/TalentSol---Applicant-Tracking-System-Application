import { z } from 'zod';

// Auth schemas
export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  companyName: z.string().min(1, 'Company name is required'),
  role: z.enum(['admin', 'recruiter', 'hiring_manager']).default('recruiter'),
});

// Location schema
export const locationSchema = z.object({
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  zipCode: z.string().optional(),
});

// Job schemas
export const jobSalarySchema = z.object({
  min: z.number().min(0),
  max: z.number().min(0),
  currency: z.string().default('USD'),
  negotiable: z.boolean().default(false),
});

export const createJobSchema = z.object({
  title: z.string().min(1, 'Job title is required'),
  department: z.string().optional(),
  location: locationSchema.optional(),
  employmentType: z.enum(['full-time', 'part-time', 'contract', 'internship']).optional(),
  experienceLevel: z.enum(['entry', 'mid', 'senior', 'executive']).optional(),
  salary: jobSalarySchema.optional(),
  description: z.string().optional(),
  responsibilities: z.array(z.string()).default([]),
  requiredQualifications: z.array(z.string()).default([]),
  preferredQualifications: z.array(z.string()).default([]),
  skills: z.array(z.string()).default([]),
  benefits: z.string().optional(),
  status: z.enum(['draft', 'open', 'closed', 'archived']).default('draft'),
  visibility: z.enum(['public', 'internal', 'private']).default('public'),
  applicationDeadline: z.string().datetime().optional(),
  maxApplicants: z.number().positive().optional(),
});

export const updateJobSchema = createJobSchema.partial();

// Candidate schemas
export const candidateInfoSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email format'),
  phone: z.string().optional(),
  location: locationSchema.optional(),
  willingToRelocate: z.boolean().optional(),
  workAuthorization: z.string().optional(),
  linkedinUrl: z.string().url().optional().or(z.literal('')),
  portfolioUrl: z.string().url().optional().or(z.literal('')),
  websiteUrl: z.string().url().optional().or(z.literal('')),
});

export const professionalInfoSchema = z.object({
  currentTitle: z.string().optional(),
  currentCompany: z.string().optional(),
  experience: z.enum(['0-1', '1-3', '3-5', '5-10', '10+']),
  expectedSalary: z.object({
    min: z.number().min(0),
    max: z.number().min(0),
    currency: z.string().default('USD'),
    negotiable: z.boolean().default(false),
  }),
  noticePeriod: z.string(),
  availableStartDate: z.string().optional(),
  remoteWork: z.boolean().default(false),
  travelWillingness: z.string().optional(),
});

// Application schemas
export const createApplicationSchema = z.object({
  jobId: z.string().cuid('Invalid job ID'),
  candidateInfo: candidateInfoSchema,
  professionalInfo: professionalInfoSchema.optional(),
  customAnswers: z.record(z.any()).optional(),
  metadata: z.object({
    source: z.enum(['company_website', 'job_board', 'referral', 'social_media', 'direct']),
    referralCode: z.string().optional(),
    ipAddress: z.string().ip(),
    userAgent: z.string(),
    utmParams: z.object({
      source: z.string().optional(),
      medium: z.string().optional(),
      campaign: z.string().optional(),
      term: z.string().optional(),
      content: z.string().optional(),
    }).optional(),
    formVersion: z.string().default('1.0'),
    completionTime: z.number().positive(),
    gdprConsent: z.boolean(),
    marketingConsent: z.boolean().default(false),
  }),
});

export const updateApplicationSchema = z.object({
  status: z.enum(['applied', 'screening', 'interview', 'assessment', 'offer', 'hired', 'rejected']).optional(),
  reviewNotes: z.string().optional(),
  tags: z.array(z.string()).optional(),
  nextFollowupDate: z.string().datetime().optional(),
});

// Interview schemas
export const createInterviewSchema = z.object({
  applicationId: z.string().cuid('Invalid application ID'),
  title: z.string().min(1, 'Interview title is required'),
  type: z.enum(['phone', 'video', 'in-person', 'technical', 'behavioral']).optional(),
  scheduledDate: z.string().datetime().optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  location: z.string().optional(),
  interviewers: z.array(z.string().cuid()).default([]),
  notes: z.string().optional(),
});

export const updateInterviewSchema = createInterviewSchema.partial().omit({ applicationId: true });

// Type exports
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type CreateJobInput = z.infer<typeof createJobSchema>;
export type UpdateJobInput = z.infer<typeof updateJobSchema>;
export type CandidateInfoInput = z.infer<typeof candidateInfoSchema>;
export type CreateApplicationInput = z.infer<typeof createApplicationSchema>;
export type UpdateApplicationInput = z.infer<typeof updateApplicationSchema>;
export type CreateInterviewInput = z.infer<typeof createInterviewSchema>;
export type UpdateInterviewInput = z.infer<typeof updateInterviewSchema>;
