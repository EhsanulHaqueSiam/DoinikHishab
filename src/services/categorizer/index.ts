/**
 * Client-side rule-based auto-categorization
 * Matches transaction descriptions to categories using pattern rules
 */

import type { Id } from "../../../convex/_generated/dataModel";

interface CategoryRule {
  pattern: string;
  categoryId: Id<"categories">;
  confidence: number;
}

export function matchCategory(
  description: string,
  rules: CategoryRule[]
): { categoryId: Id<"categories">; confidence: number } | null {
  if (!description) return null;

  const lower = description.toLowerCase().trim();
  let bestMatch: { categoryId: Id<"categories">; confidence: number } | null =
    null;

  for (const rule of rules) {
    const pattern = rule.pattern.toLowerCase();
    if (lower.includes(pattern)) {
      if (!bestMatch || rule.confidence > bestMatch.confidence) {
        bestMatch = {
          categoryId: rule.categoryId,
          confidence: rule.confidence,
        };
      }
    }
  }

  return bestMatch;
}

/**
 * Default keyword -> category mappings for BD
 */
export const BD_CATEGORY_KEYWORDS: Record<string, string[]> = {
  "Food & Groceries": [
    "agora", "shwapno", "meena bazar", "unimart", "groceries",
    "bazar", "bazaar", "chaldal", "pandamart",
  ],
  "Eating Out": [
    "foodpanda", "pathao food", "hungrynaki", "restaurant",
    "cafe", "coffee", "tea", "cha", "hotel",
  ],
  Transport: [
    "uber", "pathao", "obhai", "bus", "train",
    "railway", "launch", "fare",
  ],
  Rickshaw: ["rickshaw", "riksha", "cng", "auto"],
  "Mobile Recharge": [
    "flexiload", "recharge", "grameenphone", "gp", "robi",
    "banglalink", "teletalk", "airtel",
  ],
  bKash: ["bkash", "bikash"],
  Nagad: ["nagad"],
  "Online Shopping": [
    "daraz", "evaly", "ajkerdeal", "amazon", "aliexpress",
    "shopify", "ebay",
  ],
  Electricity: ["desco", "dpdc", "bpdb", "nesco", "electricity", "bidyut"],
  Gas: ["titas", "gas"],
  Water: ["wasa", "water", "pani"],
  Internet: ["link3", "amber it", "carnival", "isp", "internet", "wifi"],
  "Health & Medical": [
    "pharmacy", "doctor", "hospital", "clinic", "lab test",
    "pathology", "medicine",
  ],
  Education: ["tuition", "school", "college", "university", "coaching"],
  Entertainment: ["netflix", "youtube", "spotify", "cinema", "binge"],
  Salary: ["salary", "beton", "payroll"],
};

export function learnFromCorrection(
  description: string,
  categoryId: Id<"categories">,
  existingRules: CategoryRule[]
): CategoryRule | null {
  if (!description || description.length < 3) return null;

  // Check if rule already exists
  const existing = existingRules.find(
    (r) =>
      r.pattern.toLowerCase() === description.toLowerCase() &&
      r.categoryId === categoryId
  );

  if (existing) return null;

  // Create new rule
  return {
    pattern: description.toLowerCase(),
    categoryId,
    confidence: 0.8,
  };
}
