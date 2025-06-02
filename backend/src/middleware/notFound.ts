import { Request, Response } from 'express';

export const notFound = (req: Request, res: Response): void => {
  res.status(404).json({
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.path}`,
    timestamp: new Date().toISOString(),
    availableRoutes: [
      'GET /health',
      'POST /api/auth/login',
      'POST /api/auth/register',
      'GET /api/jobs',
      'POST /api/applications',
      // Add more routes as they are implemented
    ],
  });
};
