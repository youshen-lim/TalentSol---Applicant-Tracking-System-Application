// Response Helper Functions for TalentSol ATS Backend
// Provides standardized response formatting utilities

import { Response } from 'express';
import { 
  StandardResponse, 
  PaginatedResponse, 
  ErrorResponse 
} from '../types/api-responses.js';

/**
 * Send a successful response with data
 */
export const sendSuccess = <T>(
  res: Response,
  data: T,
  message?: string,
  statusCode: number = 200
): Response<StandardResponse<T>> => {
  const response: StandardResponse<T> = {
    success: true,
    data,
    message,
    timestamp: new Date().toISOString()
  };

  return res.status(statusCode).json(response);
};

/**
 * Send a paginated response with data and pagination metadata
 */
export const sendPaginatedSuccess = <T>(
  res: Response,
  data: T[],
  pagination: {
    page: number;
    limit: number;
    total: number;
  },
  message?: string,
  statusCode: number = 200
): Response<PaginatedResponse<T>> => {
  const totalPages = Math.ceil(pagination.total / pagination.limit);
  
  const response: PaginatedResponse<T> = {
    success: true,
    data,
    message,
    timestamp: new Date().toISOString(),
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total: pagination.total,
      totalPages,
      hasNext: pagination.page < totalPages,
      hasPrev: pagination.page > 1
    }
  };

  return res.status(statusCode).json(response);
};

/**
 * Send an error response
 */
export const sendError = (
  res: Response,
  error: string,
  statusCode: number = 400,
  details?: any,
  code?: string
): Response<ErrorResponse> => {
  const response: ErrorResponse = {
    success: false,
    error,
    details,
    code,
    timestamp: new Date().toISOString()
  };

  return res.status(statusCode).json(response);
};

/**
 * Send a validation error response
 */
export const sendValidationError = (
  res: Response,
  errors: Array<{ field: string; message: string }>,
  message: string = 'Validation failed'
): Response<ErrorResponse> => {
  return sendError(res, message, 422, { validationErrors: errors }, 'VALIDATION_ERROR');
};

/**
 * Send a not found error response
 */
export const sendNotFound = (
  res: Response,
  resource: string = 'Resource'
): Response<ErrorResponse> => {
  return sendError(res, `${resource} not found`, 404, undefined, 'NOT_FOUND');
};

/**
 * Send an unauthorized error response
 */
export const sendUnauthorized = (
  res: Response,
  message: string = 'Unauthorized access'
): Response<ErrorResponse> => {
  return sendError(res, message, 401, undefined, 'UNAUTHORIZED');
};

/**
 * Send a forbidden error response
 */
export const sendForbidden = (
  res: Response,
  message: string = 'Access forbidden'
): Response<ErrorResponse> => {
  return sendError(res, message, 403, undefined, 'FORBIDDEN');
};

/**
 * Send a conflict error response
 */
export const sendConflict = (
  res: Response,
  message: string = 'Resource already exists'
): Response<ErrorResponse> => {
  return sendError(res, message, 409, undefined, 'CONFLICT');
};

/**
 * Send an internal server error response
 */
export const sendInternalError = (
  res: Response,
  message: string = 'Internal server error',
  details?: any
): Response<ErrorResponse> => {
  return sendError(res, message, 500, details, 'INTERNAL_ERROR');
};

/**
 * Send a created response (for POST requests)
 */
export const sendCreated = <T>(
  res: Response,
  data: T,
  message?: string
): Response<StandardResponse<T>> => {
  return sendSuccess(res, data, message, 201);
};

/**
 * Send a no content response (for DELETE requests)
 */
export const sendNoContent = (res: Response): Response => {
  return res.status(204).send();
};

/**
 * Send an accepted response (for async operations)
 */
export const sendAccepted = <T>(
  res: Response,
  data: T,
  message?: string
): Response<StandardResponse<T>> => {
  return sendSuccess(res, data, message, 202);
};

/**
 * Handle async route errors and send appropriate response
 */
export const handleAsyncError = (
  res: Response,
  error: any,
  defaultMessage: string = 'Operation failed'
): Response<ErrorResponse> => {
  console.error('Async route error:', error);

  // Handle known error types
  if (error.name === 'ValidationError') {
    return sendValidationError(res, error.errors || [], error.message);
  }

  if (error.name === 'CastError') {
    return sendError(res, 'Invalid ID format', 400, undefined, 'INVALID_ID');
  }

  if (error.code === 11000) {
    return sendConflict(res, 'Duplicate entry detected');
  }

  // Handle custom AppError
  if (error.statusCode) {
    return sendError(res, error.message, error.statusCode, error.details, error.code);
  }

  // Default to internal server error
  return sendInternalError(res, defaultMessage, process.env.NODE_ENV === 'development' ? error.stack : undefined);
};

/**
 * Middleware to wrap async route handlers
 */
export const asyncHandler = (fn: Function) => {
  return (req: any, res: Response, next: Function) => {
    Promise.resolve(fn(req, res, next)).catch((error) => {
      handleAsyncError(res, error);
    });
  };
};

/**
 * Format data for consistent API responses
 */
export const formatResponseData = <T>(data: T, transformer?: (item: any) => any): T => {
  if (!data) return data;

  if (Array.isArray(data)) {
    return (transformer ? data.map(transformer) : data) as T;
  }

  return transformer ? transformer(data) : data;
};

/**
 * Create a standardized health check response
 */
export const createHealthResponse = (
  status: 'healthy' | 'degraded' | 'unhealthy',
  details: any
) => {
  return {
    status,
    version: process.env.npm_package_version || '1.0.0',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    ...details
  };
};
