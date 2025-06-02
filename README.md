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

## License

This project is open source and available under the [MIT License](LICENSE).

## Acknowledgements

- Developed as a hobbyist project with Augment Code
- Frontend development completed in just 1.5 days
- Built with modern web technologies and best practices

