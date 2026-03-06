# SkiturApp — Technical Specification

## 1. Overview

SkiturApp is a mobile app for organizing ski touring trips within a private friend group. It covers the full trip lifecycle: planning, live tracking, and post-trip review. The app runs on both Android and iOS.

**Target users:** Private, invite-only friend group (20–100 users)

---

## 2. Architecture

### 2.1 Tech Stack

| Layer            | Technology                        |
|------------------|-----------------------------------|
| Mobile app       | React Native (Expo managed)       |
| Language         | TypeScript                        |
| Navigation       | React Navigation                  |
| State management | Zustand + React Query             |
| Maps             | react-native-mapbox-gl            |
| Backend          | Firebase                          |
| Auth             | Firebase Authentication           |
| Database         | Cloud Firestore                   |
| Real-time chat   | Cloud Firestore (real-time listeners) |
| Push notifications | Firebase Cloud Messaging (FCM)  |
| File storage     | Firebase Storage (photos)         |
| Weather API      | Yr.no / MET Norway (Locationforecast 2.0) |
| Offline support  | Firestore offline persistence + local SQLite (GPS tracks) |
| CI/CD            | EAS Build + EAS Submit            |

### 2.2 System Architecture

```
┌─────────────────────────────────────┐
│          React Native App           │
│  ┌───────────┐  ┌────────────────┐  │
│  │ Offline   │  │ UI Components  │  │
│  │ Store     │  │ & Screens      │  │
│  │ (SQLite)  │  │                │  │
│  └─────┬─────┘  └───────┬────────┘  │
│        │                │           │
│  ┌─────▼────────────────▼────────┐  │
│  │     State Layer (Zustand)     │  │
│  │     + React Query             │  │
│  └─────────────┬─────────────────┘  │
└────────────────┼────────────────────┘
                 │
    ┌────────────▼────────────────┐
    │        Firebase             │
    │  ┌──────┐ ┌──────┐ ┌────┐  │
    │  │ Auth │ │ Fire-│ │FCM │  │
    │  │      │ │ store│ │    │  │
    │  └──────┘ └──────┘ └────┘  │
    │  ┌──────────┐ ┌─────────┐  │
    │  │ Storage  │ │Cloud    │  │
    │  │ (Photos) │ │Functions│  │
    │  └──────────┘ └─────────┘  │
    └─────────────────────────────┘
                 │
    ┌────────────▼────────────────┐
    │     External APIs           │
    │  ┌──────────────────────┐   │
    │  │ Yr.no / MET Norway   │   │
    │  │ Locationforecast 2.0 │   │
    │  └──────────────────────┘   │
    └─────────────────────────────┘
```

### 2.3 Cloud Functions (Firebase)

Server-side logic for operations that shouldn't run on the client:

- **sendTripInviteSMS** — Send SMS invite links to non-users via a third-party SMS provider (e.g., Twilio)
- **onPhotoUpload** — Generate thumbnails on photo upload
- **sendNotification** — Fan out push notifications to trip participants
- **weatherSync** — Periodically fetch and cache weather data for upcoming trips

---

## 3. Data Model (Firestore)

### 3.1 Collections

#### `users`
```typescript
interface User {
  uid: string;                  // Firebase Auth UID
  email: string;
  displayName: string;
  photoURL: string | null;
  fcmTokens: string[];          // push notification tokens
  createdAt: Timestamp;
}
```

#### `trips`
```typescript
interface Trip {
  id: string;
  title: string;
  description: string;
  createdBy: string;            // user UID
  status: 'planning' | 'active' | 'completed';
  startDate: Timestamp;
  endDate: Timestamp | null;
  location: {                   // starting point
    latitude: number;
    longitude: number;
    name: string;
  };
  participants: string[];       // user UIDs
  invitedEmails: string[];      // pending invites
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

#### `trips/{tripId}/route`
```typescript
interface RoutePoint {
  id: string;
  userId: string;
  latitude: number;
  longitude: number;
  altitude: number;
  timestamp: Timestamp;
  speed: number;                // m/s
  accuracy: number;             // meters
}
```

#### `trips/{tripId}/photos`
```typescript
interface Photo {
  id: string;
  userId: string;
  imageURL: string;
  thumbnailURL: string;
  caption: string;
  location: {
    latitude: number;
    longitude: number;
    altitude: number;
  };
  takenAt: Timestamp;
  uploadedAt: Timestamp;
}
```

#### `trips/{tripId}/messages`
```typescript
interface Message {
  id: string;
  userId: string;
  text: string;
  imageURL: string | null;      // optional photo in chat
  createdAt: Timestamp;
}
```

#### `trips/{tripId}/shoppingList`
```typescript
interface ShoppingItem {
  id: string;
  text: string;
  checked: boolean;
  addedBy: string;              // user UID
  createdAt: Timestamp;
}
```

#### `invites`
```typescript
interface Invite {
  id: string;
  tripId: string;
  invitedBy: string;            // user UID
  phone: string | null;         // SMS invite
  email: string | null;         // email invite
  token: string;                // unique invite token for deep link
  status: 'pending' | 'accepted' | 'expired';
  createdAt: Timestamp;
  expiresAt: Timestamp;
}
```

### 3.2 Firestore Security Rules

- Users can only read/write their own user document
- Trip data is readable/writable only by participants
- Messages and photos are writable by participants, readable by participants
- Shopping list is writable by trip creator, readable by participants
- Invites are writable by trip participants, readable by invite recipient

---

## 4. Features — Detailed Specification

### 4.1 Authentication

**Sign-in methods:**
- Email/password (with email verification)
- Google Sign-In
- Apple Sign-In

**Flow:**
1. User opens app → sign-in screen
2. New users register with email or social provider
3. Invited users clicking an invite link are directed to registration, then auto-joined to the trip
4. Firebase Auth handles session management and token refresh

### 4.2 Trip Management

**Create trip:**
- Title, description, date, starting location (map picker)
- Auto-adds creator as participant

**Invite participants:**
- Search existing users by name/email
- Invite non-users via SMS or shareable link
- Deep link format: `https://skiturapp.page.link/trip/{inviteToken}`
- Non-users: link → app store → registration → auto-join trip

**Trip states:**
- `planning` — default, editable, not tracking
- `active` — GPS tracking enabled, real-time features active
- `completed` — archived, read-only, full history preserved

### 4.3 Real-time GPS Tracking

**During active trip:**
- Background GPS tracking using `expo-location` with `startLocationUpdatesAsync`
- Track points saved locally in SQLite every 5 seconds
- Batch sync to Firestore every 30 seconds (when online)
- Show all participants' positions on the map in real-time
- Route rendered as a polyline on Mapbox

**Offline behavior:**
- GPS points stored in local SQLite database
- Queue grows while offline
- On reconnection, batch upload all queued points
- Conflict resolution: server timestamp ordering

**Battery optimization:**
- Configurable tracking interval (5s / 10s / 30s)
- Reduce accuracy when battery is low
- Foreground service notification on Android

### 4.4 Map & Route Display

**Map provider:** Mapbox GL (supports offline map tiles)

**Features:**
- Topographic map style (mountain terrain)
- Download map tiles for offline use before trip
- Display live route as polyline
- Show participant positions as colored markers
- Show geotagged photos as markers on the map
- Tap photo marker → view photo with caption

**Post-trip:**
- Full route displayed with elevation profile
- Photo markers along the route
- Trip statistics (distance, elevation gain/loss, duration, max speed)

### 4.5 Geotagged Photos

**Capture:**
- In-app camera using `expo-camera`
- Auto-geotag with current GPS position
- Add text caption before saving
- Store locally if offline

**Storage:**
- Upload to Firebase Storage
- Cloud Function generates thumbnail (300px)
- Metadata saved to Firestore `photos` subcollection

**Display:**
- Photo gallery per trip (grid view)
- Map view with photo markers
- Full-screen photo viewer with caption and location

### 4.6 Real-time Chat

**Implementation:** Firestore real-time listeners on `messages` subcollection

**Features:**
- Text messages
- Photo messages (share from gallery or camera)
- Message timestamps
- Unread message count badge
- Push notification for new messages (when app is in background)

**Offline:**
- Firestore offline persistence caches recent messages
- New messages queued and sent on reconnection

### 4.7 Weather Integration

**API:** MET Norway Locationforecast 2.0 (`https://api.met.no/weatherapi/locationforecast/2.0/`)

**Requirements (MET Norway terms):**
- Set proper `User-Agent` header: `SkiturApp/1.0 github.com/knsorensen/SkiturApp`
- Cache responses, respect `Expires` header
- No excessive polling

**Features:**
- Weather forecast for trip location (next 7 days during planning)
- Current conditions during active trip
- Temperature, wind, precipitation, cloud cover
- Weather icons from Yr

**Implementation:**
- Cloud Function fetches and caches weather data
- Updates every 1 hour for active trips
- Cached data available offline

### 4.8 Push Notifications

**Provider:** Firebase Cloud Messaging (FCM)

**Notification types:**
| Event                     | Recipients          |
|---------------------------|---------------------|
| Trip invitation received  | Invited user        |
| Invitation accepted       | Trip creator        |
| Trip started (now active) | All participants    |
| Trip completed            | All participants    |
| New chat message          | All except sender   |
| New photo uploaded        | All except uploader |
| Shopping list updated     | All participants    |
| Weather alert             | All participants    |

**Implementation:**
- Cloud Function triggered on Firestore writes
- Sends FCM messages to all relevant users' `fcmTokens`
- Notification channels on Android for granular control

### 4.9 Shopping List

**Features:**
- Trip creator adds/edits/removes items
- All participants can view the list
- Check off items (collaborative)
- Simple text items (name + optional quantity)

### 4.10 Trip History & Archive

**Stored permanently for completed trips:**
- Full GPS route with all track points
- All photos with geotags and captions
- Complete chat history
- Shopping list snapshot
- Weather data snapshot
- Trip statistics:
  - Total distance (km)
  - Total elevation gain/loss (m)
  - Duration
  - Max/avg speed
  - Number of participants
  - Number of photos

**Browse history:**
- List of past trips, sorted by date
- Tap to view full trip details
- Filter by year/season

---

## 5. Offline Strategy

### 5.1 What Works Offline

| Feature            | Offline behavior                              |
|--------------------|-----------------------------------------------|
| GPS tracking       | Full — stored in local SQLite                 |
| Photo capture      | Full — stored locally, queued for upload      |
| View cached trips  | Read-only from Firestore cache                |
| View cached chat   | Read-only from Firestore cache                |
| Send messages      | Queued, sent on reconnection                  |
| Map                | Works if tiles were pre-downloaded            |
| Weather            | Shows last cached forecast                    |

### 5.2 Sync Strategy

1. GPS points: local SQLite → batch upload to Firestore (every 30s when online)
2. Photos: local filesystem → Firebase Storage upload queue
3. Messages: Firestore offline persistence handles queuing
4. Conflict resolution: server timestamps, last-write-wins for simple fields

---

## 6. Security

- All Firestore access controlled via Security Rules (see 3.2)
- Firebase Auth tokens for all API calls
- Photo URLs are signed/private (Firebase Storage rules)
- Invite tokens are one-time-use, expire after 7 days
- No sensitive data stored in local storage unencrypted
- SMS invites use short-lived tokens

---

## 7. Performance Targets

| Metric                     | Target        |
|----------------------------|---------------|
| App cold start             | < 3 seconds   |
| Map load (cached tiles)    | < 2 seconds   |
| Message delivery           | < 1 second    |
| Photo upload (5MB)         | < 10 seconds  |
| GPS sync latency           | < 5 seconds   |
| Offline → online sync      | < 30 seconds  |

---

## 8. Third-Party Services

| Service              | Purpose                        | Cost model          |
|----------------------|--------------------------------|---------------------|
| Firebase             | Auth, DB, storage, functions   | Free tier + pay-as-go |
| Mapbox               | Maps and offline tiles         | Free tier (50k loads/mo) |
| MET Norway (Yr)      | Weather data                   | Free (public API)   |
| Twilio (or similar)  | SMS invites                    | Pay per SMS         |
| Expo / EAS           | Build and deploy               | Free tier available |
