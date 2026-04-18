/**
 * Shared image constants for expo-image.
 *
 * Each content type (store cover, store logo, product, avatar, banner) has its own:
 *   - blurhash: soft-tinted placeholder rendered while the remote image downloads.
 *   - color:    solid background color rendered when no source URL is provided
 *               or when the remote image fails to load. Gives users visual
 *               feedback that "this is where an image should be" instead of a
 *               permanent generic blur.
 *
 * Blurhash strings are valid pre-computed hashes that render distinct tints.
 */

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

export const IMAGE_PLACEHOLDER_COLORS: Record<ImageVariant, string> = {
  store_cover: "#F6E7DC",
  store_logo: "#E5E7EB",
  product: "#F3EADB",
  avatar: "#E8E3F3",
  banner: "#EDE4FA",
};

export const IMAGE_TRANSITION_MS = 200;

/**
 * @deprecated Use IMAGE_BLURHASHES[variant] instead. Kept for legacy callers
 * until every <Image> is migrated to <ShannahImage>.
 */
export const IMAGE_BLURHASH = IMAGE_BLURHASHES.store_logo;
