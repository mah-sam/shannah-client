import AsyncStorage from "@react-native-async-storage/async-storage";
import { getItemAsync } from "expo-secure-store";
import { createContext, useContext, useEffect, useState } from "react";

const GlobalContext = createContext(null);

export function useGlobal() {
  return useContext(GlobalContext);
}

export function GlobalProvider({ children }) {
  const [cartItems, setCartItems] = useState({ meal: [], banquet: [] });
  const [signedIn, setSignedIn] = useState(false);
  const [userData, setUserData] = useState({});

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

  return (
    <GlobalContext.Provider
      value={{
        cartItems,
        setCartItems,
        signedIn,
        setSignedIn,
        userData,
        setUserData,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
}
