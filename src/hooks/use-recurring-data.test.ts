import { renderHook } from "@testing-library/react-native";
import type { Subscription } from "../components/recurring/recurring-types";
import { projectCashFlow, useRecurringData } from "./use-recurring-data";

// Mock the storage service to return empty data (clean state)
jest.mock("../services/recurring-storage", () => ({
  getSubscriptions: jest.fn(() => []),
  getDismissedPayees: jest.fn(() => []),
}));

describe("useRecurringData", () => {
  it("returns bills, subscriptions, and detectedSubscriptions arrays", () => {
    const { result } = renderHook(() => useRecurringData());
    expect(Array.isArray(result.current.bills)).toBe(true);
    expect(Array.isArray(result.current.subscriptions)).toBe(true);
    expect(Array.isArray(result.current.detectedSubscriptions)).toBe(true);
    expect(result.current.isLoading).toBe(false);
  });

  it("detects recurring patterns from mock transactions", () => {
    const { result } = renderHook(() => useRecurringData());
    // Should detect Netflix, Spotify, Gym, Internet, Electricity, Salary
    // but NOT Groceries Store (irregular)
    expect(result.current.detectedSubscriptions.length).toBeGreaterThanOrEqual(4);
    const payees = result.current.detectedSubscriptions.map((d) => d.payee);
    expect(payees).toContain("Netflix");
    expect(payees).not.toContain("Groceries Store");
  });

  it("detected subscriptions do not include dismissed payees", () => {
    // Override the mock to return dismissed payees
    const storage = require("../services/recurring-storage");
    storage.getDismissedPayees.mockReturnValueOnce(["Netflix"]);

    const { result } = renderHook(() => useRecurringData());
    const payees = result.current.detectedSubscriptions.map((d) => d.payee);
    expect(payees).not.toContain("Netflix");
  });
});

describe("projectCashFlow", () => {
  const mockSubscriptions: Subscription[] = [
    {
      id: "sub_1",
      payee: "Internet",
      amount: 80000,
      frequency: "monthly",
      categoryId: "util",
      nextDueDate: "2026-03-15",
      isActive: true,
      type: "expense",
    },
    {
      id: "sub_2",
      payee: "Salary",
      amount: 6000000,
      frequency: "monthly",
      categoryId: "salary",
      nextDueDate: "2026-03-25",
      isActive: true,
      type: "income",
    },
  ];

  it("returns correct number of data points (days + 1)", () => {
    const result = projectCashFlow(1000000, [], 30);
    expect(result).toHaveLength(31); // days + 1 (includes day 0)
  });

  it("decreases balance for expense subscriptions", () => {
    // Use only expense subscription
    const expenseOnly = [mockSubscriptions[0]];
    const result = projectCashFlow(1000000, expenseOnly, 60);

    // The final balance should be less than or equal to the starting balance
    // (expense occurs at least once in 60 days)
    const finalBalance = result[result.length - 1].value;
    expect(finalBalance).toBeLessThanOrEqual(1000000);
  });

  it("increases balance for income subscriptions", () => {
    // Use only income subscription
    const incomeOnly = [mockSubscriptions[1]];
    const result = projectCashFlow(1000000, incomeOnly, 60);

    // The final balance should be greater than or equal to starting balance
    const finalBalance = result[result.length - 1].value;
    expect(finalBalance).toBeGreaterThanOrEqual(1000000);
  });

  it("returns starting balance on day 0 when no subscriptions due", () => {
    const result = projectCashFlow(5000000, [], 30);
    expect(result[0].value).toBe(5000000);
  });

  it("each data point has date and value properties", () => {
    const result = projectCashFlow(1000000, mockSubscriptions, 7);
    for (const point of result) {
      expect(point).toHaveProperty("date");
      expect(point).toHaveProperty("value");
      expect(point.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(typeof point.value).toBe("number");
    }
  });
});
