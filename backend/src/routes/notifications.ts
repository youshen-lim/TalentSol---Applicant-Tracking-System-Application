import express from 'express';
import { prisma } from '../index.js';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { z } from 'zod';

const router = express.Router();

// Validation schemas
const createNotificationSchema = z.object({
  userId: z.string().cuid(),
  type: z.enum(['new_application', 'status_change', 'system_alert', 'interview_reminder']),
  title: z.string().min(1),
  message: z.string().min(1),
  metadata: z.record(z.any()).optional(),
});

const markReadSchema = z.object({
  notificationIds: z.array(z.string().cuid()),
});

// Get all notifications for the authenticated user
router.get('/', asyncHandler(async (req: AuthenticatedRequest, res) => {
  const {
    page = '1',
    limit = '20',
    unreadOnly = 'false',
  } = req.query;

  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  const where: any = {
    userId: req.user!.id,
  };

  if (unreadOnly === 'true') {
    where.isRead = false;
  }

  const [notifications, total, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where,
      skip,
      take: limitNum,
      orderBy: {
        createdAt: 'desc',
      },
    }),
    prisma.notification.count({ where }),
    prisma.notification.count({
      where: {
        userId: req.user!.id,
        isRead: false,
      },
    }),
  ]);

  res.json({
    notifications,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum),
    },
    unreadCount,
  });
}));

// Get unread notification count
router.get('/unread-count', asyncHandler(async (req: AuthenticatedRequest, res) => {
  const unreadCount = await prisma.notification.count({
    where: {
      userId: req.user!.id,
      isRead: false,
    },
  });

  res.json({ unreadCount });
}));

// Mark notifications as read
router.patch('/mark-read', asyncHandler(async (req: AuthenticatedRequest, res) => {
  const validatedData = markReadSchema.parse(req.body);

  await prisma.notification.updateMany({
    where: {
      id: {
        in: validatedData.notificationIds,
      },
      userId: req.user!.id, // Ensure user can only mark their own notifications
    },
    data: {
      isRead: true,
    },
  });

  res.json({
    message: 'Notifications marked as read',
    count: validatedData.notificationIds.length,
  });
}));

// Mark all notifications as read
router.patch('/mark-all-read', asyncHandler(async (req: AuthenticatedRequest, res) => {
  const result = await prisma.notification.updateMany({
    where: {
      userId: req.user!.id,
      isRead: false,
    },
    data: {
      isRead: true,
    },
  });

  res.json({
    message: 'All notifications marked as read',
    count: result.count,
  });
}));

// Create notification (admin/system use)
router.post('/', asyncHandler(async (req: AuthenticatedRequest, res) => {
  // Only allow admin users to create notifications
  if (req.user!.role !== 'admin') {
    throw new AppError('Insufficient permissions', 403);
  }

  const validatedData = createNotificationSchema.parse(req.body);

  const notification = await prisma.notification.create({
    data: validatedData,
  });

  res.status(201).json({
    message: 'Notification created successfully',
    notification,
  });
}));

// Delete notification
router.delete('/:id', asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { id } = req.params;

  const notification = await prisma.notification.findFirst({
    where: {
      id,
      userId: req.user!.id,
    },
  });

  if (!notification) {
    throw new AppError('Notification not found', 404);
  }

  await prisma.notification.delete({
    where: { id },
  });

  res.json({
    message: 'Notification deleted successfully',
  });
}));

// Helper function to create notifications (for internal use)
export const createNotification = async (
  userId: string,
  type: string,
  title: string,
  message: string,
  metadata?: any
) => {
  return await prisma.notification.create({
    data: {
      userId,
      type,
      title,
      message,
      metadata,
    },
  });
};

export default router;
