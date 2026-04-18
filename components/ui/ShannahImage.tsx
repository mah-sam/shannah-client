// @ts-nocheck
import { Image, ImageProps } from "expo-image";
import { useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import {
  IMAGE_BLURHASHES,
  IMAGE_PLACEHOLDER_COLORS,
  IMAGE_TRANSITION_MS,
  ImageVariant,
} from "../../constants/images";

type ShannahImageProps = Omit<ImageProps, "placeholder" | "transition"> & {
  variant: ImageVariant;
  source?: ImageProps["source"];
};

const extractUri = (source: ShannahImageProps["source"]): string | null => {
  if (!source) return null;
  if (typeof source === "string") return source.trim() || null;
  if (Array.isArray(source)) {
    const first = source[0];
    return first && typeof first === "object" && "uri" in first
      ? (first.uri as string)?.trim() || null
      : null;
  }
  if (typeof source === "object" && "uri" in source) {
    const uri = (source.uri as string | undefined)?.trim();
    return uri || null;
  }
  return null;
};

export const ShannahImage = ({
  variant,
  source,
  style,
  contentFit = "cover",
  ...rest
}: ShannahImageProps) => {
  const uri = useMemo(() => extractUri(source), [source]);
  const [errored, setErrored] = useState(false);

  const shouldShowFallback = !uri || errored;

  if (shouldShowFallback) {
    return (
      <View
        style={[
          styles.fallback,
          { backgroundColor: IMAGE_PLACEHOLDER_COLORS[variant] },
          style,
        ]}
      />
    );
  }

  return (
    <Image
      {...rest}
      source={{ uri }}
      style={style}
      contentFit={contentFit}
      placeholder={{ blurhash: IMAGE_BLURHASHES[variant] }}
      transition={IMAGE_TRANSITION_MS}
      onError={() => setErrored(true)}
    />
  );
};

const styles = StyleSheet.create({
  fallback: {
    overflow: "hidden",
  },
});
