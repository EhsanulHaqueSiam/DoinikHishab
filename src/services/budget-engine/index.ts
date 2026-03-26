/**
 * Zero-based budgeting engine — core YNAB logic
 * Every taka gets a job. No money left unassigned.
 */

import type { Doc, Id } from "../../../convex/_generated/dataModel";

export interface BudgetSummary {
  readyToAssign: number; // paisa
  totalIncome: number;
  totalAssigned: number;
  totalActivity: number;
  overspent: number;
  categories: CategoryBudget[];
}

export interface CategoryBudget {
  categoryId: Id<"categories">;
  name: string;
  groupId: Id<"categoryGroups">;
  assigned: number;
  activity: number;
  available: number;
  targetType?: string;
  targetAmount?: number;
  targetProgress?: number; // 0..1
  targetStatus?: "on_track" | "behind" | "funded";
}

/**
 * Calculate Ready to Assign:
 * = Total income (this month + prior)
 * - Total assigned (this month + prior)
 * - Overspending in prior months (uncovered)
 */
export function calculateReadyToAssign(
  totalIncome: number,
  totalAssigned: number,
  priorOverspent: number
): number {
  return totalIncome - totalAssigned - priorOverspent;
}

/**
 * Calculate category available balance:
 * = assigned + activity + rollover from prior month
 */
export function calculateAvailable(
  assigned: number,
  activity: number,
  priorAvailable: number
): number {
  return priorAvailable + assigned + activity;
}

/**
 * Age of Money calculation:
 * Average age (in days) of the last 10 cash outflows.
 * For each outflow, find which inflow funded it (FIFO).
 */
export function calculateAgeOfMoney(
  inflows: { date: string; amount: number }[],
  outflows: { date: string; amount: number }[]
): number | null {
  if (inflows.length === 0 || outflows.length === 0) return null;

  // Sort inflows by date ascending (oldest first, FIFO)
  const sortedInflows = [...inflows].sort((a, b) => a.date.localeCompare(b.date));
  // Sort outflows by date descending (most recent first)
  const sortedOutflows = [...outflows].sort((a, b) => b.date.localeCompare(a.date));

  // Take last 10 outflows
  const recentOutflows = sortedOutflows.slice(0, 10);

  let inflowIdx = 0;
  let inflowRemaining = sortedInflows[0]?.amount ?? 0;
  let totalAgeDays = 0;
  let count = 0;

  // Simulate FIFO: each outflow consumes from oldest inflows
  for (const outflow of recentOutflows) {
    let outflowRemaining = Math.abs(outflow.amount);
    const outflowDate = new Date(outflow.date);

    while (outflowRemaining > 0 && inflowIdx < sortedInflows.length) {
      const inflow = sortedInflows[inflowIdx];
      const inflowDate = new Date(inflow.date);
      const ageDays = Math.floor(
        (outflowDate.getTime() - inflowDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      const consumed = Math.min(outflowRemaining, inflowRemaining);
      totalAgeDays += ageDays * consumed;
      count += consumed;
      outflowRemaining -= consumed;
      inflowRemaining -= consumed;

      if (inflowRemaining <= 0) {
        inflowIdx++;
        inflowRemaining = sortedInflows[inflowIdx]?.amount ?? 0;
      }
    }
  }

  if (count === 0) return null;
  return Math.round(totalAgeDays / count);
}

/**
 * Calculate target progress for a category
 */
export function calculateTargetProgress(
  target: Doc<"targets">,
  currentAvailable: number,
  monthsRemaining?: number
): { progress: number; status: "on_track" | "behind" | "funded" } {
  const targetAmount = target.amount;

  switch (target.type) {
    case "needed_for_spending":
    case "weekly_spending": {
      // Monthly spending target: funded if assigned >= target
      const progress = Math.min(currentAvailable / targetAmount, 1);
      return {
        progress,
        status: progress >= 1 ? "funded" : progress >= 0.8 ? "on_track" : "behind",
      };
    }

    case "spending_by_date": {
      // Save X by a date: need to be proportionally on track
      if (!monthsRemaining || monthsRemaining <= 0) {
        const progress = Math.min(currentAvailable / targetAmount, 1);
        return {
          progress,
          status: progress >= 1 ? "funded" : "behind",
        };
      }
      const neededPerMonth = targetAmount / monthsRemaining;
      const progress = Math.min(currentAvailable / targetAmount, 1);
      return {
        progress,
        status:
          progress >= 1 ? "funded" : currentAvailable >= neededPerMonth ? "on_track" : "behind",
      };
    }

    case "savings_balance": {
      // Save toward a total balance
      const progress = Math.min(currentAvailable / targetAmount, 1);
      return {
        progress,
        status: progress >= 1 ? "funded" : progress >= 0.5 ? "on_track" : "behind",
      };
    }

    case "monthly_savings": {
      // Fixed monthly contribution
      const progress = Math.min(currentAvailable / targetAmount, 1);
      return {
        progress,
        status: progress >= 1 ? "funded" : progress >= 0.8 ? "on_track" : "behind",
      };
    }

    default:
      return { progress: 0, status: "behind" };
  }
}

/**
 * Auto-assign helpers
 */
export type AutoAssignStrategy =
  | "last_month_budgeted"
  | "last_month_spent"
  | "average_spent"
  | "underfunded"
  | "reset_to_zero";

export function calculateAutoAssign(
  strategy: AutoAssignStrategy,
  lastMonthAssigned: number,
  lastMonthActivity: number,
  averageActivity: number,
  targetAmount: number,
  currentAvailable: number
): number {
  switch (strategy) {
    case "last_month_budgeted":
      return lastMonthAssigned;
    case "last_month_spent":
      return Math.abs(lastMonthActivity);
    case "average_spent":
      return Math.abs(averageActivity);
    case "underfunded":
      return Math.max(0, targetAmount - currentAvailable);
    case "reset_to_zero":
      return 0;
  }
}

/**
 * Handle overspent category
 * Returns the amount needed to cover overspending
 */
export function getOverspentAmount(available: number): number {
  return available < 0 ? Math.abs(available) : 0;
}

/**
 * Credit card payment tracking
 * When spending on CC, money moves from spending category to CC payment category
 */
export function calculateCCPaymentAvailable(
  ccBudgeted: number,
  ccActivity: number,
  spendingOnCC: number
): number {
  return ccBudgeted + ccActivity + Math.abs(spendingOnCC);
}

/**
 * Days of Buffering:
 * How many days your current balance would last based on average daily spending.
 * totalBalance / (totalOutflow over lookback period / lookbackDays)
 */
export function calculateDaysOfBuffering(
  totalBalance: number,
  outflows: { date: string; amount: number }[],
  lookbackDays: number = 90
): number | null {
  if (totalBalance <= 0 || outflows.length === 0) return null;

  const today = new Date();
  const cutoff = new Date(today);
  cutoff.setDate(cutoff.getDate() - lookbackDays);
  const cutoffStr = cutoff.toISOString().slice(0, 10);

  // Filter to only expenses (negative amounts) within lookback period
  const periodOutflows = outflows.filter((o) => o.amount < 0 && o.date >= cutoffStr);

  if (periodOutflows.length === 0) return null;

  const totalOutflow = periodOutflows.reduce((sum, o) => sum + Math.abs(o.amount), 0);
  const avgDailyOutflow = totalOutflow / lookbackDays;

  if (avgDailyOutflow === 0) return null;

  return Math.floor(totalBalance / avgDailyOutflow);
}

/**
 * Sinking Fund Monthly Suggestion:
 * How much to save per month to reach target by deadline.
 * (target - accumulated) / monthsRemaining, rounded up to avoid underfunding.
 */
export function calculateSinkingFundSuggest(
  targetAmount: number,
  accumulated: number,
  monthsRemaining: number
): number {
  if (accumulated >= targetAmount) return 0;

  const remaining = targetAmount - accumulated;

  if (monthsRemaining <= 0) return remaining;

  return Math.ceil(remaining / monthsRemaining);
}
