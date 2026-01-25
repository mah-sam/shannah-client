import { Layout, Spinner, Tab, TabView, Text } from "@ui-kitten/components";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaInsetsContext } from "react-native-safe-area-context";
import {
  ArrowRightIcon,
  ClockIcon,
  DistanceIcon,
  HeartIcon,
  SarIcon,
  StarIcon,
} from "../../components/Icons";
import { ProductsList } from "../../components/StoreComponents";
import { getStores } from "../../services/shannahApi";
import * as theme from "../../theme.json";

const Store = () => {
  const { id } = useLocalSearchParams();
  const [store, setStore] = useState({});
  const [storeDataLoaded, setStoreDataLoaded] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    (async () => {
      const result = await getStores(id);
      setStore(result.data);
    })();
  }, []);

  useEffect(() => {
    Object.keys(store).length > 0 && setStoreDataLoaded(true);
  }, [store]);

  return (
    <SafeAreaInsetsContext.Consumer>
      {(insets) => (
        <Layout
          style={{
            ...styles.container,
            paddingTop: insets.top,
            paddingBottom: insets.bottom,
          }}
        >
          {storeDataLoaded ? (
            <>
              <View style={styles.coverContainer}>
                <Image
                  source={{
                    uri: store.cover,
                  }}
                  resizeMode="cover"
                  style={styles.coverImage}
                ></Image>
                <View style={styles.backButton}>
                  <Pressable onPress={() => router.back()}>
                    <ArrowRightIcon
                      style={styles.arrowRightIcon}
                    ></ArrowRightIcon>
                  </Pressable>
                </View>
                <View style={styles.favoriteButton}>
                  <HeartIcon style={styles.heartIcon}></HeartIcon>
                </View>
                <View style={styles.logoContainer}>
                  <Image
                    source={{
                      uri: store.logo,
                    }}
                    resizeMode="cover"
                    style={styles.logoImage}
                  ></Image>
                </View>
              </View>
              <View style={styles.storeInfoContainer}>
                <Text category="h2">{store.name}</Text>
                <View style={styles.storeRatingContainer}>
                  <StarIcon style={styles.starIcon}></StarIcon>
                  <Text
                    style={styles.storeRatingText}
                  >{`${store.rating} (${store.review_count})`}</Text>
                </View>
                <ScrollView horizontal={true}>
                  <View style={styles.storeInfo}>
                    <View style={styles.distanceContainer}>
                      <DistanceIcon style={styles.distanceIcon}></DistanceIcon>
                      <Text
                        style={styles.storeCardText}
                      >{`${store.max_delivery_radius_km} كم`}</Text>
                    </View>
                    <View style={styles.deliveryTimeContainer}>
                      <ClockIcon style={styles.clockIcon}></ClockIcon>
                      <Text style={styles.storeCardText}>
                        {store.delivery_time}
                      </Text>
                    </View>
                    <Text style={styles.storeCardText}>|</Text>
                    <View style={styles.minOrderContainer}>
                      <Text style={styles.storeCardText}>
                        {`الحد الأدنى للطلب ${store.min_order_value}`}
                      </Text>
                      <SarIcon style={styles.sarIcon}></SarIcon>
                    </View>
                    <Text style={styles.storeCardText}>|</Text>
                    <View style={styles.deliveryFeeContainer}>
                      <Text style={styles.storeCardText}>
                        {`التوصيل ${store.delivery_fee}`}
                      </Text>
                      <SarIcon style={styles.sarIcon}></SarIcon>
                    </View>
                  </View>
                </ScrollView>
              </View>
              <View style={styles.tabsContainer}>
                {Object.keys(store).length > 0 && (
                  <TabView
                    selectedIndex={selectedIndex}
                    onSelect={(index) => setSelectedIndex(index)}
                    tabBarStyle={styles.tabBar}
                    indicatorStyle={styles.indicator}
                  >
                    {Object.keys(store?.products ?? []).map((category) => (
                      <Tab
                        title={
                          <View>
                            <Text style={styles.tabText}>{category}</Text>
                          </View>
                        }
                      >
                        <Layout style={styles.tabContent}>
                          <ProductsList
                            store={store}
                            items={store.products[category]}
                          ></ProductsList>
                        </Layout>
                      </Tab>
                    ))}
                  </TabView>
                )}
              </View>
            </>
          ) : (
            <View style={styles.spinnerContainer}>
              <Spinner></Spinner>
            </View>
          )}
        </Layout>
      )}
    </SafeAreaInsetsContext.Consumer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  spinnerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  coverContainer: { height: 140, backgroundColor: theme["color-primary-50"] },
  coverImage: { width: "100%", height: 140 },
  backButton: {
    position: "absolute",
    width: 32,
    height: 32,
    left: 16,
    top: 16,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: "50%",
    justifyContent: "center",
    alignItems: "center",
  },
  arrowRightIcon: { width: 24, height: 24 },
  favoriteButton: {
    position: "absolute",
    width: 32,
    height: 32,
    right: 16,
    top: 16,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: "50%",
    justifyContent: "center",
    alignItems: "center",
  },
  heartIcon: { width: 24, height: 24 },
  logoContainer: {
    position: "absolute",
    left: 24,
    top: 110,
    width: 48,
    height: 48,
    boxShadow: "0px 0px 6px rgba(0, 0, 0, 0.15)",
    borderRadius: 4,
    backgroundColor: theme["color-primary-500"],
  },
  logoImage: { width: 48, height: 48 },
  starIcon: {
    width: 16,
    height: 16,
  },
  storeInfoContainer: { paddingHorizontal: 16, paddingVertical: 12, gap: 4 },
  storeRatingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  storeRatingText: {
    fontFamily: "TajawalMedium",
    fontSize: 12,
    color: theme["color-black"],
  },
  storeInfo: { flexDirection: "row", alignItems: "center", gap: 4 },
  distanceContainer: { flexDirection: "row", alignItems: "center", gap: 2 },
  distanceIcon: { width: 12, height: 12 },
  deliveryTimeContainer: { flexDirection: "row", alignItems: "center", gap: 2 },
  clockIcon: { width: 12, height: 12 },
  minOrderContainer: { flexDirection: "row", alignItems: "center", gap: 2 },
  sarIcon: { width: 12, height: 12 },
  deliveryFeeContainer: { flexDirection: "row", alignItems: "center", gap: 2 },
  tabsContainer: { paddingHorizontal: 16 },
  tabBar: {
    gap: 12,
    borderBottomWidth: 0.8,
    borderBottomColor: "#E5E7EB",
  },
  indicator: {
    height: 1.6,
    bottom: 2.4,
    borderRadius: 0,
  },
  tabText: {
    textAlign: "left",
    fontFamily: "TajawalMedium",
    fontSize: 16,
  },
  tabContent: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 12,
  },
});

export default Store;
