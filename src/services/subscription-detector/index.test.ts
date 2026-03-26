import type { MockTransaction } from "../../components/recurring/recurring-types";
import { detectSubscriptions } from "./index";

// Helper: generate N transactions for a payee at regular intervals
function generateRecurring(
  payee: string,
  amount: number,
  intervalDays: number,
  count: number,
  categoryId: string,
  type: "income" | "expense" = "expense",
  startDate = new Date("2025-06-01")
): MockTransaction[] {
  return Array.from({ length: count }, (_, i) => {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i * intervalDays);
    return {
      id: `txn_${payee}_${i}`,
      payee,
      amount,
      date: date.toISOString().split("T")[0],
      categoryId,
      type,
    };
  });
}

describe("subscription-detector", () => {
  it("returns empty array when fewer than 3 transactions for any payee", () => {
    const transactions: MockTransaction[] = [
      {
        id: "1",
        payee: "Netflix",
        amount: 50000,
        date: "2025-10-01",
        categoryId: "ent",
        type: "expense",
      },
      {
        id: "2",
        payee: "Netflix",
        amount: 50000,
        date: "2025-11-01",
        categoryId: "ent",
        type: "expense",
      },
    ];
    const result = detectSubscriptions(transactions);
    expect(result).toEqual([]);
  });

  it("detects monthly subscription (3+ transactions ~30 days apart)", () => {
    const transactions = generateRecurring("Netflix", 50000, 30, 6, "ent");
    const result = detectSubscriptions(transactions);
    expect(result.length).toBe(1);
    expect(result[0].payee).toBe("Netflix");
    expect(result[0].frequency).toBe("monthly");
    expect(result[0].occurrences).toBe(6);
  });

  it("detects weekly subscription (3+ transactions ~7 days apart)", () => {
    const transactions = generateRecurring("Cleaning Service", 100000, 7, 5, "services");
    const result = detectSubscriptions(transactions);
    expect(result.length).toBe(1);
    expect(result[0].payee).toBe("Cleaning Service");
    expect(result[0].frequency).toBe("weekly");
  });

  it("detects yearly subscription (3+ transactions ~365 days apart)", () => {
    const transactions = generateRecurring("Domain Renewal", 200000, 365, 3, "tech");
    const result = detectSubscriptions(transactions);
    expect(result.length).toBe(1);
    expect(result[0].payee).toBe("Domain Renewal");
    expect(result[0].frequency).toBe("yearly");
  });

  it("does NOT flag payees where amount variance exceeds 20%", () => {
    // Amounts have high variance (std dev / mean > 0.2)
    const transactions: MockTransaction[] = [
      {
        id: "1",
        payee: "Groceries",
        amount: 50000,
        date: "2025-07-01",
        categoryId: "food",
        type: "expense",
      },
      {
        id: "2",
        payee: "Groceries",
        amount: 100000,
        date: "2025-08-01",
        categoryId: "food",
        type: "expense",
      },
      {
        id: "3",
        payee: "Groceries",
        amount: 30000,
        date: "2025-09-01",
        categoryId: "food",
        type: "expense",
      },
      {
        id: "4",
        payee: "Groceries",
        amount: 80000,
        date: "2025-10-01",
        categoryId: "food",
        type: "expense",
      },
    ];
    const result = detectSubscriptions(transactions);
    expect(result).toEqual([]);
  });

  it("returns confidence score between 0 and 1, higher for more consistent intervals", () => {
    const consistent = generateRecurring("Spotify", 25000, 30, 6, "ent");
    const result = detectSubscriptions(consistent);
    expect(result.length).toBe(1);
    expect(result[0].confidence).toBeGreaterThanOrEqual(0);
    expect(result[0].confidence).toBeLessThanOrEqual(1);
    expect(result[0].confidence).toBeGreaterThanOrEqual(0.8);
  });

  it("handles tolerance of +/-3 days for interval detection", () => {
    // Intervals: 28, 31, 30, 29 days (all within +/-3 of 30)
    const transactions: MockTransaction[] = [
      {
        id: "1",
        payee: "Internet",
        amount: 80000,
        date: "2025-06-01",
        categoryId: "util",
        type: "expense",
      },
      {
        id: "2",
        payee: "Internet",
        amount: 80000,
        date: "2025-06-29",
        categoryId: "util",
        type: "expense",
      },
      {
        id: "3",
        payee: "Internet",
        amount: 80000,
        date: "2025-07-30",
        categoryId: "util",
        type: "expense",
      },
      {
        id: "4",
        payee: "Internet",
        amount: 80000,
        date: "2025-08-29",
        categoryId: "util",
        type: "expense",
      },
      {
        id: "5",
        payee: "Internet",
        amount: 80000,
        date: "2025-09-27",
        categoryId: "util",
        type: "expense",
      },
    ];
    const result = detectSubscriptions(transactions);
    expect(result.length).toBe(1);
    expect(result[0].frequency).toBe("monthly");
  });

  it("returns results sorted by confidence descending", () => {
    const perfect = generateRecurring("Netflix", 50000, 30, 6, "ent");
    // Slightly varied intervals for Spotify
    const varied: MockTransaction[] = [
      {
        id: "s1",
        payee: "Spotify",
        amount: 25000,
        date: "2025-06-01",
        categoryId: "ent",
        type: "expense",
      },
      {
        id: "s2",
        payee: "Spotify",
        amount: 25000,
        date: "2025-07-02",
        categoryId: "ent",
        type: "expense",
      },
      {
        id: "s3",
        payee: "Spotify",
        amount: 25000,
        date: "2025-07-30",
        categoryId: "ent",
        type: "expense",
      },
      {
        id: "s4",
        payee: "Spotify",
        amount: 25000,
        date: "2025-09-01",
        categoryId: "ent",
        type: "expense",
      },
    ];
    const result = detectSubscriptions([...perfect, ...varied]);
    expect(result.length).toBe(2);
    expect(result[0].confidence).toBeGreaterThanOrEqual(result[1].confidence);
  });
});
