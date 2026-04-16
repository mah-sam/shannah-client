import api, { BASE_URL, authHeaders } from "./api";

export async function registerPushToken(token: string, pushToken: string, platform: string) {
  try {
    await api.post(
      `${BASE_URL}/push-tokens`,
      { token: pushToken, platform },
      { headers: authHeaders(token) },
    );
  } catch (error) {
    console.error("Failed to register push token:", error);
  }
}

export async function unregisterPushToken(token: string, pushToken: string) {
  try {
    await api.delete(`${BASE_URL}/push-tokens`, {
      data: { token: pushToken },
      headers: authHeaders(token),
    });
  } catch (error) {
    console.error("Failed to unregister push token:", error);
  }
}

export async function getNotifications(token: string) {
  try {
    const response = await api.get(`${BASE_URL}/notifications`, {
      headers: authHeaders(token),
    });
    return response.data;
  } catch (error) {
    console.error(error);
    return { data: [] };
  }
}

export async function getUnreadCount(token: string) {
  try {
    const response = await api.get(
      `${BASE_URL}/notifications/unread-count`,
      { headers: authHeaders(token) },
    );
    return response.data;
  } catch (error) {
    return { count: 0 };
  }
}

export async function markNotificationRead(token: string, id: number | string) {
  try {
    await api.post(
      `${BASE_URL}/notifications/${id}/read`,
      {},
      { headers: authHeaders(token) },
    );
  } catch (error) {
    console.error(error);
  }
}

export async function markAllNotificationsRead(token: string) {
  try {
    await api.post(
      `${BASE_URL}/notifications/read-all`,
      {},
      { headers: authHeaders(token) },
    );
  } catch (error) {
    console.error(error);
  }
}
