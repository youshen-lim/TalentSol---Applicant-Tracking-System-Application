import { Response, NextFunction } from 'express';
import { prisma } from '../index.js';
import { AuthenticatedRequest } from './auth.js';

const PLAN_LIMITS: Record<string, { maxJobs: number; maxUsers: number }> = {
  trial:      { maxJobs: 5,        maxUsers: 3        },
  starter:    { maxJobs: 10,       maxUsers: 5        },
  growth:     { maxJobs: 50,       maxUsers: 25       },
  enterprise: { maxJobs: Infinity, maxUsers: Infinity },
};

function getLimit(plan: string) {
  return PLAN_LIMITS[plan] ?? PLAN_LIMITS['trial'];
}

export const enforceJobLimit = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (!req.user) { res.status(401).json({ error: 'Authentication required' }); return; }

  try {
    const company = await prisma.company.findUnique({
      where: { id: req.user.companyId },
      select: { plan: true },
    });

    const limit = getLimit(company?.plan ?? 'trial');
    if (limit.maxJobs === Infinity) { next(); return; }

    const count = await prisma.job.count({
      where: { companyId: req.user.companyId, status: 'open' },
    });

    if (count >= limit.maxJobs) {
      res.status(402).json({
        error: 'JOB_LIMIT_REACHED',
        message: `Your plan allows ${limit.maxJobs} open jobs. Please upgrade to add more.`,
        currentCount: count,
        limit: limit.maxJobs,
      });
      return;
    }

    next();
  } catch (error) {
    console.error('Job limit check error:', error);
    res.status(500).json({ error: 'Plan enforcement check failed' });
  }
};

export const enforceUserLimit = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (!req.user) { res.status(401).json({ error: 'Authentication required' }); return; }

  try {
    const company = await prisma.company.findUnique({
      where: { id: req.user.companyId },
      select: { plan: true },
    });

    const limit = getLimit(company?.plan ?? 'trial');
    if (limit.maxUsers === Infinity) { next(); return; }

    const count = await prisma.user.count({
      where: { companyId: req.user.companyId },
    });

    if (count >= limit.maxUsers) {
      res.status(402).json({
        error: 'USER_LIMIT_REACHED',
        message: `Your plan allows ${limit.maxUsers} team members. Please upgrade to invite more.`,
        currentCount: count,
        limit: limit.maxUsers,
      });
      return;
    }

    next();
  } catch (error) {
    console.error('User limit check error:', error);
    res.status(500).json({ error: 'Plan enforcement check failed' });
  }
};
