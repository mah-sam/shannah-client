import { Button, Input, Layout, Text } from "@ui-kitten/components";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaInsetsContext } from "react-native-safe-area-context";
import { StoresList } from "../../components/HomeComponents";
import {
  ArrowDropdownIcon,
  ChevronDownIcon,
  FilterFunnelIcon,
  HeartRoundedIcon,
  MarkerPinIcon,
  SearchIcon,
} from "../../components/Icons";
import { getStores } from "../../services/shannahApi";
import * as theme from "../../theme.json";

export default function HomeScreen() {
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchText, setSeachText] = useState("");
  const [stores, setStores] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [productType, setProductType] = useState("meal");

  useEffect(() => {
    (async () => {
      const result = await getStores();
      setStores(result.data);
    })();
  }, []);

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
            <View style={styles.topBarRow}>
              <View style={styles.shippingAddressContainer}>
                <View style={styles.shippingAddressDropdown}>
                  <MarkerPinIcon style={styles.markerPinIcon} />
                  <Text style={styles.shippingAddressDropdownText}>
                    التوصيل إلى
                  </Text>
                  <ChevronDownIcon style={styles.chevronDownIcon} />
                </View>
                <Text style={styles.shippingAddressText}>
                  المبنى رقم ١٢، حي الياسمين، طريق الملك عبد العزيز، الرياض
                </Text>
              </View>
              <HeartRoundedIcon style={styles.heartRoundedIcon} />
            </View>
            <View>
              {searchText.length === 0 && (
                <Text style={styles.searchInputPlaceholder}>
                  ابحث عن الطعام والوجبات والولائم
                </Text>
              )}
              <Input
                textStyle={styles.searchInputText}
                accessoryLeft={() => (
                  <SearchIcon
                    style={
                      searchFocused
                        ? styles.searchIconFocused
                        : styles.searchIcon
                    }
                  />
                )}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                value={searchText}
                onChangeText={(t) => setSeachText(t)}
              />
            </View>
          </View>

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
                <Text style={styles.tabText}>الوجبات</Text>
              </Pressable>
              <Pressable
                style={
                  productType === "banquet"
                    ? [styles.tab, styles.tabActive]
                    : styles.tab
                }
                onPress={() => setProductType("banquet")}
              >
                <Text style={styles.tabText}>الولائم</Text>
              </Pressable>
            </View>
          </View>
          <ScrollView horizontal={true} style={styles.filtersScrollView}>
            <View style={styles.filtersContainer}>
              <Button
                appearance="outline"
                status="basic"
                size="small"
                accessoryLeft={() => (
                  <ArrowDropdownIcon
                    style={styles.arrowDropdownIcon}
                  ></ArrowDropdownIcon>
                )}
                style={styles.filterChip}
              >
                <View>
                  <Text style={styles.filterChipText}>تقييم المنتج</Text>
                </View>
              </Button>
              <Button
                appearance="outline"
                status="basic"
                size="small"
                accessoryLeft={() => (
                  <ArrowDropdownIcon
                    style={styles.arrowDropdownIcon}
                  ></ArrowDropdownIcon>
                )}
                style={styles.filterChip}
              >
                <View>
                  <Text style={styles.filterChipText}>نوع المنتج</Text>
                </View>
              </Button>
              <Button
                appearance="outline"
                status="basic"
                size="small"
                accessoryLeft={() => (
                  <ArrowDropdownIcon
                    style={styles.arrowDropdownIcon}
                  ></ArrowDropdownIcon>
                )}
                style={styles.filterChip}
              >
                <View>
                  <Text style={styles.filterChipText}>الموقع</Text>
                </View>
              </Button>
              <Pressable>
                <FilterFunnelIcon style={styles.filterFunnelIcon} />
              </Pressable>
            </View>
          </ScrollView>
          <View style={styles.storesContainer}>
            <Text category="h3" style={styles.exploreStores}>
              استكشف المتاجر
            </Text>
            <StoresList
              items={stores[productType]}
              isRefreshing={isRefreshing}
              setIsRefreshing={setIsRefreshing}
            ></StoresList>
          </View>
        </Layout>
      )}
    </SafeAreaInsetsContext.Consumer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    textAlign: "center",
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
    fontFamily: "TajawalMedium",
    color: theme["color-black"],
    fontSize: 14,
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
  filterChipText: {
    justifyContent: "center",
    alignItems: "center",
    lineHeight: 14,
    fontFamily: "TajawalMedium",
    fontSize: 14,
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
  storesContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  exploreStores: {
    fontFamily: "TajawalBold",
    color: theme["color-black"],
  },
});
