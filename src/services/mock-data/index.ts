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
    categoryIds: ["rent", "utilities", "groceries", "education", "medical", "transport", "clothing"],
  },
] as const;
