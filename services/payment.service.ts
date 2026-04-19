import api, { BASE_URL, authHeaders } from "./api";

/**
 * Payment method IDs understood by the backend. Today only "cod" is
 * selectable in the UI; the rest are forward-compat so future gateway work
 * needs no client changes beyond enabling the selector.
 */
export type PaymentMethod =
  | "cod"
  | "card"
  | "apple_pay"
  | "mada"
  | "stc_pay"
  | "wallet";

export interface InitiatePaymentResponse {
  status: "completed" | "requires_payment" | "failed" | "not_implemented";
  order_id: number;
  method: PaymentMethod;
  payment_url?: string;
  message?: string;
}

/**
 * Call after submitOrder() to finalize the payment side of the transaction.
 * For COD this is a no-op acknowledgement; for future gateways the client
 * should inspect `status` and open `payment_url` when status === "requires_payment".
 */
export async function initiatePayment(
  token: string,
  orderId: number | string,
  method: PaymentMethod = "cod",
): Promise<InitiatePaymentResponse> {
  const response = await api.post(
    `${BASE_URL}/client/payments/initiate/${orderId}`,
    { method },
    { headers: authHeaders(token) },
  );
  return response.data;
}
