/**
 * Type definitions for the goals system.
 * Save-up goals track savings targets; pay-down goals track debt payoff.
 * All monetary amounts are in paisa (integer cents) unless noted.
 */

/** A savings goal with target amount and date */
export interface SaveUpGoal {
  id: string;
  name: string;
  /** Target amount in paisa */
  targetAmount: number;
  /** Current saved amount in paisa */
  currentAmount: number;
  /** Target completion date (YYYY-MM-DD) */
  targetDate: string;
  /** ID of the linked account */
  linkedAccountId: string;
  /** Date goal was created (YYYY-MM-DD) */
  createdDate: string;
}

/** A debt payoff goal */
export interface PayDownGoal {
  id: string;
  name: string;
  /** Outstanding balance in paisa */
  balance: number;
  /** Annual percentage rate as a float (e.g. 12.5 means 12.5%) */
  aprPercent: number;
  /** Minimum monthly payment in paisa */
  minPayment: number;
  /** Date debt was added (YYYY-MM-DD) */
  createdDate: string;
}

/** Versioned data store for MMKV persistence */
export interface GoalDataStore {
  version: 1;
  saveUpGoals: SaveUpGoal[];
  payDownGoals: PayDownGoal[];
}

/** Status of a save-up goal relative to its timeline */
export type GoalStatus = "ahead" | "on_track" | "behind" | "funded";

/** A single row in an amortization schedule (all amounts in paisa) */
export interface AmortizationRow {
  month: number;
  /** Total payment for this month in paisa */
  payment: number;
  /** Principal portion in paisa */
  principal: number;
  /** Interest portion in paisa */
  interest: number;
  /** Remaining balance after payment in paisa */
  balance: number;
}

/** Result of a debt payoff strategy simulation */
export interface StrategyResult {
  strategy: "avalanche" | "snowball";
  /** Total interest paid across all debts in paisa */
  totalInterest: number;
  /** Total cost (principal + interest) in paisa */
  totalCost: number;
  /** Number of months to pay off all debts */
  payoffMonths: number;
  /** Projected payoff date (YYYY-MM-DD) */
  payoffDate: string;
}

/** A generated budget category for a save-up goal */
export interface GoalBudgetCategory {
  id: string;
  name: string;
  /** Monthly target contribution in paisa */
  targetAmount: number;
  /** Current saved amount (activity) in paisa */
  activity: number;
  /** Budget group ID */
  groupId: string;
}
