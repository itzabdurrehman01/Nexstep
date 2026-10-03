@echo off
setlocal EnableDelayedExpansion

:: ============================================================
:: NexStep — Mobile Development Server Launcher
::
:: Starts the React Native / Expo development server.
::
:: Requirements:
::   - Node.js 18+ on PATH
::   - npm installed
::   - Android Studio (for Android emulator) OR
::     Expo Go app installed on your phone
::   - Backend server running (START_NEXSTEP.bat)
::
:: IMPORTANT — API URL for physical device:
::   Edit mobile/.env and set EXPO_PUBLIC_API_URL to your
::   machine's LAN IP address, e.g.:
::     EXPO_PUBLIC_API_URL=http://192.168.1.x:3001
::   Find your IP with: ipconfig (look for IPv4 Address)
::
:: Android emulator uses 10.0.2.2:3001 automatically.
:: ============================================================

title NexStep — Mobile Launcher

set "ROOT=%~dp0"
if "%ROOT:~-1%"=="\" set "ROOT=%ROOT:~0,-1%"
set "MOBILE_DIR=%ROOT%\mobile"

echo.
echo  ============================================================
echo   NexStep — Mobile Development Server
echo   React Native / Expo
echo  ============================================================
echo.

:: Check Node.js
node --version >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo  ERROR: Node.js not found. Install from https://nodejs.org
    pause
    exit /b 1
)
for /f "tokens=*" %%v in ('node --version 2^>nul') do echo  OK: Node.js %%v

:: Check mobile directory
if not exist "%MOBILE_DIR%\package.json" (
    echo.
    echo  ERROR: mobile/package.json not found.
    echo  Expected at: %MOBILE_DIR%
    echo.
    pause
    exit /b 1
)
echo  OK: Mobile project found at %MOBILE_DIR%

:: Check for mobile .env
if not exist "%MOBILE_DIR%\.env" (
    echo.
    echo  NOTE: mobile/.env not found.
    echo  Copying mobile/.env.example to mobile/.env
    copy "%MOBILE_DIR%\.env.example" "%MOBILE_DIR%\.env" >nul 2>&1
    echo.
    echo  IMPORTANT: Edit mobile/.env and set your machine's LAN IP:
    echo    EXPO_PUBLIC_API_URL=http://YOUR_LAN_IP:3001
    echo.
    echo  Find your LAN IP by running: ipconfig
    echo  Look for IPv4 Address under your WiFi/Ethernet adapter.
    echo.
    pause
)

:: Install mobile dependencies if needed
if not exist "%MOBILE_DIR%\node_modules" (
    echo.
    echo  Installing mobile dependencies (first run — takes a few minutes)...
    cd /d "%MOBILE_DIR%"
    npm install
    if %ERRORLEVEL% neq 0 (
        echo  ERROR: npm install failed in mobile/
        pause
        exit /b 1
    )
    echo  OK: Mobile dependencies installed
) else (
    echo  OK: Mobile node_modules present
)

:: Show instructions
echo.
echo  ============================================================
echo   Starting Expo Metro bundler...
echo.
echo   Scan the QR code with:
echo     - Expo Go app (iOS/Android) on the same WiFi network
echo     - OR press 'a' for Android emulator (needs Android Studio)
echo     - OR press 'i' for iOS simulator (needs macOS + Xcode)
echo.
echo   Make sure the NexStep backend is running first!
echo   Backend: http://localhost:3001
echo.
echo   Press Ctrl+C to stop the bundler.
echo  ============================================================
echo.

cd /d "%MOBILE_DIR%"
npx expo start

pause
