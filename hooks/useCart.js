import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback } from "react";
import { useGlobal } from "../context/GlobalContext";

export default function useCart() {
  const { cartItems, setCartItems } = useGlobal();

  const calcSubtotal = useCallback(
    (productType, storeId) => {
      return (cartItems[productType][storeId] ?? []).reduce(
        (prevVal, currVal) => {
          return prevVal + currVal.qty * currVal.price + currVal.optionsPrice;
        },
        0,
      );
    },
    [cartItems],
  );

  const deleteStoreById = useCallback(
    async (productType, storeId) => {
      const existingStoreIds = Object.keys(cartItems[productType] ?? {});
      const updatedStores = {};

      existingStoreIds.forEach((existingStoreId) => {
        if (existingStoreId != storeId) {
          updatedStores[existingStoreId] =
            cartItems[productType][existingStoreId];
        }
      });

      const newCart = { ...cartItems, [productType]: updatedStores };
      await AsyncStorage.setItem("cart", JSON.stringify(newCart));
      setCartItems(newCart);
    },
    [cartItems, setCartItems],
  );

  return { subtotal: calcSubtotal, deleteStoreById };
}
