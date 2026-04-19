import { AxiosError } from "axios";
import api, { BASE_URL, authHeaders } from "./api";

// Mutations catch validation errors (422) and return the server body so the
// calling screen can render field-level feedback. Other failures propagate.

function passthrough422(error: unknown) {
  const e = error as AxiosError;
  if (e.response?.status === 422) {
    return e.response.data;
  }
  throw error;
}

export async function submitOrder(token: string, order: Record<string, unknown>) {
  try {
    const response = await api.post(`${BASE_URL}/client/orders`, order, {
      headers: authHeaders(token),
    });
    return response.data;
  } catch (error) {
    return passthrough422(error);
  }
}

export async function orderDetails(token: string, id: number | string) {
  const response = await api.get(`${BASE_URL}/client/orders/${id}`, {
    headers: authHeaders(token),
  });
  return response.data;
}

export async function getOrders(token: string) {
  const response = await api.get(`${BASE_URL}/client/orders`, {
    headers: authHeaders(token),
  });
  return response.data;
}

export async function applyCoupon(token: string, code: string, items: unknown) {
  try {
    const response = await api.post(
      `${BASE_URL}/client/coupons/apply`,
      { code, items },
      { headers: authHeaders(token) },
    );
    return response.data;
  } catch (error) {
    return passthrough422(error);
  }
}

export async function submitReview(token: string, orderId: number | string, rating: number) {
  try {
    const response = await api.post(
      `${BASE_URL}/client/reviews`,
      { order_id: orderId, rating },
      { headers: authHeaders(token) },
    );
    return response.data;
  } catch (error) {
    return passthrough422(error);
  }
}
