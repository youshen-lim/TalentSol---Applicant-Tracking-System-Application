#!/bin/bash

# TalentSol ATS Backend Setup Script
echo "🚀 Setting up TalentSol ATS Backend..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18 or higher."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18 or higher is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed"

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "⚠️  Please edit .env file with your database connection string and other settings"
    echo "   Example: DATABASE_URL=\"postgresql://username:password@localhost:5432/talentsol_ats\""
    echo ""
    echo "   Required settings:"
    echo "   - DATABASE_URL: PostgreSQL connection string"
    echo "   - JWT_SECRET: Secret key for JWT tokens"
    echo ""
    read -p "Press Enter after you've configured the .env file..."
fi

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

if [ $? -ne 0 ]; then
    echo "❌ Failed to generate Prisma client"
    exit 1
fi

echo "✅ Prisma client generated"

# Check database connection
echo "🔍 Checking database connection..."
npx prisma db push --accept-data-loss

if [ $? -ne 0 ]; then
    echo "❌ Failed to connect to database or push schema"
    echo "   Please check your DATABASE_URL in .env file"
    echo "   Make sure PostgreSQL is running and the database exists"
    exit 1
fi

echo "✅ Database schema pushed successfully"

# Seed the database
echo "🌱 Seeding database with demo data..."
npm run db:seed

if [ $? -ne 0 ]; then
    echo "❌ Failed to seed database"
    exit 1
fi

echo "✅ Database seeded with demo data"

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "📧 Demo login credentials:"
echo "   Admin: admin@talentsol-demo.com / password123"
echo "   Recruiter: recruiter@talentsol-demo.com / password123"
echo ""
echo "🚀 To start the backend server:"
echo "   npm run dev"
echo ""
echo "📊 To open Prisma Studio (database GUI):"
echo "   npm run db:studio"
echo ""
echo "🔗 API will be available at: http://localhost:3001"
echo "   Health check: http://localhost:3001/health"
