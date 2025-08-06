// API Consistency Types - Ensures frontend-backend data model alignment
// This file identifies and resolves interface mismatches

export interface BackendJobResponse {
  id: string;
  title: string;
  description?: string;
  department?: string;
  location?: string;
  locationCity?: string;
  locationState?: string;
  locationCountry?: string;
  employmentType?: string;
  experienceLevel?: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  status: string;
  postedDate?: string;
  applicationDeadline?: string;
  requiredQualifications?: string;
  preferredQualifications?: string;
  responsibilities?: string;
  benefits?: string;
  remoteWorkAllowed?: boolean;
  workType?: string;
  companySizeCategory?: string;
  requiredSkillsArray?: string; // JSON string
  preferredSkillsArray?: string; // JSON string
  industryTags?: string; // JSON string
  companyId: string;
  createdById?: string;
  createdAt: string;
  updatedAt: string;
  company?: {
    id: string;
    name: string;
    logo?: string;
  };
  _count?: {
    applications: number;
  };
}

export interface FrontendJobData {
  id: string;
  title: string;
  department?: string;
  location?: {
    city?: string;
    state?: string;
    country?: string;
    remote?: boolean;
  };
  employmentType?: 'full-time' | 'part-time' | 'contract' | 'internship';
  experienceLevel?: 'entry' | 'mid' | 'senior' | 'executive';
  salary?: {
    min?: number;
    max?: number;
    currency?: string;
    negotiable?: boolean;
  };
  description?: string;
  responsibilities?: string[];
  requiredQualifications?: string[];
  preferredQualifications?: string[];
  skills?: string[];
  benefits?: string;
  status: 'draft' | 'open' | 'closed' | 'archived';
  visibility?: 'public' | 'internal' | 'private';
  applicationDeadline?: string;
  maxApplicants?: number;
  applicationCount?: number;
  company?: {
    id: string;
    name: string;
    logo?: string;
  };
  createdAt: string;
  updatedAt: string;
}

// Data transformation utilities
export class ApiDataTransformer {
  /**
   * Transform backend job response to frontend format
   */
  static transformJob(backendJob: BackendJobResponse): FrontendJobData {
    return {
      id: backendJob.id,
      title: backendJob.title,
      department: backendJob.department,
      location: {
        city: backendJob.locationCity,
        state: backendJob.locationState,
        country: backendJob.locationCountry,
        remote: backendJob.remoteWorkAllowed,
      },
      employmentType: backendJob.employmentType as any,
      experienceLevel: backendJob.experienceLevel as any,
      salary: {
        min: backendJob.salaryMin,
        max: backendJob.salaryMax,
        currency: backendJob.salaryCurrency,
      },
      description: backendJob.description,
      responsibilities: this.parseJsonArray(backendJob.responsibilities),
      requiredQualifications: this.parseJsonArray(backendJob.requiredQualifications),
      preferredQualifications: this.parseJsonArray(backendJob.preferredQualifications),
      skills: this.parseJsonArray(backendJob.requiredSkillsArray),
      benefits: backendJob.benefits,
      status: backendJob.status as any,
      applicationDeadline: backendJob.applicationDeadline,
      applicationCount: backendJob._count?.applications,
      company: backendJob.company,
      createdAt: backendJob.createdAt,
      updatedAt: backendJob.updatedAt,
    };
  }

  /**
   * Transform frontend job data to backend format
   */
  static transformJobForBackend(frontendJob: Partial<FrontendJobData>): Partial<BackendJobResponse> {
    return {
      title: frontendJob.title,
      description: frontendJob.description,
      department: frontendJob.department,
      locationCity: frontendJob.location?.city,
      locationState: frontendJob.location?.state,
      locationCountry: frontendJob.location?.country,
      remoteWorkAllowed: frontendJob.location?.remote,
      employmentType: frontendJob.employmentType,
      experienceLevel: frontendJob.experienceLevel,
      salaryMin: frontendJob.salary?.min,
      salaryMax: frontendJob.salary?.max,
      salaryCurrency: frontendJob.salary?.currency,
      responsibilities: this.stringifyArray(frontendJob.responsibilities),
      requiredQualifications: this.stringifyArray(frontendJob.requiredQualifications),
      preferredQualifications: this.stringifyArray(frontendJob.preferredQualifications),
      requiredSkillsArray: this.stringifyArray(frontendJob.skills),
      benefits: frontendJob.benefits,
      status: frontendJob.status,
      applicationDeadline: frontendJob.applicationDeadline,
    };
  }

  /**
   * Parse JSON array string safely
   */
  private static parseJsonArray(jsonString?: string): string[] {
    if (!jsonString) return [];
    try {
      const parsed = JSON.parse(jsonString);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      // If it's already a string, split by comma
      return typeof jsonString === 'string' ? jsonString.split(',').map(s => s.trim()) : [];
    }
  }

  /**
   * Stringify array to JSON
   */
  private static stringifyArray(array?: string[]): string {
    if (!array || !Array.isArray(array)) return '[]';
    return JSON.stringify(array);
  }
}

// Validation utilities
export class ApiValidation {
  /**
   * Validate job data consistency
   */
  static validateJobData(job: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!job.title || typeof job.title !== 'string') {
      errors.push('Job title is required and must be a string');
    }

    if (job.salary) {
      if (job.salary.min && job.salary.max && job.salary.min > job.salary.max) {
        errors.push('Minimum salary cannot be greater than maximum salary');
      }
    }

    if (job.applicationDeadline) {
      const deadline = new Date(job.applicationDeadline);
      if (deadline < new Date()) {
        errors.push('Application deadline cannot be in the past');
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate candidate data consistency
   */
  static validateCandidateData(candidate: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!candidate.firstName || typeof candidate.firstName !== 'string') {
      errors.push('First name is required');
    }

    if (!candidate.lastName || typeof candidate.lastName !== 'string') {
      errors.push('Last name is required');
    }

    if (!candidate.email || !this.isValidEmail(candidate.email)) {
      errors.push('Valid email address is required');
    }

    if (candidate.experienceYears && (candidate.experienceYears < 0 || candidate.experienceYears > 50)) {
      errors.push('Experience years must be between 0 and 50');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate ML prediction data
   */
  static validateMLPrediction(prediction: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (typeof prediction.score !== 'number' || prediction.score < 0 || prediction.score > 1) {
      errors.push('ML score must be a number between 0 and 1');
    }

    if (typeof prediction.confidence !== 'number' || prediction.confidence < 0 || prediction.confidence > 1) {
      errors.push('ML confidence must be a number between 0 and 1');
    }

    if (!Array.isArray(prediction.reasoning)) {
      errors.push('ML reasoning must be an array of strings');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  private static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

// Performance monitoring utilities
export class ApiPerformanceMonitor {
  private static metrics: Map<string, number[]> = new Map();

  /**
   * Record API response time
   */
  static recordResponseTime(endpoint: string, responseTime: number): void {
    if (!this.metrics.has(endpoint)) {
      this.metrics.set(endpoint, []);
    }
    
    const times = this.metrics.get(endpoint)!;
    times.push(responseTime);
    
    // Keep only last 100 measurements
    if (times.length > 100) {
      times.shift();
    }
  }

  /**
   * Get performance statistics for endpoint
   */
  static getPerformanceStats(endpoint: string): {
    average: number;
    median: number;
    p95: number;
    count: number;
  } | null {
    const times = this.metrics.get(endpoint);
    if (!times || times.length === 0) return null;

    const sorted = [...times].sort((a, b) => a - b);
    const count = sorted.length;
    
    return {
      average: times.reduce((sum, time) => sum + time, 0) / count,
      median: sorted[Math.floor(count / 2)],
      p95: sorted[Math.floor(count * 0.95)],
      count
    };
  }

  /**
   * Get all performance metrics
   */
  static getAllMetrics(): Record<string, ReturnType<typeof ApiPerformanceMonitor.getPerformanceStats>> {
    const result: Record<string, any> = {};
    
    for (const [endpoint] of this.metrics) {
      result[endpoint] = this.getPerformanceStats(endpoint);
    }
    
    return result;
  }
}
