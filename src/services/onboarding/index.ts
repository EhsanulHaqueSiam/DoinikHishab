/**
 * Onboarding state machine with MMKV persistence.
 * Manages the 5-step guided setup flow and lookback period preference.
 */

import { deleteSetting, getSetting, setSetting } from "../storage";

const ONBOARDING_COMPLETE_KEY = "onboarding_complete";
const ONBOARDING_STEP_KEY = "onboarding_step";
const LOOKBACK_DAYS_KEY = "lookback_days";

const DEFAULT_LOOKBACK_DAYS = 90;

export interface OnboardingState {
  isComplete: boolean;
  currentStep: number;
  completedSteps: boolean[];
}

export function isOnboardingComplete(): boolean {
  return getSetting(ONBOARDING_COMPLETE_KEY) === "true";
}

export function getOnboardingState(): OnboardingState {
  const isComplete = getSetting(ONBOARDING_COMPLETE_KEY) === "true";
  const step = Number(getSetting(ONBOARDING_STEP_KEY) || "0");
  const completedSteps = Array.from({ length: 5 }, (_, i) => i < step);
  return { isComplete, currentStep: step, completedSteps };
}

export function completeStep(step: number): OnboardingState {
  const nextStep = step + 1;
  setSetting(ONBOARDING_STEP_KEY, String(nextStep));
  return getOnboardingState();
}

export function skipOnboarding(): void {
  setSetting(ONBOARDING_COMPLETE_KEY, "true");
}

export function completeOnboarding(): void {
  setSetting(ONBOARDING_COMPLETE_KEY, "true");
  setSetting(ONBOARDING_STEP_KEY, "5");
}

export function resetOnboarding(): void {
  deleteSetting(ONBOARDING_COMPLETE_KEY);
  setSetting(ONBOARDING_STEP_KEY, "0");
}

export function getLookbackDays(): number {
  const stored = getSetting(LOOKBACK_DAYS_KEY);
  return stored ? Number(stored) : DEFAULT_LOOKBACK_DAYS;
}

export function setLookbackDays(days: number): void {
  setSetting(LOOKBACK_DAYS_KEY, String(days));
}

// Rule tip dismissal (MMKV-persisted)
const TIP_PREFIX = "tip_dismissed_";

export function isTipDismissed(ruleId: string): boolean {
  return getSetting(`${TIP_PREFIX}${ruleId}`) === "true";
}

export function dismissTip(ruleId: string): void {
  setSetting(`${TIP_PREFIX}${ruleId}`, "true");
}
