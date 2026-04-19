// @ts-nocheck
import { Component, ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import * as theme from "../../theme.json";
import { captureException } from "../../utils/errorReporting";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

/**
 * Top-level error boundary. Catches any render-phase exception and shows a
 * branded fallback instead of a white screen.
 *
 * Built on plain React Native primitives (Text, Pressable, View) rather
 * than UI Kitten components, because the boundary may render BEFORE — or
 * ABOVE — ApplicationProvider in the tree. A UI Kitten Text in the
 * fallback would itself crash ("unsupported configuration") and mask the
 * real error.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: { componentStack: string }): void {
    captureException(error, { componentStack: info.componentStack });
  }

  private handleRetry = (): void => {
    this.setState({ hasError: false });
  };

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <View style={styles.container}>
        <Text style={styles.title}>حدث خطأ غير متوقع</Text>
        <Text style={styles.subtitle}>
          حاول إعادة المحاولة. إذا استمرت المشكلة، أعد فتح التطبيق.
        </Text>
        <Pressable
          onPress={this.handleRetry}
          style={({ pressed }) => [
            styles.button,
            pressed && styles.buttonPressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel="إعادة المحاولة"
        >
          <Text style={styles.buttonText}>إعادة المحاولة</Text>
        </Pressable>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    gap: 12,
    backgroundColor: "#FFFFFF",
  },
  title: {
    textAlign: "center",
    fontFamily: "TajawalBold",
    fontSize: 20,
    color: theme["text-heading-color"],
  },
  subtitle: {
    textAlign: "center",
    color: theme["text-body-color"],
    fontFamily: "TajawalMedium",
    fontSize: 14,
    lineHeight: 22,
  },
  button: {
    marginTop: 12,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme["text-heading-color"],
  },
  buttonPressed: {
    opacity: 0.7,
  },
  buttonText: {
    fontFamily: "TajawalMedium",
    color: theme["text-heading-color"],
    fontSize: 14,
  },
});
