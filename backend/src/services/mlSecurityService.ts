import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';
import crypto from 'crypto';
import rateLimit from 'express-rate-limit';
import { Request, Response, NextFunction } from 'express';

export interface MLSecurityConfig {
  enableEncryption: boolean;
  enableAuditLogging: boolean;
  enableRateLimiting: boolean;
  enableInputValidation: boolean;
  enableOutputSanitization: boolean;
  maxPredictionsPerHour: number;
  encryptionKey: string;
}

export interface MLAuditLog {
  id: string;
  userId: string;
  action: string;
  modelName: string;
  modelVersion: string;
  inputData: string; // Encrypted
  outputData: string; // Encrypted
  ipAddress: string;
  userAgent: string;
  timestamp: string;
  success: boolean;
  errorMessage?: string;
}

export class MLSecurityService {
  private prisma: PrismaClient;
  private config: MLSecurityConfig;
  private encryptionKey: Buffer;

  constructor(prisma: PrismaClient, config?: Partial<MLSecurityConfig>) {
    this.prisma = prisma;
    this.config = {
      enableEncryption: true,
      enableAuditLogging: true,
      enableRateLimiting: true,
      enableInputValidation: true,
      enableOutputSanitization: true,
      maxPredictionsPerHour: 1000,
      encryptionKey: process.env.ML_ENCRYPTION_KEY || this.generateEncryptionKey(),
      ...config
    };

    this.encryptionKey = Buffer.from(this.config.encryptionKey, 'hex');
  }

  /**
   * Create rate limiter for ML endpoints
   */
  createMLRateLimiter() {
    if (!this.config.enableRateLimiting) {
      return (req: Request, res: Response, next: NextFunction) => next();
    }

    return rateLimit({
      windowMs: 60 * 60 * 1000, // 1 hour
      max: this.config.maxPredictionsPerHour,
      message: {
        error: 'Too many ML prediction requests',
        retryAfter: '1 hour'
      },
      standardHeaders: true,
      legacyHeaders: false,
      keyGenerator: (req) => {
        // Rate limit by user ID if authenticated, otherwise by IP
        return (req as any).user?.id || req.ip;
      }
    });
  }

  /**
   * Validate ML input data
   */
  validateMLInput(inputData: any): { isValid: boolean; errors: string[] } {
    if (!this.config.enableInputValidation) {
      return { isValid: true, errors: [] };
    }

    const errors: string[] = [];

    // Check required fields
    if (!inputData.candidateId || typeof inputData.candidateId !== 'string') {
      errors.push('candidateId is required and must be a string');
    }

    if (!inputData.jobId || typeof inputData.jobId !== 'string') {
      errors.push('jobId is required and must be a string');
    }

    // Validate candidate data
    if (inputData.candidateData) {
      const { candidateData } = inputData;

      if (candidateData.resume && typeof candidateData.resume !== 'string') {
        errors.push('candidateData.resume must be a string');
      }

      if (candidateData.experience !== undefined && 
          (typeof candidateData.experience !== 'number' || candidateData.experience < 0)) {
        errors.push('candidateData.experience must be a non-negative number');
      }

      if (candidateData.skills && !Array.isArray(candidateData.skills)) {
        errors.push('candidateData.skills must be an array');
      }

      // Check for potential injection attacks
      if (candidateData.resume && this.containsSuspiciousContent(candidateData.resume)) {
        errors.push('candidateData.resume contains potentially malicious content');
      }
    }

    // Validate job data
    if (inputData.jobData) {
      const { jobData } = inputData;

      if (jobData.description && this.containsSuspiciousContent(jobData.description)) {
        errors.push('jobData.description contains potentially malicious content');
      }

      if (jobData.requirements && this.containsSuspiciousContent(jobData.requirements)) {
        errors.push('jobData.requirements contains potentially malicious content');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Sanitize ML output data
   */
  sanitizeMLOutput(outputData: any): any {
    if (!this.config.enableOutputSanitization) {
      return outputData;
    }

    const sanitized = { ...outputData };

    // Remove sensitive internal information
    delete sanitized.internalModelState;
    delete sanitized.debugInfo;
    delete sanitized.rawFeatures;

    // Sanitize reasoning text
    if (sanitized.reasoning && Array.isArray(sanitized.reasoning)) {
      sanitized.reasoning = sanitized.reasoning.map((reason: string) => 
        this.sanitizeText(reason)
      );
    }

    // Round numerical values to prevent precision attacks
    if (typeof sanitized.score === 'number') {
      sanitized.score = Math.round(sanitized.score * 1000) / 1000;
    }

    if (typeof sanitized.confidence === 'number') {
      sanitized.confidence = Math.round(sanitized.confidence * 1000) / 1000;
    }

    return sanitized;
  }

  /**
   * Encrypt sensitive data
   */
  encryptData(data: string): string {
    if (!this.config.enableEncryption) {
      return data;
    }

    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher('aes-256-cbc', this.encryptionKey);
    
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return iv.toString('hex') + ':' + encrypted;
  }

  /**
   * Decrypt sensitive data
   */
  decryptData(encryptedData: string): string {
    if (!this.config.enableEncryption) {
      return encryptedData;
    }

    const [ivHex, encrypted] = encryptedData.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipher('aes-256-cbc', this.encryptionKey);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  /**
   * Log ML operation for audit trail
   */
  async logMLOperation(
    userId: string,
    action: string,
    modelName: string,
    modelVersion: string,
    inputData: any,
    outputData: any,
    req: Request,
    success: boolean,
    errorMessage?: string
  ): Promise<void> {
    if (!this.config.enableAuditLogging) {
      return;
    }

    try {
      const auditLog: Omit<MLAuditLog, 'id'> = {
        userId,
        action,
        modelName,
        modelVersion,
        inputData: this.encryptData(JSON.stringify(inputData)),
        outputData: this.encryptData(JSON.stringify(outputData)),
        ipAddress: req.ip || 'unknown',
        userAgent: req.get('User-Agent') || 'unknown',
        timestamp: new Date().toISOString(),
        success,
        errorMessage
      };

      // Store in database (you might want to create a separate audit table)
      await this.storeAuditLog(auditLog);

      // Also log to application logs
      logger.info('ML Operation Audit', {
        userId,
        action,
        modelName,
        modelVersion,
        success,
        ipAddress: auditLog.ipAddress,
        timestamp: auditLog.timestamp
      });

    } catch (error) {
      logger.error('Failed to log ML operation:', error);
    }
  }

  /**
   * Check for data privacy compliance
   */
  checkPrivacyCompliance(inputData: any): { compliant: boolean; violations: string[] } {
    const violations: string[] = [];

    // Check for PII in input data
    if (inputData.candidateData) {
      const { candidateData } = inputData;

      // Check for email addresses
      if (candidateData.resume && this.containsEmail(candidateData.resume)) {
        violations.push('Resume contains email addresses');
      }

      // Check for phone numbers
      if (candidateData.resume && this.containsPhoneNumber(candidateData.resume)) {
        violations.push('Resume contains phone numbers');
      }

      // Check for SSN patterns
      if (candidateData.resume && this.containsSSN(candidateData.resume)) {
        violations.push('Resume contains potential SSN');
      }
    }

    return {
      compliant: violations.length === 0,
      violations
    };
  }

  /**
   * Generate model access token
   */
  generateModelAccessToken(userId: string, modelName: string, expiresIn: number = 3600): string {
    const payload = {
      userId,
      modelName,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + expiresIn
    };

    return this.encryptData(JSON.stringify(payload));
  }

  /**
   * Validate model access token
   */
  validateModelAccessToken(token: string): { valid: boolean; payload?: any } {
    try {
      const decrypted = this.decryptData(token);
      const payload = JSON.parse(decrypted);

      if (payload.exp < Math.floor(Date.now() / 1000)) {
        return { valid: false };
      }

      return { valid: true, payload };
    } catch {
      return { valid: false };
    }
  }

  /**
   * Check for suspicious content
   */
  private containsSuspiciousContent(text: string): boolean {
    const suspiciousPatterns = [
      /<script/i,
      /javascript:/i,
      /on\w+\s*=/i,
      /eval\s*\(/i,
      /exec\s*\(/i,
      /system\s*\(/i,
      /\$\{.*\}/,
      /<%.*%>/
    ];

    return suspiciousPatterns.some(pattern => pattern.test(text));
  }

  /**
   * Sanitize text content
   */
  private sanitizeText(text: string): string {
    return text
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/[<>&"']/g, '') // Remove potentially dangerous characters
      .trim();
  }

  /**
   * Check for email addresses
   */
  private containsEmail(text: string): boolean {
    const emailPattern = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
    return emailPattern.test(text);
  }

  /**
   * Check for phone numbers
   */
  private containsPhoneNumber(text: string): boolean {
    const phonePattern = /(\+?1[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}/;
    return phonePattern.test(text);
  }

  /**
   * Check for SSN patterns
   */
  private containsSSN(text: string): boolean {
    const ssnPattern = /\b\d{3}-?\d{2}-?\d{4}\b/;
    return ssnPattern.test(text);
  }

  /**
   * Generate encryption key
   */
  private generateEncryptionKey(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Store audit log
   */
  private async storeAuditLog(auditLog: Omit<MLAuditLog, 'id'>): Promise<void> {
    // This would store in a dedicated audit table
    // For now, we'll use the existing structure or create a simple log
    logger.info('ML Audit Log', auditLog);
  }
}

export const mlSecurityService = new MLSecurityService(new PrismaClient());
