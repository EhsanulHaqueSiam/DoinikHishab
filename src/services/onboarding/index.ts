/**
 * Onboarding state machine with MMKV persistence.
 * Manages the 5-step guided setup flow and lookback period preference.
 */

import { storage } from "../storage";

const ONBOARDING_COMPLETE_KEY = "onboarding_complete";
const ONBOARDING_STEP_KEY = "onboarding_step";
const LOOKBACK_DAYS_KEY = "lookback_days";

const DEFAULT_LOOKBACK_DAYS = 90;

export interface OnboardingState {
  isComplete: boolean;
  currentStep: number;
  completedSteps: boolean[];
}

export function getOnboardingState(): OnboardingState {
  const isComplete = storage.getString(ONBOARDING_COMPLETE_KEY) === "true";
  const step = Number(storage.getString(ONBOARDING_STEP_KEY) || "0");
  const completedSteps = Array.from({ length: 5 }, (_, i) => i < step);
  return { isComplete, currentStep: step, completedSteps };
}

export function completeStep(step: number): void {
  const nextStep = step + 1;
  storage.set(ONBOARDING_STEP_KEY, String(nextStep));
}

export function skipOnboarding(): void {
  storage.set(ONBOARDING_COMPLETE_KEY, "true");
}

export function completeOnboarding(): void {
  storage.set(ONBOARDING_COMPLETE_KEY, "true");
  storage.set(ONBOARDING_STEP_KEY, "5");
}

export function resetOnboarding(): void {
  storage.delete(ONBOARDING_COMPLETE_KEY);
  storage.set(ONBOARDING_STEP_KEY, "0");
}

export function getLookbackDays(): number {
  const stored = storage.getString(LOOKBACK_DAYS_KEY);
  return stored ? Number(stored) : DEFAULT_LOOKBACK_DAYS;
}

export function setLookbackDays(days: number): void {
  storage.set(LOOKBACK_DAYS_KEY, String(days));
}
