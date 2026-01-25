import AsyncStorage from "@react-native-async-storage/async-storage";
import { Button, Layout, Text } from "@ui-kitten/components";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Image, Pressable, StyleSheet, View } from "react-native";
import { SafeAreaInsetsContext } from "react-native-safe-area-context";
import { PlusCircleIcon, SarIcon, TrashIcon } from "../../components/Icons";
import AlertDialog from "../../components/ui/AlertDialog";
import { useGlobal } from "../../context/GlobalContext";
import { getStores } from "../../services/shannahApi";
import * as theme from "../../theme.json";

const Cart = () => {
  const { cartItems, setCartItems } = useGlobal();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [stores, setStores] = useState([]);
  const [activeStoreId, setActiveStoreId] = useState();

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

  const onShowDeleteDialog = (storeId) => {
    setActiveStoreId(storeId);
    setShowDeleteDialog(true);
  };

  const onDelete = () => {
    (async () => {
      const existingStoreIds = Object.keys(cartItems["meal"]);
      const updatedStores = {};
      existingStoreIds.forEach((existingStoreId) => {
        if (existingStoreId != activeStoreId) {
          updatedStores[existingStoreId] = cartItems["meal"][existingStoreId];
        }
      });

      await AsyncStorage.setItem(
        "cart",
        JSON.stringify({ ...cartItems, meal: updatedStores }),
      );
      setCartItems({ ...cartItems, meal: updatedStores });
      setShowDeleteDialog(false);
    })();
  };

  return (
    <SafeAreaInsetsContext.Consumer>
      {(insets) => (
        <Layout style={styles.container}>
          <View
            style={{
              gap: 20,
              paddingHorizontal: 16,
              paddingVertical: 12,
            }}
          >
            <View style={{ gap: 12 }}>
              <Text category="s2" style={{ fontFamily: "TajawalBold" }}>
                الوجبات
              </Text>
              {storeIds.map((storeId) => (
                <View
                  key={storeId}
                  style={{
                    padding: 16,
                    gap: 12,
                    height: 196,
                    borderWidth: 1,
                    borderColor: theme["color-gray"],
                    borderRadius: 12,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                      height: 36,
                    }}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <Image
                        source={{
                          uri: getStoreInfo("meal", storeId)?.logo,
                        }}
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 4,
                          backgroundColor: theme["color-primary-50"],
                        }}
                      ></Image>
                      <View style={{ justifyContent: "space-between" }}>
                        <Text category="s2">
                          {getStoreInfo("meal", storeId)?.name}
                        </Text>
                        <Text style={{ color: theme["text-body-color"] }}>
                          {`وقت التحضير ${getStoreInfo("meal", storeId)?.base_prep_time_minutes} دقيقة`}
                        </Text>
                      </View>
                    </View>
                    <Pressable onPress={() => onShowDeleteDialog(storeId)}>
                      <TrashIcon style={{ width: 24, height: 24 }}></TrashIcon>
                    </Pressable>
                  </View>

                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 9,
                    }}
                  >
                    {cartItems["meal"][storeId].map((product) => (
                      <Image
                        key={product.id}
                        source={{
                          uri: product.image,
                        }}
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 4,
                          backgroundColor: theme["color-primary-50"],
                        }}
                      ></Image>
                    ))}
                    <Pressable
                      onPress={() => router.navigate(`/store/${storeId}`)}
                    >
                      <PlusCircleIcon
                        style={{ width: 20, height: 20 }}
                      ></PlusCircleIcon>
                    </Pressable>
                  </View>

                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                    }}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        paddingHorizontal: 6,
                        paddingVertical: 2,
                        height: 20,
                        borderRadius: 12,
                        backgroundColor: theme["color-primary-25"],
                        gap: 2,
                      }}
                    >
                      <Text style={{ color: theme["color-primary-500"] }}>
                        توفير 0
                      </Text>
                      <SarIcon
                        style={{
                          width: 12,
                          height: 12,
                          tintColor: theme["color-primary-500"],
                        }}
                      ></SarIcon>
                    </View>
                    <View
                      style={{
                        flexDirection: "row",
                        gap: 8,
                        alignItems: "center",
                      }}
                    >
                      {/* <Text
                        category="p2"
                        style={{
                          textDecorationLine: "line-through",
                          color: theme["text-body-color"],
                        }}
                      ></Text> */}
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 2,
                        }}
                      >
                        <Text
                          category="s2"
                          style={{ color: theme["color-primary-500"] }}
                        >
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

                  <Button
                    appearance="outline"
                    status="basic"
                    onPress={() => router.navigate("/cart-products")}
                    style={{ borderWidth: 0.8 }}
                  >
                    <View>
                      <Text
                        style={{ fontSize: 14, fontFamily: "TajawalMedium" }}
                      >
                        سلة التسوق
                      </Text>
                    </View>
                  </Button>
                </View>
              ))}
            </View>
          </View>
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
});

export default Cart;
