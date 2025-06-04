@echo off
echo 🚀 Starting TalentSol ATS on port 8080...
echo.

echo 🔍 Checking for processes using port 8080...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8080 ^| findstr LISTENING') do (
    if not "%%a"=="0" (
        echo 🛑 Stopping process %%a
        taskkill /f /pid %%a >nul 2>&1
    )
)

echo ⏳ Waiting for port to be freed...
timeout /t 3 /nobreak >nul

echo 🚀 Starting TalentSol ATS...
npm run dev
