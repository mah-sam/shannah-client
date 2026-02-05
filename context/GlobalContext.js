import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { deleteItemAsync, getItemAsync } from "expo-secure-store";
import { createContext, useContext, useEffect, useState } from "react";

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

  const signOut = async () => {
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
