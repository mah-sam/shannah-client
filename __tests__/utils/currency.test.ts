import { formatInt, formatSAR } from "../../utils/currency";

describe("formatSAR", () => {
  test("formats a whole number with two decimals", () => {
    expect(formatSAR(25)).toBe("٢٥٫٠٠");
  });

  test("formats a fractional number with two decimals", () => {
    expect(formatSAR(12.5)).toBe("١٢٫٥٠");
  });

  test("rounds to two decimals", () => {
    expect(formatSAR(9.999)).toBe("١٠٫٠٠");
    expect(formatSAR(9.994)).toBe("٩٫٩٩");
  });

  test("falls back to 0 for nullish or NaN input", () => {
    expect(formatSAR(null)).toBe("٠٫٠٠");
    expect(formatSAR(undefined)).toBe("٠٫٠٠");
    expect(formatSAR(Number.NaN)).toBe("٠٫٠٠");
    expect(formatSAR(Number.POSITIVE_INFINITY)).toBe("٠٫٠٠");
  });

  test("accepts a numeric string", () => {
    expect(formatSAR("45.5")).toBe("٤٥٫٥٠");
  });
});

describe("formatInt", () => {
  test("rounds and returns Arabic digits", () => {
    expect(formatInt(5)).toBe("٥");
    expect(formatInt(9.7)).toBe("١٠");
  });

  test("returns ٠ for nullish input", () => {
    expect(formatInt(null)).toBe("٠");
    expect(formatInt(undefined)).toBe("٠");
  });
});
