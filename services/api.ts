/**
 * Shared API client setup for the customer app.
 *
 * Creates and configures the axios instance with:
 * - Base URL from environment
 * - Response interceptor for 403 PROFILE_INCOMPLETE and ACCOUNT_SUSPENDED
 *
 * All domain service files import `api` from here instead of using raw axios.
 */
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { router } from "expo-router";
import { deleteItemAsync } from "expo-secure-store";
import { Alert } from "react-native";
import { addBreadcrumb, captureException } from "../utils/errorReporting";

export const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

type SessionExpiredHandler = () => void;
let onSessionExpired: SessionExpiredHandler | null = null;

export function setSessionExpiredHandler(fn: SessionExpiredHandler | null) {
  onSessionExpired = fn;
}

let sessionExpiredFired = false;

// Response interceptor to handle 401/403 codes + forward failures to error reporting
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const code = error.response?.data?.code;
    const status = error.response?.status;
    const url = error.config?.url;

    // Log a breadcrumb for every failure; unexpected 5xx get captured as
    // exceptions so we have backend-facing reliability signals.
    addBreadcrumb({
      category: "api",
      message: `${error.config?.method?.toUpperCase?.() ?? "REQ"} ${url ?? ""} → ${status ?? "network"}`,
      data: { code },
    });
    if (status && status >= 500) {
      captureException(error, { category: "api", url, status });
    }

    if (error.response?.status === 401) {
      if (!sessionExpiredFired) {
        sessionExpiredFired = true;
        try {
          await deleteItemAsync("token");
          await AsyncStorage.removeItem("user");
        } catch {
          // ignore storage errors
        }
        if (onSessionExpired) {
          onSessionExpired();
        } else {
          router.replace("/sign-in");
        }
        setTimeout(() => {
          sessionExpiredFired = false;
        }, 2000);
      }
    }

    if (error.response?.status === 403 && code === "PROFILE_INCOMPLETE") {
      router.push("/profile-complete");
    }

    if (error.response?.status === 403 && code === "ACCOUNT_SUSPENDED") {
      await deleteItemAsync("token");
      await AsyncStorage.removeItem("user");
      router.replace("/sign-in");
      Alert.alert("حساب موقوف", "حسابك موقوف. تواصل مع الدعم.");
    }

    return Promise.reject(error);
  },
);

export function authHeaders(token: string | null): Record<string, string> {
  return { Authorization: `Bearer ${token ?? ""}` };
}

export default api;
