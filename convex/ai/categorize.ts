"use node";

import { v } from "convex/values";
import { action } from "../_generated/server";

// BD-specific pattern matching for categorization
const PATTERNS: Array<{ pattern: RegExp; category: string; confidence: number }> = [
  { pattern: /foodpanda|hungrynaki|pathao food/i, category: "Eating Out", confidence: 0.9 },
  { pattern: /restaurant|cafe|hotel|canteen/i, category: "Eating Out", confidence: 0.85 },
  {
    pattern: /agora|shwapno|meena.?bazar|unimart|grocery|bazar/i,
    category: "Food & Groceries",
    confidence: 0.9,
  },
  { pattern: /uber|pathao ride|obhai|bus|train|launch/i, category: "Transport", confidence: 0.85 },
  { pattern: /rickshaw|cng|auto/i, category: "Rickshaw", confidence: 0.9 },
  { pattern: /bkash|b-kash/i, category: "bKash", confidence: 0.85 },
  { pattern: /nagad/i, category: "Nagad", confidence: 0.9 },
  { pattern: /daraz|chaldal|pickaboo|evaly/i, category: "Online Shopping", confidence: 0.9 },
  { pattern: /desco|dpdc|bpdb|electric/i, category: "Electricity", confidence: 0.9 },
  { pattern: /titas|gas.?bill/i, category: "Gas", confidence: 0.9 },
  { pattern: /wasa|water.?bill/i, category: "Water", confidence: 0.9 },
  { pattern: /internet|isp|broadband|wifi/i, category: "Internet", confidence: 0.85 },
  { pattern: /recharge|flexiload|top.?up/i, category: "Mobile Recharge", confidence: 0.85 },
  { pattern: /rent|house.?rent/i, category: "Rent", confidence: 0.9 },
  {
    pattern: /pharmacy|hospital|doctor|clinic|medicine/i,
    category: "Health & Medical",
    confidence: 0.85,
  },
  {
    pattern: /tuition|school|college|university|coaching/i,
    category: "Education",
    confidence: 0.85,
  },
  { pattern: /netflix|youtube|spotify|cinema|movie/i, category: "Entertainment", confidence: 0.85 },
  { pattern: /salary|payroll/i, category: "Salary", confidence: 0.95 },
  { pattern: /upwork|fiverr|freelance/i, category: "Freelance", confidence: 0.9 },
];

interface CategorySuggestion {
  transactionId: string;
  description: string;
  suggestedCategory: string;
  confidence: number;
}

export const batchCategorize = action({
  args: {
    transactions: v.array(
      v.object({
        id: v.string(),
        description: v.string(),
        amount: v.number(),
      })
    ),
  },
  handler: async (_ctx, args): Promise<CategorySuggestion[]> => {
    return args.transactions.map((txn) => {
      let bestCategory = "Uncategorized";
      let bestConfidence = 0;

      for (const rule of PATTERNS) {
        if (rule.pattern.test(txn.description)) {
          if (rule.confidence > bestConfidence) {
            bestCategory = rule.category;
            bestConfidence = rule.confidence;
          }
        }
      }

      // If no pattern matched, try basic heuristics based on amount
      if (bestConfidence === 0 && txn.amount > 0) {
        bestCategory = "Other Income";
        bestConfidence = 0.3;
      }

      return {
        transactionId: txn.id,
        description: txn.description,
        suggestedCategory: bestCategory,
        confidence: bestConfidence,
      };
    });
  },
});
