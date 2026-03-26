/**
 * YNAB 4 Rules data with i18n keys and associated colors/icons.
 */

export interface YnabRule {
  id: number;
  titleKey: string;
  descKey: string;
  exampleKey: string;
  icon: string;
  color: string;
}

export const YNAB_RULES: YnabRule[] = [
  {
    id: 1,
    titleKey: "onboarding.rule1.title",
    descKey: "onboarding.rule1.desc",
    exampleKey: "onboarding.rule1.example",
    icon: "Briefcase",
    color: "#0d9488",
  },
  {
    id: 2,
    titleKey: "onboarding.rule2.title",
    descKey: "onboarding.rule2.desc",
    exampleKey: "onboarding.rule2.example",
    icon: "Calendar",
    color: "#e6a444",
  },
  {
    id: 3,
    titleKey: "onboarding.rule3.title",
    descKey: "onboarding.rule3.desc",
    exampleKey: "onboarding.rule3.example",
    icon: "RefreshCw",
    color: "#34d399",
  },
  {
    id: 4,
    titleKey: "onboarding.rule4.title",
    descKey: "onboarding.rule4.desc",
    exampleKey: "onboarding.rule4.example",
    icon: "Clock",
    color: "#8b5cf6",
  },
];
