# Shannah Customer App — Backend Integration Tracker

> **Backend:** shannah-web (Laravel 12)
> **Base URL:** `/api`
> **Auth:** Bearer token via Laravel Sanctum
> **Role:** `client` (middleware: `auth:sanctum`, `not.suspended`, `role:client`, `profile.complete`)

---

## Authentication (Public)

| Feature | Endpoint | Method | Backend Status | App Status | Notes |
|---------|----------|--------|----------------|------------|-------|
| Login | `/auth/login` | POST | DONE | CONNECTED | Body: `{ email, password }` |
| Register | `/auth/register` | POST | DONE | CONNECTED | Body: `{ first_name, last_name, email, password, phone, role }` |
| Send Phone OTP | `/auth/otp/send` | POST | DONE | CONNECTED | 60s cooldown, 5/day limit. Body: `{ phone }` |
| Verify Phone OTP | `/auth/otp/verify` | POST | DONE | CONNECTED | Returns token + user. Body: `{ phone, otp }` |
| Complete Profile | `/auth/profile/complete` | POST | DONE | CONNECTED | Requires Bearer. Body: `{ first_name, last_name, email }` |
| Email OTP Send | `/auth/email-otp/send` | POST | DONE | CONNECTED | Body: `{ email }` |
| Email OTP Verify | `/auth/email-otp/verify` | POST | DONE | CONNECTED | Body: `{ email, otp }` |
| Reset Password | `/auth/reset-password` | POST | DONE | TODO | Body: `{ email, otp, password }` |
| Logout | `/auth/logout` | POST | DONE | CONNECTED | Requires Bearer |

## Stores & Products (Public)

| Feature | Endpoint | Method | Backend Status | App Status | Notes |
|---------|----------|--------|----------------|------------|-------|
| List Stores | `/stores` | GET | DONE | CONNECTED | Paginated, filterable |
| Store Detail | `/stores/{store}` | GET | DONE | CONNECTED | Includes products, categories |
| Store Categories | `/store-categories` | GET | DONE | TODO | List all store categories |
| Product Detail | `/products/{product}` | GET | DONE | CONNECTED | Includes options, variations |
| Store Products | `/client/stores/{store}/products` | GET | DONE | TODO | Requires auth |

## Search (Public)

| Feature | Endpoint | Method | Backend Status | App Status | Notes |
|---------|----------|--------|----------------|------------|-------|
| Search | `/search` | GET | DONE | TODO | Query param: `?q=` |
| Top Tags | `/search/tags` | GET | DONE | TODO | Returns popular search tags |

## Orders (Auth Required)

| Feature | Endpoint | Method | Backend Status | App Status | Notes |
|---------|----------|--------|----------------|------------|-------|
| Submit Order | `/client/orders` | POST | DONE | CONNECTED | Body: `{ store_id, items, address_id, coupon_code?, notes? }` |
| List Orders | `/client/orders` | GET | DONE | CONNECTED | Paginated |
| Order Detail | `/client/orders/{order}` | GET | DONE | CONNECTED | Includes items, delivery, status |

## Cart (Auth Required)

| Feature | Endpoint | Method | Backend Status | App Status | Notes |
|---------|----------|--------|----------------|------------|-------|
| Show Cart | `/client/cart` | GET | DONE | TODO | Server-side cart |
| Add to Cart | `/client/cart/add` | POST | DONE | TODO | Body: `{ product_id, quantity, options }` |

## Coupons (Auth Required)

| Feature | Endpoint | Method | Backend Status | App Status | Notes |
|---------|----------|--------|----------------|------------|-------|
| Apply Coupon | `/client/coupons/apply` | POST | DONE | CONNECTED | Body: `{ code, items }` |

## Addresses (Auth Required)

| Feature | Endpoint | Method | Backend Status | App Status | Notes |
|---------|----------|--------|----------------|------------|-------|
| List Addresses | `/client/addresses` | GET | DONE | CONNECTED | |
| Create Address | `/client/addresses` | POST | DONE | CONNECTED | Body: `{ label, latitude, longitude, street, city, district }` |
| Show Address | `/client/addresses/{address}` | GET | DONE | CONNECTED | |
| Update Address | `/client/addresses/{address}` | PUT | DONE | TODO | |
| Delete Address | `/client/addresses/{address}` | DELETE | DONE | CONNECTED | |

## Favorites (Auth Required)

| Feature | Endpoint | Method | Backend Status | App Status | Notes |
|---------|----------|--------|----------------|------------|-------|
| Toggle Favorite | `/client/favorites/toggle` | POST | DONE | CONNECTED | Body: `{ favoritable_type, favoritable_id }` |
| List Favorites | `/client/favorites` | GET | DONE | CONNECTED | |

## Reviews (Auth Required)

| Feature | Endpoint | Method | Backend Status | App Status | Notes |
|---------|----------|--------|----------------|------------|-------|
| Submit Review | `/client/reviews` | POST | DONE | TODO | Body: `{ order_id, rating, comment }` |

## Profile (Auth Required)

| Feature | Endpoint | Method | Backend Status | App Status | Notes |
|---------|----------|--------|----------------|------------|-------|
| Get Profile | `/client/me` | GET | DONE | CONNECTED | |
| Update Profile | `/client/me` | PUT | DONE | CONNECTED | |

## Notifications (Auth Required — shared)

| Feature | Endpoint | Method | Backend Status | App Status | Notes |
|---------|----------|--------|----------------|------------|-------|
| Register Push Token | `/push-tokens` | POST | DONE | CONNECTED | Body: `{ token, platform, device_id }` |
| Unregister Push Token | `/push-tokens` | DELETE | DONE | CONNECTED | Body: `{ token }` |
| Get Notifications | `/notifications` | GET | DONE | CONNECTED | Paginated |
| Unread Count | `/notifications/unread-count` | GET | DONE | CONNECTED | Returns `{ count }` |
| Mark Read | `/notifications/{id}/read` | POST | DONE | TODO | |
| Mark All Read | `/notifications/read-all` | POST | DONE | TODO | |

## Platform Settings (Public)

| Feature | Endpoint | Method | Backend Status | App Status | Notes |
|---------|----------|--------|----------------|------------|-------|
| Get Settings | `/platform-settings` | GET | DONE | TODO | Returns `{ vat_percent, delivery_fee, support_phone, support_whatsapp, platform_fee_perc }` |

---

## Status Legend
- **DONE** — Backend endpoint is implemented and functional
- **STUB 501** — Endpoint route exists but returns 501 "قريباً" (coming soon)
- **MISSING** — No endpoint exists yet, needs to be created
- **TODO** — App hasn't connected to this endpoint yet
- **CONNECTED** — App successfully calls this endpoint
- **TESTED** — End-to-end tested and verified
