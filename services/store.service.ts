import { AxiosError } from "axios";
import api, { BASE_URL } from "./api";

export async function getStores(token: string | null = null, id: number | string | null = null) {
  const url = id === null ? `${BASE_URL}/stores` : `${BASE_URL}/stores/${id}`;
  const headers: Record<string, string> =
    token === null ? {} : { Authorization: `Bearer ${token}` };
  try {
    const response = await api.get(url, { headers });
    return response.data;
  } catch (error) {
    console.error(error);
  }
}

export async function getProduct(id: number | string) {
  try {
    const response = await api.get(`${BASE_URL}/products/${id}`);
    return response.data;
  } catch (error) {
    console.error(error);
  }
}

export async function search(q: string) {
  try {
    const response = await api.get(
      `${BASE_URL}/search?q=${encodeURIComponent(q)}`,
    );
    return response.data;
  } catch (error) {
    const e = error as AxiosError;
    if (e.response?.status === 422) {
      return e.response.data;
    }
    console.error(error);
  }
}

export async function searchTags() {
  try {
    const response = await api.get(`${BASE_URL}/search/tags`);
    return response.data;
  } catch (error) {
    console.error(error);
  }
}

export async function getPlatformSettings() {
  try {
    const response = await api.get(`${BASE_URL}/platform-settings`);
    return response.data;
  } catch (error) {
    console.error(error);
    return { vat_percent: 15, delivery_fee: 0 };
  }
}
