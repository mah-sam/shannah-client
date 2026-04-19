// @ts-nocheck
import { Button, Layout, Radio, Text } from "@ui-kitten/components";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { FlatList, Pressable, StyleSheet, View } from "react-native";
import { SafeAreaInsetsContext } from "react-native-safe-area-context";
import { DistanceIcon, EditIcon } from "../../components/Icons";
import BottomActionBar from "../../components/ui/BottomActionBar";
import { useGlobal } from "../../context/GlobalContext";
import { useToast } from "../../context/ToastContext";
import useAuth from "../../hooks/useAuth";
import { getAddresses } from "../../services/shannahApi";
import * as theme from "../../theme.json";

export default function Select() {
  const { setDeliveryAddress } = useGlobal();
  const { token } = useAuth();
  const { show: showToast } = useToast();
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);

  useFocusEffect(
    useCallback(() => {
      token &&
        (async () => {
          try {
            const result = await getAddresses(token);
            setAddresses(result?.data ?? []);
          } catch {
            showToast({ kind: "error", message: "تعذّر تحميل العناوين" });
          }
        })();
    }, [token, showToast]),
  );

  const onConfirmAddress = () => {
    const selectedAddress = addresses.find(
      (address) => address.id === selectedAddressId,
    );
    setDeliveryAddress(selectedAddress);
    router.back();
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
          <AddressesList
            items={addresses}
            selectedAddressId={selectedAddressId}
            setSelectedAddressId={setSelectedAddressId}
          ></AddressesList>
          <Button
            appearance="ghost"
            onPress={() => router.push("/addresses/form")}
          >
            <View>
              <Text category="s1" status="primary">
                إضافة عنوان جديد
              </Text>
            </View>
          </Button>
          <BottomActionBar>
            <Button
              onPress={() => onConfirmAddress()}
              disabled={selectedAddressId === null}
            >
              <View>
                <Text category="s1" status="control">
                  تأكيد العنوان
                </Text>
              </View>
            </Button>
          </BottomActionBar>
        </Layout>
      )}
    </SafeAreaInsetsContext.Consumer>
  );
}

const AddressesList = ({ items, selectedAddressId, setSelectedAddressId }) => {
  const ItemsList = ({ item }) => {
    const handleEdit = () => {
      router.navigate({
        pathname: "/addresses/form",
        params: { action: "edit", id: item.id },
      });
    };

    return (
      <Pressable onPress={() => setSelectedAddressId(item.id)}>
        <View style={styles.addressCardContainer}>
          <Radio
            checked={selectedAddressId === item.id}
            onChange={() => setSelectedAddressId(item.id)}
          ></Radio>
          <View style={styles.addressCard}>
            <DistanceIcon style={styles.distanceIcon}></DistanceIcon>
            <View style={styles.addressContainer}>
              <Text category="s1" style={styles.addressLabel}>
                {item.label}
              </Text>
              <Text style={styles.addressText} numberOfLines={2}>
                {item.national_address}
              </Text>
            </View>
            <Pressable onPress={handleEdit}>
              <EditIcon style={styles.editIcon}></EditIcon>
            </Pressable>
          </View>
        </View>
      </Pressable>
    );
  };

  const renderItem = useCallback(
    ({ item }) => <ItemsList item={item}></ItemsList>,
    [selectedAddressId],
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
    gap: 12,
  },
  addressesContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 12,
  },
  addressCardContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  addressCard: {
    flex: 1,
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
});
