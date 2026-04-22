// @ts-nocheck
import { Image, ImageProps } from "expo-image";
import { useEffect, useMemo, useRef, useState } from "react";
import { Image as RNImage, StyleSheet, View } from "react-native";
import {
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
 * color on a pale primary background. Sized via `onLayout` so the glyph
 * scales naturally against whatever height/width the caller applies.
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

/**
 * Branded remote image with:
 *   - Clean tinted background shown during load (no blurhash — intentionally
 *     replaced because the blurhash rendered blocky on certain sizes).
 *   - Single retry after 1s on first error (covers transient mobile-network
 *     hiccups). Only after the retry also fails do we fall back to the glyph.
 *   - Explicit `cachePolicy="memory-disk"` so scroll-off/scroll-back doesn't
 *     re-download images already fetched this session.
 *   - Automatic fallback to the branded glyph when source is null or both
 *     load attempts fail.
 *
 * **Caller contract:** the `style` prop must supply explicit width + height
 * (directly or via flex). The image is positioned with `absoluteFill` inside
 * a background-tinted container, so a container without dimensions renders
 * as a zero-sized View and the image is invisible.
 */
export const ShannahImage = ({
  variant,
  source,
  style,
  contentFit = "cover",
  ...rest
}: ShannahImageProps) => {
  const uri = useMemo(() => extractUri(source), [source]);
  const [errored, setErrored] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Reset retry/error state whenever the source URI changes — prevents a
  // stale "errored" from a previous render sticking to a fresh image.
  useEffect(() => {
    setErrored(false);
    setAttempt(0);
  }, [uri]);

  // Cancel any pending retry setTimeout on unmount so we don't call
  // setAttempt on a dead component (React warning + potential StrictMode
  // crash). Also cancel when the URI changes — the reset effect above
  // supersedes the old retry anyway.
  useEffect(() => {
    return () => {
      if (retryTimerRef.current !== null) {
        clearTimeout(retryTimerRef.current);
        retryTimerRef.current = null;
      }
    };
  }, [uri]);

  const shouldShowFallback = !uri || errored;

  if (shouldShowFallback) {
    return <PlaceholderGlyph variant={variant} style={style} />;
  }

  const placeholder = IMAGE_PLACEHOLDERS[variant];

  const handleError = () => {
    if (attempt === 0) {
      // First failure — wait 1s then remount the Image (via `key` bump) so
      // it refetches. Most transient 4G hiccups resolve on a single retry.
      retryTimerRef.current = setTimeout(() => {
        retryTimerRef.current = null;
        setAttempt(1);
      }, 1000);
      return;
    }
    // Retry also failed — commit to the fallback.
    setErrored(true);
  };

  return (
    <View style={[styles.imageContainer, { backgroundColor: placeholder.background }, style]}>
      <Image
        {...rest}
        key={attempt}
        source={{ uri }}
        style={StyleSheet.absoluteFill}
        contentFit={contentFit}
        cachePolicy="memory-disk"
        transition={IMAGE_TRANSITION_MS}
        onError={handleError}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  fallback: {
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  imageContainer: {
    overflow: "hidden",
  },
});
