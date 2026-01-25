import { Button, Divider, Layout, Text } from "@ui-kitten/components";
import { Link, router } from "expo-router";
import { Image, StyleSheet, View } from "react-native";
import { SafeAreaInsetsContext } from "react-native-safe-area-context";
import * as theme from "../theme.json";

export default function SignInScreen() {
  return (
    <SafeAreaInsetsContext.Consumer>
      {(insets) => (
        <Layout
          style={{
            ...styles.container,
            paddingTop: insets.top + 48,
            paddingBottom: insets.bottom,
          }}
        >
          <View style={styles.welcomeContainer}>
            <Image
              source={require("../assets/images/logo-new.png")}
              style={{
                width: 80,
                height: 88,
                alignSelf: "center",
              }}
            />
            <View style={styles.titleContainer}>
              <Text category="h2" style={styles.title}>
                مرحباً بكم في شنّة
              </Text>
              <Text category="s1" style={styles.subTitle}>
                قم بتسجيل الدخول أو قم بالتسجيل لمواصلة الطلب
              </Text>
            </View>
          </View>
          <View style={styles.signInOptions}>
            <View style={styles.buttonsContainer}>
              <Button
                onPress={() => {
                  router.push("/sign-in-mobile");
                }}
              >
                <View>
                  <Text style={styles.buttonText} status="control">
                    التسجيل باستخدام رقم الجوال
                  </Text>
                </View>
              </Button>
              <Button
                appearance="outline"
                onPress={() => {
                  router.push("/sign-in-email");
                }}
              >
                <View>
                  <Text style={styles.buttonText} status="primary">
                    التسجيل باستخدام البريد الإلكتروني
                  </Text>
                </View>
              </Button>
            </View>
            <View>
              <Divider></Divider>
              <View style={styles.dividerTitleContainer}>
                <Text category="s1" style={styles.dividerTitle}>
                  أو
                </Text>
              </View>
            </View>
            <Link href="/(tabs)/" style={styles.link}>
              <Text style={styles.buttonText} status="primary">
                الاستمرار كضيف
              </Text>
            </Link>
          </View>
          <View style={[styles.termsContainer, { bottom: insets.bottom + 20 }]}>
            <Text
              style={{
                fontFamily: "TajawalMedium",
                color: theme["text-body-color"],
              }}
            >
              من خلال المتابعة، فإنك توافق على{" "}
              <Text status="primary" style={styles.termsLink}>
                الشروط وسياسة الخصوصية الخاصة بنا
              </Text>
            </Text>
          </View>
        </Layout>
      )}
    </SafeAreaInsetsContext.Consumer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 16,
    gap: 32,
  },
  welcomeContainer: { alignItems: "center", gap: 16 },
  titleContainer: {
    gap: 8,
  },
  title: {
    textAlign: "center",
    fontFamily: "TajawalBold",
    color: theme["text-heading-color"],
  },
  subTitle: {
    textAlign: "center",
    color: theme["text-body-color"],
    lineHeight: 24,
  },
  signInOptions: {
    width: "100%",
    gap: 24,
  },
  buttonsContainer: {
    width: "100%",
    gap: 16,
  },
  buttonText: {
    fontFamily: "TajawalMedium",
    fontSize: 16,
  },
  dividerTitleContainer: {
    position: "absolute",
    width: 36,
    height: 20,
    transform: [{ translateY: -10 }],
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 10,
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
  },
  dividerTitle: {
    color: theme["text-body-color"],
  },
  link: {
    textAlign: "center",
  },
  termsContainer: {
    alignItems: "center",
    position: "absolute",
    left: 20,
    right: 20,
  },
  termsLink: {
    fontFamily: "TajawalMedium",
    textDecorationLine: "underline",
  },
});
