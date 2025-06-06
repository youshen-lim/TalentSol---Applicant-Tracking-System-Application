import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { body, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';
import { AppError } from './errorHandler.js';

// Rate limiting configurations
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 auth requests per windowMs
  message: {
    error: 'Too many authentication attempts, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const bulkOperationLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 10, // Limit bulk operations
  message: {
    error: 'Too many bulk operations, please try again later.',
    retryAfter: '5 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const emailLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50, // Limit email sending
  message: {
    error: 'Too many emails sent, please try again later.',
    retryAfter: '1 hour'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Helmet configuration for security headers
export const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "ws:", "wss:"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
});

// Input sanitization middleware
export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
  const sanitizeValue = (value: any): any => {
    if (typeof value === 'string') {
      // Remove potentially dangerous characters
      return value
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+\s*=/gi, '')
        .trim();
    }
    if (typeof value === 'object' && value !== null) {
      if (Array.isArray(value)) {
        return value.map(sanitizeValue);
      }
      const sanitized: any = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = sanitizeValue(val);
      }
      return sanitized;
    }
    return value;
  };

  if (req.body) {
    req.body = sanitizeValue(req.body);
  }
  if (req.query) {
    req.query = sanitizeValue(req.query);
  }
  if (req.params) {
    req.params = sanitizeValue(req.params);
  }

  next();
};

// Validation error handler
export const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => ({
      field: error.type === 'field' ? error.path : 'unknown',
      message: error.msg,
      value: error.type === 'field' ? error.value : undefined
    }));
    
    throw new AppError('Validation failed', 400, errorMessages);
  }
  next();
};

// Common validation rules
export const validateInterviewData = [
  body('title')
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters')
    .escape(),
  body('type')
    .optional()
    .isIn(['technical', 'behavioral', 'cultural_fit', 'final', 'screening'])
    .withMessage('Invalid interview type'),
  body('scheduledDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid date format'),
  body('startTime')
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Invalid time format (HH:MM)'),
  body('endTime')
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Invalid time format (HH:MM)'),
  body('location')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Location must be less than 500 characters')
    .escape(),
  body('meetingLink')
    .optional()
    .isURL()
    .withMessage('Invalid meeting link URL'),
  body('notes')
    .optional()
    .isLength({ max: 2000 })
    .withMessage('Notes must be less than 2000 characters')
    .escape(),
  handleValidationErrors
];

export const validateTemplateData = [
  body('name')
    .isLength({ min: 1, max: 200 })
    .withMessage('Template name must be between 1 and 200 characters')
    .escape(),
  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Description must be less than 1000 characters')
    .escape(),
  body('type')
    .isIn(['technical', 'behavioral', 'cultural_fit', 'final', 'screening'])
    .withMessage('Invalid template type'),
  body('duration')
    .isInt({ min: 15, max: 480 })
    .withMessage('Duration must be between 15 and 480 minutes'),
  body('location')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Location must be less than 500 characters')
    .escape(),
  body('meetingLink')
    .optional()
    .isURL()
    .withMessage('Invalid meeting link URL'),
  body('instructions')
    .optional()
    .isLength({ max: 2000 })
    .withMessage('Instructions must be less than 2000 characters')
    .escape(),
  handleValidationErrors
];

export const validateBulkOperation = [
  body('operation')
    .isIn(['reschedule', 'cancel', 'send_reminder', 'export', 'delete', 'update_status', 'assign_interviewer'])
    .withMessage('Invalid bulk operation'),
  body('interviewIds')
    .isArray({ min: 1, max: 100 })
    .withMessage('Interview IDs must be an array with 1-100 items'),
  body('interviewIds.*')
    .isString()
    .isLength({ min: 1 })
    .withMessage('Each interview ID must be a non-empty string'),
  handleValidationErrors
];

// Enhanced authentication with better error handling
export const enhancedAuth = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  
  if (!authHeader) {
    throw new AppError('Authorization header required', 401);
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    throw new AppError('Invalid authorization header format. Use: Bearer <token>', 401);
  }

  const token = parts[1];
  if (!token || token.length < 10) {
    throw new AppError('Invalid token format', 401);
  }

  // Token validation will be handled by the existing authenticateToken middleware
  next();
};

// WebSocket authentication enhancement
export const validateWebSocketAuth = (token: string): boolean => {
  if (!token || typeof token !== 'string') {
    return false;
  }

  // Basic token format validation
  if (token.length < 10 || !token.includes('.')) {
    return false;
  }

  try {
    // Additional JWT format validation
    const parts = token.split('.');
    if (parts.length !== 3) {
      return false;
    }

    // Validate base64 encoding of header and payload
    const header = JSON.parse(Buffer.from(parts[0], 'base64').toString());
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());

    if (!header.alg || !payload.exp || !payload.userId) {
      return false;
    }

    // Check if token is expired
    if (payload.exp * 1000 < Date.now()) {
      return false;
    }

    return true;
  } catch (error) {
    return false;
  }
};

// Database error handler
export const handleDatabaseError = (error: any): AppError => {
  // Prisma specific error handling
  if (error.code === 'P2002') {
    return new AppError('Duplicate entry found', 409);
  }
  if (error.code === 'P2025') {
    return new AppError('Record not found', 404);
  }
  if (error.code === 'P2003') {
    return new AppError('Foreign key constraint failed', 400);
  }
  if (error.code === 'P2014') {
    return new AppError('Invalid data provided', 400);
  }

  // Generic database errors
  if (error.message?.includes('timeout')) {
    return new AppError('Database operation timed out', 503);
  }
  if (error.message?.includes('connection')) {
    return new AppError('Database connection error', 503);
  }

  // Default database error
  return new AppError('Database operation failed', 500);
};
