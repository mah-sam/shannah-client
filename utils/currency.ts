const toArabicDigits = (s: string): string =>
  s.replace(/[0-9]/g, (d) => "٠١٢٣٤٥٦٧٨٩"[Number(d)]);

/**
 * Format a SAR amount for Arabic display.
 *   25 → "٢٥٫٠٠"
 *   12.5 → "١٢٫٥٠"
 *   null/undefined → "٠٫٠٠"
 */
export function formatSAR(value: number | string | null | undefined): string {
  const n = typeof value === "number" ? value : Number(value ?? 0);
  const safe = isFinite(n) ? n : 0;
  const fixed = safe.toFixed(2).replace(".", "٫");
  return toArabicDigits(fixed);
}

/**
 * Format an integer (e.g., review count, quantity) in Arabic digits.
 */
export function formatInt(value: number | string | null | undefined): string {
  const n = typeof value === "number" ? value : Number(value ?? 0);
  const safe = isFinite(n) ? Math.round(n) : 0;
  return toArabicDigits(String(safe));
}
