import { render } from "@testing-library/react-native";
import React from "react";
import { NetWorthLineChart } from "./NetWorthLineChart";

jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

describe("NetWorthLineChart", () => {
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
    const { toJSON } = render(<NetWorthLineChart data={mockData} />);
    expect(toJSON()).toBeTruthy();
  });

  it("displays net worth header label", () => {
    const { getByText } = render(<NetWorthLineChart data={mockData} />);
    expect(getByText("reports.netWorth")).toBeTruthy();
  });

  it("shows trend direction text", () => {
    const { getByText } = render(<NetWorthLineChart data={mockData} />);
    // Net worth went from 1000000 to 1330000 = up
    expect(getByText("reports.trendUp")).toBeTruthy();
  });

  it("renders empty state when no data", () => {
    const { getByText } = render(<NetWorthLineChart data={[]} />);
    expect(getByText("reports.noData")).toBeTruthy();
  });

  it("shows downward trend when net worth declines", () => {
    const decliningData = [
      {
        month: "2026-01",
        income: 0,
        expense: 0,
        net: 0,
        spendingByCategory: [],
        netWorth: 1000000,
        ageOfMoney: null,
        daysOfBuffering: null,
      },
      {
        month: "2026-02",
        income: 0,
        expense: 0,
        net: 0,
        spendingByCategory: [],
        netWorth: 800000,
        ageOfMoney: null,
        daysOfBuffering: null,
      },
    ];
    const { getByText } = render(<NetWorthLineChart data={decliningData} />);
    expect(getByText("reports.trendDown")).toBeTruthy();
  });
});
