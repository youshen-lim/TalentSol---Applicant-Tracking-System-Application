import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import { prisma } from '../index.js';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = process.env.UPLOAD_DIR || 'uploads';
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error as Error, '');
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Allow common document types
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'image/jpeg',
    'image/png',
    'image/gif',
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, DOC, DOCX, TXT, and image files are allowed.'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'), // 10MB default
  },
});

// Get all documents for an application
router.get('/application/:applicationId', asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { applicationId } = req.params;

  // Check if application exists and belongs to user's company
  const application = await prisma.application.findFirst({
    where: {
      id: applicationId,
      job: {
        companyId: req.user!.companyId,
      },
    },
  });

  if (!application) {
    throw new AppError('Application not found', 404);
  }

  const documents = await prisma.document.findMany({
    where: { applicationId },
    orderBy: { uploadedAt: 'desc' },
  });

  res.json(documents);
}));

// Get single document
router.get('/:id', asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { id } = req.params;

  const document = await prisma.document.findFirst({
    where: {
      id,
      application: {
        job: {
          companyId: req.user!.companyId,
        },
      },
    },
    include: {
      application: {
        include: {
          candidate: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
          job: {
            select: {
              title: true,
            },
          },
        },
      },
    },
  });

  if (!document) {
    throw new AppError('Document not found', 404);
  }

  res.json(document);
}));

// Download document file
router.get('/:id/download', asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { id } = req.params;

  const document = await prisma.document.findFirst({
    where: {
      id,
      application: {
        job: {
          companyId: req.user!.companyId,
        },
      },
    },
  });

  if (!document) {
    throw new AppError('Document not found', 404);
  }

  try {
    // Check if file exists
    await fs.access(document.fileUrl);
    
    res.setHeader('Content-Disposition', `attachment; filename="${document.filename}"`);
    res.setHeader('Content-Type', document.fileType || 'application/octet-stream');
    
    res.sendFile(path.resolve(document.fileUrl));
  } catch (error) {
    throw new AppError('File not found on server', 404);
  }
}));

// Upload document
router.post('/upload/:applicationId', upload.single('document'), asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { applicationId } = req.params;
  const { documentType = 'other' } = req.body;

  if (!req.file) {
    throw new AppError('No file uploaded', 400);
  }

  // Check if application exists and belongs to user's company
  const application = await prisma.application.findFirst({
    where: {
      id: applicationId,
      job: {
        companyId: req.user!.companyId,
      },
    },
  });

  if (!application) {
    // Clean up uploaded file
    await fs.unlink(req.file.path).catch(() => {});
    throw new AppError('Application not found', 404);
  }

  const document = await prisma.document.create({
    data: {
      applicationId,
      filename: req.file.originalname,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
      fileUrl: req.file.path,
      documentType,
    },
  });

  // Update application activity
  const applicationForActivity = await prisma.application.findUnique({
    where: { id: applicationId },
    select: { activity: true },
  });

  let activities: any[] = [];
  if (applicationForActivity?.activity) {
    try {
      activities = JSON.parse(applicationForActivity.activity);
    } catch (error) {
      console.warn('Failed to parse existing activity:', error);
    }
  }

  activities.push({
    type: 'document_uploaded',
    timestamp: new Date().toISOString(),
    description: `Document "${req.file.originalname}" uploaded`,
    userId: req.user!.id,
  });

  await prisma.application.update({
    where: { id: applicationId },
    data: {
      activity: JSON.stringify(activities),
    },
  });

  res.status(201).json({
    message: 'Document uploaded successfully',
    document,
  });
}));

// Delete document
router.delete('/:id', asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { id } = req.params;

  const document = await prisma.document.findFirst({
    where: {
      id,
      application: {
        job: {
          companyId: req.user!.companyId,
        },
      },
    },
  });

  if (!document) {
    throw new AppError('Document not found', 404);
  }

  // Delete file from filesystem
  try {
    await fs.unlink(document.fileUrl);
  } catch (error) {
    console.warn('Could not delete file from filesystem:', error);
  }

  // Delete document record
  await prisma.document.delete({
    where: { id },
  });

  res.json({
    message: 'Document deleted successfully',
  });
}));

// Update document metadata
router.put('/:id', asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const { documentType, filename } = req.body;

  const document = await prisma.document.findFirst({
    where: {
      id,
      application: {
        job: {
          companyId: req.user!.companyId,
        },
      },
    },
  });

  if (!document) {
    throw new AppError('Document not found', 404);
  }

  const updatedDocument = await prisma.document.update({
    where: { id },
    data: {
      ...(documentType && { documentType }),
      ...(filename && { filename }),
    },
  });

  res.json({
    message: 'Document updated successfully',
    document: updatedDocument,
  });
}));

export default router;
