# SkiturApp — Project Plan

## Phase Overview

| Phase | Name                        | Description                                    |
|-------|-----------------------------|------------------------------------------------|
| 1     | Foundation                  | Project setup, auth, navigation, basic UI      |
| 2     | Trip Management             | Create/edit trips, invitations, participant mgmt |
| 3     | Maps & GPS Tracking         | Mapbox integration, live GPS, offline tracking |
| 4     | Photos                      | Camera, geotag, upload, gallery                |
| 5     | Chat                        | Real-time messaging per trip                   |
| 6     | Weather & Notifications     | Yr.no integration, push notifications          |
| 7     | Shopping List & History      | Shopping list, trip archive, statistics         |
| 8     | Offline & Polish            | Offline sync, offline maps, UX polish          |
| 9     | Testing & Launch            | Testing, beta, app store submission            |

---

## Phase 1: Foundation

**Goal:** Runnable app with authentication and navigation skeleton.

### Tasks

- [ ] Initialize Expo project with TypeScript template
- [ ] Configure ESLint, Prettier
- [ ] Set up Firebase project (dev environment)
- [ ] Configure Firebase Auth (email, Google, Apple)
- [ ] Build sign-in / sign-up screens
- [ ] Build email verification flow
- [ ] Set up React Navigation (bottom tabs + stack navigators)
- [ ] Create screen shells: Home, Trips, Map, Profile
- [ ] Set up Zustand store for auth state
- [ ] Configure EAS Build for dev builds on Android & iOS

### Deliverable
App boots, user can register/sign in, navigate between empty screens.

---

## Phase 2: Trip Management

**Goal:** Users can create trips and invite others.

### Tasks

- [ ] Design Firestore data model for trips
- [ ] Write Firestore security rules for trips
- [ ] Build "Create Trip" screen (title, description, date picker, location picker)
- [ ] Build trip list screen (upcoming, active, completed tabs)
- [ ] Build trip detail screen
- [ ] Implement participant management (add/remove)
- [ ] Build invite flow — search existing users
- [ ] Build invite flow — SMS/link invite for non-users
- [ ] Set up Firebase Dynamic Links for deep linking
- [ ] Build invite acceptance flow (deep link → register → join trip)
- [ ] Cloud Function: sendTripInviteSMS

### Deliverable
Users can create trips, invite friends (existing and new), and manage participants.

---

## Phase 3: Maps & GPS Tracking

**Goal:** Real-time GPS tracking with map display.

### Tasks

- [ ] Integrate Mapbox GL with topographic style
- [ ] Build map screen with user's current location
- [ ] Implement location picker for trip creation
- [ ] Set up background GPS tracking (expo-location)
- [ ] Create local SQLite database for GPS track points
- [ ] Implement track point recording (5s interval)
- [ ] Build batch sync: SQLite → Firestore (30s interval)
- [ ] Display live route polyline on map
- [ ] Display participant positions as markers
- [ ] Handle reconnection: upload queued GPS points
- [ ] Implement battery-aware tracking (reduce accuracy on low battery)
- [ ] Add foreground service notification (Android)
- [ ] Build trip start/stop controls

### Deliverable
Users can start a trip and see their route drawn on the map in real-time. Works offline.

---

## Phase 4: Photos

**Goal:** Capture, geotag, and share photos within a trip.

### Tasks

- [ ] Integrate expo-camera for in-app photo capture
- [ ] Auto-geotag photos with current GPS position
- [ ] Build caption input before saving
- [ ] Implement local photo storage (offline queue)
- [ ] Upload photos to Firebase Storage
- [ ] Cloud Function: generate thumbnails on upload
- [ ] Save photo metadata to Firestore
- [ ] Build photo gallery view (grid) per trip
- [ ] Build full-screen photo viewer with caption and location
- [ ] Display photo markers on the trip map
- [ ] Tap marker → view photo

### Deliverable
Users can take geotagged photos during a trip, view them in a gallery, and see them on the map.

---

## Phase 5: Chat

**Goal:** Real-time group chat per trip.

### Tasks

- [ ] Design chat UI (message bubbles, timestamps, sender info)
- [ ] Set up Firestore real-time listener on messages subcollection
- [ ] Implement send text message
- [ ] Implement send photo in chat
- [ ] Show unread message count badge on trip
- [ ] Handle offline message queuing (Firestore persistence)
- [ ] Auto-scroll to latest message
- [ ] Keyboard handling (avoid input hidden behind keyboard)

### Deliverable
Trip participants can chat in real-time. Messages queue offline and sync when back online.

---

## Phase 6: Weather & Notifications

**Goal:** Weather forecasts from Yr.no and push notifications.

### Tasks

- [ ] Cloud Function: fetch weather from MET Norway API
- [ ] Cache weather data in Firestore (1-hour refresh for active trips)
- [ ] Build weather display widget (temp, wind, precipitation, icon)
- [ ] Show forecast on trip detail screen (planning phase)
- [ ] Show current weather during active trip
- [ ] Set up Firebase Cloud Messaging (FCM)
- [ ] Request notification permissions on app start
- [ ] Store FCM tokens in user document
- [ ] Cloud Function: send notifications on Firestore events
- [ ] Implement all notification types (invites, messages, photos, weather, shopping)
- [ ] Android notification channels for granular control
- [ ] Tap notification → navigate to relevant screen (deep link)

### Deliverable
Users see weather forecasts for trips and receive push notifications for all relevant events.

---

## Phase 7: Shopping List & History

**Goal:** Trip shopping list and full trip archive.

### Tasks

- [ ] Build shopping list UI (add, check off, remove items)
- [ ] Firestore rules: creator can edit, participants can view and check off
- [ ] Build trip history list (past trips sorted by date)
- [ ] Build trip archive view with:
  - [ ] Full route on map
  - [ ] Elevation profile chart
  - [ ] Photo gallery
  - [ ] Chat history (read-only)
  - [ ] Shopping list snapshot
  - [ ] Weather summary
- [ ] Calculate and display trip statistics:
  - [ ] Distance, elevation gain/loss, duration
  - [ ] Max/average speed
  - [ ] Participant count, photo count
- [ ] Add year/season filter for history

### Deliverable
Complete trip lifecycle with shopping list and rich post-trip history.

---

## Phase 8: Offline & Polish

**Goal:** Robust offline experience and UI refinement.

### Tasks

- [ ] Implement Mapbox offline tile downloads (pre-trip)
- [ ] Build "Download map area" UI for upcoming trips
- [ ] Test and harden offline → online sync for all data types
- [ ] Add sync status indicator in UI
- [ ] Handle edge cases: app killed during tracking, device restart
- [ ] UI polish: loading states, error states, empty states
- [ ] Animations and transitions
- [ ] Accessibility review
- [ ] Dark mode support
- [ ] Localization (Norwegian bokmål as primary, English)

### Deliverable
App works reliably offline in mountain conditions. UI feels polished and complete.

---

## Phase 9: Testing & Launch

**Goal:** Quality assurance and app store release.

### Tasks

- [ ] Unit tests for business logic (Zustand stores, sync logic)
- [ ] Integration tests for Firebase operations
- [ ] E2E tests for critical flows (Detox)
- [ ] Beta testing with friend group (TestFlight + Google Play internal)
- [ ] Fix bugs from beta feedback
- [ ] Performance profiling and optimization
- [ ] Set up Firebase production environment (separate from dev)
- [ ] Configure EAS Submit for App Store and Google Play
- [ ] Prepare app store assets (screenshots, description, icon)
- [ ] Submit to App Store and Google Play
- [ ] Monitor crash reports (Firebase Crashlytics)

### Deliverable
App live on both app stores.

---

## Firebase Project Structure

```
firebase/
├── firestore.rules         # Security rules
├── firestore.indexes.json  # Composite indexes
├── storage.rules           # Storage security rules
└── functions/
    ├── src/
    │   ├── index.ts
    │   ├── sendTripInviteSMS.ts
    │   ├── onPhotoUpload.ts
    │   ├── sendNotification.ts
    │   └── weatherSync.ts
    └── package.json
```

## React Native Project Structure

```
src/
├── app/                    # Expo Router app directory
│   ├── (auth)/             # Auth screens (sign in, register)
│   ├── (tabs)/             # Main tab screens
│   │   ├── home.tsx
│   │   ├── trips.tsx
│   │   ├── map.tsx
│   │   └── profile.tsx
│   └── trip/
│       ├── [id].tsx        # Trip detail
│       ├── create.tsx      # Create trip
│       ├── chat.tsx        # Trip chat
│       └── photos.tsx      # Trip photos
├── components/
│   ├── common/             # Buttons, inputs, cards
│   ├── map/                # Map components
│   ├── trip/               # Trip-specific components
│   ├── chat/               # Chat components
│   └── weather/            # Weather widgets
├── stores/
│   ├── authStore.ts
│   ├── tripStore.ts
│   └── locationStore.ts
├── services/
│   ├── firebase.ts         # Firebase initialization
│   ├── auth.ts             # Auth operations
│   ├── trips.ts            # Trip CRUD
│   ├── location.ts         # GPS tracking
│   ├── photos.ts           # Photo operations
│   ├── chat.ts             # Chat operations
│   ├── weather.ts          # Weather API
│   └── notifications.ts   # Push notification setup
├── hooks/
│   ├── useTrip.ts
│   ├── useLocation.ts
│   ├── useChat.ts
│   └── useWeather.ts
├── utils/
│   ├── offlineSync.ts      # Offline queue management
│   ├── geoUtils.ts         # Distance, elevation calculations
│   └── dateUtils.ts
├── types/
│   └── index.ts            # Shared TypeScript interfaces
└── constants/
    └── index.ts            # Colors, config values
```

## Key Dependencies

```json
{
  "expo": "~52",
  "react-native": "0.76",
  "typescript": "~5.3",
  "@react-navigation/native": "^7",
  "@rnmapbox/maps": "^10",
  "firebase": "^11",
  "react-native-firebase": "^21",
  "expo-location": "~18",
  "expo-camera": "~16",
  "expo-notifications": "~0.29",
  "expo-sqlite": "~15",
  "zustand": "^5",
  "@tanstack/react-query": "^5",
  "date-fns": "^4"
}
```

*Note: Version numbers are approximate and should be verified at project start.*
