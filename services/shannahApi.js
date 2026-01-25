import axios from "axios";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

export async function login(email, password) {
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      email: email,
      password: password,
    });

    return response.data;
  } catch (error) {
    if (error.status === 422) {
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

export async function getStores(id = null) {
  const url = id === null ? `${BASE_URL}/stores` : `${BASE_URL}/stores/${id}`;
  try {
    const response = await axios.get(url);

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
  console.log(token, order);
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
