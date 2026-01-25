import { Icon, Text } from "@ui-kitten/components";
import { useRouter } from "expo-router";
import { memo, useCallback } from "react";
import { FlatList, Image, Pressable, StyleSheet, View } from "react-native";
import * as theme from "../theme.json";

export const PlusIcon = (props) => (
  <Icon {...props} name="plus" pack="assets" />
);

export const ProductsList = ({ store, items }) => {
  const router = useRouter();
  const ItemsList = memo(({ item }) => {
    return (
      <Pressable
        onPress={() =>
          router.navigate({
            pathname: "/product",
            params: {
              storeId: store.id,
              productId: item.id,
            },
          })
        }
      >
        <View style={styles.productCard}>
          <View style={styles.productDetails}>
            <View style={styles.productNameAndPrice}>
              <Text category="s1" style={styles.productNameAndPriceText}>
                {item.name}
              </Text>
              <Text category="s2" style={styles.productNameAndPriceText}>
                {item.price}
              </Text>
            </View>
            <Text style={styles.productDescription}>{item.description}</Text>
          </View>
          <View style={styles.productImageContainer}>
            <Image
              source={{ uri: item.image }}
              resizeMode="cover"
              style={styles.productImage}
            ></Image>
            <View style={styles.addButton}>
              <PlusIcon style={styles.plusIcon}></PlusIcon>
            </View>
          </View>
        </View>
      </Pressable>
    );
  });

  const renderItem = useCallback(
    ({ item }) => <ItemsList item={item}></ItemsList>,
    []
  );

  return (
    <FlatList
      data={items}
      renderItem={renderItem}
      keyExtractor={(item, index) => index}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ gap: 12 }}
    />
  );
};

const styles = StyleSheet.create({
  productCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 8,
    gap: 16,
    width: "100%",
    height: 90,
    borderWidth: 1,
    borderColor: theme["color-primary-25"],
    borderRadius: 8,
  },
  productDetails: { gap: 8 },
  productNameAndPrice: { gap: 2 },
  productNameAndPriceText: { color: theme["color-black"] },
  productDescription: { color: theme["text-body-color"] },
  productImageContainer: {
    width: 72,
    height: 72,
    backgroundColor: "#E5E7EB",
    borderRadius: 8,
  },
  productImage: { width: 72, height: 72, borderRadius: 8 },
  addButton: {
    position: "absolute",
    width: 12,
    height: 12,
    right: 4,
    bottom: 4,
    backgroundColor: "#ffffff",
    borderRadius: "50%",
    justifyContent: "center",
    alignItems: "center",
  },
  plusIcon: { width: 12, height: 12 },
});
