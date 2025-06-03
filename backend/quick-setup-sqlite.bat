@echo off
echo 🚀 Quick Setup with SQLite for TalentSol ATS
echo.

REM Backup original schema
echo 📋 Backing up original schema...
copy prisma\schema.prisma prisma\schema.postgresql.backup

REM Use SQLite schema
echo 🔄 Switching to SQLite schema...
copy prisma\schema.sqlite.prisma prisma\schema.prisma

REM Update .env for SQLite
echo 📝 Updating .env for SQLite...
echo # Database > .env.sqlite
echo DATABASE_URL="file:./dev.db" >> .env.sqlite
echo. >> .env.sqlite
echo # Server >> .env.sqlite
echo PORT=3001 >> .env.sqlite
echo NODE_ENV=development >> .env.sqlite
echo. >> .env.sqlite
echo # JWT >> .env.sqlite
echo JWT_SECRET=your-super-secret-jwt-key-change-this-in-production >> .env.sqlite
echo JWT_EXPIRES_IN=7d >> .env.sqlite
echo. >> .env.sqlite
echo # CORS >> .env.sqlite
echo CORS_ORIGIN=http://localhost:8080 >> .env.sqlite

REM Backup original .env and use SQLite version
copy .env .env.postgresql.backup
copy .env.sqlite .env

REM Generate Prisma client
echo 🔧 Generating Prisma client...
npx prisma generate

REM Push database schema
echo 📊 Creating SQLite database...
npx prisma db push

echo.
echo ✅ SQLite setup completed!
echo.
echo 📁 Files created:
echo    - dev.db (SQLite database)
echo    - .env (updated for SQLite)
echo.
echo 📁 Backups created:
echo    - prisma\schema.postgresql.backup
echo    - .env.postgresql.backup
echo.
echo 🎯 Next steps:
echo    1. Run: npm run import-csv
echo    2. Start backend: npm run dev
echo.
pause
