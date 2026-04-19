import { AxiosError } from "axios";
import api, { BASE_URL, authHeaders } from "./api";

// Auth endpoints intentionally catch 422/403 and return the server's error body
// so the calling screen can render field-level validation feedback.
// All other errors (network, 5xx, timeouts) propagate to the caller.

function passthroughValidation(error: unknown, statuses: number[]) {
  const e = error as AxiosError;
  if (e.response && statuses.includes(e.response.status)) {
    return e.response.data;
  }
  throw error;
}

export async function login(email: string, password: string) {
  try {
    const response = await api.post(`${BASE_URL}/auth/login`, { email, password });
    return response.data;
  } catch (error) {
    return passthroughValidation(error, [400, 403, 422]);
  }
}

export async function sendOtp(phoneNumber: string) {
  try {
    const response = await api.post(`${BASE_URL}/auth/otp/send`, { phone: phoneNumber });
    return response.data;
  } catch (error) {
    return passthroughValidation(error, [422, 429]);
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
    return passthroughValidation(error, [400, 422]);
  }
}

export async function signUp(data: Record<string, unknown>) {
  try {
    const response = await api.post(`${BASE_URL}/auth/register`, data);
    return response.data;
  } catch (error) {
    return passthroughValidation(error, [403, 422]);
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
    return passthroughValidation(error, [400, 422]);
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
    return passthroughValidation(error, [422]);
  }
}

export async function logout(token: string) {
  // Fire-and-forget: local cleanup (token removal, state reset) must proceed
  // regardless of the server response. We do not throw on network error.
  try {
    await api.post(`${BASE_URL}/auth/logout`, {}, { headers: authHeaders(token) });
  } catch (error) {
    console.warn("Logout API call failed:", error);
  }
}

export async function getUserInfo(token: string) {
  const response = await api.get(`${BASE_URL}/client/me`, {
    headers: authHeaders(token),
  });
  return response.data;
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
    return passthroughValidation(error, [422]);
  }
}

export async function sendPasswordResetOtp(email: string) {
  // Reuses the email-OTP mechanism: the OTP is stored on the user and
  // consumed by POST /auth/reset-password.
  try {
    const response = await api.post(`${BASE_URL}/auth/email-otp/send`, { email });
    return response.data;
  } catch (error) {
    return passthroughValidation(error, [404, 422, 429]);
  }
}

export async function verifyPasswordResetOtp(email: string, otp: string) {
  // type=reset lets the backend validate the OTP without consuming it, so the
  // subsequent /auth/reset-password call still accepts the same code.
  try {
    const response = await api.post(`${BASE_URL}/auth/email-otp/verify`, {
      email,
      otp,
      type: "reset",
    });
    return response.data;
  } catch (error) {
    return passthroughValidation(error, [400, 422]);
  }
}

export async function resetPassword(
  email: string,
  otp: string,
  password: string,
  passwordConfirmation: string,
) {
  try {
    const response = await api.post(`${BASE_URL}/auth/reset-password`, {
      email,
      otp,
      password,
      password_confirmation: passwordConfirmation,
    });
    return response.data;
  } catch (error) {
    return passthroughValidation(error, [400, 422, 404]);
  }
}
