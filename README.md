# Shannah — Customer App

Expo React Native app (TypeScript) for the Shannah on-demand marketplace. Customers browse stores, order food, and track deliveries.

## Prerequisites

- Node.js 20+
- Android Studio (for Android builds) or Xcode (for iOS)
- ADB (Android Debug Bridge) — included with Android Studio

## Setup

```bash
npm install
```

Create `.env.local` for your environment:

```bash
# For local development (USB debugging):
EXPO_PUBLIC_API_URL=http://localhost:8000/api

# For remote server:
EXPO_PUBLIC_API_URL=https://shnah.com/api
```

## Development (Local Backend + USB)

**1. Start the backend** (in a separate terminal):
```bash
cd ../shannah-web
php artisan serve
```

**2. Run the app** on a USB-connected Android device:
```bash
npm run android
```

This automatically sets up ADB port forwarding (`adb reverse tcp:8000 tcp:8000`) so the phone reaches your local backend via `localhost:8000`. No WiFi needed.

**3. For iOS simulator** (Mac only):
```bash
npm run ios
```

## Development (Remote Server)

Set `.env.local` to point to the production API:
```
EXPO_PUBLIC_API_URL=https://shnah.com/api
```

Then run:
```bash
npm run android
# or
npm run ios
```

## Preview Build (Testing on Device)

Builds an APK (Android) or TestFlight build (iOS) via EAS cloud:

```bash
# Android — produces a downloadable APK
npx eas build --platform android --profile preview

# iOS — produces a TestFlight build
npx eas build --platform ios --profile preview

# Submit iOS to TestFlight
npx eas submit --platform ios --profile preview
```

The API URL is set in `eas.json` per profile — no manual `.env` needed for EAS builds.

## Production Build

```bash
# Android (AAB for Play Store)
npx eas build --platform android --profile production

# iOS (for App Store)
npx eas build --platform ios --profile production
```

## Other Commands

```bash
npm run web          # Web preview (limited — maps don't work)
npm run lint         # ESLint check
npx tsc --noEmit     # TypeScript check
```

## Project Structure

```
app/                  Expo Router screens (file-based routing)
  (tabs)/             Bottom tab navigation (Home, Search, Cart, Profile)
  addresses/          Address CRUD screens
  store/[id].tsx      Store detail
services/             API layer (split by domain)
  api.ts              Axios instance + 403 interceptors
  auth.service.ts     Login, OTP, signup, profile, logout
  store.service.ts    Stores, products, search
  order.service.ts    Orders, coupons, reviews
  address.service.ts  Address CRUD
  favorite.service.ts Favorites
  notification.service.ts  Push tokens, notifications
  shannahApi.ts       Barrel re-export (all functions from one import)
context/              GlobalContext (auth, cart, user state)
hooks/                useAuth, useCart, useCurrentLocation, useKeyboard
components/           Reusable UI components
  ui/                 Atomic components (AlertDialog, OtpInput, etc.)
```

## Environment Config

| File | Used by | Purpose |
|------|---------|---------|
| `.env.local` | `npx expo start` / `npm run android` | Local dev — your API URL |
| `eas.json` → `env` block | `eas build` | Cloud builds — API URL per profile |
| `app.json` | All builds | App config, Google Maps key, bundle ID |
