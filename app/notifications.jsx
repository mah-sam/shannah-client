import { router } from "expo-router";
import { getItemAsync } from "expo-secure-store";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "../services/shannahApi";
import { Button, Text } from "@ui-kitten/components";

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifications = useCallback(async () => {
    try {
      const token = await getItemAsync("token");
      if (!token) return;

      const res = await getNotifications(token);
      setNotifications(res?.data ?? []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchNotifications();
  }, [fetchNotifications]);

  const handleTap = async (item) => {
    const token = await getItemAsync("token");
    if (token && !item.read_at) {
      await markNotificationRead(token, item.id);
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === item.id ? { ...n, read_at: new Date().toISOString() } : n,
        ),
      );
    }

    const deepLink = item.data?.deep_link;
    if (deepLink) {
      router.push(`/${deepLink}`);
    }
  };

  const handleMarkAllRead = async () => {
    const token = await getItemAsync("token");
    if (!token) return;

    await markAllNotificationsRead(token);
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, read_at: n.read_at ?? new Date().toISOString() })),
    );
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000 / 60); // minutes

    if (diff < 1) return "الآن";
    if (diff < 60) return `منذ ${diff} دقيقة`;
    if (diff < 1440) return `منذ ${Math.floor(diff / 60)} ساعة`;
    return `منذ ${Math.floor(diff / 1440)} يوم`;
  };

  const hasUnread = notifications.some((n) => !n.read_at);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => handleTap(item)}
      style={[styles.item, !item.read_at && styles.unread]}
      activeOpacity={0.7}
    >
      {!item.read_at && <View style={styles.dot} />}
      <View style={styles.itemContent}>
        <Text style={styles.title} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.body} numberOfLines={2}>
          {item.body}
        </Text>
        <Text style={styles.time}>{formatTime(item.created_at)}</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator color="#881ED3" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.heading}>الإشعارات</Text>
        {hasUnread && (
          <Button
            size="small"
            appearance="ghost"
            onPress={handleMarkAllRead}
          >
            قراءة الكل
          </Button>
        )}
      </View>

      {notifications.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.empty}>لا توجد إشعارات</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#881ED3"]}
              tintColor="#881ED3"
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#e5e7eb",
  },
  heading: {
    fontSize: 20,
    fontFamily: "TajawalBold",
    color: "#111827",
  },
  list: {
    paddingVertical: 4,
  },
  item: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#f3f4f6",
    gap: 10,
  },
  unread: {
    backgroundColor: "#faf5ff",
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#881ED3",
    marginTop: 6,
    flexShrink: 0,
  },
  itemContent: {
    flex: 1,
    gap: 3,
  },
  title: {
    fontSize: 14,
    fontFamily: "TajawalBold",
    color: "#111827",
  },
  body: {
    fontSize: 13,
    fontFamily: "Tajawal",
    color: "#6b7280",
    lineHeight: 20,
  },
  time: {
    fontSize: 11,
    fontFamily: "Tajawal",
    color: "#9ca3af",
    marginTop: 2,
  },
  empty: {
    fontSize: 15,
    fontFamily: "Tajawal",
    color: "#9ca3af",
  },
});
