import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../index.js';
import { loginSchema, registerSchema } from '../types/validation.js';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';
import { rateLimitMiddleware } from '../middleware/rateLimiting.js';
import { mobileApiService } from '../services/MobileApiService.js';
import { mobileApiMiddleware } from '../middleware/mobileApi.js';

const router = express.Router();

// JWT Secret from environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-here';

// Validate JWT_SECRET is available
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}

// Register new user and company with rate limiting
router.post('/register',
  rateLimitMiddleware.auth,
  asyncHandler(async (req, res) => {
  const validatedData = registerSchema.parse(req.body);
  
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

  // Create company and user in a transaction
  const result = await prisma.$transaction(async (tx) => {
    // Create company
    const company = await tx.company.create({
      data: {
        name: validatedData.companyName,
      },
    });

    // Create user
    const user = await tx.user.create({
      data: {
        email: validatedData.email,
        passwordHash,
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        role: validatedData.role,
        companyId: company.id,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        companyId: true,
        company: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return { user, company };
  });

  // Generate JWT token
  if (!JWT_SECRET) {
    throw new AppError('JWT configuration error', 500);
  }

  const token = jwt.sign(
    {
      userId: result.user.id,
      email: result.user.email,
      role: result.user.role,
      companyId: result.user.companyId || '',
    } as any,
    JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } as jwt.SignOptions
  );

  res.status(201).json({
    message: 'User registered successfully',
    user: result.user,
    token,
  });
}));

// Login user with rate limiting
router.post('/login',
  rateLimitMiddleware.auth,
  asyncHandler(async (req, res) => {
  const validatedData = loginSchema.parse(req.body);

  // Find user with company info
  const user = await prisma.user.findUnique({
    where: { email: validatedData.email },
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
    throw new AppError('Invalid email or password', 401);
  }

  // Verify password
  const isPasswordValid = await bcrypt.compare(validatedData.password, user.passwordHash);
  if (!isPasswordValid) {
    throw new AppError('Invalid email or password', 401);
  }

  // Generate JWT token
  if (!JWT_SECRET) {
    throw new AppError('JWT configuration error', 500);
  }

  const token = jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role,
      companyId: user.companyId || '',
    } as any,
    JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } as jwt.SignOptions
  );

  // Remove password hash from response
  const { passwordHash, ...userWithoutPassword } = user;

  res.json({
    message: 'Login successful',
    user: userWithoutPassword,
    token,
  });
}));

// Verify token (for frontend to check if token is still valid)
router.get('/verify', asyncHandler(async (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    throw new AppError('No token provided', 401);
  }

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new AppError('JWT configuration error', 500);
  }

  try {
    const decoded = jwt.verify(token, jwtSecret) as {
      userId: string;
      email: string;
      role: string;
      companyId: string;
    };

    // Verify user still exists
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
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
      throw new AppError('User not found', 401);
    }

    const { passwordHash, ...userWithoutPassword } = user;

    res.json({
      valid: true,
      user: userWithoutPassword,
    });
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      throw new AppError('Invalid token', 401);
    }
    throw error;
  }
}));

// POST /api/auth/mobile-login - Mobile-optimized login with device fingerprinting
router.post('/mobile-login',
  rateLimitMiddleware.auth,
  mobileApiMiddleware({
    enableOptimization: true,
    forceOptimization: true,
    offlineSupport: true
  }),
  asyncHandler(async (req, res) => {
    try {
      const { email, password, deviceInfo } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          error: 'Email and password are required',
          timestamp: new Date().toISOString()
        });
      }

      // Detect mobile device information
      const detectedDevice = mobileApiService.detectMobileDevice(req);

      // Find user
      const user = await prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          companyId: true,
          passwordHash: true,
          company: {
            select: {
              id: true,
              name: true,
              domain: true,
              createdAt: true,
              updatedAt: true
            }
          }
        }
      });

      if (!user || !user.passwordHash) {
        return res.status(401).json({
          success: false,
          error: 'Invalid credentials',
          timestamp: new Date().toISOString()
        });
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.passwordHash);
      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          error: 'Invalid credentials',
          timestamp: new Date().toISOString()
        });
      }

      // Generate mobile-optimized JWT token
      const tokenPayload = {
        id: user.id,
        email: user.email,
        companyId: user.companyId,
        role: user.role,
        deviceType: detectedDevice.deviceType,
        platform: detectedDevice.platform
      };

      if (!JWT_SECRET) {
        throw new AppError('JWT configuration error', 500);
      }
      const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '7d' }); // Longer expiry for mobile

      // Mobile-optimized user data
      const mobileUserData = {
        id: user.id,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        role: user.role,
        company: user.company?.name || 'Unknown',
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(user.firstName + ' ' + user.lastName)}&background=4F86F7&color=fff&size=64`,
        preferences: {
          theme: 'light',
          notifications: true,
          offlineMode: true
        }
      };

      // Mobile-specific response (automatically optimized by middleware)
      res.json({
        success: true,
        data: {
          token,
          user: mobileUserData,
          device: {
            type: detectedDevice.deviceType,
            platform: detectedDevice.platform,
            optimized: true
          },
          session: {
            expiresIn: '7 days',
            refreshable: true,
            offlineCapable: true
          }
        },
        message: 'Mobile login successful',
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('❌ Mobile login error:', error);
      res.status(500).json({
        success: false,
        error: 'Mobile login failed',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    }
  })
);

// POST /api/auth/mobile-refresh - Mobile token refresh
router.post('/mobile-refresh',
  mobileApiMiddleware({ enableOptimization: true }),
  asyncHandler(async (req, res) => {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({
          success: false,
          error: 'Refresh token is required',
          timestamp: new Date().toISOString()
        });
      }

      // Verify refresh token (simplified implementation)
      if (!JWT_SECRET) {
        throw new AppError('JWT configuration error', 500);
      }
      const decoded = jwt.verify(refreshToken, JWT_SECRET) as any;

      // Generate new token
      const newToken = jwt.sign({
        id: decoded.id,
        email: decoded.email,
        companyId: decoded.companyId,
        role: decoded.role,
        deviceType: decoded.deviceType,
        platform: decoded.platform
      }, JWT_SECRET, { expiresIn: '7d' });

      res.json({
        success: true,
        data: {
          token: newToken,
          expiresIn: '7 days'
        },
        message: 'Token refreshed successfully',
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('❌ Mobile token refresh error:', error);
      res.status(401).json({
        success: false,
        error: 'Invalid refresh token',
        timestamp: new Date().toISOString()
      });
    }
  })
);

export default router;
