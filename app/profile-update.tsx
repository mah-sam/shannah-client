// @ts-nocheck
import { Button, Input, Layout, Text } from "@ui-kitten/components";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { SafeAreaInsetsContext } from "react-native-safe-area-context";
import { EyeIcon, EyeOffIcon } from "../components/Icons";
import { useToast } from "../context/ToastContext";
import useAuth from "../hooks/useAuth";
import { getUserInfo, updateUserInfo } from "../services/shannahApi";
import * as theme from "../theme.json";

export default function ProfileUpdate() {
  const { token } = useAuth();
  const { show: showToast } = useToast();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordConf, setPasswordConf] = useState("");
  const [newPasswordSecureText, setNewPasswordSecureText] = useState(true);
  const [passwordConfSecureText, setPasswordConfSecureText] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const initErrors = {
    first_name: null,
    last_name: null,
    email: null,
    password: null,
  };

  const [errors, setErrors] = useState(initErrors);

  useEffect(() => {
    (async () => {
      if (token !== null) {
        try {
          const result = await getUserInfo(token);
          setFirstName(result?.data?.first_name ?? "");
          setLastName(result?.data?.last_name ?? "");
          setEmail(result?.data?.email ?? "");
        } catch {
          showToast({ kind: "error", message: "تعذّر تحميل بيانات الحساب" });
        }
      }
    })();
  }, [token, showToast]);

  const SecureTextToggle = ({ target }) => {
    return (target === "password" && newPasswordSecureText) ||
      (target === "passwordConf" && passwordConfSecureText) ? (
      <Pressable
        onPress={() =>
          target === "password"
            ? setNewPasswordSecureText(false)
            : setPasswordConfSecureText(false)
        }
      >
        <EyeIcon style={styles.eyeIcon}></EyeIcon>
      </Pressable>
    ) : (
      <Pressable
        onPress={() =>
          target === "password"
            ? setNewPasswordSecureText(true)
            : setPasswordConfSecureText(true)
        }
      >
        <EyeOffIcon style={styles.eyeIcon}></EyeOffIcon>
      </Pressable>
    );
  };

  const onProfileUpdate = async () => {
    setIsSubmitting(true);
    let result;
    try {
      result = await updateUserInfo(token, {
        first_name: firstName,
        last_name: lastName,
        email: email,
        password: newPassword === "" ? undefined : newPassword,
        password_confirmation: passwordConf === "" ? undefined : passwordConf,
      });
    } catch {
      setIsSubmitting(false);
      showToast({ kind: "error", message: "تعذّر حفظ التغييرات، حاول مجدداً" });
      return;
    }
    setIsSubmitting(false);

    if (result?.errors) {
      setErrors({ ...initErrors, ...result.errors });
    } else if (result?.status) {
      showToast({ kind: "success", message: "تم حفظ التغييرات" });
      router.navigate("/(tabs)/profile");
    } else {
      showToast({ kind: "error", message: result?.message || "تعذّر حفظ التغييرات" });
    }
  };

  return (
    <SafeAreaInsetsContext.Consumer>
      {(insets) => (
        <Layout
          style={{
            ...styles.container,
            paddingTop: insets?.top,
          }}
        >
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
          <Input
            status={errors.password === null ? "primary" : "danger"}
            label={() => <Text style={styles.labelText}>كلمة المرور</Text>}
            textStyle={styles.inputText}
            value={newPassword}
            onChangeText={(t) => setNewPassword(t)}
            secureTextEntry={newPasswordSecureText}
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
              <SecureTextToggle target={"passwordConf"}></SecureTextToggle>
            )}
          />
          <Button disabled={isSubmitting} onPress={() => onProfileUpdate()}>
            <View>
              <Text category="s1" status="control">
                حفظ التغييرات
              </Text>
            </View>
          </Button>
        </Layout>
      )}
    </SafeAreaInsetsContext.Consumer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
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
});
