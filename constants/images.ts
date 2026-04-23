/**
 * Shared image constants for expo-image.
 *
 * Each content type (store cover, store logo, product, avatar, banner) has its own:
 *   - blurhash: soft-tinted placeholder rendered while the remote image downloads.
 *   - placeholder: on-brand fallback rendered when the source URL is missing
 *     or the remote load fails. We use a centered Shannah logo glyph tinted
 *     to the primary palette on a light primary background, which keeps the
 *     empty state visually consistent with the brand instead of a generic
 *     solid color. Each variant picks its own background tint + glyph ratio
 *     so the size of the surface drives the visual weight of the glyph.
 *
 * Blurhash strings are valid pre-computed hashes that render distinct tints.
 */

import * as theme from "../theme.json";

export type ImageVariant =
  | "store_cover"
  | "store_logo"
  | "product"
  | "avatar"
  | "banner";

export const IMAGE_BLURHASHES: Record<ImageVariant, string> = {
  store_cover: "LGF5]+Yk^6#M@-5c,1J5@[or[Q6.",
  store_logo: "L6PZfSi_.AyE_3t7t7R**0o#DgR4",
  product: "LEHV6nWB2yk8pyo0adR*.7kCMdnj",
  avatar: "LKN]Rv%2Tw=w]~RBVZRi};RPxuwH",
  banner: "L6Pj0^jE.AyE_3t7t7R**0o#DgR4",
};

export interface PlaceholderStyle {
  background: string;
  glyphTint: string;
  /** Glyph size as a fraction of the shorter container side. */
  glyphSizeRatio: number;
  /** Glyph opacity 0-1. */
  glyphOpacity: number;
}

// All backgrounds use color-primary-100 (#F5E3FC, brand pale wash) so the
// primary-500 glyph reads cleanly at any size. We vary ratio + opacity per
// variant to compensate for container size: small containers need larger
// relative glyphs and more opacity so the logo is visible; wide containers
// need small subtle glyphs so the empty state doesn't shout.
export const IMAGE_PLACEHOLDERS: Record<ImageVariant, PlaceholderStyle> = {
  store_cover: {
    background: theme["color-primary-100"],
    glyphTint: theme["color-primary-500"],
    glyphSizeRatio: 0.35,
    glyphOpacity: 0.35,
  },
  store_logo: {
    background: theme["color-primary-100"],
    glyphTint: theme["color-primary-500"],
    glyphSizeRatio: 0.6,
    glyphOpacity: 0.6,
  },
  product: {
    background: theme["color-primary-100"],
    glyphTint: theme["color-primary-500"],
    glyphSizeRatio: 0.45,
    glyphOpacity: 0.45,
  },
  avatar: {
    background: theme["color-primary-100"],
    glyphTint: theme["color-primary-500"],
    glyphSizeRatio: 0.5,
    glyphOpacity: 0.55,
  },
  banner: {
    background: theme["color-primary-100"],
    glyphTint: theme["color-primary-500"],
    glyphSizeRatio: 0.25,
    glyphOpacity: 0.3,
  },
};

/** @deprecated Use IMAGE_PLACEHOLDERS[variant].background directly. */
export const IMAGE_PLACEHOLDER_COLORS: Record<ImageVariant, string> = {
  store_cover: IMAGE_PLACEHOLDERS.store_cover.background,
  store_logo: IMAGE_PLACEHOLDERS.store_logo.background,
  product: IMAGE_PLACEHOLDERS.product.background,
  avatar: IMAGE_PLACEHOLDERS.avatar.background,
  banner: IMAGE_PLACEHOLDERS.banner.background,
};

export const IMAGE_TRANSITION_MS = 200;

/**
 * @deprecated Use IMAGE_BLURHASHES[variant] instead. Kept for legacy callers
 * until every <Image> is migrated to <ShannahImage>.
 */
export const IMAGE_BLURHASH = IMAGE_BLURHASHES.store_logo;
