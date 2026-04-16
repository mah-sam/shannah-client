import api, { BASE_URL, authHeaders } from "./api";

export async function getFavorites(token: string) {
  try {
    const response = await api.get(`${BASE_URL}/client/favorites`, {
      headers: authHeaders(token),
    });
    return response.data;
  } catch (error) {
    console.error(error);
  }
}

export async function toggleFavorite(token: string, type: string, id: number | string) {
  try {
    const response = await api.post(
      `${BASE_URL}/client/favorites/toggle`,
      { type, id },
      { headers: authHeaders(token) },
    );
    return response.data;
  } catch (error) {
    console.error(error);
    return { favorited: false };
  }
}
