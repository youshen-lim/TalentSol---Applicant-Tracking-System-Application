/**
 * ML Data Service
 * Handles data preparation and feature engineering for ML models
 */

import { PrismaClient } from '@prisma/client';
import { AppError } from '../middleware/errorHandler';

const prisma = new PrismaClient();

export interface MLFeatureVector {
  candidateId: string;
  jobId: string;
  features: {
    // Skills features
    skillsMatchScore: number;
    skillsOverlapCount: number;
    skillsRarityScore: number;
    
    // Experience features
    experienceYears: number;
    experienceRelevance: number;
    industryExperience: number;
    
    // Location features
    locationDistance: number;
    remoteCompatibility: number;
    relocationWillingness: number;
    
    // Salary features
    salaryAlignment: number;
    salaryFlexibility: number;
    marketValueRatio: number;
    
    // Education features
    educationLevel: number;
    educationRelevance: number;
    certificationCount: number;
    
    // Cultural fit features
    companySizeMatch: number;
    workTypeMatch: number;
    industryPreference: number;
    
    // Market features
    candidateSupply: number;
    jobDemand: number;
    competitionLevel: number;
  };
  metadata: {
    dataVersion: string;
    extractedAt: string;
    modelVersion: string;
  };
}

export class MLDataService {
  
  /**
   * Extract feature vector for candidate-job pair
   */
  async extractFeatureVector(candidateId: string, jobId: string): Promise<MLFeatureVector> {
    try {
      // Fetch candidate and job data with all related information
      const [candidate, job] = await Promise.all([
        prisma.candidate.findUnique({
          where: { id: candidateId },
          include: {
            candidateProfiles: true,
            applications: {
              include: {
                job: true,
                skillExtractions: true,
              },
            },
          },
        }),
        prisma.job.findUnique({
          where: { id: jobId },
          include: {
            company: true,
            marketData: true,
          },
        }),
      ]);

      if (!candidate || !job) {
        throw new AppError('Candidate or job not found', 404);
      }

      // Extract features
      const features = await this.calculateFeatures(candidate, job);
      
      return {
        candidateId,
        jobId,
        features,
        metadata: {
          dataVersion: '1.0',
          extractedAt: new Date().toISOString(),
          modelVersion: 'v1.2.0',
        },
      };
    } catch (error) {
      console.error('Error extracting feature vector:', error);
      throw new AppError('Failed to extract features', 500);
    }
  }

  /**
   * Calculate all features for candidate-job pair
   */
  private async calculateFeatures(candidate: any, job: any) {
    const candidateProfile = candidate.candidateProfiles?.[0];
    const jobMarketData = job.marketData?.[0];

    return {
      // Skills features
      skillsMatchScore: await this.calculateSkillsMatch(candidate, job),
      skillsOverlapCount: await this.calculateSkillsOverlap(candidate, job),
      skillsRarityScore: await this.calculateSkillsRarity(candidate),
      
      // Experience features
      experienceYears: candidate.experienceYears || 0,
      experienceRelevance: await this.calculateExperienceRelevance(candidate, job),
      industryExperience: await this.calculateIndustryExperience(candidate, job),
      
      // Location features
      locationDistance: await this.calculateLocationDistance(candidate, job),
      remoteCompatibility: this.calculateRemoteCompatibility(candidate, job),
      relocationWillingness: candidate.willingToRelocate ? 1 : 0,
      
      // Salary features
      salaryAlignment: this.calculateSalaryAlignment(candidate, job),
      salaryFlexibility: candidateProfile?.salaryFlexibility || 0.5,
      marketValueRatio: candidateProfile?.marketValue ? 
        (candidateProfile.marketValue / ((job.salaryMin + job.salaryMax) / 2 || 100000)) : 1,
      
      // Education features
      educationLevel: this.mapEducationLevel(candidate.educationLevel),
      educationRelevance: await this.calculateEducationRelevance(candidate, job),
      certificationCount: this.countCertifications(candidate.certifications),
      
      // Cultural fit features
      companySizeMatch: this.calculateCompanySizeMatch(candidate, job),
      workTypeMatch: this.calculateWorkTypeMatch(candidate, job),
      industryPreference: await this.calculateIndustryPreference(candidate, job),
      
      // Market features
      candidateSupply: jobMarketData?.supplyScore || 0.5,
      jobDemand: jobMarketData?.demandScore || 0.5,
      competitionLevel: jobMarketData?.competitionLevel || 0.5,
    };
  }

  /**
   * Calculate skills match score
   */
  private async calculateSkillsMatch(candidate: any, job: any): Promise<number> {
    try {
      const candidateSkills = this.parseSkillsArray(candidate.skillsArray);
      const jobSkills = this.parseSkillsArray(job.requiredSkillsArray);
      
      if (!candidateSkills.length || !jobSkills.length) return 0;
      
      const matchedSkills = candidateSkills.filter(skill => 
        jobSkills.some(jobSkill => 
          jobSkill.toLowerCase().includes(skill.toLowerCase()) ||
          skill.toLowerCase().includes(jobSkill.toLowerCase())
        )
      );
      
      return (matchedSkills.length / jobSkills.length) * 100;
    } catch (error) {
      console.error('Error calculating skills match:', error);
      return 0;
    }
  }

  /**
   * Calculate skills overlap count
   */
  private async calculateSkillsOverlap(candidate: any, job: any): Promise<number> {
    const candidateSkills = this.parseSkillsArray(candidate.skillsArray);
    const jobSkills = this.parseSkillsArray(job.requiredSkillsArray);
    
    return candidateSkills.filter(skill => 
      jobSkills.some(jobSkill => 
        jobSkill.toLowerCase() === skill.toLowerCase()
      )
    ).length;
  }

  /**
   * Calculate skills rarity score
   */
  private async calculateSkillsRarity(candidate: any): Promise<number> {
    try {
      const candidateSkills = this.parseSkillsArray(candidate.skillsArray);
      if (!candidateSkills.length) return 0;
      
      // Calculate rarity based on how common each skill is in the database
      const skillRarities = await Promise.all(
        candidateSkills.map(async (skill) => {
          const count = await prisma.candidate.count({
            where: {
              skillsArray: {
                contains: skill,
              },
            },
          });
          
          const totalCandidates = await prisma.candidate.count();
          return totalCandidates > 0 ? 1 - (count / totalCandidates) : 0;
        })
      );
      
      return skillRarities.reduce((sum, rarity) => sum + rarity, 0) / skillRarities.length;
    } catch (error) {
      console.error('Error calculating skills rarity:', error);
      return 0;
    }
  }

  /**
   * Calculate experience relevance
   */
  private async calculateExperienceRelevance(candidate: any, job: any): Promise<number> {
    // Simple heuristic: compare experience years with job requirements
    const requiredYears = this.extractExperienceYears(job.experienceLevel);
    const candidateYears = candidate.experienceYears || 0;
    
    if (requiredYears === 0) return 1;
    
    const ratio = candidateYears / requiredYears;
    
    // Optimal range is 0.8 to 1.5 times required experience
    if (ratio >= 0.8 && ratio <= 1.5) return 1;
    if (ratio < 0.8) return ratio / 0.8;
    return Math.max(0, 1 - (ratio - 1.5) * 0.5);
  }

  /**
   * Calculate industry experience
   */
  private async calculateIndustryExperience(candidate: any, job: any): Promise<number> {
    // Check if candidate has worked in similar industries
    const candidateIndustries = this.parseSkillsArray(candidate.industryPreferences);
    const jobIndustries = this.parseSkillsArray(job.industryTags);
    
    if (!candidateIndustries.length || !jobIndustries.length) return 0.5;
    
    const overlap = candidateIndustries.filter(industry =>
      jobIndustries.some(jobIndustry =>
        jobIndustry.toLowerCase().includes(industry.toLowerCase())
      )
    ).length;
    
    return Math.min(1, overlap / jobIndustries.length);
  }

  /**
   * Calculate location distance (simplified)
   */
  private async calculateLocationDistance(candidate: any, job: any): Promise<number> {
    if (!candidate.locationLatitude || !candidate.locationLongitude ||
        !job.locationLatitude || !job.locationLongitude) {
      return 0.5; // Unknown distance
    }
    
    // Haversine formula for distance calculation
    const R = 6371; // Earth's radius in km
    const dLat = this.toRadians(job.locationLatitude - candidate.locationLatitude);
    const dLon = this.toRadians(job.locationLongitude - candidate.locationLongitude);
    
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(this.toRadians(candidate.locationLatitude)) * 
              Math.cos(this.toRadians(job.locationLatitude)) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    
    // Normalize distance (0-1, where 1 is very close, 0 is very far)
    return Math.max(0, 1 - distance / 1000); // 1000km as max reasonable distance
  }

  /**
   * Calculate remote compatibility
   */
  private calculateRemoteCompatibility(candidate: any, job: any): number {
    const candidateRemotePref = candidate.remoteWorkPreference;
    const jobRemoteAllowed = job.remoteWorkAllowed;
    
    if (jobRemoteAllowed && candidateRemotePref === 'remote') return 1;
    if (jobRemoteAllowed && candidateRemotePref === 'hybrid') return 0.8;
    if (!jobRemoteAllowed && candidateRemotePref === 'onsite') return 1;
    if (!jobRemoteAllowed && candidateRemotePref === 'flexible') return 0.7;
    
    return 0.3; // Mismatch
  }

  /**
   * Calculate salary alignment
   */
  private calculateSalaryAlignment(candidate: any, job: any): number {
    if (!candidate.expectedSalaryMin || !candidate.expectedSalaryMax ||
        !job.salaryMin || !job.salaryMax) {
      return 0.5; // Unknown alignment
    }
    
    const candidateRange = [candidate.expectedSalaryMin, candidate.expectedSalaryMax];
    const jobRange = [job.salaryMin, job.salaryMax];
    
    // Calculate overlap
    const overlapStart = Math.max(candidateRange[0], jobRange[0]);
    const overlapEnd = Math.min(candidateRange[1], jobRange[1]);
    
    if (overlapStart > overlapEnd) return 0; // No overlap
    
    const overlapSize = overlapEnd - overlapStart;
    const candidateRangeSize = candidateRange[1] - candidateRange[0];
    const jobRangeSize = jobRange[1] - jobRange[0];
    
    return overlapSize / Math.min(candidateRangeSize, jobRangeSize);
  }

  // Helper methods
  private parseSkillsArray(skillsString: string | null): string[] {
    if (!skillsString) return [];
    try {
      return JSON.parse(skillsString);
    } catch {
      return skillsString.split(',').map(s => s.trim());
    }
  }

  private mapEducationLevel(level: string | null): number {
    const mapping: Record<string, number> = {
      'high_school': 1,
      'associate': 2,
      'bachelor': 3,
      'master': 4,
      'phd': 5,
    };
    return mapping[level?.toLowerCase() || ''] || 0;
  }

  private extractExperienceYears(experienceLevel: string | null): number {
    if (!experienceLevel) return 0;
    
    const level = experienceLevel.toLowerCase();
    if (level.includes('entry') || level.includes('junior')) return 1;
    if (level.includes('mid') || level.includes('intermediate')) return 3;
    if (level.includes('senior')) return 5;
    if (level.includes('lead') || level.includes('principal')) return 7;
    if (level.includes('executive') || level.includes('director')) return 10;
    
    return 0;
  }

  private countCertifications(certifications: string | null): number {
    if (!certifications) return 0;
    try {
      return JSON.parse(certifications).length;
    } catch {
      return certifications.split(',').length;
    }
  }

  private calculateCompanySizeMatch(candidate: any, job: any): number {
    const candidatePreference = candidate.preferredCompanySize;
    const jobCompanySize = job.companySizeCategory;
    
    if (!candidatePreference || !jobCompanySize) return 0.5;
    
    return candidatePreference.toLowerCase() === jobCompanySize.toLowerCase() ? 1 : 0.3;
  }

  private calculateWorkTypeMatch(candidate: any, job: any): number {
    const candidatePreference = candidate.preferredWorkType;
    const jobWorkType = job.workType;
    
    if (!candidatePreference || !jobWorkType) return 0.5;
    
    return candidatePreference.toLowerCase() === jobWorkType.toLowerCase() ? 1 : 0.2;
  }

  private async calculateEducationRelevance(candidate: any, job: any): Promise<number> {
    // Simple heuristic based on education field and job requirements
    const candidateField = candidate.educationField?.toLowerCase() || '';
    const jobDescription = job.description?.toLowerCase() || '';
    const jobTitle = job.title?.toLowerCase() || '';
    
    if (!candidateField) return 0.5;
    
    // Check if education field is mentioned in job description or title
    if (jobDescription.includes(candidateField) || jobTitle.includes(candidateField)) {
      return 1;
    }
    
    // Check for related fields (simplified)
    const relatedFields: Record<string, string[]> = {
      'computer science': ['software', 'programming', 'development', 'tech'],
      'business': ['management', 'marketing', 'sales', 'operations'],
      'engineering': ['engineer', 'technical', 'systems'],
    };
    
    for (const [field, keywords] of Object.entries(relatedFields)) {
      if (candidateField.includes(field)) {
        const hasKeyword = keywords.some(keyword => 
          jobDescription.includes(keyword) || jobTitle.includes(keyword)
        );
        if (hasKeyword) return 0.8;
      }
    }
    
    return 0.3;
  }

  private async calculateIndustryPreference(candidate: any, job: any): Promise<number> {
    const candidatePreferences = this.parseSkillsArray(candidate.industryPreferences);
    const jobIndustries = this.parseSkillsArray(job.industryTags);
    
    if (!candidatePreferences.length) return 0.5;
    if (!jobIndustries.length) return 0.5;
    
    const matches = candidatePreferences.filter(pref =>
      jobIndustries.some(industry =>
        industry.toLowerCase().includes(pref.toLowerCase())
      )
    ).length;
    
    return Math.min(1, matches / candidatePreferences.length);
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Batch extract features for multiple candidate-job pairs
   */
  async batchExtractFeatures(pairs: Array<{candidateId: string, jobId: string}>): Promise<MLFeatureVector[]> {
    const results = await Promise.allSettled(
      pairs.map(pair => this.extractFeatureVector(pair.candidateId, pair.jobId))
    );
    
    return results
      .filter((result): result is PromiseFulfilledResult<MLFeatureVector> => result.status === 'fulfilled')
      .map(result => result.value);
  }

  /**
   * Store candidate-job match data
   */
  async storeCandidateJobMatch(data: {
    candidateId: string;
    jobId: string;
    scores: any;
    predictions: any;
    modelVersion: string;
  }) {
    try {
      return await prisma.candidateJobMatch.upsert({
        where: {
          candidate_job_unique: {
            candidateId: data.candidateId,
            jobId: data.jobId,
          },
        },
        update: {
          overallMatchScore: data.scores.overall,
          skillsMatchScore: data.scores.skills,
          experienceMatchScore: data.scores.experience,
          locationMatchScore: data.scores.location,
          salaryMatchScore: data.scores.salary,
          cultureMatchScore: data.scores.culture,
          successProbability: data.predictions.success,
          retentionProbability: data.predictions.retention,
          performanceScore: data.predictions.performance,
          modelVersion: data.modelVersion,
          confidence: data.predictions.confidence,
          updatedAt: new Date(),
        },
        create: {
          candidateId: data.candidateId,
          jobId: data.jobId,
          overallMatchScore: data.scores.overall,
          skillsMatchScore: data.scores.skills,
          experienceMatchScore: data.scores.experience,
          locationMatchScore: data.scores.location,
          salaryMatchScore: data.scores.salary,
          cultureMatchScore: data.scores.culture,
          successProbability: data.predictions.success,
          retentionProbability: data.predictions.retention,
          performanceScore: data.predictions.performance,
          modelVersion: data.modelVersion,
          confidence: data.predictions.confidence,
        },
      });
    } catch (error) {
      console.error('Error storing candidate-job match:', error);
      throw new AppError('Failed to store match data', 500);
    }
  }
}

export const mlDataService = new MLDataService();

/**
 * ML Analytics Service
 * Handles analytics and performance tracking for ML models
 */
export class MLAnalyticsService {

  /**
   * Track user interaction with ML recommendations
   */
  async trackInteraction(data: {
    userId: string;
    candidateId: string;
    jobId: string;
    actionType: string;
    candidateScore?: number;
    candidateRank?: number;
    sessionId?: string;
    modelVersion?: string;
    abTestGroup?: string;
  }) {
    try {
      return await prisma.mLInteraction.create({
        data: {
          userId: data.userId,
          candidateId: data.candidateId,
          jobId: data.jobId,
          actionType: data.actionType,
          candidateScore: data.candidateScore,
          candidateRank: data.candidateRank,
          sessionId: data.sessionId,
          modelVersion: data.modelVersion,
          abTestGroup: data.abTestGroup,
        },
      });
    } catch (error) {
      console.error('Error tracking interaction:', error);
      throw new AppError('Failed to track interaction', 500);
    }
  }

  /**
   * Record recommendation batch
   */
  async recordRecommendationBatch(data: {
    jobId: string;
    userId: string;
    batchSize: number;
    modelVersion: string;
    processingTime: number;
    cacheHit: boolean;
    requestFilters?: any;
    results?: any;
    abTestGroup?: string;
  }) {
    try {
      return await prisma.recommendationBatch.create({
        data: {
          jobId: data.jobId,
          userId: data.userId,
          batchSize: data.batchSize,
          modelVersion: data.modelVersion,
          processingTime: data.processingTime,
          cacheHit: data.cacheHit,
          requestFilters: data.requestFilters ? JSON.stringify(data.requestFilters) : null,
          averageScore: data.results?.averageScore,
          topScore: data.results?.topScore,
          scoreDistribution: data.results?.scoreDistribution ? JSON.stringify(data.results.scoreDistribution) : null,
          diversityScore: data.results?.diversityScore,
          abTestGroup: data.abTestGroup,
        },
      });
    } catch (error) {
      console.error('Error recording recommendation batch:', error);
      throw new AppError('Failed to record batch', 500);
    }
  }

  /**
   * Get recommendation analytics
   */
  async getRecommendationAnalytics(jobId?: string, dateRange?: { start: Date; end: Date }) {
    try {
      const whereClause: any = {};

      if (jobId) {
        whereClause.jobId = jobId;
      }

      if (dateRange) {
        whereClause.createdAt = {
          gte: dateRange.start,
          lte: dateRange.end,
        };
      }

      const [interactions, batches] = await Promise.all([
        prisma.mLInteraction.findMany({
          where: whereClause,
          include: {
            user: {
              select: { id: true, firstName: true, lastName: true },
            },
          },
        }),
        prisma.recommendationBatch.findMany({
          where: whereClause,
          include: {
            user: {
              select: { id: true, firstName: true, lastName: true },
            },
          },
        }),
      ]);

      // Calculate analytics
      const totalInteractions = interactions.length;
      const uniqueUsers = new Set(interactions.map(i => i.userId)).size;
      const conversionRate = interactions.filter(i => i.actionType === 'hire').length / totalInteractions;
      const averageProcessingTime = batches.reduce((sum, b) => sum + b.processingTime, 0) / batches.length;

      return {
        totalInteractions,
        uniqueUsers,
        conversionRate,
        averageProcessingTime,
        interactions,
        batches,
      };
    } catch (error) {
      console.error('Error getting analytics:', error);
      throw new AppError('Failed to get analytics', 500);
    }
  }

  /**
   * Update model performance metrics
   */
  async updateModelPerformance(modelId: string, metrics: {
    accuracy: number;
    precision: number;
    recall: number;
    f1Score: number;
    auc: number;
    calibration: number;
    biasMetrics?: any;
    businessMetrics?: any;
    testSetSize: number;
    trainingSetSize: number;
  }) {
    try {
      return await prisma.mLModelPerformance.create({
        data: {
          modelId,
          evaluationDate: new Date(),
          accuracy: metrics.accuracy,
          precision: metrics.precision,
          recall: metrics.recall,
          f1Score: metrics.f1Score,
          auc: metrics.auc,
          calibration: metrics.calibration,
          genderBias: metrics.biasMetrics?.gender,
          ageBias: metrics.biasMetrics?.age,
          locationBias: metrics.biasMetrics?.location,
          educationBias: metrics.biasMetrics?.education,
          experienceBias: metrics.biasMetrics?.experience,
          conversionRate: metrics.businessMetrics?.conversionRate,
          timeToHire: metrics.businessMetrics?.timeToHire,
          qualityOfHire: metrics.businessMetrics?.qualityOfHire,
          retentionRate: metrics.businessMetrics?.retentionRate,
          testSetSize: metrics.testSetSize,
          trainingSetSize: metrics.trainingSetSize,
          dataFreshness: new Date(),
        },
      });
    } catch (error) {
      console.error('Error updating model performance:', error);
      throw new AppError('Failed to update performance', 500);
    }
  }
}

export const mlAnalyticsService = new MLAnalyticsService();
