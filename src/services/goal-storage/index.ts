/**
 * MMKV persistence for save-up goals and pay-down debts.
 * Uses versioned data structure for future migration support.
 * Follows the same pattern as recurring-storage.
 */

import type {
  GoalDataStore,
  PayDownGoal,
  SaveUpGoal,
} from "./types";
import { getJSON, setJSON } from "../storage";

const GOALS_KEY = "goals:data";

/** Get all goals from MMKV storage. Returns empty store if no data exists. */
export function getGoals(): GoalDataStore {
  const data = getJSON<GoalDataStore>(GOALS_KEY);
  return data ?? { version: 1, saveUpGoals: [], payDownGoals: [] };
}

/** Save the entire goals data store to MMKV. */
function persistGoals(store: GoalDataStore): void {
  setJSON(GOALS_KEY, store);
}

/** Save a new save-up goal. Generates a unique ID with goal_ prefix. */
export function saveSaveUpGoal(
  goal: Omit<SaveUpGoal, "id">
): SaveUpGoal {
  const id = `goal_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const saveUpGoal: SaveUpGoal = { ...goal, id };

  const store = getGoals();
  store.saveUpGoals.push(saveUpGoal);
  persistGoals(store);

  return saveUpGoal;
}

/** Update fields of a save-up goal by ID. */
export function updateSaveUpGoal(
  id: string,
  updates: Partial<Omit<SaveUpGoal, "id">>
): void {
  const store = getGoals();
  const idx = store.saveUpGoals.findIndex((g) => g.id === id);
  if (idx === -1) return;

  store.saveUpGoals[idx] = { ...store.saveUpGoals[idx], ...updates };
  persistGoals(store);
}

/** Delete a save-up goal by ID. */
export function deleteSaveUpGoal(id: string): void {
  const store = getGoals();
  store.saveUpGoals = store.saveUpGoals.filter((g) => g.id !== id);
  persistGoals(store);
}

/** Save a new pay-down goal (debt). Generates a unique ID with debt_ prefix. */
export function savePayDownGoal(
  goal: Omit<PayDownGoal, "id">
): PayDownGoal {
  const id = `debt_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const payDownGoal: PayDownGoal = { ...goal, id };

  const store = getGoals();
  store.payDownGoals.push(payDownGoal);
  persistGoals(store);

  return payDownGoal;
}

/** Update fields of a pay-down goal by ID. */
export function updatePayDownGoal(
  id: string,
  updates: Partial<Omit<PayDownGoal, "id">>
): void {
  const store = getGoals();
  const idx = store.payDownGoals.findIndex((d) => d.id === id);
  if (idx === -1) return;

  store.payDownGoals[idx] = { ...store.payDownGoals[idx], ...updates };
  persistGoals(store);
}

/** Delete a pay-down goal by ID. */
export function deletePayDownGoal(id: string): void {
  const store = getGoals();
  store.payDownGoals = store.payDownGoals.filter((d) => d.id !== id);
  persistGoals(store);
}
