// @ts-nocheck
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Input, Layout, Text } from "@ui-kitten/components";
import { router } from "expo-router";
import { setItemAsync } from "expo-secure-store";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaInsetsContext } from "react-native-safe-area-context";
import BottomActionBar from "../components/ui/BottomActionBar";
import { OtpInput } from "../components/ui/OtpInput";
import { PressableScale } from "../components/ui/PressableScale";
import { PrimaryButton } from "../components/ui/PrimaryButton";
import { isReturnToAllowed, useGlobal } from "../context/GlobalContext";
import { useToast } from "../context/ToastContext";
import useKeyboard from "../hooks/useKeyboard";
import { sendOtp, verifyOtp } from "../services/shannahApi";
import * as theme from "../theme.json";
import {
  formatSaudiPhoneDisplay,
  isValidSaudiMobile,
  normalizeSaudiPhoneDigits,
} from "../utils/phoneFormat";

const RESEND_COUNTDOWN_SECONDS = 60;
const OTP_LENGTH = 6;

export default function SignInMobile() {
  const {
    setSignedIn,
    setUserData,
    pendingReturnTo,
    setPendingReturnTo,
    reconcileAccountBoundaries,
  } = useGlobal();
  const { show } = useToast();
  // Store the raw 9-digit subscriber number; display formats on read.
  const [phoneDigits, setPhoneDigits] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpDigits, setOtpDigits] = useState(() => Array(OTP_LENGTH).fill(""));
  const [otpError, setOtpError] = useState(false);
  const inputRefs = useRef(Array(OTP_LENGTH).fill(null));
  // Synchronous guard against same-tick double-fires (auto-verify useEffect
  // + button onPress can race on the 6th keystroke). Drives UI via state too.
  const submittingRef = useRef(false);
  const [submitting, setSubmitting] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);
  // Bumped on every successful OTP issue (initial send + each resend) so
  // the countdown effect re-fires. Using `otpSent` alone would only trigger
  // the first time — resends keep otpSent=true and the effect would skip.
  const [resendNonce, setResendNonce] = useState(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const { keyboardOpen } = useKeyboard();

  const phoneDisplay = useMemo(
    () => formatSaudiPhoneDisplay(phoneDigits),
    [phoneDigits],
  );
  const phoneValid = useMemo(
    () => isValidSaudiMobile(phoneDigits),
    [phoneDigits],
  );

  // Kick the resend countdown every time a fresh OTP is issued (initial send
  // or explicit resend). Triggered by resendNonce — see its declaration.
  useEffect(() => {
    if (resendNonce === 0) return;
    setResendCountdown(RESEND_COUNTDOWN_SECONDS);
    const interval = setInterval(() => {
      setResendCountdown((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [resendNonce]);

  // Soft fade-in when switching between phone entry ↔ OTP entry.
  useEffect(() => {
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [otpSent, fadeAnim]);

  useEffect(() => {
    if (otpSent && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [otpSent]);

  useEffect(() => {
    !otpDigits.includes("") && handleVerifyOtp();
  }, [otpDigits]);

  const handlePhoneChange = (text) => {
    setPhoneDigits(normalizeSaudiPhoneDigits(text));
  };

  const handleSendOtp = async () => {
    if (submittingRef.current) return;
    if (!phoneValid) {
      show({
        message: "أدخل رقم جوال سعودي صحيح (9 أرقام تبدأ بـ 5)",
        kind: "error",
      });
      return;
    }
    submittingRef.current = true;
    setSubmitting(true);
    try {
      const data = await sendOtp(phoneDigits);
      if (data?.status === true) {
        setOtpSent(true);
        // Reset OTP cells on a fresh send so prior (wrong/expired) digits
        // don't carry over into the new challenge.
        setOtpDigits(Array(OTP_LENGTH).fill(""));
        setOtpError(false);
        // Restart the resend countdown — must bump every successful send,
        // not just the first, otherwise the resend link stays available
        // forever after the first issue.
        setResendNonce((n) => n + 1);
      } else {
        show({
          message: data?.message || "فشل في إرسال الرمز",
          kind: "error",
        });
      }
    } catch {
      show({
        message: "تعذّر الاتصال بالخادم. تحقق من الإنترنت وحاول مجدداً",
        kind: "error",
      });
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (submittingRef.current) return;
    const enteredOtp = otpDigits.join("");
    if (enteredOtp.length !== OTP_LENGTH) {
      show({ message: "أدخل رمز التحقق كاملاً", kind: "error" });
      return;
    }

    submittingRef.current = true;
    setSubmitting(true);
    let data;
    try {
      data = await verifyOtp(phoneDigits, enteredOtp);
    } catch {
      show({
        message: "تعذّر الاتصال بالخادم. تحقق من الإنترنت وحاول مجدداً",
        kind: "error",
      });
      submittingRef.current = false;
      setSubmitting(false);
      return;
    }

    if (data?.status !== true) {
      show({
        message: data?.message || "الرمز غير صحيح أو انتهت صلاحيته",
        kind: "error",
      });
      setOtpDigits(Array(OTP_LENGTH).fill(""));
      setOtpError(true);
      inputRefs.current[0]?.focus();
      submittingRef.current = false;
      setSubmitting(false);
      return;
    }

    // Hold submittingRef=true through navigation — prevents a late
    // re-render of the auto-verify useEffect from firing a second
    // verify on the now-consumed OTP.
    await setItemAsync("token", data.token);
    await AsyncStorage.setItem("user", JSON.stringify(data.user));

    // Cross-account cart isolation: if this device was previously signed
    // in as a DIFFERENT user, wipe the cart/address before the new user
    // sees them. Pure-guest → first-login preserves the cart.
    if (data.user?.id !== undefined && data.user?.id !== null) {
      await reconcileAccountBoundaries(data.user.id);
    }

    setSignedIn(true);
    setUserData(data.user);

    // Profile incomplete always goes through profile-complete first.
    // pendingReturnTo is forwarded intact — profile-complete consumes it
    // on successful profile submit via the same allowlist used below.
    if (data.next_step === "complete_profile") {
      router.replace("/profile-complete");
      return;
    }

    // Consume pendingReturnTo if set + allowlisted. Any non-matching value
    // is silently dropped and we fall back to the default tabs route.
    const returnTarget = pendingReturnTo;
    setPendingReturnTo(null);
    if (returnTarget && isReturnToAllowed(returnTarget)) {
      router.replace(returnTarget as any);
    } else {
      router.replace("/(tabs)/");
    }
  };

  /**
   * Handles three user behaviors in one path:
   *   1. Single-digit keystroke in an empty cell → write and advance focus.
   *   2. Paste of full OTP into any cell (iOS/Android SMS autofill delivers
   *      the entire code into whichever cell is focused — usually cell 0) →
   *      distribute across cells from `index`, focus the last written.
   *   3. Retyping over a filled cell → write the new char, advance focus.
   *      Detected when the new text STARTS with the old cell value (user
   *      appended) — we take only the chars after the existing prefix.
   */
  const handleOtpChange = (text, index) => {
    if (otpError) setOtpError(false);

    const digits = (text ?? "").replace(/\D+/g, "");
    if (digits.length === 0) {
      const newDigits = [...otpDigits];
      newDigits[index] = "";
      setOtpDigits(newDigits);
      return;
    }

    const oldDigit = otpDigits[index] ?? "";
    // User retyped over a filled cell: strip the stale prefix so we only
    // process the newly-typed characters. Without this, "5" + typed "7"
    // yields text "57" which would wrongly fill two cells.
    const toDistribute =
      oldDigit && digits.startsWith(oldDigit) && digits.length > 1
        ? digits.slice(oldDigit.length)
        : digits;

    const newDigits = [...otpDigits];
    let write = index;
    for (const ch of toDistribute) {
      if (write >= OTP_LENGTH) break;
      newDigits[write] = ch;
      write++;
    }
    setOtpDigits(newDigits);

    const focusTarget = Math.min(write, OTP_LENGTH - 1);
    inputRefs.current[focusTarget]?.focus();
  };

  // User wants to correct a mistyped phone without back-navigating away.
  const handleEditPhone = () => {
    if (submittingRef.current) return;
    setOtpSent(false);
    setOtpDigits(Array(OTP_LENGTH).fill(""));
    setOtpError(false);
    setResendCountdown(0);
  };

  const buttonText = otpSent ? "تحقق من الرمز" : "إرسال رمز التحقق";
  const canSubmit = otpSent
    ? !otpDigits.includes("")
    : phoneValid;

  return (
    <SafeAreaInsetsContext.Consumer>
      {(insets) => (
        <Layout
          style={{
            ...styles.container,
            paddingTop: insets.top,
            paddingBottom: insets.bottom,
          }}
        >
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            enabled={keyboardOpen}
          >
            {/*
              Only render the back affordance when there's actually a screen
              to return to. The common entry paths (intro skip, session
              expiry, guest checkout redirect) use router.replace(), which
              leaves an empty back stack — a dead button would be worse than
              no button. Renders as an invisible spacer so the layout below
              stays fixed regardless of whether back is available.
            */}
            <View style={styles.topActionBar}>
              {router.canGoBack() ? (
                <Pressable
                  onPress={() => router.back()}
                  accessibilityRole="button"
                  accessibilityLabel="العودة"
                >
                  <Text status="primary" category="s2">
                    للخلف
                  </Text>
                </Pressable>
              ) : null}
            </View>

            <View style={styles.logoContainer}>
              <Image
                source={require("../assets/images/logo-new.png")}
                style={styles.logo}
                resizeMode="contain"
                accessibilityLabel="شنة"
              />
            </View>

            <Animated.View style={{ opacity: fadeAnim, flex: 1 }}>
              <View style={styles.titleContainer}>
                <Text category="h3" style={styles.title}>
                  {otpSent ? "أدخل رمز التحقق" : "الدخول برقم الجوال"}
                </Text>
                {otpSent ? (
                  <Text category="s1" style={styles.subTitle}>
                    أرسلنا رمزاً مكوناً من {OTP_LENGTH} أرقام إلى
                    <Text style={styles.phoneBadge}>
                      {" \u200E"}+966 {phoneDisplay}
                    </Text>
                  </Text>
                ) : (
                  <Text category="s1" style={styles.subTitle}>
                    أدخل رقم جوالك وسنرسل لك رمز تحقق
                  </Text>
                )}
              </View>

              <View style={styles.inputContainer}>
                {otpSent ? (
                  <>
                    <View style={styles.otpContainer}>
                      {otpDigits.map((digit, index) => (
                        <OtpInput
                          key={index}
                          ref={(ref) => (inputRefs.current[index] = ref)}
                          style={styles.otpInput}
                          value={digit}
                          hasError={otpError}
                          onChangeText={(text) => handleOtpChange(text, index)}
                          keyboardType="number-pad"
                          // maxLength intentionally NOT 1 — iOS/Android SMS
                          // autofill delivers the full 6-digit code into the
                          // first cell; handleOtpChange splits it across cells.
                          maxLength={OTP_LENGTH}
                          // Tapping back into a filled cell selects its value
                          // so the next keystroke replaces cleanly instead
                          // of appending (which would look like a paste).
                          selectTextOnFocus
                          accessibilityLabel={`الخانة ${index + 1} من ${OTP_LENGTH}`}
                        />
                      ))}
                    </View>

                    <View style={styles.otpHelperRow}>
                      <PressableScale
                        onPress={handleEditPhone}
                        disabled={submitting}
                        accessibilityRole="button"
                        accessibilityLabel="تعديل رقم الجوال"
                      >
                        <Text category="s2" style={styles.linkText}>
                          تعديل الرقم
                        </Text>
                      </PressableScale>

                      {resendCountdown > 0 ? (
                        <Text category="s2" style={styles.mutedText}>
                          إعادة الإرسال بعد {resendCountdown}ث
                        </Text>
                      ) : (
                        <PressableScale
                          onPress={handleSendOtp}
                          disabled={submitting}
                          accessibilityRole="button"
                          accessibilityLabel="إعادة إرسال رمز التحقق"
                        >
                          <Text category="s2" style={styles.linkText}>
                            إعادة إرسال الرمز
                          </Text>
                        </PressableScale>
                      )}
                    </View>
                  </>
                ) : (
                  <>
                    <Input
                      placeholder="5XX XXX XXX"
                      value={phoneDisplay}
                      onChangeText={handlePhoneChange}
                      keyboardType="phone-pad"
                      autoComplete="tel"
                      textContentType="telephoneNumber"
                      style={styles.input}
                      textStyle={styles.inputText}
                      accessoryLeft={() => (
                        <Text style={styles.countryCode}>+966</Text>
                      )}
                      accessoryRight={
                        phoneDigits.length > 0
                          ? () => (
                              <Pressable
                                onPress={() => setPhoneDigits("")}
                                hitSlop={10}
                                accessibilityRole="button"
                                accessibilityLabel="مسح الرقم"
                                style={styles.clearButton}
                              >
                                <Text style={styles.clearText}>✕</Text>
                              </Pressable>
                            )
                          : undefined
                      }
                      disabled={otpSent || submitting}
                      textAlign="left"
                      placeholderTextColor={theme["color-gray"]}
                      status="primary"
                      accessibilityLabel="رقم الجوال"
                    />
                    <Text category="c2" style={styles.trustText}>
                      لن نستخدم رقمك لأي شيء سوى تأكيد هويتك
                    </Text>
                  </>
                )}
              </View>
            </Animated.View>

            <BottomActionBar style={{ marginHorizontal: -16 }}>
              <PrimaryButton
                onPress={otpSent ? handleVerifyOtp : handleSendOtp}
                disabled={!canSubmit}
                loading={submitting}
                accessibilityLabel={buttonText}
              >
                {buttonText}
              </PrimaryButton>

              <Text category="c2" style={styles.termsText}>
                بتسجيل الدخول، أنت توافق على الشروط وسياسة الخصوصية
              </Text>

              <PressableScale
                onPress={() => {
                  // Bailing out of sign-in — discard any stashed returnTo so
                  // it can't fire on a later, unrelated sign-in (e.g. user
                  // re-opens auth and gets teleported to a stale /checkout).
                  setPendingReturnTo(null);
                  router.replace("/(tabs)/");
                }}
                disabled={submitting}
                style={styles.guestButton}
                accessibilityRole="button"
                accessibilityLabel="تصفح كضيف"
              >
                <Text category="s2" style={styles.guestLink}>
                  تصفح كضيف
                </Text>
              </PressableScale>
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
  topActionBar: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
    marginBottom: 8,
    // Fixed height so the rest of the screen doesn't shift when we
    // arrived via router.replace (no back available, button hidden).
    minHeight: 24,
  },
  logoContainer: {
    alignItems: "center",
    marginTop: 8,
    marginBottom: 24,
  },
  logo: {
    width: 80,
    height: 88,
  },
  titleContainer: {
    marginBottom: 32,
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
  },
  inputContainer: {
    flex: 1,
    gap: 12,
  },
  input: {
    direction: "ltr",
  },
  inputText: {
    fontFamily: "TajawalMedium",
    color: theme["color-black"],
  },
  countryCode: {
    fontFamily: "TajawalMedium",
    fontSize: 16,
    color: theme["color-black"],
  },
  clearButton: {
    paddingHorizontal: 4,
    justifyContent: "center",
  },
  clearText: {
    fontSize: 16,
    color: theme["text-body-color"],
  },
  trustText: {
    textAlign: "center",
    color: theme["text-body-color"],
    marginTop: 4,
  },
  otpContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    direction: "ltr",
  },
  otpInput: {
    textAlign: "center",
    fontSize: 18,
    fontFamily: "TajawalBold",
    color: theme["color-black"],
  },
  otpHelperRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  linkText: {
    color: theme["color-primary-500"],
    fontFamily: "TajawalMedium",
  },
  mutedText: {
    color: theme["text-body-color"],
  },
  phoneBadge: {
    fontFamily: "TajawalBold",
    writingDirection: "ltr",
    color: theme["text-heading-color"],
  },
  guestButton: {
    alignItems: "center",
    paddingVertical: 12,
  },
  guestLink: {
    color: theme["color-primary-500"],
    fontFamily: "TajawalMedium",
  },
  termsText: {
    textAlign: "center",
    color: theme["text-body-color"],
    paddingHorizontal: 24,
    marginTop: 12,
  },
});
