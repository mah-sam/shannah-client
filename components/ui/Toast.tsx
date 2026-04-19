// @ts-nocheck
import { useEffect } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  FadeInUp,
  FadeOutUp,
  LinearTransition,
} from "react-native-reanimated";
import { SafeAreaInsetsContext } from "react-native-safe-area-context";
import * as theme from "../../theme.json";
import type { ToastKind, ToastMessage } from "../../context/ToastContext";

const KIND_STYLES: Record<
  ToastKind,
  { background: string; color: string; border: string }
> = {
  success: {
    background: "#ECFDF5",
    color: "#065F46",
    border: "#A7F3D0",
  },
  error: {
    background: "#FEF2F2",
    color: "#991B1B",
    border: "#FECACA",
  },
  info: {
    background: theme["color-primary-25"],
    color: theme["color-primary-500"],
    border: theme["color-primary-100"] ?? "#E9D5FF",
  },
};

interface ToastOverlayProps {
  toasts: ToastMessage[];
  onDismiss: (id: number) => void;
}

export function ToastOverlay({ toasts, onDismiss }: ToastOverlayProps) {
  if (toasts.length === 0) return null;

  return (
    <SafeAreaInsetsContext.Consumer>
      {(insets) => (
        <View
          pointerEvents="box-none"
          style={[
            styles.overlay,
            { paddingTop: (insets?.top ?? 0) + 8 },
          ]}
        >
          {toasts.map((toast) => (
            <ToastItem
              key={toast.id}
              toast={toast}
              onDismiss={() => onDismiss(toast.id)}
            />
          ))}
        </View>
      )}
    </SafeAreaInsetsContext.Consumer>
  );
}

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: ToastMessage;
  onDismiss: () => void;
}) {
  const palette = KIND_STYLES[toast.kind];

  return (
    <Animated.View
      entering={FadeInUp.duration(180)}
      exiting={FadeOutUp.duration(150)}
      layout={LinearTransition.duration(180)}
      style={[
        styles.toast,
        {
          backgroundColor: palette.background,
          borderColor: palette.border,
        },
      ]}
    >
      <Pressable onPress={onDismiss} style={styles.pressable}>
        <Text style={[styles.text, { color: palette.color }]}>{toast.message}</Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    gap: 8,
    zIndex: 9999,
  },
  toast: {
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 4,
  },
  pressable: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  text: {
    fontFamily: "TajawalMedium",
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
  },
});
