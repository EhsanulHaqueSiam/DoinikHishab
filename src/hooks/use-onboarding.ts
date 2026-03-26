/**
 * Onboarding state hook with step navigation
 * Wraps the onboarding service with React state for reactivity.
 */

import { useCallback, useState } from "react";
import {
  completeOnboarding,
  completeStep,
  getOnboardingState,
  type OnboardingState,
  resetOnboarding,
  skipOnboarding,
} from "../services/onboarding";

export function useOnboarding() {
  const [state, setState] = useState<OnboardingState>(getOnboardingState);

  const advance = useCallback((step: number) => {
    const newState = completeStep(step);
    setState(newState);
  }, []);

  const skip = useCallback(() => {
    skipOnboarding();
    setState(getOnboardingState());
  }, []);

  const complete = useCallback(() => {
    completeOnboarding();
    setState(getOnboardingState());
  }, []);

  const reset = useCallback(() => {
    resetOnboarding();
    setState(getOnboardingState());
  }, []);

  return { ...state, advance, skip, complete, reset };
}
