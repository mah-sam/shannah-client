// @ts-nocheck
import { Button, Layout, Text } from "@ui-kitten/components";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Image, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaInsetsContext } from "react-native-safe-area-context";
import { ChevronDownIcon, SarIcon } from "../components/Icons";
import BottomActionBar from "../components/ui/BottomActionBar";
import useAuth from "../hooks/useAuth";
import { orderDetails } from "../services/shannahApi";
import * as theme from "../theme.json";

export default function OrderConfirmed() {
  const { id } = useLocalSearchParams();
  const { token } = useAuth();
  const [order, setOrder] = useState({});

  useEffect(() => {
    token &&
      (async () => {
        const result = await orderDetails(token, id);
        setOrder(result?.data);
      })();
  }, [token]);

  return (
    <SafeAreaInsetsContext.Consumer>
      {(insets) => (
        <Layout
          style={{
            ...styles.container,
            paddingTop: insets.top + 60,
            paddingBottom: insets.bottom,
          }}
        >
          <Image
            source={require("../assets/images/delivery-man.png")}
            style={styles.image}
          ></Image>
          <View style={styles.titleContainer}>
            <Text category="h2" style={styles.titleText}>
              تم تقديم الطلب!
            </Text>
            <Text category="s2" style={styles.etaText}>
              مدة التوصيل المتوقعة
            </Text>
            <Text category="s1" style={styles.eta}>
              {order?.store?.delivery_time}
            </Text>
          </View>

          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{
              flexGrow: 1,
            }}
          >
            <View style={styles.orderSummaryContainer}>
              <Text category="s1" style={styles.titleText}>
                ملخص الطلب
              </Text>
              <View style={styles.orderSummaryRow}>
                <Text category="s2" style={{ flex: 1, textAlign: "left" }}>
                  رقم الطلب
                </Text>
                <Text category="s2" style={styles.orderSummaryText}>
                  {order?.id}
                </Text>
              </View>
              <View style={styles.orderSummaryRow}>
                <Text category="s2" style={{ flex: 1, textAlign: "left" }}>
                  اسم المتجر
                </Text>
                <Text category="s2" style={styles.orderSummaryText}>
                  {order?.store?.name}
                </Text>
              </View>
              <View style={styles.orderSummaryRow}>
                <Text category="s2" style={{ flex: 1, textAlign: "left" }}>
                  عنوان التسليم
                </Text>
                <Text category="s2" style={{ flex: 1 }}>
                  {order?.address?.national_address}
                </Text>
              </View>
              <View style={styles.orderSummaryRow}>
                <Text category="s2">المبلغ الإجمالي</Text>
                <View style={styles.priceContainer}>
                  <Text category="s2" style={styles.orderSummaryText}>
                    {order?.total_amount}
                  </Text>
                  <SarIcon style={styles.sarIcon}></SarIcon>
                </View>
              </View>
            </View>

            <View style={styles.orderItemsContainer}>
              <View style={styles.orderItemsHeader}>
                <Text category="s2">تفاصيل الطلب</Text>
                <ChevronDownIcon
                  style={styles.chevronDownIcon}
                ></ChevronDownIcon>
              </View>
              {order?.items?.map((item) => (
                <View key={item.product_id} style={styles.orderItemsRow}>
                  <Text>
                    {item.name + " "}
                    <Text category="p2">{item.qty}x</Text>
                  </Text>
                  <View style={styles.priceContainer}>
                    <Text>
                      {item.qty * item.unit_price +
                        item.options?.reduce((prevVal, currVal) => {
                          return (
                            prevVal +
                            currVal.reduce((p, c) => {
                              return p + parseFloat(c.valuePrice);
                            }, 0)
                          );
                        }, 0)}
                    </Text>
                    <SarIcon style={styles.sarIcon}></SarIcon>
                  </View>
                </View>
              ))}
            </View>
          </ScrollView>

          <BottomActionBar>
            <Button onPress={() => router.push(`/orders`)}>
              {(evaProps) => (
                <Text category="s1" status="control">
                  تتبع الطلب
                </Text>
              )}
            </Button>
            <Button
              appearance="outline"
              onPress={() => router.replace("/(tabs)")}
            >
              {(evaProps) => (
                <Text category="s1" status="primary">
                  استكشف المزيد
                </Text>
              )}
            </Button>
          </BottomActionBar>
        </Layout>
      )}
    </SafeAreaInsetsContext.Consumer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,

    gap: 16,
  },
  image: {
    alignSelf: "center",
    width: 260,
    height: 200,
  },
  titleContainer: {
    gap: 4,
    alignItems: "center",
    paddingHorizontal: 16,
  },
  titleText: {
    color: theme["text-heading-color"],
    textAlign: "left",
  },
  etaText: {
    color: theme["text-body-color"],
  },
  orderSummaryContainer: {
    gap: 8,
    paddingHorizontal: 16,
  },
  orderSummaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  orderSummaryText: {
    fontFamily: "TajawalBold",
    textAlign: "right",
  },
  priceContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 2,
  },
  sarIcon: {
    width: 12,
    height: 12,
  },
  orderItemsContainer: {
    flex: 1,
    gap: 7,
    paddingHorizontal: 16,
  },
  orderItemsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  chevronDownIcon: {
    width: 20,
    height: 20,
  },
  orderItemsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
});
