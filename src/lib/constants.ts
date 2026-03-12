import type { Id } from "../../convex/_generated/dataModel";

export const APP_NAME = "DoinikHishab";
export const APP_NAME_BN = "দৈনিক হিসাব";

export const DEFAULT_CURRENCY = "BDT";
export const DEFAULT_LOCALE = "en-BD";

// Flag colors
export const FLAG_COLORS = {
  red: "#ef4444",
  orange: "#f97316",
  yellow: "#eab308",
  green: "#22c55e",
  blue: "#3b82f6",
  purple: "#a855f7",
} as const;

export type FlagColor = keyof typeof FLAG_COLORS;

// Account type labels
export const ACCOUNT_TYPE_LABELS: Record<string, string> = {
  checking: "Checking",
  savings: "Savings",
  cash: "Cash",
  credit_card: "Credit Card",
  line_of_credit: "Line of Credit",
  mortgage: "Mortgage",
  auto_loan: "Auto Loan",
  student_loan: "Student Loan",
  other_debt: "Other Debt",
  other_asset: "Other Asset",
};

// Default category groups and categories for BD
export interface DefaultCategory {
  name: string;
  nameBn: string;
  icon: string;
  type: "expense" | "income" | "transfer";
}

export interface DefaultCategoryGroup {
  name: string;
  nameBn: string;
  categories: DefaultCategory[];
}

export const DEFAULT_CATEGORY_GROUPS: DefaultCategoryGroup[] = [
  {
    name: "Fixed Bills",
    nameBn: "নির্দিষ্ট বিল",
    categories: [
      { name: "Rent", nameBn: "বাড়ি ভাড়া", icon: "home", type: "expense" },
      { name: "Electricity", nameBn: "বিদ্যুৎ বিল", icon: "zap", type: "expense" },
      { name: "Gas", nameBn: "গ্যাস বিল", icon: "flame", type: "expense" },
      { name: "Water", nameBn: "পানি বিল", icon: "droplets", type: "expense" },
      { name: "Internet", nameBn: "ইন্টারনেট", icon: "wifi", type: "expense" },
      { name: "Mobile Recharge", nameBn: "মোবাইল রিচার্জ", icon: "smartphone", type: "expense" },
      { name: "Insurance", nameBn: "বীমা", icon: "shield", type: "expense" },
    ],
  },
  {
    name: "Everyday Spending",
    nameBn: "দৈনন্দিন খরচ",
    categories: [
      { name: "Food & Groceries", nameBn: "খাবার ও মুদি", icon: "shopping-cart", type: "expense" },
      { name: "Eating Out", nameBn: "বাইরে খাওয়া", icon: "utensils", type: "expense" },
      { name: "Transport", nameBn: "যাতায়াত", icon: "bus", type: "expense" },
      { name: "Rickshaw", nameBn: "রিকশা", icon: "bike", type: "expense" },
      { name: "Fuel", nameBn: "জ্বালানি", icon: "fuel", type: "expense" },
      { name: "Household", nameBn: "গৃহস্থালি", icon: "lamp", type: "expense" },
      { name: "Personal Care", nameBn: "ব্যক্তিগত যত্ন", icon: "heart", type: "expense" },
    ],
  },
  {
    name: "Digital Payments",
    nameBn: "ডিজিটাল পেমেন্ট",
    categories: [
      { name: "bKash", nameBn: "বিকাশ", icon: "banknote", type: "expense" },
      { name: "Nagad", nameBn: "নগদ", icon: "banknote", type: "expense" },
      { name: "Online Shopping", nameBn: "অনলাইন কেনাকাটা", icon: "package", type: "expense" },
      { name: "Subscription", nameBn: "সাবস্ক্রিপশন", icon: "repeat", type: "expense" },
    ],
  },
  {
    name: "Lifestyle",
    nameBn: "জীবনযাপন",
    categories: [
      { name: "Entertainment", nameBn: "বিনোদন", icon: "tv", type: "expense" },
      { name: "Shopping", nameBn: "কেনাকাটা", icon: "shopping-bag", type: "expense" },
      { name: "Health & Medical", nameBn: "স্বাস্থ্য ও চিকিৎসা", icon: "stethoscope", type: "expense" },
      { name: "Education", nameBn: "শিক্ষা", icon: "graduation-cap", type: "expense" },
      { name: "Gift & Donation", nameBn: "উপহার ও দান", icon: "gift", type: "expense" },
      { name: "Clothing", nameBn: "পোশাক", icon: "shirt", type: "expense" },
    ],
  },
  {
    name: "Savings Goals",
    nameBn: "সঞ্চয় লক্ষ্য",
    categories: [
      { name: "Emergency Fund", nameBn: "জরুরি তহবিল", icon: "shield-alert", type: "expense" },
      { name: "Vacation", nameBn: "ছুটি", icon: "plane", type: "expense" },
      { name: "Wedding", nameBn: "বিয়ে", icon: "heart", type: "expense" },
      { name: "Eid", nameBn: "ঈদ", icon: "moon", type: "expense" },
      { name: "New Device", nameBn: "নতুন ডিভাইস", icon: "laptop", type: "expense" },
    ],
  },
  {
    name: "Income",
    nameBn: "আয়",
    categories: [
      { name: "Salary", nameBn: "বেতন", icon: "briefcase", type: "income" },
      { name: "Freelance", nameBn: "ফ্রিল্যান্স", icon: "code", type: "income" },
      { name: "Business", nameBn: "ব্যবসা", icon: "building", type: "income" },
      { name: "Investment Return", nameBn: "বিনিয়োগ আয়", icon: "trending-up", type: "income" },
      { name: "Other Income", nameBn: "অন্যান্য আয়", icon: "plus-circle", type: "income" },
    ],
  },
];

// Transaction sources
export const TRANSACTION_SOURCES = {
  manual: "Manual",
  import: "Import",
  scheduled: "Scheduled",
  reconciliation: "Reconciliation",
  untracked: "Untracked",
} as const;
