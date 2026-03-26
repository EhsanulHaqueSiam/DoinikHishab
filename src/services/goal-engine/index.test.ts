import {
  calculateMonthlyContribution,
  calculateGoalStatus,
  generateAmortization,
  compareStrategies,
  getGoalBudgetCategories,
} from "./index";
import type { SaveUpGoal } from "../goal-storage/types";

describe("goal-engine", () => {
  describe("calculateMonthlyContribution", () => {
    it("returns (target - current) / remaining months", () => {
      // 6 months away, need 60000 more paisa => 10000/month
      const sixMonthsAway = new Date();
      sixMonthsAway.setMonth(sixMonthsAway.getMonth() + 6);
      const targetDate = sixMonthsAway.toISOString().slice(0, 10);

      const result = calculateMonthlyContribution(100000, 40000, targetDate);
      expect(result).toBe(10000);
    });

    it("returns 0 when goal is funded (current >= target)", () => {
      const result = calculateMonthlyContribution(100000, 100000, "2026-12-31");
      expect(result).toBe(0);
    });

    it("returns 0 when current exceeds target", () => {
      const result = calculateMonthlyContribution(100000, 150000, "2026-12-31");
      expect(result).toBe(0);
    });

    it("returns full remaining when target date is this month", () => {
      const now = new Date();
      const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-28`;
      const result = calculateMonthlyContribution(100000, 40000, thisMonth);
      expect(result).toBe(60000); // full remaining
    });

    it("returns full remaining when target date is in the past", () => {
      const result = calculateMonthlyContribution(100000, 40000, "2020-01-01");
      expect(result).toBe(60000);
    });
  });

  describe("calculateGoalStatus", () => {
    it('returns "funded" when currentAmount >= targetAmount', () => {
      const result = calculateGoalStatus(
        100000,
        100000,
        "2026-12-31",
        "2026-01-01"
      );
      expect(result).toBe("funded");
    });

    it('returns "ahead" when progress > expected + 5%', () => {
      // Created 2026-01-01, target 2026-12-31 = 12 months total
      // Now is ~March 2026 = ~3 months elapsed
      // Expected progress ~ 3/12 = 25%
      // Current = 40000/100000 = 40% => 40% > 25% + 5% = 30% => ahead
      const result = calculateGoalStatus(
        40000,
        100000,
        "2026-12-31",
        "2026-01-01"
      );
      expect(result).toBe("ahead");
    });

    it('returns "on_track" when progress within 5% of expected', () => {
      // Expected ~ 25%, current = 27000/100000 = 27% => within 5% band
      const result = calculateGoalStatus(
        27000,
        100000,
        "2026-12-31",
        "2026-01-01"
      );
      expect(result).toBe("on_track");
    });

    it('returns "behind" when progress < expected - 5%', () => {
      // Expected ~ 25%, current = 10000/100000 = 10% => 10% < 25% - 5% = 20% => behind
      const result = calculateGoalStatus(
        10000,
        100000,
        "2026-12-31",
        "2026-01-01"
      );
      expect(result).toBe("behind");
    });
  });

  describe("generateAmortization", () => {
    it("produces rows where final balance is 0", () => {
      // 10,00,000 paisa balance, 12% APR, 50,000 paisa min payment
      const rows = generateAmortization(1000000, 12, 50000);
      expect(rows.length).toBeGreaterThan(0);
      expect(rows[rows.length - 1].balance).toBe(0);
    });

    it("each row's principal + interest = payment (within rounding)", () => {
      const rows = generateAmortization(1000000, 12, 50000);
      for (const row of rows) {
        // Allow rounding tolerance of 1 paisa
        expect(Math.abs(row.principal + row.interest - row.payment)).toBeLessThanOrEqual(1);
      }
    });

    it("caps at 360 months maximum", () => {
      // Very low payment relative to balance to force cap
      const rows = generateAmortization(100000000, 24, 10000);
      expect(rows.length).toBeLessThanOrEqual(360);
    });

    it("all amounts are integers (paisa)", () => {
      const rows = generateAmortization(1000000, 12, 50000);
      for (const row of rows) {
        expect(Number.isInteger(row.payment)).toBe(true);
        expect(Number.isInteger(row.principal)).toBe(true);
        expect(Number.isInteger(row.interest)).toBe(true);
        expect(Number.isInteger(row.balance)).toBe(true);
      }
    });

    it("handles zero APR correctly", () => {
      const rows = generateAmortization(100000, 0, 25000);
      expect(rows).toHaveLength(4);
      for (const row of rows) {
        expect(row.interest).toBe(0);
      }
      expect(rows[rows.length - 1].balance).toBe(0);
    });
  });

  describe("compareStrategies", () => {
    it("avalanche total interest <= snowball total interest for 2 debts", () => {
      const debts = [
        { name: "Credit Card", balance: 500000, aprPercent: 24, minPayment: 25000 },
        { name: "Car Loan", balance: 1000000, aprPercent: 8, minPayment: 30000 },
      ];

      const result = compareStrategies(debts, 20000);
      expect(result.avalanche.totalInterest).toBeLessThanOrEqual(
        result.snowball.totalInterest
      );
    });

    it("both strategies pay off all debts (payoffMonths > 0)", () => {
      const debts = [
        { name: "Credit Card", balance: 500000, aprPercent: 24, minPayment: 25000 },
        { name: "Car Loan", balance: 1000000, aprPercent: 8, minPayment: 30000 },
      ];

      const result = compareStrategies(debts, 20000);
      expect(result.avalanche.payoffMonths).toBeGreaterThan(0);
      expect(result.snowball.payoffMonths).toBeGreaterThan(0);
    });

    it("strategies have correct strategy label", () => {
      const debts = [
        { name: "Debt A", balance: 100000, aprPercent: 10, minPayment: 10000 },
      ];
      const result = compareStrategies(debts);
      expect(result.avalanche.strategy).toBe("avalanche");
      expect(result.snowball.strategy).toBe("snowball");
    });
  });

  describe("getGoalBudgetCategories", () => {
    it('returns category per save-up goal with "Goal: [name]" naming', () => {
      const goals: SaveUpGoal[] = [
        {
          id: "goal_1",
          name: "Emergency Fund",
          targetAmount: 500000,
          currentAmount: 100000,
          targetDate: "2026-12-31",
          linkedAccountId: "mock_acc_1",
          createdDate: "2026-01-01",
        },
      ];

      const categories = getGoalBudgetCategories(goals);
      expect(categories).toHaveLength(1);
      expect(categories[0].name).toBe("Goal: Emergency Fund");
      expect(categories[0].id).toBe("goal_cat_goal_1");
      expect(categories[0].groupId).toBe("mock_grp_savings");
    });

    it("monthly target equals calculateMonthlyContribution result", () => {
      const sixMonthsAway = new Date();
      sixMonthsAway.setMonth(sixMonthsAway.getMonth() + 6);
      const targetDate = sixMonthsAway.toISOString().slice(0, 10);

      const goals: SaveUpGoal[] = [
        {
          id: "goal_2",
          name: "Vacation",
          targetAmount: 300000,
          currentAmount: 60000,
          targetDate,
          linkedAccountId: "mock_acc_2",
          createdDate: "2026-01-01",
        },
      ];

      const categories = getGoalBudgetCategories(goals);
      const expectedMonthly = calculateMonthlyContribution(
        300000,
        60000,
        targetDate
      );
      expect(categories[0].targetAmount).toBe(expectedMonthly);
    });

    it("activity equals goal currentAmount", () => {
      const goals: SaveUpGoal[] = [
        {
          id: "goal_3",
          name: "Eid Fund",
          targetAmount: 200000,
          currentAmount: 75000,
          targetDate: "2026-09-15",
          linkedAccountId: "mock_acc_1",
          createdDate: "2026-01-01",
        },
      ];

      const categories = getGoalBudgetCategories(goals);
      expect(categories[0].activity).toBe(75000);
    });
  });
});
