import { useGlobal } from "../context/GlobalContext";

export default function useCart() {
  const { cartItems } = useGlobal();

  let subtotal = 0;
  const storeIds = Object.keys(cartItems["meal"]);
  [storeIds[0]].forEach((storeId) => {
    const productTotal = cartItems["meal"][storeId].reduce(
      (prevVal, currVal) => {
        return prevVal + currVal.qty * currVal.price + currVal.optionsPrice;
      },
      0,
    );

    subtotal += productTotal;
  });

  return { subtotal };
}
