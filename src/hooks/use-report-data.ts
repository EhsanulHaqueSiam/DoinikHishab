/**
 * Report data hook.
 * Returns monthly report data filtered by time range.
 * Uses mock data when Convex backend is offline.
 */

import { useMemo } from "react";
import type { MonthlyReportData, TimeRange } from "../components/reports/report-types";

// Re-export for convenience
export type { MonthlyReportData } from "../components/reports/report-types";

// Category templates with mock_ prefix per Phase 2 convention
const CATEGORIES = [
  { categoryId: "mock_cat_1", name: "Groceries", color: "#3B82F6" },
  { categoryId: "mock_cat_2", name: "Transport", color: "#EF4444" },
  { categoryId: "mock_cat_3", name: "Utilities", color: "#10B981" },
  { categoryId: "mock_cat_4", name: "Dining", color: "#F59E0B" },
  { categoryId: "mock_cat_5", name: "Medical", color: "#8B5CF6" },
  { categoryId: "mock_cat_6", name: "Shopping", color: "#EC4899" },
  { categoryId: "mock_cat_7", name: "Education", color: "#06B6D4" },
  { categoryId: "mock_cat_8", name: "Other", color: "#F97316" },
];

// Deterministic variation for mock data
function vary(base: number, index: number, range: number): number {
  const factor = Math.sin(index * 2.7 + 1.3) * range;
  return Math.round(base + factor);
}

function generateSpending(
  monthIndex: number,
  totalExpense: number
): MonthlyReportData["spendingByCategory"] {
  const weights = [0.3, 0.16, 0.13, 0.12, 0.1, 0.09, 0.06, 0.04];
  const adjusted = weights.map((w, i) => {
    const shift = Math.sin(monthIndex * 1.7 + i * 0.9) * 0.03;
    return Math.max(0.02, w + shift);
  });
  const sum = adjusted.reduce((a, b) => a + b, 0);
  const normalized = adjusted.map((w) => w / sum);

  return CATEGORIES.map((cat, i) => ({
    ...cat,
    total: Math.round(totalExpense * normalized[i]),
    percentage: Math.round(normalized[i] * 1000) / 10,
  }));
}

// Mock monthly data covering 12 months (Oct 2025 - Sep 2026)
const MOCK_MONTHLY_DATA: MonthlyReportData[] = Array.from({ length: 12 }, (_, i) => {
  const year = i < 3 ? 2025 : 2026;
  const month = i < 3 ? 10 + i : i - 2;
  const monthStr = `${year}-${String(month).padStart(2, "0")}`;

  const income = vary(6000000, i, 800000); // ~60k BDT +/- 8k
  const expense = vary(4500000, i, 600000); // ~45k BDT +/- 6k
  const net = income - expense;

  // Age of Money trends from 12 to 28 over 12 months
  const ageOfMoney = Math.round(12 + (i / 11) * 16 + Math.sin(i * 1.3) * 2);
  // Days of Buffering trends from 18 to 35 over 12 months
  const daysOfBuffering = Math.round(18 + (i / 11) * 17 + Math.sin(i * 0.9) * 3);

  // Net worth grows over time
  const netWorth = 15000000 + i * 1200000 + vary(0, i, 500000);

  return {
    month: monthStr,
    income,
    expense,
    net,
    spendingByCategory: generateSpending(i, expense),
    netWorth,
    ageOfMoney,
    daysOfBuffering,
  };
});

const TIME_RANGE_MONTHS: Record<TimeRange, number> = {
  "1M": 1,
  "3M": 3,
  "6M": 6,
  "1Y": 12,
  ALL: Infinity,
};

export function useReportData(
  timeRange: TimeRange,
  currentPeriod: string
): {
  data: MonthlyReportData[];
  currentMonth: MonthlyReportData | null;
  isLoading: boolean;
} {
  const result = useMemo(() => {
    const monthCount = TIME_RANGE_MONTHS[timeRange];

    // Find index of current period in mock data
    const currentIndex = MOCK_MONTHLY_DATA.findIndex((d) => d.month === currentPeriod);

    let filtered: MonthlyReportData[];
    if (currentIndex === -1) {
      // If period not found, take the last N months
      filtered = monthCount === Infinity ? MOCK_MONTHLY_DATA : MOCK_MONTHLY_DATA.slice(-monthCount);
    } else {
      // Take N months ending at currentPeriod
      const startIndex = monthCount === Infinity ? 0 : Math.max(0, currentIndex - monthCount + 1);
      filtered = MOCK_MONTHLY_DATA.slice(startIndex, currentIndex + 1);
    }

    const currentMonth = MOCK_MONTHLY_DATA.find((d) => d.month === currentPeriod) ?? null;

    return { data: filtered, currentMonth };
  }, [timeRange, currentPeriod]);

  return {
    ...result,
    isLoading: false,
  };
}
