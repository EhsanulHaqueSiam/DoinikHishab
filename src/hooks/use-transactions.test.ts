import { renderHook } from "@testing-library/react-native";
import { useQuery } from "convex/react";
import { useFilteredTransactions, useTransactionSearch } from "./use-transactions";

// useQuery is already mocked globally in jest.setup.js
const mockUseQuery = useQuery as jest.Mock;

// Mock transaction data
const mockTransactions = [
  {
    _id: "t1",
    date: "2026-03-15",
    amount: -5000,
    type: "expense",
    description: "Lunch",
    memo: null,
    payeeId: null,
    categoryId: "c1",
    source: "manual",
    isCleared: true,
    isReconciled: false,
    flag: null,
    accountId: "a1",
  },
  {
    _id: "t2",
    date: "2026-03-14",
    amount: 100000,
    type: "income",
    description: "Salary",
    memo: "March salary",
    payeeId: null,
    categoryId: "c2",
    source: "manual",
    isCleared: false,
    isReconciled: false,
    flag: null,
    accountId: "a1",
  },
  {
    _id: "t3",
    date: "2026-03-13",
    amount: -2000,
    type: "expense",
    description: "Bus fare",
    memo: null,
    payeeId: null,
    categoryId: "c1",
    source: "manual",
    isCleared: true,
    isReconciled: false,
    flag: "red",
    accountId: "a1",
  },
];

describe("useFilteredTransactions", () => {
  beforeEach(() => {
    mockUseQuery.mockReset();
  });

  it("returns empty array when userId is null", () => {
    mockUseQuery.mockReturnValue(undefined);
    const { result } = renderHook(() => useFilteredTransactions(null));
    expect(result.current).toEqual([]);
  });

  it("returns all transactions when no filters applied", () => {
    mockUseQuery.mockReturnValue(mockTransactions);
    const { result } = renderHook(() => useFilteredTransactions("user1" as any));
    expect(result.current).toHaveLength(3);
  });

  it("filters by type", () => {
    mockUseQuery.mockReturnValue(mockTransactions);
    const { result } = renderHook(() =>
      useFilteredTransactions("user1" as any, undefined, { type: "expense" })
    );
    expect(result.current).toHaveLength(2);
    expect(result.current.every((t: any) => t.type === "expense")).toBe(true);
  });

  it("filters by cleared status", () => {
    mockUseQuery.mockReturnValue(mockTransactions);
    const { result } = renderHook(() =>
      useFilteredTransactions("user1" as any, undefined, { isCleared: true })
    );
    expect(result.current).toHaveLength(2);
  });

  it("filters by amount range", () => {
    mockUseQuery.mockReturnValue(mockTransactions);
    const { result } = renderHook(() =>
      useFilteredTransactions("user1" as any, undefined, { amountMin: -3000 })
    );
    // Only transactions with amount >= -3000: Bus fare (-2000) and Salary (100000)
    expect(result.current).toHaveLength(2);
  });

  it("filters by date range", () => {
    mockUseQuery.mockReturnValue(mockTransactions);
    const { result } = renderHook(() =>
      useFilteredTransactions("user1" as any, undefined, { dateFrom: "2026-03-14" })
    );
    // Only March 14 and 15
    expect(result.current).toHaveLength(2);
  });

  it("filters by description text", () => {
    mockUseQuery.mockReturnValue(mockTransactions);
    const { result } = renderHook(() =>
      useFilteredTransactions("user1" as any, undefined, { description: "lunch" })
    );
    expect(result.current).toHaveLength(1);
    expect(result.current[0]._id).toBe("t1");
  });
});

describe("useTransactionSearch", () => {
  beforeEach(() => {
    mockUseQuery.mockReset();
  });

  it("returns empty array for empty query", () => {
    mockUseQuery.mockReturnValue(mockTransactions);
    const { result } = renderHook(() => useTransactionSearch("user1" as any, ""));
    expect(result.current).toEqual([]);
  });

  it("searches by description", () => {
    mockUseQuery.mockReturnValue(mockTransactions);
    const { result } = renderHook(() => useTransactionSearch("user1" as any, "lunch"));
    expect(result.current).toHaveLength(1);
    expect(result.current[0]._id).toBe("t1");
  });

  it("searches by memo", () => {
    mockUseQuery.mockReturnValue(mockTransactions);
    const { result } = renderHook(() => useTransactionSearch("user1" as any, "March salary"));
    expect(result.current).toHaveLength(1);
    expect(result.current[0]._id).toBe("t2");
  });
});
