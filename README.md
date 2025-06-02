# TalentSol - The Modern Applicant Tracking System

TalentSol is an AI-powered applicant tracking system with machine learning features designed to streamline the recruitment process.

## About This Project

This is a hobbyist AI/machine learning related project using Augment Code as development partner, and is available on GitHub. TalentSol aims to revolutionize how companies manage their recruitment pipeline through intelligent candidate matching and workflow optimization.

The entire frontend development of this application was completed in just 1.5 days, showcasing the extreme efficiency of Augment Code Agent and Augment Code's Context Engine as development partner.

## Developer

**Aaron (Youshen) Lim**
- LinkedIn: [https://www.linkedin.com/in/youshen/](https://www.linkedin.com/in/youshen/)
- GitHub: [https://github.com/youshen-lim](https://github.com/youshen-lim)

## Technologies Used

### Frontend
- React 18
- TypeScript
- Vite
- Tailwind CSS
- Shadcn UI
- React Router
- Zustand (state management)
- React Query (data fetching)

### Backend
- Node.js + Express
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT Authentication
- Zod Validation
- Multer (file uploads)
- **Advanced Caching System**:
  - Redis with cluster support
  - In-memory fallback (NodeCache)
  - Multi-layer caching strategies
  - Automatic cache invalidation
  - Performance monitoring

## Getting Started

### Prerequisites
- Node.js 18 or higher
- PostgreSQL database
- npm or yarn

### Frontend Only (Mock Data)

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/talentsol-ats.git
   cd talentsol-ats
   ```

2. Install dependencies
   ```bash
   npm install
   # or with legacy peer deps if needed
   npm install --legacy-peer-deps
   ```

3. Start the development server
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:8080`

### Full Stack Setup (Frontend + Backend)

1. **Set up the backend**:
   ```bash
   # Install backend dependencies
   npm run backend:setup

   # Set up environment variables
   cp backend/.env.example backend/.env
   # Edit backend/.env with your PostgreSQL connection string

   # Run database migrations and seed data
   cd backend
   npx prisma db push
   npm run db:seed
   cd ..
   ```

2. **Start both frontend and backend**:
   ```bash
   npm run dev:full
   ```

3. **Access the application**:
   - Frontend: `http://localhost:8080`
   - Backend API: `http://localhost:3001`
   - API Health Check: `http://localhost:3001/health`

### Demo Credentials (After Seeding)
- Admin: `admin@talentsol-demo.com` / `password123`
- Recruiter: `recruiter@talentsol-demo.com` / `password123`

### Quick Backend Setup
For a streamlined setup experience, use the setup scripts:

**Linux/Mac:**
```bash
cd backend
chmod +x setup.sh
./setup.sh
```

**Windows:**
```cmd
cd backend
setup.bat
```

These scripts will:
- Install dependencies
- Create .env file from template
- Generate Prisma client
- Push database schema
- Seed with comprehensive demo data

### Database Features
The backend includes comprehensive seed data that mirrors and enhances the frontend mock data:

- **6 realistic job postings** across different departments
- **11 diverse candidates** with professional backgrounds
- **Multiple applications** in various pipeline stages
- **Scheduled interviews** for candidates in progress
- **Email templates** for all communication types
- **Analytics data** for dashboard metrics
- **Multi-tenant architecture** ready for scaling

## 🎯 **Latest Enhancements - Comprehensive ATS Features**

### **🚀 Enhanced Application Management System**

#### **1. Application Management Dashboard** (`/applications/management`)
- **Real-time Statistics Dashboard**:
  - Total applications with trend indicators
  - New applications counter (weekly)
  - Conversion rate tracking with percentage changes
  - AI-powered average scoring metrics
- **Interactive Quick Actions Panel**:
  - Build Application Form button
  - Review Applications workflow
  - View Analytics dashboard access
- **Live Recent Applications Feed**:
  - Real-time candidate submissions
  - Job position tracking
  - Application status badges with color coding
  - AI scoring display with confidence levels
- **Application Sources Visualization**:
  - Interactive progress bars for source breakdown
  - Company Website, LinkedIn, Indeed, Referrals tracking
  - Percentage-based visual indicators
  - **Enhanced Error Handling**: Fixed null reference errors with proper loading states
  - **Skeleton Loading**: Smooth loading animations while data loads
- **Advanced Search & Filtering**:
  - Real-time search across candidate names and positions
  - Filter by application status, date range, and scores

#### **2. Application Form Preview System** (`/applications/preview`)
- **Multi-Step Progressive Form Interface**:
  - Step-by-step completion with progress indicators
  - 4-step workflow: Basic Info → Documents → Professional → Authorization
  - Real-time completion percentage tracking
- **Dynamic Field Rendering Engine**:
  - Support for text, email, phone, file upload, radio, checkbox fields
  - Real-time validation with error messaging
  - Conditional field display based on previous answers
- **Professional File Upload System**:
  - Drag-and-drop resume and cover letter upload
  - File type validation (PDF, DOC, DOCX)
  - File size limits with progress indicators
  - Preview mode with file management
- **Mobile-Responsive Design**:
  - Optimized for all device sizes
  - Touch-friendly interactions
  - Consistent styling across platforms

#### **3. Real-Time Notifications System**
- **Comprehensive Notification Types**:
  - New application submissions
  - Application status changes
  - Interview reminders and scheduling
  - System alerts and updates
- **Interactive Notification Center**:
  - Bell icon with live unread count badge
  - Dropdown with notification history
  - Individual and bulk mark-as-read functionality
  - Notification deletion and management
- **Auto-Refresh Capabilities**:
  - Real-time polling for new notifications
  - Background sync when tab becomes active
  - WebSocket-ready architecture for instant updates

#### **4. Enhanced Profile Management** (`/profile/management`)
- **Comprehensive Profile Editor**:
  - Personal information management (name, email, phone, bio)
  - Avatar upload and management system
  - Contact details with validation
- **Security Management Panel**:
  - Password change with current password verification
  - Password strength validation
  - Show/hide password toggle for better UX
- **Activity Tracking Dashboard**:
  - Applications reviewed counter
  - Interviews scheduled tracking
  - Average time-to-hire metrics
  - Recent activity timeline with timestamps
- **Account Preferences**:
  - Theme selection (light/dark mode ready)
  - Language and timezone settings
  - Profile visibility controls

#### **5. Advanced User Settings System** (`/settings`)
- **Granular Notification Preferences**:
  - Email, browser, and mobile push notification controls
  - Specific notification types (applications, interviews, system updates)
  - Weekly reports and digest settings
- **Appearance Customization**:
  - Light/dark theme selection
  - Compact mode for dense information display
  - Sidebar collapse preferences
- **Privacy & Security Controls**:
  - Profile visibility settings (public, team, private)
  - Activity tracking opt-in/out
  - Data sharing preferences
  - Analytics participation controls
- **Company-Wide Settings**:
  - Public job listing controls
  - Employee referral system toggles
  - Automated screening preferences

### **🔧 Backend API Enhancements**

#### **New API Endpoints**
- `GET /api/applications/stats` - Real-time dashboard statistics
- `GET /api/notifications` - User notifications with pagination
- `POST /api/notifications/mark-read` - Bulk mark notifications as read
- `GET /api/users/settings` - User preference management
- `PUT /api/users/settings` - Update user preferences
- `GET /api/users/profile` - Enhanced profile data
- `PUT /api/users/profile` - Profile updates with validation

#### **Database Schema Additions**
- **Notifications Table**: Real-time notification storage and management
- **UserSettings Table**: Comprehensive user preference storage
- **Enhanced User Model**: Avatar, phone, bio fields added
- **Improved Relations**: Proper foreign key relationships for data integrity

### **📱 Frontend Architecture Improvements**

#### **New React Hooks**
- `useNotifications()` - Real-time notification management
- `useRealTimeNotifications()` - WebSocket-ready notification system
- Auto-refresh capabilities with visibility change detection

#### **Enhanced API Service Layer**
- Centralized API client with authentication handling
- Type-safe request/response interfaces
- Error handling with user-friendly messages
- Automatic token management and refresh

#### **Component Enhancements**
- **NavBar**: Enhanced with real-time notifications and settings dropdown
- **Sidebar**: Consistent settings integration with responsive design
- **Cards**: Improved styling with hover effects and animations
- **Forms**: Advanced validation with real-time feedback

#### **Recent Bug Fixes & Improvements**
- **Applications Page**: Fixed `topSources` null reference error that caused page crashes
- **Loading States**: Added skeleton loading animations for better user experience
- **Error Handling**: Implemented graceful fallbacks when data is unavailable
- **Variable References**: Corrected `mockJob` to `currentJob` reference in application forms
- **Null Safety**: Added comprehensive null checks throughout application components

## Key Features & Enhancements

### 📊 **Smart Application Cap Management**

The Jobs page features an intelligent application cap system that provides transparency and urgency indicators:

#### **Visual Progress Indicators**
- **Color-coded progress bars** showing application fill status
- **Dynamic colors** based on urgency:
  - 🔵 Blue (0-70%): Normal capacity
  - 🟡 Yellow (70-90%): Getting full
  - 🔴 Red (90%+): Nearly full

#### **Smart Status Messages**
- **"X spots remaining"** - Shows exact availability
- **"Filling fast"** warning when 80%+ full
- **"Applications full"** alert when at capacity

#### **Benefits**
- **For Recruiters**: Quick visual assessment and capacity planning
- **For Candidates**: Transparency about competition and urgency motivation
- **For System**: Automatic updates and consistent UX patterns

### 🤖 **AI/ML Integration Ready**

Built-in support for machine learning powered candidate prioritization:

#### **Database Schema**
- **ML Models Management** - Store and version trained models
- **Prediction Tracking** - Log all ML predictions with explanations
- **Skills Extraction** - AI-powered skills identification
- **Training Datasets** - Registry for Kaggle and other datasets

#### **API Endpoints**
- `POST /api/ml/predict` - Candidate priority scoring
- `POST /api/ml/predict/job/:jobId` - Bulk predictions for job pipeline
- `GET /api/ml/models` - Model management
- `POST /api/ml/train` - Train new models

#### **Kaggle Dataset Integration**
Ready for integration with publicly sourced datasets:
- Resume classification datasets
- HR analytics data
- Skills and job matching datasets

### 🎨 **Modern UI/UX Design**

#### **Responsive Design**
- Mobile-first approach with consistent breakpoints
- Collapsible sidebar with tooltips
- Touch-friendly interactions

#### **Professional Styling**
- Consistent purple/blue color scheme
- Smooth animations and transitions
- Accessibility-focused design

#### **Smart Components**
- Dynamic job cards with pipeline visualization
- Interactive candidate pipeline with drag-and-drop
- Real-time dashboard metrics

## Project Structure

```
talentsol-ats/
├── backend/                 # Backend API
│   ├── config/              # Configuration files
│   │   └── redis-config.yml # Redis caching configuration
│   ├── models/              # Data model definitions
│   │   └── talentsol_schema.yml # Unified data model schema
│   ├── prisma/              # Database schema and migrations
│   │   └── schema.prisma    # Prisma schema
│   ├── src/
│   │   ├── cache/           # Advanced caching system
│   │   │   ├── RedisClient.ts    # Redis client with fallback
│   │   │   ├── QueryCache.ts     # Database query caching
│   │   │   ├── CacheManager.ts   # Centralized cache management
│   │   │   ├── decorators.ts     # Caching decorators
│   │   │   └── index.ts          # Cache module exports
│   │   ├── middleware/      # Express middleware
│   │   ├── routes/          # API route handlers
│   │   ├── services/        # Business logic services
│   │   │   └── CachedAnalyticsService.ts # Cached analytics
│   │   ├── types/           # TypeScript types and validation
│   │   ├── index.ts         # Express server entry point
│   │   └── seed.ts          # Database seeding script
│   ├── uploads/             # File upload directory
│   ├── .env.example         # Environment variables template
│   ├── package.json         # Backend dependencies
│   └── tsconfig.json        # Backend TypeScript config
├── public/                  # Static assets
├── src/                     # Frontend React app
│   ├── assets/              # Images, fonts, etc.
│   ├── components/          # Reusable UI components
│   │   ├── ui/              # Base UI components
│   │   ├── layout/          # Layout components
│   │   ├── forms/           # Form components
│   │   ├── ml/              # ML-related components
│   │   └── dashboard/       # Dashboard-specific components
│   ├── contexts/            # React contexts
│   ├── hooks/               # Custom React hooks
│   ├── lib/                 # Utility functions
│   │   ├── api.ts           # API client
│   │   ├── utils.ts         # General utilities
│   │   └── validation.ts    # Form validation
│   ├── pages/               # Page components
│   ├── services/            # API services
│   ├── store/               # Zustand store
│   │   ├── index.ts         # Store exports
│   │   ├── auth-store.ts    # Authentication state
│   │   └── jobs-store.ts    # Jobs state
│   ├── types/               # TypeScript type definitions
│   ├── App.tsx              # Main App component
│   ├── index.css            # Global styles
│   └── main.tsx             # Entry point
├── .eslintrc.js             # ESLint configuration
├── .gitignore               # Git ignore file
├── components.json          # Shadcn UI components config
├── package.json             # Project dependencies
├── tailwind.config.ts       # Tailwind CSS configuration
├── tsconfig.json            # TypeScript configuration
└── vite.config.ts           # Vite configuration
```

## Development Guidelines

1. **TypeScript**: Use proper types for all components and functions
2. **Component Structure**: Keep components small and focused
3. **State Management**: Use Zustand for global state, React hooks for local state
4. **API Calls**: Centralize in the api.ts file or service modules
5. **Error Handling**: Use consistent error handling patterns
6. **Testing**: Write tests for critical functionality

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build locally

## Backend API Documentation

### 🚀 **Backend Features**

A robust Node.js/Express backend API built with TypeScript, Prisma, and PostgreSQL:

- **Authentication & Authorization**: JWT-based auth with role-based access control
- **Database**: PostgreSQL with Prisma ORM
- **File Uploads**: Multer for document handling
- **Validation**: Zod schemas for request validation
- **Security**: Helmet, CORS, rate limiting
- **Error Handling**: Comprehensive error handling with custom error classes

### 🔧 **Backend Setup**

1. **Install dependencies**:
   ```bash
   cd backend && npm install
   ```

2. **Set up environment variables**:
   ```bash
   cp .env.example .env
   ```

   Edit `.env` with your configuration:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/talentsol_ats"
   JWT_SECRET="your-super-secret-jwt-key"
   PORT=3001
   NODE_ENV=development
   ```

3. **Set up the database**:
   ```bash
   # Generate Prisma client
   npx prisma generate

   # Push schema to database
   npx prisma db push

   # Seed the database with sample data
   npm run db:seed
   ```

4. **Start the backend server**:
   ```bash
   npm run dev
   ```

### 📡 **API Endpoints**

#### **Authentication**
- `POST /api/auth/register` - Register new user and company
- `POST /api/auth/login` - Login user
- `GET /api/auth/verify` - Verify JWT token

#### **Jobs Management**
- `GET /api/jobs` - Get public job listings
- `GET /api/jobs/:id` - Get single job
- `GET /api/jobs/company/all` - Get all company jobs (auth required)
- `POST /api/jobs` - Create job (auth required)
- `PUT /api/jobs/:id` - Update job (auth required)
- `DELETE /api/jobs/:id` - Delete job (auth required)

#### **Applications & Candidates**
- `POST /api/applications` - Submit application (public)
- `GET /api/applications` - Get company applications (auth required)
- `GET /api/candidates` - Get company candidates (auth required)
- `GET /api/candidates/pipeline/summary` - Get pipeline summary (auth required)

#### **ML Integration**
- `POST /api/ml/predict` - Candidate priority scoring
- `POST /api/ml/predict/job/:jobId` - Bulk predictions for job pipeline
- `GET /api/ml/models` - Model management
- `POST /api/ml/train` - Train new models

#### **Analytics**
- `GET /api/analytics/dashboard` - Get dashboard analytics (cached)
- `GET /api/analytics/funnel` - Get hiring funnel data
- `GET /api/analytics/time-to-hire` - Get time-to-hire analytics

#### **Cache Management**
- `POST /api/analytics/cache/warm` - Warm cache for company
- `POST /api/analytics/cache/refresh` - Refresh dashboard cache
- `GET /api/analytics/cache/stats` - Get cache statistics
- `GET /health/cache` - Cache system health check

### 🗄️ **Database Schema**

The database includes comprehensive entities for a production ATS:

- **Companies**: Multi-tenant support
- **Users**: Authentication and role management
- **Jobs**: Job postings with application caps and pipeline tracking
- **Candidates**: Candidate information and profiles
- **Applications**: Job applications with rich metadata and ML scoring
- **Interviews**: Interview scheduling and management
- **Documents**: File uploads and management
- **ML Models**: Machine learning model storage and versioning
- **ML Predictions**: Prediction results and explanations
- **Skill Extractions**: AI-powered skills identification

## ML Integration Guide

### 🎯 **Kaggle Dataset Integration**

Complete guide for integrating publicly sourced Kaggle datasets for ML-powered candidate prioritization:

#### **Recommended Datasets**

1. **Primary Dataset: "Resume Dataset" by SPIDY20**
   - **URL**: `https://www.kaggle.com/datasets/spidy20/resume-dataset`
   - **Size**: 2,400+ labeled resumes
   - **Categories**: 25 job categories
   - **License**: Public Domain

2. **Secondary Dataset: "HR Analytics Dataset"**
   - **URL**: `https://www.kaggle.com/datasets/giripujar/hr-analytics`
   - **Features**: Employee performance, satisfaction, promotion data

3. **Skills Dataset: "LinkedIn Job Skills"**
   - **URL**: `https://www.kaggle.com/datasets/asaniczka/linkedin-job-skills-dataset`
   - **Features**: Job titles, required skills, experience levels

#### **Implementation Steps**

1. **Download Kaggle Dataset**:
   ```bash
   pip install kaggle
   kaggle datasets download -d spidy20/resume-dataset
   unzip resume-dataset.zip -d ./backend/ml_models/data/
   ```

2. **Register Dataset in TalentSol**:
   ```bash
   curl -X POST http://localhost:3001/api/ml/datasets \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     -d '{
       "name": "Kaggle Resume Dataset",
       "description": "2400+ labeled resumes for candidate classification",
       "source": "kaggle",
       "datasetPath": "./ml_models/data/resume_dataset.csv",
       "features": ["resume_text", "category", "extracted_skills"],
       "targetVariable": "category",
       "recordCount": 2400
     }'
   ```

3. **Train ML Model**:
   ```python
   # Create training script: backend/ml_models/train_model.py
   import pandas as pd
   from sklearn.ensemble import RandomForestClassifier
   from sklearn.feature_extraction.text import TfidfVectorizer

   def train_candidate_scoring_model():
       df = pd.read_csv('./data/resume_dataset.csv')
       vectorizer = TfidfVectorizer(max_features=1000, stop_words='english')
       X = vectorizer.fit_transform(df['resume_text'])
       # ... training logic
   ```

4. **Activate Model**:
   ```bash
   curl -X PATCH http://localhost:3001/api/ml/models/MODEL_ID/status \
     -H "Content-Type: application/json" \
     -d '{"isActive": true}'
   ```

#### **Feature Engineering Pipeline**

The ML service maps TalentSol application data to ML features:

```typescript
// Feature extraction from application data
const features = {
  yearsOfExperience: parseExperience(application.professionalInfo),
  technicalSkills: extractSkills(application.documents),
  skillsMatchScore: calculateSkillsMatch(candidateSkills, jobSkills),
  resumeQualityScore: assessResumeQuality(application.documents),
  applicationCompleteness: calculateCompleteness(application),
  locationMatch: calculateLocationMatch(candidate, job),
  salaryExpectationMatch: calculateSalaryMatch(candidate, job)
};
```

#### **Frontend Integration**

Enhanced candidate cards with ML scores:

```typescript
interface CandidateWithML extends Candidate {
  mlScore?: {
    priorityScore: number;
    confidence: number;
    reasoning: string[];
    skillsExtracted: Array<{
      skill: string;
      confidence: number;
      category: string;
    }>;
  };
}

const MLScoreBadge = ({ score, confidence }) => (
  <div className="flex items-center gap-2">
    <div className={`px-2 py-1 rounded text-xs font-medium ${
      score >= 80 ? 'bg-green-100 text-green-800' :
      score >= 60 ? 'bg-yellow-100 text-yellow-800' :
      'bg-gray-100 text-gray-800'
    }`}>
      ML Score: {score}
    </div>
    <div className="text-xs text-gray-500">
      {Math.round(confidence * 100)}% confidence
    </div>
  </div>
);
```

## Data Mapping & Architecture

### 🔄 **Frontend Mock Data → Database Mapping**

#### **Dashboard Metrics**
- **Frontend**: Static metrics in Dashboard.tsx
- **Database**: Real-time calculations from actual application data
- **API**: `/api/analytics/dashboard` with time-based filtering

#### **Candidate Pipeline**
- **Frontend**: Mock candidate objects with basic info
- **Database**: Comprehensive candidates and applications tables
- **Features**: Rich metadata, activity tracking, ML scoring

#### **Jobs Management**
- **Frontend**: Simple job objects with pipeline counts
- **Database**: Full job lifecycle with application caps, pipeline tracking
- **Features**: Multi-tenant, structured salary/location data, skills tracking

### 🏗️ **Enhanced Database Features**

1. **Multi-Tenant Architecture**: All data scoped to company_id
2. **User Management**: Role-based access control (admin, recruiter, hiring_manager)
3. **Interview Management**: Comprehensive scheduling and feedback system
4. **Document Management**: File uploads with metadata and version control
5. **Email Templates**: Customizable templates with variable substitution
6. **ML Integration**: Model storage, prediction tracking, skills extraction

## UI/UX Enhancements

### 🎨 **Sidebar Settings Enhancement**

Fixed inconsistency between sidebar and header settings buttons:

#### **Before (Issues)**
- Sidebar settings: Simple link pointing to `/dashboard` (temporary)
- Header settings: Full dropdown menu with multiple options
- Inconsistent UX across the application

#### **After (Fixed)**
- **Consistent Functionality**: Both sidebar and header settings have identical dropdown menus
- **Direct Navigation**: Quick access to specific settings tabs
- **Responsive Design**: Adapts to sidebar collapsed/expanded state
- **Proper Tooltips**: Shows "Settings" tooltip when sidebar is collapsed

#### **Implementation**
```typescript
<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="ghost" className="w-full">
      <Settings className="h-5 w-5" />
      {!collapsed && <span>Settings</span>}
    </Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent align={collapsed ? "start" : "end"}>
    <DropdownMenuItem onClick={() => navigate('/settings?tab=account')}>
      Account Settings
    </DropdownMenuItem>
    <DropdownMenuItem onClick={() => navigate('/settings?tab=company')}>
      Company Profile
    </DropdownMenuItem>
    {/* ... more options */}
  </DropdownMenuContent>
</DropdownMenu>
```

## Screenshots

The `screenshots/` folder contains comprehensive visual documentation:

1. **landing-page.png** - Main landing page with navigation
2. **login-page.png** - Authentication interface
3. **dashboard.png** - Main dashboard with metrics and pipeline
4. **candidate-pipeline.png** - Drag-and-drop candidate management
5. **job-postings.png** - Job listings with application caps
6. **interviews.png** - Interview scheduling calendar
7. **analytics-overview.png** - Analytics dashboard with core reports
8. **pipeline-metrics.png** - Detailed pipeline analytics
9. **time-to-hire.png** - Time to hire analytics (chart view)
10. **time-to-hire-table.png** - Time to hire analytics (table view)
11. **custom-reports.png** - Custom reporting interface
12. **ml-reports.png** - Machine learning analytics
13. **messages.png** - Communication inbox
14. **documents.png** - Document management with AI assistant

## License

This project is open source and available under the [MIT License](LICENSE).

## 🚀 **Advanced Caching Architecture (Part 1)**

### **Overview**

TalentSol ATS implements a sophisticated multi-layer caching architecture designed for high performance and scalability. The system provides intelligent caching strategies, automatic invalidation, and graceful fallback mechanisms.

### **Architecture Components**

#### **1. Multi-Layer Caching Strategy**

**Layer 1: Application-Level Caching (Redis)**
- **Primary cache**: Redis with cluster support
- **Fallback**: In-memory NodeCache
- **Features**: Distributed caching, persistence, high availability

**Layer 2: Database Query Caching**
- **Purpose**: Cache expensive database queries
- **TTL**: Configurable per query type
- **Invalidation**: Tag-based and pattern-based

**Layer 3: CDN & Static Asset Caching**
- **Purpose**: Cache static assets and API responses
- **Provider**: Configurable (Cloudflare, AWS CloudFront)
- **TTL**: Long-term for static assets, short-term for dynamic content

#### **2. Cache Strategies**

| Strategy | TTL | Pattern | Use Case |
|----------|-----|---------|----------|
| `application_cache` | 1 hour | `app:*` | General application data |
| `session_cache` | 24 hours | `session:*` | User sessions |
| `query_cache` | 30 minutes | `query:*` | Database queries |
| `ai_analysis_cache` | 2 hours | `ai:*` | ML/AI results |
| `dashboard_cache` | 15 minutes | `dashboard:*` | Analytics data |
| `job_listings_cache` | 30 minutes | `jobs:*` | Job search results |

### **Implementation**

#### **1. Redis Client Configuration**

```typescript
// Initialize Redis with fallback
import { redisClient } from './cache/RedisClient.js';

// Automatic fallback to in-memory cache if Redis unavailable
const data = await redisClient.get('key');
await redisClient.set('key', 'value', 3600);
```

#### **2. Query Cache Usage**

```typescript
import { queryCache } from './cache/QueryCache.js';

// Cache database query results
const result = await queryCache.get('user_profile', { userId: '123' });
if (!result) {
  const data = await database.query('SELECT * FROM users WHERE id = ?', [userId]);
  await queryCache.set('user_profile', { userId: '123' }, data, { ttl: 1800 });
  return data;
}
return result;
```

#### **3. Decorator-Based Caching**

```typescript
import { Cached, InvalidateCache } from './cache/decorators.js';

class UserService {
  @Cached({
    strategy: 'application_cache',
    ttl: 3600,
    tags: ['users'],
    keyGenerator: (userId: string) => `user_${userId}`,
  })
  async getUserProfile(userId: string) {
    return await database.users.findUnique({ where: { id: userId } });
  }

  @InvalidateCache({
    tags: ['users'],
    patterns: ['user_*'],
  })
  async updateUser(userId: string, data: any) {
    return await database.users.update({
      where: { id: userId },
      data,
    });
  }
}
```

#### **4. Cache Manager**

```typescript
import { cacheManager } from './cache/CacheManager.js';

// Invalidate related caches when application is updated
await cacheManager.invalidateApplicationCache(applicationId);

// Warm dashboard cache
await cacheManager.warmDashboardCache(companyId);

// Get cache health status
const health = await cacheManager.healthCheck();
```

### **Cache Invalidation Strategies**

#### **1. Time-Based Invalidation (TTL)**
- Automatic expiration based on configured TTL
- Different TTL values for different data types
- Configurable per environment

#### **2. Tag-Based Invalidation**
- Group related cache entries with tags
- Invalidate all entries with specific tags
- Example: Invalidate all user-related caches when user is updated

#### **3. Pattern-Based Invalidation**
- Use Redis pattern matching to invalidate multiple keys
- Useful for hierarchical cache structures
- Example: `user:*:profile` invalidates all user profiles

#### **4. Event-Driven Invalidation**
- Automatic invalidation on data changes
- Integrated with database operations
- Ensures cache consistency

### **Performance Optimizations**

#### **1. Connection Pooling**
- Redis connection pooling for high concurrency
- Configurable pool size and timeout settings
- Health checks and automatic reconnection

#### **2. Compression**
- Automatic compression for large cache values
- Configurable compression algorithms (LZ4, Gzip)
- Reduces memory usage and network transfer

#### **3. Batch Operations**
- Batch cache operations for better performance
- Reduces network round trips
- Atomic operations for consistency

#### **4. Memory Management**
- LRU eviction policy for memory optimization
- Configurable memory limits
- Memory usage monitoring and alerts

### **Monitoring and Metrics**

#### **1. Cache Statistics**
- Hit/miss ratios per cache strategy
- Memory usage and key counts
- Performance metrics and latency

#### **2. Health Checks**
- Redis connectivity status
- Fallback cache status
- Cache performance indicators

#### **3. Alerting**
- Low hit rate alerts
- High memory usage alerts
- Connection failure notifications

### **Configuration**

#### **Environment Variables**

```bash
# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
REDIS_CLUSTER_ENABLED=false

# Cache TTL Settings
CACHE_TTL_DEFAULT=1800
CACHE_TTL_QUERY=1800
CACHE_TTL_SESSION=86400
CACHE_TTL_AI_ANALYSIS=7200
```

#### **YAML Configuration**

See `backend/config/redis-config.yml` for detailed configuration options.

### **API Endpoints**

#### **Cache Management**

```bash
# Warm cache for company
POST /api/analytics/cache/warm

# Refresh dashboard cache
POST /api/analytics/cache/refresh

# Get cache statistics
GET /api/analytics/cache/stats

# Health check with cache status
GET /health
GET /health/cache
```

### **Best Practices**

#### **1. Cache Key Design**
- Use consistent naming conventions
- Include version information when needed
- Avoid overly long keys

#### **2. TTL Selection**
- Short TTL for frequently changing data
- Long TTL for static or rarely changing data
- Consider business requirements and data freshness needs

#### **3. Error Handling**
- Always implement fallback mechanisms
- Log cache errors for monitoring
- Graceful degradation when cache is unavailable

#### **4. Testing**
- Test cache behavior in different scenarios
- Verify cache invalidation works correctly
- Performance testing with cache enabled/disabled

### **Troubleshooting**

#### **Common Issues**

1. **Redis Connection Failures**
   - Check Redis server status
   - Verify network connectivity
   - Review connection configuration

2. **Low Cache Hit Rates**
   - Analyze cache key patterns
   - Review TTL settings
   - Check invalidation logic

3. **Memory Issues**
   - Monitor Redis memory usage
   - Adjust eviction policies
   - Optimize cache key sizes

#### **Debug Commands**

```bash
# Check Redis connectivity
redis-cli ping

# Monitor Redis commands
redis-cli monitor

# Check memory usage
redis-cli info memory

# List all keys (use carefully in production)
redis-cli keys "*"
```

### **Future Enhancements**

1. **Distributed Cache Warming**
   - Scheduled cache warming jobs
   - Predictive cache preloading

2. **Advanced Analytics**
   - Cache usage analytics
   - Performance optimization recommendations

3. **Multi-Region Support**
   - Cross-region cache replication
   - Geo-distributed caching

4. **Machine Learning Integration**
   - Intelligent cache eviction
   - Predictive cache warming based on usage patterns

## 🌐 **Multi-API Architecture (Part 2)**

### **Overview**

TalentSol ATS implements a comprehensive multi-API architecture designed for modern data stack compatibility. The system provides multiple API interfaces to support different use cases and integration patterns.

### **Architecture Components**

#### **1. API Gateway (Nginx)**
- **Load Balancing**: Distributes requests across multiple API instances
- **Rate Limiting**: Protects APIs from abuse and ensures fair usage
- **Caching**: Intelligent caching strategies per API type
- **Security**: SSL termination, security headers, CORS handling
- **Monitoring**: Request logging and metrics collection

#### **2. Multiple API Endpoints**

| API | Port | Purpose | Technology |
|-----|------|---------|------------|
| **REST API** | 3000 | Traditional REST endpoints | Node.js/Express |
| **GraphQL API** | 4000 | Flexible query interface | Apollo Server |
| **SQL API** | 5000 | PostgreSQL-compatible queries | FastAPI/Python |
| **AI/ML API** | 8000 | Machine learning operations | FastAPI/Python |
| **DAX API** | 6000 | Advanced analytics | Node.js/Express |
| **MDX API** | 7000 | Documentation system | Next.js |
| **WebSocket API** | 9000 | Real-time features | Socket.io |

#### **3. Data Stack Compatibility**

**PostgreSQL-Compatible SQL API**
```python
# Direct SQL queries with caching and security
POST /sql/query
{
  "query": "SELECT * FROM applications WHERE status = $1",
  "parameters": {"status": "pending"},
  "cache_ttl": 1800
}
```

**GraphQL API**
```graphql
# Flexible data fetching
query GetJobs($filters: JobFilters) {
  jobs(filters: $filters) {
    id
    title
    applications {
      candidate {
        name
        score
      }
    }
  }
}
```

**AI/ML API**
```python
# Candidate scoring and matching
POST /ai/score
{
  "candidate": {...},
  "job": {...},
  "scoring_criteria": {
    "skills_match": 0.4,
    "experience_match": 0.3
  }
}
```

### **Implementation Features**

#### **1. Security & Authentication**
- **JWT Token Validation**: Consistent across all APIs
- **SQL Injection Protection**: Advanced query validation
- **Rate Limiting**: Per-API and per-user limits
- **CORS Configuration**: Secure cross-origin requests

#### **2. Caching Strategy**
- **API Gateway Level**: Nginx proxy caching
- **Application Level**: Redis caching per API
- **Query Level**: SQL query result caching
- **AI Model Level**: ML prediction caching

#### **3. Monitoring & Observability**
- **Prometheus**: Metrics collection
- **Grafana**: Visualization dashboards
- **ELK Stack**: Log aggregation and analysis
- **Health Checks**: Automated service monitoring

#### **4. Scalability Features**
- **Horizontal Scaling**: Multiple API instances
- **Load Balancing**: Intelligent request distribution
- **Connection Pooling**: Efficient database connections
- **Message Queues**: Async processing with RabbitMQ

### **API Usage Examples**

#### **Frontend Integration**
```typescript
import { multiApiClient } from '@/services/multiApiClient';

// Initialize multi-API client
await multiApiClient.initialize();

// Use SQL API for complex queries
const stats = await multiApiClient.sql.getApplicationStats(companyId);

// Use GraphQL for flexible data fetching
const jobs = await multiApiClient.graphql.getJobs({
  filters: { department: 'Engineering' }
});

// Use AI API for candidate scoring
const score = await multiApiClient.ai.scoreCandidate({
  candidate: candidateData,
  job: jobData
});

// Use WebSocket for real-time updates
multiApiClient.websocket.send({
  type: 'subscribe',
  channel: 'applications'
});
```

#### **External Integration**
```bash
# REST API (Traditional)
curl -X GET "http://api.talentsol.local/api/v1/jobs" \
  -H "Authorization: Bearer $TOKEN"

# GraphQL API (Flexible)
curl -X POST "http://api.talentsol.local/graphql" \
  -H "Content-Type: application/json" \
  -d '{"query": "{ jobs { id title } }"}'

# SQL API (Direct Database Access)
curl -X POST "http://api.talentsol.local/sql/query" \
  -H "Content-Type: application/json" \
  -d '{"query": "SELECT COUNT(*) FROM applications"}'

# AI API (Machine Learning)
curl -X POST "http://api.talentsol.local/ai/score" \
  -H "Content-Type: application/json" \
  -d '{"candidate": {...}, "job": {...}}'
```

### **Deployment**

#### **Docker Compose**
```bash
# Start all services
docker-compose -f docker-compose.multi-api.yml up -d

# Scale specific services
docker-compose -f docker-compose.multi-api.yml up -d --scale rest-api=3

# Monitor services
docker-compose -f docker-compose.multi-api.yml logs -f
```

#### **Service Health Checks**
```bash
# Check all services
curl http://api.talentsol.local/health

# Check specific APIs
curl http://localhost:3000/health  # REST API
curl http://localhost:4000/health  # GraphQL API
curl http://localhost:5000/health  # SQL API
curl http://localhost:8000/health  # AI API
```

### **Performance Optimization**

#### **1. Caching Layers**
- **L1 Cache**: Nginx proxy cache (static content)
- **L2 Cache**: Redis application cache (dynamic data)
- **L3 Cache**: Database query cache (expensive queries)

#### **2. Connection Management**
- **Database Pooling**: Optimized connection pools per service
- **Keep-Alive**: HTTP connection reuse
- **Circuit Breakers**: Fault tolerance patterns

#### **3. Resource Allocation**
- **CPU Limits**: Per-service resource constraints
- **Memory Limits**: Prevent memory leaks and OOM
- **Disk I/O**: Optimized storage access patterns

### **Monitoring Dashboard**

#### **Key Metrics**
- **Request Rate**: Requests per second per API
- **Response Time**: P50, P95, P99 latencies
- **Error Rate**: 4xx and 5xx error percentages
- **Cache Hit Rate**: Caching effectiveness
- **Resource Usage**: CPU, memory, disk utilization

#### **Alerts**
- **High Error Rate**: > 5% error rate for 5 minutes
- **High Latency**: P95 > 2 seconds for 5 minutes
- **Low Cache Hit Rate**: < 70% hit rate for 10 minutes
- **Resource Exhaustion**: > 80% CPU/memory for 5 minutes

### **Future Enhancements**

1. **API Versioning**: Support multiple API versions simultaneously
2. **Auto-scaling**: Kubernetes-based horizontal pod autoscaling
3. **Service Mesh**: Istio for advanced traffic management
4. **Event Sourcing**: CQRS pattern for complex data flows
5. **Federated GraphQL**: Distributed GraphQL schema composition

## Acknowledgements

- Developed as a hobbyist project with Augment Code
- Frontend development completed in just 1.5 days
- Built with modern web technologies and best practices
- ML integration ready for Kaggle dataset integration
- Comprehensive backend API with production-ready features
- Advanced caching architecture for enterprise-scale performance

### **Recent Development Milestones**

#### **Advanced Caching Implementation (Latest)**
- ✅ **Multi-layer caching system** with Redis and in-memory fallback
- ✅ **6 cache strategies** implemented with automatic invalidation
- ✅ **Decorator-based caching** for easy method-level optimization
- ✅ **Performance monitoring** with health checks and metrics
- ✅ **Production-ready** with comprehensive error handling

#### **Application Management Improvements**
- ✅ **Bug fixes**: Resolved `topSources` null reference errors
- ✅ **Enhanced UX**: Added skeleton loading states and error handling
- ✅ **Code quality**: Improved null safety and variable references
- ✅ **Testing**: Verified frontend functionality and caching system

#### **Documentation Consolidation**
- ✅ **Single source of truth**: All documentation consolidated into README.md
- ✅ **Comprehensive coverage**: From basic setup to advanced architecture
- ✅ **Developer-friendly**: Clear examples and troubleshooting guides

