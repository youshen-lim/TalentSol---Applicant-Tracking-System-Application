# TalentSol - AI-Powered Applicant Tracking System

TalentSol is a comprehensive, modern applicant tracking system featuring AI-powered candidate prioritization, unified data architecture, and professional UI/UX design. Built with React, TypeScript, Node.js, and PostgreSQL, it provides a complete recruitment management solution.

## About This Project

This is a hobbyist AI/machine learning project developed with Augment Code as development partner. TalentSol demonstrates modern web development practices, unified data architecture, and AI/ML integration capabilities for recruitment optimization.

**Key Achievement**: Frontend development completed in 1.5 days using Augment Code Agent and Context Engine.

## Developer

**Aaron (Youshen) Lim**
- LinkedIn: [https://www.linkedin.com/in/youshen/](https://www.linkedin.com/in/youshen/)
- GitHub: [https://github.com/youshen-lim](https://github.com/youshen-lim)

## 🚀 Key Features

### **Unified Data Architecture**
- **Candidate-Centric Design**: All data flows from candidate entities as primary keys
- **Manual CSV Import**: Professional data management via pgAdmin GUI
- **PostgreSQL Integration**: 14 comprehensive database tables
- **Real-Time Analytics**: Dynamic dashboard metrics without hardcoded data

### **Professional UI/UX**
- **Consistent Design System**: Standardized headers, typography, and spacing across all pages
- **Inter Font Family**: Consistent typography with optimized loading
- **Responsive Design**: Mobile-first approach with consistent breakpoints
- **Blue Color Scheme**: Professional #3B82F6 primary with hover states

### **Advanced Features**
- **AI/ML Integration**: Ready for Kaggle dataset integration and candidate scoring
- **Multi-API Architecture**: REST, GraphQL, SQL, and AI/ML endpoints
- **Advanced Caching**: Redis clustering with multi-layer strategies
- **Real-Time Notifications**: Comprehensive notification system

## Technologies Used

### Frontend Stack
- **React 18** with TypeScript
- **Vite** development server (port 8080)
- **Tailwind CSS** with custom design tokens
- **Shadcn UI** component library
- **React Router** for navigation
- **React Query** for data fetching
- **Zustand** for state management

### Backend Stack
- **Node.js + Express** with TypeScript
- **PostgreSQL** with Prisma ORM
- **Redis** clustering for caching
- **JWT Authentication** with role-based access
- **Zod Validation** for type safety
- **Multer** for file uploads

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
- **Dashboard**: Real-time analytics with dynamic metrics and charts
- **Candidate Pipeline**: Kanban/list view with drag-and-drop functionality
- **Jobs Management**: Job creation, editing, and application tracking
- **Interview Scheduler**: Calendar-based interview scheduling system
- **Documents**: File management with AI-powered chat interface
- **Analytics**: Comprehensive reporting and data visualization
- **Applications**: Form builder and application review system
- **Settings**: User preferences and company configuration

### **Advanced Capabilities**
- **Real-Time Notifications**: Live updates for applications and interviews
- **Multi-Step Forms**: Progressive application forms with validation
- **File Upload System**: Drag-and-drop document management
- **Search & Filtering**: Advanced filtering across all data entities
- **Responsive Design**: Mobile-optimized interface with consistent UX
- **Error Handling**: Graceful fallbacks and loading states
- **Type Safety**: Full TypeScript implementation with Zod validation

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

### **Consistent Design Language**
- **Typography**: Inter font family with standardized hierarchy (32px titles, 14px subtitles)
- **Color Scheme**: Professional blue (#3B82F6) with consistent hover states
- **Spacing**: 16px-24px grid system with responsive adjustments
- **Components**: White cards with subtle shadows and consistent padding

### **Responsive Architecture**
- **Mobile-First**: Optimized for all device sizes with touch-friendly interactions
- **Breakpoints**: Consistent sm:640px, md:768px, lg:1024px breakpoints
- **Sidebar**: Collapsible with tooltips and responsive behavior
- **Navigation**: Unified header and sidebar navigation patterns

### **Professional Features**
- **Loading States**: Skeleton animations and proper error handling
- **Accessibility**: WCAG-compliant design with proper contrast ratios
- **Animations**: Smooth transitions and hover effects
- **Form Validation**: Real-time validation with user-friendly error messages

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

## 📁 Project Structure

```
talentsol-ats/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── ui/             # Shadcn UI components
│   │   ├── dashboard/      # Dashboard-specific components
│   │   ├── candidates/     # Candidate management components
│   │   ├── interviews/     # Interview scheduling components
│   │   ├── layout/         # Layout components (Sidebar, NavBar, PageHeader)
│   │   └── forms/          # Application form components
│   ├── pages/              # Page components (8 main pages)
│   ├── hooks/              # Custom React hooks
│   ├── services/           # API services and multi-API client
│   ├── types/              # TypeScript type definitions
│   └── lib/                # Utility functions
├── backend/                # Backend API server
│   ├── src/
│   │   ├── routes/         # API route handlers
│   │   ├── models/         # Database models (Prisma)
│   │   ├── middleware/     # Express middleware
│   │   └── utils/          # Backend utilities
│   ├── prisma/             # Database schema and migrations
│   ├── data/               # CSV import data files
│   └── uploads/            # File upload storage
└── public/                 # Static assets
```

## 🔌 API Architecture

### **Multi-API Design**
- **REST API**: Standard CRUD operations (`/api/*`)
- **GraphQL**: Complex queries and relationships (`/graphql`)
- **SQL API**: Direct database queries (`/sql/*`)
- **AI/ML API**: Machine learning endpoints (`/api/ml/*`)

### **Core Endpoints**
- **Analytics**: `GET /api/analytics/dashboard` - Real-time metrics
- **Candidates**: Full CRUD with filtering and search
- **Jobs**: Job management with application tracking
- **Applications**: Form submission and status management
- **Interviews**: Calendar-based scheduling system
- **ML Predictions**: `POST /api/ml/predict` - AI scoring

### **Authentication**
- **JWT-based** authentication with role-based access
- **Public endpoints** for application forms
- **Rate limiting** optimized for development (1000 req/min)

## 🚀 Development

### **Scripts**
```bash
# Frontend development
npm run dev              # Start Vite dev server (port 8080)

# Backend development
cd backend && npm run dev # Start Express server (port 3001)

# Database operations
npm run db:push          # Push schema changes
npm run import-csv       # Import sample data
```

### **Environment Configuration**
```bash
# Backend .env
DATABASE_URL="postgresql://user:password@localhost:5432/talentsol"
JWT_SECRET="your-secret-key"
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=1000
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Augment Code** - AI development partner
- **Vite** - Fast development build tool
- **Shadcn/ui** - Modern UI component library
- **Tailwind CSS** - Utility-first CSS framework
- **Prisma** - Type-safe database ORM

---

**TalentSol** - Modern AI-powered recruitment management with professional UI/UX design.

