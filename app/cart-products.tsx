// @ts-nocheck
import { Button, Layout, Text } from "@ui-kitten/components";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaInsetsContext } from "react-native-safe-area-context";
import { MinusIcon, PlusIcon, SarIcon, TrashIcon } from "../components/Icons";
import AlertDialog from "../components/ui/AlertDialog";
import BottomActionBar from "../components/ui/BottomActionBar";
import { useGlobal } from "../context/GlobalContext";
import useAuth from "../hooks/useAuth";
import useCart from "../hooks/useCart";
import { getStores } from "../services/shannahApi";
import * as theme from "../theme.json";

const CartProducts = () => {
  const { productType, storeId } = useLocalSearchParams();
  const { token } = useAuth();
  const { cartItems, setCartItems } = useGlobal();
  const { subtotal } = useCart();
  const [store, setStore] = useState({});
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [activeProductType, setActiveProductType] = useState();
  const [activeStoreId, setActiveStoreId] = useState();
  const [activeProductIndex, setActiveProductIndex] = useState();

  useFocusEffect(
    useCallback(() => {
      if (cartItems[productType][storeId] === undefined) {
        router.replace("/(tabs)/cart");
      }
    }, [cartItems]),
  );

  useEffect(() => {
    (async () => {
      const result = await getStores(token, storeId);
      setStore(result.data);
    })();
  }, [token]);

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
            paddingBottom: insets.bottom,
          }}
        >
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ flexGrow: 1 }}
          >
            {Object.keys(store).length > 0 &&
              (cartItems[productType][storeId] ?? []).length > 0 && (
                <View style={styles.storeProductsContainer}>
                  <Text category="s1" style={styles.storeName}>
                    {store.name}
                  </Text>

                  {(cartItems[productType][storeId] ?? []).map(
                    (product, index) => (
                      <View key={product.id} style={styles.productContainer}>
                        <Image
                          source={{
                            uri: product.image,
                          }}
                          style={styles.productImage}
                        ></Image>
                        <View style={styles.productNameAndQtyContainer}>
                          <Text category="s2" style={styles.productName}>
                            {product.name}
                          </Text>
                          <View style={styles.qtyAndPriceContainer}>
                            <View style={styles.qtyContainer}>
                              <Pressable
                                onPress={() =>
                                  onQtyIncrease("meal", storeId, index)
                                }
                              >
                                <PlusIcon style={styles.plusIcon}></PlusIcon>
                              </Pressable>
                              <Text category="s2" style={styles.qtyText}>
                                {product.qty}
                              </Text>
                              {product.qty > 1 ? (
                                <Pressable
                                  onPress={() =>
                                    onQtyDecrease("meal", storeId, index)
                                  }
                                >
                                  <MinusIcon
                                    style={styles.minusIcon}
                                  ></MinusIcon>
                                </Pressable>
                              ) : (
                                <Pressable
                                  onPress={() =>
                                    onShowDeleteDialog("meal", storeId, index)
                                  }
                                >
                                  <TrashIcon
                                    style={styles.trashIcon}
                                  ></TrashIcon>
                                </Pressable>
                              )}
                            </View>
                            <View style={styles.priceContainer}>
                              <Text category="s2" style={styles.priceText}>
                                {product.qty * product.price +
                                  product.optionsPrice}
                              </Text>
                              <SarIcon style={styles.sarIcon}></SarIcon>
                            </View>
                          </View>
                        </View>
                      </View>
                    ),
                  )}

                  <Button
                    appearance="outline"
                    status="basic"
                    accessoryLeft={() => (
                      <PlusIcon style={styles.plusIcon}></PlusIcon>
                    )}
                    style={styles.addButton}
                    onPress={() => router.push(`/store/${storeId}`)}
                  >
                    {(evaProps) => (
                      <Text
                        category="s2"
                        numberOfLines={1}
                        style={styles.addButtonText}
                      >
                        أضف المزيد من العناصر
                      </Text>
                    )}
                  </Button>
                </View>
              )}

            <View style={styles.orderSummaryContainer}>
              <View style={styles.orderSummaryRow}>
                <Text category="s1">المجموع الفرعي</Text>
                <View style={styles.priceContainer}>
                  <Text category="s1">{subtotal(productType, storeId)}</Text>
                  <SarIcon style={styles.sarIconSummary}></SarIcon>
                </View>
              </View>
              <View style={styles.orderSummaryRow}>
                <Text category="s2">رسوم التوصيل</Text>
                <View style={styles.priceContainer}>
                  <Text category="s2">0</Text>
                  <SarIcon style={styles.sarIconSummary}></SarIcon>
                </View>
              </View>
              <View style={styles.orderSummaryRow}>
                <Text category="s2">الضريبة</Text>
                <View style={styles.priceContainer}>
                  <Text category="s2">0</Text>
                  <SarIcon style={styles.sarIconSummary}></SarIcon>
                </View>
              </View>
            </View>
          </ScrollView>

          <BottomActionBar style={styles.bottomActionBar}>
            <View style={styles.totalPriceContainer}>
              <Text category="s1">
                الإجمالي <Text>(يشمل الرسوم والضرائب والخصومات)</Text>
              </Text>

              <View style={styles.priceContainer}>
                <Text category="s1" style={{ color: theme["color-black"] }}>
                  {subtotal(productType, storeId)}
                </Text>
                <SarIcon style={styles.sarIconSummary}></SarIcon>
              </View>
            </View>
            <Button
              onPress={() =>
                router.push({
                  pathname: "/checkout",
                  params: { productType: productType, storeId: storeId },
                })
              }
            >
              <View>
                <Text
                  style={{
                    fontFamily: "TajawalMedium",
                    fontWeight: 500,
                    fontSize: 16,
                  }}
                  status="control"
                >
                  انتقل إلى الدفع
                </Text>
              </View>
            </Button>
          </BottomActionBar>

          <AlertDialog
            visible={showDeleteDialog}
            title="تأكيد الحذف"
            message="هل أنت متأكد من حذف هذا العنصر من سلة التسوق؟"
            onCancel={() => setShowDeleteDialog(false)}
            onConfirm={() => onDelete()}
          ></AlertDialog>
        </Layout>
      )}
    </SafeAreaInsetsContext.Consumer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  storeProductsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
    borderBottomWidth: 0.5,
    borderColor: theme["color-gray"],
  },
  storeName: {
    fontFamily: "TajawalBold",
    color: theme["text-heading-color"],
    textAlign: "left",
  },
  productContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    gap: 16,
    borderBottomWidth: 0.5,
    borderColor: theme["color-gray"],
  },
  productImage: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#E5E7EB",
  },
  productNameAndQtyContainer: { flex: 1, gap: 8 },
  productName: { color: theme["text-heading-color"], textAlign: "left" },
  qtyAndPriceContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  qtyContainer: {
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
  },
  plusIcon: { width: 16, height: 16, tintColor: theme["text-heading-color"] },
  qtyText: { color: theme["text-heading-color"] },
  minusIcon: { width: 16, height: 16, tintColor: theme["text-heading-color"] },
  trashIcon: { width: 16, height: 16, tintColor: theme["text-heading-color"] },
  priceContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 2,
  },
  priceText: {
    color: theme["color-primary-500"],
  },
  sarIcon: {
    width: 12,
    height: 12,
    tintColor: theme["color-primary-500"],
  },
  sarIconSummary: {
    width: 16,
    height: 16,
  },
  addButton: {
    alignSelf: "flex-start",
    borderColor: theme["color-gray"],
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 34,
    height: 34,
  },
  addButtonText: { lineHeight: 18 },
  orderSummaryContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  orderSummaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  bottomActionBar: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  totalPriceContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
});

export default CartProducts;
