// Stateful in-memory mock for storage
const mockStore = new Map<string, string>();

jest.mock("../storage", () => ({
  getJSON: jest.fn((key: string) => {
    const val = mockStore.get(key);
    return val ? JSON.parse(val) : undefined;
  }),
  setJSON: jest.fn((key: string, value: unknown) => {
    mockStore.set(key, JSON.stringify(value));
  }),
  getSetting: jest.fn((key: string) => mockStore.get(key)),
  setSetting: jest.fn((key: string, value: string) => mockStore.set(key, value)),
  getAllKeys: jest.fn(() => Array.from(mockStore.keys())),
  deleteSetting: jest.fn((key: string) => { mockStore.delete(key); }),
}));

import {
  initDefaultFrequencies,
  getCategoryFrequencies,
  incrementCategoryFrequency,
  getFrequentCategoryIds,
  resetFrequencies,
} from "./index";

describe("frequency service", () => {
  beforeEach(() => {
    mockStore.clear();
  });

  describe("initDefaultFrequencies", () => {
    it("sets BD default category frequencies", () => {
      initDefaultFrequencies();

      const frequencies = getCategoryFrequencies();
      expect(frequencies.mock_cat_food_groceries).toBeDefined();
      expect(frequencies.mock_cat_food_groceries.count).toBe(30);
      expect(frequencies.mock_cat_transport.count).toBe(25);
      expect(frequencies.mock_cat_rickshaw.count).toBe(20);
      expect(frequencies.mock_cat_mobile_recharge.count).toBe(15);
      expect(frequencies.mock_cat_eating_out.count).toBe(12);
      expect(frequencies.mock_cat_utilities.count).toBe(10);
    });

    it("is idempotent - does not overwrite existing counts", () => {
      initDefaultFrequencies();

      // Manually increment one
      incrementCategoryFrequency("mock_cat_food_groceries");
      const afterIncrement = getCategoryFrequencies();
      expect(afterIncrement.mock_cat_food_groceries.count).toBe(31);

      // Call again -- should not reset
      initDefaultFrequencies();
      const afterSecondInit = getCategoryFrequencies();
      expect(afterSecondInit.mock_cat_food_groceries.count).toBe(31);
    });
  });

  describe("incrementCategoryFrequency", () => {
    it("increases count by 1 and updates lastUsed", () => {
      initDefaultFrequencies();
      const before = getCategoryFrequencies();
      const initialCount = before.mock_cat_transport.count;

      incrementCategoryFrequency("mock_cat_transport");

      const after = getCategoryFrequencies();
      expect(after.mock_cat_transport.count).toBe(initialCount + 1);
      expect(after.mock_cat_transport.lastUsed).toBeDefined();
    });

    it("creates entry for new category", () => {
      incrementCategoryFrequency("mock_cat_new");

      const frequencies = getCategoryFrequencies();
      expect(frequencies.mock_cat_new).toBeDefined();
      expect(frequencies.mock_cat_new.count).toBe(1);
    });
  });

  describe("getFrequentCategoryIds", () => {
    it("returns IDs sorted by count descending", () => {
      initDefaultFrequencies();
      const ids = getFrequentCategoryIds();

      // First should be food_groceries (count 30), then transport (25), etc.
      expect(ids[0]).toBe("mock_cat_food_groceries");
      expect(ids[1]).toBe("mock_cat_transport");
      expect(ids[2]).toBe("mock_cat_rickshaw");
    });

    it("respects limit parameter", () => {
      initDefaultFrequencies();
      const ids = getFrequentCategoryIds(5);
      expect(ids.length).toBe(5);
    });

    it("returns all IDs when limit exceeds count", () => {
      initDefaultFrequencies();
      const ids = getFrequentCategoryIds(100);
      expect(ids.length).toBe(10); // 10 BD defaults
    });
  });

  describe("resetFrequencies", () => {
    it("clears all frequency data", () => {
      initDefaultFrequencies();
      expect(Object.keys(getCategoryFrequencies()).length).toBeGreaterThan(0);

      resetFrequencies();
      expect(Object.keys(getCategoryFrequencies()).length).toBe(0);
    });
  });
});
