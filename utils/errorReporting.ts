/**
 * Error reporting wrapper.
 *
 * Today this forwards to the console. It is written as the single chokepoint
 * the rest of the app uses so crash reporting can be upgraded to Sentry /
 * Bugsnag / Crashlytics by editing this one file without touching callers.
 *
 * To enable Sentry:
 *   1. `npm install @sentry/react-native`
 *   2. Set EXPO_PUBLIC_SENTRY_DSN in .env and configure the Sentry Expo plugin.
 *   3. Uncomment the Sentry block below (and in `initErrorReporting`).
 */

export type ErrorContext = Record<string, unknown>;

let initialized = false;

export function initErrorReporting(): void {
  if (initialized) return;
  initialized = true;

  // const dsn = process.env.EXPO_PUBLIC_SENTRY_DSN;
  // if (dsn) {
  //   const Sentry = require("@sentry/react-native");
  //   Sentry.init({
  //     dsn,
  //     tracesSampleRate: __DEV__ ? 1.0 : 0.2,
  //     enableAutoSessionTracking: true,
  //   });
  // }

  // Install a best-effort top-level handler so unhandled promise rejections
  // and native uncaught exceptions land in our pipeline rather than vanishing.
  const globalAny = globalThis as any;
  if (typeof globalAny?.ErrorUtils?.setGlobalHandler === "function") {
    const prev = globalAny.ErrorUtils.getGlobalHandler?.();
    globalAny.ErrorUtils.setGlobalHandler((error: unknown, isFatal?: boolean) => {
      captureException(error, { isFatal });
      if (typeof prev === "function") prev(error, isFatal);
    });
  }
}

export function captureException(error: unknown, context?: ErrorContext): void {
  // if (process.env.EXPO_PUBLIC_SENTRY_DSN) {
  //   const Sentry = require("@sentry/react-native");
  //   Sentry.withScope((scope: any) => {
  //     if (context) scope.setContext("extra", context);
  //     Sentry.captureException(error);
  //   });
  //   return;
  // }
  console.error("[error]", error, context ?? "");
}

export function captureMessage(message: string, context?: ErrorContext): void {
  // if (process.env.EXPO_PUBLIC_SENTRY_DSN) {
  //   const Sentry = require("@sentry/react-native");
  //   Sentry.withScope((scope: any) => {
  //     if (context) scope.setContext("extra", context);
  //     Sentry.captureMessage(message);
  //   });
  //   return;
  // }
  console.warn("[message]", message, context ?? "");
}

export function addBreadcrumb(breadcrumb: {
  category: string;
  message: string;
  data?: ErrorContext;
}): void {
  // if (process.env.EXPO_PUBLIC_SENTRY_DSN) {
  //   const Sentry = require("@sentry/react-native");
  //   Sentry.addBreadcrumb(breadcrumb);
  //   return;
  // }
  // In dev we just log; breadcrumbs are only useful when forwarded to a
  // collector, so logging every one locally would be noisy.
  if (__DEV__) {
    console.debug("[breadcrumb]", breadcrumb.category, breadcrumb.message, breadcrumb.data ?? "");
  }
}
