// @ts-nocheck
import { Button, Divider, Layout, Text, Toggle } from "@ui-kitten/components";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { SafeAreaInsetsContext } from "react-native-safe-area-context";
import {
  Bell,
  CreditCard,
  FavoriteOutline,
  Globe,
  HelpCircle,
  HistoryRounded,
  LocationSolid,
  LogOut,
} from "../../components/Icons";
import AlertDialog from "../../components/ui/AlertDialog";
import { useGlobal } from "../../context/GlobalContext";
import useAuth from "../../hooks/useAuth";
import { getUserInfo } from "../../services/shannahApi";
import * as theme from "../../theme.json";

const Profile = () => {
  const { token } = useAuth();
  const { signOut } = useGlobal();
  const [user, setUser] = useState({});
  const [showSignOutDialog, setShowSignOutDialog] = useState(false);

  useEffect(() => {
    (async () => {
      if (token !== null) {
        try {
          const result = await getUserInfo(token);
          setUser(result?.data ?? {});
        } catch {
          // Keep whatever cached user data we have; the 401 interceptor handles
          // session expiry. Other failures leave the header showing placeholders.
        }
      }
    })();
  }, [token]);

  return (
    <SafeAreaInsetsContext.Consumer>
      {(insets) => (
        <Layout
          style={{
            ...styles.container,
            paddingTop: insets?.top,
          }}
        >
          <View style={styles.profileContainer}>
            <View style={styles.topSection}>
              <Text category="h3" style={{ textAlign: "left" }}>
                الملف الشخصي
              </Text>
              <View style={styles.showProfileContainer}>
                <View style={styles.nameAndPhoneContainer}>
                  <Text
                    category="h3"
                    style={styles.name}
                  >{`${user?.first_name} ${user?.last_name}`}</Text>
                  <Text category="s1" style={styles.phone}>
                    {user?.phone}
                  </Text>
                </View>
                <Button
                  appearance="outline"
                  size="tiny"
                  style={styles.profileButton}
                  onPress={() => router.navigate("/profile-update")}
                >
                  <View>
                    <Text status="primary">تعديل الملف الشخصي</Text>
                  </View>
                </Button>
              </View>
            </View>

            <Divider></Divider>

            <View style={styles.buttonsContainer}>
              <Pressable
                style={styles.button}
                onPress={() => router.navigate("/orders")}
              >
                <HistoryRounded style={styles.buttonIcon}></HistoryRounded>
                <Text style={styles.buttonText}>طلباتي</Text>
              </Pressable>
              <Pressable
                style={styles.button}
                onPress={() => router.navigate("/favorite")}
              >
                <FavoriteOutline style={styles.buttonIcon}></FavoriteOutline>
                <Text style={styles.buttonText}>المفضلة</Text>
              </Pressable>
              <Pressable
                style={styles.button}
                onPress={() => router.navigate("/addresses/")}
              >
                <LocationSolid style={styles.buttonIcon}></LocationSolid>
                <Text style={styles.buttonText}>العنواين</Text>
              </Pressable>
            </View>

            <View>
              <View style={styles.menuItem}>
                <CreditCard style={styles.menuItemIcon}></CreditCard>
                <Text style={styles.menuItemText}>المدفوعات</Text>
              </View>
              <Pressable onPress={() => router.push("/notifications")} style={styles.menuItem}>
                <Bell style={styles.menuItemIcon}></Bell>
                <Text style={styles.menuItemText}>الإشعارات</Text>
              </Pressable>
              <View style={styles.menuItem}>
                <HelpCircle style={styles.menuItemIcon}></HelpCircle>
                <Text style={styles.menuItemText}>مركز المساعدة</Text>
              </View>
              <View style={styles.menuItem}>
                <HelpCircle style={styles.menuItemIcon}></HelpCircle>
                <Text style={styles.menuItemText}>الشروط والسياسات</Text>
              </View>
              <View style={styles.languageMenuItem}>
                <View style={styles.menuItem}>
                  <Globe style={styles.menuItemIcon}></Globe>
                  <Text style={styles.menuItemText}>اللغة</Text>
                </View>
                <Toggle status="primary" checked={true} disabled={true}>
                  العربية
                </Toggle>
              </View>
            </View>

            <Button
              appearance="outline"
              status="danger"
              accessoryLeft={<LogOut></LogOut>}
              style={styles.signOutButton}
              onPress={() => setShowSignOutDialog(true)}
            >
              <View>
                <Text category="s1" style={styles.signOutButtonText}>
                  تسجيل الخروج
                </Text>
              </View>
            </Button>
          </View>
          <AlertDialog
            visible={showSignOutDialog}
            title="تسجيل الخروج"
            message="هل تريد تسجيل الخروج من حسابك؟"
            confirmText="تسجيل الخروج"
            cancelText="إلغاء"
            isDangerous={true}
            onCancel={() => setShowSignOutDialog(false)}
            onConfirm={async () => {
              setShowSignOutDialog(false);
              await signOut();
            }}
          />
        </Layout>
      )}
    </SafeAreaInsetsContext.Consumer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  profileContainer: {
    gap: 16,
  },
  topSection: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 12,
  },
  showProfileContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  nameAndPhoneContainer: {
    gap: 8,
  },
  name: {
    color: theme["text-heading-color"],
  },
  phone: {
    color: theme["color-black"],
    direction: "ltr",
  },
  profileButton: {
    alignSelf: "flex-start",
  },
  buttonsContainer: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
  },
  button: {
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 4,
    width: 110,
    height: 84,
    borderWidth: 1,
    borderColor: theme["color-gray"],
    borderRadius: 12,
  },
  buttonIcon: {
    width: 48,
    height: 48,
  },
  buttonText: {
    lineHeight: 16,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    height: 48,
    paddingHorizontal: 16,
    gap: 16,
  },
  menuItemIcon: {
    width: 24,
    height: 24,
  },
  menuItemText: {
    color: "#111827",
  },
  languageMenuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  signOutButton: { marginHorizontal: 9, marginTop: 16 },
  signOutButtonText: {
    color: theme["color-red"],
  },
});

export default Profile;
