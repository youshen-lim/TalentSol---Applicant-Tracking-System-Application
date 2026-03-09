import { Response, NextFunction } from 'express';
import { prisma } from '../index.js';
import { AuthenticatedRequest } from './auth.js';

/**
 * Middleware that blocks requests from orgs with expired trials.
 * Apply after authenticateToken to protect paid-only routes.
 */
export const requireActiveSubscription = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  try {
    const company = await prisma.company.findUnique({
      where: { id: req.user.companyId },
      select: { plan: true, planStatus: true, trialEndsAt: true },
    });

    if (!company) {
      res.status(404).json({ error: 'Company not found' });
      return;
    }

    // Allow paid plans regardless of trialEndsAt
    if (company.plan !== 'trial') {
      next();
      return;
    }

    // Block expired trials
    if (company.trialEndsAt && company.trialEndsAt < new Date()) {
      res.status(402).json({
        error: 'TRIAL_EXPIRED',
        message: 'Your trial has expired. Please upgrade to continue.',
        trialEndsAt: company.trialEndsAt.toISOString(),
      });
      return;
    }

    next();
  } catch (error) {
    console.error('Subscription check error:', error);
    res.status(500).json({ error: 'Subscription check failed' });
  }
};
