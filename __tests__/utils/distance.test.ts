import { formatDistanceKm, haversineKm } from "../../utils/distance";

describe("haversineKm", () => {
  test("zero when either point is missing", () => {
    expect(haversineKm(null, { latitude: 24.7, longitude: 46.7 })).toBe(0);
    expect(haversineKm({ latitude: 24.7, longitude: 46.7 }, null)).toBe(0);
    expect(haversineKm(null, null)).toBe(0);
  });

  test("zero for identical points", () => {
    const p = { latitude: 24.7136, longitude: 46.6753 };
    expect(haversineKm(p, p)).toBeLessThan(0.000001);
  });

  test("returns approximately correct distance for known pair", () => {
    // Riyadh → Jeddah ≈ 850 km great-circle.
    const riyadh = { latitude: 24.7136, longitude: 46.6753 };
    const jeddah = { latitude: 21.4858, longitude: 39.1925 };
    const d = haversineKm(riyadh, jeddah);
    expect(d).toBeGreaterThan(830);
    expect(d).toBeLessThan(870);
  });

  test("zero when coordinates are not numbers", () => {
    expect(
      haversineKm(
        { latitude: "abc" as unknown as number, longitude: 46 },
        { latitude: 24, longitude: 46 },
      ),
    ).toBe(0);
  });
});

describe("formatDistanceKm", () => {
  test("empty string for non-positive or non-finite input", () => {
    expect(formatDistanceKm(0)).toBe("");
    expect(formatDistanceKm(-1)).toBe("");
    expect(formatDistanceKm(Number.NaN)).toBe("");
    expect(formatDistanceKm(Number.POSITIVE_INFINITY)).toBe("");
  });

  test("renders sub-kilometer distances in meters, rounded to nearest 50", () => {
    expect(formatDistanceKm(0.3)).toBe("٣٠٠ م");
    expect(formatDistanceKm(0.12)).toBe("١٠٠ م");
    expect(formatDistanceKm(0.02)).toBe("٥٠ م"); // clamp to 50 minimum
  });

  test("renders 1–10 km with one decimal place", () => {
    expect(formatDistanceKm(2.45)).toBe("٢٫٥ كم");
    expect(formatDistanceKm(9.04)).toBe("٩٫٠ كم");
  });

  test("renders >=10 km with no decimal", () => {
    expect(formatDistanceKm(12)).toBe("١٢ كم");
    expect(formatDistanceKm(123.7)).toBe("١٢٤ كم");
  });
});
