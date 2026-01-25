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
import { Image, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaInsetsContext } from "react-native-safe-area-context";
import {
  ArrowRightIcon,
  HeartIcon,
  MinusCircleIcon,
  PlusCircleIcon,
  SarIcon,
  StarIcon,
} from "../components/Icons";
import { useGlobal } from "../context/GlobalContext";
import { getProduct, getStores } from "../services/shannahApi";
import * as theme from "../theme.json";

const Product = () => {
  const { storeId, productId } = useLocalSearchParams();
  const [store, setStore] = useState({});
  const [product, setProduct] = useState({});
  const [productDataLoaded, setProductDataLoaded] = useState({});
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [qty, setQty] = useState(1);
  const [requiredOptions, setRequiredOptions] = useState([]);
  const [options, setOptions] = useState({});
  const { cartItems, setCartItems } = useGlobal();

  useEffect(() => {
    (async () => {
      const result = await getStores(storeId);
      setStore(result.data);
    })();
  }, []);

  useEffect(() => {
    (async () => {
      const result = await getProduct(productId);
      setProduct(result.data);
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

    // const storeIndex = cartItems[product.type].findIndex((item) =>
    //   Object.keys(item).includes(String(store.id))
    // );

    // const storeProducts =
    //   storeIndex === -1 ? [] : cartItems[product.type][storeIndex][store.id];

    await AsyncStorage.setItem("cart", JSON.stringify(updatedItems));
    // setCartItems({ meal: [], banquet: [] });
    setCartItems(updatedItems);

    // if (storeIndex === -1) {
    //   existingItems[product.type].push({ [store.id]: [productData] });
    //   await AsyncStorage.setItem("cart", JSON.stringify(existingItems));
    //   setCartItems(existingItems);
    // } else {
    //   existingItems[product.type][storeIndex][store.id] = [
    //     ...storeProducts,
    //     productData,
    //   ];
    //   await AsyncStorage.setItem("cart", JSON.stringify(existingItems));
    //   setCartItems(existingItems);
    // }

    router.navigate("/(tabs)/cart");
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
          {productDataLoaded ? (
            <>
              <View style={styles.productCover}>
                <Image
                  source={{
                    uri: product.image,
                  }}
                  resizeMode="cover"
                  style={styles.productImage}
                ></Image>
                <View style={styles.backButton}>
                  <Pressable onPress={() => router.back()}>
                    <ArrowRightIcon style={styles.arrowIcon}></ArrowRightIcon>
                  </Pressable>
                </View>
                <View style={styles.favoriteButton}>
                  <HeartIcon style={styles.heartIcon}></HeartIcon>
                </View>
              </View>
              <View style={styles.productDetails}>
                <View style={styles.productNameAndPrice}>
                  <Text category="h2">{product.name}</Text>
                  <View style={styles.productPriceContainer}>
                    <Text category="h2">{product.price}</Text>
                    <SarIcon style={styles.sarIconProduct}></SarIcon>
                  </View>
                </View>
                <View style={styles.productRatingContainer}>
                  <StarIcon style={styles.starIcon}></StarIcon>
                  <Text
                    style={styles.productRatingText}
                  >{`${product.rating} (${product.review_count})`}</Text>
                </View>
                <Text style={styles.productDescription}>
                  {product.description}
                </Text>
              </View>

              <View style={{ flex: 1, maxHeight: "100%" }}>
                <ScrollView
                  style={{ maxHeight: "100%" }}
                  contentContainerStyle={{ paddingBottom: 128 - insets.bottom }}
                >
                  {product?.options?.map((option) => {
                    return (
                      <View key={option.id} style={styles.optionsContainer}>
                        <View style={styles.optionTitle}>
                          <View>
                            <Text category="s1">{option.name}</Text>
                            <Text>
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
                              <Text>{value.name}</Text>
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
                                      <Text style={styles.optionPriceText}>
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
                                      <Text style={styles.optionPriceText}>
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
                      ></Input>
                    </View>
                  </View>
                </ScrollView>
              </View>

              <View
                style={{
                  position: "absolute",
                  left: 0,
                  bottom: 0,
                  width: "100%",
                  paddingHorizontal: 9,
                  paddingTop: 16,
                  paddingBottom: 20 + insets.bottom,
                  boxShadow: "0px 0px 6px rgba(0, 0, 0, 0.15)",
                  borderTopLeftRadius: 12,
                  borderTopRightRadius: 12,
                  backgroundColor: "#ffffff",
                }}
              >
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
                    <View>
                      <Text
                        style={{
                          fontFamily: "TajawalMedium",
                          fontWeight: 500,
                          fontSize: 16,
                          // lineHeight: 24,
                        }}
                        status="control"
                      >
                        إضافة إلى السلة
                      </Text>
                    </View>
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
                        style={{ width: 20, height: 20 }}
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
              </View>
            </>
          ) : (
            <View style={styles.spinnerContainer}>
              <Spinner></Spinner>
            </View>
          )}
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
  heartIcon: { width: 24, height: 24 },
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
  productPriceContainer: { flexDirection: "row", alignItems: "center", gap: 8 },
  sarIconProduct: { width: 24, height: 24 },
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
    fontFamily: "TajawalMedium",
    fontSize: 12,
    color: theme["color-black"],
  },
  productDescription: { fontSize: 14, color: theme["text-body-color"] },
  optionsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  optionTitle: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
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
  optionPriceText: { fontSize: 16 },
  sarIconOption: { width: 12, height: 12 },
  specialInstructions: { paddingHorizontal: 16, paddingVertical: 8, gap: 12 },
  specialInstructionsTitle: { gap: 2 },
  specialInstructionsText: {},
  specialInstructionsSubText: {},
  specialInstructionsPlaceholder: {
    position: "absolute",
    top: 8,
    left: 20,
    fontSize: 16,
    color: theme["text-body-color"],
    zIndex: 1,
  },

  minusCircleIcon: {
    width: 20,
    height: 20,
    tintColor: theme["color-black"],
  },
  minusButtonDisabled: {
    tintColor: theme["color-gray"],
  },
});

export default Product;
