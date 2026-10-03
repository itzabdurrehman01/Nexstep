@echo off
setlocal EnableDelayedExpansion

title NexStep — Install APK on Physical Phone

echo ============================================================
echo   NexStep AI — Physical Phone APK Installer (ADB)
echo ============================================================
echo.

set "ROOT=%~dp0"
if "%ROOT:~-1%"=="\" set "ROOT=%ROOT:~0,-1%"
set "APK_PATH=%ROOT%\apks\NexStep.apk"
set "ADB_PATH=C:\Users\%USERNAME%\AppData\Local\Android\Sdk\platform-tools\adb.exe"

if not exist "%ADB_PATH%" (
    set "ADB_PATH=adb.exe"
)

:: Check if APK exists
if not exist "%APK_PATH%" (
    set "FALLBACK_APK=%ROOT%\mobile\android\app\build\outputs\apk\debug\app-debug.apk"
    if exist "!FALLBACK_APK!" (
        set "APK_PATH=!FALLBACK_APK!"
    ) else (
        echo [ERROR] NexStep.apk not found in %ROOT%\apks\
        echo Please run BUILD_APK.bat first to generate the APK!
        echo.
        pause
        exit /b 1
    )
)

echo [OK] Target APK: %APK_PATH%
echo.
echo Checking connected devices...
echo.

"%ADB_PATH%" devices

echo.
echo ============================================================
echo   INSTRUCTIONS FOR PHYSICAL PHONE:
echo     1. On your Android phone, enable 'Developer Options':
echo        Settings -> About Phone -> Tap 'Build Number' 7 times.
echo     2. Go to Settings -> Developer Options -> Enable 'USB Debugging'.
echo     3. Connect your phone to this PC via USB cable.
echo     4. If prompted on your phone, tap 'Allow USB Debugging'.
echo ============================================================
echo.
pause

echo.
echo Installing NexStep APK to device...
"%ADB_PATH%" install -r "%APK_PATH%"

if %ERRORLEVEL% equ 0 (
    echo.
    echo ============================================================
    echo   INSTALLATION SUCCESSFUL!
    echo ============================================================
    echo.
    echo Launching NexStep on your phone...
    "%ADB_PATH%" shell monkey -p pk.edu.airuni.nexstep -c android.intent.category.LAUNCHER 1
    echo.
    echo NexStep is now running on your physical mobile phone!
) else (
    echo.
    echo [ERROR] Installation failed.
    echo Make sure your phone is unlocked and authorized with USB debugging enabled.
)

echo.
pause
