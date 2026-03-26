/**
 * Financial health metrics hook
 * Computes Age of Money and Days of Buffering from mock transaction data.
 * Real implementation will use Convex transaction queries when backend is re-enabled.
 */

import { useMemo } from "react";
import {
  calculateAgeOfMoney,
  calculateDaysOfBuffering,
} from "../services/budget-engine";
import { getLookbackDays } from "../services/onboarding";
import { MOCK_ACCOUNTS } from "../services/mock-data";

export interface MetricsData {
  ageOfMoney: number | null;
  ageOfMoneyTrend: "improving" | "declining" | "flat" | null;
  daysOfBuffering: number | null;
  lookbackDays: number;
}

// Deterministic mock data for demonstration
// Real implementation will query Convex transactions
const MOCK_INFLOWS = [
  { date: "2026-02-25", amount: 3000000 }, // 30,000 BDT salary
  { date: "2026-01-25", amount: 3000000 },
];

const MOCK_OUTFLOWS = [
  { date: "2026-03-20", amount: -50000 },
  { date: "2026-03-18", amount: -120000 },
  { date: "2026-03-15", amount: -80000 },
  { date: "2026-03-10", amount: -200000 },
  { date: "2026-03-05", amount: -150000 },
  { date: "2026-03-01", amount: -300000 },
  { date: "2026-02-28", amount: -100000 },
  { date: "2026-02-20", amount: -180000 },
  { date: "2026-02-15", amount: -90000 },
  { date: "2026-02-10", amount: -250000 },
];

export function useMetrics(): MetricsData {
  const lookbackDays = getLookbackDays();
  const totalBalance = MOCK_ACCOUNTS.reduce((s, a) => s + a.balance, 0);

  return useMemo(() => {
    const ageOfMoney = calculateAgeOfMoney(MOCK_INFLOWS, MOCK_OUTFLOWS);
    const daysOfBuffering = calculateDaysOfBuffering(
      totalBalance,
      MOCK_OUTFLOWS,
      lookbackDays
    );

    // Trend: compare current AoM to a "previous" value (mock: slightly lower)
    let ageOfMoneyTrend: "improving" | "declining" | "flat" | null = null;
    if (ageOfMoney !== null) {
      // Mock trend: positive since we're demonstrating the feature
      ageOfMoneyTrend = "improving";
    }

    return { ageOfMoney, ageOfMoneyTrend, daysOfBuffering, lookbackDays };
  }, [totalBalance, lookbackDays]);
}
