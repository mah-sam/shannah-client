import {
  Button,
  Input,
  Layout,
  Text,
} from "@ui-kitten/components";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

let MapView = View;
let Marker = View;
if (Platform.OS !== "web") {
  const Maps = require("react-native-maps");
  MapView = Maps.default;
  Marker = Maps.Marker;
}
import { SafeAreaInsetsContext } from "react-native-safe-area-context";
import {
  BankNoteIcon,
  EditIcon,
  ReceiptIcon,
  SarIcon,
  WalletIcon,
} from "../components/Icons";
import BottomActionBar from "../components/ui/BottomActionBar";
import { useGlobal } from "../context/GlobalContext";
import useAuth from "../hooks/useAuth";
import useCart from "../hooks/useCart";
import { applyCoupon, getPlatformSettings, getStores, submitOrder } from "../services/shannahApi";
import * as theme from "../theme.json";

const Checkout = () => {
  const { productType, storeId } = useLocalSearchParams();
  const { signedIn, deliveryAddress } = useGlobal();
  const { token } = useAuth();
  const { cartItems } = useGlobal();
  const { subtotal, deleteStoreById } = useCart();
  const [coords, setCoords] = useState(null);
  const [notes, setNotes] = useState("");

  // Coupon state
  const [couponCode, setCouponCode] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponError, setCouponError] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);

  // Fee/tax state (fetched from platform settings + store override)
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [vatPercent, setVatPercent] = useState(15);

  // Order submission error
  const [orderError, setOrderError] = useState("");

  useFocusEffect(
    useCallback(() => {
      if (!deliveryAddress || !deliveryAddress.lat || !deliveryAddress.lng) {
        router.push("/addresses/select");
        return;
      }
      setCoords({
        latitude: parseFloat(deliveryAddress.lat),
        longitude: parseFloat(deliveryAddress.lng),
      });

      const fetchFees = async () => {
        const [settingsResult, storeResult] = await Promise.all([
          getPlatformSettings(),
          getStores(null, storeId),
        ]);
        setVatPercent(parseFloat(settingsResult?.vat_percent ?? 15));
        const storeDelivery = storeResult?.data?.delivery_fee;
        setDeliveryFee(
          storeDelivery != null
            ? parseFloat(storeDelivery)
            : parseFloat(settingsResult?.delivery_fee ?? 0),
        );
      };
      fetchFees();
    }, [deliveryAddress, storeId]),
  );

  const currentSubtotal = subtotal(productType, storeId);
  const taxableAmount = Math.max(0, currentSubtotal - couponDiscount);
  const taxAmount = Math.round(taxableAmount * vatPercent / 100 * 100) / 100;
  const totalAmount = taxableAmount + deliveryFee + taxAmount;

  const onApplyCoupon = async () => {
    if (!couponCode.trim()) return;

    setCouponLoading(true);
    setCouponError("");

    const items = (cartItems[productType]?.[storeId] ?? []).map((product) => ({
      product_id: product.id,
      qty: product.qty,
      options_price: product.optionsPrice ?? 0,
    }));

    const result = await applyCoupon(token, couponCode.trim().toUpperCase(), items);

    setCouponLoading(false);

    if (result?.status === true) {
      setCouponDiscount(result.discount);
      setCouponApplied(true);
      setCouponError("");
    } else {
      setCouponDiscount(0);
      setCouponApplied(false);
      setCouponError(result?.message || "كود الخصم غير صالح");
    }
  };

  const onRemoveCoupon = () => {
    setCouponCode("");
    setCouponDiscount(0);
    setCouponApplied(false);
    setCouponError("");
  };

  const onConfirmOrder = async () => {
    if (!signedIn) {
      router.replace("/sign-in");
      return;
    }
    const items = [];
    cartItems[productType][storeId].forEach((product) => {
      items.push({
        product_id: product.id,
        qty: product.qty,
        unit_price: product.price,
        options: product.options,
        notes: product.notes,
      });
    });

    const order = {
      store_id: storeId,
      address_id: deliveryAddress.id,
      delivery_method: "delivery",
      scheduled_at: null,
      phone: null,
      notes: notes,
      items: items,
    };

    if (couponApplied && couponCode.trim()) {
      order.coupon_code = couponCode.trim().toUpperCase();
    }

    setOrderError("");
    const result = await submitOrder(token, order);

    if (!result?.status || !result?.data?.id) {
      const msg =
        result?.message ||
        result?.errors?.coupon_code?.[0] ||
        "حدث خطأ أثناء تقديم الطلب. حاول مجدداً.";
      setOrderError(msg);
      return;
    }

    await deleteStoreById(productType, storeId);
    router.replace({
      pathname: "/order-confirmed",
      params: { id: result.data.id },
    });
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
            contentContainerStyle={styles.contentContainer}
          >
            <View style={styles.card}>
              <View style={styles.tabBar}>
                <Pressable
                  style={
                    productType === "meal"
                      ? [styles.tab, styles.tabActive]
                      : styles.tab
                  }
                  onPress={() => {}}
                >
                  <Text style={styles.tabText}>توصيل</Text>
                </Pressable>
                <Pressable
                  style={
                    productType === "banquet"
                      ? [styles.tab, styles.tabActive]
                      : styles.tab
                  }
                  onPress={() => {}}
                >
                  <Text style={styles.tabText}>استلام</Text>
                </Pressable>
              </View>

              <View style={styles.changeAddressContainer}>
                <Text category="s1">عنوان التسليم</Text>
                <Pressable onPress={() => router.navigate("/addresses/select")}>
                  <EditIcon style={styles.editIcon}></EditIcon>
                </Pressable>
              </View>
              {coords !== null && (
                <View style={styles.mapViewContainer}>
                  <MapView
                    style={StyleSheet.absoluteFill}
                    region={{
                      latitude: coords.latitude,
                      longitude: coords.longitude,
                      latitudeDelta: 0.015,
                      longitudeDelta: 0.015,
                    }}
                  >
                    <Marker coordinate={coords} tracksViewChanges={false} />
                  </MapView>
                </View>
              )}
              <Text
                category="s2"
                style={styles.deliveryAddress}
                numberOfLines={2}
              >
                {deliveryAddress.national_address}
              </Text>
              <View>
                {notes.length === 0 && (
                  <Text style={styles.notesPlaceholder}>تعليمات التوصيل</Text>
                )}
                <Input
                  status="primary"
                  multiline={true}
                  value={notes}
                  onChangeText={(t) => setNotes(t)}
                  textAlign="right"
                />
              </View>
            </View>

            <View style={styles.card}>
              <View style={styles.paymentOptionContainer}>
                <View style={{ gap: 4 }}>
                  <View style={styles.cardTitle}>
                    <WalletIcon style={styles.walletIcon}></WalletIcon>
                    <Text category="s1" style={styles.paymentOptionTitle}>
                      طريفة الدفع
                    </Text>
                  </View>
                  <View style={styles.paymentOption}>
                    <BankNoteIcon style={styles.bankNoteIcon}></BankNoteIcon>
                    <Text category="s2" style={styles.paymentOptionText}>
                      نقدي
                    </Text>
                  </View>
                </View>
                <Text category="s2" status="primary">
                  تغيير
                </Text>
              </View>
            </View>

            {/* Coupon */}
            <View style={styles.card}>
              <Text category="s1">كود الخصم</Text>
              {couponApplied ? (
                <View style={styles.couponAppliedRow}>
                  <View style={styles.couponBadge}>
                    <Text category="s2" style={styles.couponBadgeText}>
                      {couponCode}
                    </Text>
                  </View>
                  <Pressable onPress={onRemoveCoupon}>
                    <Text category="s2" status="danger">
                      إزالة
                    </Text>
                  </Pressable>
                </View>
              ) : (
                <View style={styles.couponInputRow}>
                  <Input
                    style={styles.couponInput}
                    placeholder="أدخل كود الخصم"
                    value={couponCode}
                    onChangeText={(t) => {
                      setCouponCode(t);
                      setCouponError("");
                    }}
                    textAlign="right"
                    status={couponError ? "danger" : "basic"}
                  />
                  <Button
                    size="small"
                    onPress={onApplyCoupon}
                    disabled={couponLoading || !couponCode.trim()}
                    style={styles.couponButton}
                  >
                    {couponLoading
                      ? () => (
                          <ActivityIndicator size="small" color="#fff" />
                        )
                      : () => (
                          <Text category="s2" status="control">
                            تطبيق
                          </Text>
                        )}
                  </Button>
                </View>
              )}
              {couponError ? (
                <Text category="c1" status="danger">
                  {couponError}
                </Text>
              ) : null}
            </View>

            <View style={styles.card}>
              <View style={{ gap: 4 }}>
                <View style={styles.cardTitle}>
                  <ReceiptIcon style={styles.receiptIcon}></ReceiptIcon>
                  <Text category="s1">ملخص الطلب</Text>
                </View>
              </View>
              <View style={{ gap: 12 }}>
                <View style={styles.summaryCardRow}>
                  <Text category="s2">المجموع الفرعي</Text>
                  <View style={styles.priceContainer}>
                    <Text category="s2">{currentSubtotal}</Text>
                    <SarIcon style={styles.sarIcon}></SarIcon>
                  </View>
                </View>
                {couponDiscount > 0 && (
                  <View style={styles.summaryCardRow}>
                    <Text category="s2" status="success">
                      الخصم
                    </Text>
                    <View style={styles.priceContainer}>
                      <Text category="s2" status="success">
                        -{couponDiscount}
                      </Text>
                      <SarIcon
                        style={[styles.sarIcon, styles.sarIconDiscount]}
                      ></SarIcon>
                    </View>
                  </View>
                )}
                <View style={styles.summaryCardRow}>
                  <Text category="s2">رسوم التوصيل</Text>
                  <View style={styles.priceContainer}>
                    <Text category="s2">{deliveryFee}</Text>
                    <SarIcon style={styles.sarIcon}></SarIcon>
                  </View>
                </View>
                <View style={styles.summaryCardRow}>
                  <Text category="s2">الضريبة</Text>
                  <View style={styles.priceContainer}>
                    <Text category="s2">{taxAmount}</Text>
                    <SarIcon style={styles.sarIcon}></SarIcon>
                  </View>
                </View>
              </View>
              <View style={styles.summaryCardRow}>
                <Text category="s1">
                  الإجمالي <Text>(يشمل الرسوم والضرائب والخصومات)</Text>
                </Text>

                <View style={styles.priceContainer}>
                  <Text category="s1">{totalAmount}</Text>
                  <SarIcon style={styles.sarIcon}></SarIcon>
                </View>
              </View>
            </View>
          </ScrollView>

          {orderError ? (
            <Text
              category="c1"
              status="danger"
              style={{ textAlign: "center", paddingHorizontal: 16, paddingBottom: 4 }}
            >
              {orderError}
            </Text>
          ) : null}

          <BottomActionBar>
            <Button onPress={() => onConfirmOrder()}>
              {(evaProps) => (
                <Text category="s1" status="control">
                  تأكيد الطلب
                </Text>
              )}
            </Button>
          </BottomActionBar>
        </Layout>
      )}
    </SafeAreaInsetsContext.Consumer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: { padding: 16, gap: 16, flexGrow: 1 },
  card: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: theme["color-gray"],
    borderRadius: 12,
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
  changeAddressContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  editIcon: {
    width: 20,
    height: 20,
    tintColor: theme["text-body-color"],
  },
  mapViewContainer: {
    height: 130,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  deliveryAddress: {
    fontFamily: "Tajawal",
    lineHeight: 20,
    color: theme["text-body-color"],
  },
  notesPlaceholder: {
    position: "absolute",
    top: 10,
    left: 20,
    fontSize: 16,
    color: theme["text-body-color"],
    zIndex: 1,
  },
  paymentOptionContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  cardTitle: { flexDirection: "row", gap: 4 },
  walletIcon: { width: 24, height: 24, tintColor: theme["text-heading-color"] },
  paymentOptionTitle: { color: theme["text-heading-color"] },
  paymentOption: { flexDirection: "row", alignItems: "center", gap: 7 },
  bankNoteIcon: { width: 34, height: 24 },
  paymentOptionText: { color: theme["text-body-color"] },
  receiptIcon: {
    width: 24,
    height: 24,
    tintColor: theme["text-heading-color"],
  },
  summaryCardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  priceContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 2,
  },
  sarIcon: {
    width: 16,
    height: 16,
    tintColor: theme["color-black"],
  },
  sarIconDiscount: {
    tintColor: "#34A853",
  },
  couponInputRow: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  couponInput: {
    flex: 1,
  },
  couponButton: {
    height: 40,
  },
  couponAppliedRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  couponBadge: {
    backgroundColor: theme["color-primary-50"],
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  couponBadgeText: {
    color: theme["color-primary-500"],
  },
});

export default Checkout;
