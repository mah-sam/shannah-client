import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback } from "react";
import { useGlobal } from "../context/GlobalContext";

interface CartItem {
  qty: number;
  price: number;
  optionsPrice: number;
  [key: string]: unknown;
}

type CartData = Record<string, Record<string, CartItem[]>>;

export default function useCart() {
  const { cartItems, setCartItems } = useGlobal();

  const calcSubtotal = useCallback(
    (productType: string, storeId: string) => {
      const cart = cartItems as CartData;
      return (cart[productType]?.[storeId] ?? []).reduce(
        (prevVal: number, currVal: CartItem) => {
          return prevVal + currVal.qty * currVal.price + currVal.optionsPrice;
        },
        0,
      );
    },
    [cartItems],
  );

  const deleteStoreById = useCallback(
    async (productType: string, storeId: string) => {
      const cart = cartItems as CartData;
      const existingStoreIds = Object.keys(cart[productType] ?? {});
      const updatedStores: Record<string, CartItem[]> = {};

      existingStoreIds.forEach((existingStoreId) => {
        if (existingStoreId !== storeId) {
          updatedStores[existingStoreId] = cart[productType][existingStoreId];
        }
      });

      const newCart = { ...cart, [productType]: updatedStores };
      await AsyncStorage.setItem("cart", JSON.stringify(newCart));
      setCartItems(newCart);
    },
    [cartItems, setCartItems],
  );

  return { subtotal: calcSubtotal, deleteStoreById };
}
