const toArabicDigits = (s: string): string =>
  s.replace(/[0-9]/g, (d) => "٠١٢٣٤٥٦٧٨٩"[Number(d)]);

const AVG_SPEED_KMPM_FAST = 0.5;   // ≈ 30 km/h
const AVG_SPEED_KMPM_SLOW = 0.4;   // ≈ 24 km/h
const MIN_ETA_MINUTES = 15;

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
  const maxRaw = prepMinutes + dist / AVG_SPEED_KMPM_SLOW + 5;
  const min = Math.max(MIN_ETA_MINUTES, Math.round(minRaw / 5) * 5);
  const max = Math.max(min + 10, Math.round(maxRaw / 5) * 5);
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
