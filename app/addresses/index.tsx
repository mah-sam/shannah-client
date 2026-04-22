// @ts-nocheck
import { Button, Layout, Text } from "@ui-kitten/components";
import { router, useFocusEffect } from "expo-router";
import { memo, useCallback, useState } from "react";
import { FlatList, Pressable, StyleSheet, View } from "react-native";
import { SafeAreaInsetsContext } from "react-native-safe-area-context";
import { DistanceIcon, EditIcon, TrashIcon } from "../../components/Icons";
import AlertDialog from "../../components/ui/AlertDialog";
import BottomActionBar from "../../components/ui/BottomActionBar";
import { ErrorState } from "../../components/ui/ErrorState";
import { useToast } from "../../context/ToastContext";
import useAuth from "../../hooks/useAuth";
import { deleteAddress, getAddresses } from "../../services/shannahApi";
import * as theme from "../../theme.json";

export default function Index() {
  const { token } = useAuth();
  const { show: showToast } = useToast();
  const [addresses, setAddresses] = useState([]);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useFocusEffect(
    useCallback(() => {
      token &&
        (async () => {
          setLoadError(false);
          try {
            const result = await getAddresses(token);
            setAddresses(result?.data ?? []);
          } catch {
            setLoadError(true);
          }
        })();
    }, [token, reloadKey]),
  );

  const handleDeletePress = (addressId, addressLabel) => {
    setAddressToDelete({ id: addressId, label: addressLabel });
    setDeleteDialogVisible(true);
  };

  const handleConfirmDelete = async () => {
    if (!addressToDelete) return;

    setIsDeleting(true);
    let result;
    try {
      result = await deleteAddress(token, addressToDelete.id);
    } catch {
      setIsDeleting(false);
      showToast({ kind: "error", message: "تعذّر حذف العنوان، حاول مجدداً" });
      return;
    }
    setIsDeleting(false);

    if (result?.status) {
      setAddresses(addresses.filter((addr) => addr.id !== addressToDelete.id));
      setDeleteDialogVisible(false);
      setAddressToDelete(null);
      showToast({ kind: "success", message: "تم حذف العنوان" });
    } else {
      showToast({ kind: "error", message: result?.message || "تعذّر حذف العنوان" });
    }
  };

  const handleCancelDelete = () => {
    setDeleteDialogVisible(false);
    setAddressToDelete(null);
  };

  return (
    <SafeAreaInsetsContext.Consumer>
      {(insets) => (
        <Layout
          style={{
            ...styles.container,
            paddingTop: insets?.top,
            paddingBottom: insets?.bottom,
          }}
        >
          {loadError ? (
            <ErrorState
              title="تعذّر تحميل العناوين"
              subtitle="تحقق من اتصالك بالإنترنت وحاول مجدداً"
              onRetry={() => setReloadKey((k) => k + 1)}
            />
          ) : (
            <AddressesList
              items={addresses}
              onDeletePress={handleDeletePress}
            ></AddressesList>
          )}
          <BottomActionBar>
            <Button onPress={() => router.navigate("/addresses/form")}>
              <View>
                <Text category="s1" status="control">
                  إضافة عنوان جديد
                </Text>
              </View>
            </Button>
          </BottomActionBar>
          <AlertDialog
            visible={deleteDialogVisible}
            title="حذف العنوان"
            message={`هل أنت متأكد من حذف "${addressToDelete?.label}"؟`}
            confirmText="حذف"
            cancelText="إلغاء"
            isDangerous={true}
            onConfirm={handleConfirmDelete}
            onCancel={handleCancelDelete}
          />
        </Layout>
      )}
    </SafeAreaInsetsContext.Consumer>
  );
}

const AddressesList = ({ items, onDeletePress }) => {
  const ItemsList = memo(({ item }) => {
    const handleEdit = () => {
      router.navigate({
        pathname: "/addresses/form",
        params: { action: "edit", id: item.id },
      });
    };

    const handleDelete = () => {
      onDeletePress(item.id, item.label);
    };

    return (
      <View style={styles.addressCard}>
        <DistanceIcon style={styles.distanceIcon}></DistanceIcon>
        <View style={styles.addressContainer}>
          <View style={styles.addressLabelRow}>
            <Text category="s1" style={styles.addressLabel}>
              {item.label}
            </Text>
            {item.is_default ? (
              <View style={styles.defaultBadge}>
                <Text style={styles.defaultBadgeText}>افتراضي</Text>
              </View>
            ) : null}
          </View>
          <Text style={styles.addressText} numberOfLines={2}>
            {item.national_address}
          </Text>
        </View>
        <Pressable onPress={handleEdit}>
          <EditIcon style={styles.editIcon}></EditIcon>
        </Pressable>
        <Pressable onPress={handleDelete}>
          <TrashIcon style={styles.trashIcon}></TrashIcon>
        </Pressable>
      </View>
    );
  });

  const renderItem = useCallback(
    ({ item }) => <ItemsList item={item}></ItemsList>,
    [onDeletePress],
  );

  return (
    <FlatList
      data={items}
      renderItem={renderItem}
      keyExtractor={(item, index) => index}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.addressesContainer}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  addressesContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 12,
  },
  addressCard: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    height: 84,
    borderWidth: 1,
    borderColor: theme["color-gray"],
    borderRadius: 12,
    gap: 8,
  },
  distanceIcon: {
    width: 20,
    height: 20,
    tintColor: theme["text-body-color"],
  },
  addressContainer: {
    flex: 1,
    gap: 4,
  },
  addressLabel: {
    color: theme["text-heading-color"],
    textAlign: "left",
  },
  addressLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  defaultBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: theme["color-primary-25"],
    borderRadius: 10,
  },
  defaultBadgeText: {
    color: theme["color-primary-500"],
    fontFamily: "TajawalBold",
    fontSize: 11,
  },
  addressText: {
    color: theme["text-body-color"],
    lineHeight: 16,
    textAlign: "left",
  },
  editIcon: {
    width: 16,
    height: 16,
    tintColor: theme["text-body-color"],
  },
  trashIcon: {
    width: 16,
    height: 16,
    tintColor: "#B3261E",
  },
});
