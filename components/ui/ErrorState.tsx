// @ts-nocheck
import { Button } from "@ui-kitten/components";
import { Image, StyleSheet, Text, View } from "react-native";
import * as theme from "../../theme.json";

type ErrorStateProps = {
  title?: string;
  subtitle?: string;
  onRetry?: () => void;
  retryLabel?: string;
  compact?: boolean;
};

const DEFAULT_GLYPH = require("../../assets/images/logo-new.png");

export const ErrorState = ({
  title = "تعذّر تحميل البيانات",
  subtitle = "تحقق من اتصالك بالإنترنت وحاول مجدداً",
  onRetry,
  retryLabel = "إعادة المحاولة",
  compact,
}: ErrorStateProps) => (
  <View style={[styles.container, compact && styles.compactContainer]}>
    <View style={[styles.glyphBackdrop, compact && styles.glyphBackdropCompact]}>
      <Image
        source={DEFAULT_GLYPH}
        style={[styles.glyph, compact && styles.glyphCompact]}
        resizeMode="contain"
      />
    </View>
    <Text style={[styles.title, compact && styles.titleCompact]}>{title}</Text>
    {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    {onRetry ? (
      <View style={styles.buttonWrapper}>
        <Button appearance="outline" status="basic" onPress={onRetry}>
          {() => <Text style={styles.buttonText}>{retryLabel}</Text>}
        </Button>
      </View>
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
    backgroundColor: "#FDECEC",
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
    tintColor: "#E0A8A8",
    opacity: 0.85,
  },
  glyphCompact: {
    width: 44,
    height: 44,
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
  buttonWrapper: {
    marginTop: 8,
  },
  buttonText: {
    color: theme["text-heading-color"],
    fontFamily: "TajawalMedium",
  },
});
