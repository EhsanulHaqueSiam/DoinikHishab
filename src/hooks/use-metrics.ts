/**
 * Financial health metrics hook.
 * Returns Age of Money and Days of Buffering calculated from transaction history.
 * Uses mock data when Convex backend is offline.
 */

export interface MetricsData {
  ageOfMoney: number | null;
  ageOfMoneyTrend: "improving" | "declining" | "flat" | null;
  daysOfBuffering: number | null;
  lookbackDays: number;
}

export function useMetrics(): MetricsData {
  // Mock data while Convex is offline — returns sample values for UI development
  return {
    ageOfMoney: 25,
    ageOfMoneyTrend: "improving",
    daysOfBuffering: 45,
    lookbackDays: 90,
  };
}
