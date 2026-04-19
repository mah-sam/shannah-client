import { AxiosError } from "axios";
import api, { BASE_URL, authHeaders } from "./api";

function passthrough422(error: unknown) {
  const e = error as AxiosError;
  if (e.response?.status === 422) {
    return e.response.data;
  }
  throw error;
}

export async function saveOrUpdateAddress(
  token: string,
  address: Record<string, unknown>,
  action: "create" | "update" = "create",
  addressId: number | string | null = null,
) {
  try {
    const url =
      action === "update" && addressId
        ? `${BASE_URL}/client/addresses/${addressId}`
        : `${BASE_URL}/client/addresses`;

    const method = action === "update" ? "put" : "post";

    const response = await api[method](url, address, {
      headers: authHeaders(token),
    });
    return response.data;
  } catch (error) {
    return passthrough422(error);
  }
}

export async function saveAddress(token: string, address: Record<string, unknown>) {
  return saveOrUpdateAddress(token, address, "create");
}

export async function getAddresses(token: string) {
  const response = await api.get(`${BASE_URL}/client/addresses`, {
    headers: authHeaders(token),
  });
  return response.data;
}

export async function getAddress(token: string, id: number | string) {
  const response = await api.get(`${BASE_URL}/client/addresses/${id}`, {
    headers: authHeaders(token),
  });
  return response.data;
}

export async function deleteAddress(token: string, id: number | string) {
  try {
    const response = await api.delete(`${BASE_URL}/client/addresses/${id}`, {
      headers: authHeaders(token),
    });
    return response.data;
  } catch (error) {
    return passthrough422(error);
  }
}
