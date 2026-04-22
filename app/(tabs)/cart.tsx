// @ts-nocheck
import { Button, Layout, Text } from "@ui-kitten/components";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, View } from "react-native";
import { SafeAreaInsetsContext } from "react-native-safe-area-context";
import { PlusCircleIcon, SarIcon, TrashIcon } from "../../components/Icons";
import AlertDialog from "../../components/ui/AlertDialog";
import { EmptyState } from "../../components/ui/EmptyState";
import { ErrorState } from "../../components/ui/ErrorState";
import { ShannahImage } from "../../components/ui/ShannahImage";
import { SkeletonCard } from "../../components/ui/SkeletonCard";
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
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [activeProductType, setActiveProductType] = useState();
  const [activeStoreId, setActiveStoreId] = useState();

  useEffect(() => {
    (async () => {
      setLoading(true);
      setLoadError(false);
      try {
        const result = await getStores(token);
        setStores(result?.data ?? []);
      } catch {
        setLoadError(true);
      } finally {
        setLoading(false);
      }
    })();
  }, [token, reloadKey]);

  const getStoreInfo = (productType, storeId) => {
    return stores[productType]?.find((store) => store.id == storeId);
  };

  const productTypes = Object.keys(cartItems || {});
  const cartIsEmpty = productTypes.every(
    (type) => Object.keys(cartItems[type] || {}).length === 0,
  );

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
          {loading && (
            <View style={styles.skeletonContainer}>
              <SkeletonCard variant="list-row" />
              <SkeletonCard variant="list-row" />
            </View>
          )}

          {!loading && loadError && (
            <ErrorState
              title="تعذّر تحميل السلة"
              subtitle="تحقق من اتصالك بالإنترنت وحاول مجدداً"
              onRetry={() => setReloadKey((k) => k + 1)}
            />
          )}

          {!loading && !loadError && cartIsEmpty && (
            <EmptyState
              title="سلة التسوق فارغة"
              subtitle="أضف منتجات من المتاجر للمتابعة"
            />
          )}

          {!loading && !loadError && !cartIsEmpty && productTypes.map((productType) => {
            const storeIds = Object.keys(cartItems[productType] || {});
            if (storeIds.length === 0) return null;
            const typeLabels = { meal: "الوجبات", banquet: "الولائم", market: "ماركت" };
            return (
              <View key={productType} style={styles.categoryContainer}>
                <Text category="s2" style={styles.categoryTitle}>
                  {typeLabels[productType] || productType}
                </Text>
                {storeIds.map((storeId) => (
                  <View key={storeId} style={styles.storeCard}>
                    <View style={styles.storeCardHeader}>
                      <View style={styles.storeInfoContainer}>
                        <ShannahImage
                          variant="store_logo"
                          source={{
                            uri: getStoreInfo(productType, storeId)?.logo,
                          }}
                          style={styles.storeLogo}
                        />
                        <View style={styles.storeInfo}>
                          <Text category="s2" style={styles.storeName}>
                            {getStoreInfo(productType, storeId)?.name}
                          </Text>
                          <Text style={styles.storePrepTime}>
                            {`وقت التحضير ${getStoreInfo(productType, storeId)?.base_prep_time_minutes} دقيقة`}
                          </Text>
                        </View>
                      </View>
                      <Pressable
                        onPress={() => onShowDeleteDialog(productType, storeId)}
                      >
                        <TrashIcon style={styles.trashIcon}></TrashIcon>
                      </Pressable>
                    </View>

                    <View style={styles.productsContainer}>
                      {cartItems[productType][storeId].map((product) => (
                        <ShannahImage
                          key={product.id}
                          variant="product"
                          source={{ uri: product.image }}
                          style={styles.productImage}
                        />
                      ))}
                      <Pressable onPress={() => router.push(`/store/${storeId}`)}>
                        <PlusCircleIcon
                          style={styles.plusCircleIcon}
                        ></PlusCircleIcon>
                      </Pressable>
                    </View>

                    <View style={styles.priceAndDiscountContainer}>
                      <View style={styles.priceContainer}>
                        <View style={styles.salePriceContainer}>
                          <Text category="s2" style={styles.priceText}>
                            {cartItems[productType][storeId].reduce(
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
                            productType: productType,
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
            );
          })}
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
  priceText: { color: theme["color-primary-500"], fontFamily: "TajawalBold" },
  salePriceContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  buttonText: {
    color: theme["text-heading-color"],
  },
  centerFill: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  skeletonContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
});

export default Cart;
