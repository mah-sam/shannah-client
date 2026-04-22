import AsyncStorage from "@react-native-async-storage/async-storage";
import { Button, Layout, Text } from "@ui-kitten/components";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Image, Pressable, StyleSheet, View } from "react-native";
import { SafeAreaInsetsContext } from "react-native-safe-area-context";
import { ChevronLeft } from "../components/Icons";
import { useGlobal } from "../context/GlobalContext";
import * as theme from "../theme.json";

export default function Intro() {
  const [currentScreen, setCurrentScreen] = useState(0);
  const router = useRouter();
  const { signedIn } = useGlobal();

  useEffect(() => {
    const checkIntroSeen = async () => {
      try {
        const introSeen = await AsyncStorage.getItem("introSeen");
        if (introSeen === "true") {
          router.replace(signedIn ? "/(tabs)" : "/sign-in-mobile");
        }
      } catch (error) {
        console.log(error);
      }
    };

    checkIntroSeen();
  }, [signedIn]);

  const images = [
    require("../assets/images/intro/1.png"),
    require("../assets/images/intro/2.png"),
    require("../assets/images/intro/3.png"),
  ];

  const titles = [
    "طهاة محليون موثوقون",
    "تتبع عمليات التسليم المباشر",
    "وجبات فورية أو مجدولة",
  ];

  const descriptions = [
    "اكتشف وجبات أصلية محلية الصنع من البائعين العائليين المعتمدين في منطقتك",
    "اتبع طلبك في الوقت الفعلي من المطبخ إلى عتبة الباب من خلال التتبع المباشر عبر نظام تحديد المواقع العالمي (GPS).",
    "اطلب الآن أو حدد موعدًا لاحقًا. مثالية للوجبات اليومية أو المناسبات الخاصة",
  ];

  const handleNext = async () => {
    if (currentScreen < 2) {
      setCurrentScreen(currentScreen + 1);
    } else {
      try {
        await AsyncStorage.setItem("introSeen", "true");
        router.replace(signedIn ? "/(tabs)" : "/sign-in-mobile");
      } catch (error) {
        console.log(error);
      }
    }
  };

  const handleSkip = async () => {
    try {
      await AsyncStorage.setItem("introSeen", "true");
      router.replace(signedIn ? "/(tabs)" : "/sign-in-mobile");
    } catch (error) {
      console.log(error);
    }
  };

  const getImageStyle = () => {
    if (currentScreen === 2) {
      return styles.imageLarge;
    }
    return styles.image;
  };

  const renderIndicators = () => {
    return (
      <View style={styles.indicatorsContainer}>
        {[0, 1, 2].map((index) => (
          <View
            key={index}
            style={
              currentScreen === index
                ? styles.indicatorActive
                : styles.indicator
            }
          ></View>
        ))}
      </View>
    );
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
          <View style={styles.topActionBar}>
            <Pressable onPress={handleSkip}>
              <Text status="primary" category="s2">
                تخطي
              </Text>
            </Pressable>
          </View>
          <Image source={images[currentScreen]} style={getImageStyle()}></Image>
          <View style={styles.titleContainer}>
            <Text category="h2" style={styles.titleText}>
              {titles[currentScreen]}
            </Text>
            <Text category="s1" style={styles.subTitleText}>
              {descriptions[currentScreen]}
            </Text>
          </View>
          <View style={styles.bottomActionBar}>
            {renderIndicators()}
            <Button
              status="primary"
              onPress={handleNext}
              accessoryRight={() => (
                <ChevronLeft style={styles.chevronLeftIcon}></ChevronLeft>
              )}
            >
              <View>
                <Text category="s1" status="control">
                  {currentScreen === 2 ? "ابدأ" : "التالي"}
                </Text>
              </View>
            </Button>
          </View>
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
  topActionBar: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 16,
    marginBottom: 48,
  },
  mainContainer: {
    paddingHorizontal: 16,
    gap: 24,
  },
  image: {
    width: 293,
    height: 293,
    alignSelf: "center",
  },
  imageLarge: {
    width: 390,
    height: 293,
    alignSelf: "center",
  },
  titleContainer: {
    flex: 1,
    gap: 12,
  },
  titleText: {
    color: theme["text-heading-color"],
    textAlign: "center",
  },
  subTitleText: {
    color: theme["text-body-color"],
    textAlign: "center",
    lineHeight: 24,
  },
  bottomActionBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 24,
  },
  indicatorsContainer: {
    flexDirection: "row",
    gap: 8,
  },
  indicator: {
    width: 8,
    height: 8,
    backgroundColor: "#D1D5DC",
    borderRadius: "50%",
  },
  indicatorActive: {
    width: 32,
    height: 8,
    backgroundColor: "#881ED3",
    borderRadius: 4,
  },
  chevronLeftIcon: {
    width: 16,
    height: 16,
    tintColor: theme["color-basic-100"],
  },
});
