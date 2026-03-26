/**
 * Recurring data hook.
 * Returns bills, subscriptions, and detected subscriptions from mock data.
 * Uses mock data when Convex backend is offline.
 */

import { useMemo } from "react";
import type {
  BillItem,
  BillStatus,
  DetectedSubscription,
  MockTransaction,
  Subscription,
} from "../components/recurring/recurring-types";
import { getDismissedPayees, getSubscriptions } from "../services/recurring-storage";
import { detectSubscriptions } from "../services/subscription-detector";

// Mock transactions with deliberate recurring patterns
const MOCK_TRANSACTIONS: MockTransaction[] = [
  // Netflix - monthly at ~Tk 500 (50000 paisa), 6 occurrences
  ...generateMockRecurring("Netflix", 50000, "mock_cat_entertainment", "expense", 6, "2025-09-15"),
  // Spotify - monthly at ~Tk 250 (25000 paisa), 4 occurrences
  ...generateMockRecurring("Spotify", 25000, "mock_cat_entertainment", "expense", 4, "2025-11-10"),
  // Gym Membership - monthly at ~Tk 2000 (200000 paisa), 5 occurrences
  ...generateMockRecurring(
    "Gym Membership",
    200000,
    "mock_cat_fitness",
    "expense",
    5,
    "2025-10-01"
  ),
  // Internet Bill - monthly at ~Tk 800 (80000 paisa), 6 occurrences
  ...generateMockRecurring(
    "Internet Bill",
    80000,
    "mock_cat_utilities",
    "expense",
    6,
    "2025-09-05"
  ),
  // Electricity Bill - monthly at ~Tk 2100 (210000 paisa), 5 occurrences, ~10% variance
  ...generateMockRecurringWithVariance(
    "Electricity Bill",
    210000,
    0.1,
    "mock_cat_utilities",
    "expense",
    5,
    "2025-10-03"
  ),
  // Salary - monthly at ~Tk 60000 (6000000 paisa), 6 occurrences (income)
  ...generateMockRecurring("Salary", 6000000, "mock_cat_salary", "income", 6, "2025-09-25"),
  // Groceries Store - irregular, NOT a subscription
  ...generateIrregularMock("Groceries Store", "mock_cat_food_groceries", 10),
];

/** Generate N monthly recurring transactions for a payee */
function generateMockRecurring(
  payee: string,
  amount: number,
  categoryId: string,
  type: "income" | "expense",
  count: number,
  startDate: string
): MockTransaction[] {
  const start = new Date(startDate);
  return Array.from({ length: count }, (_, i) => {
    const date = new Date(start);
    date.setMonth(date.getMonth() + i);
    return {
      id: `mock_txn_${payee.replace(/\s+/g, "_").toLowerCase()}_${i}`,
      payee,
      amount,
      date: date.toISOString().split("T")[0],
      categoryId,
      type,
    };
  });
}

/** Generate monthly recurring with amount variance */
function generateMockRecurringWithVariance(
  payee: string,
  baseAmount: number,
  varianceRatio: number,
  categoryId: string,
  type: "income" | "expense",
  count: number,
  startDate: string
): MockTransaction[] {
  const start = new Date(startDate);
  return Array.from({ length: count }, (_, i) => {
    const date = new Date(start);
    date.setMonth(date.getMonth() + i);
    // Deterministic variance using Math.sin
    const variance = Math.round(baseAmount * varianceRatio * Math.sin(i * 2.3));
    return {
      id: `mock_txn_${payee.replace(/\s+/g, "_").toLowerCase()}_${i}`,
      payee,
      amount: baseAmount + variance,
      date: date.toISOString().split("T")[0],
      categoryId,
      type,
    };
  });
}

/** Generate irregular (non-subscription) transactions */
function generateIrregularMock(
  payee: string,
  categoryId: string,
  count: number
): MockTransaction[] {
  return Array.from({ length: count }, (_, i) => {
    // Random-ish intervals using deterministic Math.sin
    const dayOffset = Math.round(i * 12 + Math.sin(i * 3.7) * 8);
    const date = new Date("2025-08-01");
    date.setDate(date.getDate() + dayOffset);
    // Random-ish amounts between 30000 and 150000 paisa
    const amount = 30000 + Math.round(Math.abs(Math.sin(i * 5.1)) * 120000);
    return {
      id: `mock_txn_${payee.replace(/\s+/g, "_").toLowerCase()}_${i}`,
      payee,
      amount,
      date: date.toISOString().split("T")[0],
      categoryId,
      type: "expense" as const,
    };
  });
}

/** Get the last day of a given month */
function getLastDayOfMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

/** Check if a subscription is due on a specific date */
function isDueOnDate(sub: Subscription, date: Date): boolean {
  const dueDay = Number.parseInt(sub.nextDueDate.split("-")[2], 10);
  const dateDay = date.getDate();
  const lastDay = getLastDayOfMonth(date.getFullYear(), date.getMonth());

  // Clamp day to last day of month per Pitfall 1
  const clampedDueDay = Math.min(dueDay, lastDay);

  if (sub.frequency === "monthly") {
    return dateDay === clampedDueDay;
  }

  if (sub.frequency === "weekly") {
    const nextDue = new Date(sub.nextDueDate);
    const dayOfWeek = nextDue.getDay();
    return date.getDay() === dayOfWeek;
  }

  if (sub.frequency === "yearly") {
    const nextDue = new Date(sub.nextDueDate);
    return date.getMonth() === nextDue.getMonth() && dateDay === clampedDueDay;
  }

  return false;
}

/** Generate bills from confirmed subscriptions for the current month */
function generateBillsFromSubscriptions(
  subscriptions: Subscription[],
  currentDate: Date
): BillItem[] {
  const today = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
  const bills: BillItem[] = [];

  for (const sub of subscriptions) {
    if (!sub.isActive) continue;

    const dueDay = Number.parseInt(sub.nextDueDate.split("-")[2], 10);
    const lastDay = getLastDayOfMonth(today.getFullYear(), today.getMonth());
    const clampedDay = Math.min(dueDay, lastDay);
    const dueDate = new Date(today.getFullYear(), today.getMonth(), clampedDay);
    const dueDateStr = dueDate.toISOString().split("T")[0];

    // Status logic for demo
    let status: BillStatus;
    const diffDays = Math.round((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      // Past due date -- mark as paid for demo (assume most bills get paid)
      status = "paid";
    } else if (diffDays <= 3) {
      status = "upcoming";
    } else if (diffDays <= 7) {
      status = "upcoming";
    } else {
      status = "upcoming";
    }

    bills.push({
      id: `bill_${sub.id}_${today.getMonth()}`,
      subscriptionId: sub.id,
      payee: sub.payee,
      amount: sub.amount,
      dueDate: dueDateStr,
      status,
      categoryId: sub.categoryId,
      type: sub.type,
    });
  }

  return bills;
}

/**
 * Hook returning recurring bills, subscriptions, and detected subscriptions.
 * Uses mock transaction data for subscription detection while Convex is offline.
 */
export function useRecurringData(): {
  bills: BillItem[];
  subscriptions: Subscription[];
  detectedSubscriptions: DetectedSubscription[];
  isLoading: boolean;
} {
  const result = useMemo(() => {
    // Get confirmed subscriptions from MMKV
    const confirmedSubs = getSubscriptions();

    // Run detection on mock transactions
    const allDetected = detectSubscriptions(MOCK_TRANSACTIONS);

    // Filter out dismissed payees and already-confirmed payees
    const dismissedPayees = getDismissedPayees();
    const confirmedPayees = new Set(confirmedSubs.map((s) => s.payee));
    const detectedSubscriptions = allDetected.filter(
      (d) => !dismissedPayees.includes(d.payee) && !confirmedPayees.has(d.payee)
    );

    // Generate bills from confirmed subscriptions
    const bills = generateBillsFromSubscriptions(confirmedSubs, new Date());

    return {
      bills,
      subscriptions: confirmedSubs,
      detectedSubscriptions,
    };
  }, []);

  return {
    ...result,
    isLoading: false,
  };
}

/**
 * Project cash flow forward by N days using confirmed subscriptions.
 * Pure function (not a hook).
 */
export function projectCashFlow(
  currentBalance: number,
  subscriptions: Subscription[],
  days: number
): { date: string; value: number }[] {
  const today = new Date();
  const points: { date: string; value: number }[] = [];
  let balance = currentBalance;

  for (let d = 0; d <= days; d++) {
    const date = new Date(today);
    date.setDate(today.getDate() + d);
    const dateStr = date.toISOString().split("T")[0];

    // Apply recurring items due on this date
    for (const sub of subscriptions) {
      if (!sub.isActive) continue;
      if (isDueOnDate(sub, date)) {
        if (sub.type === "income") {
          balance += sub.amount;
        } else {
          balance -= sub.amount;
        }
      }
    }

    points.push({ date: dateStr, value: balance });
  }

  return points;
}
