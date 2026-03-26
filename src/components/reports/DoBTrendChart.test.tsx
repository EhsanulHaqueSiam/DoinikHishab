import { render } from "@testing-library/react-native";
import React from "react";
import { DoBTrendChart } from "./DoBTrendChart";

jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

describe("DoBTrendChart", () => {
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
      daysOfBuffering: 28,
    },
    {
      month: "2026-03",
      income: 0,
      expense: 0,
      net: 0,
      spendingByCategory: [],
      netWorth: 0,
      ageOfMoney: 28,
      daysOfBuffering: 35,
    },
  ];

  it("renders without crashing", () => {
    const { toJSON } = render(<DoBTrendChart data={mockData} />);
    expect(toJSON()).toBeTruthy();
  });

  it("displays DoB header label", () => {
    const { getByText } = render(<DoBTrendChart data={mockData} />);
    expect(getByText("reports.daysOfBuffering")).toBeTruthy();
  });

  it("shows current DoB value", () => {
    const { getByText } = render(<DoBTrendChart data={mockData} />);
    expect(getByText("35")).toBeTruthy();
  });

  it("shows days label", () => {
    const { getByText } = render(<DoBTrendChart data={mockData} />);
    expect(getByText("reports.days")).toBeTruthy();
  });

  it("shows improving trend when DoB increases", () => {
    const { getByText } = render(<DoBTrendChart data={mockData} />);
    // DoB went from 28 to 35, so improving
    expect(getByText(/reports\.improving/)).toBeTruthy();
  });

  it("handles empty data without crashing", () => {
    const { toJSON } = render(<DoBTrendChart data={[]} />);
    expect(toJSON()).toBeTruthy();
  });

  it("handles data with null daysOfBuffering values", () => {
    const nullData = [
      {
        month: "2026-01",
        income: 0,
        expense: 0,
        net: 0,
        spendingByCategory: [],
        netWorth: 0,
        ageOfMoney: 15,
        daysOfBuffering: null,
      },
    ];
    const { getByText } = render(<DoBTrendChart data={nullData} />);
    expect(getByText("reports.noData")).toBeTruthy();
  });
});
