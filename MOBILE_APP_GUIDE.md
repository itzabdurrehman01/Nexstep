# NexStep AI — Mobile Application & APK Installation Guide

This guide explains how to run the NexStep mobile application on your physical mobile phone, how to use the Android Emulator, and how to build and install the standalone Android APK.

---

## 1. Quick Start: Run on Physical Phone (Live Development)

You can run the mobile application directly on your physical Android or iPhone in real-time with live reload:

### Step 1: Ensure Backend is Running
Double-click `START_NEXSTEP.bat` or run:
```bash
cd backend
npm run dev
```
*(The backend runs on port `3001` and is configured to listen on all network interfaces `0.0.0.0`)*

### Step 2: Connect Phone & PC to the Same Wi-Fi
Ensure your physical phone and PC are connected to the same Wi-Fi network.
Your host machine's Wi-Fi LAN IP is automatically configured:
```
http://192.168.100.13:3001
```

### Step 3: Launch Mobile Dev Server
Double-click:
```
START_MOBILE_PHYSICAL.bat
```
*(Or run `npx expo start --lan` inside the `mobile/` directory)*

### Step 4: Scan and Open on Your Phone
1. Install **Expo Go** from Google Play Store (Android) or Apple App Store (iOS).
2. Open Expo Go:
   - **Android**: Tap **Scan QR Code** and point your camera at the QR code in the terminal.
   - **iOS**: Open the native **Camera** app, scan the QR code, and tap the yellow banner to open in Expo Go.
3. The NexStep mobile application will load instantly on your physical phone!

---

## 2. Standalone Android APK (Build & Install)

If you want a standalone **`.apk`** file installed directly on your Android phone without Expo Go:

### Step 1: Build the APK (1-Click)
Double-click:
```
BUILD_APK.bat
```
This script:
- Automatically uses the Android Studio OpenJDK (`C:\Program Files\Android\Android Studio\jbr`)
- Uses the Android SDK (`C:\Users\abdur\AppData\Local\Android\Sdk`)
- Compiles the React Native application using Gradle
- Outputs the ready-to-use APK directly to:
  ```
  apks/NexStep.apk
  ```
- Automatically opens the `apks/` folder in Windows Explorer upon completion.

### Step 2: Install on Your Physical Phone

#### Option A: Automatic USB Install via ADB (Recommended)
1. On your Android phone, enable **Developer Options**:
   - Go to **Settings** > **About phone** > tap **Build number** 7 times.
2. In **Settings** > **Developer options**, enable **USB Debugging**.
3. Plug your phone into the PC with a USB cable (tap "Allow USB Debugging" on your phone screen).
4. Double-click:
   ```
   INSTALL_APK_ON_PHONE.bat
   ```
5. The script automatically installs and launches `NexStep.apk` on your phone!

#### Option B: Manual Transfer & Install
1. Copy `apks/NexStep.apk` to your phone via:
   - USB File Transfer (drag and drop into your phone's *Downloads* folder)
   - WhatsApp / Telegram / Google Drive / Email
2. On your phone, tap `NexStep.apk` in your Files/Downloads app.
3. Tap **Install** (if prompted, allow "Install from unknown sources").
4. Open the **NexStep** app from your phone's home screen!

---

## 3. Run in Physical / Android Virtual Device (Emulator)

If you wish to test in an Android Virtual Device (AVD):
Your system has pre-configured emulators:
- `Medium_Phone_API_30`
- `Resizable_Experimental_API_35`

To launch:
1. Start the mobile development server (`START_MOBILE_PHYSICAL.bat` or `npx expo start`).
2. Press **`a`** in the terminal to automatically launch the Android Emulator and open NexStep.

---

## 4. Website & Mobile Application Parity

The website has been upgraded to match the mobile application in every dimension:

1. **Progressive Web App (PWA) Standalone Installation**:
   - `frontend/public/manifest.json` configured with standalone display mode, orientation lock, splash background, and theme color `#10b981`.
   - On Chrome or Safari on your phone, tap **Add to Home screen** / **Install App** to run the website full-screen without any browser address bars.
2. **Mobile App Emulator Mode (`App View`)**:
   - A dedicated **App View** toggle button is present in the website navigation bar and in the sidebar.
   - Clicking it wraps the entire portal inside a realistic smartphone frame with a dynamic island/notch, home indicator, and responsive touch gestures.
3. **Mobile Bottom Navigation Dock (`MobileBottomNav.jsx`)**:
   - Floats cleanly at the bottom on all mobile devices and emulator views.
   - Role-aware tabs with center glowing pulse button for **AI Chatbot**.
   - Haptic vibration feedback (`navigator.vibrate`) and tactile Web Audio click simulation.
   - Slide-up bottom sheet drawer with quick search across all 30 portal modules.
4. **Unified Design System & Data Sync**:
   - Identical color tokens (Electric Emerald `#10b981`, Pearl light `#f6f8fc`, Midnight dark `#050810`).
   - Seamless dual authentication (Google OAuth 2.0 and Email OTP 6-digit pin).
   - Real-time profile and career roadmap synchronization between web and mobile endpoints.
