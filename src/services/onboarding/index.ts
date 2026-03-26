/**
 * Onboarding state machine with MMKV persistence
 * Manages 5-step onboarding flow: Learn Rules -> Add Account -> Choose Categories -> Assign Money -> Enter Transaction
 * State persists across app restarts via MMKV storage
 */

import { getJSON, setJSON, deleteKey, getSetting, setSetting } from "../storage";

const ONBOARDING_KEY = "onboarding_state";
const LOOKBACK_KEY = "metrics_lookback_days";
const TIP_PREFIX = "tip_dismissed_";
const TOTAL_STEPS = 5;

export interface OnboardingState {
  currentStep: number;
  completedSteps: boolean[];
  isComplete: boolean;
  skipped: boolean;
}

function defaultState(): OnboardingState {
  return {
    currentStep: 0,
    completedSteps: Array(TOTAL_STEPS).fill(false),
    isComplete: false,
    skipped: false,
  };
}

/**
 * Get current onboarding state from MMKV.
 * Returns default state (step 0, nothing complete) if no saved state.
 */
export function getOnboardingState(): OnboardingState {
  const saved = getJSON<OnboardingState>(ONBOARDING_KEY);
  if (!saved) return defaultState();

  // Validate shape -- corrupted state resets to default
  if (
    typeof saved.currentStep !== "number" ||
    !Array.isArray(saved.completedSteps) ||
    saved.completedSteps.length !== TOTAL_STEPS ||
    typeof saved.isComplete !== "boolean" ||
    typeof saved.skipped !== "boolean"
  ) {
    return defaultState();
  }

  return saved;
}

/**
 * Mark a step as complete and advance to the next step.
 * Returns the updated state.
 */
export function completeStep(step: number): OnboardingState {
  const state = getOnboardingState();

  if (step < 0 || step >= TOTAL_STEPS) return state;

  state.completedSteps[step] = true;

  // Advance to next incomplete step, or stay at current
  const nextStep = state.completedSteps.findIndex((done, i) => !done && i > step);
  state.currentStep = nextStep === -1 ? TOTAL_STEPS : nextStep;

  setJSON(ONBOARDING_KEY, state);
  return state;
}

/**
 * Skip the entire onboarding flow.
 * Marks all steps complete and sets skipped flag.
 */
export function skipOnboarding(): void {
  const state: OnboardingState = {
    currentStep: TOTAL_STEPS,
    completedSteps: Array(TOTAL_STEPS).fill(true),
    isComplete: true,
    skipped: true,
  };
  setJSON(ONBOARDING_KEY, state);
}

/**
 * Mark onboarding as complete (user finished all steps).
 */
export function completeOnboarding(): void {
  const state = getOnboardingState();
  state.isComplete = true;
  setJSON(ONBOARDING_KEY, state);
}

/**
 * Reset onboarding state (for "Redo Setup" in settings).
 */
export function resetOnboarding(): void {
  deleteKey(ONBOARDING_KEY);
}

/**
 * Quick check: is onboarding complete?
 */
export function isOnboardingComplete(): boolean {
  return getOnboardingState().isComplete;
}

// --- Tip Dismissal ---

/**
 * Check if a contextual rule tip has been dismissed.
 */
export function isTipDismissed(ruleId: string): boolean {
  return getSetting(`${TIP_PREFIX}${ruleId}`) === "true";
}

/**
 * Dismiss a contextual rule tip (persists across sessions).
 */
export function dismissTip(ruleId: string): void {
  setSetting(`${TIP_PREFIX}${ruleId}`, "true");
}

// --- Lookback Period ---

const DEFAULT_LOOKBACK = 90;

/**
 * Get the configured lookback period for Days of Buffering calculation.
 * Default: 90 days.
 */
export function getLookbackDays(): number {
  const val = getSetting(LOOKBACK_KEY);
  if (val == null) return DEFAULT_LOOKBACK;
  const parsed = parseInt(val, 10);
  return Number.isNaN(parsed) ? DEFAULT_LOOKBACK : parsed;
}

/**
 * Set the lookback period for Days of Buffering calculation.
 */
export function setLookbackDays(days: number): void {
  setSetting(LOOKBACK_KEY, String(days));
}
