# Shannah Customer App — Backend Integration Tracker

> **Backend:** shannah-web (Laravel 12)
> **Base URL:** `/api`
> **Auth:** Bearer token via Laravel Sanctum
> **Role:** `client` (middleware: `auth:sanctum`, `not.suspended`, `role:client`, `profile.complete`)
> **Last updated:** 2026-04-22

---

## Authentication (Public)

Customer auth is **phone-OTP only** as of 2026-04-22. The sign-in chooser, email login, and email signup screens were removed to match the KSA food-delivery standard (HungerStation/Jahez/Keeta). Email endpoints remain on the backend for admin/operator surfaces but are not wired on this app.

| Feature | Endpoint | Method | Backend Status | App Status | Notes |
|---------|----------|--------|----------------|------------|-------|
| Login (email) | `/auth/login` | POST | DONE | DECOMMISSIONED | Not wired on client. Admin-only surface. |
| Register (email) | `/auth/register` | POST | DONE | DECOMMISSIONED | Not wired on client. OTP verify auto-registers new phones. |
| Email OTP Send | `/auth/email-otp/send` | POST | DONE | DECOMMISSIONED | Not wired on client. |
| Email OTP Verify | `/auth/email-otp/verify` | POST | DONE | DECOMMISSIONED | Not wired on client. |
| Send Phone OTP | `/auth/otp/send` | POST | DONE | CONNECTED | 60s cooldown, 5/day limit. Body: `{ phone }` |
| Verify Phone OTP | `/auth/otp/verify` | POST | DONE | CONNECTED | Returns token + user. Body: `{ phone, otp }`. First-time verify auto-creates user. |
| Complete Profile | `/auth/profile/complete` | POST | DONE | CONNECTED | Requires Bearer. Body: `{ first_name, last_name, email }` |
| Reset Password | `/auth/reset-password` | POST | DONE | LEGACY | `forgot-password.tsx` kept but not linked from live flows. |
| Logout | `/auth/logout` | POST | DONE | CONNECTED | Called in signOut() before clearing local token |

## Stores & Products (Public)

| Feature | Endpoint | Method | Backend Status | App Status | Notes |
|---------|----------|--------|----------------|------------|-------|
| List Stores | `/stores` | GET | DONE | CONNECTED | Returns `{ data: { meal: [], banquet: [], market: [] } }` |
| Store Detail | `/stores/{store}` | GET | DONE | CONNECTED | Includes products grouped by category |
| Store Categories | `/store-categories` | GET | DONE | TODO | Could be used for home screen filters |
| Product Detail | `/products/{product}` | GET | DONE | CONNECTED | Includes options, variations |
| Store Products | `/client/stores/{store}/products` | GET | DONE | TODO | Auth version — app uses public endpoint instead |

## Search (Public)

| Feature | Endpoint | Method | Backend Status | App Status | Notes |
|---------|----------|--------|----------------|------------|-------|
| Search | `/search` | GET | DONE | CONNECTED | Used in search tab. Query param: `?q=` |
| Top Tags | `/search/tags` | GET | DONE | CONNECTED | Service exists, used in search tab |

## Orders (Auth Required)

| Feature | Endpoint | Method | Backend Status | App Status | Notes |
|---------|----------|--------|----------------|------------|-------|
| Submit Order | `/client/orders` | POST | DONE | CONNECTED | Supports delivery_method: delivery/pickup |
| List Orders | `/client/orders` | GET | DONE | CONNECTED | Splits into current/past in UI |
| Order Detail | `/client/orders/{order}` | GET | DONE | CONNECTED | Used in order-confirmed screen |

## Cart (Auth Required)

| Feature | Endpoint | Method | Backend Status | App Status | Notes |
|---------|----------|--------|----------------|------------|-------|
| Show Cart | `/client/cart` | GET | DONE | NOT USED | App uses local AsyncStorage cart instead |
| Add to Cart | `/client/cart/add` | POST | DONE | NOT USED | App uses local AsyncStorage cart instead |

## Coupons (Auth Required)

| Feature | Endpoint | Method | Backend Status | App Status | Notes |
|---------|----------|--------|----------------|------------|-------|
| Apply Coupon | `/client/coupons/apply` | POST | DONE | CONNECTED | Body: `{ code, items }` |

## Addresses (Auth Required)

| Feature | Endpoint | Method | Backend Status | App Status | Notes |
|---------|----------|--------|----------------|------------|-------|
| List Addresses | `/client/addresses` | GET | DONE | CONNECTED | |
| Create Address | `/client/addresses` | POST | DONE | CONNECTED | Body: `{ label, latitude, longitude, street, city, national_address }` |
| Show Address | `/client/addresses/{address}` | GET | DONE | CONNECTED | Used in address form edit mode |
| Update Address | `/client/addresses/{address}` | PUT | DONE | CONNECTED | Service exists (saveOrUpdateAddress with action=update) |
| Delete Address | `/client/addresses/{address}` | DELETE | DONE | CONNECTED | With confirmation dialog |

## Favorites (Auth Required)

| Feature | Endpoint | Method | Backend Status | App Status | Notes |
|---------|----------|--------|----------------|------------|-------|
| Toggle Favorite | `/client/favorites/toggle` | POST | DONE | CONNECTED | Body: `{ type, id }` |
| List Favorites | `/client/favorites` | GET | DONE | CONNECTED | |

## Reviews (Auth Required)

| Feature | Endpoint | Method | Backend Status | App Status | Notes |
|---------|----------|--------|----------------|------------|-------|
| Submit Review | `/client/reviews` | POST | DONE | CONNECTED | Called in orders.tsx rating flow |

## Profile (Auth Required)

| Feature | Endpoint | Method | Backend Status | App Status | Notes |
|---------|----------|--------|----------------|------------|-------|
| Get Profile | `/client/me` | GET | DONE | CONNECTED | |
| Update Profile | `/client/me` | PUT | DONE | CONNECTED | |

## Notifications (Auth Required — shared)

| Feature | Endpoint | Method | Backend Status | App Status | Notes |
|---------|----------|--------|----------------|------------|-------|
| Register Push Token | `/push-tokens` | POST | DONE | CONNECTED | Auto-registered on login |
| Unregister Push Token | `/push-tokens` | DELETE | DONE | CONNECTED | Called on logout |
| Get Notifications | `/notifications` | GET | DONE | CONNECTED | With pull-to-refresh |
| Unread Count | `/notifications/unread-count` | GET | DONE | CONNECTED | Returns `{ status, data: { count } }` |
| Mark Read | `/notifications/{id}/read` | POST | DONE | CONNECTED | On notification tap |
| Mark All Read | `/notifications/read-all` | POST | DONE | CONNECTED | "Mark all" button |

## Platform Settings (Public)

| Feature | Endpoint | Method | Backend Status | App Status | Notes |
|---------|----------|--------|----------------|------------|-------|
| Get Settings | `/platform-settings` | GET | DONE | CONNECTED | Used in checkout for VAT + delivery fee |

---

## Status Legend
- **DONE** — Backend endpoint is implemented and functional
- **TODO** — App hasn't connected to this endpoint yet
- **CONNECTED** — App successfully calls this endpoint
- **NOT USED** — Endpoint exists but app uses a different approach

---

## Missing Features (No Backend Endpoints)

| Feature | What's needed | Priority |
|---------|---------------|----------|
| Chat/messaging | Client chat endpoints (conversations, messages) | P3 |
| Real-time order tracking | Customer-facing delivery location endpoint + WebSocket | P3 |
| Payment gateway | Payment processing endpoints (Moyasar/Tap) | P3 |
| Password reset UI | Screen for forgot password flow | P2 |
