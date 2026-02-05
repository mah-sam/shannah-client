import { Button, Layout, Text } from "@ui-kitten/components";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Image, Pressable, StyleSheet, View } from "react-native";
import { SafeAreaInsetsContext } from "react-native-safe-area-context";
import { PlusCircleIcon, SarIcon, TrashIcon } from "../../components/Icons";
import AlertDialog from "../../components/ui/AlertDialog";
import { useGlobal } from "../../context/GlobalContext";
import useAuth from "../../hooks/useAuth";
import useCart from "../../hooks/useCart";
import { getStores } from "../../services/shannahApi";
import * as theme from "../../theme.json";

const Cart = () => {
  const { token } = useAuth();
  const { cartItems, setCartItems } = useGlobal();
  const { deleteStoreById } = useCart();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [stores, setStores] = useState([]);
  const [activeProductType, setActiveProductType] = useState();
  const [activeStoreId, setActiveStoreId] = useState();

  useEffect(() => {
    (async () => {
      const result = await getStores(token);
      setStores(result.data);
    })();
  }, [token]);

  const getStoreInfo = (productType, storeId) => {
    return stores[productType]?.find((store) => store.id == storeId);
  };

  const storeIds = Object.keys(cartItems["meal"]);

  const onShowDeleteDialog = (productType, storeId) => {
    setActiveProductType(productType);
    setActiveStoreId(storeId);
    setShowDeleteDialog(true);
  };

  const onDelete = async () => {
    await deleteStoreById(activeProductType, activeStoreId);
    setShowDeleteDialog(false);
  };

  return (
    <SafeAreaInsetsContext.Consumer>
      {(insets) => (
        <Layout style={styles.container}>
          {storeIds.length > 0 && (
            <View style={styles.categoryContainer}>
              <Text category="s2" style={styles.categoryTitle}>
                الوجبات
              </Text>
              {storeIds.map((storeId) => (
                <View key={storeId} style={styles.storeCard}>
                  <View style={styles.storeCardHeader}>
                    <View style={styles.storeInfoContainer}>
                      <Image
                        source={{
                          uri: getStoreInfo("meal", storeId)?.logo,
                        }}
                        style={styles.storeLogo}
                      ></Image>
                      <View style={styles.storeInfo}>
                        <Text category="s2" style={styles.storeName}>
                          {getStoreInfo("meal", storeId)?.name}
                        </Text>
                        <Text style={styles.storePrepTime}>
                          {`وقت التحضير ${getStoreInfo("meal", storeId)?.base_prep_time_minutes} دقيقة`}
                        </Text>
                      </View>
                    </View>
                    <Pressable
                      onPress={() => onShowDeleteDialog("meal", storeId)}
                    >
                      <TrashIcon style={styles.trashIcon}></TrashIcon>
                    </Pressable>
                  </View>

                  <View style={styles.productsContainer}>
                    {cartItems["meal"][storeId].map((product) => (
                      <Image
                        key={product.id}
                        source={{
                          uri: product.image,
                        }}
                        style={styles.productImage}
                      ></Image>
                    ))}
                    <Pressable onPress={() => router.push(`/store/${storeId}`)}>
                      <PlusCircleIcon
                        style={styles.plusCircleIcon}
                      ></PlusCircleIcon>
                    </Pressable>
                  </View>

                  <View style={styles.priceAndDiscountContainer}>
                    <View style={styles.discountBadge}>
                      <Text style={styles.discountText}>توفير 0</Text>
                      <SarIcon style={styles.sarIcon}></SarIcon>
                    </View>
                    <View style={styles.priceContainer}>
                      {/* <Text
                        category="p2"
                        style={{
                          textDecorationLine: "line-through",
                          color: theme["text-body-color"],
                        }}
                      ></Text> */}
                      <View style={styles.salePriceContainer}>
                        <Text category="s2" style={styles.priceText}>
                          {cartItems["meal"][storeId].reduce(
                            (prevVal, currVal) => {
                              return (
                                prevVal +
                                parseFloat(currVal.price) * currVal.qty +
                                currVal.optionsPrice
                              );
                            },
                            0,
                          )}
                        </Text>
                        <SarIcon style={styles.sarIcon}></SarIcon>
                      </View>
                    </View>
                  </View>

                  <Button
                    appearance="outline"
                    status="basic"
                    onPress={() =>
                      router.push({
                        pathname: "/cart-products",
                        params: {
                          productType: "meal",
                          storeId: storeId,
                        },
                      })
                    }
                    style={{ borderWidth: 0.8 }}
                  >
                    <View>
                      <Text category="s2" style={styles.buttonText}>
                        سلة التسوق
                      </Text>
                    </View>
                  </Button>
                </View>
              ))}
            </View>
          )}
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 20,
  },
  categoryTitle: { fontFamily: "TajawalBold", textAlign: "left" },
  categoryContainer: { gap: 12 },
  storeCard: {
    padding: 16,
    gap: 12,
    height: 196,
    borderWidth: 1,
    borderColor: theme["color-gray"],
    borderRadius: 12,
  },
  storeCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    height: 36,
  },
  storeInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  storeLogo: {
    width: 36,
    height: 36,
    borderRadius: 4,
    backgroundColor: theme["color-primary-50"],
  },
  storeInfo: { justifyContent: "space-between" },
  storeName: { color: theme["text-heading-color"], textAlign: "left" },
  storePrepTime: { color: theme["text-body-color"], textAlign: "left" },
  trashIcon: { width: 24, height: 24, tintColor: theme["text-heading-color"] },
  productsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },
  productImage: {
    width: 36,
    height: 36,
    borderRadius: 4,
    backgroundColor: theme["color-primary-50"],
  },
  plusCircleIcon: { width: 20, height: 20, tintColor: theme["color-black"] },
  priceAndDiscountContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  discountBadge: {
    flexDirection: "row",
    paddingHorizontal: 6,
    paddingVertical: 2,
    height: 20,
    borderRadius: 12,
    backgroundColor: theme["color-primary-25"],
    gap: 2,
  },
  discountText: { color: theme["color-primary-500"] },
  sarIcon: {
    width: 12,
    height: 12,
    tintColor: theme["color-primary-500"],
  },
  priceContainer: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  priceText: { color: theme["color-primary-500"] },
  salePriceContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  buttonText: {
    color: theme["text-heading-color"],
  },
});

export default Cart;
