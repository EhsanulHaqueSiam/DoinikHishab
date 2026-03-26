import { render } from "@testing-library/react-native";
import React from "react";
import { CashFlowChart } from "./CashFlowChart";

// Mock i18n
jest.mock("../../lib/i18n", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: "en", changeLanguage: jest.fn() },
  }),
}));

describe("CashFlowChart", () => {
  const positiveData = [
    { date: "2026-03-26", value: 15000000 },
    { date: "2026-03-27", value: 14500000 },
    { date: "2026-03-28", value: 14000000 },
    { date: "2026-03-29", value: 13500000 },
    { date: "2026-03-30", value: 13000000 },
  ];

  const mixedData = [
    { date: "2026-03-26", value: 5000000 },
    { date: "2026-03-27", value: 2000000 },
    { date: "2026-03-28", value: -1000000 },
    { date: "2026-03-29", value: -3000000 },
    { date: "2026-03-30", value: 1000000 },
  ];

  it("renders the chart component", () => {
    const { getByTestId } = render(<CashFlowChart data={positiveData} horizon={30} />);
    expect(getByTestId("line-chart-bicolor")).toBeTruthy();
  });

  it("shows the estimated label", () => {
    const { getByTestId } = render(<CashFlowChart data={positiveData} horizon={30} />);
    expect(getByTestId("estimated-label")).toBeTruthy();
  });

  it("shows empty state when no data", () => {
    const { getByTestId, queryByTestId } = render(<CashFlowChart data={[]} horizon={30} />);
    expect(getByTestId("cash-flow-empty")).toBeTruthy();
    expect(queryByTestId("cash-flow-chart")).toBeNull();
  });

  it("shows empty state when fewer than 2 data points", () => {
    const { getByTestId } = render(
      <CashFlowChart data={[{ date: "2026-03-26", value: 15000000 }]} horizon={30} />
    );
    expect(getByTestId("cash-flow-empty")).toBeTruthy();
  });

  it("renders with positive-only data (no negative sections)", () => {
    const { getByTestId, queryByTestId } = render(
      <CashFlowChart data={positiveData} horizon={60} />
    );
    expect(getByTestId("cash-flow-chart")).toBeTruthy();
    expect(queryByTestId("cash-flow-empty")).toBeNull();
  });

  it("renders with data that goes below zero", () => {
    const { getByTestId } = render(<CashFlowChart data={mixedData} horizon={90} />);
    expect(getByTestId("cash-flow-chart")).toBeTruthy();
    expect(getByTestId("estimated-label")).toBeTruthy();
  });
});
