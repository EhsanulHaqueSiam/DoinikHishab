import React from "react";
import { render } from "@testing-library/react-native";
import { SubscriptionHeader } from "./SubscriptionHeader";
import type { Subscription } from "./recurring-types";

jest.mock("../../lib/i18n", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const map: Record<string, string> = {
        "recurring.burnRate": "Burn Rate",
        "recurring.monthly": "Monthly",
        "recurring.annual": "Annual",
      };
      return map[key] ?? key;
    },
  }),
}));

const makeSub = (
  overrides: Partial<Subscription> = {},
): Subscription => ({
  id: "sub_1",
  payee: "Netflix",
  amount: 50000,
  frequency: "monthly",
  categoryId: "mock_cat_1",
  nextDueDate: "2026-04-01",
  isActive: true,
  type: "expense",
  ...overrides,
});

describe("SubscriptionHeader", () => {
  it("renders monthly and annual burn rate amounts", () => {
    const subs = [makeSub({ amount: 50000 })];
    const { getAllByText } = render(
      <SubscriptionHeader subscriptions={subs} />,
    );

    // Monthly: 50000 paisa = 500.00 taka
    // Should appear in hero, monthly column
    const monthlyTexts = getAllByText(/500\.00/);
    expect(monthlyTexts.length).toBeGreaterThanOrEqual(2);

    // Annual: 50000 * 12 = 600000 paisa = 6000.00 taka
    expect(getAllByText(/6,000\.00/).length).toBeGreaterThanOrEqual(1);
  });

  it("correctly calculates burn rate from mixed frequency subscriptions", () => {
    const subs = [
      makeSub({ amount: 100000, frequency: "monthly" }), // 1000/month
      makeSub({ id: "sub_2", amount: 10000, frequency: "weekly" }), // 100 * 4.33 = 433/month
      makeSub({ id: "sub_3", amount: 1200000, frequency: "yearly" }), // 12000 / 12 = 1000/month
    ];
    const { getAllByText } = render(
      <SubscriptionHeader subscriptions={subs} />,
    );

    // Total monthly: 100000 + 43300 + 100000 = 243300 paisa = 2,433.00 taka
    // Appears in hero display and monthly column
    const burnTexts = getAllByText(/2,433\.00/);
    expect(burnTexts.length).toBeGreaterThanOrEqual(2);
  });

  it("renders zero when no subscriptions", () => {
    const { getAllByText } = render(
      <SubscriptionHeader subscriptions={[]} />,
    );

    // 0 paisa = 0.00 taka
    const zeroTexts = getAllByText(/0\.00/);
    expect(zeroTexts.length).toBeGreaterThanOrEqual(1);
  });

  it("has accessibility label with monthly total", () => {
    const subs = [makeSub({ amount: 50000 })];
    const { getByLabelText } = render(
      <SubscriptionHeader subscriptions={subs} />,
    );

    expect(getByLabelText(/Monthly subscription total/)).toBeTruthy();
  });
});
