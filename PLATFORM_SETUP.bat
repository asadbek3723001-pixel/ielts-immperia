@echo off
setlocal enabledelayedexpansion

title IELTS Platform Setup Utility
color 0b

echo ============================================================
echo           IELTS PLATFORM - INSTALLATION ^& SETUP
echo ============================================================
echo.
echo [1/5] Checking Dependencies...
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed! Please install Node.js first.
    pause
    exit /b
)
echo [OK] Node.js is installed.

echo.
echo [2/5] Installing Backend Dependencies...
cd backend
if not exist .env (
    echo [INFO] Creating .env from .env.example...
    copy .env.example .env
)
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Backend installation failed!
    pause
    exit /b
)
echo [OK] Backend installed.

echo.
echo [3/5] Setting up Database...
call npx prisma generate
if %errorlevel% neq 0 (
    echo [ERROR] Prisma generation failed!
    pause
    exit /b
)
echo [OK] Prisma setup complete.

echo.
echo [4/5] Installing Frontend Dependencies...
cd ..\frontend
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Frontend installation failed!
    pause
    exit /b
)
echo [OK] Frontend installed.

echo.
echo [5/5] Finalizing...
echo ============================================================
echo.
echo Setup Completed Successfully!
echo.
echo To start the platform, please run 'START_PLATFORM.bat'.
echo.
pause

:: Create Start Script if not exists
echo @echo off > ..\START_PLATFORM.bat
echo title IELTS Platform Runners >> ..\START_PLATFORM.bat
echo echo Starting Backend... >> ..\START_PLATFORM.bat
echo start cmd /k "cd backend && npm run dev" >> ..\START_PLATFORM.bat
echo echo Starting Frontend... >> ..\START_PLATFORM.bat
echo start cmd /k "cd frontend && npm run dev" >> ..\START_PLATFORM.bat
echo echo All systems GO! >> ..\START_PLATFORM.bat
echo echo Backend: http://localhost:5000 >> ..\START_PLATFORM.bat
echo echo Frontend: http://localhost:5173 >> ..\START_PLATFORM.bat

exit /b
