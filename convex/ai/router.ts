"use node";

import { v } from "convex/values";
import { action } from "../_generated/server";

type AIFunction = "categorize" | "nlq" | "advisor";

interface AIResponse {
  result: string;
  provider: string;
  model: string;
  function: AIFunction;
}

export const route = action({
  args: {
    provider: v.string(),
    model: v.string(),
    apiKey: v.string(),
    prompt: v.string(),
    fn: v.union(
      v.literal("categorize"),
      v.literal("nlq"),
      v.literal("advisor")
    ),
    context: v.optional(v.string()),
  },
  handler: async (_ctx, args): Promise<AIResponse> => {
    // Stub implementation - routes to pattern-based responses
    // In production, this would call the actual AI provider APIs
    const { provider, model, fn, prompt, context } = args;

    let result = "";

    switch (fn) {
      case "categorize":
        result = stubCategorize(prompt);
        break;
      case "nlq":
        result = stubNLQ(prompt, context);
        break;
      case "advisor":
        result = stubAdvisor(prompt, context);
        break;
    }

    return { result, provider, model, function: fn };
  },
});

function stubCategorize(prompt: string): string {
  // Return a JSON string of category suggestions
  const lower = prompt.toLowerCase();
  let category = "Uncategorized";

  if (lower.includes("food") || lower.includes("restaurant") || lower.includes("foodpanda")) {
    category = "Eating Out";
  } else if (lower.includes("grocery") || lower.includes("bazar")) {
    category = "Food & Groceries";
  } else if (lower.includes("uber") || lower.includes("pathao") || lower.includes("transport")) {
    category = "Transport";
  } else if (lower.includes("bkash")) {
    category = "bKash";
  } else if (lower.includes("salary") || lower.includes("payroll")) {
    category = "Salary";
  } else if (lower.includes("rent")) {
    category = "Rent";
  }

  return JSON.stringify({ category, confidence: 0.75 });
}

function stubNLQ(prompt: string, context?: string): string {
  const lower = prompt.toLowerCase();

  if (lower.includes("how much") && lower.includes("food")) {
    return JSON.stringify({
      answer: "Based on your transactions, you spent approximately 12,500 BDT on food this month.",
      type: "spending_summary",
    });
  }
  if (lower.includes("top") && lower.includes("expense")) {
    return JSON.stringify({
      answer: "Your top expenses this month are: 1) Rent - 15,000 BDT, 2) Food & Groceries - 8,000 BDT, 3) Transport - 3,500 BDT",
      type: "top_expenses",
    });
  }
  if (lower.includes("save") || lower.includes("saving")) {
    return JSON.stringify({
      answer: "You have saved approximately 5,000 BDT this month compared to last month's spending patterns.",
      type: "savings",
    });
  }

  return JSON.stringify({
    answer: "I can help you understand your spending. Try asking about specific categories, monthly totals, or savings tips!",
    type: "general",
  });
}

function stubAdvisor(prompt: string, context?: string): string {
  return JSON.stringify({
    advice: "Based on your spending patterns, consider setting a budget for eating out. Your food expenses have been 20% above the recommended allocation for your income level.",
    tips: [
      "Track daily small purchases - they add up quickly",
      "Set weekly spending limits for variable categories",
      "Review subscriptions monthly for unused services",
    ],
  });
}

export const testConnection = action({
  args: {
    provider: v.string(),
    apiKey: v.string(),
    model: v.string(),
  },
  handler: async (_ctx, args): Promise<{ success: boolean; message: string }> => {
    // Stub: validate that API key format looks reasonable
    if (!args.apiKey || args.apiKey.length < 10) {
      return { success: false, message: "API key appears invalid. Please check and try again." };
    }
    return {
      success: true,
      message: `Successfully connected to ${args.provider} with model ${args.model}.`,
    };
  },
});
