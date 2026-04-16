import { AxiosError } from "axios";
import api, { BASE_URL, authHeaders } from "./api";

export async function submitOrder(token: string, order: Record<string, unknown>) {
  try {
    const response = await api.post(`${BASE_URL}/client/orders`, order, {
      headers: authHeaders(token),
    });
    return response.data;
  } catch (error) {
    const e = error as AxiosError;
    if (e.response?.status === 422) {
      return e.response.data;
    }
    console.error(e.response?.data);
  }
}

export async function orderDetails(token: string, id: number | string) {
  try {
    const response = await api.get(`${BASE_URL}/client/orders/${id}`, {
      headers: authHeaders(token),
    });
    return response.data;
  } catch (error) {
    const e = error as AxiosError;
    if (e.response?.status === 422) {
      return e.response.data;
    }
    console.error(error);
  }
}

export async function getOrders(token: string) {
  try {
    const response = await api.get(`${BASE_URL}/client/orders`, {
      headers: authHeaders(token),
    });
    return response.data;
  } catch (error) {
    console.error(error);
  }
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
    const e = error as AxiosError;
    if (e.response?.status === 422) {
      return e.response.data;
    }
    console.error(error);
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
    const e = error as AxiosError;
    if (e.response?.status === 422) {
      return e.response.data;
    }
    console.error(error);
  }
}
