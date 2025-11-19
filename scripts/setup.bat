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

:: Ensure Redis is running (for rate limiting + caching)
echo √ Ensuring Redis (localhost:6379) is running...
set "REDIS_READY=0"
call :check_redis_ready
if %errorlevel% equ 0 (
    echo   Redis already running.
    set "REDIS_READY=1"
) else (
    call :ensure_docker_ready
    if %errorlevel% equ 0 (
        call :start_redis_with_docker
        if %errorlevel% equ 0 (
            set "REDIS_READY=1"
        ) else (
            echo   Warning: Unable to launch Redis container (see messages above).
        )
    ) else (
        echo   Warning: Docker Desktop is not available. Redis will not be started automatically.
    )
)
if "%REDIS_READY%"=="0" (
    echo   Continuing without Redis (caching/rate-limits will use in-memory mode).
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

goto :eof

:ensure_docker_ready
where docker >nul 2>&1
if %errorlevel% neq 0 (
    echo   Docker CLI not found on PATH.
    exit /b 1
)
docker info >nul 2>&1
if %errorlevel% equ 0 (
    exit /b 0
)
echo   Docker Desktop is not running. Attempting to start it...
set "DOCKER_APP=%ProgramFiles%\Docker\Docker\Docker Desktop.exe"
if not exist "%DOCKER_APP%" (
    set "DOCKER_APP=%ProgramFiles% (x86)%\Docker\Docker\Docker Desktop.exe"
)
if exist "%DOCKER_APP%" (
    start "" "%DOCKER_APP%"
) else (
    echo   Unable to locate Docker Desktop executable. Please start Docker manually.
    exit /b 1
)
echo   Waiting for Docker daemon to be ready...
for /l %%i in (1,1,60) do (
    timeout /t 2 >nul
    docker info >nul 2>&1
    if !errorlevel! equ 0 (
        echo   Docker is ready.
        exit /b 0
    )
)
echo   Docker daemon did not become ready in time.
exit /b 1

:start_redis_with_docker
set "DOCKER_COMPOSE_CMD=docker compose"
docker compose version >nul 2>&1
if ERRORLEVEL 1 (
    where docker-compose >nul 2>&1
    if %errorlevel% equ 0 (
        set "DOCKER_COMPOSE_CMD=docker-compose"
    ) else (
        echo   docker compose command not available.
        exit /b 1
    )
)
echo   Starting Redis container using %DOCKER_COMPOSE_CMD%...
%DOCKER_COMPOSE_CMD% -f docker-compose.yml up -d redis
if %errorlevel% neq 0 (
    echo   Failed to run Redis container.
    exit /b 1
)
echo   Waiting for Redis service to become ready...
for /l %%i in (1,1,30) do (
    timeout /t 1 >nul
    call :check_redis_ready
    if !errorlevel! equ 0 (
        echo   Redis container is online!
        exit /b 0
    )
)
echo   Redis container failed to respond in time.
exit /b 1

:check_redis_ready
set "POWERSHELL_EXE=%SystemRoot%\System32\WindowsPowerShell\v1.0\powershell.exe"
if not exist "%POWERSHELL_EXE%" (
    set "POWERSHELL_EXE=powershell"
)
"%POWERSHELL_EXE%" -NoLogo -NoProfile -Command ^
  "try { $client = New-Object Net.Sockets.TcpClient('localhost',6379); $client.Close(); exit 0 } catch { exit 1 }" >nul 2>&1
exit /b %errorlevel%
