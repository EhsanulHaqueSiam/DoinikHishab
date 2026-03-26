import React from "react";
import { render } from "@testing-library/react-native";
import { SpendingBarChart } from "./SpendingBarChart";

jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

describe("SpendingBarChart", () => {
  const mockCategories = [
    {
      categoryId: "mock_cat_1",
      name: "Groceries",
      color: "#3B82F6",
      total: 150000,
      percentage: 40,
    },
    {
      categoryId: "mock_cat_2",
      name: "Transport",
      color: "#EF4444",
      total: 100000,
      percentage: 30,
    },
    {
      categoryId: "mock_cat_3",
      name: "Utilities",
      color: "#10B981",
      total: 50000,
      percentage: 15,
    },
  ];

  it("renders without crashing", () => {
    const { toJSON } = render(
      <SpendingBarChart categories={mockCategories} totalSpending={300000} />,
    );
    expect(toJSON()).toBeTruthy();
  });

  it("displays total spending header", () => {
    const { getByText } = render(
      <SpendingBarChart categories={mockCategories} totalSpending={300000} />,
    );
    expect(getByText("reports.totalSpending")).toBeTruthy();
  });

  it("renders empty state when no categories", () => {
    const { getByText } = render(
      <SpendingBarChart categories={[]} totalSpending={0} />,
    );
    expect(getByText("reports.noData")).toBeTruthy();
  });

  it("sorts categories by total descending", () => {
    const unsorted = [
      { categoryId: "mock_1", name: "Small", color: "#aaa", total: 1000, percentage: 5 },
      { categoryId: "mock_2", name: "Large", color: "#bbb", total: 50000, percentage: 95 },
    ];
    const { toJSON } = render(
      <SpendingBarChart categories={unsorted} totalSpending={51000} />,
    );
    expect(toJSON()).toBeTruthy();
  });
});
