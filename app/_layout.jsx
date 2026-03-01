import * as eva from "@eva-design/eva";
import { ApplicationProvider, IconRegistry } from "@ui-kitten/components";
import * as Notifications from "expo-notifications";
import { useFonts } from "expo-font";
import { router, SplashScreen } from "expo-router";
import { useEffect } from "react";
import { AssetIconsPack } from "../asset-icons";
import StackNavigator from "../components/StackNavigator";
import { GlobalProvider } from "../context/GlobalContext";
import { default as mapping } from "../mapping.json";
import { default as theme } from "../theme.json";

SplashScreen.preventAutoHideAsync();

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
        <GlobalProvider>
          <StackNavigator></StackNavigator>
        </GlobalProvider>
      </ApplicationProvider>
    </>
  );
}
