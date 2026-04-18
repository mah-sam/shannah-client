import { Text } from "@ui-kitten/components";
import { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import * as theme from "../../theme.json";

type EmptyStateProps = {
  icon?: ReactNode;
  title: string;
  subtitle?: string;
  compact?: boolean;
};

export const EmptyState = ({ icon, title, subtitle, compact }: EmptyStateProps) => (
  <View style={[styles.container, compact && styles.compactContainer]}>
    {icon ? <View style={styles.iconContainer}>{icon}</View> : null}
    <Text category="h6" style={styles.title}>
      {title}
    </Text>
    {subtitle ? (
      <Text appearance="hint" style={styles.subtitle}>
        {subtitle}
      </Text>
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
    gap: 8,
  },
  compactContainer: {
    flex: 0,
    paddingVertical: 24,
  },
  iconContainer: {
    marginBottom: 8,
    opacity: 0.6,
  },
  title: {
    color: theme["text-heading-color"],
    textAlign: "center",
  },
  subtitle: {
    textAlign: "center",
    color: theme["text-body-color"],
  },
});
