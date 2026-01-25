import * as eva from "@eva-design/eva";
import { ApplicationProvider, IconRegistry } from "@ui-kitten/components";
import { useFonts } from "expo-font";
import { SplashScreen, Stack } from "expo-router";
import { useEffect } from "react";
import { AssetIconsPack } from "../asset-icons";
import { GlobalProvider } from "../context/GlobalContext";
import useAuth from "../hooks/useAuth";
import { default as mapping } from "../mapping.json";
import { default as theme } from "../theme.json";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { signedIn } = useAuth();
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

  if (!fontsLoaded) {
    return null;
  }

  return (
    <>
      <IconRegistry icons={[AssetIconsPack]} />
      <ApplicationProvider {...eva} theme={theme} customMapping={mapping}>
        <GlobalProvider>
          <Stack>
            <Stack.Protected guard={!signedIn}>
              <Stack.Screen name="index" options={{ headerShown: false }} />
              <Stack.Screen name="sign-in" options={{ headerShown: false }} />
              <Stack.Screen
                name="sign-in-mobile"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="sign-in-email"
                options={{ headerShown: false }}
              />
            </Stack.Protected>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="store/[id]" options={{ headerShown: false }} />
            <Stack.Screen name="product" options={{ headerShown: false }} />
            <Stack.Screen
              name="cart-products"
              options={{
                title: "سلة التسوق",
                headerTitleStyle: { fontFamily: "TajawalBold" },
              }}
            />
            <Stack.Screen
              name="checkout"
              options={{
                title: "سلة التسوق",
                headerTitleStyle: { fontFamily: "TajawalBold" },
              }}
            />
            <Stack.Screen
              name="order-confirmed"
              options={{ headerShown: false }}
            />
          </Stack>
        </GlobalProvider>
      </ApplicationProvider>
    </>
  );
}
