import { prisma } from '../lib/prisma';
import { logger } from '../utils/logger';
import { XGBoostModelInput } from './xgboostModelService';

export interface TalentSolApplicationData {
  id: string;
  candidateId: string;
  jobId: string;
  candidate: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    location?: string;
    resume?: string;
    experience?: number;
    skills?: string[];
    education?: string;
    ethnicity?: string;
  };
  job: {
    id: string;
    title: string;
    description: string;
    department?: string;
    location?: string;
    requirements?: string;
    responsibilities?: string;
    skills?: string[];
    experienceLevel?: string;
  };
  candidateInfo?: any;  // JSON field from applications table
  professionalInfo?: any;  // JSON field from applications table
}

export class XGBoostDataMappingService {
  
  /**
   * Map TalentSol application data to XGBoost model input format
   */
  async mapApplicationToModelInput(applicationId: string): Promise<XGBoostModelInput> {
    try {
      // Fetch application with related candidate and job data
      const application = await this.fetchApplicationData(applicationId);
      
      if (!application) {
        throw new Error(`Application ${applicationId} not found`);
      }

      // Map to your model's expected input format
      const modelInput: XGBoostModelInput = {
        candidateId: application.candidateId,
        jobId: application.jobId,
        applicationId: application.id,
        data: {
          jobDescription: this.extractJobDescription(application),
          resume: this.extractResume(application),
          jobRoles: this.extractJobRoles(application),
          ethnicity: this.extractEthnicity(application)
        }
      };

      // Validate the mapped data
      this.validateMappedData(modelInput);

      logger.info(`Successfully mapped application ${applicationId} to XGBoost input format`);
      return modelInput;

    } catch (error) {
      logger.error(`Failed to map application ${applicationId}:`, error);
      throw error;
    }
  }

  /**
   * Batch mapping for multiple applications
   */
  async mapApplicationsBatch(applicationIds: string[]): Promise<XGBoostModelInput[]> {
    const mappedInputs: XGBoostModelInput[] = [];
    
    for (const applicationId of applicationIds) {
      try {
        const input = await this.mapApplicationToModelInput(applicationId);
        mappedInputs.push(input);
      } catch (error) {
        logger.error(`Failed to map application ${applicationId} in batch:`, error);
        // Continue with other applications
      }
    }
    
    return mappedInputs;
  }

  /**
   * Fetch application data with all required relationships
   */
  private async fetchApplicationData(applicationId: string): Promise<TalentSolApplicationData | null> {
    return await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        candidate: true,
        job: true
      }
    }) as TalentSolApplicationData | null;
  }

  /**
   * Extract job description from TalentSol data
   * Maps to your model's 'Job Description' field
   */
  private extractJobDescription(application: TalentSolApplicationData): string {
    let jobDescription = '';

    // Primary source: job description
    if (application.job.description) {
      jobDescription += application.job.description;
    }

    // Enhance with requirements if available
    if (application.job.requirements) {
      jobDescription += '\n\nRequirements:\n' + application.job.requirements;
    }

    // Enhance with responsibilities if available
    if (application.job.responsibilities) {
      jobDescription += '\n\nResponsibilities:\n' + application.job.responsibilities;
    }

    // Add skills if available
    if (application.job.skills && application.job.skills.length > 0) {
      jobDescription += '\n\nRequired Skills: ' + application.job.skills.join(', ');
    }

    // Add experience level if available
    if (application.job.experienceLevel) {
      jobDescription += '\n\nExperience Level: ' + application.job.experienceLevel;
    }

    // Ensure minimum length for model
    if (jobDescription.length < 50) {
      jobDescription += ` This is a ${application.job.title} position in the ${application.job.department || 'technology'} department.`;
    }

    return jobDescription.trim();
  }

  /**
   * Extract resume from TalentSol data
   * Maps to your model's 'Resume' field
   */
  private extractResume(application: TalentSolApplicationData): string {
    let resume = '';

    // Primary source: candidate resume
    if (application.candidate.resume) {
      resume += application.candidate.resume;
    }

    // Enhance with professional info from application if available
    if (application.professionalInfo) {
      try {
        const profInfo = typeof application.professionalInfo === 'string' 
          ? JSON.parse(application.professionalInfo) 
          : application.professionalInfo;
        
        if (profInfo.experience) {
          resume += '\n\nExperience: ' + profInfo.experience;
        }
        if (profInfo.skills && Array.isArray(profInfo.skills)) {
          resume += '\n\nSkills: ' + profInfo.skills.join(', ');
        }
        if (profInfo.education) {
          resume += '\n\nEducation: ' + profInfo.education;
        }
      } catch (error) {
        logger.warn('Failed to parse professional info JSON:', error);
      }
    }

    // Enhance with candidate info from application if available
    if (application.candidateInfo) {
      try {
        const candInfo = typeof application.candidateInfo === 'string' 
          ? JSON.parse(application.candidateInfo) 
          : application.candidateInfo;
        
        if (candInfo.experience) {
          resume += '\n\nYears of Experience: ' + candInfo.experience;
        }
        if (candInfo.currentPosition) {
          resume += '\n\nCurrent Position: ' + candInfo.currentPosition;
        }
      } catch (error) {
        logger.warn('Failed to parse candidate info JSON:', error);
      }
    }

    // Add basic candidate information if resume is still short
    if (resume.length < 100) {
      resume += `\n\nCandidate: ${application.candidate.firstName} ${application.candidate.lastName}`;
      
      if (application.candidate.education) {
        resume += '\nEducation: ' + application.candidate.education;
      }
      
      if (application.candidate.skills && application.candidate.skills.length > 0) {
        resume += '\nSkills: ' + application.candidate.skills.join(', ');
      }
      
      if (application.candidate.experience) {
        resume += '\nExperience: ' + application.candidate.experience + ' years';
      }
    }

    return resume.trim();
  }

  /**
   * Extract job roles from TalentSol data
   * Maps to your model's 'Job Roles' field
   */
  private extractJobRoles(application: TalentSolApplicationData): string {
    // Primary source: job title
    let jobRoles = application.job.title;

    // Enhance with department if available
    if (application.job.department && !jobRoles.toLowerCase().includes(application.job.department.toLowerCase())) {
      jobRoles += ` - ${application.job.department}`;
    }

    return jobRoles.trim();
  }

  /**
   * Extract ethnicity from TalentSol data
   * Maps to your model's 'Ethnicity' field
   */
  private extractEthnicity(application: TalentSolApplicationData): string {
    // Check candidate ethnicity field
    if (application.candidate.ethnicity) {
      return this.normalizeEthnicity(application.candidate.ethnicity);
    }

    // Check candidate info JSON for ethnicity
    if (application.candidateInfo) {
      try {
        const candInfo = typeof application.candidateInfo === 'string' 
          ? JSON.parse(application.candidateInfo) 
          : application.candidateInfo;
        
        if (candInfo.ethnicity) {
          return this.normalizeEthnicity(candInfo.ethnicity);
        }
      } catch (error) {
        logger.warn('Failed to parse candidate info for ethnicity:', error);
      }
    }

    // Default value as used in your training
    return 'Not Specified';
  }

  /**
   * Normalize ethnicity values to match your training data
   */
  private normalizeEthnicity(ethnicity: string): string {
    const normalized = ethnicity.toLowerCase().trim();
    
    // Map common variations to your training data categories
    const ethnicityMap: Record<string, string> = {
      'asian': 'Asian',
      'black': 'Black',
      'african american': 'Black',
      'hispanic': 'Hispanic',
      'latino': 'Hispanic',
      'white': 'White',
      'caucasian': 'White',
      'other': 'Other',
      'prefer not to say': 'Not Specified',
      'not specified': 'Not Specified',
      '': 'Not Specified'
    };

    return ethnicityMap[normalized] || 'Not Specified';
  }

  /**
   * Validate mapped data meets model requirements
   */
  private validateMappedData(input: XGBoostModelInput): void {
    const { data } = input;

    if (!data.jobDescription || data.jobDescription.length < 50) {
      throw new Error('Job description too short for model processing');
    }

    if (!data.resume || data.resume.length < 100) {
      throw new Error('Resume too short for model processing');
    }

    if (!data.jobRoles || data.jobRoles.length < 3) {
      throw new Error('Job roles not specified');
    }

    // Validate ethnicity is in expected format
    const validEthnicities = ['Not Specified', 'Asian', 'Black', 'Hispanic', 'White', 'Other'];
    if (!validEthnicities.includes(data.ethnicity)) {
      logger.warn(`Unexpected ethnicity value: ${data.ethnicity}, normalizing to 'Not Specified'`);
      data.ethnicity = 'Not Specified';
    }

    logger.debug(`Validation passed for application ${input.applicationId}`);
  }

  /**
   * Get applications ready for XGBoost processing
   */
  async getApplicationsForProcessing(limit: number = 50): Promise<string[]> {
    const applications = await prisma.application.findMany({
      where: {
        status: 'submitted',
        mlPredictions: {
          none: {
            modelType: 'xgboost_decision_tree'
          }
        }
      },
      select: { id: true },
      take: limit,
      orderBy: { submittedAt: 'desc' }
    });

    return applications.map(app => app.id);
  }

  /**
   * Check if application has existing XGBoost prediction
   */
  async hasExistingPrediction(applicationId: string): Promise<boolean> {
    const prediction = await prisma.mlPrediction.findFirst({
      where: {
        applicationId,
        modelType: 'xgboost_decision_tree'
      }
    });

    return !!prediction;
  }
}
