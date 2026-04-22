// @ts-nocheck
import { Spinner, Text } from "@ui-kitten/components";
import { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import * as theme from "../../theme.json";
import { PressableScale } from "./PressableScale";

interface PrimaryButtonProps {
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  children: ReactNode;
  accessibilityLabel?: string;
}

/**
 * Primary CTA button for auth/checkout-tier flows. Wraps PressableScale so
 * every tap produces the soft physical press feedback Saudi users expect
 * from Keeta/HungerStation-tier apps. Replaces the stock UI Kitten Button
 * where perceived-quality matters most; other surfaces can keep Button.
 *
 * Contract:
 *   - `loading` renders a centered Spinner and suppresses onPress via disabled.
 *   - `disabled` dims the background and blocks taps.
 *   - Children should be a short string (wrapped in Text) for consistent type.
 */
export function PrimaryButton({
  onPress,
  disabled = false,
  loading = false,
  children,
  accessibilityLabel,
}: PrimaryButtonProps) {
  const inactive = disabled || loading;

  return (
    <PressableScale
      onPress={inactive ? undefined : onPress}
      disabled={inactive}
      style={[
        styles.button,
        inactive ? styles.buttonDisabled : null,
      ]}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled: inactive, busy: loading }}
    >
      <View style={styles.content}>
        {loading ? (
          <Spinner status="control" size="small" />
        ) : (
          <Text category="s1" status="control" style={styles.label}>
            {children}
          </Text>
        )}
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: theme["color-primary-500"],
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonDisabled: {
    backgroundColor: theme["color-primary-200"] ?? "#E9D5FF",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 24,
  },
  label: {
    fontFamily: "TajawalBold",
  },
});
