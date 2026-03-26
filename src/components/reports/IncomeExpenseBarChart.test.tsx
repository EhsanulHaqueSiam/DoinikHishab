import React from "react";
import { render } from "@testing-library/react-native";
import { IncomeExpenseBarChart } from "./IncomeExpenseBarChart";

jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

describe("IncomeExpenseBarChart", () => {
  const mockData = [
    {
      month: "2026-01",
      income: 500000,
      expense: 350000,
      net: 150000,
      spendingByCategory: [],
      netWorth: 1000000,
      ageOfMoney: 20,
      daysOfBuffering: 25,
    },
    {
      month: "2026-02",
      income: 550000,
      expense: 400000,
      net: 150000,
      spendingByCategory: [],
      netWorth: 1150000,
      ageOfMoney: 22,
      daysOfBuffering: 28,
    },
    {
      month: "2026-03",
      income: 600000,
      expense: 420000,
      net: 180000,
      spendingByCategory: [],
      netWorth: 1330000,
      ageOfMoney: 25,
      daysOfBuffering: 30,
    },
  ];

  it("renders without crashing", () => {
    const { toJSON } = render(
      <IncomeExpenseBarChart data={mockData} />,
    );
    expect(toJSON()).toBeTruthy();
  });

  it("displays income and expense labels", () => {
    const { getByText } = render(
      <IncomeExpenseBarChart data={mockData} />,
    );
    expect(getByText("reports.totalIncome")).toBeTruthy();
    expect(getByText("reports.totalExpense")).toBeTruthy();
  });

  it("shows net savings row", () => {
    const { getByText } = render(
      <IncomeExpenseBarChart data={mockData} />,
    );
    expect(getByText("reports.netSavings")).toBeTruthy();
  });

  it("renders empty state when no data", () => {
    const { getByText } = render(
      <IncomeExpenseBarChart data={[]} />,
    );
    expect(getByText("reports.noData")).toBeTruthy();
  });

  it("shows legend entries", () => {
    const { getByText } = render(
      <IncomeExpenseBarChart data={mockData} />,
    );
    expect(getByText("transaction.income")).toBeTruthy();
    expect(getByText("transaction.expense")).toBeTruthy();
  });
});
