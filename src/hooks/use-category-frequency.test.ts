import { renderHook } from "@testing-library/react-native";

// Mock the frequency service
const mockGetFrequentCategoryIds = jest.fn().mockReturnValue([
  "mock_cat_food_groceries",
  "mock_cat_transport",
  "mock_cat_rickshaw",
]);
const mockIncrementCategoryFrequency = jest.fn();
const mockInitDefaultFrequencies = jest.fn();

jest.mock("../services/frequency", () => ({
  getFrequentCategoryIds: (...args: unknown[]) => mockGetFrequentCategoryIds(...args),
  incrementCategoryFrequency: (...args: unknown[]) => mockIncrementCategoryFrequency(...args),
  initDefaultFrequencies: () => mockInitDefaultFrequencies(),
}));

import { useCategoryFrequency } from "./use-category-frequency";

describe("useCategoryFrequency", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns frequentIds as a string array", () => {
    const { result } = renderHook(() => useCategoryFrequency());

    expect(Array.isArray(result.current.frequentIds)).toBe(true);
    expect(result.current.frequentIds).toEqual([
      "mock_cat_food_groceries",
      "mock_cat_transport",
      "mock_cat_rickshaw",
    ]);
  });

  it("initializes default frequencies on mount", () => {
    renderHook(() => useCategoryFrequency());
    expect(mockInitDefaultFrequencies).toHaveBeenCalled();
  });

  it("increment function calls incrementCategoryFrequency", () => {
    const { result } = renderHook(() => useCategoryFrequency());

    result.current.increment("mock_cat_food_groceries");
    expect(mockIncrementCategoryFrequency).toHaveBeenCalledWith("mock_cat_food_groceries");
  });
});
