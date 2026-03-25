import { useCallback, useMemo } from "react";
import {
  getFrequentCategoryIds,
  incrementCategoryFrequency,
  initDefaultFrequencies,
} from "../services/frequency";

export function useCategoryFrequency() {
  // Initialize defaults on first call
  useMemo(() => {
    initDefaultFrequencies();
  }, []);

  const frequentIds = useMemo(() => getFrequentCategoryIds(), []);

  const increment = useCallback((categoryId: string) => {
    incrementCategoryFrequency(categoryId);
  }, []);

  return { frequentIds, increment };
}
