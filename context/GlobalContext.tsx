import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { router } from "expo-router";
import { deleteItemAsync, getItemAsync } from "expo-secure-store";
import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { Platform } from "react-native";
import {
  logout,
  registerPushToken,
  unregisterPushToken,
} from "../services/shannahApi";

const EXPO_PROJECT_ID = "9c2a2e5c-bbc2-416a-90e4-bd8679dcd07a";

interface GlobalContextValue {
  cartItems: unknown;
  setCartItems: (items: unknown) => void;
  signedIn: boolean;
  setSignedIn: (val: boolean) => void;
  userData: any;
  setUserData: (data: any) => void;
  signOut: () => Promise<void>;
  deliveryAddress: any;
  setDeliveryAddress: (addr: any) => void;
}

const GlobalContext = createContext<GlobalContextValue | null>(null);

export function useGlobal(): GlobalContextValue {
  const ctx = useContext(GlobalContext);
  if (!ctx) throw new Error("useGlobal must be used within GlobalProvider");
  return ctx;
}

export function GlobalProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<unknown>({ meal: [], banquet: [] });
  const [signedIn, setSignedIn] = useState(false);
  const [userData, setUserData] = useState<any>({});
  const [deliveryAddress, setDeliveryAddress] = useState<any>({});

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem("cart");
        if (stored !== null) setCartItems(JSON.parse(stored));
      } catch (error) {
        console.log(error);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const token = await getItemAsync("token");
        if (token !== null) {
          setSignedIn(true);
        }
      } catch (error) {
        console.log(error);
      }
    })();
  }, []);

  useEffect(() => {
    if (!signedIn) return;
    (async () => {
      const userDataJson = await AsyncStorage.getItem("user");
      if (userDataJson) {
        const parsed = JSON.parse(userDataJson);
        setUserData(parsed);
      }
    })();
  }, [signedIn]);

  // Register push token whenever the user signs in
  useEffect(() => {
    if (!signedIn) return;
    setupPushNotifications();
  }, [signedIn]);

  async function setupPushNotifications() {
    try {
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") return;

      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("default", {
          name: "الإشعارات",
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#881ED3",
        });
      }

      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId: EXPO_PROJECT_ID,
      });
      const pushToken = tokenData.data;

      await AsyncStorage.setItem("pushToken", pushToken);

      const authToken = await getItemAsync("token");
      if (authToken) {
        await registerPushToken(authToken, pushToken, Platform.OS);
      }
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      console.log("Push notification setup:", msg);
    }
  }

  const signOut = async () => {
    try {
      const pushToken = await AsyncStorage.getItem("pushToken");
      const authToken = await getItemAsync("token");
      if (pushToken && authToken) {
        await unregisterPushToken(authToken, pushToken);
        await AsyncStorage.removeItem("pushToken");
      }
    } catch {
      // Non-critical
    }

    // Invalidate server token before clearing local state
    try {
      const authToken = await getItemAsync("token");
      if (authToken) await logout(authToken);
    } catch {
      // Non-critical — proceed with local cleanup
    }

    await deleteItemAsync("token");
    await AsyncStorage.removeItem("user");
    setSignedIn(false);
    setUserData({});
    setCartItems({ meal: [], banquet: [] });

    router.navigate("/sign-in");
  };

  return (
    <GlobalContext.Provider
      value={{
        cartItems,
        setCartItems,
        signedIn,
        setSignedIn,
        userData,
        setUserData,
        signOut,
        deliveryAddress,
        setDeliveryAddress,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
}
