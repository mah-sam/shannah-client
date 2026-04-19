import { etaProvider, formatEta, etaSortKey } from "../../services/eta.service";

describe("etaProvider (default heuristic)", () => {
  test("has a stable id so downstream analytics can tell providers apart", () => {
    expect(etaProvider.id()).toBe("heuristic");
  });

  test("returns null when prep is missing", () => {
    expect(etaProvider.estimate({ prepMinutes: null, distanceKm: 5 })).toBeNull();
  });

  test("returns a range for valid prep", () => {
    const r = etaProvider.estimate({ prepMinutes: 20, distanceKm: 5 });
    expect(r).not.toBeNull();
    expect(r!.min).toBeGreaterThanOrEqual(10);
    expect(r!.max).toBeGreaterThan(r!.min);
  });

  test("formatEta matches the legacy formatter", () => {
    expect(formatEta(null)).toBe("");
    expect(formatEta({ min: 20, max: 35 })).toBe("٢٠-٣٥ دقيقة");
  });

  test("etaSortKey maps null to MAX_SAFE_INTEGER so it sorts last", () => {
    expect(etaSortKey(null)).toBe(Number.MAX_SAFE_INTEGER);
    expect(etaSortKey({ min: 10, max: 20 })).toBe(15);
  });
});
