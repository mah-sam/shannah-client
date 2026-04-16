// @ts-nocheck
import { Text } from "@ui-kitten/components";
import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { FlatList, Image, Pressable, StyleSheet, View } from "react-native";
import { useGlobal } from "../context/GlobalContext";
import useAuth from "../hooks/useAuth";
import { toggleFavorite } from "../services/shannahApi";
import * as theme from "../theme.json";
import { shareStore } from "../utils/shareStore";
import {
  ClockIcon,
  DistanceIcon,
  HeartFilledIcon,
  HeartIcon,
  SarIcon,
  ShareIcon,
  StarIcon,
} from "./Icons";
import { AnimatedFavoriteButton } from "./ui/AnimatedFavoriteButton";

export const StoresList = ({ items, onFavoriteToggle }) => {
  const renderItem = useCallback(
    ({ item }) => <StoreCard item={item} onFavoriteToggle={onFavoriteToggle} />,
    [onFavoriteToggle],
  );

  return (
    <FlatList
      data={items}
      renderItem={renderItem}
      keyExtractor={(item) => String(item.id)}
      showsVerticalScrollIndicator={false}
      scrollEnabled={false}
      contentContainerStyle={{ gap: 12 }}
    />
  );
};

export const OrderAgainCard = ({ store, onFavoriteToggle }) => {
  const { token } = useAuth();
  const [isFavorite, setIsFavorite] = useState(store.is_favorite);

  useEffect(() => {
    setIsFavorite(store.is_favorite);
  }, [store.is_favorite]);

  const handleToggleFavorite = async () => {
    if (!token) return;
    const result = await toggleFavorite(token, "store", store.id);
    setIsFavorite(result.favorited);
    if (onFavoriteToggle) {
      onFavoriteToggle(store.id, result.favorited);
    }
  };

  return (
    <Pressable
      onPress={() =>
        router.navigate({
          pathname: `/store/${store.id}`,
        })
      }
    >
      <View style={styles.orderAgainCard}>
        <View style={styles.storeCardFavorite}>
          <AnimatedFavoriteButton
            isFavorite={isFavorite}
            onToggle={handleToggleFavorite}
            buttonStyle={styles.heartButtonContainer}
            iconStyle={isFavorite ? styles.heartFilledIcon : styles.heartIcon}
            backgroundColor={theme["color-basic-100"]}
          />
        </View>
        <Image
          source={{ uri: store.cover }}
          borderRadius={12}
          width={"100%"}
          height={120}
          resizeMode="cover"
          style={styles.storeCardImage}
        ></Image>
        <View style={styles.storeCardRow}>
          <Text style={styles.storeCardTitle}>{store.name}</Text>
          <View style={styles.storeRatingContainer}>
            <StarIcon style={styles.starIcon}></StarIcon>
            <Text
              style={styles.storeCardText}
            >{`${store.rating} (${store.review_count})`}</Text>
          </View>
        </View>
        <View style={styles.storeCardRow}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
            >
              <ClockIcon style={{ width: 20, height: 20 }}></ClockIcon>
              <Text style={styles.storeCardText}>{store.delivery_time}</Text>
            </View>
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
            >
              <DistanceIcon style={{ width: 20, height: 20 }}></DistanceIcon>
              <Text
                style={styles.storeCardText}
              >{`${store.max_delivery_radius_km} كم`}</Text>
            </View>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            <Text
              style={styles.storeCardText}
            >{`التوصيل ${store.delivery_fee}`}</Text>
            <SarIcon style={{ width: 16, height: 16 }}></SarIcon>
          </View>
        </View>
      </View>
    </Pressable>
  );
};

export const StoreCard = ({
  item,
  showAnimatedFavoriteButton = true,
  setRefreshFavorites,
  onFavoriteToggle,
}) => {
  const { signedIn } = useGlobal();
  const { token } = useAuth();
  const [isFavorite, setIsFavorite] = useState(item.is_favorite);

  useEffect(() => {
    setIsFavorite(item.is_favorite);
  }, [item.is_favorite]);

  const handleToggleFavorite = async () => {
    if (!token) return;
    const result = await toggleFavorite(token, "store", item.id);
    setIsFavorite(result.favorited);
    if (onFavoriteToggle) {
      onFavoriteToggle(item.id, result.favorited);
    }
    if (!showAnimatedFavoriteButton) {
      setRefreshFavorites(true);
    }
  };

  return (
    <Pressable
      onPress={() =>
        router.navigate({
          pathname: `/store/${item.id}`,
        })
      }
    >
      <View style={styles.storeCard}>
        {signedIn && (
          <View style={styles.storeCardFavorite}>
            {showAnimatedFavoriteButton ? (
              <AnimatedFavoriteButton
                isFavorite={isFavorite}
                onToggle={handleToggleFavorite}
                buttonStyle={styles.heartButtonContainer}
                iconStyle={
                  isFavorite ? styles.heartFilledIcon : styles.heartIcon
                }
                backgroundColor={theme["color-basic-100"]}
              />
            ) : (
              <Pressable onPress={() => handleToggleFavorite()}>
                {isFavorite ? (
                  <HeartFilledIcon
                    style={styles.heartFilledIcon}
                  ></HeartFilledIcon>
                ) : (
                  <HeartIcon style={styles.heartIcon}></HeartIcon>
                )}
              </Pressable>
            )}
          </View>
        )}
        <View style={styles.storeCardShare}>
          <Pressable
            onPress={() => shareStore(item)}
            hitSlop={8}
            style={({ pressed }) => [
              styles.shareButtonContainer,
              pressed && styles.shareButtonPressed,
            ]}
          >
            <ShareIcon style={styles.shareIcon}></ShareIcon>
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
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
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
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            <Text
              style={styles.storeCardText}
            >{`التوصيل ${item.delivery_fee}`}</Text>
            <SarIcon style={{ width: 16, height: 16 }}></SarIcon>
          </View>
        </View>
      </View>
    </Pressable>
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
  storeCardShare: {
    position: "absolute",
    backgroundColor: theme["color-basic-100"],
    borderRadius: "50%",
    top: 12,
    left: 12,
    zIndex: 1,
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  heartIcon: { width: 20, height: 20 },
  shareIcon: { width: 20, height: 20 },
  shareButtonContainer: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  shareButtonPressed: {
    opacity: 0.6,
  },
  heartFilledIcon: {
    width: 20,
    height: 20,
    tintColor: theme["color-primary-500"],
  },
  storeCardImage: { width: "100%", height: 120, borderRadius: 12 },
  storeCardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    flexWrap: "wrap",
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
  orderAgainCard: {
    width: 194,
    gap: 4,
  },
  heartButtonContainer: {
    width: 24,
    height: 24,
    borderRadius: "50%",
    justifyContent: "center",
    alignItems: "center",
  },
});
