/**
 * Subscribes the current user to live order updates via Reverb.
 *
 * Channel: `private-user.{userId}`
 * Events:
 *   - order.status_updated → payload { order_id, old_status, new_status, delivered_at }
 *   - order.cancelled      → payload { order_id, reason }
 *
 * Callers pass the user id and the handlers they want to run on each event.
 * The hook manages subscribe/unsubscribe and the listener lifecycle; callers
 * only need to care about what to do with the payload.
 */

import { useEffect } from "react";
import { realtimeService } from "../services/realtime.service";

export interface OrderStatusUpdate {
  order_id: number;
  old_status?: string;
  new_status: string;
  delivered_at?: string | null;
}

export interface OrderCancelledPayload {
  order_id: number;
  reason?: string | null;
}

interface Options {
  onStatusUpdate?: (payload: OrderStatusUpdate) => void;
  onCancelled?: (payload: OrderCancelledPayload) => void;
}

export function useRealtimeOrders(
  userId: number | string | null | undefined,
  { onStatusUpdate, onCancelled }: Options,
): void {
  useEffect(() => {
    if (userId == null) return;

    const channelName = `user.${userId}`;
    realtimeService.subscribe(channelName);

    const unsubStatus = onStatusUpdate
      ? realtimeService.on("order.status_updated", (data) =>
          onStatusUpdate(data as OrderStatusUpdate),
        )
      : () => {};

    const unsubCancelled = onCancelled
      ? realtimeService.on("order.cancelled", (data) =>
          onCancelled(data as OrderCancelledPayload),
        )
      : () => {};

    return () => {
      unsubStatus();
      unsubCancelled();
      realtimeService.unsubscribe(channelName);
    };
  }, [userId, onStatusUpdate, onCancelled]);
}
