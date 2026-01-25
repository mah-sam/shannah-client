import { Text } from "@ui-kitten/components";
import { useRouter } from "expo-router";
import { memo, useCallback } from "react";
import { FlatList, Image, Pressable, StyleSheet, View } from "react-native";
import * as theme from "../theme.json";
import { ClockIcon, DistanceIcon, HeartIcon, SarIcon, StarIcon } from "./Icons";

export const StoresList = ({ items, isRefreshing, setIsRefreshing }) => {
  const router = useRouter();
  const ItemsList = memo(({ item }) => {
    return (
      <Pressable
        onPress={() =>
          router.navigate({
            pathname: `/store/${item.id}`,
          })
        }
      >
        <View style={styles.storeCard}>
          <View style={styles.storeCardFavorite}>
            <Pressable onPress={null}>
              <HeartIcon style={styles.heartIcon}></HeartIcon>
            </Pressable>
          </View>
          <Image
            source={{ uri: item.cover }}
            borderRadius={12}
            width={"100%"}
            height={120}
            resizeMode="cover"
            style={styles.storeCardImage}
          ></Image>
          <View style={styles.storeCardRow}>
            <Text style={styles.storeCardTitle}>{item.name}</Text>
            <View style={styles.storeRatingContainer}>
              <StarIcon style={styles.starIcon}></StarIcon>
              <Text
                style={styles.storeCardText}
              >{`${item.rating} (${item.review_count})`}</Text>
            </View>
          </View>
          <View style={styles.storeCardRow}>
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
            >
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
              >
                <ClockIcon style={{ width: 20, height: 20 }}></ClockIcon>
                <Text style={styles.storeCardText}>{item.delivery_time}</Text>
              </View>
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
              >
                <DistanceIcon style={{ width: 20, height: 20 }}></DistanceIcon>
                <Text
                  style={styles.storeCardText}
                >{`${item.max_delivery_radius_km} كم`}</Text>
              </View>
            </View>
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
            >
              <Text
                style={styles.storeCardText}
              >{`التوصيل ${item.delivery_fee}`}</Text>
              <SarIcon style={{ width: 16, height: 16 }}></SarIcon>
            </View>
          </View>
        </View>
      </Pressable>
    );
  });

  const renderItem = useCallback(
    ({ item }) => <ItemsList item={item}></ItemsList>,
    [],
  );

  return (
    <FlatList
      data={items}
      renderItem={renderItem}
      keyExtractor={(item, index) => index}
      onRefresh={() => {
        setIsRefreshing(true);
      }}
      refreshing={isRefreshing}
      showsVerticalScrollIndicator={false}
    />
  );
};

const styles = StyleSheet.create({
  storeCard: { paddingVertical: 4, gap: 6, alignItems: "center" },
  storeCardFavorite: {
    position: "absolute",
    backgroundColor: theme["color-basic-100"],
    borderRadius: "50%",
    top: 12,
    right: 12,
    zIndex: 1,
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  heartIcon: { width: 18, height: 16 },
  storeCardImage: { width: "100%", height: 120, borderRadius: 12 },
  storeCardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  storeCardTitle: {
    fontFamily: "TajawalBold",
    fontSize: 16,
    color: "#000000",
  },
  storeRatingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  storeCardText: {
    fontFamily: "TajawalMedium",
    fontSize: 12,
    color: theme["color-black"],
  },
  starIcon: {
    width: 16,
    height: 16,
  },
});
