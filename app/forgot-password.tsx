// @ts-nocheck
import { Button, Input, Layout, Text } from "@ui-kitten/components";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaInsetsContext } from "react-native-safe-area-context";
import { ChevronLeft, EyeIcon, EyeOffIcon } from "../components/Icons";
import BottomActionBar from "../components/ui/BottomActionBar";
import { OtpInput } from "../components/ui/OtpInput";
import { useToast } from "../context/ToastContext";
import useKeyboard from "../hooks/useKeyboard";
import {
  resetPassword,
  sendPasswordResetOtp,
  verifyPasswordResetOtp,
} from "../services/shannahApi";
import * as theme from "../theme.json";

type Step = "email" | "otp" | "newPassword";

export default function ForgotPassword() {
  const { show: showToast } = useToast();
  const { keyboardOpen } = useKeyboard();

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const [password, setPassword] = useState("");
  const [passwordConf, setPasswordConf] = useState("");
  const [passwordSecure, setPasswordSecure] = useState(true);
  const [passwordConfSecure, setPasswordConfSecure] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[] | null>>({});
  const otpRefs = useRef<any[]>(Array(6).fill(null));
  const passwordConfRef = useRef<any>(null);

  useEffect(() => {
    if (step === "otp" && otpRefs.current[0]) {
      otpRefs.current[0].focus();
    }
  }, [step]);

  const otpValue = otpDigits.join("");

  const handleSendOtp = async () => {
    if (!email.trim()) {
      showToast({ kind: "error", message: "أدخل بريدك الإلكتروني" });
      return;
    }
    setIsSubmitting(true);
    let data;
    try {
      data = await sendPasswordResetOtp(email.trim());
    } catch {
      setIsSubmitting(false);
      Alert.alert("خطأ", "تعذّر الاتصال بالخادم. تحقق من الإنترنت وحاول مجدداً.");
      return;
    }
    setIsSubmitting(false);

    if (data?.status === true) {
      showToast({ kind: "success", message: "تم إرسال الرمز إلى بريدك" });
      setStep("otp");
    } else {
      Alert.alert("خطأ", data?.message || "تعذّر إرسال الرمز");
    }
  };

  const handleOtpChange = (text, index) => {
    if (text.length > 1) return;
    const next = [...otpDigits];
    next[index] = text;
    setOtpDigits(next);
    if (text && index < 5) otpRefs.current[index + 1]?.focus();
  };

  useEffect(() => {
    if (step !== "otp") return;
    if (otpValue.length !== 6) return;
    (async () => {
      setIsSubmitting(true);
      let data;
      try {
        data = await verifyPasswordResetOtp(email.trim(), otpValue);
      } catch {
        setIsSubmitting(false);
        Alert.alert("خطأ", "تعذّر الاتصال بالخادم. تحقق من الإنترنت وحاول مجدداً.");
        return;
      }
      setIsSubmitting(false);

      if (data?.status === true) {
        setStep("newPassword");
      } else {
        Alert.alert("خطأ", data?.message || "الرمز غير صحيح");
        setOtpDigits(["", "", "", "", "", ""]);
        otpRefs.current[0]?.focus();
      }
    })();
  }, [otpValue, step, email]);

  const handleReset = async () => {
    if (password.length < 8) {
      setErrors({ password: ["يجب ألا تقل كلمة المرور عن 8 أحرف"] });
      return;
    }
    if (password !== passwordConf) {
      setErrors({ password_confirmation: ["كلمتا المرور غير متطابقتين"] });
      return;
    }
    setErrors({});
    setIsSubmitting(true);
    let data;
    try {
      data = await resetPassword(email.trim(), otpValue, password, passwordConf);
    } catch {
      setIsSubmitting(false);
      Alert.alert("خطأ", "تعذّر الاتصال بالخادم. تحقق من الإنترنت وحاول مجدداً.");
      return;
    }
    setIsSubmitting(false);

    if (data?.status === true) {
      showToast({ kind: "success", message: "تم تعيين كلمة مرور جديدة" });
      router.replace("/sign-in-mobile");
    } else if (data?.errors) {
      setErrors(data.errors);
    } else {
      Alert.alert("خطأ", data?.message || "تعذّر تعيين كلمة المرور");
    }
  };

  return (
    <SafeAreaInsetsContext.Consumer>
      {(insets) => (
        <Layout
          style={{
            ...styles.container,
            paddingTop: (insets?.top ?? 0) + 16,
            paddingBottom: (insets?.bottom ?? 0) + 16,
          }}
        >
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            enabled={keyboardOpen}
          >
            <View style={styles.headerRow}>
              <Pressable onPress={() => router.back()} hitSlop={10}>
                <ChevronLeft style={styles.backIcon} />
              </Pressable>
            </View>

            <View style={styles.welcomeContainer}>
              <Image
                source={require("../assets/images/logo-new.png")}
                style={styles.logo}
              />
              <Text category="h2" style={styles.title}>
                استعادة كلمة المرور
              </Text>
              <Text category="s1" style={styles.subTitle}>
                {step === "email" &&
                  "أدخل بريدك الإلكتروني وسنرسل لك رمزاً لاستعادة كلمة المرور"}
                {step === "otp" &&
                  "أدخل الرمز المكوّن من 6 أرقام الذي أرسلناه إلى بريدك"}
                {step === "newPassword" && "اختر كلمة مرور جديدة لحسابك"}
              </Text>
            </View>

            <View style={styles.formContainer}>
              {step === "email" && (
                <Input
                  status="primary"
                  inputMode="email"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  textContentType="emailAddress"
                  autoComplete="email"
                  label={() => (
                    <Text style={styles.labelText}>البريد الإلكتروني</Text>
                  )}
                  textStyle={styles.inputText}
                  placeholder="email@email.com"
                  value={email}
                  onChangeText={setEmail}
                  returnKeyType="send"
                  onSubmitEditing={handleSendOtp}
                />
              )}

              {step === "otp" && (
                <View style={styles.otpContainer}>
                  {otpDigits.map((digit, index) => (
                    <OtpInput
                      key={index}
                      ref={(ref) => (otpRefs.current[index] = ref)}
                      style={styles.otpInput}
                      value={digit}
                      onChangeText={(text) => handleOtpChange(text, index)}
                      keyboardType="numeric"
                      maxLength={1}
                    />
                  ))}
                </View>
              )}

              {step === "newPassword" && (
                <>
                  <Input
                    status={errors?.password ? "danger" : "primary"}
                    label={() => (
                      <Text style={styles.labelText}>كلمة المرور الجديدة</Text>
                    )}
                    textStyle={styles.inputText}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={passwordSecure}
                    textContentType="newPassword"
                    autoComplete="password-new"
                    autoCapitalize="none"
                    returnKeyType="next"
                    onSubmitEditing={() => passwordConfRef.current?.focus()}
                    blurOnSubmit={false}
                    accessoryRight={() => (
                      <Pressable
                        onPress={() => setPasswordSecure(!passwordSecure)}
                      >
                        {passwordSecure ? (
                          <EyeIcon style={styles.eyeIcon} />
                        ) : (
                          <EyeOffIcon style={styles.eyeIcon} />
                        )}
                      </Pressable>
                    )}
                    caption={errors?.password?.[0] ?? ""}
                  />
                  <Input
                    ref={passwordConfRef}
                    status={
                      errors?.password_confirmation ? "danger" : "primary"
                    }
                    label={() => (
                      <Text style={styles.labelText}>تأكيد كلمة المرور</Text>
                    )}
                    textStyle={styles.inputText}
                    value={passwordConf}
                    onChangeText={setPasswordConf}
                    secureTextEntry={passwordConfSecure}
                    textContentType="newPassword"
                    autoComplete="password-new"
                    autoCapitalize="none"
                    returnKeyType="done"
                    accessoryRight={() => (
                      <Pressable
                        onPress={() => setPasswordConfSecure(!passwordConfSecure)}
                      >
                        {passwordConfSecure ? (
                          <EyeIcon style={styles.eyeIcon} />
                        ) : (
                          <EyeOffIcon style={styles.eyeIcon} />
                        )}
                      </Pressable>
                    )}
                    caption={errors?.password_confirmation?.[0] ?? ""}
                  />
                </>
              )}
            </View>

            <BottomActionBar>
              {step === "email" && (
                <Button
                  onPress={handleSendOtp}
                  disabled={isSubmitting || !email.trim()}
                >
                  <View>
                    <Text status="control" style={styles.buttonText}>
                      {isSubmitting ? "جاري الإرسال..." : "إرسال الرمز"}
                    </Text>
                  </View>
                </Button>
              )}
              {step === "otp" && (
                <Button appearance="ghost" onPress={handleSendOtp} disabled={isSubmitting}>
                  <View>
                    <Text status="primary">إعادة إرسال الرمز</Text>
                  </View>
                </Button>
              )}
              {step === "newPassword" && (
                <Button
                  onPress={handleReset}
                  disabled={isSubmitting || !password || !passwordConf}
                >
                  <View>
                    <Text status="control" style={styles.buttonText}>
                      {isSubmitting ? "جاري الحفظ..." : "تعيين كلمة المرور"}
                    </Text>
                  </View>
                </Button>
              )}
            </BottomActionBar>
          </KeyboardAvoidingView>
        </Layout>
      )}
    </SafeAreaInsetsContext.Consumer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  headerRow: {
    flexDirection: "row",
    marginBottom: 16,
  },
  backIcon: { width: 24, height: 24 },
  welcomeContainer: { alignItems: "center", gap: 12, marginBottom: 24 },
  logo: { width: 72, height: 80 },
  title: {
    textAlign: "center",
    fontFamily: "TajawalBold",
    color: theme["text-heading-color"],
  },
  subTitle: {
    textAlign: "center",
    color: theme["text-body-color"],
    lineHeight: 22,
  },
  formContainer: { flex: 1, gap: 16 },
  inputText: {
    color: theme["color-black"],
    fontSize: 16,
  },
  labelText: {
    color: theme["color-black"],
    lineHeight: 18,
    textAlign: "left",
  },
  eyeIcon: { width: 22, height: 22 },
  otpContainer: {
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
  buttonText: {
    fontFamily: "TajawalMedium",
    fontSize: 16,
  },
});
