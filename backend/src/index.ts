import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import responseTime from 'response-time';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

// Import cache system
import { initializeCache, cleanupCache, getCacheHealth } from './cache/index.js';

// Import routes
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import jobRoutes from './routes/jobs.js';
import candidateRoutes from './routes/candidates.js';
import applicationRoutes from './routes/applications.js';
import interviewRoutes from './routes/interviews.js';
import interviewTemplateRoutes from './routes/interviewTemplates.js';
import documentRoutes from './routes/documents.js';
import analyticsRoutes from './routes/analytics.js';
import mlRoutes from './routes/ml.js';
import xgboostRoutes from './routes/xgboostRoutes';
import mobileRoutes from './routes/mobile.js';
import notificationRoutes from './routes/notifications.js';
import reportsRoutes from './routes/reports.js';
import formRoutes from './routes/forms.js';
import { webSocketServer } from './websocket/server.js';
import { schedulerService } from './services/schedulerService.js';
import { xgboostIntegrationService } from './services/xgboostIntegrationService';

// Import middleware
import { errorHandler } from './middleware/errorHandler.js';
import { notFound } from './middleware/notFound.js';
import { authenticateToken } from './middleware/auth.js';
import { conditional as cacheControl } from './middleware/cacheControl.js';

// Load environment variables
dotenv.config();

// Initialize Prisma client
export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
});

// Create Express app
const app = express();
const PORT = process.env.PORT || 3001;

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Middleware
app.use(helmet());
app.use(compression());
app.use(responseTime());
app.use(limiter);
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(cors({
  origin: [
    'http://localhost:8080',
    'http://localhost:8081',
    'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost:4173'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Apply cache control middleware
app.use(cacheControl());

// Health check endpoint
app.get('/health', async (req, res) => {
  const cacheHealth = await getCacheHealth();

  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    cache: cacheHealth,
  });
});

// Cache health endpoint
app.get('/health/cache', async (req, res) => {
  const cacheHealth = await getCacheHealth();
  res.status(200).json(cacheHealth);
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', authenticateToken, userRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/candidates', candidateRoutes); // Temporarily removed auth for testing
app.use('/api/applications', applicationRoutes);
app.use('/api/interviews', authenticateToken, interviewRoutes);
app.use('/api/interview-templates', authenticateToken, interviewTemplateRoutes);
app.use('/api/documents', authenticateToken, documentRoutes);
app.use('/api/analytics', analyticsRoutes); // Temporarily removed auth for testing
app.use('/api/ml', authenticateToken, mlRoutes);
app.use('/api/xgboost', authenticateToken, xgboostRoutes);
app.use('/api/mobile', mobileRoutes);
app.use('/api/notifications', authenticateToken, notificationRoutes);
app.use('/api/reports', authenticateToken, reportsRoutes);
app.use('/api/forms', formRoutes);

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Initialize cache system
async function startServer() {
  try {
    // Initialize cache system
    await initializeCache();

    // Start WebSocket server
    webSocketServer.start(9001);

    // Start scheduler service
    schedulerService.start();

    // Initialize XGBoost integration service
    await xgboostIntegrationService.initialize();

    // Start main server
    app.listen(PORT, () => {
      console.log(`🚀 TalentSol ATS Backend running on port ${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV}`);
      console.log(`🔗 CORS enabled for: ${process.env.CORS_ORIGIN}`);
      console.log(`💾 Cache system initialized`);
      console.log(`🔌 WebSocket server running on port 9001`);
      console.log(`📅 Scheduler service started`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Received SIGINT, shutting down gracefully...');
  schedulerService.stop();
  await cleanupCache();
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Received SIGTERM, shutting down gracefully...');
  schedulerService.stop();
  await cleanupCache();
  await prisma.$disconnect();
  process.exit(0);
});

// Start the server
startServer();

export default app;
