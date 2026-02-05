import { Button, Layout, Text } from "@ui-kitten/components";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaInsetsContext } from "react-native-safe-area-context";
import { StoreCard } from "../components/HomeComponents";
import { HeartFilledIcon } from "../components/Icons";
import useAuth from "../hooks/useAuth";
import { getFavorites, toggleFavorite } from "../services/shannahApi";
import * as theme from "../theme.json";

export default function Favorite() {
  const { token } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [refresh, setRefresh] = useState(false);

  useEffect(() => {
    (token || refresh) &&
      (async () => {
        const result = await getFavorites(token);
        setFavorites(result.data);
        setRefresh(false);
      })();
  }, [token, refresh]);

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
              style={styles.productImage}
            ></Image>
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
});
