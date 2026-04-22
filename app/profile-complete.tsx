// @ts-nocheck
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Input, Layout, Text } from "@ui-kitten/components";
import { router } from "expo-router";
import { deleteItemAsync } from "expo-secure-store";
import { useRef, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { SafeAreaInsetsContext } from "react-native-safe-area-context";
import BottomActionBar from "../components/ui/BottomActionBar";
import { PrimaryButton } from "../components/ui/PrimaryButton";
import { useGlobal } from "../context/GlobalContext";
import { useToast } from "../context/ToastContext";
import useAuth from "../hooks/useAuth";
import { profileComplete } from "../services/shannahApi";
import * as theme from "../theme.json";

export default function ProfileComplete() {
  const { token } = useAuth();
  const { setSignedIn, setUserData } = useGlobal();
  const { show } = useToast();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  // Ref-based guard so a same-tick double-fire (e.g. onSubmitEditing + button
  // press on the same keystroke) is blocked. State `isSubmitting` drives UI.
  const submittingRef = useRef(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const initErrors = {
    first_name: null,
    last_name: null,
    email: null,
  };

  const [errors, setErrors] = useState(initErrors);
  const lastNameRef = useRef(null);
  const emailRef = useRef(null);

  const onProfileUpdate = async () => {
    if (submittingRef.current) return;
    submittingRef.current = true;
    setIsSubmitting(true);
    // Clear prior errors so the user sees a fresh validation pass rather
    // than a stale mix of old-and-new messages during the loading state.
    setErrors(initErrors);

    let result;
    try {
      result = await profileComplete(token, {
        first_name: firstName,
        last_name: lastName,
        email: email,
      });
    } catch {
      submittingRef.current = false;
      setIsSubmitting(false);
      show({
        message: "تعذّر الاتصال بالخادم. تحقق من الإنترنت وحاول مجدداً",
        kind: "error",
      });
      return;
    }

    if (result?.errors) {
      setErrors({ ...initErrors, ...result.errors });
      submittingRef.current = false;
      setIsSubmitting(false);
      return;
    }
    if (result?.status) {
      // Hold submittingRef true through navigation so a late re-render
      // cannot fire a second submit on the already-completed profile.
      router.replace("/(tabs)");
      return;
    }
    if (result?.message) {
      show({ message: result.message, kind: "error" });
    }
    submittingRef.current = false;
    setIsSubmitting(false);
  };

  // User has a valid token but abandoned profile completion. Clear session
  // and return to the OTP entry — re-signing in is the only coherent path.
  const onAbandon = async () => {
    try {
      await deleteItemAsync("token");
      await AsyncStorage.removeItem("user");
    } catch {
      // ignore storage errors — we still want to sign the user out in UI.
    }
    setSignedIn(false);
    setUserData({});
    router.replace("/sign-in-mobile");
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
          {/*
            Not a "back" button — there's no back stack (we arrived via
            router.replace after OTP verify). This abandons the half-
            finished account: clears the token, resets context, routes
            back to OTP entry. Labeled explicitly so the user knows what
            they're triggering.
          */}
          <View style={styles.topActionBar}>
            <Pressable
              onPress={onAbandon}
              accessibilityRole="button"
              accessibilityLabel="استخدام رقم جوال مختلف"
            >
              <Text status="primary" category="s2">
                استخدم رقماً آخر
              </Text>
            </Pressable>
          </View>
          <View style={styles.formContainer}>
            <View style={styles.titleContainer}>
              <Text category="h3" style={styles.title}>
                أكمل ملفك الشخصي
              </Text>
            </View>
            <Input
              status={errors.first_name === null ? "primary" : "danger"}
              label={() => <Text style={styles.labelText}>الاسم الأول</Text>}
              textStyle={styles.inputText}
              value={firstName}
              onChangeText={(t) => setFirstName(t)}
              caption={errors.first_name === null ? "" : errors.first_name[0]}
              returnKeyType="next"
              onSubmitEditing={() => lastNameRef.current?.focus()}
              blurOnSubmit={false}
              autoCapitalize="words"
              textContentType="givenName"
              autoComplete="given-name"
              disabled={isSubmitting}
            />
            <Input
              ref={lastNameRef}
              status={errors.last_name === null ? "primary" : "danger"}
              label={() => <Text style={styles.labelText}>اسم العائلة</Text>}
              textStyle={styles.inputText}
              value={lastName}
              onChangeText={(t) => setLastName(t)}
              caption={errors.last_name === null ? "" : errors.last_name[0]}
              returnKeyType="next"
              onSubmitEditing={() => emailRef.current?.focus()}
              blurOnSubmit={false}
              autoCapitalize="words"
              textContentType="familyName"
              autoComplete="family-name"
              disabled={isSubmitting}
            />
            <Input
              ref={emailRef}
              status={errors.email === null ? "primary" : "danger"}
              inputMode="email"
              label={() => (
                <Text style={styles.labelText}>عنوان البريد الإلكتروني</Text>
              )}
              textStyle={styles.inputText}
              value={email}
              onChangeText={(t) => setEmail(t)}
              placeholder="email@email.com"
              caption={errors.email === null ? "" : errors.email[0]}
              returnKeyType="done"
              onSubmitEditing={() => onProfileUpdate()}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              textContentType="emailAddress"
              autoComplete="email"
              disabled={isSubmitting}
            />
          </View>
          <BottomActionBar>
            <PrimaryButton
              onPress={onProfileUpdate}
              disabled={isSubmitting}
              loading={isSubmitting}
              accessibilityLabel="تأكيد الملف الشخصي"
            >
              تأكيد
            </PrimaryButton>
          </BottomActionBar>
        </Layout>
      )}
    </SafeAreaInsetsContext.Consumer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topActionBar: {
    flexDirection: "row",
    marginTop: 16,
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: 16,
    gap: 16,
  },
  title: {
    textAlign: "center",
    fontFamily: "TajawalBold",
    color: theme["color-heading"],
  },
  titleContainer: {
    marginBottom: 8,
  },
  inputText: {
    color: theme["color-black"],
    fontSize: 16,
  },
  labelText: {
    color: theme["color-black"],
    lineHeight: 18,
  },
});
