@echo off
setlocal EnableDelayedExpansion

:: ============================================================
:: NexStep — AI Career & Education Guidance Platform Launcher
:: ASCII-safe, dynamic port selection & verification launcher
:: ============================================================

title NexStep Launcher

set "ROOT=%~dp0"
if "%ROOT:~-1%"=="\" set "ROOT=%ROOT:~0,-1%"

echo.
echo ============================================================
echo   NexStep - AI Career and Education Platform
echo ============================================================
echo [INFO] Project Root: %ROOT%
echo.

cd /d "%ROOT%"

:: Check Node.js
node --version >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Node.js is not installed or not in PATH.
    echo Please install Node.js 18+ from https://nodejs.org
    echo.
    pause
    exit /b 1
)
for /f "tokens=*" %%v in ('node --version 2^>nul') do echo [OK] Node.js detected: %%v

:: Check npm
call npm.cmd --version >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [ERROR] npm is not available.
    echo.
    pause
    exit /b 1
)
for /f "tokens=*" %%v in ('call npm.cmd --version 2^>nul') do echo [OK] npm detected: v%%v

:: Check backend project structure
if not exist "%ROOT%\backend\package.json" (
    echo [ERROR] backend\package.json not found at %ROOT%\backend
    echo.
    pause
    exit /b 1
)

:: Check frontend project structure
if not exist "%ROOT%\frontend\package.json" (
    echo [ERROR] frontend\package.json not found at %ROOT%\frontend
    echo.
    pause
    exit /b 1
)

:: Check mobile project structure (warning only)
if not exist "%ROOT%\mobile\package.json" (
    echo [WARN] mobile\package.json not found at %ROOT%\mobile
) else (
    echo [OK] Mobile workspace found.
)

echo [OK] Directory structure verified.

:: Create backend .env if missing
if not exist "%ROOT%\backend\.env" (
    if exist "%ROOT%\backend\.env.example" (
        copy "%ROOT%\backend\.env.example" "%ROOT%\backend\.env" >nul 2>&1
        echo [INFO] Created backend\.env from template.
    )
)

:: Ensure backend dependencies exist
if not exist "%ROOT%\backend\node_modules" (
    echo.
    echo [INFO] Installing backend dependencies...
    cd /d "%ROOT%\backend"
    call npm.cmd install
    if %ERRORLEVEL% neq 0 (
        echo [ERROR] Backend installation failed.
        echo.
        pause
        exit /b 1
    )
    echo [OK] Backend dependencies installed.
)

:: Ensure frontend dependencies exist
if not exist "%ROOT%\frontend\node_modules" (
    echo.
    echo [INFO] Installing frontend dependencies...
    cd /d "%ROOT%\frontend"
    call npm.cmd install
    if %ERRORLEVEL% neq 0 (
        echo [ERROR] Frontend installation failed.
        echo.
        pause
        exit /b 1
    )
    echo [OK] Frontend dependencies installed.
)

echo.
echo [INFO] Detecting available backend port starting at 3001...
set "BACKEND_PORT=3001"
for /f "tokens=*" %%i in ('node "%ROOT%\scripts\find_port.js" 3001') do set "BACKEND_PORT=%%i"

if "%BACKEND_PORT%"=="" set "BACKEND_PORT=3001"
echo [OK] Selected Backend Port: %BACKEND_PORT%

echo [INFO] Detecting available frontend port starting at 5173...
set "FRONTEND_PORT=5173"
for /f "tokens=*" %%i in ('node "%ROOT%\scripts\find_port.js" 5173') do set "FRONTEND_PORT=%%i"

if "%FRONTEND_PORT%"=="" set "FRONTEND_PORT=5173"
echo [OK] Selected Frontend Port: %FRONTEND_PORT%

echo.
echo ============================================================
echo   Starting NexStep Backend (Port %BACKEND_PORT%)...
echo ============================================================

start "NexStep Backend" cmd /k "cd /d ""%ROOT%\backend"" && set PORT=%BACKEND_PORT% && npm.cmd run dev"

echo.
echo ============================================================
echo   Starting NexStep Frontend (Port %FRONTEND_PORT%)...
echo ============================================================

start "NexStep Frontend" cmd /k "cd /d ""%ROOT%\frontend"" && set VITE_API_URL=http://localhost:%BACKEND_PORT% && set VITE_PORT=%FRONTEND_PORT% && npm.cmd run dev"

echo.
echo [INFO] Verifying backend status at http://localhost:%BACKEND_PORT%/api/health...
node "%ROOT%\scripts\check_health.js" %BACKEND_PORT% /api/health 30

if %ERRORLEVEL% neq 0 (
    echo.
    echo [ERROR] Backend failed health check at http://localhost:%BACKEND_PORT%/api/health
    echo Please check the "NexStep Backend" terminal window for error messages.
    echo.
    pause
    exit /b 1
)

echo.
echo [INFO] Verifying frontend status at http://localhost:%FRONTEND_PORT%...
node "%ROOT%\scripts\check_health.js" %FRONTEND_PORT% / 30

if %ERRORLEVEL% neq 0 (
    echo.
    echo [ERROR] Frontend failed to load at http://localhost:%FRONTEND_PORT%
    echo Please check the "NexStep Frontend" terminal window for error messages.
    echo.
    pause
    exit /b 1
)

echo.
echo ============================================================
echo   NexStep is Running Successfully!
echo ============================================================
echo.
echo   Frontend URL: http://localhost:%FRONTEND_PORT%
echo   Backend URL:  http://localhost:%BACKEND_PORT%
echo   API Health:   http://localhost:%BACKEND_PORT%/api/health
echo.
echo   Opening web browser at http://localhost:%FRONTEND_PORT%...
echo ============================================================
echo.

start "" "http://localhost:%FRONTEND_PORT%"

echo Keep the Backend and Frontend terminal windows open.
echo This launcher window can now be safely closed.
echo.
ping 127.0.0.1 -n 6 >nul
exit /b 0