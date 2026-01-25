import { Button, Layout, Text } from "@ui-kitten/components";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Image, Pressable, StyleSheet, View } from "react-native";
import { SafeAreaInsetsContext } from "react-native-safe-area-context";
import { MinusIcon, PlusIcon, SarIcon, TrashIcon } from "../components/Icons";
import AlertDialog from "../components/ui/AlertDialog";
import { useGlobal } from "../context/GlobalContext";
import useCart from "../hooks/useCart";
import { getStores } from "../services/shannahApi";
import * as theme from "../theme.json";

const CartProducts = () => {
  const { cartItems, setCartItems } = useGlobal();
  const { subtotal } = useCart();
  const [stores, setStores] = useState([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [activeProductType, setActiveProductType] = useState();
  const [activeStoreId, setActiveStoreId] = useState();
  const [activeProductIndex, setActiveProductIndex] = useState();

  useEffect(() => {
    (async () => {
      const result = await getStores();
      setStores(result.data);
    })();
  }, []);

  const getStoreInfo = (productType, storeId) => {
    return stores[productType]?.find((store) => store.id == storeId);
  };

  const storeIds = Object.keys(cartItems["meal"]);

  const onQtyIncrease = (productType, storeId, productIndex) => {
    const storeProducts = cartItems[productType][storeId];
    storeProducts[productIndex].qty = storeProducts[productIndex].qty + 1;
    setCartItems({
      ...cartItems,
      meal: { ...cartItems["meal"], [storeId]: storeProducts },
    });
  };

  const onQtyDecrease = (productType, storeId, productIndex) => {
    const storeProducts = cartItems[productType][storeId];
    storeProducts[productIndex].qty =
      storeProducts[productIndex].qty - 1 >= 1
        ? storeProducts[productIndex].qty - 1
        : 1;
    setCartItems({
      ...cartItems,
      meal: { ...cartItems["meal"], [storeId]: storeProducts },
    });
  };

  const onShowDeleteDialog = (productType, storeId, productIndex) => {
    setActiveProductType(productType);
    setActiveStoreId(storeId);
    setActiveProductIndex(productIndex);
    setShowDeleteDialog(true);
  };

  const onDelete = () => {
    const storeProducts = cartItems[activeProductType][activeStoreId].filter(
      (product, index) => index !== activeProductIndex,
    );

    if (storeProducts.length === 0) {
      const existingStoreIds = Object.keys(cartItems["meal"]);
      const updatedStores = {};
      existingStoreIds.forEach((existingStoreId) => {
        if (existingStoreId != activeStoreId) {
          updatedStores[existingStoreId] = cartItems["meal"][existingStoreId];
        }
      });

      setCartItems({ ...cartItems, [activeProductType]: updatedStores });
    } else {
      setCartItems({
        ...cartItems,
        [activeProductType]: {
          ...cartItems[activeProductType],
          [activeStoreId]: storeProducts,
        },
      });
    }

    setShowDeleteDialog(false);
  };

  return (
    <SafeAreaInsetsContext.Consumer>
      {(insets) => (
        <Layout
          style={{
            ...styles.container,
            // paddingTop: insets.top,
            paddingBottom: insets.bottom,
          }}
        >
          {storeIds.map((storeId) => (
            <View
              key={storeId}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 12,
                gap: 10,
                borderBottomWidth: 0.5,
                borderColor: theme["color-gray"],
              }}
            >
              <Text
                category="s1"
                style={{
                  fontFamily: "TajawalBold",
                  color: theme["color-black"],
                }}
              >
                {getStoreInfo("meal", storeId)?.name}
              </Text>

              {cartItems["meal"][storeId].map((product, index) => (
                <View
                  key={product.id}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    paddingVertical: 8,
                    gap: 16,
                    borderBottomWidth: 0.5,
                    borderColor: theme["color-gray"],
                  }}
                >
                  <Image
                    source={{
                      uri: product.image,
                    }}
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 12,
                      backgroundColor: "#E5E7EB",
                    }}
                  ></Image>
                  <View style={{ flex: 1, gap: 8 }}>
                    <Text category="s2">{product.name}</Text>
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                      }}
                    >
                      <View
                        style={{
                          flexDirection: "row",
                          justifyContent: "center",
                          alignItems: "center",
                          paddingHorizontal: 4,
                          paddingVertical: 2,
                          gap: 6,
                          width: 63,
                          height: 24,
                          borderWidth: 1,
                          borderColor: theme["color-gray"],
                          borderRadius: 12,
                        }}
                      >
                        <Pressable
                          onPress={() => onQtyIncrease("meal", storeId, index)}
                        >
                          <PlusIcon
                            style={{ width: 16, height: 16 }}
                          ></PlusIcon>
                        </Pressable>
                        <Text
                          category="s2"
                          style={{
                            // fontFamily: "TajawalMedium",
                            // fontSize: 14,
                            lineHeight: 22,
                          }}
                        >
                          {product.qty}
                        </Text>
                        {product.qty > 1 ? (
                          <Pressable
                            onPress={() =>
                              onQtyDecrease("meal", storeId, index)
                            }
                          >
                            <MinusIcon
                              style={{ width: 16, height: 16 }}
                            ></MinusIcon>
                          </Pressable>
                        ) : (
                          <Pressable
                            onPress={() =>
                              onShowDeleteDialog("meal", storeId, index)
                            }
                          >
                            <TrashIcon
                              style={{ width: 16, height: 16 }}
                            ></TrashIcon>
                          </Pressable>
                        )}
                      </View>
                      <View
                        style={{
                          flexDirection: "row",
                          justifyContent: "space-between",
                          alignItems: "center",
                          gap: 2,
                        }}
                      >
                        <Text
                          style={{
                            fontFamily: "TajawalMedium",
                            fontSize: 14,
                            color: theme["color-primary-500"],
                          }}
                        >
                          {product.qty * product.price + product.optionsPrice}
                        </Text>
                        <SarIcon
                          style={{
                            width: 12,
                            height: 12,
                            tintColor: theme["color-primary-500"],
                          }}
                        ></SarIcon>
                      </View>
                    </View>
                  </View>
                </View>
              ))}

              <Button
                appearance="outline"
                status="basic"
                accessoryLeft={() => (
                  <PlusIcon
                    style={{
                      width: 16,
                      height: 16,
                      tintColor: theme["color-black"],
                    }}
                  ></PlusIcon>
                )}
                style={{
                  alignSelf: "flex-start",
                  minHeight: 34,
                  height: 34,
                  borderColor: theme["color-gray"],
                  borderRadius: 20,
                  paddingVertical: 8,
                }}
                onPress={() => router.navigate(`/store/${storeId}`)}
              >
                <View>
                  <Text
                    style={{
                      fontFamily: "TajawalMedium",
                      fontSize: 14,
                      lineHeight: 18,
                      color: theme["color-black"],
                    }}
                  >
                    أضف المزيد من العناصر
                  </Text>
                </View>
              </Button>
            </View>
          ))}
          <AlertDialog
            visible={showDeleteDialog}
            title="تأكيد الحذف"
            message="هل أنت متأكد من حذف هذا العنصر من سلة التسوق؟"
            onCancel={() => setShowDeleteDialog(false)}
            onConfirm={() => onDelete()}
          ></AlertDialog>
          <View
            style={{
              position: "absolute",
              left: 0,
              bottom: 0,
              width: "100%",
              paddingHorizontal: 16,
              paddingTop: 16,
              paddingBottom: 20 + insets.bottom,
              boxShadow: "0px 0px 6px rgba(0, 0, 0, 0.15)",
              borderTopLeftRadius: 12,
              borderTopRightRadius: 12,
              backgroundColor: "#ffffff",
              gap: 10,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Text category="s1">الإجمالي</Text>
                <Text>(يشمل الرسوم والضرائب والخصومات)</Text>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 2,
                }}
              >
                <Text category="s1" style={{ color: theme["color-black"] }}>
                  {subtotal}
                </Text>
                <SarIcon
                  style={{
                    width: 16,
                    height: 16,
                    tintColor: theme["color-black"],
                  }}
                ></SarIcon>
              </View>
            </View>
            <Button
              style={{ flex: 1 }}
              onPress={() => router.navigate("checkout")}
            >
              <View>
                <Text
                  style={{
                    fontFamily: "TajawalMedium",
                    fontWeight: 500,
                    fontSize: 16,
                    // lineHeight: 24,
                  }}
                  status="control"
                >
                  انتقل إلى الدفع
                </Text>
              </View>
            </Button>
          </View>
        </Layout>
      )}
    </SafeAreaInsetsContext.Consumer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  cover: {
    height: 140,
  },
  storeRatingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  starIcon: {
    width: 16,
    height: 16,
  },
  tabContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 12,
  },
});

export default CartProducts;
