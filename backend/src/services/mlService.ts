import { prisma } from '../index.js';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs/promises';

export interface CandidateFeatures {
  // Basic Information
  yearsOfExperience: number;
  educationLevel: string; // 'high_school', 'bachelor', 'master', 'phd'
  
  // Skills (extracted from resume/application)
  technicalSkills: string[];
  softSkills: string[];
  skillsMatchScore: number; // 0-1 score based on job requirements
  
  // Experience Relevance
  industryExperience: string[];
  roleRelevance: number; // 0-1 score
  
  // Application Quality
  resumeQualityScore: number; // 0-1 score
  coverLetterPresent: boolean;
  portfolioPresent: boolean;
  
  // Behavioral Indicators
  applicationCompleteness: number; // 0-1 score
  responseTime: number; // Hours to complete application
  
  // Location & Availability
  locationMatch: number; // 0-1 score
  salaryExpectationMatch: number; // 0-1 score
  availabilityMatch: number; // 0-1 score
}

export interface MLPredictionResult {
  priorityScore: number; // 0-100 priority score
  confidence: number; // 0-1 confidence level
  reasoning: string[]; // Explanation of factors
  skillsExtracted: {
    skill: string;
    confidence: number;
    category: 'technical' | 'soft' | 'domain';
  }[];
  recommendedActions: string[];
}

export class MLService {
  private static instance: MLService;
  private pythonScriptPath = path.join(process.cwd(), 'backend', 'ml-models', 'legacy');

  public static getInstance(): MLService {
    if (!MLService.instance) {
      MLService.instance = new MLService();
    }
    return MLService.instance;
  }

  /**
   * Extract features from application data for ML model
   */
  async extractFeatures(applicationId: string): Promise<CandidateFeatures> {
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        candidate: true,
        job: true,
        documents: true,
      },
    });

    if (!application) {
      throw new Error('Application not found');
    }

    const candidateInfo = application.candidateInfo as any;
    const professionalInfo = application.professionalInfo as any;
    const jobSkills = application.job.skills || [];

    // Extract years of experience
    const experienceMapping: Record<string, number> = {
      '0-1': 0.5,
      '1-3': 2,
      '3-5': 4,
      '5-10': 7.5,
      '10+': 12,
    };
    const yearsOfExperience = experienceMapping[professionalInfo?.experience] || 0;

    // Calculate skills match score
    const candidateSkills = this.extractSkillsFromText(
      `${candidateInfo.firstName} ${candidateInfo.lastName} ${professionalInfo?.currentTitle || ''}`
    );
    const skillsMatchScore = this.calculateSkillsMatch(candidateSkills, jobSkills);

    // Calculate salary expectation match
    const jobSalary = application.job.salary as any;
    const expectedSalary = professionalInfo?.expectedSalary;
    const salaryExpectationMatch = this.calculateSalaryMatch(jobSalary, expectedSalary);

    return {
      yearsOfExperience,
      educationLevel: 'bachelor', // Default, could be extracted from resume
      technicalSkills: candidateSkills.filter(skill => this.isTechnicalSkill(skill)),
      softSkills: candidateSkills.filter(skill => !this.isTechnicalSkill(skill)),
      skillsMatchScore,
      industryExperience: [professionalInfo?.currentCompany || 'unknown'],
      roleRelevance: skillsMatchScore, // Simplified
      resumeQualityScore: application.documents.length > 0 ? 0.8 : 0.3,
      coverLetterPresent: application.documents.some(doc => doc.documentType === 'cover_letter'),
      portfolioPresent: !!candidateInfo.portfolioUrl,
      applicationCompleteness: this.calculateCompleteness(application),
      responseTime: application.metadata ? (application.metadata as any).completionTime / 60 : 30, // Convert to hours
      locationMatch: this.calculateLocationMatch(candidateInfo.location, application.job.location),
      salaryExpectationMatch,
      availabilityMatch: professionalInfo?.remoteWork ? 0.9 : 0.7,
    };
  }

  /**
   * Generate ML prediction for candidate prioritization
   */
  async predictCandidatePriority(applicationId: string): Promise<MLPredictionResult> {
    try {
      const features = await this.extractFeatures(applicationId);
      
      // Get active ML model
      const activeModel = await prisma.mLModel.findFirst({
        where: { 
          type: 'candidate_scoring',
          isActive: true 
        },
        orderBy: { trainedAt: 'desc' }
      });

      let prediction: MLPredictionResult;

      if (activeModel) {
        // Use trained ML model
        prediction = await this.callMLModel(activeModel.modelPath, features);
      } else {
        // Use rule-based fallback
        prediction = this.ruleBasedPrediction(features);
      }

      // Store prediction in database
      await this.storePrediction(applicationId, activeModel?.id, features, prediction);

      return prediction;
    } catch (error) {
      console.error('ML prediction error:', error);
      // Fallback to rule-based prediction
      const features = await this.extractFeatures(applicationId);
      return this.ruleBasedPrediction(features);
    }
  }

  /**
   * Rule-based prediction as fallback
   */
  private ruleBasedPrediction(features: CandidateFeatures): MLPredictionResult {
    let score = 0;
    const reasoning: string[] = [];

    // Experience weight (25%)
    const experienceScore = Math.min(features.yearsOfExperience / 10, 1) * 25;
    score += experienceScore;
    if (features.yearsOfExperience >= 5) {
      reasoning.push(`Strong experience: ${features.yearsOfExperience} years`);
    }

    // Skills match weight (30%)
    const skillsScore = features.skillsMatchScore * 30;
    score += skillsScore;
    if (features.skillsMatchScore > 0.7) {
      reasoning.push(`Excellent skills match: ${Math.round(features.skillsMatchScore * 100)}%`);
    }

    // Application quality weight (20%)
    const qualityScore = (
      features.resumeQualityScore * 0.4 +
      (features.coverLetterPresent ? 0.3 : 0) +
      (features.portfolioPresent ? 0.3 : 0)
    ) * 20;
    score += qualityScore;

    // Practical factors weight (25%)
    const practicalScore = (
      features.locationMatch * 0.4 +
      features.salaryExpectationMatch * 0.4 +
      features.availabilityMatch * 0.2
    ) * 25;
    score += practicalScore;

    if (features.locationMatch > 0.8) {
      reasoning.push('Good location match');
    }
    if (features.salaryExpectationMatch > 0.8) {
      reasoning.push('Salary expectations align');
    }

    return {
      priorityScore: Math.round(score),
      confidence: 0.75, // Rule-based confidence
      reasoning,
      skillsExtracted: features.technicalSkills.map(skill => ({
        skill,
        confidence: 0.8,
        category: 'technical' as const,
      })),
      recommendedActions: this.generateRecommendations(score, features),
    };
  }

  /**
   * Call Python ML model
   */
  private async callMLModel(modelPath: string, features: CandidateFeatures): Promise<MLPredictionResult> {
    return new Promise((resolve, reject) => {
      const pythonProcess = spawn('python', [
        path.join(this.pythonScriptPath, 'predict.py'),
        modelPath,
        JSON.stringify(features)
      ]);

      let output = '';
      let error = '';

      pythonProcess.stdout.on('data', (data) => {
        output += data.toString();
      });

      pythonProcess.stderr.on('data', (data) => {
        error += data.toString();
      });

      pythonProcess.on('close', (code) => {
        if (code === 0) {
          try {
            const result = JSON.parse(output);
            resolve(result);
          } catch (parseError) {
            reject(new Error(`Failed to parse ML model output: ${parseError}`));
          }
        } else {
          reject(new Error(`ML model execution failed: ${error}`));
        }
      });
    });
  }

  /**
   * Store prediction results in database
   */
  private async storePrediction(
    applicationId: string,
    modelId: string | undefined,
    features: CandidateFeatures,
    prediction: MLPredictionResult
  ): Promise<void> {
    if (modelId) {
      await prisma.mLPrediction.create({
        data: {
          modelId,
          applicationId,
          predictionType: 'priority_score',
          inputFeatures: JSON.stringify(features),
          prediction: JSON.stringify({
            priorityScore: prediction.priorityScore,
            confidence: prediction.confidence,
            reasoning: prediction.reasoning,
          }),
          confidence: prediction.confidence,
          explanation: JSON.stringify({
            skillsExtracted: prediction.skillsExtracted,
            recommendedActions: prediction.recommendedActions,
          }),
        },
      });
    }

    // Store skill extraction
    await prisma.skillExtraction.create({
      data: {
        applicationId,
        extractedSkills: JSON.stringify(prediction.skillsExtracted),
        skillCategories: JSON.stringify({
          technical: prediction.skillsExtracted.filter(s => s.category === 'technical'),
          soft: prediction.skillsExtracted.filter(s => s.category === 'soft'),
          domain: prediction.skillsExtracted.filter(s => s.category === 'domain'),
        }),
        confidence: prediction.confidence,
        method: modelId ? 'ml' : 'rule_based',
      },
    });
  }

  // Helper methods
  private extractSkillsFromText(text: string): string[] {
    const commonSkills = [
      'JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'Java', 'SQL',
      'AWS', 'Docker', 'Kubernetes', 'Git', 'Agile', 'Scrum', 'Leadership',
      'Communication', 'Problem Solving', 'Team Work', 'Project Management'
    ];
    
    return commonSkills.filter(skill => 
      text.toLowerCase().includes(skill.toLowerCase())
    );
  }

  private isTechnicalSkill(skill: string): boolean {
    const technicalSkills = [
      'JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'Java', 'SQL',
      'AWS', 'Docker', 'Kubernetes', 'Git'
    ];
    return technicalSkills.includes(skill);
  }

  private calculateSkillsMatch(candidateSkills: string[], jobSkills: string[]): number {
    if (jobSkills.length === 0) return 0.5;
    
    const matches = candidateSkills.filter(skill => 
      jobSkills.some(jobSkill => 
        jobSkill.toLowerCase().includes(skill.toLowerCase()) ||
        skill.toLowerCase().includes(jobSkill.toLowerCase())
      )
    );
    
    return matches.length / jobSkills.length;
  }

  private calculateSalaryMatch(jobSalary: any, expectedSalary: any): number {
    if (!jobSalary || !expectedSalary) return 0.5;
    
    const jobMax = jobSalary.max || jobSalary.min || 100000;
    const expectedMin = expectedSalary.min || 50000;
    
    if (expectedMin <= jobMax) return 1.0;
    if (expectedMin <= jobMax * 1.2) return 0.7;
    return 0.3;
  }

  private calculateLocationMatch(candidateLocation: any, jobLocation: any): number {
    if (!candidateLocation || !jobLocation) return 0.5;
    
    if (candidateLocation.city === jobLocation.city) return 1.0;
    if (candidateLocation.state === jobLocation.state) return 0.8;
    if (candidateLocation.country === jobLocation.country) return 0.6;
    return 0.3;
  }

  private calculateCompleteness(application: any): number {
    let score = 0;
    let total = 0;
    
    // Check required fields
    if (application.candidateInfo?.firstName) score++;
    total++;
    
    if (application.candidateInfo?.email) score++;
    total++;
    
    if (application.professionalInfo?.experience) score++;
    total++;
    
    if (application.documents?.length > 0) score++;
    total++;
    
    return total > 0 ? score / total : 0;
  }

  private generateRecommendations(score: number, features: CandidateFeatures): string[] {
    const recommendations: string[] = [];
    
    if (score >= 80) {
      recommendations.push('High priority candidate - schedule interview immediately');
    } else if (score >= 60) {
      recommendations.push('Good candidate - review and consider for next round');
    } else {
      recommendations.push('Review application details before proceeding');
    }
    
    if (features.skillsMatchScore < 0.5) {
      recommendations.push('Skills gap identified - consider for different role');
    }
    
    if (!features.coverLetterPresent) {
      recommendations.push('Request cover letter for better assessment');
    }
    
    return recommendations;
  }
}
