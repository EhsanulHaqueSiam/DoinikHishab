import React from "react";
import { render, screen, fireEvent } from "@testing-library/react-native";
import { CategoryGrid } from "./CategoryGrid";
import { MOCK_CATEGORIES, MOCK_GROUPS } from "../../services/mock-data";

// Mock platform shadow
jest.mock("../../lib/platform", () => ({
  shadow: jest.fn().mockReturnValue({}),
  isWeb: false,
  isIOS: false,
  isAndroid: true,
  isMobile: true,
}));

describe("CategoryGrid", () => {
  const mockOnSelect = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders group headings for expense categories", () => {
    render(
      <CategoryGrid
        categories={[...MOCK_CATEGORIES]}
        groups={[...MOCK_GROUPS]}
        selectedId={null}
        onSelect={mockOnSelect}
        type="expense"
      />
    );

    // Essentials, Lifestyle, and Savings groups have expense categories
    expect(screen.getByText("Essentials")).toBeTruthy();
    expect(screen.getByText("Lifestyle")).toBeTruthy();
    expect(screen.getByText("Savings & Goals")).toBeTruthy();
  });

  it("renders category names within groups", () => {
    render(
      <CategoryGrid
        categories={[...MOCK_CATEGORIES]}
        groups={[...MOCK_GROUPS]}
        selectedId={null}
        onSelect={mockOnSelect}
        type="expense"
      />
    );

    expect(screen.getByText("Food & Groceries")).toBeTruthy();
    expect(screen.getByText("Transport")).toBeTruthy();
    expect(screen.getByText("Rickshaw")).toBeTruthy();
    expect(screen.getByText("Eating Out")).toBeTruthy();
  });

  it("calls onSelect when category is pressed", () => {
    render(
      <CategoryGrid
        categories={[...MOCK_CATEGORIES]}
        groups={[...MOCK_GROUPS]}
        selectedId={null}
        onSelect={mockOnSelect}
        type="expense"
      />
    );

    fireEvent.press(screen.getByText("Food & Groceries"));
    expect(mockOnSelect).toHaveBeenCalledWith("mock_cat_food_groceries");
  });

  it("filters categories by type (income shows only income categories)", () => {
    render(
      <CategoryGrid
        categories={[...MOCK_CATEGORIES]}
        groups={[...MOCK_GROUPS]}
        selectedId={null}
        onSelect={mockOnSelect}
        type="income"
      />
    );

    // Income categories should be visible
    expect(screen.getByText("Salary")).toBeTruthy();
    expect(screen.getByText("Freelance")).toBeTruthy();

    // Expense categories should NOT be visible
    expect(screen.queryByText("Food & Groceries")).toBeNull();
    expect(screen.queryByText("Transport")).toBeNull();
  });
});
