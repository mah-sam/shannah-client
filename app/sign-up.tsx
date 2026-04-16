// @ts-nocheck
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Button, Input, Layout, Text } from "@ui-kitten/components";
import { router, useLocalSearchParams } from "expo-router";
import { setItemAsync } from "expo-secure-store";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaInsetsContext } from "react-native-safe-area-context";
import { EyeIcon, EyeOffIcon } from "../components/Icons";
import BottomActionBar from "../components/ui/BottomActionBar";
import { OtpInput } from "../components/ui/OtpInput";
import { useGlobal } from "../context/GlobalContext";
import useKeyboard from "../hooks/useKeyboard";
import { signUp, verifyEmailOtp } from "../services/shannahApi";
import * as theme from "../theme.json";

export default function SignUp() {
  const params = useLocalSearchParams();
  const { setSignedIn, setUserData } = useGlobal();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState(params.email || "");
  const [password, setPassword] = useState("");
  const [passwordConf, setPasswordConf] = useState("");
  const [passwordSecureText, setPasswordSecureText] = useState(true);
  const [passwordConfSecureText, setPasswordConfSecureText] = useState(true);
  const [emptyInputs, setEmptyInputs] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [otpSent, setOtpSent] = useState(params.otpSent === "true" || false);
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef(Array(6).fill(null));

  const initErrors = {
    first_name: null,
    last_name: null,
    email: null,
    password: null,
  };

  const [errors, setErrors] = useState(initErrors);
  const { keyboardOpen } = useKeyboard();

  useEffect(() => {
    if (
      firstName.trim() === "" ||
      lastName.trim() === "" ||
      email.trim() === "" ||
      password === "" ||
      passwordConf === ""
    ) {
      setEmptyInputs(true);
    } else {
      setEmptyInputs(false);
    }
  }, [firstName, lastName, email, password, passwordConf]);

  useEffect(() => {
    !otpDigits.includes("") && handleVerifyOtp();
  }, [otpDigits]);

  const SecureTextToggle = ({ target }) => {
    return (target === "password" && passwordSecureText) ||
      (target === "passwordConf" && passwordConfSecureText) ? (
      <Pressable
        onPress={() =>
          target === "password"
            ? setPasswordSecureText(false)
            : setPasswordConfSecureText(false)
        }
      >
        <EyeIcon style={styles.eyeIcon}></EyeIcon>
      </Pressable>
    ) : (
      <Pressable
        onPress={() =>
          target === "password"
            ? setPasswordSecureText(true)
            : setPasswordConfSecureText(true)
        }
      >
        <EyeOffIcon style={styles.eyeIcon}></EyeOffIcon>
      </Pressable>
    );
  };

  const handleSignUp = async () => {
    setIsSubmitting(true);
    const result = await signUp({
      first_name: firstName,
      last_name: lastName,
      email: email,
      password: password,
      password_confirmation: passwordConf,
    });
    setIsSubmitting(false);

    if (result?.errors !== undefined) {
      setErrors({ ...initErrors, ...result.errors });
    } else if (result.next_step === "verify_email") {
      setOtpSent(true);
    }
  };

  const handleOtpChange = (text, index) => {
    if (text.length > 1) return; // Only allow single digit
    const newDigits = [...otpDigits];
    newDigits[index] = text;
    setOtpDigits(newDigits);

    if (text && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleVerifyOtp = async () => {
    const enteredOtp = otpDigits.join("");
    if (enteredOtp.length !== 6) {
      Alert.alert("خطأ", "يرجى إدخال رمز التحقق كاملاً");
      return;
    }

    const data = await verifyEmailOtp(email, enteredOtp);
    if (data?.status !== true) {
      Alert.alert("خطأ", data.message);
      return;
    }

    await setItemAsync("token", data.token);
    await AsyncStorage.setItem("user", JSON.stringify(data.user));
    setSignedIn(true);
    setUserData(data.user);

    router.replace("/(tabs)/");
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
          <View style={styles.signUpContainer}>
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
                {otpSent ? (
                  <>
                    <Text category="h2" style={styles.title}>
                      التحقق من البريد الإلكتروني
                    </Text>
                    <Text>
                      <Text category="s1" style={styles.subTitle}>
                        تم إرسال كلمة مرور لمرة واحدة مكونة من 6 أرقام إلى بريدك
                        الإلكتروني
                      </Text>
                      <Text category="s1" style={{ fontFamily: "TajawalBold" }}>
                        {" " + email + ". "}
                      </Text>
                      <Text category="s1" style={styles.subTitle}>
                        قم بإدخال كلمة المرور للمتابعة
                      </Text>
                    </Text>
                  </>
                ) : (
                  <>
                    <Text category="h2" style={styles.title}>
                      أهلاً بكم في شنّة
                    </Text>
                    <Text category="s1" style={styles.subTitle}>
                      سجل الآن لتكتشف نكهات حقيقية من حولك واطلب ما يناسبك
                    </Text>
                  </>
                )}
              </View>
            </View>
            <KeyboardAvoidingView
              style={{ flex: 1 }}
              behavior={Platform.OS === "ios" ? "padding" : "height"}
              enabled={keyboardOpen}
              keyboardVerticalOffset={insets.top + 16}
            >
              {otpSent ? (
                <>
                  <View style={styles.otpContainer}>
                    {otpDigits.map((digit, index) => (
                      <OtpInput
                        key={index}
                        ref={(ref) => (inputRefs.current[index] = ref)}
                        style={styles.otpInput}
                        value={digit}
                        onChangeText={(text) => handleOtpChange(text, index)}
                        keyboardType="numeric"
                        maxLength={1}
                      ></OtpInput>
                    ))}
                  </View>
                  <BottomActionBar style={{ marginHorizontal: -16 }}>
                    <Button
                      onPress={() => handleVerifyOtp()}
                      disabled={otpDigits.includes("") || isSubmitting}
                    >
                      <View>
                        <Text category="s1" status="control">
                          التحقق من كلمة المرور
                        </Text>
                      </View>
                    </Button>
                  </BottomActionBar>
                </>
              ) : (
                <ScrollView contentContainerStyle={styles.signUpForm}>
                  <Input
                    status={errors.first_name === null ? "primary" : "danger"}
                    label={() => (
                      <Text style={styles.labelText}>الاسم الأول</Text>
                    )}
                    textStyle={styles.inputText}
                    value={firstName}
                    onChangeText={(t) => setFirstName(t)}
                    caption={
                      errors.first_name === null ? "" : errors.first_name[0]
                    }
                  />
                  <Input
                    status={errors.last_name === null ? "primary" : "danger"}
                    label={() => (
                      <Text style={styles.labelText}>اسم العائلة</Text>
                    )}
                    textStyle={styles.inputText}
                    value={lastName}
                    onChangeText={(t) => setLastName(t)}
                    caption={
                      errors.last_name === null ? "" : errors.last_name[0]
                    }
                  />
                  <Input
                    status={errors.email === null ? "primary" : "danger"}
                    inputMode="email"
                    label={() => (
                      <Text style={styles.labelText}>
                        عنوان البريد الإلكتروني
                      </Text>
                    )}
                    textStyle={styles.inputText}
                    value={email}
                    onChangeText={(t) => setEmail(t)}
                    placeholder="email@email.com"
                    caption={errors.email === null ? "" : errors.email[0]}
                  />
                  <Input
                    status={errors.password === null ? "primary" : "danger"}
                    label={() => (
                      <Text style={styles.labelText}>كلمة المرور</Text>
                    )}
                    textStyle={styles.inputText}
                    value={password}
                    onChangeText={(t) => setPassword(t)}
                    secureTextEntry={passwordSecureText}
                    accessoryRight={() => (
                      <SecureTextToggle target={"password"}></SecureTextToggle>
                    )}
                    caption={errors.password === null ? "" : errors.password[0]}
                  />
                  <Input
                    status="primary"
                    label={() => (
                      <Text style={styles.labelText}>تأكيد كلمة المرور</Text>
                    )}
                    textStyle={styles.inputText}
                    value={passwordConf}
                    onChangeText={(t) => setPasswordConf(t)}
                    secureTextEntry={passwordConfSecureText}
                    accessoryRight={() => (
                      <SecureTextToggle
                        target={"passwordConf"}
                      ></SecureTextToggle>
                    )}
                  />
                  <Text
                    category="s2"
                    status="primary"
                    style={styles.forgotPasswordText}
                  >
                    نسيت كلمة المرور؟
                  </Text>
                  <Button
                    onPress={() => handleSignUp()}
                    disabled={emptyInputs || isSubmitting}
                  >
                    <View>
                      <Text category="s1" status="control">
                        اشتراك
                      </Text>
                    </View>
                  </Button>
                  <View style={styles.alreadyHaveAccountContainer}>
                    <Text category="s1" style={styles.alreadyHaveAccountText}>
                      لديك حساب بالفعل؟{" "}
                    </Text>
                    <Pressable onPress={() => router.push("/sign-in-email")}>
                      <Text category="s1" status="primary">
                        تسجيل الدخول
                      </Text>
                    </Pressable>
                  </View>
                </ScrollView>
              )}
            </KeyboardAvoidingView>
          </View>
          {!otpSent && (
            <View style={styles.termsContainer}>
              <Text
                style={{
                  color: theme["text-body-color"],
                  lineHeight: 16,
                }}
              >
                من خلال المتابعة، فإنك توافق على{" "}
                <Text status="primary" style={styles.termsLink}>
                  الشروط وسياسة الخصوصية الخاصة بنا
                </Text>
              </Text>
            </View>
          )}
        </Layout>
      )}
    </SafeAreaInsetsContext.Consumer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  signUpContainer: {
    flex: 1,
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
  signUpForm: {
    flexGrow: 1,
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
  alreadyHaveAccountContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  alreadyHaveAccountText: {
    lineHeight: 24,
    color: theme["text-body-color"],
    textAlign: "center",
  },
  termsContainer: {
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  termsLink: {
    textDecorationLine: "underline",
  },
  otpContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    direction: "ltr",
  },
  otpInput: {
    textAlign: "center",
    fontSize: 16,
    fontFamily: "TajawalMedium",
    color: theme["color-black"],
  },
});
