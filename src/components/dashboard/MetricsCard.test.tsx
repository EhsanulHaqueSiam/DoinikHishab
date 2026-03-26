import { render, screen } from "@testing-library/react-native";
import { MetricsCard } from "./MetricsCard";

// Mock useMetrics hook
jest.mock("../../hooks/use-metrics", () => ({
  useMetrics: jest.fn(),
}));

// Mock i18n
jest.mock("../../lib/i18n", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const map: Record<string, string> = {
        "metrics.ageLabel": "AGE OF MONEY",
        "metrics.bufferLabel": "BUFFER",
        "metrics.days": "days",
        "metrics.noDays": "no data",
        "metrics.noAgeDesc": "Add transactions to see your Age of Money",
        "metrics.noBufferDesc": "Add transactions to calculate your buffer",
        "metrics.lookbackSettings": "Buffer lookback settings",
        "metrics.ageOfMoney": "Age of Money",
        "metrics.trendImproving": "improving",
        "metrics.trendDeclining": "declining",
        "metrics.trendFlat": "flat",
      };
      return map[key] || key;
    },
    locale: "en",
  }),
}));

// Mock platform shadow
jest.mock("../../lib/platform", () => ({
  shadow: () => ({}),
}));

import { useMetrics } from "../../hooks/use-metrics";

describe("MetricsCard", () => {
  it("renders Age of Money value when data exists", () => {
    (useMetrics as jest.Mock).mockReturnValue({
      ageOfMoney: 25,
      ageOfMoneyTrend: "improving",
      daysOfBuffering: 45,
      lookbackDays: 90,
    });
    render(<MetricsCard />);
    expect(screen.getByText(/25/)).toBeTruthy();
    expect(screen.getByText(/45/)).toBeTruthy();
  });

  it("renders placeholder text when data is null", () => {
    (useMetrics as jest.Mock).mockReturnValue({
      ageOfMoney: null,
      ageOfMoneyTrend: null,
      daysOfBuffering: null,
      lookbackDays: 90,
    });
    render(<MetricsCard />);
    expect(screen.getAllByText(/--/).length).toBeGreaterThanOrEqual(1);
  });

  it("renders settings gear button", () => {
    (useMetrics as jest.Mock).mockReturnValue({
      ageOfMoney: 25,
      ageOfMoneyTrend: "improving",
      daysOfBuffering: 45,
      lookbackDays: 90,
    });
    const onSettingsPress = jest.fn();
    render(<MetricsCard onSettingsPress={onSettingsPress} />);
    // Verify settings gear is accessible
    expect(screen.getByLabelText(/lookback/i)).toBeTruthy();
  });

  it("shows Age of Money label", () => {
    (useMetrics as jest.Mock).mockReturnValue({
      ageOfMoney: 10,
      ageOfMoneyTrend: "flat",
      daysOfBuffering: 20,
      lookbackDays: 90,
    });
    render(<MetricsCard />);
    expect(screen.getByText("AGE OF MONEY")).toBeTruthy();
    expect(screen.getByText("BUFFER")).toBeTruthy();
  });
});
