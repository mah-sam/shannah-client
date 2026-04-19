// @ts-nocheck
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  Button,
  CheckBox,
  Input,
  Layout,
  Radio,
  Spinner,
  Text,
} from "@ui-kitten/components";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { ShannahImage } from "../components/ui/ShannahImage";
import { useToast } from "../context/ToastContext";
import * as haptics from "../utils/haptics";
import { shareProduct } from "../utils/shareProduct";
import { SafeAreaInsetsContext } from "react-native-safe-area-context";
import {
  ChevronLeft,
  MinusCircleIcon,
  PlusCircleIcon,
  SarIcon,
  ShareIcon,
  StarIcon,
} from "../components/Icons";
import { AnimatedFavoriteButton } from "../components/ui/AnimatedFavoriteButton";
import BottomActionBar from "../components/ui/BottomActionBar";
import { useGlobal } from "../context/GlobalContext";
import useAuth from "../hooks/useAuth";
import useKeyboard from "../hooks/useKeyboard";
import { getProduct, getStores, toggleFavorite } from "../services/shannahApi";
import * as theme from "../theme.json";

const Product = () => {
  const { signedIn } = useGlobal();
  const { token } = useAuth();
  const { storeId, productId } = useLocalSearchParams();
  const [store, setStore] = useState({});
  const [product, setProduct] = useState({});
  const [productDataLoaded, setProductDataLoaded] = useState(false);
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [qty, setQty] = useState(1);
  const [requiredOptions, setRequiredOptions] = useState([]);
  const [options, setOptions] = useState({});
  const [isFavorite, setIsFavorite] = useState(false);
  const { cartItems, setCartItems } = useGlobal();
  const { keyboardOpen } = useKeyboard();
  const toast = useToast();

  const handleToggleFavorite = async () => {
    if (!token) return;
    haptics.tapSoft();
    try {
      const result = await toggleFavorite(token, "product", productId);
      setIsFavorite(result.favorited);
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

  useEffect(() => {
    (async () => {
      const result = await getStores(token, storeId);
      setStore(result.data);
    })();
  }, [token]);

  useEffect(() => {
    (async () => {
      const result = await getProduct(productId);
      setProduct(result.data);
      setIsFavorite(result.data?.is_favorite || false);
      setProductDataLoaded(true);
    })();
  }, [store]);

  useEffect(() => {
    setRequiredOptions(
      product?.options?.filter((option) => option.is_required === 1) ?? [],
    );
  }, [product]);

  const isEnabledAddButton = () => {
    const selectedOptionIds = Object.keys(options);

    return requiredOptions.every((option) =>
      selectedOptionIds.includes(String(option.id)),
    );
  };

  const onIncrementQty = () => {
    setQty(qty + 1);
  };

  const onDecrementQty = () => {
    if (qty > 1) {
      setQty(qty - 1);
    }
  };

  const onRadioChange = (optionId, valueId, valuePrice, nextChecked) => {
    if (nextChecked) {
      setOptions({
        ...options,
        [optionId]: [{ valueId: valueId, valuePrice: valuePrice }],
      });
    } else {
      const filteredOptions = Object.entries(options).filter(
        ([key, value]) => key !== String(optionId),
      );
      setOptions(Object.fromEntries(filteredOptions));
    }
  };

  const onCheckboxChange = (optionId, valueId, valuePrice, nextChecked) => {
    if (nextChecked) {
      const selectedOptions =
        options?.[optionId] === undefined ? [] : options[optionId];
      setOptions({
        ...options,
        [optionId]: [
          ...selectedOptions,
          { valueId: valueId, valuePrice: valuePrice },
        ],
      });
    } else {
      const filteredOptions = options?.[optionId].filter(
        (option) => option.valueId !== valueId,
      );
      setOptions({ ...options, [optionId]: filteredOptions });
    }
  };

  const onAddToCart = async () => {
    const optionIds = Object.keys(options);
    let optionsPrice = 0;

    optionIds.forEach((optionId) => {
      options[optionId].forEach((option) => {
        optionsPrice += parseFloat(option.valuePrice);
      });
    });

    const productData = {
      id: product.id,
      name: product.name,
      image: product.image,
      qty: qty,
      price: product.price,
      discountPrice: product.discount_price,
      options: options,
      optionsPrice: optionsPrice,
      notes: specialInstructions,
    };

    const storeItems = cartItems[product.type]?.[store.id] ?? [];
    const existingIndex = storeItems.findIndex((item) => item.id == product.id);

    let updatedItems;

    if (existingIndex === -1) {
      updatedItems = {
        ...cartItems,
        [product.type]: {
          ...cartItems[product.type],
          [store.id]: [
            ...(cartItems[product.type]?.[store.id] ?? []),
            productData,
          ],
        },
      };
    } else {
      const updatedProducts = storeItems.map((item, index) => {
        if (index === existingIndex) {
          return { ...item, qty: qty };
        } else {
          return item;
        }
      });

      updatedItems = {
        ...cartItems,
        [product.type]: {
          ...cartItems[product.type],
          [store.id]: updatedProducts,
        },
      };
    }

    // Optimistic update: flip state + navigate immediately, persist in the
    // background. If storage fails we revert and alert the user.
    setCartItems(updatedItems);
    haptics.success();
    toast.show({ message: "تمت الإضافة للسلة", kind: "success" });
    router.navigate("/(tabs)/cart");
    AsyncStorage.setItem("cart", JSON.stringify(updatedItems)).catch(() => {
      setCartItems(cartItems);
      toast.show({ message: "تعذّر حفظ السلة، حاول مجدداً", kind: "error" });
    });
  };

  return (
    <SafeAreaInsetsContext.Consumer>
      {(insets) => (
        <Layout
          style={{
            ...styles.container,
            paddingTop: insets.top,
            paddingBottom: insets.bottom,
          }}
        >
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            enabled={keyboardOpen}
          >
            {productDataLoaded ? (
              <>
                <View style={styles.productCover}>
                  <ShannahImage
                    variant="product"
                    source={{ uri: product.image }}
                    style={styles.productImage}
                  />
                  <View style={styles.backButton}>
                    <Pressable onPress={() => router.back()} hitSlop={10}>
                      <ChevronLeft style={styles.arrowIcon} />
                    </Pressable>
                  </View>
                  {signedIn && (
                    <AnimatedFavoriteButton
                      isFavorite={isFavorite}
                      onToggle={handleToggleFavorite}
                      style={styles.favoriteButton}
                      buttonStyle={styles.heartButtonContainer}
                      iconStyle={
                        isFavorite ? styles.heartFilledIcon : styles.heartIcon
                      }
                      backgroundColor="rgba(255, 255, 255, 0.9)"
                    />
                  )}
                  <Pressable
                    onPress={() => shareProduct(product, store)}
                    hitSlop={10}
                    style={styles.shareButton}
                  >
                    <ShareIcon style={styles.shareIcon} />
                  </Pressable>
                </View>
                <View style={styles.productDetails}>
                  <View style={styles.productNameAndPrice}>
                    <Text category="h2" style={styles.productNameAndPriceText}>
                      {product.name}
                    </Text>
                    <View style={styles.productPriceContainer}>
                      <Text
                        category="h2"
                        style={styles.productNameAndPriceText}
                      >
                        {product.price}
                      </Text>
                      <SarIcon style={styles.sarIconProduct}></SarIcon>
                    </View>
                  </View>
                  <View style={styles.productRatingContainer}>
                    <StarIcon style={styles.starIcon}></StarIcon>
                    <Text
                      style={styles.productRatingText}
                    >{`${product.rating} (${product.review_count})`}</Text>
                  </View>
                  <Text category="s2" style={styles.productDescription}>
                    {product.description}
                  </Text>
                </View>

                <ScrollView
                  style={{ flex: 1 }}
                  contentContainerStyle={{
                    flexGrow: 1,
                  }}
                >
                  {product?.options?.map((option) => {
                    return (
                      <View key={option.id} style={styles.optionsContainer}>
                        <View style={styles.optionTitleContainer}>
                          <View>
                            <Text category="s1" style={styles.optionTitle}>
                              {option.name}
                            </Text>
                            <Text style={styles.optionSubtitle}>
                              {option.type === "single"
                                ? "اختر واحداً"
                                : "قام عملاء آخرون أيضاً بطلب هذه المنتجات معاً"}
                            </Text>
                          </View>
                          {option.is_required === 1 && (
                            <View style={styles.optionRequiredBadge}>
                              <Text style={styles.optionRequiredText}>
                                مطلوب
                              </Text>
                            </View>
                          )}
                        </View>
                        {option.values.map((value) => {
                          return (
                            <View key={value.id} style={styles.optionValues}>
                              <Text style={styles.optionText}>
                                {value.name}
                              </Text>
                              {option.type === "single" ? (
                                <Radio
                                  style={styles.ltr}
                                  onChange={(nextChecked) =>
                                    onRadioChange(
                                      option.id,
                                      value.id,
                                      value.price,
                                      nextChecked,
                                    )
                                  }
                                  checked={options?.[option.id]?.some(
                                    (option) => {
                                      return option.valueId == value.id;
                                    },
                                  )}
                                >
                                  {(evaProps) => (
                                    <View style={styles.optionPrice}>
                                      <Text
                                        category="s1"
                                        style={styles.optionText}
                                      >
                                        {value.price}
                                      </Text>
                                      <SarIcon
                                        style={styles.sarIconOption}
                                      ></SarIcon>
                                    </View>
                                  )}
                                </Radio>
                              ) : (
                                <CheckBox
                                  style={styles.ltr}
                                  onChange={(nextChecked) =>
                                    onCheckboxChange(
                                      option.id,
                                      value.id,
                                      value.price,
                                      nextChecked,
                                    )
                                  }
                                  checked={options?.[option.id]?.some(
                                    (option) => option.valueId == value.id,
                                  )}
                                >
                                  {(evaProps) => (
                                    <View style={styles.optionPrice}>
                                      <Text style={styles.optionText}>
                                        {value.price}
                                      </Text>
                                      <SarIcon
                                        style={styles.sarIconOption}
                                      ></SarIcon>
                                    </View>
                                  )}
                                </CheckBox>
                              )}
                            </View>
                          );
                        })}
                      </View>
                    );
                  })}

                  <View style={styles.specialInstructions}>
                    <View style={styles.specialInstructionsTitle}>
                      <Text
                        category="s2"
                        style={styles.specialInstructionsText}
                      >
                        تعليمات خاصة
                      </Text>
                      <Text
                        category="p2"
                        style={styles.specialInstructionsSubText}
                      >
                        يرجى إعلامنا إذا كنت تعاني من حساسية تجاه أي شيء أو إذا
                        كنا بحاجة إلى تجنب أو استبدال أي شيء
                      </Text>
                    </View>
                    <View>
                      {specialInstructions.length === 0 && (
                        <Text style={styles.specialInstructionsPlaceholder}>
                          مثال: أقل حرارة، صلصة إضافية، بدون بصل...
                        </Text>
                      )}
                      <Input
                        status="primary"
                        multiline={true}
                        style={{ borderRadius: 10 }}
                        textStyle={styles.specialInstructionsInputText}
                        value={specialInstructions}
                        onChangeText={(t) => setSpecialInstructions(t)}
                      />
                    </View>
                  </View>
                </ScrollView>

                <BottomActionBar>
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 10,
                    }}
                  >
                    <Button
                      style={{ flex: 1 }}
                      disabled={!isEnabledAddButton()}
                      onPress={() => onAddToCart()}
                    >
                      {(evaProps) => (
                        <Text category="s1" status="control">
                          إضافة إلى السلة
                        </Text>
                      )}
                    </Button>
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                        height: 24,
                        gap: 8,
                      }}
                    >
                      <Pressable onPress={() => onIncrementQty()}>
                        <PlusCircleIcon
                          style={styles.plusCircleIcon}
                        ></PlusCircleIcon>
                      </Pressable>
                      <Text category="s1">{qty}</Text>
                      <Pressable
                        onPress={() => onDecrementQty()}
                        disabled={qty <= 1}
                      >
                        <MinusCircleIcon
                          style={
                            qty > 1
                              ? styles.minusCircleIcon
                              : {
                                  ...styles.minusCircleIcon,
                                  ...styles.minusButtonDisabled,
                                }
                          }
                        ></MinusCircleIcon>
                      </Pressable>
                    </View>
                  </View>
                </BottomActionBar>
              </>
            ) : (
              <View style={styles.spinnerContainer}>
                <Spinner></Spinner>
              </View>
            )}
          </KeyboardAvoidingView>
        </Layout>
      )}
    </SafeAreaInsetsContext.Consumer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  spinnerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  productCover: { height: 160 },
  productImage: { width: "100%", height: 160 },
  backButton: {
    position: "absolute",
    width: 32,
    height: 32,
    left: 16,
    top: 16,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: "50%",
    justifyContent: "center",
    alignItems: "center",
  },
  arrowIcon: { width: 24, height: 24 },
  favoriteButton: {
    position: "absolute",
    width: 32,
    height: 32,
    right: 16,
    top: 16,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: "50%",
    justifyContent: "center",
    alignItems: "center",
  },
  shareButton: {
    position: "absolute",
    width: 32,
    height: 32,
    right: 56,
    top: 16,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: "50%",
    justifyContent: "center",
    alignItems: "center",
  },
  shareIcon: { width: 18, height: 18 },
  heartIcon: { width: 24, height: 24 },
  heartFilledIcon: {
    width: 24,
    height: 24,
    tintColor: theme["color-primary-500"],
  },
  productDetails: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    borderBottomWidth: 0.25,
    borderBottomColor: "#767676",
  },
  productNameAndPrice: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  productNameAndPriceText: {
    color: theme["text-heading-color"],
  },
  productPriceContainer: { flexDirection: "row", alignItems: "center", gap: 8 },
  sarIconProduct: {
    width: 24,
    height: 24,
    tintColor: theme["text-heading-color"],
  },
  productRatingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  starIcon: {
    width: 16,
    height: 16,
  },
  productRatingText: {
    color: theme["text-body-color"],
  },
  productDescription: { textAlign: "left", color: theme["text-body-color"] },
  optionsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  optionTitleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  optionTitle: { color: theme["text-heading-color"], textAlign: "left" },
  optionSubtitle: { color: theme["text-body-color"], textAlign: "left" },
  optionRequiredBadge: {
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: theme["color-primary-500"],
    borderRadius: 200,
    height: 22,
  },
  optionRequiredText: {
    fontSize: 10,
    fontFamily: "TajawalMedium",
    color: "#ffffff",
  },
  optionValues: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  optionText: {
    color: theme["text-body-color"],
  },
  ltr: {
    direction: "ltr",
  },
  optionPrice: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 2,
    marginRight: 8,
    direction: "rtl",
  },
  sarIconOption: { width: 12, height: 12, tintColor: theme["text-body-color"] },
  specialInstructions: { paddingHorizontal: 16, paddingVertical: 8, gap: 12 },
  specialInstructionsTitle: { gap: 2 },
  specialInstructionsText: {
    color: theme["text-heading-color"],
    textAlign: "left",
  },
  specialInstructionsSubText: {
    color: theme["text-body-color"],
    lineHeight: 14,
    textAlign: "left",
  },
  specialInstructionsPlaceholder: {
    position: "absolute",
    top: 10,
    left: 20,
    fontSize: 16,
    color: theme["text-body-color"],
    zIndex: 1,
  },
  specialInstructionsInputText: {
    color: theme["color-black"],
  },
  plusCircleIcon: {
    width: 20,
    height: 20,
    tintColor: "#1E1E1E",
  },
  minusCircleIcon: {
    width: 20,
    height: 20,
    tintColor: theme["color-black"],
  },
  minusButtonDisabled: {
    tintColor: theme["color-gray"],
  },
  heartButtonContainer: {
    width: 32,
    height: 32,
    borderRadius: "50%",
    justifyContent: "center",
    alignItems: "center",
  },
});

export default Product;
