// @ts-nocheck
import { Button, Input, Layout, Text } from "@ui-kitten/components";
import { router } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { SafeAreaInsetsContext } from "react-native-safe-area-context";
import BottomActionBar from "../components/ui/BottomActionBar";
import useAuth from "../hooks/useAuth";
import { profileComplete } from "../services/shannahApi";
import * as theme from "../theme.json";

export default function ProfileComplete() {
  const { token } = useAuth();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const initErrors = {
    first_name: null,
    last_name: null,
    email: null,
  };

  const [errors, setErrors] = useState(initErrors);

  const onProfileUpdate = async () => {
    setIsSubmitting(true);
    const result = await profileComplete(token, {
      first_name: firstName,
      last_name: lastName,
      email: email,
    });
    setIsSubmitting(false);

    if (result.errors) {
      setErrors({ ...initErrors, ...result.errors });
    } else if (result.status) {
      router.push("/(tabs)");
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
          <View style={styles.topActionBar}>
            <Pressable onPress={() => router.replace("/sign-in")}>
              <Text status="primary" category="s2">
                للخلف
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
            />
            <Input
              status={errors.last_name === null ? "primary" : "danger"}
              label={() => <Text style={styles.labelText}>اسم العائلة</Text>}
              textStyle={styles.inputText}
              value={lastName}
              onChangeText={(t) => setLastName(t)}
              caption={errors.last_name === null ? "" : errors.last_name[0]}
            />
            <Input
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
            />
          </View>
          <BottomActionBar>
            <Button disabled={isSubmitting} onPress={() => onProfileUpdate()}>
              <View>
                <Text category="s1" status="control">
                  تأكيد
                </Text>
              </View>
            </Button>
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
  inputText: {
    color: theme["color-black"],
    fontSize: 16,
  },
  labelText: {
    color: theme["color-black"],
    lineHeight: 18,
  },
  eyeIcon: {
    width: 24,
    height: 24,
  },
});
