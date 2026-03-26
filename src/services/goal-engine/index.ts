/**
 * Pure calculation functions for the goals system.
 * Amortization schedules, strategy comparison, status tracking,
 * contribution calculation, and budget category generation.
 *
 * All monetary values are in paisa (integer cents).
 */

import type {
  AmortizationRow,
  GoalBudgetCategory,
  GoalStatus,
  SaveUpGoal,
  StrategyResult,
} from "../goal-storage/types";

/** Input shape for debt strategy comparison */
export interface DebtInput {
  name: string;
  /** Outstanding balance in paisa */
  balance: number;
  /** Annual percentage rate as float (e.g. 12.5) */
  aprPercent: number;
  /** Minimum monthly payment in paisa */
  minPayment: number;
}

/**
 * Calculate how much to save per month to reach a goal by its target date.
 * Returns Math.ceil((targetAmount - currentAmount) / remainingMonths).
 * Returns 0 if the goal is already funded or overfunded.
 * Returns the full remaining amount if the target date is this month or past.
 */
export function calculateMonthlyContribution(
  targetAmount: number,
  currentAmount: number,
  targetDate: string
): number {
  const remaining = targetAmount - currentAmount;
  if (remaining <= 0) return 0;

  const now = new Date();
  const target = new Date(targetDate);

  // Calculate months remaining
  const monthsRemaining =
    (target.getFullYear() - now.getFullYear()) * 12 + (target.getMonth() - now.getMonth());

  if (monthsRemaining <= 0) return remaining;

  return Math.ceil(remaining / monthsRemaining);
}

/**
 * Calculate goal status based on time-proportional progress.
 * Uses a 5% tolerance band around expected progress.
 */
export function calculateGoalStatus(
  currentAmount: number,
  targetAmount: number,
  targetDate: string,
  createdDate: string
): GoalStatus {
  if (currentAmount >= targetAmount) return "funded";

  const now = new Date();
  const created = new Date(createdDate);
  const target = new Date(targetDate);

  const totalDuration = target.getTime() - created.getTime();
  const elapsed = now.getTime() - created.getTime();

  if (totalDuration <= 0) return "behind";

  const expectedProgress = Math.min(elapsed / totalDuration, 1);
  const actualProgress = currentAmount / targetAmount;

  if (actualProgress > expectedProgress + 0.05) return "ahead";
  if (actualProgress >= expectedProgress - 0.05) return "on_track";
  return "behind";
}

/**
 * Generate a month-by-month amortization schedule for a debt.
 * All amounts are integers (paisa). Caps at 360 months maximum.
 */
export function generateAmortization(
  balance: number,
  aprPercent: number,
  minPayment: number
): AmortizationRow[] {
  const rows: AmortizationRow[] = [];
  let remaining = balance;
  const monthlyRate = aprPercent / 100 / 12;
  const maxMonths = 360;

  for (let month = 1; month <= maxMonths && remaining > 0; month++) {
    const interest = Math.round(remaining * monthlyRate);
    const payment = Math.min(remaining + interest, minPayment);
    const principal = payment - interest;
    remaining = Math.max(0, remaining - principal);

    rows.push({
      month,
      payment,
      principal,
      interest,
      balance: remaining,
    });
  }

  return rows;
}

/**
 * Simulate paying off multiple debts with a given strategy.
 * Returns total interest, total cost, payoff months, and payoff date.
 */
function simulatePayoff(
  debts: DebtInput[],
  sortFn: (a: DebtInput, b: DebtInput) => number,
  extraPayment: number,
  strategyName: "avalanche" | "snowball"
): StrategyResult {
  // Deep copy balances
  const remaining = debts.map((d) => d.balance);
  let totalInterest = 0;
  let months = 0;
  const maxMonths = 360;

  while (remaining.some((b) => b > 0) && months < maxMonths) {
    months++;

    // Calculate interest and apply minimum payments
    let extraAvailable = extraPayment;

    for (let i = 0; i < debts.length; i++) {
      if (remaining[i] <= 0) continue;

      const monthlyRate = debts[i].aprPercent / 100 / 12;
      const interest = Math.round(remaining[i] * monthlyRate);
      totalInterest += interest;
      remaining[i] += interest;

      const minPay = Math.min(remaining[i], debts[i].minPayment);
      remaining[i] -= minPay;
    }

    // Sort indices by strategy to determine extra payment order
    const indices = debts.map((_, i) => i).filter((i) => remaining[i] > 0);

    // Create a sortable copy with current balances for snowball
    const sortable = indices.map((i) => ({
      idx: i,
      aprPercent: debts[i].aprPercent,
      balance: remaining[i],
    }));

    sortable.sort((a, b) => {
      if (strategyName === "avalanche") {
        return b.aprPercent - a.aprPercent; // highest APR first
      }
      return a.balance - b.balance; // lowest balance first
    });

    // Apply extra payment to priority debt
    for (const { idx } of sortable) {
      if (extraAvailable <= 0) break;
      const apply = Math.min(remaining[idx], extraAvailable);
      remaining[idx] -= apply;
      extraAvailable -= apply;
    }
  }

  const totalPrincipal = debts.reduce((sum, d) => sum + d.balance, 0);
  const now = new Date();
  const payoffDate = new Date(now);
  payoffDate.setMonth(payoffDate.getMonth() + months);

  return {
    strategy: strategyName,
    totalInterest,
    totalCost: totalPrincipal + totalInterest,
    payoffMonths: months,
    payoffDate: payoffDate.toISOString().slice(0, 10),
  };
}

/**
 * Compare avalanche vs snowball debt payoff strategies.
 * Avalanche: pay highest APR first (saves most interest).
 * Snowball: pay lowest balance first (psychological wins).
 */
export function compareStrategies(
  debts: DebtInput[],
  extraPayment = 0
): { avalanche: StrategyResult; snowball: StrategyResult } {
  const avalanche = simulatePayoff(
    debts,
    (a, b) => b.aprPercent - a.aprPercent,
    extraPayment,
    "avalanche"
  );
  const snowball = simulatePayoff(debts, (a, b) => a.balance - b.balance, extraPayment, "snowball");

  return { avalanche, snowball };
}

/**
 * Generate budget categories for save-up goals.
 * Each goal becomes a "Goal: [name]" category with monthly target
 * calculated from calculateMonthlyContribution.
 */
export function getGoalBudgetCategories(goals: SaveUpGoal[]): GoalBudgetCategory[] {
  return goals.map((goal) => ({
    id: `goal_cat_${goal.id}`,
    name: `Goal: ${goal.name}`,
    targetAmount: calculateMonthlyContribution(
      goal.targetAmount,
      goal.currentAmount,
      goal.targetDate
    ),
    activity: goal.currentAmount,
    groupId: "mock_grp_savings",
  }));
}
