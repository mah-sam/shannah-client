import { AxiosError } from "axios";
import api, { BASE_URL } from "./api";

// Read endpoints propagate errors to the caller. Screens handle them by
// rendering ErrorState with a retry button or a toast, per the UX pattern.

export async function getStores(token: string | null = null, id: number | string | null = null) {
  const url = id === null ? `${BASE_URL}/stores` : `${BASE_URL}/stores/${id}`;
  const headers: Record<string, string> =
    token === null ? {} : { Authorization: `Bearer ${token}` };
  const response = await api.get(url, { headers });
  return response.data;
}

export async function getProduct(id: number | string) {
  const response = await api.get(`${BASE_URL}/products/${id}`);
  return response.data;
}

export async function search(q: string) {
  try {
    const response = await api.get(
      `${BASE_URL}/search?q=${encodeURIComponent(q)}`,
    );
    return response.data;
  } catch (error) {
    // 422 is a valid business response (e.g. "query too short") and the caller
    // inspects the returned body. Other failures propagate.
    const e = error as AxiosError;
    if (e.response?.status === 422) {
      return e.response.data;
    }
    throw error;
  }
}

export async function searchTags() {
  const response = await api.get(`${BASE_URL}/search/tags`);
  return response.data;
}

export async function getPlatformSettings() {
  // Platform settings have safe numeric defaults so checkout math never breaks
  // even when the endpoint is unreachable. This is a deliberate product choice,
  // not silent failure: the VAT % and delivery fee are recomputed server-side
  // at order submission regardless of what the client displayed.
  try {
    const response = await api.get(`${BASE_URL}/platform-settings`);
    return response.data;
  } catch (error) {
    console.warn("Platform settings unreachable, using defaults:", error);
    return {
      vat_percent: 15,
      delivery_fee: 0,
      support_phone: "",
      support_whatsapp: "",
      platform_fee_perc: 8,
    };
  }
}
