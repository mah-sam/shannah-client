/**
 * Barrel re-export — all imports from "services/shannahApi" continue to work.
 *
 * The actual implementations are now split into domain service files:
 *   - api.js          — axios instance + interceptors
 *   - auth.service.js — login, OTP, signup, profile
 *   - store.service.js — stores, products, search
 *   - order.service.js — orders, coupons, reviews
 *   - address.service.js — address CRUD
 *   - favorite.service.js — favorites
 *   - notification.service.js — push tokens, notifications
 */

export { login, logout, sendOtp, verifyOtp, signUp, verifyEmailOtp, profileComplete, getUserInfo, updateUserInfo } from "./auth.service";
export { getStores, getProduct, search, searchTags, getPlatformSettings } from "./store.service";
export { submitOrder, orderDetails, getOrders, applyCoupon, submitReview } from "./order.service";
export { saveOrUpdateAddress, saveAddress, getAddresses, getAddress, deleteAddress } from "./address.service";
export { getFavorites, toggleFavorite } from "./favorite.service";
export { registerPushToken, unregisterPushToken, getNotifications, getUnreadCount, markNotificationRead, markAllNotificationsRead } from "./notification.service";
