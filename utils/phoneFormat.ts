/**
 * Saudi mobile phone formatting helpers. Keeps the raw (digits-only)
 * representation in state and produces a human-readable display.
 *
 * Saudi mobile after +966 is 9 digits starting with 5 — we display as
 * "5XX XXX XXX" (3-3-3) which matches how the number prints on
 * official SIM cards and is what HungerStation/Keeta render.
 */

/**
 * Extract digits from any user-typed input, strip a leading `0` that
 * users commonly include out of habit (`0545370163` → `545370163`), and
 * cap to 9 digits so pasting a full +966-prefixed number doesn't overflow.
 */
export function normalizeSaudiPhoneDigits(raw: string): string {
  const digits = (raw ?? "").replace(/\D+/g, "");
  // If the user pasted a full +966XXXXXXXXX or 966XXXXXXXXX string, strip
  // the country code so we keep only the 9 subscriber digits.
  const withoutCountryCode = digits.startsWith("966")
    ? digits.slice(3)
    : digits;
  const withoutLeadingZero = withoutCountryCode.startsWith("0")
    ? withoutCountryCode.slice(1)
    : withoutCountryCode;
  return withoutLeadingZero.slice(0, 9);
}

/**
 * Format 9 digits for display: "5XX XXX XXX". Partial inputs group as the
 * user types — "5" → "5", "545" → "545", "5453" → "545 3", "545370163" → "545 370 163".
 */
export function formatSaudiPhoneDisplay(digits: string): string {
  const d = normalizeSaudiPhoneDigits(digits);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0, 3)} ${d.slice(3)}`;
  return `${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6)}`;
}

/**
 * Saudi mobile is valid when it's exactly 9 digits starting with 5.
 */
export function isValidSaudiMobile(digits: string): boolean {
  return /^5\d{8}$/.test(digits);
}
