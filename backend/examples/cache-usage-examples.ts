/**
 * TalentSol ATS - Cache Control Usage Examples
 * Demonstrates RAM vs Disk cache optimization strategies
 */

import express from 'express';
import { 
  ramCache, 
  mixedCache, 
  diskCache, 
  staticAssets, 
  noCache 
} from '../src/middleware/cacheControl.js';

const app = express();

// ===== RAM CACHE EXAMPLES =====
// Best for: Frequently accessed, short-lived data

// User session data - changes often, needs fast access
app.get('/api/user/profile', ramCache(300), (req, res) => {
  // 5 minutes in RAM - fast access for active users
  res.json({ user: 'profile data' });
});

// Real-time notifications - very short-lived
app.get('/api/notifications', ramCache(60), (req, res) => {
  // 1 minute in RAM - immediate updates needed
  res.json({ notifications: [] });
});

// Search results - temporary, user-specific
app.get('/api/search', ramCache(180), (req, res) => {
  // 3 minutes in RAM - user might refine search quickly
  res.json({ results: [] });
});

// ===== MIXED CACHE EXAMPLES =====
// Best for: Medium-frequency data, adaptive storage

// Dashboard analytics - moderate update frequency
app.get('/api/dashboard', mixedCache(900), (req, res) => {
  // 15 minutes mixed - RAM initially, disk for persistence
  res.json({ analytics: 'dashboard data' });
});

// Application status - changes periodically
app.get('/api/applications/:id/status', mixedCache(600), (req, res) => {
  // 10 minutes mixed - balance between speed and persistence
  res.json({ status: 'in_review' });
});

// Interview schedules - moderate frequency access
app.get('/api/interviews/schedule', mixedCache(1800), (req, res) => {
  // 30 minutes mixed - accessed throughout the day
  res.json({ schedule: [] });
});

// ===== DISK CACHE EXAMPLES =====
// Best for: Long-lived, less frequently changing data

// Public job listings - stable, public content
app.get('/api/jobs/public', diskCache(3600), (req, res) => {
  // 1 hour on disk - public content, less frequent changes
  res.json({ jobs: [] });
});

// Company information - rarely changes
app.get('/api/company/info', diskCache(7200), (req, res) => {
  // 2 hours on disk - stable company data
  res.json({ company: 'info' });
});

// Static configuration - very stable
app.get('/api/config', diskCache(86400), (req, res) => {
  // 24 hours on disk - configuration rarely changes
  res.json({ config: {} });
});

// ===== STATIC ASSETS =====
// Best for: Immutable files with hash-based names

// Serve static assets with long-term disk caching
app.use('/assets', staticAssets(31536000), express.static('public/assets'));

// ===== NO CACHE EXAMPLES =====
// Best for: Sensitive operations, real-time data

// Authentication endpoints
app.post('/api/auth/login', noCache(), (req, res) => {
  // Never cache authentication requests
  res.json({ token: 'jwt-token' });
});

// Financial/sensitive data
app.get('/api/salary/confidential', noCache(), (req, res) => {
  // Never cache sensitive information
  res.json({ salary: 'confidential' });
});

// Real-time status updates
app.get('/api/live/status', noCache(), (req, res) => {
  // Always fetch fresh data for live updates
  res.json({ status: 'live' });
});

// ===== CONDITIONAL CACHING EXAMPLES =====
// Demonstrates how different routes get different cache strategies

const conditionalCacheExample = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const path = req.path;
  const method = req.method;

  if (method !== 'GET') {
    // No caching for mutations
    return noCache()(req, res, next);
  }

  // Route-based cache strategy selection
  if (path.includes('/user/') || path.includes('/profile')) {
    // User data: RAM cache (5 minutes)
    return ramCache(300)(req, res, next);
  }
  
  if (path.includes('/dashboard') || path.includes('/analytics')) {
    // Analytics: Mixed cache (15 minutes)
    return mixedCache(900)(req, res, next);
  }
  
  if (path.includes('/jobs') && !path.includes('/applications')) {
    // Public jobs: Disk cache (30 minutes)
    return diskCache(1800)(req, res, next);
  }
  
  // Default: Short RAM cache
  return ramCache(180)(req, res, next);
};

// Apply conditional caching to all routes
app.use('/api/*', conditionalCacheExample);

// ===== PERFORMANCE MONITORING =====
// Example middleware to monitor cache effectiveness

const cacheMonitoring = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const cacheStatus = res.get('X-Cache-Status') || 'MISS';
    const cacheHint = res.get('X-Cache-Hint') || 'unknown';
    
    console.log(`Cache Performance: ${req.method} ${req.path} - ${duration}ms - ${cacheStatus} - ${cacheHint}`);
  });
  
  next();
};

app.use(cacheMonitoring);

export default app;

/**
 * USAGE GUIDELINES:
 * 
 * 1. RAM Cache (0-30 minutes):
 *    - User-specific data that changes frequently
 *    - Search results, notifications, real-time updates
 *    - Fast access needed, limited persistence required
 * 
 * 2. Mixed Cache (30 minutes - 6 hours):
 *    - Dashboard data, analytics, moderate-frequency content
 *    - Balance between speed and persistence
 *    - Browser decides RAM vs disk based on memory pressure
 * 
 * 3. Disk Cache (6+ hours):
 *    - Public content, configuration, stable data
 *    - Long-term persistence needed
 *    - Survives browser restarts
 * 
 * 4. Static Assets (1+ years):
 *    - Immutable files with hash-based names
 *    - CSS, JS, images with version control
 *    - Maximum disk storage efficiency
 * 
 * 5. No Cache:
 *    - Sensitive operations (auth, payments)
 *    - Real-time data that must be fresh
 *    - POST/PUT/DELETE operations
 */
