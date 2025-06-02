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
│   ├── prisma/              # Database schema and migrations
│   │   └── schema.prisma    # Prisma schema
│   ├── src/
│   │   ├── middleware/      # Express middleware
│   │   ├── routes/          # API route handlers
│   │   ├── types/           # TypeScript types and validation
│   │   ├── index.ts         # Express server entry point
│   │   └── seed.ts          # Database seeding script
│   ├── uploads/             # File upload directory
│   ├── .env.example         # Environment variables template
│   ├── package.json         # Backend dependencies
│   ├── tsconfig.json        # Backend TypeScript config
│   └── README.md            # Backend documentation
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
- `GET /api/analytics/dashboard` - Get dashboard analytics
- `GET /api/analytics/funnel` - Get hiring funnel data
- `GET /api/analytics/time-to-hire` - Get time-to-hire analytics

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

## Acknowledgements

- Developed as a hobbyist project with Augment Code
- Frontend development completed in just 1.5 days
- Built with modern web technologies and best practices
- ML integration ready for Kaggle dataset integration
- Comprehensive backend API with production-ready features

