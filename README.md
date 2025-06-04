# kanarek.pl

## Android Branch: `feature/my-android-app`

This branch contains the development for the Android application of the kanarek.pl project.

---

## Overview
The Android app for kanarek.pl is designed to help users interact with the platform via a native mobile experience. Its main focus is to allow users to:
- Report the presence of ticket inspectors ("kanary") in public transport vehicles.
- Search for public transport vehicles and stops.
- View and interact with a map of the city, including key transport locations.
- Register, log in, and manage their account securely.

---

## Main Features

### 1. **User Authentication**
- **Login:** Users can log in with their email and password. (API integration planned)
- **Register:** New users can create an account with username, email, and password.
- **Forgot Password:** Users can reset their password if forgotten.

### 2. **Home Screen**
- Entry point with navigation to Login, Register, and Map screens.

### 3. **Map & Vehicle Search**
- **MapActivity:**
  - Displays a Google Map with key public transport stations.
  - Users can search for stations and zoom to their location.
  - Users can initiate a process to find the nearest vehicle based on their location.
  - The app communicates with the backend to find vehicles and display their details.
  - Users can confirm and report a vehicle if an inspector is present.

### 4. **Reporting Inspectors**
- **ReportActivity & MapActivity:**
  - Users can submit reports about inspectors on specific lines and stops.
  - Reports are sent to the backend for processing and sharing with other users.

### 5. **API Integration**
- The app uses Retrofit to communicate with the backend server.
- Main endpoints:
  - `/inspector/find-vehicle` — Find a vehicle based on user location.
  - `/inspector/report` — Report a vehicle with an inspector.
- Data models include `Vehicle`, `LocationData`, and `ReportRequest`.

---

## User Flow
1. **Open the app:** Arrive at the Home screen.
2. **Register or Login:** Access your account or create a new one.
3. **Navigate to the Map:** Use the map to search for stations or find vehicles.
4. **Report Inspectors:** Use the report button to submit sightings of inspectors.
5. **Password Recovery:** Use the forgot password feature if needed.

---

## How to Use This Branch
1. **Checkout the branch:**
   ```sh
   git checkout feature/my-android-app
   ```
2. **Open the project in Android Studio** (or your preferred IDE).
3. **Build and run the app** on an emulator or physical device.
4. **Test features:** Try logging in, registering, searching for vehicles, and reporting inspectors.

---

## Technical Details
- **Language:** Java
- **Frameworks:** Android SDK, Google Maps, Retrofit
- **Backend:** Communicates with a REST API (see backend/README.md for details)
- **Permissions:** Requires location permissions for map and vehicle search features.
- **UI:** Uses standard Android layouts and Material Design components.

---

## Contribution & Development
- Please make sure you are on the `feature/my-android-app` branch before making changes.
- Follow standard commit and pull request practices.
- The app is a work in progress; features and UI may change frequently.
- If you encounter issues, please open an issue or contact the maintainers.

---

For backend and frontend documentation, see the respective `backend/README.md` and `frontend/` directories. 
