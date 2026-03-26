import { calculateDaysOfBuffering, calculateSinkingFundSuggest } from "./index";

describe("calculateDaysOfBuffering", () => {
  it("returns null when totalBalance <= 0", () => {
    const outflows = [{ date: "2026-03-01", amount: -5000 }];
    expect(calculateDaysOfBuffering(-100, outflows, 90)).toBeNull();
    expect(calculateDaysOfBuffering(0, outflows, 90)).toBeNull();
  });

  it("returns null when outflows array is empty", () => {
    expect(calculateDaysOfBuffering(100000, [], 90)).toBeNull();
  });

  it("returns null when no outflows in lookback period", () => {
    const outflows = [{ date: "2020-01-01", amount: -5000 }];
    expect(calculateDaysOfBuffering(100000, outflows, 90)).toBeNull();
  });

  it("returns integer days for valid inputs", () => {
    // 2 outflows totaling 20000 paisa over 90 day lookback
    // avgDaily = 20000 / 90 = 222.22
    // 900000 / 222.22 = 4050
    const outflows = [
      { date: "2026-03-01", amount: -10000 },
      { date: "2026-03-02", amount: -10000 },
    ];
    const result = calculateDaysOfBuffering(900000, outflows, 90);
    expect(result).toBe(Math.floor(900000 / (20000 / 90)));
    expect(Number.isInteger(result)).toBe(true);
  });

  it("handles custom lookback period (30 days vs 90 days)", () => {
    const outflows = [
      { date: "2026-03-01", amount: -10000 },
      { date: "2026-03-15", amount: -10000 },
    ];
    const result30 = calculateDaysOfBuffering(900000, outflows, 30);
    const result90 = calculateDaysOfBuffering(900000, outflows, 90);
    // Same outflow total but different divisor -> 30 day period yields lower buffer
    // 30 day: avgDaily = 20000/30 = 666.67 -> 900000/666.67 = 1350
    // 90 day: avgDaily = 20000/90 = 222.22 -> 900000/222.22 = 4050
    expect(result30).toBe(Math.floor(900000 / (20000 / 30)));
    expect(result90).toBe(Math.floor(900000 / (20000 / 90)));
    expect(result30).toBeLessThan(result90!);
  });

  it("only considers negative amounts as expenses", () => {
    const outflows = [
      { date: "2026-03-01", amount: -10000 },
      { date: "2026-03-02", amount: 50000 }, // positive = not expense
    ];
    const result = calculateDaysOfBuffering(900000, outflows, 90);
    // Only -10000 counted, avgDaily = 10000/90
    expect(result).toBe(Math.floor(900000 / (10000 / 90)));
  });
});

describe("calculateSinkingFundSuggest", () => {
  it("returns (target - accumulated) / monthsRemaining rounded up", () => {
    expect(calculateSinkingFundSuggest(1200000, 400000, 4)).toBe(200000);
  });

  it("returns full remaining amount when monthsRemaining <= 0", () => {
    expect(calculateSinkingFundSuggest(1200000, 400000, 0)).toBe(800000);
    expect(calculateSinkingFundSuggest(1200000, 400000, -1)).toBe(800000);
  });

  it("returns 0 when accumulated >= target", () => {
    expect(calculateSinkingFundSuggest(1200000, 1200000, 4)).toBe(0);
  });

  it("returns 0 when accumulated > target", () => {
    expect(calculateSinkingFundSuggest(1200000, 1500000, 4)).toBe(0);
  });

  it("rounds up to integer paisa (Math.ceil)", () => {
    // 1000000 / 3 = 333333.33... -> ceil = 333334
    expect(calculateSinkingFundSuggest(1000000, 0, 3)).toBe(333334);
  });
});
