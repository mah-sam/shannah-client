// @ts-nocheck
import { Button, Input, Layout, Text } from "@ui-kitten/components";
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaInsetsContext } from "react-native-safe-area-context";
import { OrderAgainCard, StoresList } from "../../components/HomeComponents";
import {
  ArrowDropdownIcon,
  ChevronDownIcon,
  FilterFunnelIcon,
  HeartRoundedIcon,
  MarkerPinIcon,
  SearchIcon,
} from "../../components/Icons";
import { EmptyState } from "../../components/ui/EmptyState";
import { ErrorState } from "../../components/ui/ErrorState";
import { FilterSheet } from "../../components/ui/FilterSheet";
import { useGlobal } from "../../context/GlobalContext";
import useAuth from "../../hooks/useAuth";
import { useDeliveryReference } from "../../hooks/useDeliveryReference";
import { getOrders, getStores } from "../../services/shannahApi";
import * as theme from "../../theme.json";
import { haversineKm } from "../../utils/distance";
import { etaProvider, etaSortKey } from "../../services/eta.service";

export default function HomeScreen() {
  const { signedIn, deliveryAddress, resumeTick } = useGlobal();
  const { token } = useAuth();
  const [pastOrdersStores, setPastOrdersStores] = useState({
    meal: [],
    banquet: [],
    market: [],
  });
  const [stores, setStores] = useState({
    meal: [],
    banquet: [],
    market: [],
  });
  const [productType, setProductType] = useState("meal");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [minRating, setMinRating] = useState(null);
  const [maxDistanceKm, setMaxDistanceKm] = useState(null);
  const [sortBy, setSortBy] = useState("relevance");
  const [sheetOpen, setSheetOpen] = useState(null); // "rating" | "distance" | "sort"
  const reference = useDeliveryReference();

  const displayedStores = useMemo(() => {
    let arr = stores?.[productType] ?? [];
    if (minRating != null) {
      arr = arr.filter((s) => (Number(s.rating) || 0) >= minRating);
    }
    if (maxDistanceKm != null && reference) {
      arr = arr.filter((s) => {
        if (s.latitude == null || s.longitude == null) return false;
        const d = haversineKm(reference, {
          latitude: s.latitude,
          longitude: s.longitude,
        });
        return d <= maxDistanceKm;
      });
    }
    const withMetrics = arr.map((s) => {
      const hasCoords =
        reference && s.latitude != null && s.longitude != null;
      const dist = hasCoords
        ? haversineKm(reference, {
            latitude: s.latitude,
            longitude: s.longitude,
          })
        : null;
      const eta = etaProvider.estimate({
        prepMinutes: s.base_prep_time_minutes,
        distanceKm: dist,
      });
      return { s, dist, etaMid: etaSortKey(eta) };
    });
    switch (sortBy) {
      case "rating":
        withMetrics.sort(
          (a, b) => (Number(b.s.rating) || 0) - (Number(a.s.rating) || 0),
        );
        break;
      case "distance":
        withMetrics.sort(
          (a, b) =>
            (a.dist ?? Number.MAX_SAFE_INTEGER) -
            (b.dist ?? Number.MAX_SAFE_INTEGER),
        );
        break;
      case "eta":
        withMetrics.sort((a, b) => a.etaMid - b.etaMid);
        break;
    }
    return withMetrics.map((x) => x.s);
  }, [stores, productType, minRating, maxDistanceKm, sortBy, reference]);

  const filtersActive =
    minRating != null || maxDistanceKm != null || sortBy !== "relevance";

  const clearFilters = () => {
    setMinRating(null);
    setMaxDistanceKm(null);
    setSortBy("relevance");
  };

  const arabicNum = (n) =>
    String(n).replace(/[0-9]/g, (d) => "٠١٢٣٤٥٦٧٨٩"[Number(d)]);

  const handleFavoriteToggle = (storeId, isFavorited) => {
    // Update pastOrdersStores
    setPastOrdersStores((prevStores) => {
      return {
        ...prevStores,
        [productType]: prevStores[productType].map((store) =>
          store.id === storeId ? { ...store, is_favorite: isFavorited } : store,
        ),
      };
    });
    // Update stores
    setStores((prevStores) => {
      return {
        ...prevStores,
        [productType]: prevStores[productType].map((store) =>
          store.id === storeId ? { ...store, is_favorite: isFavorited } : store,
        ),
      };
    });
  };

  useEffect(() => {
    token &&
      (async () => {
        let result;
        try {
          result = await getOrders(token);
        } catch {
          // Past-orders section is enhancement, not critical. Leave empty on failure.
          return;
        }
        // Filter completed orders and extract unique stores grouped by item type
        const completedOrders =
          result?.data?.filter((order) => order.status === "completed") ?? [];

        const mealStoresMap = new Map();
        const banquetStoresMap = new Map();

        completedOrders.forEach((order) => {
          if (!order.store) return;

          const hasMeal = order.items?.some((item) => item.type === "meal");
          const hasBanquet = order.items?.some(
            (item) => item.type === "banquet",
          );

          if (hasMeal && !mealStoresMap.has(order.store.id)) {
            mealStoresMap.set(order.store.id, order.store);
          }
          if (hasBanquet && !banquetStoresMap.has(order.store.id)) {
            banquetStoresMap.set(order.store.id, order.store);
          }
        });

        setPastOrdersStores({
          meal: Array.from(mealStoresMap.values()),
          banquet: Array.from(banquetStoresMap.values()),
        });
      })();
  }, [token]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setLoadError(false);
      try {
        const result = await getStores(token);
        if (result?.data) {
          setStores(result.data);
        } else {
          setLoadError(true);
        }
      } catch {
        setLoadError(true);
      } finally {
        setLoading(false);
      }
    })();
  }, [token, reloadKey, resumeTick]);

  const onRefresh = async () => {
    setRefreshing(true);
    setLoadError(false);
    try {
      const result = await getStores(token);
      if (result?.data) setStores(result.data);
      else setLoadError(true);
    } catch {
      setLoadError(true);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <SafeAreaInsetsContext.Consumer>
      {(insets) => (
        <Layout
          style={{
            ...styles.container,
            paddingTop: insets?.top,
          }}
        >
          <View style={styles.topBar}>
            {signedIn && (
              <View style={styles.topBarRow}>
                <View style={styles.shippingAddressContainer}>
                  <Pressable onPress={() => router.push("/addresses/select")}>
                    <View style={styles.shippingAddressDropdown}>
                      <MarkerPinIcon style={styles.markerPinIcon} />
                      <Text style={styles.shippingAddressDropdownText}>
                        التوصيل إلى
                      </Text>
                      <ChevronDownIcon style={styles.chevronDownIcon} />
                    </View>
                  </Pressable>
                  <Text style={styles.shippingAddressText} numberOfLines={2}>
                    {deliveryAddress.national_address}
                  </Text>
                </View>
                <Pressable onPress={() => router.push("/favorite")}>
                  <HeartRoundedIcon style={styles.heartRoundedIcon} />
                </Pressable>
              </View>
            )}
            <Pressable
              onPress={() => {
                router.navigate("/(tabs)/search");
              }}
            >
              <View pointerEvents="none">
                <Text style={styles.searchInputPlaceholder}>
                  ابحث عن الطعام والوجبات والولائم
                </Text>

                <Input
                  textStyle={styles.searchInputText}
                  accessoryLeft={() => <SearchIcon style={styles.searchIcon} />}
                  readOnly={true}
                />
              </View>
            </Pressable>
          </View>
          <ScrollView
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={theme["color-primary-500"]}
              />
            }
          >
            <View style={styles.tabBarContainer}>
              <View style={styles.tabBar}>
                <Pressable
                  style={
                    productType === "meal"
                      ? [styles.tab, styles.tabActive]
                      : styles.tab
                  }
                  onPress={() => setProductType("meal")}
                >
                  <Text category="s2" style={styles.tabText}>
                    الوجبات
                  </Text>
                </Pressable>
                <Pressable
                  style={
                    productType === "banquet"
                      ? [styles.tab, styles.tabActive]
                      : styles.tab
                  }
                  onPress={() => setProductType("banquet")}
                >
                  <Text category="s2" style={styles.tabText}>
                    الولائم
                  </Text>
                </Pressable>
                <Pressable
                  style={
                    productType === "market"
                      ? [styles.tab, styles.tabActive]
                      : styles.tab
                  }
                  onPress={() => setProductType("market")}
                >
                  <Text category="s2" style={styles.tabText}>
                    ماركت
                  </Text>
                </Pressable>
              </View>
            </View>
            <ScrollView
              horizontal={true}
              style={styles.filtersScrollView}
              contentContainerStyle={styles.filtersContainer}
            >
              <Button
                appearance="outline"
                status={minRating != null ? "primary" : "basic"}
                size="small"
                accessoryLeft={() => (
                  <ArrowDropdownIcon
                    style={styles.arrowDropdownIcon}
                  ></ArrowDropdownIcon>
                )}
                style={[
                  styles.filterChip,
                  minRating != null && styles.filterChipActive,
                ]}
                onPress={() => setSheetOpen("rating")}
              >
                <View>
                  <Text
                    style={[
                      styles.filterChipText,
                      minRating != null && styles.filterChipTextActive,
                    ]}
                  >
                    {minRating != null
                      ? `تقييم ${arabicNum(minRating)}+`
                      : "التقييم"}
                  </Text>
                </View>
              </Button>
              <Button
                appearance="outline"
                status={maxDistanceKm != null ? "primary" : "basic"}
                size="small"
                accessoryLeft={() => (
                  <ArrowDropdownIcon
                    style={styles.arrowDropdownIcon}
                  ></ArrowDropdownIcon>
                )}
                style={[
                  styles.filterChip,
                  maxDistanceKm != null && styles.filterChipActive,
                ]}
                onPress={() => setSheetOpen("distance")}
              >
                <View>
                  <Text
                    style={[
                      styles.filterChipText,
                      maxDistanceKm != null && styles.filterChipTextActive,
                    ]}
                  >
                    {maxDistanceKm != null
                      ? `خلال ${arabicNum(maxDistanceKm)} كم`
                      : "المسافة"}
                  </Text>
                </View>
              </Button>
              <Pressable
                onPress={() => setSheetOpen("sort")}
                style={styles.funnelPressable}
              >
                <FilterFunnelIcon
                  style={[
                    styles.filterFunnelIcon,
                    sortBy !== "relevance" && {
                      tintColor: theme["color-primary-500"],
                    },
                  ]}
                />
              </Pressable>
            </ScrollView>

            {loading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme["color-primary-500"]} />
              </View>
            )}

            {!loading && loadError && (
              <ErrorState
                title="تعذّر تحميل المتاجر"
                subtitle="تحقق من اتصالك بالإنترنت وحاول مجدداً"
                onRetry={() => setReloadKey((k) => k + 1)}
              />
            )}

            {!loading && !loadError && (pastOrdersStores?.[productType]?.length ?? 0) > 0 && (
              <View style={styles.orderAgainContainer}>
                <Text category="h3" style={styles.title}>
                  اطلب مرة أخرى
                </Text>
                <ScrollView
                  horizontal={true}
                  contentContainerStyle={styles.orderAgainCardsContainer}
                >
                  {pastOrdersStores[productType].map((store) => (
                    <OrderAgainCard
                      key={store.id}
                      store={store}
                      onFavoriteToggle={handleFavoriteToggle}
                    ></OrderAgainCard>
                  ))}
                </ScrollView>
              </View>
            )}

            {!loading && !loadError && displayedStores.length > 0 && (
              <View style={styles.storesContainer}>
                <Text category="h3" style={styles.title}>
                  استكشف المتاجر
                </Text>
                <StoresList
                  items={displayedStores}
                  onFavoriteToggle={handleFavoriteToggle}
                />
              </View>
            )}

            {!loading && !loadError &&
              displayedStores.length === 0 &&
              (stores?.[productType]?.length ?? 0) > 0 &&
              filtersActive && (
                <View>
                  <EmptyState
                    title="لا توجد نتائج مطابقة للفلاتر"
                    subtitle="عدّل الفلاتر أو امسحها للعرض الكامل"
                  />
                  <View style={styles.clearFiltersWrapper}>
                    <Button
                      appearance="outline"
                      status="basic"
                      onPress={clearFilters}
                    >
                      {() => (
                        <Text style={styles.clearFiltersText}>مسح الفلاتر</Text>
                      )}
                    </Button>
                  </View>
                </View>
              )}

            {!loading && !loadError &&
              displayedStores.length === 0 &&
              (stores?.[productType]?.length ?? 0) === 0 && (
                <EmptyState
                  title="لا توجد متاجر في هذه الفئة بعد"
                  subtitle="جرّب فئة أخرى، نضيف متاجر جديدة باستمرار"
                />
              )}
          </ScrollView>
          <FilterSheet
            visible={sheetOpen === "rating"}
            title="الحد الأدنى للتقييم"
            options={[
              { label: "أي تقييم", value: null },
              { label: "٤ نجوم فأعلى", value: 4 },
              { label: "٤٫٥ نجوم فأعلى", value: 4.5 },
            ]}
            value={minRating}
            onSelect={setMinRating}
            onClose={() => setSheetOpen(null)}
          />
          <FilterSheet
            visible={sheetOpen === "distance"}
            title="أقصى مسافة"
            options={[
              { label: "أي مسافة", value: null },
              { label: "خلال ٥ كم", value: 5 },
              { label: "خلال ١٠ كم", value: 10 },
              { label: "خلال ٢٠ كم", value: 20 },
            ]}
            value={maxDistanceKm}
            onSelect={setMaxDistanceKm}
            onClose={() => setSheetOpen(null)}
          />
          <FilterSheet
            visible={sheetOpen === "sort"}
            title="الترتيب"
            options={[
              { label: "الأنسب", value: "relevance" },
              { label: "الأعلى تقييماً", value: "rating" },
              { label: "الأقرب مسافة", value: "distance" },
              { label: "الأسرع توصيلاً", value: "eta" },
            ]}
            value={sortBy}
            onSelect={(v) => setSortBy(v ?? "relevance")}
            onClose={() => setSheetOpen(null)}
          />
        </Layout>
      )}
    </SafeAreaInsetsContext.Consumer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 48,
  },
  topBar: {
    backgroundColor: theme["color-primary-75"],
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
    gap: 16,
  },
  topBarRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  markerPinIcon: {
    width: 18,
    height: 18,
    tintColor: theme["color-basic-100"],
  },
  chevronDownIcon: {
    width: 18,
    height: 18,
    tintColor: theme["color-basic-100"],
  },
  shippingAddressContainer: {
    flexShrink: 1,
    gap: 8,
  },
  shippingAddressDropdown: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  shippingAddressDropdownText: {
    color: theme["color-basic-100"],
  },
  shippingAddressText: {
    fontFamily: "TajawalMedium",
    color: theme["color-basic-100"],
    textAlignVertical: "bottom",
    lineHeight: 16,
    textAlign: "left",
  },
  heartRoundedIcon: {
    width: 24,
    height: 24,
    tintColor: theme["color-basic-100"],
  },
  searchIcon: {
    width: 20,
    height: 20,
    tintColor: theme["text-body-color"],
  },
  searchIconFocused: {
    width: 20,
    height: 20,
    tintColor: theme["color-black"],
    marginRight: 4,
  },
  searchInputText: {
    color: theme["color-black"],
    fontSize: 16,
  },
  searchInputPlaceholder: {
    position: "absolute",
    top: 12,
    left: 44,
    fontSize: 16,
    color: theme["text-body-color"],
    zIndex: 1,
  },
  tabBarContainer: {
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    height: 68,
  },
  tabBar: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
    color: theme["color-black"],
  },
  filtersScrollView: { maxHeight: 44 },
  filtersContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 0,
    gap: 8,
    maxHeight: 44,
    alignItems: "center",
  },
  filterChip: {
    justifyContent: "center",
    alignItems: "center",
    height: 32,
  },
  filterChipActive: {
    borderColor: theme["color-primary-500"],
    backgroundColor: theme["color-primary-25"],
  },
  filterChipText: {
    justifyContent: "center",
    alignItems: "center",
    lineHeight: 14,
    fontFamily: "TajawalMedium",
    fontSize: 14,
  },
  filterChipTextActive: {
    color: theme["color-primary-500"],
  },
  funnelPressable: {
    paddingHorizontal: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  clearFiltersWrapper: {
    alignItems: "center",
    paddingBottom: 24,
  },
  clearFiltersText: {
    color: theme["text-heading-color"],
    fontFamily: "TajawalMedium",
  },
  arrowDropdownIcon: {
    width: 24,
    height: 24,
    tintColor: theme["color-on-surface-variant"],
  },
  filterFunnelIcon: {
    width: 24,
    height: 24,
    tintColor: theme["color-on-surface-variant"],
  },
  orderAgainContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  orderAgainCardsContainer: {
    flexDirection: "row",
    gap: 12,
  },
  storesContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  title: {
    fontFamily: "TajawalBold",
    color: theme["color-black"],
    textAlign: "left",
  },
});
