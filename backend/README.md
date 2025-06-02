# TalentSol ATS Backend

A robust Node.js/Express backend API for the TalentSol Applicant Tracking System, built with TypeScript, Prisma, and PostgreSQL.

## Features

- **Authentication & Authorization**: JWT-based auth with role-based access control
- **Database**: PostgreSQL with Prisma ORM
- **File Uploads**: Multer for document handling
- **Validation**: Zod schemas for request validation
- **Security**: Helmet, CORS, rate limiting
- **Error Handling**: Comprehensive error handling with custom error classes
- **API Documentation**: RESTful API design

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT
- **Validation**: Zod
- **File Upload**: Multer
- **Security**: Helmet, CORS, bcryptjs

## Getting Started

### Prerequisites

- Node.js 18 or higher
- PostgreSQL database
- npm or yarn

### Installation

1. **Install dependencies**:
   ```bash
   npm install
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
   
   # Push schema to database (for development)
   npx prisma db push
   
   # Or run migrations (for production)
   npx prisma migrate dev
   
   # Seed the database with sample data
   npm run db:seed
   ```

4. **Start the development server**:
   ```bash
   npm run dev
   ```

The API will be available at `http://localhost:3001`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user and company
- `POST /api/auth/login` - Login user
- `GET /api/auth/verify` - Verify JWT token

### Jobs
- `GET /api/jobs` - Get public job listings
- `GET /api/jobs/:id` - Get single job
- `GET /api/jobs/company/all` - Get all company jobs (auth required)
- `POST /api/jobs` - Create job (auth required)
- `PUT /api/jobs/:id` - Update job (auth required)
- `DELETE /api/jobs/:id` - Delete job (auth required)

### Applications
- `POST /api/applications` - Submit application (public)
- `GET /api/applications` - Get company applications (auth required)
- `GET /api/applications/:id` - Get single application (auth required)
- `PUT /api/applications/:id` - Update application (auth required)

### Candidates
- `GET /api/candidates` - Get company candidates (auth required)
- `GET /api/candidates/:id` - Get single candidate (auth required)
- `PUT /api/candidates/:id` - Update candidate (auth required)
- `GET /api/candidates/pipeline/summary` - Get pipeline summary (auth required)

### Interviews
- `GET /api/interviews` - Get company interviews (auth required)
- `GET /api/interviews/:id` - Get single interview (auth required)
- `POST /api/interviews` - Create interview (auth required)
- `PUT /api/interviews/:id` - Update interview (auth required)
- `DELETE /api/interviews/:id` - Delete interview (auth required)

### Documents
- `GET /api/documents/application/:applicationId` - Get application documents (auth required)
- `POST /api/documents/upload/:applicationId` - Upload document (auth required)
- `GET /api/documents/:id` - Get document metadata (auth required)
- `GET /api/documents/:id/download` - Download document file (auth required)
- `PUT /api/documents/:id` - Update document metadata (auth required)
- `DELETE /api/documents/:id` - Delete document (auth required)

### Users
- `GET /api/users/profile` - Get current user profile (auth required)
- `PUT /api/users/profile` - Update user profile (auth required)
- `PUT /api/users/password` - Change password (auth required)
- `GET /api/users` - Get all company users (admin only)
- `POST /api/users` - Create user (admin only)
- `PUT /api/users/:id` - Update user (admin only)
- `DELETE /api/users/:id` - Delete user (admin only)

### Analytics
- `GET /api/analytics/dashboard` - Get dashboard analytics (auth required)
- `GET /api/analytics/funnel` - Get hiring funnel data (auth required)
- `GET /api/analytics/time-to-hire` - Get time-to-hire analytics (auth required)
- `GET /api/analytics/sources` - Get source effectiveness (auth required)

## Database Schema

The database includes the following main entities:

- **Companies**: Multi-tenant support
- **Users**: Authentication and role management
- **Jobs**: Job postings and management
- **Candidates**: Candidate information
- **Applications**: Job applications with rich metadata
- **Interviews**: Interview scheduling and management
- **Documents**: File uploads and management
- **Email Templates**: Customizable email templates

## Development

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema to database
- `npm run db:migrate` - Run database migrations
- `npm run db:seed` - Seed database with sample data
- `npm run db:studio` - Open Prisma Studio
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues

### Demo Data

The seed script creates:
- Demo company: "TalentSol Demo Company"
- Admin user: `admin@talentsol-demo.com` / `password123`
- Recruiter user: `recruiter@talentsol-demo.com` / `password123`
- Sample jobs, candidates, and applications

## Security Features

- JWT authentication with secure token handling
- Password hashing with bcryptjs
- Rate limiting to prevent abuse
- CORS configuration
- Helmet for security headers
- Input validation with Zod schemas
- SQL injection prevention with Prisma

## File Upload

Documents are stored locally in the `uploads/` directory. For production, consider integrating with cloud storage services like AWS S3 or Google Cloud Storage.

## Error Handling

The API includes comprehensive error handling with:
- Custom error classes
- Prisma error handling
- Validation error formatting
- Structured error responses
- Development vs production error details

## Contributing

1. Follow TypeScript best practices
2. Use Prisma for all database operations
3. Validate all inputs with Zod schemas
4. Include proper error handling
5. Add JSDoc comments for complex functions
6. Test API endpoints thoroughly
