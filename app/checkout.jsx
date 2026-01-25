import { Button, Layout, Spinner, Text } from "@ui-kitten/components";
import { router } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { SafeAreaInsetsContext } from "react-native-safe-area-context";
import {
  BankNoteIcon,
  ReceiptIcon,
  SarIcon,
  WalletIcon,
} from "../components/Icons";
import { useGlobal } from "../context/GlobalContext";
import useAuth from "../hooks/useAuth";
import useCart from "../hooks/useCart";
import { useCurrentLocation } from "../hooks/useCurrentLocation";
import { submitOrder } from "../services/shannahApi";
import * as theme from "../theme.json";

const Checkout = () => {
  const { cartItems, setCartItems } = useGlobal();
  const { subtotal } = useCart();
  const { location, loading, error, refresh } = useCurrentLocation();
  const { token } = useAuth();

  const onConfirmOrder = async () => {
    const items = [];
    const storeIds = Object.keys(cartItems["meal"]);
    cartItems.meal[storeIds[0]].forEach((product) => {
      items.push({
        product_id: product.id,
        qty: product.qty,
        unit_price: product.price,
        options: product.options,
      });
    });

    const order = {
      store_id: 1,
      address_id: null,
      delivery_method: "pickup",
      subtotal: subtotal,
      total_amount: subtotal,
      scheduled_at: null,
      phone: null,
      notes: null,
      items: items,
    };

    const result = await submitOrder(token, order);
    router.navigate({
      pathname: "/order-confirmed",
      params: { id: result.data.id },
    });
  };

  // useEffect(() => {
  //   (async () => {
  //     try {
  //       const address = await reverseGeocodeAsync({
  //         latitude: region.latitude,
  //         longitude: region.longitude,
  //       });

  //       console.log(address);
  //       if (!address || address.length === 0) {
  //         return null;
  //       }

  //       return result[0];
  //     } catch (error) {
  //       console.log(error);
  //     }
  //   })();
  // }, []);

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
          <View style={{ padding: 16, gap: 16 }}>
            <View
              style={{
                paddingHorizontal: 16,
                paddingVertical: 12,
                gap: 8,
                borderWidth: 1,
                borderColor: theme["color-gray"],
                borderRadius: 12,
              }}
            >
              {/* <View style={styles.tabBarContainer}> */}
              <View style={styles.tabBar}>
                <Pressable
                  style={
                    "meal" === "meal"
                      ? [styles.tab, styles.tabActive]
                      : styles.tab
                  }
                  onPress={() => {}}
                >
                  <Text style={styles.tabText}>توصيل</Text>
                </Pressable>
                <Pressable
                  style={
                    "meal" === "banquet"
                      ? [styles.tab, styles.tabActive]
                      : styles.tab
                  }
                  onPress={() => {}}
                >
                  <Text style={styles.tabText}>استلام</Text>
                </Pressable>
              </View>
              {/* </View> */}
              <Text category="s1">عنوان التوصيل</Text>
              <View
                style={{
                  height: 130,
                  // backgroundColor: "#C38EE9",
                  borderRadius: 16,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                {loading ? (
                  <Spinner></Spinner>
                ) : (
                  <MapView
                    style={StyleSheet.absoluteFill}
                    // region={region}
                    // onRegionChangeComplete={setRegion}
                    initialRegion={{
                      latitude: location?.latitude,
                      longitude: location?.longitude,
                      latitudeDelta: 0.01,
                      longitudeDelta: 0.01,
                    }}
                    showsUserLocation
                  >
                    <Marker
                      coordinate={{
                        latitude: location?.latitude,
                        longitude: location?.longitude,
                        latitudeDelta: 0.01,
                        longitudeDelta: 0.01,
                      }}
                      draggable
                      // onDragEnd={(e) => {
                      //   setRegion({
                      //     ...region,
                      //     ...e.nativeEvent.coordinate,
                      //   });
                      // }}
                    />
                  </MapView>
                )}
              </View>
              <Text
                category="s2"
                style={{
                  fontFamily: "Tajawal",
                  color: theme["text-body-color"],
                }}
              >
                المبنى رقم ١٢، حي الياسمين، طريق الملك عبد العزيز، الرياض
              </Text>
            </View>

            <View
              style={{
                paddingHorizontal: 16,
                paddingVertical: 12,
                gap: 8,
                borderWidth: 1,
                borderColor: theme["color-gray"],
                borderRadius: 12,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  gap: 8,
                }}
              >
                <View style={{ gap: 4 }}>
                  <View style={{ flexDirection: "row", gap: 4 }}>
                    <WalletIcon style={{ width: 24, height: 24 }}></WalletIcon>
                    <Text category="s1">طريفة الدفع</Text>
                  </View>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: "7",
                    }}
                  >
                    <BankNoteIcon
                      style={{ width: 34, height: 24 }}
                    ></BankNoteIcon>
                    <Text
                      category="s2"
                      style={{ color: theme["text-body-color"] }}
                    >
                      نقدي
                    </Text>
                  </View>
                </View>
                <Text category="s2" status="primary">
                  تغيير
                </Text>
              </View>
            </View>

            <View
              style={{
                paddingHorizontal: 16,
                paddingVertical: 12,
                gap: 8,
                borderWidth: 1,
                borderColor: theme["color-gray"],
                borderRadius: 12,
              }}
            >
              <View style={{ gap: 4 }}>
                <View style={{ flexDirection: "row", gap: 4 }}>
                  <ReceiptIcon style={{ width: 24, height: 24 }}></ReceiptIcon>
                  <Text category="s1">ملخص الطلب</Text>
                </View>
              </View>
              <View style={{ gap: 12 }}>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }}
                >
                  <Text category="s1" style={{ fontFamily: "Tajawal" }}>
                    المجموع الفرعي
                  </Text>
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 2,
                    }}
                  >
                    <Text
                      category="s2"
                      style={{
                        fontFamily: "Tajawal",
                        color: theme["color-black"],
                      }}
                    >
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
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }}
                >
                  <Text category="s1" style={{ fontFamily: "Tajawal" }}>
                    التوصيل القياسي
                  </Text>
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 2,
                    }}
                  >
                    <Text
                      category="s2"
                      style={{
                        fontFamily: "Tajawal",
                        color: theme["color-black"],
                      }}
                    >
                      0
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
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }}
                >
                  <Text category="s1" style={{ fontFamily: "Tajawal" }}>
                    الضريبة
                  </Text>
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 2,
                    }}
                  >
                    <Text
                      category="s2"
                      style={{
                        fontFamily: "Tajawal",
                        color: theme["color-black"],
                      }}
                    >
                      0
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
              </View>
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
            </View>
          </View>

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
            <Button style={{ flex: 1 }} onPress={() => onConfirmOrder()}>
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
                  تأكيد الطلب
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
  tabBarContainer: {
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    height: 68,
  },
  tabBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    height: 44,
    padding: 4,
    gap: 6,
    backgroundColor: theme["color-gray-modern-100"],
    borderRadius: 14,
  },
  tab: {
    flex: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    justifyContent: "center",
    alignItems: "center",
    height: 36,
    borderRadius: 10,
  },
  tabActive: {
    backgroundColor: theme["color-gray-modern-25"],
    boxShadow: "0px 2px 4px rgba(136, 30, 211, 0.15)",
  },
  tabText: {
    fontFamily: "TajawalMedium",
    color: theme["color-black"],
    fontSize: 14,
  },
});

export default Checkout;
