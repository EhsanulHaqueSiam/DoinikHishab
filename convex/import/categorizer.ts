import { v } from "convex/values";
import { action } from "../_generated/server";

interface CategoryMatch {
  categoryName: string;
  confidence: number;
}

// BD-specific keyword to category mappings
const KEYWORD_RULES: Record<string, string[]> = {
  "Food & Groceries": [
    "agora", "shwapno", "meena bazar", "unimart", "daily shopping",
    "grocery", "bazar", "kacha bazar", "super shop",
  ],
  "Eating Out": [
    "foodpanda", "pathao food", "hungrynaki", "restaurant",
    "cafe", "pizza", "burger", "kfc", "chillox", "sultan's dine",
    "star kabab", "takeout",
  ],
  "Transport": [
    "uber", "pathao ride", "obhai", "bus", "train",
    "bangladesh railway", "launch", "transport",
  ],
  "Rickshaw": ["rickshaw", "cng", "auto"],
  "bKash": ["bkash", "b-kash"],
  "Nagad": ["nagad"],
  "Online Shopping": [
    "daraz", "evaly", "chaldal", "pickaboo", "ajkerdeal",
    "amazon", "alibaba",
  ],
  "Electricity": ["desco", "dpdc", "bpdb", "nesco", "electricity", "electric bill"],
  "Gas": ["titas gas", "gas bill"],
  "Water": ["wasa", "water bill"],
  "Internet": [
    "grameenphone", "banglalink", "robi", "teletalk", "airtel",
    "isp", "internet", "wifi", "broadband",
  ],
  "Mobile Recharge": ["recharge", "flexiload", "top-up", "topup"],
  "Rent": ["rent", "house rent", "bhara"],
  "Health & Medical": [
    "pharmacy", "hospital", "doctor", "clinic", "medicine",
    "lab test", "diagnostic", "apollo", "square hospital",
    "united hospital",
  ],
  "Education": [
    "tuition", "school", "college", "university", "coaching",
    "course", "udemy", "book",
  ],
  "Entertainment": [
    "netflix", "youtube", "spotify", "cinema", "movie",
    "subscription", "game",
  ],
  "Shopping": ["clothing", "fashion", "shoes", "aarong", "yellow"],
  "Salary": ["salary", "payroll", "wage"],
  "Freelance": ["upwork", "fiverr", "freelance", "toptal"],
  "Business": ["business income", "revenue", "sales"],
};

function matchCategory(description: string): CategoryMatch {
  const lower = description.toLowerCase();
  let bestMatch = "";
  let bestConfidence = 0;

  for (const [category, keywords] of Object.entries(KEYWORD_RULES)) {
    for (const keyword of keywords) {
      if (lower.includes(keyword)) {
        // Longer keyword matches get higher confidence
        const confidence = Math.min(0.95, 0.6 + keyword.length * 0.03);
        if (confidence > bestConfidence) {
          bestConfidence = confidence;
          bestMatch = category;
        }
      }
    }
  }

  if (!bestMatch) {
    return { categoryName: "Uncategorized", confidence: 0 };
  }

  return { categoryName: bestMatch, confidence: bestConfidence };
}

export const categorize = action({
  args: {
    descriptions: v.array(v.string()),
  },
  handler: async (
    _ctx,
    args
  ): Promise<Array<{ description: string; categoryName: string; confidence: number }>> => {
    return args.descriptions.map((description) => {
      const match = matchCategory(description);
      return {
        description,
        categoryName: match.categoryName,
        confidence: match.confidence,
      };
    });
  },
});
