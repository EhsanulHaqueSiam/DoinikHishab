/**
 * Subscription detection algorithm.
 * Analyzes transaction history to find recurring patterns.
 * Pure functions -- no side effects.
 */

import type {
  DetectedSubscription,
  MockTransaction,
  RecurringFrequency,
} from "../../components/recurring/recurring-types";

// Frequency definitions: target interval in days, tolerance in days
const FREQUENCY_DEFS: { frequency: RecurringFrequency; interval: number; tolerance: number }[] = [
  { frequency: "weekly", interval: 7, tolerance: 3 },
  { frequency: "monthly", interval: 30, tolerance: 3 },
  { frequency: "yearly", interval: 365, tolerance: 3 },
];

const MIN_OCCURRENCES = 3;
const MIN_CONFIDENCE = 0.6;
const MAX_AMOUNT_VARIANCE = 0.2;

/** Calculate days between two ISO date strings */
function daysBetween(dateA: string, dateB: string): number {
  const a = new Date(dateA).getTime();
  const b = new Date(dateB).getTime();
  return Math.round(Math.abs(b - a) / (1000 * 60 * 60 * 24));
}

/** Check if amount variance across transactions is acceptable (< 20%) */
function isAmountConsistent(amounts: number[]): boolean {
  if (amounts.length === 0) return false;
  const mean = amounts.reduce((sum, a) => sum + a, 0) / amounts.length;
  if (mean === 0) return false;
  const variance = amounts.reduce((sum, a) => sum + (a - mean) ** 2, 0) / amounts.length;
  const stdDev = Math.sqrt(variance);
  return stdDev / mean < MAX_AMOUNT_VARIANCE;
}

/** Detect the best-matching frequency for a set of intervals */
function detectFrequency(
  intervals: number[]
): { frequency: RecurringFrequency; confidence: number } | null {
  let bestMatch: { frequency: RecurringFrequency; confidence: number } | null = null;

  for (const { frequency, interval, tolerance } of FREQUENCY_DEFS) {
    const matching = intervals.filter((i) => Math.abs(i - interval) <= tolerance);
    const confidence = matching.length / intervals.length;

    if (confidence >= MIN_CONFIDENCE && (!bestMatch || confidence > bestMatch.confidence)) {
      bestMatch = { frequency, confidence };
    }
  }

  return bestMatch;
}

/**
 * Detect subscriptions from a list of transactions.
 * Groups by payee, checks for regular intervals, and returns candidates
 * with confidence scoring.
 */
export function detectSubscriptions(transactions: MockTransaction[]): DetectedSubscription[] {
  // Group transactions by payee
  const byPayee = new Map<string, MockTransaction[]>();
  for (const txn of transactions) {
    const existing = byPayee.get(txn.payee) ?? [];
    existing.push(txn);
    byPayee.set(txn.payee, existing);
  }

  const results: DetectedSubscription[] = [];

  for (const [payee, txns] of byPayee) {
    // Need at least MIN_OCCURRENCES transactions
    if (txns.length < MIN_OCCURRENCES) continue;

    // Check amount consistency (std dev / mean < 20%)
    const amounts = txns.map((t) => t.amount);
    if (!isAmountConsistent(amounts)) continue;

    // Sort by date ascending
    const sorted = [...txns].sort((a, b) => a.date.localeCompare(b.date));

    // Calculate intervals between consecutive transactions
    const intervals: number[] = [];
    for (let i = 1; i < sorted.length; i++) {
      intervals.push(daysBetween(sorted[i - 1].date, sorted[i].date));
    }

    // Detect frequency
    const match = detectFrequency(intervals);
    if (!match) continue;

    // Calculate average amount
    const avgAmount = Math.round(amounts.reduce((s, a) => s + a, 0) / amounts.length);

    // Use the most common categoryId
    const categoryId = sorted[sorted.length - 1].categoryId;

    results.push({
      payee,
      amount: avgAmount,
      frequency: match.frequency,
      confidence: Math.round(match.confidence * 100) / 100,
      occurrences: txns.length,
      lastDate: sorted[sorted.length - 1].date,
      categoryId,
    });
  }

  // Sort by confidence descending
  return results.sort((a, b) => b.confidence - a.confidence);
}
