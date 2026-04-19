// @ts-nocheck
import * as eva from "@eva-design/eva";
import { ApplicationProvider, IconRegistry } from "@ui-kitten/components";
import * as Notifications from "expo-notifications";
import { useFonts } from "expo-font";
import { router, SplashScreen } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { AssetIconsPack } from "../asset-icons";
import StackNavigator from "../components/StackNavigator";
import { ErrorBoundary } from "../components/ui/ErrorBoundary";
import { OfflineBanner } from "../components/ui/OfflineBanner";
import { GlobalProvider } from "../context/GlobalContext";
import { ToastProvider, useToast } from "../context/ToastContext";
import { setSessionExpiredHandler } from "../services/api";
import { initErrorReporting } from "../utils/errorReporting";
import { default as mapping } from "../mapping.json";
import { default as theme } from "../theme.json";

SplashScreen.preventAutoHideAsync();
initErrorReporting();

// Show notifications as banners when the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Tajawal: require("../assets/fonts/Tajawal-Regular.ttf"),
    TajawalMedium: require("../assets/fonts/Tajawal-Medium.ttf"),
    TajawalBold: require("../assets/fonts/Tajawal-Bold.ttf"),
    TajawalExtraBold: require("../assets/fonts/Tajawal-ExtraBold.ttf"),
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  // Handle notification tap → deep link navigation
  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const deepLink =
          response.notification.request.content.data?.deep_link;
        if (deepLink) {
          router.push(`/${deepLink}`);
        } else {
          // Default: open the notifications inbox
          router.push("/notifications");
        }
      },
    );

    return () => subscription.remove();
  }, []);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <>
      <IconRegistry icons={[AssetIconsPack]} />
      <ApplicationProvider {...eva} theme={theme} customMapping={mapping}>
        {/* ErrorBoundary sits inside ApplicationProvider so the fallback can
            safely render alongside it; its own fallback uses plain RN so it
            never depends on the provider being healthy. */}
        <ErrorBoundary>
          <GlobalProvider>
            <ToastProvider>
              <StatusBar style="dark" />
              <SessionExpiryBridge />
              <StackNavigator></StackNavigator>
              <OfflineBanner />
            </ToastProvider>
          </GlobalProvider>
        </ErrorBoundary>
      </ApplicationProvider>
    </>
  );
}

/**
 * Bridges the axios 401 interceptor to the toast/router system so an expired
 * token flips to sign-in with a user-visible message instead of silently failing.
 */
function SessionExpiryBridge() {
  const { show } = useToast();
  useEffect(() => {
    setSessionExpiredHandler(() => {
      show({
        message: "انتهت جلستك، سجّل الدخول مجدداً",
        kind: "info",
        duration: 3500,
      });
      router.replace("/sign-in");
    });
    return () => setSessionExpiredHandler(null);
  }, [show]);
  return null;
}
