import { useRef, useState } from "react";
import { Animated, Pressable } from "react-native";
import * as theme from "../../theme.json";
import { HeartFilledIcon, HeartIcon } from "../Icons";

export const AnimatedFavoriteButton = ({
  isFavorite,
  onToggle,
  style,
  buttonStyle,
  iconStyle,
  backgroundColor = theme["color-basic-100"],
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const colorAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;
  const [isAnimating, setIsAnimating] = useState(false);

  const handlePress = async () => {
    if (isAnimating) return;

    // If unfavoriting, just swap the icon without animation
    if (isFavorite) {
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 0,
        useNativeDriver: true,
      }).start();
      await onToggle();
      return;
    }

    // Favoriting animation - show animation
    setIsAnimating(true);

    // Hide the outline heart icon
    Animated.timing(opacityAnim, {
      toValue: 0,
      duration: 0,
      useNativeDriver: true,
    }).start();

    // Phase 1: Scale up and change to purple (Variant3)
    Animated.spring(scaleAnim, {
      toValue: 1.2,
      mass: 1,
      stiffness: 38400,
      damping: 120,
      useNativeDriver: false,
    }).start();

    Animated.timing(colorAnim, {
      toValue: 1,
      duration: 0,
      useNativeDriver: false,
    }).start();

    // Call the toggle function
    await onToggle();

    // Phase 2: After delay, animate back to normal (active state) and show filled heart
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: false,
        }),
        Animated.timing(colorAnim, {
          toValue: 0,
          duration: 100,
          useNativeDriver: false,
        }),
      ]).start(() => {
        setIsAnimating(false);
      });
    }, 1);
  };

  const animatedBackgroundColor = colorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [backgroundColor, theme["color-primary-500"]],
  });

  const animatedScale = scaleAnim;

  return (
    <Animated.View
      style={[
        style,
        {
          transform: [{ scale: animatedScale }],
        },
      ]}
    >
      <Pressable onPress={handlePress}>
        <Animated.View
          style={[
            buttonStyle,
            {
              backgroundColor: animatedBackgroundColor,
            },
          ]}
        >
          {isFavorite ? (
            <HeartFilledIcon style={iconStyle}></HeartFilledIcon>
          ) : (
            <Animated.View style={{ opacity: opacityAnim }}>
              <HeartIcon style={iconStyle}></HeartIcon>
            </Animated.View>
          )}
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
};
