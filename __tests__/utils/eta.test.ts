import { computeEtaRange, etaMidpoint, formatEtaRange } from "../../utils/eta";

describe("computeEtaRange", () => {
  test("returns null when prep is missing or non-positive", () => {
    expect(computeEtaRange(null, 5)).toBeNull();
    expect(computeEtaRange(undefined, 5)).toBeNull();
    expect(computeEtaRange(0, 5)).toBeNull();
    expect(computeEtaRange(Number.NaN, 5)).toBeNull();
  });

  test("clamps to the minimum window when prep + distance is tiny", () => {
    const range = computeEtaRange(5, 0);
    expect(range).not.toBeNull();
    // min floor is 15 minutes and max is at least min + 10.
    expect(range!.min).toBeGreaterThanOrEqual(15);
    expect(range!.max - range!.min).toBeGreaterThanOrEqual(10);
  });

  test("widens the window with increasing distance", () => {
    const near = computeEtaRange(15, 2);
    const far  = computeEtaRange(15, 10);
    expect(near).not.toBeNull();
    expect(far).not.toBeNull();
    expect(far!.min).toBeGreaterThanOrEqual(near!.min);
    expect(far!.max).toBeGreaterThan(near!.max);
  });

  test("treats missing distance as zero (no crash)", () => {
    expect(computeEtaRange(20, null)).not.toBeNull();
    expect(computeEtaRange(20, undefined)).not.toBeNull();
    expect(computeEtaRange(20, Number.NaN)).not.toBeNull();
  });
});

describe("etaMidpoint", () => {
  test("returns MAX_SAFE_INTEGER for a null range so it sorts last", () => {
    expect(etaMidpoint(null)).toBe(Number.MAX_SAFE_INTEGER);
  });

  test("returns arithmetic midpoint", () => {
    expect(etaMidpoint({ min: 20, max: 40 })).toBe(30);
  });
});

describe("formatEtaRange", () => {
  test("returns empty string for null", () => {
    expect(formatEtaRange(null)).toBe("");
  });

  test("formats with Arabic digits", () => {
    expect(formatEtaRange({ min: 20, max: 35 })).toBe("٢٠-٣٥ دقيقة");
  });
});
