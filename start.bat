@echo off
echo ====================================
echo   Care Connect Pro - Quick Start
echo ====================================
echo.

REM Check if node_modules exists
if not exist "node_modules\" (
    echo [1/2] Installing dependencies...
    call npm install
    if errorlevel 1 (
        echo.
        echo ERROR: Failed to install dependencies
        pause
        exit /b 1
    )
) else (
    echo [1/2] Dependencies already installed (skipping)
)

echo.
echo [2/2] Starting development server...
echo.
echo The app will be available at: http://localhost:5173
echo Press Ctrl+C to stop the server
echo.

call npm run dev
