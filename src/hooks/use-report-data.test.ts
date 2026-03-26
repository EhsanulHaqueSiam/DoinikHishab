import { renderHook } from "@testing-library/react-native";
import { useReportData } from "./use-report-data";

describe("useReportData", () => {
  it("returns 1 month of data for 1M range", () => {
    const { result } = renderHook(() => useReportData("1M", "2026-03"));
    expect(result.current.data).toHaveLength(1);
    expect(result.current.isLoading).toBe(false);
  });

  it("returns 3 months of data for 3M range", () => {
    const { result } = renderHook(() => useReportData("3M", "2026-03"));
    expect(result.current.data).toHaveLength(3);
  });

  it("returns 6 months of data for 6M range", () => {
    const { result } = renderHook(() => useReportData("6M", "2026-03"));
    expect(result.current.data.length).toBeLessThanOrEqual(6);
  });

  it("returns all data for ALL range", () => {
    const { result } = renderHook(() => useReportData("ALL", "2026-07"));
    expect(result.current.data.length).toBeGreaterThan(6);
  });

  it("returns correctly shaped MonthlyReportData", () => {
    const { result } = renderHook(() => useReportData("1M", "2026-03"));
    const month = result.current.data[0];
    expect(month).toHaveProperty("month");
    expect(month).toHaveProperty("income");
    expect(month).toHaveProperty("expense");
    expect(month).toHaveProperty("spendingByCategory");
    expect(month).toHaveProperty("netWorth");
    expect(month).toHaveProperty("ageOfMoney");
    expect(month).toHaveProperty("daysOfBuffering");
  });

  it("has currentMonth matching the requested period", () => {
    const { result } = renderHook(() => useReportData("6M", "2026-03"));
    expect(result.current.currentMonth?.month).toBe("2026-03");
  });

  it("category IDs use mock_ prefix", () => {
    const { result } = renderHook(() => useReportData("1M", "2026-03"));
    const cats = result.current.data[0]?.spendingByCategory ?? [];
    for (const cat of cats) {
      expect(cat.categoryId).toMatch(/^mock_/);
    }
  });

  it("has positive income and expense values", () => {
    const { result } = renderHook(() => useReportData("ALL", "2026-09"));
    for (const month of result.current.data) {
      expect(month.income).toBeGreaterThan(0);
      expect(month.expense).toBeGreaterThan(0);
    }
  });

  it("net equals income minus expense", () => {
    const { result } = renderHook(() => useReportData("1M", "2026-03"));
    const month = result.current.data[0];
    expect(month.net).toBe(month.income - month.expense);
  });
});
