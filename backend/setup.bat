@echo off
echo 🚀 Setting up TalentSol ATS Backend...

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18 or higher.
    pause
    exit /b 1
)

echo ✅ Node.js detected

REM Install dependencies
echo 📦 Installing dependencies...
npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)

echo ✅ Dependencies installed

REM Check if .env file exists
if not exist ".env" (
    echo 📝 Creating .env file from template...
    copy .env.example .env
    echo ⚠️  Please edit .env file with your database connection string and other settings
    echo    Example: DATABASE_URL="postgresql://username:password@localhost:5432/talentsol_ats"
    echo.
    echo    Required settings:
    echo    - DATABASE_URL: PostgreSQL connection string
    echo    - JWT_SECRET: Secret key for JWT tokens
    echo.
    pause
)

REM Generate Prisma client
echo 🔧 Generating Prisma client...
npx prisma generate
if %errorlevel% neq 0 (
    echo ❌ Failed to generate Prisma client
    pause
    exit /b 1
)

echo ✅ Prisma client generated

REM Check database connection
echo 🔍 Checking database connection...
npx prisma db push --accept-data-loss
if %errorlevel% neq 0 (
    echo ❌ Failed to connect to database or push schema
    echo    Please check your DATABASE_URL in .env file
    echo    Make sure PostgreSQL is running and the database exists
    pause
    exit /b 1
)

echo ✅ Database schema pushed successfully

REM Seed the database
echo 🌱 Seeding database with demo data...
npm run db:seed
if %errorlevel% neq 0 (
    echo ❌ Failed to seed database
    pause
    exit /b 1
)

echo ✅ Database seeded with demo data

echo.
echo 🎉 Setup completed successfully!
echo.
echo 📧 Demo login credentials:
echo    Admin: admin@talentsol-demo.com / password123
echo    Recruiter: recruiter@talentsol-demo.com / password123
echo.
echo 🚀 To start the backend server:
echo    npm run dev
echo.
echo 📊 To open Prisma Studio (database GUI):
echo    npm run db:studio
echo.
echo 🔗 API will be available at: http://localhost:3001
echo    Health check: http://localhost:3001/health

pause
