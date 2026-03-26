/**
 * Mock data for offline development
 * Mirrors Convex table shapes with stable mock_ prefixed IDs
 * Never pass these IDs to Convex mutations
 */

export interface MockCategory {
  _id: string;
  _creationTime: number;
  userId: string;
  name: string;
  nameBn?: string;
  icon?: string;
  color?: string;
  type: "expense" | "income" | "transfer";
  groupId: string;
  isHidden: boolean;
  isSystem: boolean;
  sortOrder: number;
}

export interface MockCategoryGroup {
  _id: string;
  _creationTime: number;
  userId: string;
  name: string;
  isHidden: boolean;
  sortOrder: number;
}

export interface MockAccount {
  _id: string;
  _creationTime: number;
  userId: string;
  name: string;
  type:
    | "checking"
    | "savings"
    | "cash"
    | "credit_card"
    | "line_of_credit"
    | "mortgage"
    | "auto_loan"
    | "student_loan"
    | "other_debt"
    | "other_asset";
  balance: number;
  icon?: string;
  color?: string;
  isDefault: boolean;
  isBudget: boolean;
  isClosed: boolean;
  sortOrder: number;
}

const MOCK_USER_ID = "mock_user_001";
const BASE_TIME = 1700000000000;

// --- Groups ---

export const MOCK_GROUPS: readonly MockCategoryGroup[] = Object.freeze([
  {
    _id: "mock_grp_essentials",
    _creationTime: BASE_TIME,
    userId: MOCK_USER_ID,
    name: "Essentials",
    isHidden: false,
    sortOrder: 0,
  },
  {
    _id: "mock_grp_lifestyle",
    _creationTime: BASE_TIME + 1,
    userId: MOCK_USER_ID,
    name: "Lifestyle",
    isHidden: false,
    sortOrder: 1,
  },
  {
    _id: "mock_grp_savings",
    _creationTime: BASE_TIME + 2,
    userId: MOCK_USER_ID,
    name: "Savings & Goals",
    isHidden: false,
    sortOrder: 2,
  },
  {
    _id: "mock_grp_income",
    _creationTime: BASE_TIME + 3,
    userId: MOCK_USER_ID,
    name: "Income",
    isHidden: false,
    sortOrder: 3,
  },
]);

// --- Categories ---

export const MOCK_CATEGORIES: readonly MockCategory[] = Object.freeze([
  // Essentials (7)
  {
    _id: "mock_cat_food_groceries",
    _creationTime: BASE_TIME + 10,
    userId: MOCK_USER_ID,
    name: "Food & Groceries",
    nameBn: "খাবার ও মুদি",
    icon: "shopping-cart",
    color: "#10b981",
    type: "expense",
    groupId: "mock_grp_essentials",
    isHidden: false,
    isSystem: false,
    sortOrder: 0,
  },
  {
    _id: "mock_cat_rent",
    _creationTime: BASE_TIME + 11,
    userId: MOCK_USER_ID,
    name: "Rent",
    nameBn: "বাড়ি ভাড়া",
    icon: "home",
    color: "#6366f1",
    type: "expense",
    groupId: "mock_grp_essentials",
    isHidden: false,
    isSystem: false,
    sortOrder: 1,
  },
  {
    _id: "mock_cat_utilities",
    _creationTime: BASE_TIME + 12,
    userId: MOCK_USER_ID,
    name: "Utilities",
    nameBn: "ইউটিলিটি",
    icon: "zap",
    color: "#f59e0b",
    type: "expense",
    groupId: "mock_grp_essentials",
    isHidden: false,
    isSystem: false,
    sortOrder: 2,
  },
  {
    _id: "mock_cat_transport",
    _creationTime: BASE_TIME + 13,
    userId: MOCK_USER_ID,
    name: "Transport",
    nameBn: "যাতায়াত",
    icon: "bus",
    color: "#3b82f6",
    type: "expense",
    groupId: "mock_grp_essentials",
    isHidden: false,
    isSystem: false,
    sortOrder: 3,
  },
  {
    _id: "mock_cat_rickshaw",
    _creationTime: BASE_TIME + 14,
    userId: MOCK_USER_ID,
    name: "Rickshaw",
    nameBn: "রিকশা",
    icon: "bike",
    color: "#8b5cf6",
    type: "expense",
    groupId: "mock_grp_essentials",
    isHidden: false,
    isSystem: false,
    sortOrder: 4,
  },
  {
    _id: "mock_cat_mobile_recharge",
    _creationTime: BASE_TIME + 15,
    userId: MOCK_USER_ID,
    name: "Mobile Recharge",
    nameBn: "মোবাইল রিচার্জ",
    icon: "smartphone",
    color: "#ec4899",
    type: "expense",
    groupId: "mock_grp_essentials",
    isHidden: false,
    isSystem: false,
    sortOrder: 5,
  },
  {
    _id: "mock_cat_medical",
    _creationTime: BASE_TIME + 16,
    userId: MOCK_USER_ID,
    name: "Medical",
    nameBn: "চিকিৎসা",
    icon: "stethoscope",
    color: "#ef4444",
    type: "expense",
    groupId: "mock_grp_essentials",
    isHidden: false,
    isSystem: false,
    sortOrder: 6,
  },
  // Lifestyle (5)
  {
    _id: "mock_cat_eating_out",
    _creationTime: BASE_TIME + 20,
    userId: MOCK_USER_ID,
    name: "Eating Out",
    nameBn: "বাইরে খাওয়া",
    icon: "utensils",
    color: "#f97316",
    type: "expense",
    groupId: "mock_grp_lifestyle",
    isHidden: false,
    isSystem: false,
    sortOrder: 0,
  },
  {
    _id: "mock_cat_shopping",
    _creationTime: BASE_TIME + 21,
    userId: MOCK_USER_ID,
    name: "Shopping",
    nameBn: "কেনাকাটা",
    icon: "shopping-bag",
    color: "#a855f7",
    type: "expense",
    groupId: "mock_grp_lifestyle",
    isHidden: false,
    isSystem: false,
    sortOrder: 1,
  },
  {
    _id: "mock_cat_entertainment",
    _creationTime: BASE_TIME + 22,
    userId: MOCK_USER_ID,
    name: "Entertainment",
    nameBn: "বিনোদন",
    icon: "tv",
    color: "#14b8a6",
    type: "expense",
    groupId: "mock_grp_lifestyle",
    isHidden: false,
    isSystem: false,
    sortOrder: 2,
  },
  {
    _id: "mock_cat_education",
    _creationTime: BASE_TIME + 23,
    userId: MOCK_USER_ID,
    name: "Education",
    nameBn: "শিক্ষা",
    icon: "graduation-cap",
    color: "#0ea5e9",
    type: "expense",
    groupId: "mock_grp_lifestyle",
    isHidden: false,
    isSystem: false,
    sortOrder: 3,
  },
  {
    _id: "mock_cat_clothing",
    _creationTime: BASE_TIME + 24,
    userId: MOCK_USER_ID,
    name: "Clothing",
    nameBn: "পোশাক",
    icon: "shirt",
    color: "#d946ef",
    type: "expense",
    groupId: "mock_grp_lifestyle",
    isHidden: false,
    isSystem: false,
    sortOrder: 4,
  },
  // Savings & Goals (3)
  {
    _id: "mock_cat_eid_fund",
    _creationTime: BASE_TIME + 30,
    userId: MOCK_USER_ID,
    name: "Eid Fund",
    nameBn: "ঈদ তহবিল",
    icon: "moon",
    color: "#eab308",
    type: "expense",
    groupId: "mock_grp_savings",
    isHidden: false,
    isSystem: false,
    sortOrder: 0,
  },
  {
    _id: "mock_cat_emergency",
    _creationTime: BASE_TIME + 31,
    userId: MOCK_USER_ID,
    name: "Emergency",
    nameBn: "জরুরি",
    icon: "shield-alert",
    color: "#dc2626",
    type: "expense",
    groupId: "mock_grp_savings",
    isHidden: false,
    isSystem: false,
    sortOrder: 1,
  },
  {
    _id: "mock_cat_school_fees",
    _creationTime: BASE_TIME + 32,
    userId: MOCK_USER_ID,
    name: "School Fees",
    nameBn: "স্কুল ফি",
    icon: "graduation-cap",
    color: "#2563eb",
    type: "expense",
    groupId: "mock_grp_savings",
    isHidden: false,
    isSystem: false,
    sortOrder: 2,
  },
  // Income (3)
  {
    _id: "mock_cat_salary",
    _creationTime: BASE_TIME + 40,
    userId: MOCK_USER_ID,
    name: "Salary",
    nameBn: "বেতন",
    icon: "banknote",
    color: "#22c55e",
    type: "income",
    groupId: "mock_grp_income",
    isHidden: false,
    isSystem: false,
    sortOrder: 0,
  },
  {
    _id: "mock_cat_freelance",
    _creationTime: BASE_TIME + 41,
    userId: MOCK_USER_ID,
    name: "Freelance",
    nameBn: "ফ্রিল্যান্স",
    icon: "laptop",
    color: "#06b6d4",
    type: "income",
    groupId: "mock_grp_income",
    isHidden: false,
    isSystem: false,
    sortOrder: 1,
  },
  {
    _id: "mock_cat_gift",
    _creationTime: BASE_TIME + 42,
    userId: MOCK_USER_ID,
    name: "Gift",
    nameBn: "উপহার",
    icon: "gift",
    color: "#f43f5e",
    type: "income",
    groupId: "mock_grp_income",
    isHidden: false,
    isSystem: false,
    sortOrder: 2,
  },
]);

// --- Accounts ---

export const MOCK_ACCOUNTS: readonly MockAccount[] = Object.freeze([
  {
    _id: "mock_acct_cash",
    _creationTime: BASE_TIME + 100,
    userId: MOCK_USER_ID,
    name: "Cash",
    type: "cash",
    balance: 500000, // 5000 taka
    icon: "banknote",
    color: "#22c55e",
    isDefault: true,
    isBudget: true,
    isClosed: false,
    sortOrder: 0,
  },
  {
    _id: "mock_acct_bkash",
    _creationTime: BASE_TIME + 101,
    userId: MOCK_USER_ID,
    name: "bKash",
    type: "checking",
    balance: 200000, // 2000 taka
    icon: "smartphone",
    color: "#e2136e",
    isDefault: false,
    isBudget: true,
    isClosed: false,
    sortOrder: 1,
  },
  {
    _id: "mock_acct_nagad",
    _creationTime: BASE_TIME + 102,
    userId: MOCK_USER_ID,
    name: "Nagad",
    type: "checking",
    balance: 100000, // 1000 taka
    icon: "smartphone",
    color: "#f6921e",
    isDefault: false,
    isBudget: true,
    isClosed: false,
    sortOrder: 2,
  },
]);
/**
 * Mock data for UI development while Convex backend is offline.
 * Contains sinking fund templates and category template sets.
 */

export interface SinkingFundTemplate {
  id: string;
  nameKey: string;
  nameBnKey: string;
  icon: string;
  targetAmount: number;
  monthsToTarget: number;
}

export const SINKING_FUND_TEMPLATES: readonly SinkingFundTemplate[] = [
  {
    id: "eid_fund",
    nameKey: "sinkingFunds.eidFund",
    nameBnKey: "sinkingFunds.eidFundBn",
    icon: "Star",
    targetAmount: 1000000,
    monthsToTarget: 4,
  },
  {
    id: "school_fees",
    nameKey: "sinkingFunds.schoolFees",
    nameBnKey: "sinkingFunds.schoolFeesBn",
    icon: "GraduationCap",
    targetAmount: 2000000,
    monthsToTarget: 6,
  },
  {
    id: "wedding_gifts",
    nameKey: "sinkingFunds.weddingGifts",
    nameBnKey: "sinkingFunds.weddingGiftsBn",
    icon: "Gift",
    targetAmount: 500000,
    monthsToTarget: 3,
  },
  {
    id: "medical_reserve",
    nameKey: "sinkingFunds.medicalReserve",
    nameBnKey: "sinkingFunds.medicalReserveBn",
    icon: "Heart",
    targetAmount: 3000000,
    monthsToTarget: 12,
  },
] as const;

export interface CategoryTemplateSet {
  id: string;
  nameKey: string;
  icon: string;
  descriptionKey: string;
  categoryIds: string[];
}

export const CATEGORY_TEMPLATE_SETS: readonly CategoryTemplateSet[] = [
  {
    id: "student",
    nameKey: "onboarding.templates.student",
    icon: "BookOpen",
    descriptionKey: "onboarding.templates.studentDesc",
    categoryIds: ["tuition", "books", "transport", "food", "entertainment"],
  },
  {
    id: "professional",
    nameKey: "onboarding.templates.professional",
    icon: "Briefcase",
    descriptionKey: "onboarding.templates.professionalDesc",
    categoryIds: ["rent", "utilities", "groceries", "transport", "savings", "dining"],
  },
  {
    id: "freelancer",
    nameKey: "onboarding.templates.freelancer",
    icon: "Laptop",
    descriptionKey: "onboarding.templates.freelancerDesc",
    categoryIds: ["internet", "software", "taxes", "savings", "equipment", "groceries"],
  },
  {
    id: "family",
    nameKey: "onboarding.templates.family",
    icon: "Users",
    descriptionKey: "onboarding.templates.familyDesc",
    categoryIds: [
      "rent",
      "utilities",
      "groceries",
      "education",
      "medical",
      "transport",
      "clothing",
    ],
  },
] as const;
