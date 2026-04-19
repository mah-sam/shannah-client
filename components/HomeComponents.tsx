// @ts-nocheck
import { Text } from "@ui-kitten/components";
import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { FlatList, Pressable, StyleSheet, View } from "react-native";
import { PressableScale } from "./ui/PressableScale";
import { ShannahImage } from "./ui/ShannahImage";
import { useGlobal } from "../context/GlobalContext";
import { useToast } from "../context/ToastContext";
import useAuth from "../hooks/useAuth";
import { useDeliveryReference } from "../hooks/useDeliveryReference";
import { toggleFavorite } from "../services/shannahApi";
import * as theme from "../theme.json";
import { formatSAR } from "../utils/currency";
import { formatDistanceKm, haversineKm } from "../utils/distance";
import { computeEtaRange, formatEtaRange } from "../utils/eta";
import * as haptics from "../utils/haptics";
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
  const toast = useToast();
  const [isFavorite, setIsFavorite] = useState(store.is_favorite);
  const reference = useDeliveryReference();
  const distanceKm = reference && store?.latitude != null && store?.longitude != null
    ? haversineKm(reference, { latitude: store.latitude, longitude: store.longitude })
    : null;
  const etaRange = computeEtaRange(store?.base_prep_time_minutes, distanceKm);
  const etaLabel = formatEtaRange(etaRange) || store?.delivery_time || "";
  const distanceLabel = distanceKm != null ? formatDistanceKm(distanceKm) : "";
  const outOfRange = distanceKm != null && store?.max_delivery_radius_km != null
    && distanceKm > store.max_delivery_radius_km;

  useEffect(() => {
    setIsFavorite(store.is_favorite);
  }, [store.is_favorite]);

  const handleToggleFavorite = async () => {
    if (!token) return;
    haptics.tapSoft();
    try {
      const result = await toggleFavorite(token, "store", store.id);
      setIsFavorite(result.favorited);
      if (onFavoriteToggle) {
        onFavoriteToggle(store.id, result.favorited);
      }
      toast.show({
        message: result.favorited
          ? "تمت الإضافة للمفضلة"
          : "أُزيل من المفضلة",
        kind: "success",
      });
    } catch {
      toast.show({ message: "تعذّر تحديث المفضلة", kind: "error" });
    }
  };

  return (
    <PressableScale
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
        <ShannahImage
          variant="store_cover"
          source={{ uri: store.cover }}
          style={styles.storeCardImage}
        />
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
            {etaLabel ? (
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
              >
                <ClockIcon style={{ width: 20, height: 20 }}></ClockIcon>
                <Text style={styles.storeCardText}>{etaLabel}</Text>
              </View>
            ) : null}
            {distanceLabel ? (
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
              >
                <DistanceIcon style={{ width: 20, height: 20 }}></DistanceIcon>
                <Text style={styles.storeCardText}>{distanceLabel}</Text>
              </View>
            ) : null}
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            <Text
              style={styles.storeCardText}
            >{`التوصيل ${formatSAR(store.delivery_fee)}`}</Text>
            <SarIcon style={{ width: 16, height: 16 }}></SarIcon>
          </View>
        </View>
        {outOfRange ? (
          <View style={styles.outOfRangeBadge}>
            <Text style={styles.outOfRangeText}>خارج نطاق التوصيل</Text>
          </View>
        ) : null}
      </View>
    </PressableScale>
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
  const toast = useToast();
  const [isFavorite, setIsFavorite] = useState(item.is_favorite);
  const reference = useDeliveryReference();
  const distanceKm = reference && item?.latitude != null && item?.longitude != null
    ? haversineKm(reference, { latitude: item.latitude, longitude: item.longitude })
    : null;
  const etaRange = computeEtaRange(item?.base_prep_time_minutes, distanceKm);
  const etaLabel = formatEtaRange(etaRange) || item?.delivery_time || "";
  const distanceLabel = distanceKm != null ? formatDistanceKm(distanceKm) : "";
  const outOfRange = distanceKm != null && item?.max_delivery_radius_km != null
    && distanceKm > item.max_delivery_radius_km;

  useEffect(() => {
    setIsFavorite(item.is_favorite);
  }, [item.is_favorite]);

  const handleToggleFavorite = async () => {
    if (!token) return;
    haptics.tapSoft();
    try {
      const result = await toggleFavorite(token, "store", item.id);
      setIsFavorite(result.favorited);
      if (onFavoriteToggle) {
        onFavoriteToggle(item.id, result.favorited);
      }
      if (!showAnimatedFavoriteButton) {
        setRefreshFavorites(true);
      }
      toast.show({
        message: result.favorited
          ? "تمت الإضافة للمفضلة"
          : "أُزيل من المفضلة",
        kind: "success",
      });
    } catch {
      toast.show({ message: "تعذّر تحديث المفضلة", kind: "error" });
    }
  };

  return (
    <PressableScale
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
              <Pressable onPress={() => handleToggleFavorite()} hitSlop={8}>
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
        <ShannahImage
          variant="store_cover"
          source={{ uri: item.cover }}
          style={styles.storeCardImage}
        />
        <View style={styles.storeCardRow}>
          <Text style={styles.storeCardTitle}>{item.name}</Text>
          <View style={styles.storeRatingContainer}>
            <StarIcon style={styles.starIcon}></StarIcon>
            <Text
              style={styles.storeCardText}
            >{`${item.rating} (${item.review_count})`}</Text>
          </View>
        </View>
        {(item.area || item.city) && (
          <View style={styles.locationRow}>
            <Text style={styles.locationText}>
              {[item.area, item.city].filter(Boolean).join("، ")}
            </Text>
          </View>
        )}
        <View style={styles.storeCardRow}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            {etaLabel ? (
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
              >
                <ClockIcon style={{ width: 20, height: 20 }}></ClockIcon>
                <Text style={styles.storeCardText}>{etaLabel}</Text>
              </View>
            ) : null}
            {distanceLabel ? (
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
              >
                <DistanceIcon style={{ width: 20, height: 20 }}></DistanceIcon>
                <Text style={styles.storeCardText}>{distanceLabel}</Text>
              </View>
            ) : null}
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            <Text
              style={styles.storeCardText}
            >{`التوصيل ${formatSAR(item.delivery_fee)}`}</Text>
            <SarIcon style={{ width: 16, height: 16 }}></SarIcon>
          </View>
        </View>
        {outOfRange ? (
          <View style={styles.outOfRangeBadge}>
            <Text style={styles.outOfRangeText}>خارج نطاق التوصيل</Text>
          </View>
        ) : null}
      </View>
    </PressableScale>
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
  locationRow: {
    width: "100%",
    flexDirection: "row",
  },
  locationText: {
    fontFamily: "TajawalMedium",
    fontSize: 12,
    color: theme["text-body-color"],
    textAlign: "left",
  },
  outOfRangeBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: "#FEE2E2",
    borderRadius: 8,
  },
  outOfRangeText: {
    fontFamily: "TajawalMedium",
    fontSize: 11,
    color: "#B91C1C",
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
