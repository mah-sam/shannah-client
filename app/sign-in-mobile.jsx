import AsyncStorage from "@react-native-async-storage/async-storage";
import { Button, Input, Layout, Text } from "@ui-kitten/components";
import { router } from "expo-router";
import { setItemAsync } from "expo-secure-store";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaInsetsContext } from "react-native-safe-area-context";
import BottomActionBar from "../components/ui/BottomActionBar";
import { OtpInput } from "../components/ui/OtpInput";
import { useGlobal } from "../context/GlobalContext";
import useKeyboard from "../hooks/useKeyboard";
import { sendOtp, verifyOtp } from "../services/shannahApi";
import * as theme from "../theme.json";

export default function SignInMobile() {
  const { setSignedIn, setUserData } = useGlobal();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef(Array(6).fill(null));
  const buttonText = otpSent ? "التحقق من كلمة المرور" : "إرسال رمز التحقق";
  const { keyboardOpen } = useKeyboard();

  useEffect(() => {
    if (otpSent && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [otpSent]);

  useEffect(() => {
    !otpDigits.includes("") && handleVerifyOtp();
  }, [otpDigits]);

  const handleSendOtp = async () => {
    if (!phoneNumber.trim()) {
      Alert.alert("خطأ", "يرجى إدخال رقم الجوال");
      return;
    }
    try {
      const data = await sendOtp(phoneNumber);
      if (data?.status === true) {
        setOtpSent(true);
      } else if (data?.errors !== undefined) {
        Alert.alert("خطأ", data.message);
      } else {
        Alert.alert("خطأ", "فشل في إرسال الرمز");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleVerifyOtp = async () => {
    const enteredOtp = otpDigits.join("");
    if (enteredOtp.length !== 6) {
      Alert.alert("خطأ", "يرجى إدخال رمز التحقق كاملاً");
      return;
    }

    const data = await verifyOtp(phoneNumber, enteredOtp);
    if (data?.status !== true) {
      Alert.alert("خطأ", data.message);
      return;
    }

    await setItemAsync("token", data.token);
    await AsyncStorage.setItem("user", JSON.stringify(data.user));
    setSignedIn(true);
    setUserData(data.user);

    data.next_step === "complete_profile"
      ? router.replace("/profile-complete")
      : router.replace("/(tabs)/");
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
            <View style={styles.topActionBar}>
              <Pressable onPress={() => router.back()}>
                <Text status="primary" category="s2">
                  للخلف
                </Text>
              </Pressable>
            </View>
            <View style={styles.titleContainer}>
              <Text category="h3" style={styles.title}>
                {otpSent ? "تأكيد كلمة المرور للمتابعة" : "الدخول برقم الجوال"}
              </Text>
              {otpSent ? (
                <Text>
                  <Text category="s1" style={styles.subTitle}>
                    تم إرسال كلمة مرور لمرة واحدة مكونة من 6 أرقام إلى رقم جوالك
                  </Text>
                  <Text style={styles.phoneNumber}>
                    {" \u200E"}+966{phoneNumber}
                  </Text>
                  <Text category="s1" style={styles.subTitle}>
                    . قم بإدخال كلمة المرور للمتابعة
                  </Text>
                </Text>
              ) : (
                <Text category="s1" style={styles.subTitle}>
                  للمتابعة أدخل رقم الجوال الخاص بك
                </Text>
              )}
            </View>
            <View style={styles.inputContainer}>
              {otpSent ? (
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
              ) : (
                <Input
                  placeholder="_ _ _ _ _ _ _ _ _ _"
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  keyboardType="phone-pad"
                  style={styles.input}
                  textStyle={styles.inputText}
                  accessoryLeft={() => (
                    <Text style={styles.countryCode}>+966</Text>
                  )}
                  disabled={otpSent}
                  textAlign="left"
                  placeholderTextColor={theme["color-gray"]}
                  status="primary"
                />
              )}
            </View>
            <BottomActionBar style={{ marginHorizontal: -16 }}>
              <Button
                onPress={otpSent ? handleVerifyOtp : handleSendOtp}
                disabled={
                  (phoneNumber === "" && !otpSent) ||
                  (otpSent && otpDigits.includes(""))
                }
              >
                <View>
                  <Text category="s1" status="control">
                    {buttonText}
                  </Text>
                </View>
              </Button>
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
    marginTop: 16,
    marginBottom: 32,
  },
  titleContainer: {
    marginBottom: 32,
    gap: 8,
  },
  title: {
    textAlign: "center",
    fontFamily: "TajawalBold",
    color: theme["color-heading"],
  },
  subTitle: {
    textAlign: "center",
    color: theme["text-body-color"],
  },
  inputContainer: {
    flex: 1,
    gap: 16,
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
  phoneNumber: {
    fontFamily: "TajawalBold",
    writingDirection: "ltr",
  },
});
