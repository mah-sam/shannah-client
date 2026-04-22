// @ts-nocheck
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
import { PrimaryButton } from "../components/ui/PrimaryButton";
import { useGlobal } from "../context/GlobalContext";
import { useToast } from "../context/ToastContext";
import useAuth from "../hooks/useAuth";
import useCart from "../hooks/useCart";
import * as haptics from "../utils/haptics";
import { applyCoupon, getPlatformSettings, getStores, initiatePayment, submitOrder } from "../services/shannahApi";
import * as theme from "../theme.json";

const Checkout = () => {
  const { productType, storeId } = useLocalSearchParams();
  const { signedIn, deliveryAddress, setPendingReturnTo, cartItems } = useGlobal();
  const { token } = useAuth();
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

  // Delivery method
  const [deliveryMethod, setDeliveryMethod] = useState<"delivery" | "pickup">("delivery");

  // Order submission error
  const [orderError, setOrderError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const toast = useToast();

  useFocusEffect(
    useCallback(() => {
      // Backend renamed lat/lng → latitude/longitude. Prefer the new keys,
      // fall back to legacy ones during the rollout.
      const addrLat = deliveryAddress?.latitude ?? deliveryAddress?.lat;
      const addrLng = deliveryAddress?.longitude ?? deliveryAddress?.lng;
      if (!deliveryAddress || addrLat == null || addrLng == null) {
        router.push("/addresses/select");
        return;
      }
      setCoords({
        latitude: parseFloat(addrLat),
        longitude: parseFloat(addrLng),
      });

      const fetchFees = async () => {
        try {
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
        } catch {
          // Fees are server-authoritative at order submission; if we can't
          // fetch them here the user still sees sane defaults and the final
          // total is recomputed on the server.
        }
      };
      fetchFees();
    }, [deliveryAddress, storeId]),
  );

  // Inclusive-VAT math (ZATCA). Prices in the cart are gross; the VAT line
  // below is an informational extraction, not an extra charge.
  const currentSubtotal = subtotal(productType, storeId); // gross items subtotal
  const taxableGross = Math.max(0, currentSubtotal - couponDiscount + deliveryFee);
  const totalAmount = Math.round(taxableGross * 100) / 100;
  const taxAmount =
    Math.round(
      (taxableGross - taxableGross / (1 + vatPercent / 100)) * 100,
    ) / 100;

  const onApplyCoupon = async () => {
    if (!couponCode.trim()) return;

    // Pre-auth gate: guests applying a coupon used to see "network error"
    // because the request fired with token=null and 401'd. Show the real
    // reason and guide them into sign-in with returnTo=/checkout.
    if (!signedIn || !token) {
      toast.show({
        message: "سجّل دخول لاستخدام الكوبون",
        kind: "info",
      });
      setPendingReturnTo("/checkout");
      router.push("/sign-in-mobile");
      return;
    }

    setCouponLoading(true);
    setCouponError("");

    const items = (cartItems[productType]?.[storeId] ?? []).map((product) => ({
      product_id: product.id,
      qty: product.qty,
      options_price: product.optionsPrice ?? 0,
    }));

    let result;
    try {
      result = await applyCoupon(token, couponCode.trim().toUpperCase(), items);
    } catch {
      setCouponLoading(false);
      setCouponDiscount(0);
      setCouponApplied(false);
      const msg = "تعذّر الاتصال بالخادم. تحقق من الإنترنت";
      setCouponError(msg);
      haptics.warning();
      toast.show({ message: msg, kind: "error" });
      return;
    }

    setCouponLoading(false);

    if (result?.status === true) {
      setCouponDiscount(result.discount);
      setCouponApplied(true);
      setCouponError("");
      haptics.success();
      toast.show({ message: "تم تطبيق كود الخصم", kind: "success" });
    } else {
      setCouponDiscount(0);
      setCouponApplied(false);
      const msg = result?.message || "كود الخصم غير صالح";
      setCouponError(msg);
      haptics.warning();
      toast.show({ message: msg, kind: "error" });
    }
  };

  const onRemoveCoupon = () => {
    setCouponCode("");
    setCouponDiscount(0);
    setCouponApplied(false);
    setCouponError("");
  };

  const onConfirmOrder = async () => {
    if (submitting) return;
    if (!signedIn) {
      // Stash the checkout destination so post-OTP-verify returns here
      // with the cart intact, instead of dumping the user on home.
      setPendingReturnTo("/checkout");
      router.replace("/sign-in-mobile");
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
      delivery_method: deliveryMethod,
      scheduled_at: null,
      phone: null,
      notes: notes,
      items: items,
    };

    if (couponApplied && couponCode.trim()) {
      order.coupon_code = couponCode.trim().toUpperCase();
    }

    setOrderError("");
    setSubmitting(true);
    try {
      const result = await submitOrder(token, order);

      if (!result?.status || !result?.data?.id) {
        const msg =
          result?.message ||
          result?.errors?.coupon_code?.[0] ||
          "حدث خطأ أثناء تقديم الطلب. حاول مجدداً.";
        setOrderError(msg);
        return;
      }

      // Route through the payment controller so the flow is identical
      // regardless of method. For COD this is an acknowledgement; future
      // gateways will return a `payment_url` to open before confirming.
      const orderId = result.data.id;
      try {
        const payment = await initiatePayment(token, orderId, "cod");
        if (payment?.status === "requires_payment" && payment.payment_url) {
          // Placeholder for future: open in WebBrowser / universal link.
          // Today COD never returns this path; keeping the code path proves
          // the integration contract stays stable when a gateway is added.
          console.warn("[checkout] payment_url requested but no gateway wired");
        }
      } catch {
        // Do not block the user from reaching the confirmation screen —
        // the order itself is already created. Payment reconciliation can
        // be retried from the orders screen when gateways are wired.
      }

      await deleteStoreById(productType, storeId);
      haptics.success();
      router.replace({
        pathname: "/order-confirmed",
        params: { id: orderId },
      });
    } catch (e) {
      const msg = "تعذّر الاتصال بالخادم. تحقق من الإنترنت وحاول مجدداً.";
      setOrderError(msg);
      haptics.error();
      toast.show({ message: msg, kind: "error" });
    } finally {
      setSubmitting(false);
    }
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
                    deliveryMethod === "delivery"
                      ? [styles.tab, styles.tabActive]
                      : styles.tab
                  }
                  onPress={() => setDeliveryMethod("delivery")}
                >
                  <Text style={styles.tabText}>توصيل</Text>
                </Pressable>
                <Pressable
                  style={
                    deliveryMethod === "pickup"
                      ? [styles.tab, styles.tabActive]
                      : styles.tab
                  }
                  onPress={() => setDeliveryMethod("pickup")}
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
                  <Text category="s2" style={{ color: theme["text-body-color"] }}>
                    شامل ضريبة القيمة المضافة
                  </Text>
                  <View style={styles.priceContainer}>
                    <Text category="s2" style={{ color: theme["text-body-color"] }}>
                      {taxAmount}
                    </Text>
                    <SarIcon style={styles.sarIcon}></SarIcon>
                  </View>
                </View>
              </View>
              <View style={styles.summaryCardRow}>
                <Text category="s1">الإجمالي</Text>

                <View style={styles.priceContainer}>
                  <Text category="s1" style={{ fontFamily: "TajawalBold" }}>
                    {totalAmount}
                  </Text>
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
            <PrimaryButton
              onPress={() => onConfirmOrder()}
              loading={submitting}
              accessibilityLabel="تأكيد الطلب"
            >
              تأكيد الطلب
            </PrimaryButton>
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
