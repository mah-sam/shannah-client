import { Share } from "react-native";

/**
 * Share store information with native share dialog
 * @param {Object} store - The store object with properties: id, name, description, logo, etc.
 * @returns {Promise<void>}
 */
export const shareStore = async (store) => {
  if (!store) return;

  try {
    const storeLink = `shannah://store/${store.id}`;
    const shareMessage = `
🍽️ اكتشف ${store.name}

📝 ${store.description}

⭐ التقييم: ${store.rating} (${store.review_count} تقييم)
⏱️ وقت التوصيل: ${store.delivery_time}
🚚 رسوم التوصيل: ${store.delivery_fee} ريال
📍 نطاق التوصيل: ${store.max_delivery_radius_km} كم

جرب الآن: ${storeLink}
    `.trim();

    // Use native Share API
    const result = await Share.share({
      message: shareMessage,
      title: `مشاركة ${store.name}`,
      url: store.cover, // For iOS with native sharing
    });
  } catch (error) {
    console.error("Error sharing store:", error);
    // Fallback: You could show a toast notification here
  }
};
