import { Share } from "react-native";

export const shareProduct = async (product: any, store?: any) => {
  if (!product) return;

  try {
    const productLink = `shannah://product/${product.id}`;
    const storeName = store?.name ?? product?.store?.name ?? "";
    const lines = [
      `🍽️ ${product.name}`,
      product.description ? `📝 ${product.description}` : null,
      storeName ? `🏪 ${storeName}` : null,
      product.price ? `💰 ${product.price} ريال` : null,
      "",
      `جرب الآن: ${productLink}`,
    ].filter(Boolean);

    await Share.share({
      message: lines.join("\n"),
      title: `مشاركة ${product.name}`,
      url: product.image ?? "",
    });
  } catch (error) {
    console.error("Error sharing product:", error);
  }
};
