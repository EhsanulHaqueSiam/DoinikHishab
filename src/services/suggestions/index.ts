/**
 * Smart suggestion engine
 * Generates quick-add chips based on time, history, and patterns
 */

import type { Doc } from "../../../convex/_generated/dataModel";

interface SuggestionChip {
  label: string;
  description?: string;
  categoryId?: string;
  amount?: number; // paisa
  type: "expense" | "income";
  confidence: number;
}

/**
 * Generate smart suggestion chips based on user's transaction history
 */
export function generateSuggestions(
  transactions: Doc<"transactions">[],
  categories: Doc<"categories">[],
  hour: number
): SuggestionChip[] {
  const suggestions: SuggestionChip[] = [];

  if (transactions.length === 0) return getDefaultSuggestions(hour);

  // Time-based suggestions
  if (hour >= 6 && hour < 10) {
    suggestions.push({
      label: "🍳 Breakfast",
      type: "expense",
      confidence: 0.7,
    });
  } else if (hour >= 12 && hour < 14) {
    suggestions.push({
      label: "🍽️ Lunch",
      type: "expense",
      confidence: 0.7,
    });
  } else if (hour >= 18 && hour < 21) {
    suggestions.push({
      label: "🍛 Dinner",
      type: "expense",
      confidence: 0.7,
    });
  }

  // Frequency-based: find most common transaction descriptions
  const descCounts = new Map<string, { count: number; amount: number; categoryId?: string }>();
  for (const txn of transactions.slice(0, 100)) {
    if (!txn.description) continue;
    const key = txn.description.toLowerCase();
    const existing = descCounts.get(key);
    if (existing) {
      existing.count++;
      existing.amount = Math.round(
        (existing.amount * (existing.count - 1) + Math.abs(txn.amount)) /
          existing.count
      );
    } else {
      descCounts.set(key, {
        count: 1,
        amount: Math.abs(txn.amount),
        categoryId: txn.categoryId ?? undefined,
      });
    }
  }

  // Top 3 most common
  const topDescs = Array.from(descCounts.entries())
    .sort(([, a], [, b]) => b.count - a.count)
    .slice(0, 3);

  for (const [desc, info] of topDescs) {
    if (info.count >= 3) {
      suggestions.push({
        label: desc.charAt(0).toUpperCase() + desc.slice(1),
        amount: info.amount,
        categoryId: info.categoryId,
        type: "expense",
        confidence: Math.min(info.count / 10, 1),
      });
    }
  }

  // Always add transport for BD users
  suggestions.push({
    label: "🚲 Rickshaw",
    type: "expense",
    confidence: 0.5,
  });

  return suggestions.slice(0, 5);
}

function getDefaultSuggestions(hour: number): SuggestionChip[] {
  const suggestions: SuggestionChip[] = [];

  if (hour >= 6 && hour < 10) {
    suggestions.push({ label: "🍳 Breakfast", type: "expense", confidence: 0.6 });
  } else if (hour >= 12 && hour < 14) {
    suggestions.push({ label: "🍽️ Lunch", type: "expense", confidence: 0.6 });
  } else if (hour >= 18 && hour < 21) {
    suggestions.push({ label: "🍛 Dinner", type: "expense", confidence: 0.6 });
  }

  suggestions.push(
    { label: "🚲 Rickshaw", type: "expense", confidence: 0.5 },
    { label: "☕ Tea/Coffee", type: "expense", confidence: 0.5 },
    { label: "🛒 Groceries", type: "expense", confidence: 0.4 }
  );

  return suggestions.slice(0, 4);
}
