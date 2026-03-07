# SkiturApp - System Architecture

## Overview

SkiturApp is a React Native (Expo) mobile application for organizing ski touring trips. It runs on Android, iOS, and Web, with Firebase as the backend and Cloudflare Pages for web hosting.

---

## System Overview Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENTS                                  │
│                                                                 │
│   ┌──────────┐     ┌──────────┐     ┌──────────────────────┐   │
│   │ Android  │     │   iOS    │     │    Web (Browser)     │   │
│   │ (Expo)   │     │ (Expo)   │     │ (Cloudflare Pages)   │   │
│   └────┬─────┘     └────┬─────┘     └──────────┬───────────┘   │
│        │                │                       │               │
│        └────────────────┼───────────────────────┘               │
│                         │                                       │
│              React Native (Expo SDK 55)                         │
│              TypeScript + Zustand stores                        │
└─────────────────────────┬───────────────────────────────────────┘
                          │
          ┌───────────────┼───────────────┐
          │               │               │
          ▼               ▼               ▼
   ┌────────────┐  ┌────────────┐  ┌─────────────┐
   │  Firebase   │  │  Firebase   │  │  Firebase    │
   │  Auth       │  │  Firestore  │  │  Storage     │
   │             │  │  (Database) │  │  (Photos)    │
   └────────────┘  └────────────┘  └─────────────┘
                          │
                          ▼
                   ┌────────────┐
                   │  External   │
                   │  APIs       │
                   │             │
                   │ - MET.no    │
                   │   (Weather) │
                   │ - Sporet.no │
                   │   (Trails)  │
                   │ - Google    │
                   │   Maps SDK  │
                   └────────────┘
```

---

## Application Architecture

```mermaid
graph TB
    subgraph Screens["Screens (src/app/)"]
        Auth["Auth\nSignIn | SignUp"]
        Home["HomeScreen"]
        Map["MapScreen"]
        Trips["TripsScreen"]
        Profile["ProfileScreen"]
        TripDetail["TripDetailScreen"]
        TripChat["TripChatScreen"]
        TripPhotos["TripPhotosScreen"]
        Shopping["ShoppingListScreen"]
        Archive["TripArchiveScreen"]
        Create["CreateTripScreen"]
        Edit["EditTripScreen"]
    end

    subgraph Navigation["Navigation (src/navigation/)"]
        AuthNav["AuthNavigator"]
        MainNav["MainNavigator\n(Bottom Tabs)"]
        TripsNav["TripsNavigator\n(Stack)"]
    end

    subgraph Stores["State Management - Zustand (src/stores/)"]
        AuthStore["authStore\nUser session"]
        TripStore["tripStore\nTrip list & state"]
        LocationStore["locationStore\nGPS tracking state"]
        SyncStore["syncStore\nOnline/offline status"]
        ThemeStore["themeStore\nDark/light mode"]
    end

    subgraph Services["Services (src/services/)"]
        FirebaseSvc["firebase.ts\nApp init & exports"]
        AuthSvc["auth.ts\nSign in/up/out"]
        TripsSvc["trips.ts\nCRUD operations"]
        ChatSvc["chat.ts\nMessages"]
        PhotosSvc["photos.ts\nUpload & fetch"]
        TrackingSvc["tracking.ts\nBackground GPS"]
        TrackingDB["trackingDb.ts\nSQLite buffer"]
        WeatherSvc["weather.ts\nMET Norway API"]
        SkiTrails["skiTrails.ts\nSporet.no API"]
        ShoppingSvc["shopping.ts\nShopping list"]
        PhotoQueue["photoQueue.ts\nOffline upload queue"]
        NetMonitor["networkMonitor.ts\nConnectivity"]
        InvitesSvc["tripInvites.ts\nTrip invitations"]
    end

    subgraph Hooks["Custom Hooks (src/hooks/)"]
        useTrips["useTrips"]
        useLocation["useLocation"]
        usePhotos["usePhotos"]
        useWeather["useWeather"]
        useShopping["useShopping"]
        useTheme["useTheme"]
    end

    AuthNav --> Auth
    MainNav --> Home & Map & Trips & Profile
    TripsNav --> TripDetail & TripChat & TripPhotos & Shopping & Archive & Create & Edit

    Screens --> Hooks
    Hooks --> Stores
    Hooks --> Services
    Services --> FirebaseSvc
```

---

## Data Flow

```mermaid
flowchart LR
    subgraph Client
        UI["UI Components"]
        Hook["Custom Hooks"]
        Store["Zustand Store"]
        Service["Service Layer"]
        SQLite["SQLite\n(GPS buffer)"]
    end

    subgraph Firebase
        FAuth["Firebase Auth"]
        FStore["Cloud Firestore"]
        FStorage["Cloud Storage"]
    end

    subgraph External
        MET["api.met.no\n(Weather)"]
        Sporet["tracemap.sporet.no\n(Ski trails)"]
    end

    UI -->|user action| Hook
    Hook -->|read/write| Store
    Hook -->|API calls| Service
    Service -->|auth| FAuth
    Service -->|CRUD| FStore
    Service -->|upload/download| FStorage
    Service -->|fetch weather| MET
    Service -->|fetch trails| Sporet
    Service -->|buffer GPS| SQLite
    SQLite -->|batch sync| FStore
    FStore -->|real-time listeners| Service
    Service -->|update| Store
    Store -->|re-render| UI
```

---

## Firestore Data Model

```mermaid
erDiagram
    USERS {
        string uid PK
        string email
        string displayName
        string photoURL
        string pushToken
        timestamp createdAt
    }

    TRIPS {
        string id PK
        string title
        string description
        string status "planning | active | completed"
        string createdBy FK
        array participants "uid[]"
        object location "name, lat, lng"
        object endLocation "name, lat, lng"
        timestamp startDate
        timestamp createdAt
    }

    ROUTE_POINTS {
        string id PK
        string tripId FK
        string userId FK
        number latitude
        number longitude
        number altitude
        number speed
        timestamp timestamp
    }

    MESSAGES {
        string id PK
        string tripId FK
        string userId FK
        string text
        string photoURL
        string userName
        timestamp createdAt
    }

    PHOTOS {
        string id PK
        string tripId FK
        string userId FK
        string url
        string caption
        object location "lat, lng"
        timestamp createdAt
    }

    SHOPPING_LIST {
        string id PK
        string tripId FK
        string item
        boolean checked
        string addedBy FK
        timestamp createdAt
    }

    TRIP_INVITES {
        string id PK
        string tripId FK
        string uid FK
        string displayName
        string email
        string phone
        string status "pending | accepted | declined"
        timestamp createdAt
    }

    INVITES {
        string id PK
        string tripId FK
        string invitedBy FK
        string name
        string phone
        string email
        string token
        string status "pending"
        timestamp createdAt
        timestamp expiresAt
    }

    USERS ||--o{ TRIPS : creates
    TRIPS ||--o{ ROUTE_POINTS : contains
    TRIPS ||--o{ MESSAGES : contains
    TRIPS ||--o{ PHOTOS : contains
    TRIPS ||--o{ SHOPPING_LIST : contains
    TRIPS ||--o{ TRIP_INVITES : contains
    TRIPS ||--o{ INVITES : has
```

---

## Navigation Structure

```mermaid
graph TD
    App["App.tsx\nAuth Listener"]

    App -->|not authenticated| AuthNav
    App -->|authenticated| MainNav

    subgraph AuthNav["AuthNavigator"]
        SignIn["SignInScreen"]
        SignUp["SignUpScreen"]
    end

    subgraph MainNav["MainNavigator (Bottom Tabs)"]
        HomeTab["Home Tab\n🏠"]
        MapTab["Map Tab\n🗺️"]
        TripsTab["Trips Tab\n⛷️"]
        ProfileTab["Profile Tab\n👤"]
    end

    HomeTab --> HomeScreen
    MapTab --> MapScreen
    ProfileTab --> ProfileScreen

    TripsTab --> TripsNav

    subgraph TripsNav["TripsNavigator (Stack)"]
        TripsList["TripsScreen\n(List)"]
        CreateTrip["CreateTripScreen"]
        TripDetail["TripDetailScreen"]
        EditTrip["EditTripScreen"]
        Chat["TripChatScreen"]
        Photos["TripPhotosScreen"]
        ShoppingList["ShoppingListScreen"]
        TripArchive["TripArchiveScreen"]
    end

    TripsList --> CreateTrip
    TripsList --> TripDetail
    TripDetail --> EditTrip
    TripDetail --> Chat
    TripDetail --> Photos
    TripDetail --> ShoppingList
    TripDetail --> TripArchive
```

---

## GPS Tracking Flow

```mermaid
sequenceDiagram
    participant User
    participant UI as MapScreen
    participant Track as tracking.ts
    participant Task as expo-task-manager
    participant DB as SQLite (trackingDb)
    participant FS as Firestore

    User->>UI: Tap "Start Tracking"
    UI->>Track: startTracking(tripId, userId)
    Track->>Task: Register background task
    Task->>Track: Location update (every ~5s)
    Track->>DB: Insert point to buffer

    loop Every 30 seconds
        Track->>DB: Read buffered points
        DB-->>Track: Batch of points
        Track->>FS: Write batch to trips/{id}/route
        Track->>DB: Clear synced points
    end

    User->>UI: Tap "Stop Tracking"
    UI->>Track: stopTracking()
    Track->>DB: Flush remaining points
    Track->>FS: Final sync
    Track->>Task: Unregister background task
```

---

## Offline Architecture

```mermaid
graph TB
    subgraph Online
        FS["Firestore\n(Cloud)"]
        Storage["Firebase Storage"]
    end

    subgraph Device
        FSLocal["Firestore\nIndexedDB Cache"]
        SQLite["SQLite\nGPS Track Buffer"]
        PhotoQ["Photo Queue\nAsync Storage"]
        NetMon["Network Monitor"]
    end

    FS <-->|"auto-sync\n(Firestore SDK)"| FSLocal
    NetMon -->|status change| SyncStore["syncStore\n(online/offline)"]

    subgraph "When Offline"
        GPS["GPS Points"] --> SQLite
        Photos["Captured Photos"] --> PhotoQ
        Reads["Read Operations"] --> FSLocal
    end

    subgraph "When Back Online"
        SQLite -->|batch upload| FS
        PhotoQ -->|retry queue| Storage
    end
```

---

## Deployment Architecture

```mermaid
graph LR
    subgraph Development
        Dev["Developer Machine"]
    end

    subgraph "Version Control"
        GitHub["GitHub\nknsorensen/SkiturApp"]
    end

    subgraph "Web Hosting"
        CF["Cloudflare Pages\nskiturapp.pages.dev"]
    end

    subgraph "Backend"
        FBAuth["Firebase Auth"]
        FBStore["Cloud Firestore"]
        FBStorage["Firebase Storage"]
    end

    subgraph "Mobile Distribution"
        ExpoGo["Expo Go\n(Development)"]
        APK["Android APK/AAB\n(future)"]
        IPA["iOS IPA\n(future)"]
    end

    Dev -->|git push| GitHub
    Dev -->|"npm run build:web\nwrangler pages deploy"| CF
    Dev -->|"firebase deploy\n--only firestore:rules"| FBStore
    Dev -->|"npx expo start\n--tunnel"| ExpoGo

    CF -->|serves| Browser["Web Browser"]
    ExpoGo -->|runs on| Phone["Phone"]
    Browser --> FBAuth & FBStore & FBStorage
    Phone --> FBAuth & FBStore & FBStorage
```

---

## External API Integration

### MET Norway Weather API

- **Endpoint:** `https://api.met.no/weatherapi/locationforecast/2.0/compact`
- **Auth:** None (public API, requires proper `User-Agent` header)
- **Usage:** Weather forecasts on trip detail and home screen
- **Data:** Temperature, wind, precipitation, weather symbols
- **Cache:** Client-side only (no Cloud Function caching yet)

### Sporet.no Ski Trail API

- **Endpoint:** `https://tracemap.sporet.no/api/tracemap`
- **Auth:** None (public API)
- **Usage:** Ski trail overlay on maps, shortest route calculation
- **Data:** Trail coordinates, type (classic/skating/scooter), grooming status

### Google Maps SDK

- **Usage:** Native map rendering on Android/iOS (terrain view)
- **Auth:** API key via `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY` env variable
- **Web:** Replaced by a stub — maps not available on web

---

## Technology Stack Summary

```
┌─────────────────────────────────────────────────┐
│                   FRONTEND                       │
│                                                  │
│  React Native 0.83 + Expo SDK 55                │
│  TypeScript 5.9 (strict mode)                   │
│  React 19.2                                      │
│                                                  │
│  State:       Zustand 5                          │
│  Navigation:  React Navigation 7                 │
│  Maps:        react-native-maps 1.26             │
│  HTTP:        fetch (native)                     │
│  Queries:     @tanstack/react-query 5            │
│  Date:        date-fns 4                         │
│  Icons:       @expo/vector-icons (Ionicons)      │
│                                                  │
├─────────────────────────────────────────────────┤
│                   BACKEND                        │
│                                                  │
│  Firebase Auth       (email/password)            │
│  Cloud Firestore     (NoSQL database)            │
│  Firebase Storage    (photo storage)             │
│                                                  │
├─────────────────────────────────────────────────┤
│                   LOCAL STORAGE                  │
│                                                  │
│  SQLite              (GPS track buffer)          │
│  AsyncStorage        (photo queue, prefs)        │
│  IndexedDB           (Firestore offline cache)   │
│                                                  │
├─────────────────────────────────────────────────┤
│                   DEPLOYMENT                     │
│                                                  │
│  Web:     Cloudflare Pages (skiturapp.pages.dev) │
│  Mobile:  Expo Go (dev) / EAS Build (prod)       │
│  CI/CD:   Manual (future: GitHub Actions)        │
│                                                  │
├─────────────────────────────────────────────────┤
│                   DEV TOOLS                      │
│                                                  │
│  Testing:    Jest + ts-jest                      │
│  Linting:    ESLint + TypeScript ESLint          │
│  Formatting: Prettier                            │
│  Build:      Metro Bundler (Expo)                │
│                                                  │
└─────────────────────────────────────────────────┘
```

---

## Security Model

### Firebase Auth
- Email/password authentication
- Auth state persisted across sessions

### Firestore Rules (simplified)
| Collection | Read | Write |
|---|---|---|
| `users/{uid}` | All authenticated | Owner only |
| `trips/{id}` | All authenticated | Participants only (create: any auth user) |
| `trips/{id}/route` | All authenticated | Participants only |
| `trips/{id}/messages` | All authenticated | Any authenticated |
| `trips/{id}/photos` | All authenticated | Any authenticated |
| `trips/{id}/shoppingList` | All authenticated | Participants only |
| `trips/{id}/tripInvites` | All authenticated | Any authenticated |
| `invites/{id}` | All authenticated | Any auth (update: pending only) |

### API Keys
- Google Maps API key: stored in `.env` (gitignored), loaded via `EXPO_PUBLIC_` prefix
- Firebase config: hardcoded in `firebase.ts` (safe for client-side Firebase SDK)
- MET Norway: no key required (User-Agent header only)
- Sporet.no: no key required
