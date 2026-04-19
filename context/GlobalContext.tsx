import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import * as Notifications from "expo-notifications";
import { router } from "expo-router";
import { deleteItemAsync, getItemAsync } from "expo-secure-store";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { AppState, Platform } from "react-native";
import { realtimeService } from "../services/realtime.service";
import {
  logout,
  registerPushToken,
  unregisterPushToken,
} from "../services/shannahApi";

const EXPO_PROJECT_ID = "9c2a2e5c-bbc2-416a-90e4-bd8679dcd07a";

export interface UserLocation {
  latitude: number;
  longitude: number;
}

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
  userLocation: UserLocation | null;
  refreshUserLocation: () => Promise<void>;
  resumeTick: number;
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
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [resumeTick, setResumeTick] = useState(0);
  const backgroundedAtRef = useRef<number | null>(null);

  useEffect(() => {
    const sub = AppState.addEventListener("change", (next) => {
      if (next === "background" || next === "inactive") {
        backgroundedAtRef.current = Date.now();
      } else if (next === "active") {
        const bgAt = backgroundedAtRef.current;
        if (bgAt != null && Date.now() - bgAt > 2 * 60 * 1000) {
          setResumeTick((t) => t + 1);
        }
        backgroundedAtRef.current = null;
      }
    });
    return () => sub.remove();
  }, []);

  const refreshUserLocation = useCallback(async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setUserLocation(null);
        return;
      }
      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      setUserLocation({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });
    } catch (e) {
      console.log("refreshUserLocation:", e);
    }
  }, []);

  useEffect(() => {
    refreshUserLocation();
  }, [refreshUserLocation]);

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

  // Connect / disconnect the realtime service in lockstep with auth state.
  // Reverb uses the Sanctum bearer token to authorize private channels, so the
  // token must be fresh every time we (re)connect.
  useEffect(() => {
    if (!signedIn) {
      realtimeService.disconnect();
      return;
    }
    (async () => {
      try {
        const authToken = await getItemAsync("token");
        realtimeService.connect(authToken);
      } catch {
        // Realtime is best-effort; polling fallback (pull-to-refresh) still works.
      }
    })();
    return () => {
      // Leave the connection up across re-renders; only tear down on sign-out
      // or unmount, both of which run the if(!signedIn) branch above.
    };
  }, [signedIn]);

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
    realtimeService.disconnect();
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
        userLocation,
        refreshUserLocation,
        resumeTick,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
}
