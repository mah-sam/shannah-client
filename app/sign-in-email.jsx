import AsyncStorage from "@react-native-async-storage/async-storage";
import { Button, Input, Layout, Text } from "@ui-kitten/components";
import { router } from "expo-router";
import { setItemAsync } from "expo-secure-store";
import { useEffect, useState } from "react";
import { Alert, Image, Pressable, StyleSheet, View } from "react-native";
import { SafeAreaInsetsContext } from "react-native-safe-area-context";
import { EyeIcon, EyeOffIcon } from "../components/Icons";
import { useGlobal } from "../context/GlobalContext";
import { login } from "../services/shannahApi";
import * as theme from "../theme.json";

export default function SignInEmail() {
  const { setSignedIn, setUserData } = useGlobal();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [emptyInputs, setEmptyInputs] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (email.trim() === "" || password === "") {
      setEmptyInputs(true);
    } else {
      setEmptyInputs(false);
    }
  }, [email, password]);

  const SecureTextToggle = () => {
    return secureTextEntry ? (
      <Pressable onPress={() => setSecureTextEntry(false)}>
        <EyeIcon style={styles.eyeIcon}></EyeIcon>
      </Pressable>
    ) : (
      <Pressable onPress={() => setSecureTextEntry(true)}>
        <EyeOffIcon style={styles.eyeIcon}></EyeOffIcon>
      </Pressable>
    );
  };

  const handleSignIn = async () => {
    setIsSubmitting(true);
    const data = await login(email.trim(), password);
    setIsSubmitting(false);

    if (data?.status === true) {
      await setItemAsync("token", data.token);
      await AsyncStorage.setItem("user", JSON.stringify(data.user));
      setSignedIn(true);
      setUserData(data.user);

      router.replace("/(tabs)/");
    } else if (data?.status === false && data?.code === "EMAIL_NOT_VERIFIED") {
      router.push({
        pathname: "/sign-up",
        params: {
          email: email.trim(),
          otpSent: true,
        },
      });
    } else {
      Alert.alert("خطأ", data.message);
    }
  };

  return (
    <SafeAreaInsetsContext.Consumer>
      {(insets) => (
        <Layout
          style={{
            ...styles.container,
            paddingTop: insets.top + 16,
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
                مرحباً بعودتك
              </Text>
              <Text category="s1" style={styles.subTitle}>
                قم بتسجيل الدخول باستخدام بريدك الإلكتروني واستكشف الطعام من
                حولك.
              </Text>
            </View>
          </View>
          <View style={styles.signInContainer}>
            <Input
              status="primary"
              inputMode="email"
              label={(evaProps) => (
                <Text style={styles.labelText}>عنوان البريد الإلكتروني</Text>
              )}
              textStyle={styles.inputText}
              value={email}
              onChangeText={(t) => setEmail(t)}
              placeholder="email@email.com"
            />
            <Input
              status="primary"
              label={() => <Text style={styles.labelText}>كلمة المرور</Text>}
              textStyle={styles.inputText}
              value={password}
              onChangeText={(t) => setPassword(t)}
              secureTextEntry={secureTextEntry}
              accessoryRight={() => <SecureTextToggle></SecureTextToggle>}
            />
            <Text
              category="s2"
              status="primary"
              style={styles.forgotPasswordText}
            >
              نسيت كلمة المرور؟
            </Text>
            <Button
              onPress={() => handleSignIn()}
              disabled={emptyInputs || isSubmitting}
            >
              <View>
                <Text style={styles.buttonText} status="control">
                  تسجيل الدخول
                </Text>
              </View>
            </Button>
            <View style={styles.dontHaveAccountContainer}>
              <Text category="s1">ليس لديك حساب؟ </Text>
              <Pressable onPress={() => router.push("/sign-up")}>
                <Text category="s1" status="primary" style={styles.signUpLink}>
                  سجل الآن
                </Text>
              </Pressable>
            </View>
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
  signInContainer: {
    width: "100%",
    gap: 16,
  },
  inputText: {
    color: theme["color-black"],
    fontSize: 16,
  },
  labelText: {
    color: theme["color-black"],
    lineHeight: 18,
    textAlign: "left",
  },
  eyeIcon: {
    width: 24,
    height: 24,
  },
  forgotPasswordText: {
    textAlign: "right",
  },
  dontHaveAccountContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  dontHaveAccountText: {
    lineHeight: 24,
    color: theme["text-body-color"],
    textAlign: "center",
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
