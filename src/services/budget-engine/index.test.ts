import {
  calculateAgeOfMoney,
  calculateAutoAssign,
  calculateAvailable,
  calculateCCPaymentAvailable,
  calculateReadyToAssign,
  getOverspentAmount,
} from "./index";

describe("budget-engine", () => {
  describe("calculateReadyToAssign", () => {
    it("computes income minus assigned minus prior overspent", () => {
      expect(calculateReadyToAssign(100000, 80000, 5000)).toBe(15000);
    });

    it("returns zero when all balanced", () => {
      expect(calculateReadyToAssign(0, 0, 0)).toBe(0);
    });

    it("returns negative when over-assigned", () => {
      expect(calculateReadyToAssign(50000, 60000, 0)).toBe(-10000);
    });
  });

  describe("calculateAvailable", () => {
    it("sums prior available + assigned + activity", () => {
      expect(calculateAvailable(50000, -20000, 10000)).toBe(40000);
    });

    it("handles all zeros", () => {
      expect(calculateAvailable(0, 0, 0)).toBe(0);
    });

    it("handles negative activity (spending)", () => {
      expect(calculateAvailable(30000, -30000, 0)).toBe(0);
    });
  });

  describe("calculateAgeOfMoney", () => {
    it("returns null for empty inflows", () => {
      expect(calculateAgeOfMoney([], [{ date: "2026-03-01", amount: -5000 }])).toBeNull();
    });

    it("returns null for empty outflows", () => {
      expect(calculateAgeOfMoney([{ date: "2026-03-01", amount: 5000 }], [])).toBeNull();
    });

    it("calculates age for simple inflow/outflow pair", () => {
      const inflows = [{ date: "2026-03-01", amount: 10000 }];
      const outflows = [{ date: "2026-03-11", amount: -5000 }];
      const age = calculateAgeOfMoney(inflows, outflows);
      expect(age).toBe(10);
    });
  });

  describe("getOverspentAmount", () => {
    it("returns absolute value when negative", () => {
      expect(getOverspentAmount(-5000)).toBe(5000);
    });

    it("returns 0 when positive", () => {
      expect(getOverspentAmount(5000)).toBe(0);
    });

    it("returns 0 when zero", () => {
      expect(getOverspentAmount(0)).toBe(0);
    });
  });

  describe("calculateAutoAssign", () => {
    it("returns lastMonthAssigned for last_month_budgeted strategy", () => {
      expect(calculateAutoAssign("last_month_budgeted", 50000, -30000, -25000, 40000, 10000)).toBe(
        50000
      );
    });

    it("returns absolute lastMonthActivity for last_month_spent strategy", () => {
      expect(calculateAutoAssign("last_month_spent", 50000, -30000, -25000, 40000, 10000)).toBe(
        30000
      );
    });

    it("returns absolute averageActivity for average_spent strategy", () => {
      expect(calculateAutoAssign("average_spent", 50000, -30000, -25000, 40000, 10000)).toBe(25000);
    });

    it("returns shortfall for underfunded strategy", () => {
      expect(calculateAutoAssign("underfunded", 50000, -30000, -25000, 40000, 10000)).toBe(30000);
    });

    it("returns 0 for underfunded when already funded", () => {
      expect(calculateAutoAssign("underfunded", 50000, -30000, -25000, 40000, 50000)).toBe(0);
    });

    it("returns 0 for reset_to_zero strategy", () => {
      expect(calculateAutoAssign("reset_to_zero", 50000, -30000, -25000, 40000, 10000)).toBe(0);
    });
  });

  describe("calculateCCPaymentAvailable", () => {
    it("computes budgeted + activity + abs(spending)", () => {
      expect(calculateCCPaymentAvailable(10000, -5000, -8000)).toBe(13000);
    });

    it("returns budgeted when no activity or spending", () => {
      expect(calculateCCPaymentAvailable(10000, 0, 0)).toBe(10000);
    });
  });
});
