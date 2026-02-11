import axios from "axios";
import { router } from "expo-router";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

// Response interceptor to handle 403 with PROFILE_INCOMPLETE
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response?.status === 403 &&
      error.response?.data?.status === false &&
      error.response?.data?.code === "PROFILE_INCOMPLETE"
    ) {
      router.push("/profile-complete");
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
    if (error.status === 422) {
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
