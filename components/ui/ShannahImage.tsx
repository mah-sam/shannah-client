// @ts-nocheck
import { Image, ImageProps } from "expo-image";
import { useMemo, useState } from "react";
import { Image as RNImage, StyleSheet, View } from "react-native";
import {
  IMAGE_BLURHASHES,
  IMAGE_PLACEHOLDERS,
  IMAGE_TRANSITION_MS,
  ImageVariant,
} from "../../constants/images";

const LOGO_GLYPH = require("../../assets/images/logo-new.png");

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

/**
 * Empty-state placeholder: the Shannah monogram tinted to the primary brand
 * color on a pale primary background. The glyph's size, tint and opacity are
 * driven by `IMAGE_PLACEHOLDERS[variant]` so the same component produces a
 * small, bold logo inside a 48-px thumbnail and a subtle, faint logo inside
 * a 400-px cover.
 *
 * The glyph size is computed from the measured container via `onLayout` so
 * the ratio works against whatever height/width the caller applies.
 */
const PlaceholderGlyph = ({ variant, style }: { variant: ImageVariant; style?: any }) => {
  const placeholder = IMAGE_PLACEHOLDERS[variant];
  const [size, setSize] = useState({ width: 0, height: 0 });
  const shortSide = Math.min(size.width, size.height) || 0;
  const glyphSide = shortSide * placeholder.glyphSizeRatio;

  return (
    <View
      onLayout={(e) => {
        const { width, height } = e.nativeEvent.layout;
        if (width !== size.width || height !== size.height) {
          setSize({ width, height });
        }
      }}
      style={[
        styles.fallback,
        { backgroundColor: placeholder.background },
        style,
      ]}
    >
      {glyphSide > 0 ? (
        <RNImage
          source={LOGO_GLYPH}
          resizeMode="contain"
          style={{
            width: glyphSide,
            height: glyphSide,
            tintColor: placeholder.glyphTint,
            opacity: placeholder.glyphOpacity,
          }}
        />
      ) : null}
    </View>
  );
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
    return <PlaceholderGlyph variant={variant} style={style} />;
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
    alignItems: "center",
    justifyContent: "center",
  },
});
