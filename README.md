# TalentSol - AI-Powered Applicant Tracking System

TalentSol is a comprehensive, modern applicant tracking system featuring AI-powered candidate prioritization, unified data architecture, mobile-first responsive design, and professional UI/UX. Built with React, TypeScript, Node.js, and PostgreSQL, it provides a complete recruitment management solution with enterprise-grade features.

## About This Project

This is a hobbyist AI/machine learning project developed with Augment Code as development partner. TalentSol demonstrates modern web development practices, unified data architecture, comprehensive mobile responsiveness, and AI/ML integration capabilities for recruitment optimization.

**Key Achievement**: Complete responsive ATS developed using Augment Code Agent and Context Engine with production-ready features.

**Latest Updates (June 2025)**:
- ✅ **Application Management System**: Complete dashboard with forms, analytics, and performance tracking
- ✅ **Mobile-First Responsive Design**: Comprehensive responsive components and layout system
- ✅ **Enhanced Backend APIs**: Expanded applications, analytics, and forms endpoints with real-time data
- ✅ **Standardized UI Components**: Unified design system with consistent shadows, badges, and loading states

## Table of Contents

- [Getting Started](#getting-started)
- [Features](#-key-features)
- [Data Management](#-data-management)
- [UI/UX Design System](#-uiux-design-system)
- [AI/ML Integration](#-aiml-integration)
- [Development Guidelines](#development-guidelines)
- [API Architecture](#-api-architecture)
- [Troubleshooting](#-troubleshooting)

## Developer

**Aaron (Youshen) Lim**
- LinkedIn: [https://www.linkedin.com/in/youshen/](https://www.linkedin.com/in/youshen/)
- GitHub: [https://github.com/youshen-lim](https://github.com/youshen-lim)

## 🚀 Key Features

### **📱 Mobile-First Responsive Design**
- **Comprehensive Responsive System**: Custom useResponsiveLayout hook with device detection
- **Adaptive Components**: Dynamic layout switching based on screen size (mobile/tablet/desktop/wide)
- **Touch-Friendly Interface**: Optimized mobile interactions with proper touch targets
- **Responsive Navigation**: Collapsible sidebar and mobile-optimized menu systems
- **Flexible Grid System**: Responsive grid components with configurable breakpoints

### **🎯 Application Management System**
- **Unified Dashboard**: Complete application tracking with real-time metrics and analytics
- **Form Builder**: Professional application forms with live publishing and public URLs
- **Performance Analytics**: Conversion rates, form engagement, and source tracking
- **Bulk Operations**: Multi-select actions for efficient application management
- **Export Functionality**: Data export capabilities with filtering options

### **🏗️ Unified Data Architecture**
- **Candidate-Centric Design**: All data flows from candidate entities as primary keys
- **Manual CSV Import**: Professional data management via pgAdmin GUI
- **PostgreSQL Integration**: 14 comprehensive database tables with optimized relationships
- **Real-Time Analytics**: Dynamic dashboard metrics without hardcoded data
- **Enhanced APIs**: Comprehensive backend endpoints with proper error handling

### **🎨 Professional UI/UX Design System**
- **Standardized Components**: Unified shadows, badges, headers, and loading states
- **Inter Font Family**: Consistent typography with optimized loading and hierarchy
- **Responsive Design**: Mobile-first approach with 768px breakpoint and consistent spacing
- **Blue Color Scheme**: Professional #3B82F6 primary with gradient hover states
- **Loading States**: Contextual loading indicators with skeleton animations

### **🚀 Advanced Features**
- **AI/ML Integration**: Ready for Kaggle dataset integration and candidate scoring
- **Multi-API Architecture**: REST, GraphQL, SQL, and AI/ML endpoints
- **Advanced Caching**: Redis clustering with multi-layer strategies
- **Real-Time Notifications**: Comprehensive notification system
- **Type Safety**: Full TypeScript implementation with Zod validation

## Technologies Used

### Frontend Stack
- **React 18** with TypeScript and modern hooks
- **Vite** development server (port 8080) with @vitejs/plugin-react-swc
- **Tailwind CSS** with custom design tokens and responsive utilities
- **Shadcn UI** component library with custom responsive components
- **React Router** for navigation with protected routes
- **React Query** for data fetching and caching
- **Zustand** for state management
- **Custom Hooks**: useResponsiveLayout, useAnalytics, enhanced data hooks

### Backend Stack
- **Node.js + Express** with TypeScript and comprehensive error handling
- **PostgreSQL** with Prisma ORM and optimized schemas
- **Redis** clustering for advanced caching strategies
- **JWT Authentication** with role-based access and development bypass
- **Zod Validation** for type safety and request validation
- **Multer** for file uploads and document management

### Development Tools
- **ESLint + Prettier** for code quality and formatting
- **TypeScript** with strict configuration for type safety
- **Prisma Studio** for database management and visualization
- **pgAdmin** for professional database operations
- **Git** with conventional commit messages

## Getting Started

### Prerequisites
- **Node.js 18+** and npm/yarn
- **PostgreSQL** database server
- **Redis** (optional, falls back to in-memory cache)

### Quick Start

1. **Clone and Install**
   ```bash
   git clone https://github.com/yourusername/talentsol-ats.git
   cd talentsol-ats
   npm install
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Edit .env with your PostgreSQL connection details
   ```

3. **Database Setup**
   ```bash
   # Generate Prisma client and push schema
   npx prisma generate
   npx prisma db push

   # Import sample data (recommended)
   npm run import-csv
   ```

4. **Start Development Servers**
   ```bash
   # Backend (Terminal 1)
   cd backend && npm run dev

   # Frontend (Terminal 2)
   cd .. && npm run dev
   ```

5. **Access Application**
   - **Frontend**: `http://localhost:8080`
   - **Backend API**: `http://localhost:3001`
   - **Health Check**: `http://localhost:3001/health`

### Demo Credentials
- **Admin**: `admin@talentsol-demo.com` / `password123`
- **Recruiter**: `recruiter@talentsol-demo.com` / `password123`

## 📊 Data Management

### **CSV Data Import System**
TalentSol uses a professional CSV import workflow for data management:

**Data Structure**:
- **50 Candidates** with complete profiles
- **50 Applications** distributed across 3 jobs
- **10 Interviews** with realistic scheduling
- **3 Job Openings** across different departments

**Import Process**:
```bash
cd backend
npm run import-csv  # Imports from backend/data/talentsol_complete_data.csv
```

**Manual Data Management**:
- Edit CSV file directly for custom data
- Use pgAdmin GUI for advanced database operations
- Maintain candidate-centric data relationships

### **Synthetic Data Generation**
For development and testing, TalentSol includes comprehensive synthetic data generation:

```bash
# Generate complete synthetic dataset
cd backend
npm run data-full

# This creates:
# - 500 Candidates (Primary entities)
# - 1,200+ Applications (2-4 per candidate)
# - 600+ Interviews (Linked via applications)
# - 20 Job Openings (Referenced by applications)
# - 300+ Documents (Resumes, cover letters)
# - 200+ Notifications (Application updates)
```

**Data Generation Features**:
- **Candidate-Centric Architecture**: All data flows from candidate entities
- **Realistic Timelines**: 12 months of historical data
- **ML Integration**: Candidate scoring and predictions
- **Performance Optimized**: Batch processing with validation

### **Database Architecture**
**14 Comprehensive Tables**:
- `candidates`, `applications`, `jobs`, `interviews`
- `documents`, `email_templates`, `notifications`
- `ml_models`, `ml_predictions`, `training_datasets`
- `users`, `companies`, `user_settings`, `skill_extractions`

**Unified Data Model**:
- **Primary Entity**: Candidate (candidate_ID)
- **Relationships**: All data flows from candidate entities
- **Integrity**: Foreign key constraints and validation
- **Performance**: Optimized queries with proper indexing

## 🎯 Application Features

### **Core Pages & Functionality**
- **Dashboard**: Real-time analytics with dynamic metrics, charts, and candidate source visualization
- **Application Management**: Comprehensive system with dashboard, applications, forms, and performance analytics tabs
- **Candidates**: Unified kanban/list view with drag-and-drop functionality and mobile-responsive design
- **Jobs Management**: Job creation, editing, application tracking, and responsive grid layout
- **Interview Scheduler**: Calendar-based interview scheduling with mobile-optimized interface
- **Documents**: File management with AI-powered chat interface
- **Analytics**: Comprehensive reporting and data visualization with responsive charts
- **Settings**: User preferences and company configuration with mobile-friendly forms

### **📱 Mobile-Responsive Features**
- **Adaptive Navigation**: Collapsible sidebar with mobile menu and touch-friendly interactions
- **Responsive Tables**: Dynamic switching between table and card layouts based on screen size
- **Touch Optimization**: Proper touch targets, swipe gestures, and mobile-friendly forms
- **Flexible Grids**: Responsive grid systems that adapt from 1 column (mobile) to 4 columns (wide screens)
- **Modal Management**: Full-screen modals on mobile, standard modals on desktop

### **🚀 Advanced Capabilities**
- **Real-Time Notifications**: Live updates for applications and interviews with mobile notifications
- **Multi-Step Forms**: Progressive application forms with mobile-optimized validation
- **File Upload System**: Drag-and-drop document management with mobile file picker support
- **Search & Filtering**: Advanced filtering across all data entities with mobile-friendly interfaces
- **Bulk Operations**: Multi-select actions with mobile-optimized selection UI
- **Export Functionality**: Data export capabilities with filtering and format options
- **Error Handling**: Graceful fallbacks, loading states, and mobile-friendly error messages
- **Type Safety**: Full TypeScript implementation with Zod validation and responsive type definitions

## 🤖 AI/ML Integration

### **Machine Learning Ready Architecture**
- **Database Schema**: ML models, predictions, and training datasets tables
- **API Endpoints**: Candidate scoring and bulk prediction endpoints
- **Kaggle Integration**: Ready for resume classification and HR analytics datasets
- **Skills Extraction**: AI-powered skills identification from documents

### **ML Features**
- **Candidate Scoring**: Priority scoring based on job requirements
- **Model Management**: Version control and deployment of ML models
- **Prediction Tracking**: Comprehensive logging of ML predictions
- **Training Pipeline**: Integration with external datasets

## 🎨 UI/UX Design System

### **📱 Mobile-First Responsive Design**
- **Comprehensive Breakpoints**: 768px mobile, 1024px tablet, 1280px desktop, 1536px wide
- **Adaptive Components**: Dynamic layout switching with useResponsiveLayout hook
- **Touch-Friendly**: Optimized touch targets (44px minimum) and gesture support
- **Responsive Navigation**: Collapsible sidebar, mobile menu, and adaptive tab navigation
- **Flexible Layouts**: Grid systems that adapt from 1-4 columns based on screen size

### **🎯 Consistent Design Language**
- **Typography**: Inter font family with standardized hierarchy (32px titles, 20px headers, 14px body)
- **Color Scheme**: Professional blue (#4F86F7) with gradient hover states and consistent theming
- **Spacing**: 16px-24px grid system with responsive adjustments (px-4 md:px-6 lg:px-8)
- **Components**: White cards with standardized shadows and consistent padding patterns

### **🔧 Standardized Component System**
- **PageHeader**: Unified header component with responsive title, subtitle, and action buttons
- **ResponsivePageWrapper**: Standardized page layout with mobile-first responsive behavior
- **Loading States**: Contextual loading UI with skeleton animations and device-appropriate sizing
- **Badge System**: Unified status badges with gradient styling and consistent color schemes
- **Shadow System**: Comprehensive shadow variants for different component types

### **🚀 Professional Features**
- **Accessibility**: WCAG-compliant design with proper contrast ratios and ARIA labels
- **Animations**: Smooth transitions, hover effects, and mobile-optimized interactions
- **Form Validation**: Real-time validation with mobile-friendly error messages
- **Error Handling**: Graceful fallbacks with responsive error states
- **Performance**: Optimized loading with skeleton states and progressive enhancement

### **📦 Standardized Shadow System**
TalentSol uses a comprehensive shadow system for visual consistency across all devices:

```typescript
import { shadows } from '@/components/ui/shadow';

// Usage examples
<div className={shadows.card}>Standard content</div>
<div className={shadows.cardEnhanced}>Important metrics</div>
<div className={shadows.modal}>Dialog content</div>
<div className={shadows.dropdown}>Menu items</div>
```

**Shadow Variants**:
- **`card`**: Standard content containers with subtle shadows and responsive behavior
- **`cardEnhanced`**: Important content with enhanced shadows, backdrop blur, and mobile optimization
- **`modal`**: Dialog and overlay shadows with device-appropriate sizing
- **`dropdown`**: Menu and tooltip shadows with touch-friendly spacing
- **`button`**: Interactive element shadows with hover effects and mobile states
- **`input`**: Form input shadows with focus states and mobile-optimized sizing

**Implementation Status**:
- ✅ **Dashboard**: Complete with responsive charts and mobile-optimized metrics
- ✅ **Application Management**: Full responsive system with mobile-first design
- ✅ **Candidates**: Consolidated with responsive kanban/list views
- ✅ **All Pages**: Standardized headers, loading states, and responsive components

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



## 🔌 API Architecture

### **🚀 Enhanced Multi-API Design**
- **REST API**: Standard CRUD operations with comprehensive error handling (`/api/*`)
- **GraphQL**: Complex queries and relationships (`/graphql`)
- **SQL API**: Direct database queries with caching (`/sql/*`)
- **AI/ML API**: Machine learning endpoints with prediction tracking (`/api/ml/*`)

### **📊 Core Endpoints**
- **Applications**:
  - `GET /api/applications/overview` - Enhanced dashboard metrics with timeframe filtering
  - `POST /api/applications/export` - Data export with filtering options
  - `POST /api/applications/bulk-actions` - Bulk operations for application management
- **Analytics**: `GET /api/analytics/dashboard` - Real-time metrics with source tracking
- **Forms**:
  - `GET /api/forms` - Form management with status and performance metrics
  - `POST /api/forms` - Form creation with live publishing capabilities
- **Candidates**: Full CRUD with enhanced filtering, search, and mobile-optimized responses
- **Jobs**: Job management with application tracking and responsive data formatting
- **Interviews**: Calendar-based scheduling system with mobile-friendly responses
- **ML Predictions**: `POST /api/ml/predict` - AI scoring with comprehensive logging

### **🔐 Authentication & Security**
- **JWT-based** authentication with role-based access control
- **Development bypass** for streamlined development workflow
- **Public endpoints** for application forms with proper validation
- **Rate limiting** optimized for development (1000 req/min) with production-ready scaling
- **CORS configuration** for cross-origin requests with security headers

## 🚀 Development

### **📱 Development Scripts**
```bash
# Frontend development (Mobile-responsive)
npm run dev              # Start Vite dev server (port 8080) with responsive design
npm run build            # Build for production with mobile optimization
npm run preview          # Preview production build

# Backend development (Enhanced APIs)
cd backend && npm run dev # Start Express server (port 3001) with enhanced endpoints
npm run db:studio        # Open Prisma Studio for database management

# Database operations
npm run db:push          # Push schema changes with validation
npm run import-csv       # Import sample data with enhanced relationships
npm run data-full        # Generate comprehensive synthetic data
```

### **🔧 Environment Configuration**
```bash
# Backend .env (Enhanced)
DATABASE_URL="postgresql://user:password@localhost:5432/talentsol"
JWT_SECRET="your-secret-key"
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=1000
NODE_ENV="development"
REDIS_URL="redis://localhost:6379"  # Optional for caching
```

### **📱 Mobile Development Notes**
- **Responsive Testing**: Use browser dev tools with device simulation
- **Touch Testing**: Test on actual mobile devices for touch interactions
- **Performance**: Monitor mobile performance with responsive components
- **Breakpoints**: Test all breakpoints (768px, 1024px, 1280px, 1536px)

## 🚨 Troubleshooting

### **Database Connection Issues**
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Restart PostgreSQL if needed
sudo systemctl restart postgresql

# Test connection manually
psql -h localhost -U talentsol_user -d talentsol_ats
```

**Common Solutions**:
1. Ensure PostgreSQL is running
2. Verify DATABASE_URL in .env file
3. Check database and user exist
4. Confirm firewall settings allow connections

### **No Data Showing in Dashboard**
```bash
# Check database connection
cd backend && npm run db:check

# Import sample data
npm run import-csv

# Generate synthetic data
npm run data-full

# Verify API response
curl http://localhost:3001/api/analytics/dashboard
```

### **Frontend Build Issues**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
rm -rf node_modules/.vite
npm run dev
```

### **Backend API Errors**
```bash
# Check backend logs
cd backend && npm run dev

# Verify environment variables
cat .env

# Test API health
curl http://localhost:3001/health
```

### **📱 Mobile & Performance Issues**
1. **Enable Redis caching** for better performance across all devices
2. **Check database indexes** for slow queries affecting mobile responsiveness
3. **Monitor memory usage** during data generation and mobile rendering
4. **Reduce batch sizes** if generation fails on mobile devices
5. **Test responsive breakpoints** if layout issues occur on different screen sizes
6. **Clear browser cache** if mobile styles don't update properly

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Augment Code** - AI development partner for comprehensive ATS development
- **Vite** - Fast development build tool with mobile-optimized builds
- **Shadcn/ui** - Modern UI component library with responsive design
- **Tailwind CSS** - Utility-first CSS framework with mobile-first approach
- **Prisma** - Type-safe database ORM with enhanced relationship management
- **React** - Modern frontend framework with excellent mobile support
- **TypeScript** - Type safety and enhanced developer experience

---

**TalentSol** - Modern AI-powered recruitment management with comprehensive mobile responsiveness and professional UI/UX design.

**Latest Features**: Application Management System • Mobile-First Responsive Design • Enhanced Backend APIs • Standardized UI Components

