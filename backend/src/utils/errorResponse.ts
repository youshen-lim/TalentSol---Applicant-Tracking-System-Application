import { Response } from 'express';
import { 
  StandardErrorResponse, 
  ValidationErrorResponse,
  ErrorCodes, 
  ErrorStatusCodes, 
  ErrorMessages 
} from '../types/errors.js';
import { ZodError } from 'zod';

/**
 * Standardized error response utility for TalentSol ATS
 * Provides consistent error formatting across all API endpoints
 */
export class ErrorResponseUtil {
  /**
   * Generate a unique request ID for error tracking
   */
  private static generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Send a standardized error response
   */
  static sendError(
    res: Response,
    code: ErrorCodes,
    message?: string,
    details?: string,
    field?: string,
    statusCode?: number
  ): void {
    const errorResponse: StandardErrorResponse = {
      success: false,
      error: {
        code,
        message: message || ErrorMessages[code] || 'An error occurred',
        details,
        field,
        timestamp: new Date().toISOString(),
        requestId: this.generateRequestId(),
      },
      data: null,
    };

    const status = statusCode || ErrorStatusCodes[code] || 500;
    res.status(status).json(errorResponse);
  }

  /**
   * Send validation error response with field-specific errors
   */
  static sendValidationError(
    res: Response,
    validationErrors: Array<{ field: string; message: string; value?: any }>,
    message?: string
  ): void {
    const errorResponse: ValidationErrorResponse = {
      success: false,
      error: {
        code: ErrorCodes.VALIDATION_ERROR,
        message: message || ErrorMessages[ErrorCodes.VALIDATION_ERROR],
        timestamp: new Date().toISOString(),
        requestId: this.generateRequestId(),
        validationErrors,
      },
      data: null,
    };

    res.status(400).json(errorResponse);
  }

  /**
   * Convert Zod validation errors to standardized format
   */
  static sendZodValidationError(res: Response, zodError: ZodError): void {
    const validationErrors = zodError.errors.map(err => ({
      field: err.path.join('.'),
      message: err.message,
      value: err.code === 'invalid_type' ? undefined : (err as any).input,
    }));

    this.sendValidationError(res, validationErrors);
  }

  /**
   * Send authentication error
   */
  static sendAuthError(res: Response, message?: string): void {
    this.sendError(res, ErrorCodes.AUTHENTICATION_ERROR, message);
  }

  /**
   * Send authorization error
   */
  static sendAuthorizationError(res: Response, message?: string): void {
    this.sendError(res, ErrorCodes.AUTHORIZATION_ERROR, message);
  }

  /**
   * Send not found error
   */
  static sendNotFoundError(res: Response, resource: string = 'Resource'): void {
    this.sendError(
      res, 
      ErrorCodes.RECORD_NOT_FOUND, 
      `${resource} not found or you do not have access to it`
    );
  }

  /**
   * Send application-specific not found errors
   */
  static sendApplicationNotFound(res: Response): void {
    this.sendError(res, ErrorCodes.APPLICATION_NOT_FOUND);
  }

  static sendCandidateNotFound(res: Response): void {
    this.sendError(res, ErrorCodes.CANDIDATE_NOT_FOUND);
  }

  static sendJobNotFound(res: Response): void {
    this.sendError(res, ErrorCodes.JOB_NOT_FOUND);
  }

  static sendInterviewNotFound(res: Response): void {
    this.sendError(res, ErrorCodes.INTERVIEW_NOT_FOUND);
  }

  static sendCompanyNotFound(res: Response): void {
    this.sendError(res, ErrorCodes.COMPANY_NOT_FOUND);
  }

  static sendUserNotFound(res: Response): void {
    this.sendError(res, ErrorCodes.USER_NOT_FOUND);
  }

  /**
   * Send database error
   */
  static sendDatabaseError(res: Response, details?: string): void {
    this.sendError(res, ErrorCodes.DATABASE_ERROR, undefined, details);
  }

  /**
   * Send duplicate record error
   */
  static sendDuplicateError(res: Response, resource: string = 'Record'): void {
    this.sendError(
      res, 
      ErrorCodes.DUPLICATE_RECORD, 
      `${resource} already exists with this information`
    );
  }

  /**
   * Send business logic error
   */
  static sendBusinessLogicError(res: Response, message: string): void {
    this.sendError(res, ErrorCodes.BUSINESS_LOGIC_ERROR, message);
  }

  /**
   * Send rate limit error
   */
  static sendRateLimitError(res: Response): void {
    this.sendError(res, ErrorCodes.RATE_LIMIT_EXCEEDED);
  }

  /**
   * Send internal server error
   */
  static sendInternalServerError(res: Response, details?: string): void {
    this.sendError(res, ErrorCodes.INTERNAL_SERVER_ERROR, undefined, details);
  }

  /**
   * Send file upload error
   */
  static sendFileUploadError(res: Response, message?: string): void {
    this.sendError(res, ErrorCodes.FILE_UPLOAD_ERROR, message);
  }

  /**
   * Send invalid file type error
   */
  static sendInvalidFileTypeError(res: Response, allowedTypes: string[]): void {
    this.sendError(
      res, 
      ErrorCodes.INVALID_FILE_TYPE, 
      `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`
    );
  }

  /**
   * Send file size exceeded error
   */
  static sendFileSizeExceededError(res: Response, maxSize: string): void {
    this.sendError(
      res, 
      ErrorCodes.FILE_SIZE_EXCEEDED, 
      `File size exceeds maximum allowed size of ${maxSize}`
    );
  }

  /**
   * Send ML/AI specific errors
   */
  static sendMLModelError(res: Response, details?: string): void {
    this.sendError(res, ErrorCodes.ML_MODEL_ERROR, undefined, details);
  }

  static sendPredictionFailedError(res: Response, details?: string): void {
    this.sendError(res, ErrorCodes.PREDICTION_FAILED, undefined, details);
  }

  static sendInvalidTrainingDataError(res: Response, details?: string): void {
    this.sendError(res, ErrorCodes.TRAINING_DATA_INVALID, undefined, details);
  }

  /**
   * Handle generic errors and convert to standardized format
   */
  static handleGenericError(res: Response, error: any): void {
    console.error('Generic error:', error);

    // Handle Prisma errors
    if (error.code === 'P2002') {
      this.sendDuplicateError(res);
      return;
    }

    if (error.code === 'P2025') {
      this.sendNotFoundError(res);
      return;
    }

    // Handle Zod validation errors
    if (error instanceof ZodError) {
      this.sendZodValidationError(res, error);
      return;
    }

    // Handle custom AppError
    if (error.statusCode && error.message) {
      res.status(error.statusCode).json({
        success: false,
        error: {
          code: ErrorCodes.BUSINESS_LOGIC_ERROR,
          message: error.message,
          timestamp: new Date().toISOString(),
          requestId: this.generateRequestId(),
        },
        data: null,
      });
      return;
    }

    // Default to internal server error
    this.sendInternalServerError(res, error.message);
  }
}

/**
 * Express middleware for handling errors with standardized responses
 */
export const standardErrorHandler = (error: any, req: any, res: Response, next: any) => {
  ErrorResponseUtil.handleGenericError(res, error);
};
