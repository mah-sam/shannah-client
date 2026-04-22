/**
 * Barrel re-export — all imports from "services/shannahApi" continue to work.
 *
 * The actual implementations are now split into domain service files:
 *   - api.js          — axios instance + interceptors
 *   - auth.service.js — phone OTP, profile, password reset (legacy)
 *   - store.service.js — stores, products, search
 *   - order.service.js — orders, coupons, reviews
 *   - address.service.js — address CRUD
 *   - favorite.service.js — favorites
 *   - notification.service.js — push tokens, notifications
 *
 * Customer auth is phone-OTP only — email login/signup endpoints (`login`,
 * `signUp`, `verifyEmailOtp`) are no longer used by the client and were
 * removed from this barrel. Definitions remain in auth.service.ts in case
 * a future admin-facing surface needs them.
 */

export { logout, sendOtp, verifyOtp, profileComplete, getUserInfo, updateUserInfo, sendPasswordResetOtp, verifyPasswordResetOtp, resetPassword } from "./auth.service";
export { getStores, getProduct, search, searchTags, getPlatformSettings } from "./store.service";
export { submitOrder, orderDetails, getOrders, applyCoupon, submitReview } from "./order.service";
export { saveOrUpdateAddress, saveAddress, getAddresses, getAddress, deleteAddress } from "./address.service";
export { getFavorites, toggleFavorite } from "./favorite.service";
export { registerPushToken, unregisterPushToken, getNotifications, getUnreadCount, markNotificationRead, markAllNotificationsRead } from "./notification.service";
export { initiatePayment } from "./payment.service";
export type { PaymentMethod, InitiatePaymentResponse } from "./payment.service";
