import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { router } from "expo-router";
import { deleteItemAsync } from "expo-secure-store";
import { Alert } from "react-native";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

// Response interceptor to handle 403 codes
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const code = error.response?.data?.code;

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

export async function login(email, password) {
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      email: email,
      password: password,
    });

    return response.data;
  } catch (error) {
    if (error.status === 422 || error.status === 403) {
      return error.response.data;
    }

    console.error(error);
  }
}

export async function sendOtp(phoneNumber) {
  try {
    const response = await axios.post(`${BASE_URL}/auth/otp/send`, {
      phone: phoneNumber,
    });

    return response.data;
  } catch (error) {
    if (error.status === 422) {
      return error.response.data;
    }

    console.error(error);
  }
}

export async function verifyOtp(phoneNumber, otp) {
  try {
    const response = await axios.post(`${BASE_URL}/auth/otp/verify`, {
      phone: phoneNumber,
      otp: otp,
    });

    return response.data;
  } catch (error) {
    if (error.status === 400 || error.status === 422) {
      return error.response.data;
    }
    console.error("Error verifying OTP:", error);
  }
}

export async function signUp(data) {
  try {
    const response = await axios.post(`${BASE_URL}/auth/register`, data);

    return response.data;
  } catch (error) {
    if (error.status === 422 || error.status === 403) {
      return error.response.data;
    }

    console.error(error);
  }
}

export async function verifyEmailOtp(email, otp) {
  try {
    const response = await axios.post(`${BASE_URL}/auth/email-otp/verify`, {
      email: email,
      otp: otp,
    });

    return response.data;
  } catch (error) {
    if (error.status === 400 || error.status === 422) {
      return error.response.data;
    }
    console.error("Error verifying OTP:", error);
  }
}

export async function profileComplete(token, data) {
  try {
    const response = await axios.post(
      `${BASE_URL}/auth/profile/complete`,
      data,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    return response.data;
  } catch (error) {
    if (error.status === 422) {
      return error.response.data;
    }

    console.error(error);
  }
}

export async function getStores(token = null, id = null) {
  const url = id === null ? `${BASE_URL}/stores` : `${BASE_URL}/stores/${id}`;
  const headers =
    token === null
      ? {}
      : {
          Authorization: `Bearer ${token}`,
        };
  try {
    const response = await axios.get(url, { headers: headers });

    return response.data;
  } catch (error) {
    console.error(error);
  }
}

export async function getProduct(id) {
  try {
    const response = await axios.get(`${BASE_URL}/products/${id}`);

    return response.data;
  } catch (error) {
    console.error(error);
  }
}

export async function submitOrder(token, order) {
  try {
    const response = await axios.post(`${BASE_URL}/client/orders`, order, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    if (error.status === 422) {
      return error.response.data;
    }

    console.error(error.response.data);
  }
}

export async function orderDetails(token, id) {
  try {
    const response = await axios.get(`${BASE_URL}/client/orders/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    if (error.status === 422) {
      return error.response.data;
    }

    console.error(error);
  }
}

export async function getUserInfo(token) {
  try {
    const response = await axios.get(`${BASE_URL}/client/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error(error);
  }
}

export async function updateUserInfo(token, data) {
  try {
    const response = await axios.put(`${BASE_URL}/client/me`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    if (error.status === 422) {
      return error.response.data;
    }

    console.error(error);
  }
}

export async function getOrders(token) {
  try {
    const response = await axios.get(`${BASE_URL}/client/orders`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error(error);
  }
}

export async function saveOrUpdateAddress(
  token,
  address,
  action = "create",
  addressId = null,
) {
  try {
    const url =
      action === "update" && addressId
        ? `${BASE_URL}/client/addresses/${addressId}`
        : `${BASE_URL}/client/addresses`;

    const method = action === "update" ? "put" : "post";

    const response = await axios[method](url, address, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    if (error.status === 422) {
      return error.response.data;
    }

    console.error(error.response.data);
  }
}

// Keep old function for backward compatibility
export async function saveAddress(token, address) {
  return saveOrUpdateAddress(token, address, "create");
}

export async function getAddresses(token) {
  try {
    const response = await axios.get(`${BASE_URL}/client/addresses`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error(error);
  }
}

export async function getAddress(token, id) {
  try {
    const response = await axios.get(`${BASE_URL}/client/addresses/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error(error);
  }
}

export async function deleteAddress(token, id) {
  try {
    const response = await axios.delete(`${BASE_URL}/client/addresses/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    if (error.status === 422) {
      return error.response.data;
    }

    console.error(error);
  }
}

export async function getFavorites(token) {
  try {
    const response = await axios.get(`${BASE_URL}/client/favorites`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error(error);
  }
}

export async function toggleFavorite(token, type, id) {
  try {
    const response = await axios.post(
      `${BASE_URL}/client/favorites/toggle`,
      {
        type: type,
        id: id,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    return response.data;
  } catch (error) {
    console.error(error);
    return { favorited: false };
  }
}

export async function search(q) {
  try {
    const response = await axios.get(
      `${BASE_URL}/search?q=${encodeURIComponent(q)}`,
    );

    return response.data;
  } catch (error) {
    if (error.status === 422) {
      return error.response.data;
    }

    console.error(error);
  }
}

export async function searchTags() {
  try {
    const response = await axios.get(`${BASE_URL}/search/tags`);

    return response.data;
  } catch (error) {
    console.error(error);
  }
}

export async function getPlatformSettings() {
  try {
    const response = await axios.get(`${BASE_URL}/platform-settings`);
    return response.data;
  } catch (error) {
    console.error(error);
    return { vat_percent: 15, delivery_fee: 0 };
  }
}

export async function applyCoupon(token, code, items) {
  try {
    const response = await axios.post(
      `${BASE_URL}/client/coupons/apply`,
      { code, items },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    return response.data;
  } catch (error) {
    if (error.response?.status === 422) {
      return error.response.data;
    }

    console.error(error);
  }
}

export async function submitReview(token, orderId, rating) {
  try {
    const response = await axios.post(
      `${BASE_URL}/client/reviews`,
      { order_id: orderId, rating },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    return response.data;
  } catch (error) {
    if (error.response?.status === 422) {
      return error.response.data;
    }

    console.error(error);
  }
}

// ─── Push Tokens ────────────────────────────────────────────────────────────

export async function registerPushToken(token, pushToken, platform) {
  try {
    await axios.post(
      `${BASE_URL}/push-tokens`,
      { token: pushToken, platform },
      { headers: { Authorization: `Bearer ${token}` } },
    );
  } catch (error) {
    console.error("Failed to register push token:", error);
  }
}

export async function unregisterPushToken(token, pushToken) {
  try {
    await axios.delete(`${BASE_URL}/push-tokens`, {
      data: { token: pushToken },
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch (error) {
    console.error("Failed to unregister push token:", error);
  }
}

// ─── Notifications ───────────────────────────────────────────────────────────

export async function getNotifications(token) {
  try {
    const response = await axios.get(`${BASE_URL}/notifications`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error(error);
    return { data: [] };
  }
}

export async function getUnreadCount(token) {
  try {
    const response = await axios.get(
      `${BASE_URL}/notifications/unread-count`,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    return response.data;
  } catch (error) {
    return { count: 0 };
  }
}

export async function markNotificationRead(token, id) {
  try {
    await axios.post(
      `${BASE_URL}/notifications/${id}/read`,
      {},
      { headers: { Authorization: `Bearer ${token}` } },
    );
  } catch (error) {
    console.error(error);
  }
}

export async function markAllNotificationsRead(token) {
  try {
    await axios.post(
      `${BASE_URL}/notifications/read-all`,
      {},
      { headers: { Authorization: `Bearer ${token}` } },
    );
  } catch (error) {
    console.error(error);
  }
}
