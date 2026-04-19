/**
 * Realtime service — client app connection to Laravel Reverb.
 *
 * Mirrors the pattern used in `shannah-rider/services/websocket.service.ts`
 * so both apps share a single Reverb cluster. Distinct channel namespaces
 * (`driver.{id}`, `user.{id}`, `conversation.{id}`) are authorized per-app
 * via `POST /api/broadcasting/auth` with Sanctum bearer tokens.
 *
 * Library: `pusher-js` (Reverb exposes the Pusher wire protocol).
 *
 * Lifecycle:
 *   connect(token) on sign-in → disconnect() on sign-out (or 401 interceptor).
 *   Reconnect is handled automatically by pusher-js. If the WS server is
 *   unreachable the app continues to work with pull-to-refresh fallback.
 */

// pusher-js is listed in package.json but typechecking runs before
// `npm install` in clean clones; ignore missing types until the dep is
// present. The service is a no-op at runtime until configured env vars
// are set anyway.
// @ts-ignore — resolved after `npm install pusher-js`
import Pusher, { Channel } from "pusher-js";
import { BASE_URL } from "./api";

export type RealtimeListener = (data: unknown) => void;

const WS_HOST = process.env.EXPO_PUBLIC_WS_HOST ?? "localhost";
const WS_PORT = parseInt(process.env.EXPO_PUBLIC_WS_PORT ?? "8080", 10);
const WS_KEY = process.env.EXPO_PUBLIC_WS_KEY ?? "shannah-key";
const WS_FORCE_TLS = (process.env.EXPO_PUBLIC_WS_SCHEME ?? "http") === "https";

class RealtimeService {
  private pusher: Pusher | null = null;
  private subscribedChannels: Map<string, Channel> = new Map();
  private listeners: Map<string, Set<RealtimeListener>> = new Map();
  private connected = false;
  private connectionListeners: Set<(connected: boolean) => void> = new Set();
  private currentToken: string | null = null;

  get isConnected(): boolean {
    return this.connected;
  }

  onConnectionChange(listener: (connected: boolean) => void): () => void {
    this.connectionListeners.add(listener);
    return () => {
      this.connectionListeners.delete(listener);
    };
  }

  private setConnected(value: boolean): void {
    if (this.connected === value) return;
    this.connected = value;
    this.connectionListeners.forEach((fn) => {
      try {
        fn(value);
      } catch {
        // Never let a listener crash the service
      }
    });
  }

  /**
   * Connect to Reverb. Safe to call multiple times with the same token; a
   * token change triggers a reconnect so the new Sanctum identity is used
   * for private-channel auth.
   */
  connect(token: string | null): void {
    if (!token) {
      this.disconnect();
      return;
    }

    if (this.pusher && this.currentToken === token) {
      return;
    }

    if (this.pusher) {
      this.disconnect();
    }

    if (!BASE_URL) {
      console.warn("[realtime] BASE_URL not configured, skipping connect");
      return;
    }

    this.currentToken = token;

    const authEndpoint =
      BASE_URL.replace(/\/api\/?$/, "") + "/api/broadcasting/auth";

    this.pusher = new Pusher(WS_KEY, {
      wsHost: WS_HOST,
      wsPort: WS_PORT,
      wssPort: WS_PORT,
      forceTLS: WS_FORCE_TLS,
      disableStats: true,
      enabledTransports: WS_FORCE_TLS ? ["wss"] : ["ws", "wss"],
      cluster: "",
      authEndpoint,
      auth: {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      },
    });

    this.pusher.connection.bind("connected", () => {
      this.setConnected(true);
    });

    this.pusher.connection.bind("disconnected", () => {
      this.setConnected(false);
    });

    this.pusher.connection.bind("error", (err: unknown) => {
      console.warn("[realtime] connection error:", err);
    });
  }

  disconnect(): void {
    if (this.pusher) {
      this.pusher.disconnect();
      this.pusher = null;
    }
    this.subscribedChannels.clear();
    this.currentToken = null;
    this.setConnected(false);
  }

  /**
   * Subscribe to a private channel by its short name (without "private-").
   * Example: `subscribe("user.19")` subscribes to "private-user.19".
   */
  subscribe(channelName: string): void {
    if (!this.pusher) {
      console.warn(
        `[realtime] cannot subscribe to "${channelName}" — not connected`,
      );
      return;
    }

    const fullName = `private-${channelName}`;
    if (this.subscribedChannels.has(fullName)) return;

    const channel = this.pusher.subscribe(fullName);
    this.subscribedChannels.set(fullName, channel);

    // Bind every registered listener to this new channel so events fire on
    // existing listeners without re-registering.
    this.listeners.forEach((listenerSet, event) => {
      channel.bind(event, (data: unknown) => {
        listenerSet.forEach((listener) => {
          try {
            listener(data);
          } catch (err) {
            console.warn(
              `[realtime] listener error on "${event}":`,
              err,
            );
          }
        });
      });
    });
  }

  unsubscribe(channelName: string): void {
    const fullName = `private-${channelName}`;
    if (this.pusher && this.subscribedChannels.has(fullName)) {
      this.pusher.unsubscribe(fullName);
      this.subscribedChannels.delete(fullName);
    }
  }

  /**
   * Listen for a broadcast event across all subscribed channels.
   * Event names match the server-side `broadcastAs()` (e.g. "order.status_updated").
   * Returns an unsubscribe function.
   */
  on(event: string, listener: RealtimeListener): () => void {
    let set = this.listeners.get(event);
    if (!set) {
      set = new Set();
      this.listeners.set(event, set);
    }
    set.add(listener);

    this.subscribedChannels.forEach((channel) => {
      channel.bind(event, (data: unknown) => {
        try {
          listener(data);
        } catch (err) {
          console.warn(`[realtime] listener error on "${event}":`, err);
        }
      });
    });

    return () => {
      set?.delete(listener);
      if (set && set.size === 0) {
        this.listeners.delete(event);
      }
      this.subscribedChannels.forEach((channel) => {
        channel.unbind(event, listener);
      });
    };
  }
}

export const realtimeService = new RealtimeService();
