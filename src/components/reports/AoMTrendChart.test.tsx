import { render } from "@testing-library/react-native";
import React from "react";
import { AoMTrendChart } from "./AoMTrendChart";

jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

describe("AoMTrendChart", () => {
  const mockData = [
    {
      month: "2026-01",
      income: 0,
      expense: 0,
      net: 0,
      spendingByCategory: [],
      netWorth: 0,
      ageOfMoney: 15,
      daysOfBuffering: 20,
    },
    {
      month: "2026-02",
      income: 0,
      expense: 0,
      net: 0,
      spendingByCategory: [],
      netWorth: 0,
      ageOfMoney: 22,
      daysOfBuffering: 25,
    },
    {
      month: "2026-03",
      income: 0,
      expense: 0,
      net: 0,
      spendingByCategory: [],
      netWorth: 0,
      ageOfMoney: 28,
      daysOfBuffering: 30,
    },
  ];

  it("renders without crashing", () => {
    const { toJSON } = render(<AoMTrendChart data={mockData} />);
    expect(toJSON()).toBeTruthy();
  });

  it("displays AoM header label", () => {
    const { getByText } = render(<AoMTrendChart data={mockData} />);
    expect(getByText("reports.ageOfMoney")).toBeTruthy();
  });

  it("shows current AoM value", () => {
    const { getByText } = render(<AoMTrendChart data={mockData} />);
    expect(getByText("28")).toBeTruthy();
  });

  it("shows days label", () => {
    const { getByText } = render(<AoMTrendChart data={mockData} />);
    expect(getByText("reports.days")).toBeTruthy();
  });

  it("shows improving trend when AoM increases", () => {
    const { getByText } = render(<AoMTrendChart data={mockData} />);
    // AoM went from 22 to 28, so improving
    expect(getByText(/reports\.improving/)).toBeTruthy();
  });

  it("handles empty data without crashing", () => {
    const { toJSON } = render(<AoMTrendChart data={[]} />);
    expect(toJSON()).toBeTruthy();
  });

  it("handles data with null ageOfMoney values", () => {
    const nullData = [
      {
        month: "2026-01",
        income: 0,
        expense: 0,
        net: 0,
        spendingByCategory: [],
        netWorth: 0,
        ageOfMoney: null,
        daysOfBuffering: null,
      },
    ];
    const { getByText } = render(<AoMTrendChart data={nullData} />);
    expect(getByText("reports.noData")).toBeTruthy();
  });
});
