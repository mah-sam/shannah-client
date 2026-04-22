import { ReactNode } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import * as theme from "../../theme.json";

type EmptyStateProps = {
  icon?: ReactNode;
  title: string;
  subtitle?: string;
  compact?: boolean;
  // Optional CTA. When both are provided, a pill-shaped primary button is
  // rendered below the subtitle. Used by guest-blocked screens (orders,
  // addresses, favorites) to guide the user into sign-in.
  actionLabel?: string;
  onAction?: () => void;
};

const DEFAULT_GLYPH = require("../../assets/images/logo-new.png");

export const EmptyState = ({
  icon,
  title,
  subtitle,
  compact,
  actionLabel,
  onAction,
}: EmptyStateProps) => (
  <View style={[styles.container, compact && styles.compactContainer]}>
    <View style={[styles.glyphBackdrop, compact && styles.glyphBackdropCompact]}>
      {icon ? (
        <View style={styles.customIcon}>{icon}</View>
      ) : (
        <Image
          source={DEFAULT_GLYPH}
          style={[styles.glyph, compact && styles.glyphCompact]}
          resizeMode="contain"
        />
      )}
    </View>
    <Text style={[styles.title, compact && styles.titleCompact]}>{title}</Text>
    {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    {actionLabel && onAction ? (
      <Pressable
        onPress={onAction}
        style={({ pressed }) => [styles.cta, pressed && styles.ctaPressed]}
        accessibilityRole="button"
        accessibilityLabel={actionLabel}
      >
        <Text style={styles.ctaLabel}>{actionLabel}</Text>
      </Pressable>
    ) : null}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
    paddingHorizontal: 24,
    gap: 12,
  },
  compactContainer: {
    flex: 0,
    paddingVertical: 28,
  },
  glyphBackdrop: {
    width: 112,
    height: 112,
    borderRadius: 56,
    backgroundColor: "#F2F2F5",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  glyphBackdropCompact: {
    width: 84,
    height: 84,
    borderRadius: 42,
  },
  glyph: {
    width: 60,
    height: 60,
    tintColor: "#B8B9BF",
    opacity: 0.85,
  },
  glyphCompact: {
    width: 44,
    height: 44,
  },
  customIcon: {
    opacity: 0.55,
  },
  title: {
    color: theme["text-heading-color"],
    textAlign: "center",
    fontFamily: "TajawalBold",
    fontSize: 18,
    lineHeight: 26,
  },
  titleCompact: {
    fontSize: 16,
    lineHeight: 22,
  },
  subtitle: {
    textAlign: "center",
    color: theme["text-body-color"],
    fontFamily: "TajawalMedium",
    fontSize: 14,
    lineHeight: 20,
    maxWidth: 280,
  },
  cta: {
    marginTop: 16,
    backgroundColor: theme["color-primary-500"],
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 999,
  },
  ctaPressed: {
    opacity: 0.85,
  },
  ctaLabel: {
    color: theme["color-basic-100"] ?? "#FFFFFF",
    fontFamily: "TajawalBold",
    fontSize: 14,
  },
});
