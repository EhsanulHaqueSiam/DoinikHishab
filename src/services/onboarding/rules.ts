/**
 * YNAB 4 Rules data constant
 * Uses i18n keys for all user-facing strings (not hardcoded text)
 * Colors match the Obsidian Finance design system
 */

export interface YnabRule {
  id: number;
  titleKey: string;
  descKey: string;
  exampleKey: string;
  icon: string; // lucide icon name
  color: string;
}

export const YNAB_RULES: YnabRule[] = [
  {
    id: 1,
    titleKey: "onboarding.rule1.title",
    descKey: "onboarding.rule1.description",
    exampleKey: "onboarding.rule1.example",
    icon: "briefcase",
    color: "#0d9488",
  },
  {
    id: 2,
    titleKey: "onboarding.rule2.title",
    descKey: "onboarding.rule2.description",
    exampleKey: "onboarding.rule2.example",
    icon: "calendar",
    color: "#e6a444",
  },
  {
    id: 3,
    titleKey: "onboarding.rule3.title",
    descKey: "onboarding.rule3.description",
    exampleKey: "onboarding.rule3.example",
    icon: "refresh-cw",
    color: "#34d399",
  },
  {
    id: 4,
    titleKey: "onboarding.rule4.title",
    descKey: "onboarding.rule4.description",
    exampleKey: "onboarding.rule4.example",
    icon: "clock",
    color: "#8b5cf6",
  },
];

/**
 * Onboarding step definitions for the stepper component.
 * Maps to the 5-step flow: Learn Rules -> Add Account -> Choose Categories -> Assign Money -> Enter Transaction
 */
export interface OnboardingStep {
  id: number;
  nameKey: string; // i18n key
  icon: string; // lucide icon name
}

export const ONBOARDING_STEPS: OnboardingStep[] = [
  { id: 0, nameKey: "onboarding.step1", icon: "book-open" },
  { id: 1, nameKey: "onboarding.step2", icon: "wallet" },
  { id: 2, nameKey: "onboarding.step3", icon: "grid" },
  { id: 3, nameKey: "onboarding.step4", icon: "banknote" },
  { id: 4, nameKey: "onboarding.step5", icon: "receipt" },
];
