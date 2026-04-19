// @ts-nocheck
import NetInfo from "@react-native-community/netinfo";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, { FadeInUp, FadeOutUp } from "react-native-reanimated";
import { SafeAreaInsetsContext } from "react-native-safe-area-context";

export function OfflineBanner() {
  const [online, setOnline] = useState<boolean>(true);

  useEffect(() => {
    const unsub = NetInfo.addEventListener((state) => {
      const isOnline =
        state.isConnected === true &&
        (state.isInternetReachable ?? true) !== false;
      setOnline(isOnline);
    });
    NetInfo.fetch().then((state) => {
      const isOnline =
        state.isConnected === true &&
        (state.isInternetReachable ?? true) !== false;
      setOnline(isOnline);
    });
    return () => unsub();
  }, []);

  if (online) return null;

  return (
    <SafeAreaInsetsContext.Consumer>
      {(insets) => (
        <Animated.View
          entering={FadeInUp.duration(180)}
          exiting={FadeOutUp.duration(150)}
          style={[
            styles.banner,
            { paddingTop: (insets?.top ?? 0) + 10 },
          ]}
          pointerEvents="none"
        >
          <Text style={styles.text}>لا يوجد اتصال بالإنترنت</Text>
        </Animated.View>
      )}
    </SafeAreaInsetsContext.Consumer>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    paddingBottom: 10,
    paddingHorizontal: 16,
    backgroundColor: "#991B1B",
    zIndex: 10000,
    elevation: 10,
  },
  text: {
    color: "#fff",
    fontFamily: "TajawalBold",
    fontSize: 13,
    textAlign: "center",
  },
});
