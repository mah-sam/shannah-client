// @ts-nocheck
import { Button, Layout, Text } from "@ui-kitten/components";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaInsetsContext } from "react-native-safe-area-context";
import { SarIcon, StarIcon } from "../components/Icons";
import { EmptyState } from "../components/ui/EmptyState";
import { ShannahImage } from "../components/ui/ShannahImage";
import { SkeletonCard } from "../components/ui/SkeletonCard";
import { useGlobal } from "../context/GlobalContext";
import { useToast } from "../context/ToastContext";
import useAuth from "../hooks/useAuth";
import { useRealtimeOrders } from "../hooks/useRealtimeOrders";
import { formatSAR } from "../utils/currency";
import * as haptics from "../utils/haptics";
import { getOrders, submitReview } from "../services/shannahApi";
import * as theme from "../theme.json";

export default function Orders() {
  const { token } = useAuth();
  const { userData, signedIn, setPendingReturnTo } = useGlobal();
  const toast = useToast();
  const [currentOrders, setCurrentOrders] = useState([]);
  const [pastOrders, setPastOrders] = useState([]);
  // Start loading=false if user is a guest. Previously `true` caused the
  // spinner to render forever for unauthenticated users (fetch never fired).
  const [loading, setLoading] = useState(signedIn);
  const [refreshing, setRefreshing] = useState(false);

  const reclassifyOrders = (list) => {
    setCurrentOrders(
      list.filter((o) => !["completed", "cancelled"].includes(o.status)),
    );
    setPastOrders(
      list.filter((o) => ["completed", "cancelled"].includes(o.status)),
    );
  };

  useRealtimeOrders(userData?.id, {
    onStatusUpdate: (payload) => {
      // Merge the status change into whichever bucket the order currently
      // lives in; reclassify because "delivered" moves from current to past.
      setCurrentOrders((prev) => {
        const all = [...prev, ...pastOrders].map((o) =>
          o.id === payload.order_id
            ? { ...o, status: payload.new_status, status_ar: payload.new_status }
            : o,
        );
        reclassifyOrders(all);
        return prev;
      });
      toast.show({
        message: "تم تحديث حالة طلبك",
        kind: "info",
      });
    },
    onCancelled: (payload) => {
      setCurrentOrders((prev) => {
        const all = [...prev, ...pastOrders].map((o) =>
          o.id === payload.order_id ? { ...o, status: "cancelled" } : o,
        );
        reclassifyOrders(all);
        return prev;
      });
      toast.show({ message: "تم إلغاء طلبك", kind: "error" });
    },
  });

  const fetchOrders = async () => {
    try {
      const result = await getOrders(token);
      const list = result?.data ?? [];
      setCurrentOrders(
        list.filter((o) => !["completed", "cancelled"].includes(o.status)),
      );
      setPastOrders(
        list.filter((o) => ["completed", "cancelled"].includes(o.status)),
      );
    } catch {
      toast.show({ message: "تعذّر تحميل الطلبات", kind: "error" });
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchOrders();
    setRefreshing(false);
  };

  useEffect(() => {
    (async () => {
      if (token !== null) {
        setLoading(true);
        try {
          const result = await getOrders(token);
          const list = result?.data ?? [];
          const current = list.filter(
            (order) => !["completed", "cancelled"].includes(order.status),
          );
          const past = list.filter((order) =>
            ["completed", "cancelled"].includes(order.status),
          );
          setCurrentOrders(current);
          setPastOrders(past);
        } catch {
          toast.show({ message: "تعذّر تحميل الطلبات", kind: "error" });
        } finally {
          setLoading(false);
        }
      }
    })();
  }, [token]);

  const handleRating = async (orderId, rating) => {
    haptics.tapSoft();
    // Optimistic: flip the star state immediately so there is no visual jitter
    // between tap and network round-trip. Revert on failure.
    const previousRating = pastOrders.find((o) => o.id === orderId)?.rating ?? null;
    setPastOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, rating } : o)),
    );

    try {
      const result = await submitReview(token, orderId, rating);
      if (result?.status === true) {
        haptics.success();
        toast.show({ message: "شكراً على تقييمك", kind: "success" });
      } else {
        setPastOrders((prev) =>
          prev.map((o) =>
            o.id === orderId ? { ...o, rating: previousRating } : o,
          ),
        );
        toast.show({
          message: result?.message || "تعذّر إرسال التقييم",
          kind: "error",
        });
      }
    } catch {
      setPastOrders((prev) =>
        prev.map((o) =>
          o.id === orderId ? { ...o, rating: previousRating } : o,
        ),
      );
      toast.show({ message: "تعذّر إرسال التقييم", kind: "error" });
    }
  };

  const badgeStyle = (status) => {
    if (status === "new") {
      return styles.statusBadgeNew;
    } else if (status === "completed") {
      return styles.statusBadgeCompleted;
    }
  };

  return (
    <SafeAreaInsetsContext.Consumer>
      {(insets) => (
        <Layout
          style={{
            ...styles.container,
            paddingTop: insets?.top,
            paddingBottom: 16 + insets?.bottom,
          }}
        >
          {!signedIn && (
            <EmptyState
              title="سجّل دخول لعرض طلباتك"
              subtitle="تتبع طلباتك السابقة والحالية بعد تسجيل الدخول"
              actionLabel="تسجيل الدخول"
              onAction={() => {
                setPendingReturnTo("/orders");
                router.push("/sign-in-mobile");
              }}
            />
          )}

          {signedIn && loading && (
            <View style={styles.skeletonContainer}>
              <SkeletonCard variant="list-row" />
              <SkeletonCard variant="list-row" />
              <SkeletonCard variant="list-row" />
            </View>
          )}

          {signedIn &&
            !loading &&
            currentOrders.length === 0 &&
            pastOrders.length === 0 && (
              <EmptyState
                title="لا توجد طلبات"
                subtitle="طلباتك ستظهر هنا بعد أول عملية شراء"
              />
            )}

          {!loading && (currentOrders.length > 0 || pastOrders.length > 0) && (
          <ScrollView
            contentContainerStyle={{ gap: 16 }}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={theme["color-primary-500"]}
              />
            }
          >
            {currentOrders.length > 0 && (
              <View style={styles.ordersContainer}>
                <Text category="s1">الطلبات الحالية</Text>
                {currentOrders.map((order) => (
                  <View key={order.id} style={styles.orderCard}>
                    <View style={styles.orderCardHeader}>
                      <View style={styles.storeContainer}>
                        <ShannahImage
                          variant="store_logo"
                          source={{ uri: order.store.logo }}
                          style={styles.thumbnail}
                        />
                        <View style={{ justifyContent: "space-between" }}>
                          <Text category="s2" style={{ textAlign: "left" }}>
                            {order.store.name}
                          </Text>
                          <Text
                            style={styles.orderNumber}
                          >{`رقم الطلب: ${order.id}`}</Text>
                        </View>
                      </View>
                      <View
                        style={[styles.statusBadge, badgeStyle(order.status)]}
                      >
                        <Text status="control">{order.status_ar}</Text>
                      </View>
                    </View>

                    <ScrollView
                      horizontal={true}
                      contentContainerStyle={styles.products}
                    >
                      {order.items.map((product) => (
                        <ShannahImage
                          key={product.product_id}
                          variant="product"
                          source={{ uri: product.image }}
                          style={styles.thumbnail}
                        />
                      ))}
                    </ScrollView>

                    <View style={styles.deliveryTimeContainer}>
                      <Text>وقت التوصيل المتوقع</Text>
                      <Text category="s2" status="primary">
                        {order.store.delivery_time}
                      </Text>
                    </View>

                    <Button onPress={() => router.push({ pathname: "/order-confirmed", params: { id: order.id } })}>
                      {(evaProps) => (
                        <Text category="s1" status="control">
                          تتبع الطلب
                        </Text>
                      )}
                    </Button>
                  </View>
                ))}
              </View>
            )}
            {pastOrders.length > 0 && (
              <View style={styles.ordersContainer}>
                <Text category="s1">الطلبات السابقة</Text>
                {pastOrders.map((order) => (
                  <View key={order.id} style={styles.orderCard}>
                    <View style={styles.orderCardHeader}>
                      <View style={styles.storeContainer}>
                        <ShannahImage
                          variant="store_logo"
                          source={{ uri: order.store.logo }}
                          style={styles.thumbnail}
                        />
                        <View style={{ justifyContent: "space-between" }}>
                          <Text category="s2">{order.store.name}</Text>
                          <Text
                            style={styles.orderNumber}
                          >{`رقم الطلب: ${order.id}`}</Text>
                        </View>
                      </View>
                      <View
                        style={[styles.statusBadge, badgeStyle(order.status)]}
                      >
                        <Text status="control">{order.status_ar}</Text>
                      </View>
                    </View>

                    <ScrollView
                      horizontal={true}
                      contentContainerStyle={styles.products}
                    >
                      {order.items.map((product) => (
                        <ShannahImage
                          key={product.product_id}
                          variant="product"
                          source={{ uri: product.image }}
                          style={styles.thumbnail}
                        />
                      ))}
                    </ScrollView>

                    <View style={styles.deliveryTimeContainer}>
                      <Text>المبلغ الإجمالي</Text>
                      <View style={styles.priceContainer}>
                        <Text category="s2" style={styles.priceText}>
                          {formatSAR(order.total_amount)}
                        </Text>
                        <SarIcon style={styles.sarIcon}></SarIcon>
                      </View>
                    </View>

                    <Button
                      appearance="outline"
                      onPress={() =>
                        router.navigate({
                          pathname: `/store/${order.store.id}`,
                        })
                      }
                    >
                      {(evaProps) => (
                        <Text category="s1" status="primary">
                          إعادة الطلب
                        </Text>
                      )}
                    </Button>

                    {order.status === "completed" && (
                      <View style={styles.ratingContainer}>
                        {order.rating === null ? (
                          <>
                            <Text>اضغط للتقييم</Text>
                            <View style={styles.starsContainer}>
                              {Array.from({ length: 5 }).map((_, index) => (
                                <Pressable
                                  key={index}
                                  onPress={() =>
                                    handleRating(order.id, index + 1)
                                  }
                                  hitSlop={4}
                                >
                                  <StarIcon
                                    style={[
                                      styles.starIcon,
                                      styles.starInactive,
                                    ]}
                                  />
                                </Pressable>
                              ))}
                            </View>
                          </>
                        ) : (
                          <>
                            <Text>تقييمك</Text>
                            <View style={styles.starsContainer}>
                              {Array.from({ length: 5 }).map((_, index) => (
                                <StarIcon
                                  key={index}
                                  style={[
                                    styles.starIcon,
                                    index < order.rating
                                      ? styles.starActive
                                      : styles.starInactive,
                                  ]}
                                />
                              ))}
                            </View>
                          </>
                        )}
                      </View>
                    )}
                  </View>
                ))}
              </View>
            )}
          </ScrollView>
          )}
        </Layout>
      )}
    </SafeAreaInsetsContext.Consumer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  ordersContainer: {
    gap: 12,
  },
  orderCard: {
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: theme["color-gray"],
    borderRadius: 12,
  },
  orderCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
    height: 36,
  },
  storeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  thumbnail: {
    width: 36,
    height: 36,
    borderRadius: 8,
  },
  orderNumber: {
    color: theme["text-body-color"],
    textAlign: "left",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    height: 24,
  },
  statusBadgeNew: {
    backgroundColor: theme["color-primary-500"],
  },
  statusBadgeCompleted: {
    backgroundColor: "#34A853",
  },
  products: {
    flexDirection: "row",
    gap: 9,
  },
  deliveryTimeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  deliveryTimeTitle: {
    color: theme["color-black"],
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  priceText: {
    color: theme["color-primary-500"],
    fontFamily: "TajawalBold",
  },
  sarIcon: {
    width: 12,
    height: 12,
    tintColor: theme["color-primary-500"],
  },
  ratingContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  starsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  starIcon: {
    width: 16,
    height: 16,
  },
  starActive: {
    tintColor: "#F5A623",
  },
  starInactive: {
    tintColor: theme["color-gray"],
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
