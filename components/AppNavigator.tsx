import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import {
  BottomNavigation,
  BottomNavigationTab,
  Icon,
  Text,
} from "@ui-kitten/components";
import { Tabs } from "expo-router";
import { StyleSheet, View } from "react-native";
import { SafeAreaInsetsContext } from "react-native-safe-area-context";
import { useGlobal } from "../context/GlobalContext";
import * as theme from "../theme.json";

const toArabicDigits = (n: number): string =>
  String(n).replace(/[0-9]/g, (d) => "٠١٢٣٤٥٦٧٨٩"[Number(d)]);

const cartItemCount = (cartItems: unknown): number => {
  if (!cartItems || typeof cartItems !== "object") return 0;
  let count = 0;
  for (const type of Object.keys(cartItems)) {
    const stores = (cartItems as any)[type];
    if (!stores || typeof stores !== "object") continue;
    for (const storeId of Object.keys(stores)) {
      const items = stores[storeId];
      if (Array.isArray(items)) count += items.length;
    }
  }
  return count;
};

const { Navigator, Screen } = createBottomTabNavigator();

const homeIcon = (props) => (
  <Icon {...props} name="home" pack="assets" width={24} height={24} />
);

const magnifyingGlassIcon = (props) => (
  <Icon
    {...props}
    name="magnifyingGlass"
    pack="assets"
    width={24}
    height={24}
  />
);

const shoppingBagIcon = (props) => (
  <Icon {...props} name="shoppingBag" pack="assets" width={24} height={24} />
);

const userIcon = (props) => (
  <Icon {...props} name="user" pack="assets" width={24} height={24} />
);

const BottomTabBar = ({ navigation, state }) => {
  const { signedIn, cartItems } = useGlobal();
  const cartCount = cartItemCount(cartItems);

  const shoppingBagIconWithBadge = (props: any) => (
    <View style={badgeStyles.iconWrapper}>
      {shoppingBagIcon(props)}
      {cartCount > 0 ? (
        <View style={badgeStyles.badge}>
          <Text style={badgeStyles.badgeText}>
            {cartCount > 9 ? "+٩" : toArabicDigits(cartCount)}
          </Text>
        </View>
      ) : null}
    </View>
  );

  const tabs = [
    { title: "الرئيسية", route: "index", icon: homeIcon },
    { title: "بحث", route: "search", icon: magnifyingGlassIcon },
    { title: "سلة التسوق", route: "cart", icon: shoppingBagIconWithBadge },
  ];

  if (signedIn) {
    tabs.push({ title: "حسابي", route: "profile", icon: userIcon });
  }

  return (
    <SafeAreaInsetsContext.Consumer>
      {(insets) => (
        <BottomNavigation
          appearance="noIndicator"
          selectedIndex={state.index}
          onSelect={(index) => navigation.navigate(state.routeNames[index])}
          style={{
            borderTopWidth: 0.25,
            borderTopColor: theme["color-gray"],
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 21,
            paddingHorizontal: 32,
            paddingTop: 8,
            paddingBottom: 16 + insets.bottom,
          }}
        >
          {tabs.map((tab, index) => {
            return (
              <BottomNavigationTab
                key={index}
                title={(evaProps) => (
                  <Text
                    {...evaProps}
                    style={{
                      fontFamily: "TajawalBold",
                      fontSize: 10,
                      color:
                        state.routeNames[state.index] === tab.route
                          ? theme["color-primary-500"]
                          : "#6C7175",
                    }}
                  >
                    {tab.title}
                  </Text>
                )}
                icon={tab.icon}
              />
            );
          })}
          {/* <BottomNavigationTab
            title={(evaProps) => (
              <Text
                {...evaProps}
                style={{
                  fontFamily: "TajawalBold",
                  fontSize: 10,
                  color:
                    state.routeNames[state.index] === "search"
                      ? theme["color-primary-500"]
                      : "#6C7175",
                }}
              >
                بحث
              </Text>
            )}
            icon={magnifyingGlassIcon({ tintColor: "#6C7175" })}
          />
          <BottomNavigationTab
            title={(evaProps) => (
              <Text
                {...evaProps}
                style={{
                  fontFamily: "TajawalBold",
                  fontSize: 10,
                  color:
                    state.routeNames[state.index] === "cart"
                      ? theme["color-primary-500"]
                      : "#6C7175",
                }}
              >
                سلة التسوق
              </Text>
            )}
            icon={shoppingBagIcon({ tintColor: "#6C7175" })}
          />
          {signedIn && (
            <BottomNavigationTab
              title={(evaProps) => (
                <Text
                  {...evaProps}
                  style={{
                    fontFamily: "TajawalBold",
                    fontSize: 10,
                    color:
                      state.routeNames[state.index] === "profile"
                        ? theme["color-primary-500"]
                        : "#6C7175",
                  }}
                >
                  حسابي
                </Text>
              )}
              icon={userIcon({ tintColor: "#6C7175" })}
            />
          )} */}
        </BottomNavigation>
      )}
    </SafeAreaInsetsContext.Consumer>
  );
};

const badgeStyles = StyleSheet.create({
  iconWrapper: {
    width: 24,
    height: 24,
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  badge: {
    position: "absolute",
    top: -4,
    right: -6,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    paddingHorizontal: 4,
    backgroundColor: theme["color-primary-500"],
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: {
    color: "#fff",
    fontSize: 10,
    fontFamily: "TajawalBold",
    lineHeight: 12,
  },
});

export const AppNavigator = () => {
  const { signedIn } = useGlobal();

  const tabs = [
    { name: "index", options: { headerShown: false } },
    {
      name: "search",
      options: {
        title: "بحث",
        headerTitleStyle: { fontFamily: "TajawalBold" },
        headerBackVisible: true,
      },
    },
    {
      name: "cart",
      options: {
        title: "سلة التسوق",
        headerTitleStyle: { fontFamily: "TajawalBold" },
        headerBackVisible: true,
      },
    },
  ];

  if (signedIn) {
    tabs.push({ name: "profile", options: { headerShown: false } });
  }

  return (
    <Tabs tabBar={(props) => <BottomTabBar {...props} />}>
      {tabs.map((tab, index) => (
        <Tabs.Screen key={index} name={`${tab.name}`} options={tab.options} />
      ))}
    </Tabs>
  );
};
