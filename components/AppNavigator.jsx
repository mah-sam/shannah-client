import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import {
  BottomNavigation,
  BottomNavigationTab,
  Icon,
  Text,
} from "@ui-kitten/components";
import { Tabs } from "expo-router";
import { SafeAreaInsetsContext } from "react-native-safe-area-context";
import HomeScreen from "../app/(tabs)/index";
import * as theme from "../theme.json";

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
          <BottomNavigationTab
            title={(evaProps) => (
              <Text
                {...evaProps}
                style={{
                  fontFamily: "TajawalBold",
                  fontSize: 10,
                  color:
                    state.routeNames[state.index] === "index"
                      ? theme["color-primary-500"]
                      : "#6C7175",
                }}
              >
                الرئيسية
              </Text>
            )}
            icon={homeIcon}
          />
          <BottomNavigationTab
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
        </BottomNavigation>
      )}
    </SafeAreaInsetsContext.Consumer>
  );
};

const TabNavigator = () => (
  <Navigator tabBar={(props) => <BottomTabBar {...props} />}>
    <Screen
      name="Users"
      component={HomeScreen}
      options={{ headerShown: false }}
    />
    <Screen name="Orders" component={HomeScreen} />
  </Navigator>
);

export const AppNavigator = () => (
  <Tabs tabBar={(props) => <BottomTabBar {...props} />}>
    <Tabs.Screen name="index" options={{ headerShown: false }} />
    <Tabs.Screen name="search" options={{ headerShown: false }} />
    <Tabs.Screen
      name="cart"
      options={{
        title: "سلة التسوق",
        headerTitleStyle: { fontFamily: "TajawalBold" },
        headerBackVisible: true,
      }}
    />
    <Tabs.Screen name="profile" options={{ headerShown: false }} />
  </Tabs>
);
