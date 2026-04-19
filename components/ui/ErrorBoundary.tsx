// @ts-nocheck
import { Button, Text } from "@ui-kitten/components";
import { Component, ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import * as theme from "../../theme.json";
import { captureException } from "../../utils/errorReporting";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

/**
 * Top-level error boundary. Catches any render-phase exception so the whole
 * app falls back to a branded error screen instead of a white screen of
 * death. The error is forwarded to the central error reporter so we learn
 * about it in production.
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
        <Text category="h3" style={styles.title}>
          حدث خطأ غير متوقع
        </Text>
        <Text style={styles.subtitle}>
          حاول إعادة المحاولة. إذا استمرت المشكلة، أعد فتح التطبيق.
        </Text>
        <Button
          appearance="outline"
          status="basic"
          onPress={this.handleRetry}
          style={styles.button}
        >
          {() => <Text style={styles.buttonText}>إعادة المحاولة</Text>}
        </Button>
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
    color: theme["text-heading-color"],
  },
  subtitle: {
    textAlign: "center",
    color: theme["text-body-color"],
    fontFamily: "TajawalMedium",
    lineHeight: 22,
  },
  button: {
    marginTop: 12,
  },
  buttonText: {
    fontFamily: "TajawalMedium",
    color: theme["text-heading-color"],
  },
});
