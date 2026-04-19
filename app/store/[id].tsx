// @ts-nocheck
import { Layout, Spinner, Tab, TabView, Text } from "@ui-kitten/components";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
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
import { ErrorState } from "../../components/ui/ErrorState";
import { ShannahImage } from "../../components/ui/ShannahImage";
import { useGlobal } from "../../context/GlobalContext";
import { useToast } from "../../context/ToastContext";
import { useDeliveryReference } from "../../hooks/useDeliveryReference";
import useAuth from "../../hooks/useAuth";
import { getStores, toggleFavorite } from "../../services/shannahApi";
import * as theme from "../../theme.json";
import { formatSAR } from "../../utils/currency";
import { formatDistanceKm, haversineKm } from "../../utils/distance";
import { etaProvider, formatEta } from "../../services/eta.service";

const Store = () => {
  const { signedIn } = useGlobal();
  const { token } = useAuth();
  const { show: showToast } = useToast();
  const { id } = useLocalSearchParams();
  const [store, setStore] = useState({});
  const [storeDataLoaded, setStoreDataLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const reference = useDeliveryReference();

  const distanceKm =
    reference && store?.latitude != null && store?.longitude != null
      ? haversineKm(reference, {
          latitude: store.latitude,
          longitude: store.longitude,
        })
      : null;
  const etaRange = etaProvider.estimate({
    prepMinutes: store?.base_prep_time_minutes,
    distanceKm,
  });
  const etaLabel = formatEta(etaRange) || store?.delivery_time || "";
  const distanceLabel = distanceKm != null ? formatDistanceKm(distanceKm) : "";
  const outOfRange =
    distanceKm != null &&
    store?.max_delivery_radius_km != null &&
    distanceKm > store.max_delivery_radius_km;

  const handleToggleFavorite = async () => {
    if (!token) return;
    try {
      const result = await toggleFavorite(token, "store", id);
      setIsFavorite(result?.favorited ?? false);
    } catch {
      showToast({ kind: "error", message: "تعذّر تحديث المفضلة" });
    }
  };

  useEffect(() => {
    (async () => {
      setLoadError(false);
      setStoreDataLoaded(false);
      try {
        const result = await getStores(token, id);
        setStore(result?.data ?? {});
        setIsFavorite(result?.data?.is_favorite || false);
      } catch {
        setLoadError(true);
      } finally {
        setStoreDataLoaded(true);
      }
    })();
  }, [token, id, reloadKey]);

  const locationText = [store?.area, store?.city].filter(Boolean).join("، ");

  const renderContent = () => {
    if (!storeDataLoaded) {
      return (
        <View style={styles.spinnerContainer}>
          <Spinner />
        </View>
      );
    }
    if (loadError || !store || Object.keys(store).length === 0) {
      return (
        <ErrorState
          title="تعذّر تحميل المتجر"
          subtitle="تحقق من اتصالك بالإنترنت وحاول مجدداً"
          onRetry={() => setReloadKey((k) => k + 1)}
        />
      );
    }
    return (
      <View style={styles.mainContent}>
        <View>
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
              <StarIcon style={styles.starIcon} />
              <Text
                style={styles.storeRatingText}
              >{`${store.rating} (${store.review_count})`}</Text>
            </View>
            {locationText ? (
              <Text style={styles.storeLocationText} numberOfLines={1}>
                {locationText}
              </Text>
            ) : null}
            <ScrollView horizontal>
              <View style={styles.storeInfo}>
                {distanceLabel ? (
                  <View style={styles.distanceContainer}>
                    <DistanceIcon style={styles.distanceIcon} />
                    <Text style={styles.storeInfoText}>{distanceLabel}</Text>
                  </View>
                ) : null}
                {etaLabel ? (
                  <View style={styles.deliveryTimeContainer}>
                    <ClockIcon style={styles.clockIcon} />
                    <Text style={styles.storeInfoText}>{etaLabel}</Text>
                  </View>
                ) : null}
                <Text style={styles.storeInfoText}>|</Text>
                <View style={styles.minOrderContainer}>
                  <Text style={styles.storeInfoText}>
                    {`الحد الأدنى للطلب ${formatSAR(store.min_order_value)}`}
                  </Text>
                  <SarIcon style={styles.sarIcon} />
                </View>
                <Text style={styles.storeInfoText}>|</Text>
                <View style={styles.deliveryFeeContainer}>
                  <Text style={styles.storeInfoText}>
                    {`التوصيل ${formatSAR(store.delivery_fee)}`}
                  </Text>
                  <SarIcon style={styles.sarIcon} />
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

        <View style={styles.tabsContainer}>
          {Object.keys(store?.products ?? {}).length > 0 ? (
            <TabView
              selectedIndex={selectedIndex}
              onSelect={(index) => setSelectedIndex(index)}
              style={styles.tabView}
              tabBarStyle={styles.tabBar}
              indicatorStyle={styles.indicator}
            >
              {Object.keys(store.products).map((category, index) => (
                <Tab
                  key={category}
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
      </View>
    );
  };

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
          {renderContent()}
        </Layout>
      )}
    </SafeAreaInsetsContext.Consumer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mainContent: {
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
    // Elevated white card straddling the cover/content boundary.
    position: "absolute",
    left: 16,
    top: 100,
    width: 72,
    height: 72,
    padding: 8,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  logoImage: {
    width: 56,
    height: 56,
    borderRadius: 10,
  },
  starIcon: {
    width: 16,
    height: 16,
  },
  storeInfoContainer: {
    paddingHorizontal: 16,
    paddingTop: 44, // clear the elevated logo card (72 - 20 on cover = 52 below, leave ~44 of breathing room)
    paddingBottom: 12,
    gap: 6,
  },
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
  storeInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  storeInfoText: { color: theme["text-body-color"] },
  distanceContainer: { flexDirection: "row", alignItems: "center", gap: 2 },
  distanceIcon: { width: 12, height: 12 },
  deliveryTimeContainer: { flexDirection: "row", alignItems: "center", gap: 2 },
  clockIcon: { width: 12, height: 12, tintColor: theme["text-body-color"] },
  minOrderContainer: { flexDirection: "row", alignItems: "center", gap: 2 },
  sarIcon: { width: 12, height: 12, tintColor: theme["text-body-color"] },
  deliveryFeeContainer: { flexDirection: "row", alignItems: "center", gap: 2 },
  tabsContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  tabView: {
    flex: 1,
  },
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
    flex: 1,
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
