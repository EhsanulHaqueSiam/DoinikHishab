import { useCallback, useMemo, useState } from "react";
import { getGoalBudgetCategories } from "../services/goal-engine";
import {
  getGoals,
  savePayDownGoal,
  saveSaveUpGoal,
  deletePayDownGoal as storageDeletePayDownGoal,
  deleteSaveUpGoal as storageDeleteSaveUpGoal,
  updatePayDownGoal as storageUpdatePayDownGoal,
  updateSaveUpGoal as storageUpdateSaveUpGoal,
} from "../services/goal-storage";
import type { GoalBudgetCategory, PayDownGoal, SaveUpGoal } from "../services/goal-storage/types";

interface UseGoalsReturn {
  saveUpGoals: SaveUpGoal[];
  payDownGoals: PayDownGoal[];
  goalBudgetCategories: GoalBudgetCategory[];
  refreshKey: number;
  addSaveUpGoal: (goal: Omit<SaveUpGoal, "id">) => SaveUpGoal;
  updateSaveUpGoal: (id: string, updates: Partial<Omit<SaveUpGoal, "id">>) => void;
  deleteSaveUpGoal: (id: string) => void;
  addPayDownGoal: (goal: Omit<PayDownGoal, "id">) => PayDownGoal;
  updatePayDownGoal: (id: string, updates: Partial<Omit<PayDownGoal, "id">>) => void;
  deletePayDownGoal: (id: string) => void;
}

/**
 * Hook combining MMKV goals with budget integration.
 * Uses refreshKey counter pattern to trigger re-renders after MMKV writes.
 */
export function useGoals(): UseGoalsReturn {
  const [refreshKey, setRefreshKey] = useState(0);

  // Read goals from MMKV on mount and when refreshKey changes
  const store = useMemo(() => getGoals(), [refreshKey]);

  const goalBudgetCategories = useMemo(
    () => getGoalBudgetCategories(store.saveUpGoals),
    [store.saveUpGoals]
  );

  const addSaveUpGoal = useCallback((goal: Omit<SaveUpGoal, "id">): SaveUpGoal => {
    const saved = saveSaveUpGoal(goal);
    setRefreshKey((k) => k + 1);
    return saved;
  }, []);

  const handleUpdateSaveUpGoal = useCallback(
    (id: string, updates: Partial<Omit<SaveUpGoal, "id">>): void => {
      storageUpdateSaveUpGoal(id, updates);
      setRefreshKey((k) => k + 1);
    },
    []
  );

  const handleDeleteSaveUpGoal = useCallback((id: string): void => {
    storageDeleteSaveUpGoal(id);
    setRefreshKey((k) => k + 1);
  }, []);

  const addPayDownGoal = useCallback((goal: Omit<PayDownGoal, "id">): PayDownGoal => {
    const saved = savePayDownGoal(goal);
    setRefreshKey((k) => k + 1);
    return saved;
  }, []);

  const handleUpdatePayDownGoal = useCallback(
    (id: string, updates: Partial<Omit<PayDownGoal, "id">>): void => {
      storageUpdatePayDownGoal(id, updates);
      setRefreshKey((k) => k + 1);
    },
    []
  );

  const handleDeletePayDownGoal = useCallback((id: string): void => {
    storageDeletePayDownGoal(id);
    setRefreshKey((k) => k + 1);
  }, []);

  return {
    saveUpGoals: store.saveUpGoals,
    payDownGoals: store.payDownGoals,
    goalBudgetCategories,
    refreshKey,
    addSaveUpGoal,
    updateSaveUpGoal: handleUpdateSaveUpGoal,
    deleteSaveUpGoal: handleDeleteSaveUpGoal,
    addPayDownGoal,
    updatePayDownGoal: handleUpdatePayDownGoal,
    deletePayDownGoal: handleDeletePayDownGoal,
  };
}
