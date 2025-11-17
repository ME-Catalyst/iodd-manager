@echo off
setlocal enabledelayedexpansion
title GreenStack - Quick Setup

:: Change to project root directory
cd /d "%~dp0\.."

echo ╔══════════════════════════════════════════════════════════════╗
echo ║                 GREENSTACK - QUICK SETUP                     ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.

:: Check Python installation
echo √ Checking Python installation...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo X Python is not installed. Please install Python 3.8+ first.
    echo   Download from: https://www.python.org/downloads/
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('python --version') do echo   Found: %%i
echo.

:: Install dependencies
echo √ Installing Python dependencies...
python -m pip install -r requirements.txt >nul 2>&1
if %errorlevel% equ 0 (
    echo   Dependencies installed!
) else (
    echo   Installing dependencies with output...
    python -m pip install -r requirements.txt
    if %errorlevel% neq 0 (
        echo X Failed to install dependencies!
        pause
        exit /b 1
    )
)
echo.


:: Launch the application
echo √ Launching GreenStack...
echo.
echo ══════════════════════════════════════════════════════════════
echo   The application will start in a moment...
echo   • API Server: http://localhost:8000
echo   • Web Interface: http://localhost:5173 (or next available port)
echo   • API Documentation: http://localhost:8000/docs
echo ══════════════════════════════════════════════════════════════
echo.
echo Press Ctrl+C to stop the application
echo.

:: Start the application
:: Note: The Python script will auto-detect and use the next available port
python -m src.start --frontend-port 5173
if %errorlevel% neq 0 (
    echo.
    echo X Application failed to start! See errors above.
    pause
    exit /b 1
)
