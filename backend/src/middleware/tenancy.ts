import { Response, NextFunction } from 'express';
import { prisma } from '../index.js';
import { AuthenticatedRequest } from './auth.js';

/**
 * Middleware factory that verifies a resource belongs to the authenticated user's company.
 * Returns 404 (not 403) to prevent resource enumeration.
 *
 * Usage:
 *   router.get('/:id', requireOwnership('job'), handler)
 *   // req.ownedRecord is set to the found record
 */
export const requireOwnership = (model: string) => async (
  req: AuthenticatedRequest & { ownedRecord?: any },
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  try {
    const record = await (prisma as any)[model].findFirst({
      where: {
        id: req.params.id,
        companyId: req.user.companyId,
      },
    });

    if (!record) {
      res.status(404).json({ error: 'Not found' });
      return;
    }

    req.ownedRecord = record;
    next();
  } catch (error) {
    console.error('Tenancy check error:', error);
    res.status(500).json({ error: 'Authorization check failed' });
  }
};
