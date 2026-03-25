import {
  paisaToTaka,
  takaToPaisa,
  formatCurrency,
  formatCurrencyShort,
  toBengaliNumerals,
  parseCurrencyInput,
} from "./currency";

describe("currency utilities", () => {
  describe("paisaToTaka", () => {
    it("converts paisa to taka", () => {
      expect(paisaToTaka(10000)).toBe(100);
      expect(paisaToTaka(0)).toBe(0);
      expect(paisaToTaka(50)).toBe(0.5);
    });

    it("handles negative values", () => {
      expect(paisaToTaka(-5000)).toBe(-50);
    });
  });

  describe("takaToPaisa", () => {
    it("converts taka to paisa with rounding", () => {
      expect(takaToPaisa(100)).toBe(10000);
      expect(takaToPaisa(0.5)).toBe(50);
      // 1.005 * 100 = 100.49999... due to floating point, rounds to 100
      expect(takaToPaisa(1.005)).toBe(100);
      expect(takaToPaisa(1.006)).toBe(101);
    });

    it("handles zero", () => {
      expect(takaToPaisa(0)).toBe(0);
    });
  });

  describe("toBengaliNumerals", () => {
    it("converts ASCII digits to Bengali digits", () => {
      expect(toBengaliNumerals("123")).toBe("\u09E7\u09E8\u09E9");
      expect(toBengaliNumerals("0")).toBe("\u09E6");
      expect(toBengaliNumerals("9876543210")).toBe("\u09EF\u09EE\u09ED\u09EC\u09EB\u09EA\u09E9\u09E8\u09E7\u09E6");
    });

    it("preserves non-digit characters", () => {
      expect(toBengaliNumerals("1,000.50")).toBe("\u09E7,\u09E6\u09E6\u09E6.\u09EB\u09E6");
    });
  });

  describe("formatCurrency", () => {
    it("formats positive amounts with taka symbol", () => {
      expect(formatCurrency(50000)).toContain("500.00");
      expect(formatCurrency(50000)).toContain("\u09F3");
    });

    it("formats negative amounts with minus sign", () => {
      expect(formatCurrency(-50000)).toMatch(/^-\u09F3/);
    });

    it("formats zero", () => {
      expect(formatCurrency(0)).toContain("0.00");
    });
  });

  describe("formatCurrencyShort", () => {
    it("uses short format for large amounts", () => {
      // 1000 taka = 100000 paisa
      expect(formatCurrencyShort(100000 * 100)).toContain("\u09F3");
    });

    it("falls back to full format for small amounts", () => {
      expect(formatCurrencyShort(5000)).toContain("50.00");
    });
  });

  describe("parseCurrencyInput", () => {
    it("parses numeric string to paisa", () => {
      expect(parseCurrencyInput("500")).toBe(50000);
    });

    it("returns 0 for empty or invalid input", () => {
      expect(parseCurrencyInput("")).toBe(0);
      expect(parseCurrencyInput("abc")).toBe(0);
    });

    it("strips taka symbol and commas", () => {
      expect(parseCurrencyInput("\u09F31,000")).toBe(100000);
    });
  });
});
