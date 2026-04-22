// @ts-nocheck
import { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";
import * as theme from "../../theme.json";

export type SkeletonVariant = "store-card" | "list-row";

interface SkeletonCardProps {
  variant?: SkeletonVariant;
  style?: any;
}

/**
 * Low-key loading placeholder used while list screens fetch their first page
 * of data. Built with React Native's built-in Animated (no reanimated) so the
 * 1s opacity pulse runs natively on both platforms without extra setup.
 *
 * Dimensions are tuned to approximate the real card footprints so the layout
 * doesn't jump when real data lands and the cards replace the skeletons.
 */
export function SkeletonCard({ variant = "list-row", style }: SkeletonCardProps) {
  const pulse = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0.5,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  if (variant === "store-card") {
    return (
      <Animated.View style={[styles.storeCard, { opacity: pulse }, style]}>
        <View style={styles.storeCover} />
        <View style={styles.storeMeta}>
          <View style={styles.storeTitle} />
          <View style={styles.storeSubtitle} />
        </View>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={[styles.listRow, { opacity: pulse }, style]}>
      <View style={styles.listThumb} />
      <View style={styles.listTextCol}>
        <View style={styles.listTitle} />
        <View style={styles.listSubtitle} />
      </View>
    </Animated.View>
  );
}

const TINT = theme["color-primary-100"] ?? "#F4D1FC";

const styles = StyleSheet.create({
  // store-card — matches the home-screen store card footprint (cover + 2 text lines)
  storeCard: {
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 16,
    backgroundColor: "transparent",
  },
  storeCover: {
    height: 120,
    backgroundColor: TINT,
    borderRadius: 16,
  },
  storeMeta: {
    paddingVertical: 12,
    gap: 8,
  },
  storeTitle: {
    width: "60%",
    height: 16,
    borderRadius: 4,
    backgroundColor: TINT,
  },
  storeSubtitle: {
    width: "40%",
    height: 12,
    borderRadius: 4,
    backgroundColor: TINT,
  },
  // list-row — thumbnail + two text lines, used in cart and orders
  listRow: {
    flexDirection: "row",
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 4,
    alignItems: "center",
  },
  listThumb: {
    width: 64,
    height: 64,
    borderRadius: 12,
    backgroundColor: TINT,
  },
  listTextCol: {
    flex: 1,
    gap: 8,
  },
  listTitle: {
    width: "70%",
    height: 14,
    borderRadius: 4,
    backgroundColor: TINT,
  },
  listSubtitle: {
    width: "45%",
    height: 12,
    borderRadius: 4,
    backgroundColor: TINT,
  },
});
