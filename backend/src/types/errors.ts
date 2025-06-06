// Standardized error response types for TalentSol ATS

export interface StandardErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: string;
    field?: string;
    timestamp: string;
    requestId?: string;
  };
  data?: null;
}

export interface ValidationErrorResponse extends StandardErrorResponse {
  error: StandardErrorResponse['error'] & {
    code: 'VALIDATION_ERROR';
    validationErrors: Array<{
      field: string;
      message: string;
      value?: any;
    }>;
  };
}

export interface AuthenticationErrorResponse extends StandardErrorResponse {
  error: StandardErrorResponse['error'] & {
    code: 'AUTHENTICATION_ERROR' | 'AUTHORIZATION_ERROR' | 'TOKEN_EXPIRED';
  };
}

export interface DatabaseErrorResponse extends StandardErrorResponse {
  error: StandardErrorResponse['error'] & {
    code: 'DATABASE_ERROR' | 'RECORD_NOT_FOUND' | 'DUPLICATE_RECORD';
  };
}

export interface BusinessLogicErrorResponse extends StandardErrorResponse {
  error: StandardErrorResponse['error'] & {
    code: 'BUSINESS_LOGIC_ERROR' | 'INVALID_OPERATION' | 'RESOURCE_CONFLICT';
  };
}

export interface ServerErrorResponse extends StandardErrorResponse {
  error: StandardErrorResponse['error'] & {
    code: 'INTERNAL_SERVER_ERROR' | 'SERVICE_UNAVAILABLE' | 'TIMEOUT_ERROR';
  };
}

// Error codes enum for consistency
export enum ErrorCodes {
  // Authentication & Authorization
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR = 'AUTHORIZATION_ERROR',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',

  // Validation
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD',
  INVALID_FORMAT = 'INVALID_FORMAT',
  INVALID_VALUE = 'INVALID_VALUE',

  // Database
  DATABASE_ERROR = 'DATABASE_ERROR',
  RECORD_NOT_FOUND = 'RECORD_NOT_FOUND',
  DUPLICATE_RECORD = 'DUPLICATE_RECORD',
  FOREIGN_KEY_CONSTRAINT = 'FOREIGN_KEY_CONSTRAINT',

  // Business Logic
  BUSINESS_LOGIC_ERROR = 'BUSINESS_LOGIC_ERROR',
  INVALID_OPERATION = 'INVALID_OPERATION',
  RESOURCE_CONFLICT = 'RESOURCE_CONFLICT',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',

  // Server Errors
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',

  // Application Specific
  APPLICATION_NOT_FOUND = 'APPLICATION_NOT_FOUND',
  CANDIDATE_NOT_FOUND = 'CANDIDATE_NOT_FOUND',
  JOB_NOT_FOUND = 'JOB_NOT_FOUND',
  INTERVIEW_NOT_FOUND = 'INTERVIEW_NOT_FOUND',
  COMPANY_NOT_FOUND = 'COMPANY_NOT_FOUND',
  USER_NOT_FOUND = 'USER_NOT_FOUND',

  // File Operations
  FILE_UPLOAD_ERROR = 'FILE_UPLOAD_ERROR',
  FILE_NOT_FOUND = 'FILE_NOT_FOUND',
  INVALID_FILE_TYPE = 'INVALID_FILE_TYPE',
  FILE_SIZE_EXCEEDED = 'FILE_SIZE_EXCEEDED',

  // ML/AI Specific
  ML_MODEL_ERROR = 'ML_MODEL_ERROR',
  PREDICTION_FAILED = 'PREDICTION_FAILED',
  TRAINING_DATA_INVALID = 'TRAINING_DATA_INVALID',
}

// HTTP Status Code mapping
export const ErrorStatusCodes: Record<string, number> = {
  [ErrorCodes.AUTHENTICATION_ERROR]: 401,
  [ErrorCodes.AUTHORIZATION_ERROR]: 403,
  [ErrorCodes.TOKEN_EXPIRED]: 401,
  [ErrorCodes.INVALID_CREDENTIALS]: 401,

  [ErrorCodes.VALIDATION_ERROR]: 400,
  [ErrorCodes.MISSING_REQUIRED_FIELD]: 400,
  [ErrorCodes.INVALID_FORMAT]: 400,
  [ErrorCodes.INVALID_VALUE]: 400,

  [ErrorCodes.RECORD_NOT_FOUND]: 404,
  [ErrorCodes.APPLICATION_NOT_FOUND]: 404,
  [ErrorCodes.CANDIDATE_NOT_FOUND]: 404,
  [ErrorCodes.JOB_NOT_FOUND]: 404,
  [ErrorCodes.INTERVIEW_NOT_FOUND]: 404,
  [ErrorCodes.COMPANY_NOT_FOUND]: 404,
  [ErrorCodes.USER_NOT_FOUND]: 404,
  [ErrorCodes.FILE_NOT_FOUND]: 404,

  [ErrorCodes.DUPLICATE_RECORD]: 409,
  [ErrorCodes.RESOURCE_CONFLICT]: 409,
  [ErrorCodes.FOREIGN_KEY_CONSTRAINT]: 409,

  [ErrorCodes.BUSINESS_LOGIC_ERROR]: 422,
  [ErrorCodes.INVALID_OPERATION]: 422,
  [ErrorCodes.INSUFFICIENT_PERMISSIONS]: 403,

  [ErrorCodes.RATE_LIMIT_EXCEEDED]: 429,

  [ErrorCodes.INTERNAL_SERVER_ERROR]: 500,
  [ErrorCodes.DATABASE_ERROR]: 500,
  [ErrorCodes.SERVICE_UNAVAILABLE]: 503,
  [ErrorCodes.TIMEOUT_ERROR]: 504,

  [ErrorCodes.FILE_UPLOAD_ERROR]: 400,
  [ErrorCodes.INVALID_FILE_TYPE]: 400,
  [ErrorCodes.FILE_SIZE_EXCEEDED]: 413,

  [ErrorCodes.ML_MODEL_ERROR]: 500,
  [ErrorCodes.PREDICTION_FAILED]: 500,
  [ErrorCodes.TRAINING_DATA_INVALID]: 400,
};

// User-friendly error messages
export const ErrorMessages: Record<string, string> = {
  [ErrorCodes.AUTHENTICATION_ERROR]: 'Authentication required. Please log in to continue.',
  [ErrorCodes.AUTHORIZATION_ERROR]: 'You do not have permission to perform this action.',
  [ErrorCodes.TOKEN_EXPIRED]: 'Your session has expired. Please log in again.',
  [ErrorCodes.INVALID_CREDENTIALS]: 'Invalid email or password. Please try again.',

  [ErrorCodes.VALIDATION_ERROR]: 'The provided data is invalid. Please check your input.',
  [ErrorCodes.MISSING_REQUIRED_FIELD]: 'Required field is missing. Please provide all required information.',
  [ErrorCodes.INVALID_FORMAT]: 'The format of the provided data is incorrect.',
  [ErrorCodes.INVALID_VALUE]: 'The provided value is not valid for this field.',

  [ErrorCodes.RECORD_NOT_FOUND]: 'The requested record was not found.',
  [ErrorCodes.APPLICATION_NOT_FOUND]: 'Application not found or you do not have access to it.',
  [ErrorCodes.CANDIDATE_NOT_FOUND]: 'Candidate not found or you do not have access to them.',
  [ErrorCodes.JOB_NOT_FOUND]: 'Job posting not found or you do not have access to it.',
  [ErrorCodes.INTERVIEW_NOT_FOUND]: 'Interview not found or you do not have access to it.',
  [ErrorCodes.COMPANY_NOT_FOUND]: 'Company not found.',
  [ErrorCodes.USER_NOT_FOUND]: 'User not found.',
  [ErrorCodes.FILE_NOT_FOUND]: 'File not found.',

  [ErrorCodes.DUPLICATE_RECORD]: 'A record with this information already exists.',
  [ErrorCodes.RESOURCE_CONFLICT]: 'This operation conflicts with existing data.',
  [ErrorCodes.FOREIGN_KEY_CONSTRAINT]: 'This record is referenced by other data and cannot be modified.',

  [ErrorCodes.BUSINESS_LOGIC_ERROR]: 'This operation violates business rules.',
  [ErrorCodes.INVALID_OPERATION]: 'This operation is not allowed in the current state.',
  [ErrorCodes.INSUFFICIENT_PERMISSIONS]: 'You do not have sufficient permissions for this action.',

  [ErrorCodes.RATE_LIMIT_EXCEEDED]: 'Too many requests. Please try again later.',

  [ErrorCodes.INTERNAL_SERVER_ERROR]: 'An internal server error occurred. Please try again later.',
  [ErrorCodes.DATABASE_ERROR]: 'A database error occurred. Please try again later.',
  [ErrorCodes.SERVICE_UNAVAILABLE]: 'Service is temporarily unavailable. Please try again later.',
  [ErrorCodes.TIMEOUT_ERROR]: 'Request timed out. Please try again.',

  [ErrorCodes.FILE_UPLOAD_ERROR]: 'File upload failed. Please try again.',
  [ErrorCodes.INVALID_FILE_TYPE]: 'Invalid file type. Please upload a supported file format.',
  [ErrorCodes.FILE_SIZE_EXCEEDED]: 'File size exceeds the maximum allowed limit.',

  [ErrorCodes.ML_MODEL_ERROR]: 'Machine learning model error occurred.',
  [ErrorCodes.PREDICTION_FAILED]: 'Failed to generate prediction. Please try again.',
  [ErrorCodes.TRAINING_DATA_INVALID]: 'Training data is invalid or insufficient.',
};
