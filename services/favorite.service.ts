import api, { BASE_URL, authHeaders } from "./api";

export async function getFavorites(token: string) {
  const response = await api.get(`${BASE_URL}/client/favorites`, {
    headers: authHeaders(token),
  });
  return response.data;
}

export async function toggleFavorite(token: string, type: string, id: number | string) {
  const response = await api.post(
    `${BASE_URL}/client/favorites/toggle`,
    { type, id },
    { headers: authHeaders(token) },
  );
  return response.data;
}
