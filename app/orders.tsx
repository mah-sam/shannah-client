// @ts-nocheck
import { Button, Layout, Text } from "@ui-kitten/components";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaInsetsContext } from "react-native-safe-area-context";
import { SarIcon, StarIcon } from "../components/Icons";
import { EmptyState } from "../components/ui/EmptyState";
import { ShannahImage } from "../components/ui/ShannahImage";
import useAuth from "../hooks/useAuth";
import { getOrders, submitReview } from "../services/shannahApi";
import * as theme from "../theme.json";

export default function Orders() {
  const { token } = useAuth();
  const [currentOrders, setCurrentOrders] = useState([]);
  const [pastOrders, setPastOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      if (token !== null) {
        setLoading(true);
        const result = await getOrders(token);
        const current = result.data.filter(
          (order) => !["completed", "cancelled"].includes(order.status),
        );
        const past = result.data.filter((order) =>
          ["completed", "cancelled"].includes(order.status),
        );

        setCurrentOrders(current);
        setPastOrders(past);
        setLoading(false);
      }
    })();
  }, [token]);

  const handleRating = async (orderId, rating) => {
    const result = await submitReview(token, orderId, rating);
    if (result?.status === true) {
      setPastOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, rating } : o)),
      );
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
          {loading && (
            <View style={styles.centerFill}>
              <ActivityIndicator size="large" color={theme["color-primary-500"]} />
            </View>
          )}

          {!loading && currentOrders.length === 0 && pastOrders.length === 0 && (
            <EmptyState
              title="لا توجد طلبات"
              subtitle="طلباتك ستظهر هنا بعد أول عملية شراء"
            />
          )}

          {!loading && (currentOrders.length > 0 || pastOrders.length > 0) && (
          <ScrollView contentContainerStyle={{ gap: 16 }}>
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
                          {order.total_amount}
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
    borderRadius: 4,
    backgroundColor: theme["color-primary-50"],
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
});
