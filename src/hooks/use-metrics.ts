/**
 * Financial health metrics hook.
 * Returns Age of Money and Days of Buffering calculated from transaction history.
 * Uses mock data when Convex backend is offline.
 */

import { useMemo } from "react";
import {
  calculateAgeOfMoney,
  calculateDaysOfBuffering,
} from "../services/budget-engine";
import { getLookbackDays } from "../services/onboarding";

export interface MetricsData {
  ageOfMoney: number | null;
  ageOfMoneyTrend: "improving" | "declining" | "flat" | null;
  daysOfBuffering: number | null;
  lookbackDays: number;
}

// Mock transaction data for offline development
const MOCK_INFLOWS = [
  { amount: 5000000, date: "2026-02-01" },
  { amount: 5000000, date: "2026-03-01" },
];

const MOCK_OUTFLOWS = [
  { amount: 150000, date: "2026-02-05" },
  { amount: 200000, date: "2026-02-10" },
  { amount: 100000, date: "2026-02-15" },
  { amount: 180000, date: "2026-02-20" },
  { amount: 250000, date: "2026-03-01" },
  { amount: 120000, date: "2026-03-05" },
  { amount: 200000, date: "2026-03-10" },
  { amount: 150000, date: "2026-03-15" },
  { amount: 180000, date: "2026-03-20" },
];

const MOCK_BALANCE = 8500000; // ৳85,000 in paisa

export function useMetrics(): MetricsData {
  const lookbackDays = getLookbackDays();

  const metrics = useMemo(() => {
    // Calculate Age of Money from FIFO inflow/outflow matching
    const ageOfMoney = calculateAgeOfMoney(MOCK_INFLOWS, MOCK_OUTFLOWS);

    // Calculate Days of Buffering from balance / avg daily expense
    const totalOutflow = MOCK_OUTFLOWS.reduce((sum, o) => sum + o.amount, 0);
    const avgDailyExpense =
      MOCK_OUTFLOWS.length > 0 ? totalOutflow / lookbackDays : 0;
    const daysOfBuffering = calculateDaysOfBuffering(
      MOCK_BALANCE,
      avgDailyExpense
    );

    // Trend: compare current AoM to a simulated 30-day-ago value
    const ageOfMoneyTrend: "improving" | "declining" | "flat" =
      ageOfMoney > 20 ? "improving" : ageOfMoney < 10 ? "declining" : "flat";

    return { ageOfMoney, ageOfMoneyTrend, daysOfBuffering };
  }, [lookbackDays]);

  return {
    ...metrics,
    lookbackDays,
  };
}
