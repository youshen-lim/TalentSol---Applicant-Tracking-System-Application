import express from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../index.js';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';
import { AuthenticatedRequest, requireRole } from '../middleware/auth.js';
import { z } from 'zod';

const router = express.Router();

// Get current user profile
router.get('/profile', asyncHandler(async (req: AuthenticatedRequest, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    include: {
      company: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  const { passwordHash, ...userWithoutPassword } = user;

  res.json(userWithoutPassword);
}));

// Update user profile
const updateProfileSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  bio: z.string().optional(),
  avatarUrl: z.string().url().optional(),
});

// User settings schema
const updateSettingsSchema = z.object({
  emailNotifications: z.boolean().optional(),
  pushNotifications: z.boolean().optional(),
  browserNotifications: z.boolean().optional(),
  newApplications: z.boolean().optional(),
  interviewReminders: z.boolean().optional(),
  systemUpdates: z.boolean().optional(),
  weeklyReports: z.boolean().optional(),
  theme: z.enum(['light', 'dark']).optional(),
  language: z.string().optional(),
  timezone: z.string().optional(),
  profileVisibility: z.enum(['public', 'team', 'private']).optional(),
  activityTracking: z.boolean().optional(),
  dataSharing: z.boolean().optional(),
  analyticsOptIn: z.boolean().optional(),
  compactMode: z.boolean().optional(),
  sidebarCollapsed: z.boolean().optional(),
});

router.put('/profile', asyncHandler(async (req: AuthenticatedRequest, res) => {
  const validatedData = updateProfileSchema.parse(req.body);

  // Check if email is already taken by another user
  if (validatedData.email) {
    const existingUser = await prisma.user.findFirst({
      where: {
        email: validatedData.email,
        id: { not: req.user!.id },
      },
    });

    if (existingUser) {
      throw new AppError('Email already in use', 409);
    }
  }

  const user = await prisma.user.update({
    where: { id: req.user!.id },
    data: validatedData,
    include: {
      company: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  const { passwordHash, ...userWithoutPassword } = user;

  res.json({
    message: 'Profile updated successfully',
    user: userWithoutPassword,
  });
}));

// Change password
const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
});

router.put('/password', asyncHandler(async (req: AuthenticatedRequest, res) => {
  const validatedData = changePasswordSchema.parse(req.body);

  // Get current user with password
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Verify current password
  const isCurrentPasswordValid = await bcrypt.compare(
    validatedData.currentPassword,
    user.passwordHash
  );

  if (!isCurrentPasswordValid) {
    throw new AppError('Current password is incorrect', 400);
  }

  // Hash new password
  const saltRounds = 12;
  const newPasswordHash = await bcrypt.hash(validatedData.newPassword, saltRounds);

  // Update password
  await prisma.user.update({
    where: { id: req.user!.id },
    data: { passwordHash: newPasswordHash },
  });

  res.json({
    message: 'Password changed successfully',
  });
}));

// Get user settings
router.get('/settings', asyncHandler(async (req: AuthenticatedRequest, res) => {
  let settings = await prisma.userSettings.findUnique({
    where: { userId: req.user!.id },
  });

  // Create default settings if they don't exist
  if (!settings) {
    settings = await prisma.userSettings.create({
      data: {
        userId: req.user!.id,
      },
    });
  }

  res.json(settings);
}));

// Update user settings
router.put('/settings', asyncHandler(async (req: AuthenticatedRequest, res) => {
  const validatedData = updateSettingsSchema.parse(req.body);

  const settings = await prisma.userSettings.upsert({
    where: { userId: req.user!.id },
    update: validatedData,
    create: {
      userId: req.user!.id,
      ...validatedData,
    },
  });

  res.json({
    message: 'Settings updated successfully',
    settings,
  });
}));

// Get all users in company (admin only)
router.get('/', requireRole(['admin']), asyncHandler(async (req: AuthenticatedRequest, res) => {
  const users = await prisma.user.findMany({
    where: { companyId: req.user!.companyId },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  res.json(users);
}));

// Create new user (admin only)
const createUserSchema = z.object({
  email: z.string().email('Invalid email format'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  role: z.enum(['admin', 'recruiter', 'hiring_manager']),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

router.post('/', requireRole(['admin']), asyncHandler(async (req: AuthenticatedRequest, res) => {
  const validatedData = createUserSchema.parse(req.body);

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: validatedData.email },
  });

  if (existingUser) {
    throw new AppError('User with this email already exists', 409);
  }

  // Hash password
  const saltRounds = 12;
  const passwordHash = await bcrypt.hash(validatedData.password, saltRounds);

  const user = await prisma.user.create({
    data: {
      email: validatedData.email,
      passwordHash,
      firstName: validatedData.firstName,
      lastName: validatedData.lastName,
      role: validatedData.role,
      companyId: req.user!.companyId,
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      createdAt: true,
    },
  });

  res.status(201).json({
    message: 'User created successfully',
    user,
  });
}));

// Update user (admin only)
const updateUserSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  role: z.enum(['admin', 'recruiter', 'hiring_manager']).optional(),
});

router.put('/:id', requireRole(['admin']), asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const validatedData = updateUserSchema.parse(req.body);

  // Check if user exists and belongs to same company
  const existingUser = await prisma.user.findFirst({
    where: {
      id,
      companyId: req.user!.companyId,
    },
  });

  if (!existingUser) {
    throw new AppError('User not found', 404);
  }

  const user = await prisma.user.update({
    where: { id },
    data: validatedData,
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      updatedAt: true,
    },
  });

  res.json({
    message: 'User updated successfully',
    user,
  });
}));

// Delete user (admin only)
router.delete('/:id', requireRole(['admin']), asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { id } = req.params;

  // Prevent self-deletion
  if (id === req.user!.id) {
    throw new AppError('Cannot delete your own account', 400);
  }

  // Check if user exists and belongs to same company
  const existingUser = await prisma.user.findFirst({
    where: {
      id,
      companyId: req.user!.companyId,
    },
  });

  if (!existingUser) {
    throw new AppError('User not found', 404);
  }

  await prisma.user.delete({
    where: { id },
  });

  res.json({
    message: 'User deleted successfully',
  });
}));

export default router;
