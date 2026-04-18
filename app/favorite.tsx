// @ts-nocheck
import { Button, Layout, Text } from "@ui-kitten/components";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaInsetsContext } from "react-native-safe-area-context";
import { StoreCard } from "../components/HomeComponents";
import { HeartFilledIcon } from "../components/Icons";
import { EmptyState } from "../components/ui/EmptyState";
import { IMAGE_BLURHASH, IMAGE_TRANSITION_MS } from "../constants/images";
import useAuth from "../hooks/useAuth";
import { getFavorites, toggleFavorite } from "../services/shannahApi";
import * as theme from "../theme.json";

export default function Favorite() {
  const { token } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [refresh, setRefresh] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (token || refresh) &&
      (async () => {
        setLoading(true);
        const result = await getFavorites(token);
        setFavorites(result.data);
        setRefresh(false);
        setLoading(false);
      })();
  }, [token, refresh]);

  const hasFavorites =
    (favorites?.stores?.length ?? 0) > 0 ||
    (favorites?.meals?.length ?? 0) > 0;

  const handleToggleFavorite = async (type, id) => {
    await toggleFavorite(token, type, id);
    setRefresh(true);
  };

  const ProductCard = ({ product }) => {
    return (
      <View style={styles.productCard}>
        <View style={styles.productContainer}>
          <View style={styles.product}>
            <Image
              source={{ uri: product.image }}
              contentFit="cover"
              placeholder={{ blurhash: IMAGE_BLURHASH }}
              transition={IMAGE_TRANSITION_MS}
              style={styles.productImage}
            />
            <View style={styles.productDetails}>
              <Text category="s2">{product.store.name}</Text>
              <Text>{product.name}</Text>
            </View>
          </View>
          <Pressable
            onPress={() => handleToggleFavorite("product", product.id)}
          >
            <HeartFilledIcon style={styles.heartFilledIcon}></HeartFilledIcon>
          </Pressable>
        </View>
        <Button
          onPress={() =>
            router.navigate({
              pathname: "/product",
              params: { storeId: product.store.id, productId: product.id },
            })
          }
        >
          <View>
            <Text category="s1" status="control">
              إضافة إلى السلة
            </Text>
          </View>
        </Button>
      </View>
    );
  };

  return (
    <SafeAreaInsetsContext.Consumer>
      {(insets) => (
        <Layout
          style={{
            ...styles.container,
            paddingTop: 12,
            paddingBottom: insets?.bottom + 16,
          }}
        >
          {loading && (
            <View style={styles.centerFill}>
              <ActivityIndicator size="large" color={theme["color-primary-500"]} />
            </View>
          )}

          {!loading && !hasFavorites && (
            <EmptyState
              title="لا توجد مفضلات"
              subtitle="أضف متاجر أو منتجات إلى مفضلتك لتجدها هنا"
            />
          )}

          {!loading && hasFavorites && (
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContentContainer}
          >
            {favorites?.stores?.length > 0 && (
              <View style={styles.cardsContainer}>
                <Text category="s1" style={styles.title}>
                  المتاجر
                </Text>
                {favorites?.stores?.map((store) => (
                  <StoreCard
                    key={store.id}
                    item={store}
                    showAnimatedFavoriteButton={false}
                    setRefreshFavorites={setRefresh}
                  ></StoreCard>
                ))}
              </View>
            )}

            {favorites?.meals?.length > 0 && (
              <View style={styles.cardsContainer}>
                <Text category="s1" style={styles.title}>
                  الوجبات
                </Text>
                {favorites?.meals?.map((product) => (
                  <ProductCard key={product.id} product={product}></ProductCard>
                ))}
              </View>
            )}
          </ScrollView>
          )}
        </Layout>
      )}
    </SafeAreaInsetsContext.Consumer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  scrollView: {
    flex: 1,
  },
  scrollContentContainer: { flexGrow: 1, gap: 18 },
  cardsContainer: {
    gap: 12,
  },
  title: {
    color: theme["text-heading-color"],
    fontFamily: "TajawalBold",
    textAlign: "left",
  },
  productCard: {
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: theme["color-gray"],
    borderRadius: 12,
    height: 120,
  },
  productContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  product: {
    flexDirection: "row",
    gap: 8,
  },
  productImage: {
    width: 36,
    height: 36,
    borderRadius: 4,
    backgroundColor: "#E5E7EB",
  },
  productDetails: {
    justifyContent: "space-between",
  },
  heartFilledIcon: {
    width: 22,
    height: 22,
    tintColor: theme["color-primary-500"],
  },
  centerFill: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
