# TalentSol ATS - Frontend Mock Data to Database Mapping

This document outlines how the mock data from the frontend pages has been organized into proper database structures.

## Dashboard Mock Data → Database Analytics

### Frontend Dashboard Metrics
```typescript
// From Dashboard.tsx
const metrics = {
  totalApplications: 1247,
  newApplications: 23,
  interviewsScheduled: 8,
  offersExtended: 3,
  positionsOpen: 12,
  averageTimeToHire: 18
};
```

### Database Implementation
- **Analytics API**: `/api/analytics/dashboard`
- **Real-time calculations** from actual application data
- **Time-based filtering** for metrics like "new applications today"
- **Aggregated data** from applications, interviews, and job tables

## Candidates Mock Data → Database Structure

### Frontend Candidate Pipeline
```typescript
// From CandidatePipeline.tsx
const mockCandidates = [
  {
    id: "c1",
    name: "John Smith",
    email: "john.smith@example.com",
    phone: "+1 (555) 123-4567",
    position: "Frontend Developer",
    stage: "applied",
    tags: ["React", "TypeScript"],
    lastActivity: "Applied 2 days ago",
    rating: 4,
  }
];
```

### Database Mapping
```sql
-- Candidates Table
CREATE TABLE candidates (
  id UUID PRIMARY KEY,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  email VARCHAR(255) UNIQUE,
  phone VARCHAR(50),
  location JSONB,
  work_authorization VARCHAR(100),
  linkedin_url VARCHAR(500),
  portfolio_url VARCHAR(500),
  website_url VARCHAR(500)
);

-- Applications Table (links candidates to jobs)
CREATE TABLE applications (
  id UUID PRIMARY KEY,
  job_id UUID REFERENCES jobs(id),
  candidate_id UUID REFERENCES candidates(id),
  status VARCHAR(50), -- 'applied', 'screening', 'interview', etc.
  submitted_at TIMESTAMP,
  candidate_info JSONB,
  professional_info JSONB,
  scoring JSONB, -- Includes rating/scoring data
  tags TEXT[],
  activity JSONB[] -- Tracks "last activity"
);
```

## Jobs Mock Data → Database Structure

### Frontend Jobs Data
```typescript
// From Jobs.tsx
const jobs = [
  {
    id: "1",
    title: "Senior Frontend Developer",
    department: "Engineering",
    location: "San Francisco, CA",
    type: "Full-time",
    experience: "Senior",
    salary: "$120k - $150k",
    applicants: 24,
    pipeline: {
      screening: 15,
      interview: 8,
      assessment: 4,
      offer: 1
    },
    posted: "2024-01-15",
    status: "Open"
  }
];
```

### Database Mapping
```sql
-- Jobs Table
CREATE TABLE jobs (
  id UUID PRIMARY KEY,
  title VARCHAR(255),
  department VARCHAR(100),
  location JSONB, -- Structured location data
  employment_type VARCHAR(50), -- 'full-time', 'part-time', etc.
  experience_level VARCHAR(50), -- 'entry', 'mid', 'senior', 'executive'
  salary JSONB, -- Structured salary with min/max/currency
  description TEXT,
  responsibilities TEXT[],
  required_qualifications TEXT[],
  preferred_qualifications TEXT[],
  skills TEXT[],
  status VARCHAR(50), -- 'draft', 'open', 'closed', 'archived'
  visibility VARCHAR(50), -- 'public', 'internal', 'private'
  posted_date TIMESTAMP,
  max_applicants INTEGER,
  current_applicants INTEGER,
  pipeline JSONB, -- Pipeline stage counts
  company_id UUID REFERENCES companies(id),
  created_by_id UUID REFERENCES users(id)
);
```

## Enhanced Database Features

### 1. Multi-Tenant Architecture
```sql
-- Companies table for multi-tenant support
CREATE TABLE companies (
  id UUID PRIMARY KEY,
  name VARCHAR(255),
  domain VARCHAR(255)
);

-- All data is scoped to company_id
```

### 2. User Management & Authentication
```sql
-- Users with role-based access
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE,
  password_hash VARCHAR(255),
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  role VARCHAR(50), -- 'admin', 'recruiter', 'hiring_manager'
  company_id UUID REFERENCES companies(id)
);
```

### 3. Interview Management
```sql
-- Interview scheduling (not in frontend mock data)
CREATE TABLE interviews (
  id UUID PRIMARY KEY,
  application_id UUID REFERENCES applications(id),
  title VARCHAR(255),
  type VARCHAR(50), -- 'phone', 'video', 'in-person', 'technical'
  scheduled_date TIMESTAMP,
  start_time TIME,
  end_time TIME,
  location VARCHAR(500),
  interviewers UUID[], -- Array of user IDs
  notes TEXT,
  feedback JSONB,
  status VARCHAR(50)
);
```

### 4. Document Management
```sql
-- File uploads for resumes, cover letters, etc.
CREATE TABLE documents (
  id UUID PRIMARY KEY,
  application_id UUID REFERENCES applications(id),
  filename VARCHAR(255),
  file_type VARCHAR(50),
  file_size INTEGER,
  file_url VARCHAR(1000),
  document_type VARCHAR(50), -- 'resume', 'cover_letter', 'portfolio'
  uploaded_at TIMESTAMP
);
```

### 5. Email Templates
```sql
-- Customizable email templates
CREATE TABLE email_templates (
  id UUID PRIMARY KEY,
  name VARCHAR(255),
  subject VARCHAR(255),
  body TEXT,
  type VARCHAR(50), -- 'confirmation', 'interview_invite', 'rejection'
  variables TEXT[] -- Template variables like {{candidateName}}
);
```

## Seed Data Enhancements

### Comprehensive Test Data
The seed file creates:

1. **Demo Company**: "TalentSol Demo Company"
2. **Demo Users**: 
   - Admin: `admin@talentsol-demo.com`
   - Recruiter: `recruiter@talentsol-demo.com`
3. **6 Realistic Jobs** across different departments:
   - Senior Frontend Developer (Engineering)
   - UX/UI Designer (Design)
   - Product Manager (Product)
   - DevOps Engineer (Engineering)
   - Sales Representative (Sales)
   - Marketing Specialist (Marketing)
4. **11 Candidates** with diverse backgrounds
5. **Applications** with realistic professional info and metadata
6. **Interview Records** for candidates in interview stages
7. **Email Templates** for all communication types

### Data Relationships
```
Company
├── Users (Admin, Recruiters)
├── Jobs
│   ├── Applications
│   │   ├── Candidates
│   │   ├── Documents
│   │   └── Interviews
│   └── Application Form Schemas
└── Email Templates
```

## API Endpoints Mapping

### Frontend Mock Data → API Calls
- **Dashboard metrics** → `GET /api/analytics/dashboard`
- **Candidate pipeline** → `GET /api/candidates` + `GET /api/candidates/pipeline/summary`
- **Jobs listing** → `GET /api/jobs` (public) + `GET /api/jobs/company/all` (internal)
- **Application submission** → `POST /api/applications`
- **Interview scheduling** → `POST /api/interviews`

## Benefits of Database Structure

1. **Data Integrity**: Foreign key constraints ensure data consistency
2. **Scalability**: Proper indexing and relationships support growth
3. **Security**: Multi-tenant architecture with proper access controls
4. **Flexibility**: JSON fields allow for evolving data structures
5. **Analytics**: Rich data model supports complex reporting
6. **Audit Trail**: Activity tracking for compliance and debugging
7. **Real-time Updates**: Database triggers can power real-time features

This structure transforms the static frontend mock data into a dynamic, scalable database that can support a production ATS system while maintaining all the functionality demonstrated in the frontend mockups.
