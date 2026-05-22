# Standalone Offline-First Notes App

A clean, responsive, and completely offline-first React Native Notes application. Built with React Native, Expo, React Navigation, and AsyncStorage for local data persistence.

## Features

- **Notes List Screen:** A sleek layout displaying all saved notes with titles and body previews.
- **Create & Edit Notes:** A dedicated form page with inputs for titles and full-text bodies.
- **Delete Confirmation:** Easily remove notes via a secure prompt to prevent accidental data loss.
- **Local Persistence:** Data is retained locally on the device using AsyncStorage. It functions entirely without an active internet connection.
- **Clean UI Design:** Follows a modern slate/blue styling guideline with appropriate typography, spacing, and safe-area compatibility.

## Tech Stack

- **Framework:** React Native (Expo SDK 54)
- **Navigation:** `@react-navigation/native` & `@react-navigation/native-stack`
- **Local Storage:** `@react-native-async-storage/async-storage`

## Getting Started

### Prerequisites

Make sure you have Node.js and the Android/iOS development environments configured.

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/junaidansari096/notes-App-Offline.git
   cd notes-App-Offline
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Running the App

To start the Metro bundler and run the application:

```bash
# Start Metro bundler
npm run start

# Run on Android
npm run android

# Run on iOS (macOS required)
npm run ios
```

### Building the Standalone APK (Android)

To compile the production-ready standalone Release APK locally:

1. Ensure a valid JDK is configured (e.g. from Android Studio's bundled JDK).
2. Generate the APK:
   ```bash
   cd android
   ./gradlew assembleRelease
   ```
3. Find your built APK at:
   `android/app/build/outputs/apk/release/app-release.apk`

---

## Written Decision Brief

The shortlisting assessment written brief has been compiled into a PDF. You can view the document here:
- [Decision_Brief.pdf](Decision_Brief.pdf)

### Brief Summary of Answers:
- **Storage Choice:** AsyncStorage was selected for its flat, simple key-value structure which perfectly meets the requirements of a standalone, offline prototype without the over-engineering of SQLite or WatermelonDB.
- **The Conflict Problem:** In a simulated multi-device sync environment, my current implementation fails under a "last write wins" strategy. Adding character-by-character synchronization would require moving to an SQLite transaction-log architecture (like CRDTs), costing bundle size and complexity.
- **First Production Failure Mode:** As notes scale into hundreds, parsing/stringifying the entire JSON array on the JavaScript thread will block the UI and cause dropped frames. The fix is database normalization or migrating to SQLite pagination (LIMIT/OFFSET).
