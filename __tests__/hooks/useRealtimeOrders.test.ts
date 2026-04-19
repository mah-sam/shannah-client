/**
 * Tests for useRealtimeOrders.
 *
 * We mock the realtime service rather than pusher-js so we stay independent
 * of the transport library and only verify the hook's own contract:
 *   - subscribes to `user.{id}` on mount
 *   - unsubscribes on unmount
 *   - forwards the two expected events to the provided handlers
 *   - skips everything when userId is nullish
 */

import { renderHook } from "@testing-library/react-native";

// Must be prefixed with `mock` to satisfy Jest's hoisting rules for jest.mock().
const mockSubscribe = jest.fn();
const mockUnsubscribe = jest.fn();
const mockListeners = new Map<string, Set<(data: unknown) => void>>();
const mockOn = jest.fn((event: string, listener: (d: unknown) => void) => {
  let set = mockListeners.get(event);
  if (!set) {
    set = new Set();
    mockListeners.set(event, set);
  }
  set.add(listener);
  return () => set!.delete(listener);
});

function emit(event: string, data: unknown) {
  mockListeners.get(event)?.forEach((fn) => fn(data));
}

jest.mock("../../services/realtime.service", () => ({
  realtimeService: {
    subscribe: (...args: unknown[]) => (mockSubscribe as any)(...args),
    unsubscribe: (...args: unknown[]) => (mockUnsubscribe as any)(...args),
    on: (...args: unknown[]) => (mockOn as any)(...args),
  },
}));

import { useRealtimeOrders } from "../../hooks/useRealtimeOrders";

beforeEach(() => {
  mockSubscribe.mockClear();
  mockUnsubscribe.mockClear();
  mockOn.mockClear();
  mockListeners.clear();
});

test("subscribes to the correct channel on mount", () => {
  renderHook(() =>
    useRealtimeOrders(42, {
      onStatusUpdate: jest.fn(),
      onCancelled: jest.fn(),
    }),
  );

  expect(mockSubscribe).toHaveBeenCalledWith("user.42");
});

test("does nothing when userId is nullish", () => {
  renderHook(() => useRealtimeOrders(null, { onStatusUpdate: jest.fn() }));
  expect(mockSubscribe).not.toHaveBeenCalled();
});

test("unsubscribes on unmount", () => {
  const { unmount } = renderHook(() =>
    useRealtimeOrders(7, { onStatusUpdate: jest.fn(), onCancelled: jest.fn() }),
  );
  unmount();
  expect(mockUnsubscribe).toHaveBeenCalledWith("user.7");
});

test("forwards order.status_updated to the handler", () => {
  const onStatusUpdate = jest.fn();
  renderHook(() => useRealtimeOrders(7, { onStatusUpdate }));

  emit("order.status_updated", { order_id: 123, new_status: "delivered" });
  expect(onStatusUpdate).toHaveBeenCalledWith({
    order_id: 123,
    new_status: "delivered",
  });
});

test("forwards order.cancelled to the handler", () => {
  const onCancelled = jest.fn();
  renderHook(() => useRealtimeOrders(7, { onCancelled }));

  emit("order.cancelled", { order_id: 9, reason: "store_closed" });
  expect(onCancelled).toHaveBeenCalledWith({ order_id: 9, reason: "store_closed" });
});

test("omitting a handler skips its listener", () => {
  renderHook(() => useRealtimeOrders(7, { onCancelled: jest.fn() }));

  expect(() =>
    emit("order.status_updated", { order_id: 1, new_status: "delivered" }),
  ).not.toThrow();
});
