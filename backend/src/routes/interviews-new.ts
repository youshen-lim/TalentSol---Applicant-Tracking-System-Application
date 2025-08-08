import express from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import { authenticateToken } from '../middleware/auth.js';
import { InterviewController } from '../controllers/interviewController.js';
import { BulkInterviewController } from '../controllers/bulkInterviewController.js';
import { 
  validateInterviewData, 
  validateBulkOperation,
  generalLimiter,
  bulkOperationLimiter,
  emailLimiter,
  sanitizeInput,
  handleDatabaseError
} from '../middleware/security.js';

const router = express.Router();

// Apply security middleware
router.use(generalLimiter);
router.use(sanitizeInput);

// Apply authentication to all routes
router.use(authenticateToken);

// GET /api/interviews - Get all interviews for company
router.get('/', asyncHandler(InterviewController.getInterviews));

// GET /api/interviews/upcoming - Get upcoming interviews
router.get('/upcoming', asyncHandler(async (req, res) => {
  // This could be moved to controller as well
  req.query = { ...req.query, upcoming: 'true' };
  await InterviewController.getInterviews(req, res);
}));

// GET /api/interviews/:id - Get single interview
router.get('/:id', asyncHandler(InterviewController.getInterview));

// POST /api/interviews - Create new interview
router.post('/', 
  validateInterviewData,
  emailLimiter,
  asyncHandler(InterviewController.createInterview)
);

// PUT /api/interviews/:id - Update interview
router.put('/:id', 
  validateInterviewData,
  asyncHandler(InterviewController.updateInterview)
);

// DELETE /api/interviews/:id - Delete interview
router.delete('/:id', 
  emailLimiter,
  asyncHandler(InterviewController.deleteInterview)
);

// POST /api/interviews/bulk-operations - Bulk operations
router.post('/bulk-operations',
  bulkOperationLimiter,
  validateBulkOperation,
  emailLimiter,
  asyncHandler(BulkInterviewController.bulkOperations)
);

// Error handling middleware specific to interviews
router.use((error: any, req: any, res: any, next: any) => {
  if (error.code && error.code.startsWith('P')) {
    // Prisma error
    const dbError = handleDatabaseError(error);
    return res.status(dbError.statusCode).json({
      error: dbError.message,
      statusCode: dbError.statusCode
    });
  }
  next(error);
});

export default router;
