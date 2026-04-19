import api, { BASE_URL, authHeaders } from "./api";

// Fire-and-forget mutations (push tokens, read markers) swallow errors on
// purpose: they are best-effort and must not interrupt the user's flow.
// Read endpoints propagate errors; `getUnreadCount` has a safe zero default
// because a failed badge must not crash the tab layout.

export async function registerPushToken(token: string, pushToken: string, platform: string) {
  try {
    await api.post(
      `${BASE_URL}/push-tokens`,
      { token: pushToken, platform },
      { headers: authHeaders(token) },
    );
  } catch (error) {
    console.warn("Failed to register push token:", error);
  }
}

export async function unregisterPushToken(token: string, pushToken: string) {
  try {
    await api.delete(`${BASE_URL}/push-tokens`, {
      data: { token: pushToken },
      headers: authHeaders(token),
    });
  } catch (error) {
    console.warn("Failed to unregister push token:", error);
  }
}

export async function getNotifications(token: string) {
  const response = await api.get(`${BASE_URL}/notifications`, {
    headers: authHeaders(token),
  });
  return response.data;
}

export async function getUnreadCount(token: string) {
  try {
    const response = await api.get(
      `${BASE_URL}/notifications/unread-count`,
      { headers: authHeaders(token) },
    );
    return response.data;
  } catch (error) {
    console.warn("Failed to fetch unread count:", error);
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
    console.warn("Failed to mark notification read:", error);
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
    console.warn("Failed to mark all notifications read:", error);
  }
}
