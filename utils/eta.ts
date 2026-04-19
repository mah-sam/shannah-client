const toArabicDigits = (s: string): string =>
  s.replace(/[0-9]/g, (d) => "٠١٢٣٤٥٦٧٨٩"[Number(d)]);

// Speeds chosen for Saudi urban delivery mix (bike + car, light-to-moderate
// traffic). Previous values (24/30 km/h + 5 min buffer + 15 min floor +
// 10 min min-window) produced inflated ranges for short distances. These
// tuned values cut the typical 0.5 km trip from "15–25 min" to "10–20 min"
// while keeping long-distance estimates realistic.
const AVG_SPEED_KMPM_FAST = 35 / 60; // ≈ 35 km/h in km per minute
const AVG_SPEED_KMPM_SLOW = 25 / 60; // ≈ 25 km/h
const MIN_ETA_MINUTES     = 10;
const MAX_BUFFER_MINUTES  = 3;
const MIN_WINDOW_MINUTES  = 8;

export interface EtaRange {
  min: number;
  max: number;
}

/**
 * Compute a delivery-time range based on prep + distance.
 * Returns null if prep is missing/invalid.
 */
export function computeEtaRange(
  prepMinutes: number | null | undefined,
  distanceKm: number | null | undefined,
): EtaRange | null {
  if (prepMinutes == null || !isFinite(prepMinutes) || prepMinutes <= 0) return null;
  const dist = distanceKm && isFinite(distanceKm) && distanceKm > 0 ? distanceKm : 0;
  const minRaw = prepMinutes + dist / AVG_SPEED_KMPM_FAST;
  const maxRaw = prepMinutes + dist / AVG_SPEED_KMPM_SLOW + MAX_BUFFER_MINUTES;
  const min = Math.max(MIN_ETA_MINUTES, Math.round(minRaw / 5) * 5);
  const max = Math.max(min + MIN_WINDOW_MINUTES, Math.round(maxRaw / 5) * 5);
  return { min, max };
}

/**
 * Midpoint of an ETA range (for sorting).
 */
export function etaMidpoint(range: EtaRange | null): number {
  if (!range) return Number.MAX_SAFE_INTEGER;
  return (range.min + range.max) / 2;
}

export function formatEtaRange(range: EtaRange | null): string {
  if (!range) return "";
  return `${toArabicDigits(String(range.min))}-${toArabicDigits(String(range.max))} دقيقة`;
}
