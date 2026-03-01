import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { router } from "expo-router";
import { deleteItemAsync, getItemAsync } from "expo-secure-store";
import { createContext, useContext, useEffect, useState } from "react";
import { Platform } from "react-native";
import {
  registerPushToken,
  unregisterPushToken,
} from "../services/shannahApi";

const EXPO_PROJECT_ID = "9c2a2e5c-bbc2-416a-90e4-bd8679dcd07a";

const GlobalContext = createContext(null);

export function useGlobal() {
  return useContext(GlobalContext);
}

export function GlobalProvider({ children }) {
  const [cartItems, setCartItems] = useState({ meal: [], banquet: [] });
  const [signedIn, setSignedIn] = useState(false);
  const [userData, setUserData] = useState({});
  const [deliveryAddress, setDeliveryAddress] = useState({});

  useEffect(() => {
    (async () => {
      try {
        const cartItems = await AsyncStorage.getItem("cart");
        cartItems !== null && setCartItems(JSON.parse(cartItems));
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
    signedIn &&
      (async () => {
        const userDataJson = await AsyncStorage.getItem("user");
        const userData = JSON.parse(userDataJson);
        setUserData(userData);
      })();
  }, [signedIn]);

  // Register push token whenever the user signs in
  useEffect(() => {
    if (!signedIn) return;
    setupPushNotifications();
  }, [signedIn]);

  async function setupPushNotifications() {
    try {
      // Request permission
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") return;

      // Create Android notification channel
      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("default", {
          name: "الإشعارات",
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#881ED3",
        });
      }

      // Get Expo push token
      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId: EXPO_PROJECT_ID,
      });
      const pushToken = tokenData.data;

      // Save locally for deregistration on logout
      await AsyncStorage.setItem("pushToken", pushToken);

      // Register with our backend
      const authToken = await getItemAsync("token");
      if (authToken) {
        await registerPushToken(authToken, pushToken, Platform.OS);
      }
    } catch (error) {
      // Non-critical: push notifications unavailable (simulator, denied, etc.)
      console.log("Push notification setup:", error?.message);
    }
  }

  const signOut = async () => {
    // Unregister push token BEFORE clearing the auth token
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

    await deleteItemAsync("token");
    await AsyncStorage.removeItem("user");
    setSignedIn(false);
    setUserData({});
    setCartItems({ meal: [], banquet: [] });

    router.navigate("sign-in");
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
