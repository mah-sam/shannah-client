export interface LatLng {
  latitude: number;
  longitude: number;
}

const EARTH_RADIUS_KM = 6371;

const toRadians = (deg: number): number => (deg * Math.PI) / 180;

/**
 * Great-circle distance between two lat/lng points in kilometers.
 * Returns 0 when either point is missing.
 */
export function haversineKm(a: LatLng | null | undefined, b: LatLng | null | undefined): number {
  if (!a || !b) return 0;
  if (
    typeof a.latitude !== "number" ||
    typeof a.longitude !== "number" ||
    typeof b.latitude !== "number" ||
    typeof b.longitude !== "number"
  ) {
    return 0;
  }

  const dLat = toRadians(b.latitude - a.latitude);
  const dLon = toRadians(b.longitude - a.longitude);
  const lat1 = toRadians(a.latitude);
  const lat2 = toRadians(b.latitude);

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;

  return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(h)));
}

const toArabicDigits = (s: string): string =>
  s.replace(/[0-9]/g, (d) => "٠١٢٣٤٥٦٧٨٩"[Number(d)]);

/**
 * Format a distance in km for Arabic display.
 *   0.3 km → "٣٠٠ م"
 *   2.45 km → "٢٫٥ كم"
 *   12 km → "١٢ كم"
 */
export function formatDistanceKm(km: number): string {
  if (!isFinite(km) || km <= 0) return "";
  if (km < 1) {
    const meters = Math.max(50, Math.round(km * 1000 / 50) * 50);
    return `${toArabicDigits(String(meters))} م`;
  }
  const rounded = km < 10 ? km.toFixed(1).replace(".", "٫") : String(Math.round(km));
  return `${toArabicDigits(rounded)} كم`;
}
