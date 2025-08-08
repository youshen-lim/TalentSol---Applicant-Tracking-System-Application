import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

/**
 * ML Data Adapter Service
 * Bridges the gap between TalentSol database schema and your ML model requirements
 * Ensures data format consistency for your trained models
 */

export interface YourMLModelInput {
  // Based on your Decision Tree model requirements
  // These field names must match exactly what your model expects
  job_description: string;
  resume: string;
  job_role: string;
  ethnicity?: string; // Optional field from your model, defaults to "Not Specified"
}

export interface YourMLModelDataFrame {
  // The format your joblib pipeline expects (DataFrame columns)
  'Job Description': string;
  'Resume': string;
  'Job Roles': string;
  'Ethnicity': string;
}

export interface TalentSolMLInput {
  candidateId: string;
  jobId: string;
  candidateData: {
    resume: string;
    experience: number;
    skills: string[];
    location: string;
    education: string;
    currentPosition?: string;
    expectedSalary?: number;
  };
  jobData: {
    title: string;
    description: string;
    requirements: string;
    location: string;
    salaryRange?: {
      min: number;
      max: number;
    };
    experienceLevel: string;
    skills: string[];
  };
}

export class MLDataAdapter {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Convert TalentSol data to your ML model format
   * This ensures compatibility with your trained models
   */
  async convertToMLFormat(
    candidateId: string,
    jobId: string
  ): Promise<YourMLModelInput> {
    try {
      // Get candidate data
      const candidate = await this.prisma.candidate.findUnique({
        where: { id: candidateId },
        include: {
          applications: {
            where: { jobId },
            include: {
              documents: true
            }
          }
        }
      });

      // Get job data
      const job = await this.prisma.job.findUnique({
        where: { id: jobId }
      });

      if (!candidate || !job) {
        throw new Error(`Candidate or job not found: ${candidateId}, ${jobId}`);
      }

      // Extract resume text from documents
      const application = candidate.applications[0];
      const resumeDoc = application?.documents?.find(doc => doc.documentType === 'resume');
      const resumeText = resumeDoc?.filename || this.generateResumeFromProfile(candidate);

      // Format data exactly as your ML models expect
      const mlInput: YourMLModelInput = {
        job_description: job.description || '',
        resume: resumeText,
        job_role: job.title,
        ethnicity: 'Not Specified' // Default value as per your model
      };

      logger.info(`Converted data for ML prediction: ${candidateId} -> ${jobId}`);
      return mlInput;

    } catch (error) {
      logger.error(`Error converting data for ML: ${candidateId}, ${jobId}`, error);
      throw error;
    }
  }

  /**
   * Convert your ML model output to TalentSol format
   */
  convertFromMLFormat(
    mlOutput: any,
    candidateId: string,
    jobId: string
  ): {
    score: number;
    confidence: number;
    reasoning: string[];
    features: Record<string, any>;
  } {
    // Handle different output formats from your models
    let score = 0;
    let confidence = 0;
    let reasoning: string[] = [];

    if (typeof mlOutput.probability !== 'undefined') {
      // Logistic regression output format
      score = mlOutput.probability;
      confidence = mlOutput.confidence || 0.8;
      reasoning = mlOutput.reasoning || ['Logistic regression prediction'];
    } else if (typeof mlOutput.score !== 'undefined') {
      // Decision tree output format
      score = mlOutput.score;
      confidence = mlOutput.confidence || 0.8;
      reasoning = mlOutput.reasoning || ['Decision tree prediction'];
    } else {
      // Fallback format
      score = 0.5;
      confidence = 0.1;
      reasoning = ['Unable to parse ML model output'];
    }

    // Ensure score is in 0-1 range
    score = Math.max(0, Math.min(1, score));
    confidence = Math.max(0, Math.min(1, confidence));

    return {
      score,
      confidence,
      reasoning,
      features: mlOutput.features || {}
    };
  }

  /**
   * Generate resume text from candidate profile when document not available
   */
  private generateResumeFromProfile(candidate: any): string {
    const sections: string[] = [];

    // Personal info
    sections.push(`${candidate.firstName} ${candidate.lastName}`);
    if (candidate.email) sections.push(`Email: ${candidate.email}`);
    if (candidate.phone) sections.push(`Phone: ${candidate.phone}`);
    if (candidate.location) sections.push(`Location: ${candidate.location}`);

    // Professional summary
    if (candidate.currentPosition && candidate.currentCompany) {
      sections.push(`\nCurrent Position: ${candidate.currentPosition} at ${candidate.currentCompany}`);
    }

    if (candidate.experienceYears) {
      sections.push(`Experience: ${candidate.experienceYears} years`);
    }

    // Education
    if (candidate.educationLevel) {
      sections.push(`\nEducation: ${candidate.educationLevel}`);
    }

    // Skills
    if (candidate.skillsArray) {
      try {
        const skills = JSON.parse(candidate.skillsArray);
        if (Array.isArray(skills) && skills.length > 0) {
          sections.push(`\nSkills: ${skills.join(', ')}`);
        }
      } catch {
        // Ignore JSON parse errors
      }
    }

    // Certifications
    if (candidate.certifications) {
      try {
        const certs = JSON.parse(candidate.certifications);
        if (Array.isArray(certs) && certs.length > 0) {
          sections.push(`\nCertifications: ${certs.join(', ')}`);
        }
      } catch {
        // Ignore JSON parse errors
      }
    }

    return sections.join('\n');
  }

  /**
   * Validate ML input data before sending to models
   */
  validateMLInput(input: YourMLModelInput): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!input.job_description || input.job_description.trim().length === 0) {
      errors.push('Job description is required for ML prediction');
    }

    if (!input.resume || input.resume.trim().length === 0) {
      errors.push('Resume content is required for ML prediction');
    }

    if (!input.job_role || input.job_role.trim().length === 0) {
      errors.push('Job role is required for ML prediction');
    }

    // Check minimum content length for meaningful predictions
    if (input.job_description.length < 50) {
      errors.push('Job description too short for reliable ML prediction (minimum 50 characters)');
    }

    if (input.resume.length < 100) {
      errors.push('Resume content too short for reliable ML prediction (minimum 100 characters)');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Prepare batch data for ML training
   */
  async prepareBatchTrainingData(
    startDate?: Date,
    endDate?: Date,
    limit: number = 1000
  ): Promise<YourMLModelInput[]> {
    try {
      const whereClause: any = {};
      
      if (startDate || endDate) {
        whereClause.submittedAt = {};
        if (startDate) whereClause.submittedAt.gte = startDate;
        if (endDate) whereClause.submittedAt.lte = endDate;
      }

      const applications = await this.prisma.application.findMany({
        where: whereClause,
        take: limit,
        include: {
          candidate: true,
          job: true,
          documents: true
        },
        orderBy: {
          submittedAt: 'desc'
        }
      });

      const trainingData: YourMLModelInput[] = [];

      for (const app of applications) {
        try {
          const mlInput = await this.convertToMLFormat(app.candidateId, app.jobId);
          trainingData.push(mlInput);
        } catch (error) {
          logger.warn(`Skipping application ${app.id} due to data conversion error:`, error);
        }
      }

      logger.info(`Prepared ${trainingData.length} training samples from ${applications.length} applications`);
      return trainingData;

    } catch (error) {
      logger.error('Error preparing batch training data:', error);
      throw error;
    }
  }

  /**
   * Get data quality metrics for ML readiness
   */
  async getDataQualityMetrics(): Promise<{
    totalCandidates: number;
    candidatesWithResumes: number;
    candidatesWithCompleteProfiles: number;
    totalJobs: number;
    jobsWithDescriptions: number;
    totalApplications: number;
    applicationsReadyForML: number;
    dataQualityScore: number;
  }> {
    try {
      const [
        totalCandidates,
        candidatesWithResumes,
        candidatesWithCompleteProfiles,
        totalJobs,
        jobsWithDescriptions,
        totalApplications,
        applicationsReadyForML
      ] = await Promise.all([
        this.prisma.candidate.count(),
        this.prisma.candidate.count({
          where: {
            applications: {
              some: {
                documents: {
                  some: {
                    documentType: 'resume'
                  }
                }
              }
            }
          }
        }),
        this.prisma.candidate.count(),
        this.prisma.job.count(),
        this.prisma.job.count(),
        this.prisma.application.count(),
        this.prisma.application.count()
      ]);

      // Calculate data quality score (0-100)
      const resumeScore = totalCandidates > 0 ? (candidatesWithResumes / totalCandidates) * 25 : 0;
      const profileScore = totalCandidates > 0 ? (candidatesWithCompleteProfiles / totalCandidates) * 25 : 0;
      const jobScore = totalJobs > 0 ? (jobsWithDescriptions / totalJobs) * 25 : 0;
      const applicationScore = totalApplications > 0 ? (applicationsReadyForML / totalApplications) * 25 : 0;
      
      const dataQualityScore = Math.round(resumeScore + profileScore + jobScore + applicationScore);

      return {
        totalCandidates,
        candidatesWithResumes,
        candidatesWithCompleteProfiles,
        totalJobs,
        jobsWithDescriptions,
        totalApplications,
        applicationsReadyForML,
        dataQualityScore
      };

    } catch (error) {
      logger.error('Error calculating data quality metrics:', error);
      throw error;
    }
  }
}

export const mlDataAdapter = new MLDataAdapter(new PrismaClient());
