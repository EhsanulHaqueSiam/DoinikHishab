/**
 * Category usage frequency tracking
 * MMKV-backed with Bangladesh-relevant defaults
 */

import { getJSON, setJSON, getAllKeys, getSetting, setSetting, deleteSetting } from "../storage";

export interface FrequencyEntry {
  count: number;
  lastUsed: string; // ISO date
}

// Bangladesh default category frequencies (keyed by mock category ID)
const BD_DEFAULTS: Record<string, number> = {
  mock_cat_food_groceries: 30,
  mock_cat_transport: 25,
  mock_cat_rickshaw: 20,
  mock_cat_mobile_recharge: 15,
  mock_cat_eating_out: 12,
  mock_cat_utilities: 10,
  mock_cat_medical: 8,
  mock_cat_shopping: 6,
  mock_cat_rent: 4,
  mock_cat_entertainment: 3,
};

const FREQ_PREFIX = "freq:";
const DEFAULTS_KEY = "freq:defaults_initialized";

/**
 * Initialize default frequencies for new users.
 * Idempotent - does not overwrite existing counts.
 */
export function initDefaultFrequencies(): void {
  if (getSetting(DEFAULTS_KEY)) return;

  const today = new Date().toISOString().split("T")[0];

  for (const [categoryId, count] of Object.entries(BD_DEFAULTS)) {
    const key = `${FREQ_PREFIX}${categoryId}`;
    const existing = getJSON<FrequencyEntry>(key);
    if (!existing) {
      setJSON<FrequencyEntry>(key, { count, lastUsed: today });
    }
  }

  setSetting(DEFAULTS_KEY, "true");
}

/**
 * Get all category frequency entries
 */
export function getCategoryFrequencies(): Record<string, FrequencyEntry> {
  const result: Record<string, FrequencyEntry> = {};
  const keys = getAllKeys();

  for (const key of keys) {
    if (key.startsWith(FREQ_PREFIX) && key !== DEFAULTS_KEY) {
      const categoryId = key.slice(FREQ_PREFIX.length);
      const entry = getJSON<FrequencyEntry>(key);
      if (entry) {
        result[categoryId] = entry;
      }
    }
  }

  return result;
}

/**
 * Increment usage count for a category
 */
export function incrementCategoryFrequency(categoryId: string): void {
  const key = `${FREQ_PREFIX}${categoryId}`;
  const existing = getJSON<FrequencyEntry>(key);
  const today = new Date().toISOString().split("T")[0];

  setJSON<FrequencyEntry>(key, {
    count: (existing?.count ?? 0) + 1,
    lastUsed: today,
  });
}

/**
 * Get category IDs sorted by usage frequency (descending)
 * @param limit Maximum number of IDs to return (default 20)
 */
export function getFrequentCategoryIds(limit = 20): string[] {
  const frequencies = getCategoryFrequencies();

  return Object.entries(frequencies)
    .sort(([, a], [, b]) => {
      if (b.count !== a.count) return b.count - a.count;
      return b.lastUsed.localeCompare(a.lastUsed);
    })
    .slice(0, limit)
    .map(([id]) => id);
}

/**
 * Reset all frequency data (for testing)
 */
export function resetFrequencies(): void {
  const keys = getAllKeys();
  for (const key of keys) {
    if (key.startsWith(FREQ_PREFIX)) {
      deleteSetting(key);
    }
  }
}
