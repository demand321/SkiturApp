# SkiturApp - Development Environment Setup

This guide covers setting up the development environment on **Linux** and **Windows**.

---

## Prerequisites

| Tool | Version | Purpose |
|------|---------|---------|
| Node.js | 20.x LTS or later | JavaScript runtime |
| npm | 10.x+ (bundled with Node) | Package manager |
| Git | 2.x+ | Version control |
| Expo CLI | (via npx) | React Native build tooling |
| Firebase CLI | Latest | Firestore rules deployment |
| Wrangler CLI | Latest | Cloudflare Pages deployment |
| Android Studio | Latest | Android emulator & SDK (optional) |
| Xcode | Latest | iOS simulator (macOS only) |

---

## 1. Linux Setup (Ubuntu/Debian)

### 1.1 Install Node.js

```bash
# Using NodeSource (recommended)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify
node --version   # v20.x.x
npm --version    # 10.x.x
```

Alternatively, use [nvm](https://github.com/nvm-sh/nvm):

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
source ~/.bashrc
nvm install 20
nvm use 20
```

### 1.2 Install Git

```bash
sudo apt-get install -y git
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

### 1.3 Install Firebase CLI

```bash
npm install -g firebase-tools
firebase login
```

### 1.4 Install Wrangler CLI (Cloudflare Pages)

```bash
npm install -g wrangler
wrangler login
```

### 1.5 Android Development (Optional)

```bash
# Install Java JDK
sudo apt-get install -y openjdk-17-jdk

# Install Android Studio
# Download from https://developer.android.com/studio
# Extract and run: ./studio.sh

# Set environment variables (add to ~/.bashrc)
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

In Android Studio:
1. Open SDK Manager
2. Install Android SDK 34 (or latest)
3. Install Android SDK Build-Tools
4. Create an AVD (Android Virtual Device) via AVD Manager

### 1.6 Expo Go (Phone Testing)

Install **Expo Go** from Google Play Store or Apple App Store on your phone for quick testing without a full native build.

---

## 2. Windows Setup

### 2.1 Install Node.js

Download and run the LTS installer from [nodejs.org](https://nodejs.org/).

Or use [winget](https://learn.microsoft.com/en-us/windows/package-manager/winget/):

```powershell
winget install OpenJS.NodeJS.LTS
```

Or use [nvm-windows](https://github.com/coreybutler/nvm-windows):

```powershell
# After installing nvm-windows:
nvm install 20
nvm use 20
```

Verify:

```powershell
node --version   # v20.x.x
npm --version    # 10.x.x
```

### 2.2 Install Git

```powershell
winget install Git.Git
```

Or download from [git-scm.com](https://git-scm.com/download/win).

```powershell
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

### 2.3 Install Firebase CLI

```powershell
npm install -g firebase-tools
firebase login
```

### 2.4 Install Wrangler CLI

```powershell
npm install -g wrangler
wrangler login
```

### 2.5 Android Development (Optional)

1. Download and install [Android Studio](https://developer.android.com/studio)
2. During setup, install Android SDK 34+ and build tools
3. Set environment variables:
   - `ANDROID_HOME` = `%LOCALAPPDATA%\Android\Sdk`
   - Add to PATH: `%ANDROID_HOME%\emulator` and `%ANDROID_HOME%\platform-tools`
4. Create an AVD via Android Studio's AVD Manager

### 2.6 WSL (Optional, Recommended)

For a Linux-like experience on Windows, use WSL2:

```powershell
wsl --install -d Ubuntu
```

Then follow the **Linux Setup** instructions inside WSL. Expo tunnel mode works well from WSL.

---

## 3. Clone and Install

```bash
# Clone the repository
git clone https://github.com/knsorensen/SkiturApp.git
cd SkiturApp

# Install dependencies
npm install
```

### 3.1 Environment Variables

Create a `.env` file in the project root:

```bash
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=<your-google-maps-api-key>
```

Ask the project owner for the API key, or create your own in the [Google Cloud Console](https://console.cloud.google.com/) with the Maps SDK for Android/iOS enabled.

### 3.2 Firebase Configuration

The Firebase config is hardcoded in `src/services/firebase.ts` for the shared project (`skiturapp-94a50`). No additional setup is needed to connect to the existing backend.

To deploy Firestore rules:

```bash
firebase deploy --only firestore:rules --project skiturapp-94a50
```

---

## 4. Running the App

### Development Server

```bash
# Start Expo dev server (default)
npx expo start

# Web browser
npx expo start --web

# Tunnel mode (test on phone from VM or remote machine)
npx expo start --tunnel

# Run on Android device/emulator
npx expo run:android

# Run on iOS simulator (macOS only)
npx expo run:ios
```

### Testing

```bash
# Run unit tests
npm test

# Type check
npx tsc --noEmit

# Lint
npm run lint

# Format code
npm run format
```

### Deploying to Cloudflare Pages

```bash
# Build web bundle
npm run build:web

# Deploy to Cloudflare Pages
npx wrangler pages deploy dist/ --project-name=skiturapp
```

---

## 5. Platform-Specific Notes

### Web

- Maps are **not available** on web. A stub (`react-native-maps.web.js`) replaces `react-native-maps` via `metro.config.js`.
- All other features (trips, chat, photos, weather, shopping list) work on web.

### Android

- Google Maps requires the API key in `.env`.
- Background GPS tracking uses `expo-location` + `expo-task-manager`.
- Camera/photo picker uses `expo-image-picker`.

### iOS

- Requires macOS with Xcode installed.
- Apple Maps is used by default (no API key needed).
- Background location must be configured in Xcode capabilities.

---

## 6. Troubleshooting

| Problem | Solution |
|---------|----------|
| `expo start` fails with port in use | Kill the process on port 8081: `lsof -ti:8081 \| xargs kill` (Linux) or `netstat -ano \| findstr :8081` then `taskkill /PID <pid> /F` (Windows) |
| Android emulator not detected | Ensure `adb devices` lists your device. Restart ADB: `adb kill-server && adb start-server` |
| Maps blank on Android | Verify Google Maps API key in `.env` and that Maps SDK is enabled in Google Cloud Console |
| `npm install` fails on native modules | Delete `node_modules` and `package-lock.json`, then run `npm install` again |
| Firebase permission denied | Ensure you're logged in (`firebase login`) and have access to the `skiturapp-94a50` project |
| Wrangler deploy fails | Ensure you're logged in (`wrangler login`) and have access to the `skiturapp` Pages project |
| Tunnel mode not working | Install `@expo/ngrok` globally: `npm install -g @expo/ngrok` |
