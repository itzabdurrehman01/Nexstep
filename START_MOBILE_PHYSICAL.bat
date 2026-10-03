@echo off
setlocal EnableDelayedExpansion

title NexStep — Run Mobile App on Physical Phone / Emulator

echo ============================================================
echo   NexStep AI — Mobile App Live Development Server
echo ============================================================
echo.

set "ROOT=%~dp0"
if "%ROOT:~-1%"=="\" set "ROOT=%ROOT:~0,-1%"
set "MOBILE_DIR=%ROOT%\mobile"

:: Detect local WiFi IPv4 address automatically
set "LAN_IP="
for /f "tokens=4" %%a in ('route print ^| findstr 0.0.0.0 ^| findstr /v "0.0.0.0.*0.0.0.0"') do (
    if not defined LAN_IP (
        set "LAN_IP=%%a"
    )
)

if not defined LAN_IP (
    set "LAN_IP=192.168.100.13"
)

echo [OK] Detected Host Machine LAN IP: %LAN_IP%
echo [OK] Updating mobile/.env API URL: http://%LAN_IP%:3001
echo.

(
  echo # NexStep Mobile — Auto-configured for Physical Device
  echo EXPO_PUBLIC_API_URL=http://%LAN_IP%:3001
  echo EXPO_PUBLIC_ENV=development
) > "%MOBILE_DIR%\.env"

echo ============================================================
echo   HOW TO RUN ON YOUR PHYSICAL MOBILE PHONE:
echo.
echo   1. Connect your phone to the SAME Wi-Fi network as this PC:
echo      PC Wi-Fi IP: %LAN_IP%
echo.
echo   2. On your Android or iPhone:
echo      Install 'Expo Go' from Google Play Store or Apple App Store.
echo.
echo   3. When the QR code appears below:
echo      - Android: Open 'Expo Go' and tap 'Scan QR Code'.
echo      - iOS: Open the standard Camera app and scan the QR code.
echo.
echo   4. If you have an Android emulator or USB phone connected:
echo      Press 'a' in the console below to launch automatically!
echo.
echo   NOTE: Ensure your backend server is running on port 3001
echo ============================================================
echo.

cd /d "%MOBILE_DIR%"
call npx expo start --lan

pause
