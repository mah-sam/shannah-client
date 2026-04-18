import { AxiosError } from "axios";
import api, { BASE_URL, authHeaders } from "./api";

export async function login(email: string, password: string) {
  try {
    const response = await api.post(`${BASE_URL}/auth/login`, {
      email,
      password,
    });
    return response.data;
  } catch (error) {
    const e = error as AxiosError;
    if (e.response?.status === 422 || e.response?.status === 403) {
      return e.response.data;
    }
    console.error(error);
  }
}

export async function sendOtp(phoneNumber: string) {
  try {
    const response = await api.post(`${BASE_URL}/auth/otp/send`, {
      phone: phoneNumber,
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

export async function verifyOtp(phoneNumber: string, otp: string) {
  try {
    const response = await api.post(`${BASE_URL}/auth/otp/verify`, {
      phone: phoneNumber,
      otp,
    });
    return response.data;
  } catch (error) {
    const e = error as AxiosError;
    if (e.response?.status === 400 || e.response?.status === 422) {
      return e.response.data;
    }
    console.error("Error verifying OTP:", error);
  }
}

export async function signUp(data: Record<string, unknown>) {
  try {
    const response = await api.post(`${BASE_URL}/auth/register`, data);
    return response.data;
  } catch (error) {
    const e = error as AxiosError;
    if (e.response?.status === 422 || e.response?.status === 403) {
      return e.response.data;
    }
    console.error(error);
  }
}

export async function verifyEmailOtp(email: string, otp: string) {
  try {
    const response = await api.post(`${BASE_URL}/auth/email-otp/verify`, {
      email,
      otp,
    });
    return response.data;
  } catch (error) {
    const e = error as AxiosError;
    if (e.response?.status === 400 || e.response?.status === 422) {
      return e.response.data;
    }
    console.error("Error verifying OTP:", error);
  }
}

export async function profileComplete(
  token: string,
  data: Record<string, unknown>,
) {
  try {
    const response = await api.post(
      `${BASE_URL}/auth/profile/complete`,
      data,
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

export async function logout(token: string) {
  try {
    await api.post(`${BASE_URL}/auth/logout`, {}, {
      headers: authHeaders(token),
    });
  } catch (error) {
    // Non-critical — local cleanup will proceed regardless
    console.error("Logout API call failed:", error);
  }
}

export async function getUserInfo(token: string) {
  try {
    const response = await api.get(`${BASE_URL}/client/me`, {
      headers: authHeaders(token),
    });
    return response.data;
  } catch (error) {
    console.error(error);
  }
}

export async function updateUserInfo(
  token: string,
  data: Record<string, unknown>,
) {
  try {
    const response = await api.put(`${BASE_URL}/client/me`, data, {
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
