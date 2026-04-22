# Shannah — Customer App

## Project Overview
Expo React Native app (TypeScript) for customers to browse stores, order food, and track deliveries.

**Read the root `../CLAUDE.md` for cross-app rules before starting work.**

## Tech Stack
- Expo SDK 54 + React Native 0.81.5 (TypeScript `.tsx`)
- `expo-router` v6 — file-based navigation
- UI Kitten v5.3.1 + Eva Design System — component library
- Context API (`context/GlobalContext.tsx`) — state management
- `axios` — HTTP client (split into domain services under `services/`)
- `expo-secure-store` — token storage (never AsyncStorage for tokens)
- `expo-notifications` — push notifications
- `react-native-maps` + `expo-location` — maps and GPS
- `react-native-reanimated` — animations
- Tajawal font family (Regular, Medium, Bold, ExtraBold)

## Architecture

```
app/              → Expo Router screens (file-based routing)
  (tabs)/         → Bottom tab navigation (Home, Search, Cart, Profile)
  addresses/      → Address management (list, form, select)
  store/[id].jsx  → Store detail (dynamic route)
components/       → Reusable UI components
  ui/             → Atomic components (OtpInput, AlertDialog, AnimatedFavoriteButton)
context/          → GlobalContext (auth, cart, user data, delivery address)
services/         → API layer (shannahApi.js — all endpoints in one file)
hooks/            → useAuth, useCart, useCurrentLocation, useKeyboard
utils/            → Helpers (shareStore.js)
assets/           → Fonts, images, icons
```

### Key Patterns
- **Screens** consume hooks and context, never call `services/` directly
- **GlobalContext** manages: `cartItems`, `signedIn`, `userData`, `deliveryAddress`
- **Cart** persisted via AsyncStorage, categorized by `meal` and `banquet`
- **Auth token** stored in `expo-secure-store`, passed manually to API functions as first arg
- **Push tokens** registered on login, unregistered on logout

### Navigation Structure
```
/                    → Splash/entry
/sign-in-mobile      → Phone OTP login (the only public auth surface)
/profile-complete    → Complete profile after first-time OTP verification
/(tabs)/index        → Home feed (stores, categories)
/(tabs)/search       → Search stores/products
/(tabs)/cart         → Shopping cart
/(tabs)/profile      → User account
/store/[id]          → Store detail + product listing
/product             → Product detail with variants
/cart-products       → Cart with items
/checkout            → Order submission
/order-confirmed     → Confirmation screen
/orders              → Order history
/favorite            → Favorites list
/notifications       → Notification inbox
/addresses/*         → Address CRUD
```

## Styling
- UI Kitten components with Eva Design System
- Theme defined in `theme.json` (primary purple: `#881ED3`, success: `#34A853`)
- Component mappings in `mapping.json`
- Custom fonts: Tajawal (loaded via `expo-font`)
- Arabic is the primary language — most hardcoded strings are Arabic

## API Layer
- Domain services in `services/`: `auth.service.ts`, `store.service.ts`, `order.service.ts`, `address.service.ts`, `favorite.service.ts`, `notification.service.ts`
- Shared API client in `services/api.ts` — axios instance with 403 interceptors
- Barrel re-export in `services/shannahApi.ts` — all 28 functions available from one import
- Base URL from `EXPO_PUBLIC_API_URL` environment variable
- Token passed as first argument to authenticated functions

## TypeScript Migration Status
- **Foundation (fully typed):** services, hooks, GlobalContext — `strict: true`, zero errors
- **Screens/components (migrated, `@ts-nocheck`):** all `.tsx` files, suppressed type errors. Remove `@ts-nocheck` one screen at a time as types are tightened
- **tsconfig:** `strict: true`, `noImplicitAny: false`, `strictNullChecks: false` (relax progressively)

## Known Tech Debt
- No i18n framework (hardcoded Arabic strings, some English mixed in)
- Token passed manually instead of auto-injected via interceptor
- Screen files have `@ts-nocheck` — type them incrementally

## Raise Concerns Before Building
Never silently implement something that seems wrong. Flag UX problems, missing states (loading, error, empty), dead-end navigation, or API assumptions that differ from how `shannah-web` actually works.

## Environment
```bash
npx expo start        # Dev server
npx expo start --web  # Web preview
npm run lint          # ESLint
```
