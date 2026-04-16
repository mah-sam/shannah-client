import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const BottomActionBar = ({ children, style }) => {
  const insets = useSafeAreaInsets();

  return <View style={[styles.actionBar, style]}>{children}</View>;
};

const styles = StyleSheet.create({
  actionBar: {
    paddingHorizontal: 9,
    paddingTop: 16,
    paddingBottom: 20,
    boxShadow: "0px 0px 6px rgba(0, 0, 0, 0.15)",
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    gap: 10,
  },
});

export default BottomActionBar;
