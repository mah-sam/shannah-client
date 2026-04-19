// @ts-nocheck
import { Layout, Spinner, Tab, TabView, Text } from "@ui-kitten/components";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Linking, Platform, Pressable, ScrollView, StyleSheet, View } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { SafeAreaInsetsContext } from "react-native-safe-area-context";
import {
  ChevronLeft,
  ClockIcon,
  DistanceIcon,
  SarIcon,
  StarIcon,
} from "../../components/Icons";
import { ProductsList } from "../../components/StoreComponents";
import { AnimatedFavoriteButton } from "../../components/ui/AnimatedFavoriteButton";
import { EmptyState } from "../../components/ui/EmptyState";
import { ShannahImage } from "../../components/ui/ShannahImage";
import { useGlobal } from "../../context/GlobalContext";
import { useDeliveryReference } from "../../hooks/useDeliveryReference";
import { formatSAR } from "../../utils/currency";
import { formatDistanceKm, haversineKm } from "../../utils/distance";
import { computeEtaRange, formatEtaRange } from "../../utils/eta";
import useAuth from "../../hooks/useAuth";
import { getStores, toggleFavorite } from "../../services/shannahApi";
import * as theme from "../../theme.json";

const Store = () => {
  const { signedIn } = useGlobal();
  const { token } = useAuth();
  const { id } = useLocalSearchParams();
  const [store, setStore] = useState({});
  const [storeDataLoaded, setStoreDataLoaded] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const reference = useDeliveryReference();
  const distanceKm = reference && store?.latitude != null && store?.longitude != null
    ? haversineKm(reference, { latitude: store.latitude, longitude: store.longitude })
    : null;
  const etaRange = computeEtaRange(store?.base_prep_time_minutes, distanceKm);
  const etaLabel = formatEtaRange(etaRange) || store?.delivery_time || "";
  const distanceLabel = distanceKm != null ? formatDistanceKm(distanceKm) : "";
  const outOfRange = distanceKm != null && store?.max_delivery_radius_km != null
    && distanceKm > store.max_delivery_radius_km;

  const handleToggleFavorite = async () => {
    if (!token) return;
    const result = await toggleFavorite(token, "store", id);
    setIsFavorite(result.favorited);
  };

  useEffect(() => {
    (async () => {
      const result = await getStores(token, id);
      setStore(result.data);
      setIsFavorite(result.data?.is_favorite || false);
    })();
  }, [token]);

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
              <View style={{ gap: 16 }}>
                <View style={styles.coverContainer}>
                  <ShannahImage
                    variant="store_cover"
                    source={{ uri: store.cover }}
                    style={styles.coverImage}
                  />
                  <View style={styles.backButton}>
                    <Pressable onPress={() => router.back()} hitSlop={10}>
                      <ChevronLeft style={styles.arrowRightIcon} />
                    </Pressable>
                  </View>
                  {signedIn && (
                    <AnimatedFavoriteButton
                      isFavorite={isFavorite}
                      onToggle={handleToggleFavorite}
                      style={styles.favoriteButton}
                      buttonStyle={styles.heartButtonContainer}
                      iconStyle={
                        isFavorite ? styles.heartFilledIcon : styles.heartIcon
                      }
                      backgroundColor="rgba(255, 255, 255, 0.9)"
                    />
                  )}
                  <View style={styles.logoContainer}>
                    <ShannahImage
                      variant="store_logo"
                      source={{ uri: store.logo }}
                      style={styles.logoImage}
                    />
                  </View>
                </View>
                <View style={styles.storeInfoContainer}>
                  <Text category="h2" style={styles.storeName}>
                    {store.name}
                  </Text>
                  <View style={styles.storeRatingContainer}>
                    <StarIcon style={styles.starIcon}></StarIcon>
                    <Text
                      style={styles.storeRatingText}
                    >{`${store.rating} (${store.review_count})`}</Text>
                  </View>
                  {(store.area || store.city) && (
                    <Text style={styles.storeLocationText}>
                      {[store.area, store.city].filter(Boolean).join("، ")}
                    </Text>
                  )}
                  {store.phone ? (
                    <Pressable
                      onPress={() => Linking.openURL(`tel:${store.phone}`)}
                      hitSlop={6}
                      style={styles.phoneRow}
                    >
                      <Text style={styles.phoneText}>{`اتصل بالمتجر: ${store.phone}`}</Text>
                    </Pressable>
                  ) : null}
                  <ScrollView horizontal={true}>
                    <View style={styles.storeInfo}>
                      {distanceLabel ? (
                        <View style={styles.distanceContainer}>
                          <DistanceIcon
                            style={styles.distanceIcon}
                          ></DistanceIcon>
                          <Text style={styles.storeInfoText}>
                            {distanceLabel}
                          </Text>
                        </View>
                      ) : null}
                      {etaLabel ? (
                        <View style={styles.deliveryTimeContainer}>
                          <ClockIcon style={styles.clockIcon}></ClockIcon>
                          <Text style={styles.storeInfoText}>{etaLabel}</Text>
                        </View>
                      ) : null}
                      <Text style={styles.storeInfoText}>|</Text>
                      <View style={styles.minOrderContainer}>
                        <Text style={styles.storeInfoText}>
                          {`الحد الأدنى للطلب ${formatSAR(store.min_order_value)}`}
                        </Text>
                        <SarIcon style={styles.sarIcon}></SarIcon>
                      </View>
                      <Text style={styles.storeInfoText}>|</Text>
                      <View style={styles.deliveryFeeContainer}>
                        <Text style={styles.storeInfoText}>
                          {`التوصيل ${formatSAR(store.delivery_fee)}`}
                        </Text>
                        <SarIcon style={styles.sarIcon}></SarIcon>
                      </View>
                    </View>
                  </ScrollView>
                  {outOfRange ? (
                    <View style={styles.outOfRangeBadge}>
                      <Text style={styles.outOfRangeText}>
                        خارج نطاق التوصيل
                      </Text>
                    </View>
                  ) : null}
                </View>
              </View>
              {store?.latitude != null && store?.longitude != null ? (
                <View style={styles.mapSectionContainer}>
                  <View style={styles.mapSectionHeader}>
                    <Text category="s1" style={styles.mapSectionTitle}>
                      موقع المتجر
                    </Text>
                    <Pressable
                      onPress={() => {
                        const url = Platform.select({
                          ios: `maps:0,0?q=${store.latitude},${store.longitude}`,
                          android: `geo:0,0?q=${store.latitude},${store.longitude}(${encodeURIComponent(store.name)})`,
                        });
                        if (url) Linking.openURL(url);
                      }}
                    >
                      <Text style={styles.mapSectionLink}>فتح في الخرائط</Text>
                    </Pressable>
                  </View>
                  <MapView
                    style={styles.mapView}
                    pointerEvents="none"
                    initialRegion={{
                      latitude: Number(store.latitude),
                      longitude: Number(store.longitude),
                      latitudeDelta: 0.01,
                      longitudeDelta: 0.01,
                    }}
                    scrollEnabled={false}
                    zoomEnabled={false}
                    pitchEnabled={false}
                    rotateEnabled={false}
                  >
                    <Marker
                      coordinate={{
                        latitude: Number(store.latitude),
                        longitude: Number(store.longitude),
                      }}
                      title={store.name}
                    />
                  </MapView>
                </View>
              ) : null}
              <View style={styles.tabsContainer}>
                {Object.keys(store?.products ?? {}).length > 0 ? (
                  <TabView
                    selectedIndex={selectedIndex}
                    onSelect={(index) => setSelectedIndex(index)}
                    tabBarStyle={styles.tabBar}
                    indicatorStyle={styles.indicator}
                  >
                    {Object.keys(store.products).map((category, index) => (
                      <Tab
                        title={
                          <View style={styles.tabTitleWrapper}>
                            <Text
                              category="s1"
                              style={
                                selectedIndex === index
                                  ? styles.tabTextActive
                                  : styles.tabText
                              }
                              numberOfLines={2}
                            >
                              {category}
                            </Text>
                          </View>
                        }
                      >
                        <Layout style={styles.tabContent}>
                          {(store.products[category]?.length ?? 0) > 0 ? (
                            <ProductsList
                              store={store}
                              items={store.products[category]}
                            />
                          ) : (
                            <EmptyState
                              compact
                              title="لا توجد منتجات في هذه الفئة"
                            />
                          )}
                        </Layout>
                      </Tab>
                    ))}
                  </TabView>
                ) : (
                  <EmptyState
                    title="لا توجد منتجات حالياً"
                    subtitle="سيتم إضافة المنتجات قريباً"
                  />
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
  heartFilledIcon: {
    width: 24,
    height: 24,
    tintColor: theme["color-primary-500"],
  },
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
  storeName: {
    color: theme["text-heading-color"],
    textAlign: "left",
  },
  storeRatingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  storeRatingText: {
    color: theme["text-body-color"],
  },
  storeLocationText: {
    color: theme["text-body-color"],
    textAlign: "left",
    fontSize: 12,
  },
  phoneRow: {
    alignSelf: "flex-start",
    paddingVertical: 4,
  },
  phoneText: {
    color: theme["color-primary-500"],
    fontFamily: "TajawalMedium",
    fontSize: 13,
    textAlign: "left",
  },
  outOfRangeBadge: {
    alignSelf: "flex-start",
    marginTop: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: "#FEE2E2",
    borderRadius: 8,
  },
  outOfRangeText: {
    fontFamily: "TajawalMedium",
    fontSize: 12,
    color: "#B91C1C",
  },
  mapSectionContainer: {
    marginHorizontal: 16,
    marginTop: 16,
    gap: 8,
  },
  mapSectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  mapSectionTitle: {
    color: theme["text-heading-color"],
    fontFamily: "TajawalBold",
    textAlign: "left",
  },
  mapSectionLink: {
    color: theme["color-primary-500"],
    fontFamily: "TajawalMedium",
  },
  mapView: {
    width: "100%",
    height: 140,
    borderRadius: 12,
    overflow: "hidden",
  },
  storeInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    color: "red",
  },
  storeInfoText: { color: theme["text-body-color"] },
  distanceContainer: { flexDirection: "row", alignItems: "center", gap: 2 },
  distanceIcon: { width: 12, height: 12 },
  deliveryTimeContainer: { flexDirection: "row", alignItems: "center", gap: 2 },
  clockIcon: { width: 12, height: 12, tintColor: theme["text-body-color"] },
  minOrderContainer: { flexDirection: "row", alignItems: "center", gap: 2 },
  sarIcon: { width: 12, height: 12, tintColor: theme["text-body-color"] },
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
  tabTitleWrapper: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  tabText: {
    textAlign: "center",
    color: theme["text-body-color"],
  },
  tabTextActive: {
    textAlign: "center",
    color: theme["text-heading-color"],
  },
  tabContent: {
    paddingTop: 12,
  },
  heartButtonContainer: {
    width: 32,
    height: 32,
    borderRadius: "50%",
    justifyContent: "center",
    alignItems: "center",
  },
});

export default Store;
