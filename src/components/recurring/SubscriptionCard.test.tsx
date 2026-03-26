import { fireEvent, render } from "@testing-library/react-native";
import React from "react";
import type { DetectedSubscription } from "./recurring-types";
import { SubscriptionCard } from "./SubscriptionCard";

jest.mock("../../lib/i18n", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const map: Record<string, string> = {
        "recurring.monthly": "Monthly",
        "recurring.weekly": "Weekly",
        "recurring.yearly": "Yearly",
        "recurring.confirm": "Confirm",
        "recurring.notSubscription": "Not a subscription",
      };
      return map[key] ?? key;
    },
  }),
}));

const mockSubscription: DetectedSubscription = {
  payee: "Netflix",
  amount: 50000,
  frequency: "monthly",
  confidence: 0.9,
  occurrences: 5,
  lastDate: "2026-03-15",
  categoryId: "mock_cat_1",
};

describe("SubscriptionCard", () => {
  it("renders payee name and amount", () => {
    const { getByText } = render(
      <SubscriptionCard
        subscription={mockSubscription}
        onConfirm={jest.fn()}
        onDismiss={jest.fn()}
      />
    );

    expect(getByText("Netflix")).toBeTruthy();
    // formatCurrency returns BDT format with paisa
    expect(getByText(/500/)).toBeTruthy();
  });

  it("calls onConfirm when Confirm button pressed", () => {
    const onConfirm = jest.fn();
    const { getByText } = render(
      <SubscriptionCard
        subscription={mockSubscription}
        onConfirm={onConfirm}
        onDismiss={jest.fn()}
      />
    );

    fireEvent.press(getByText("Confirm"));
    expect(onConfirm).toHaveBeenCalledWith(mockSubscription);
  });

  it("calls onDismiss when Not a subscription button pressed", () => {
    const onDismiss = jest.fn();
    const { getByText } = render(
      <SubscriptionCard
        subscription={mockSubscription}
        onConfirm={jest.fn()}
        onDismiss={onDismiss}
      />
    );

    fireEvent.press(getByText("Not a subscription"));
    expect(onDismiss).toHaveBeenCalledWith("Netflix");
  });

  it("shows high confidence text when confidence > 0.8", () => {
    const { getByText } = render(
      <SubscriptionCard
        subscription={mockSubscription}
        onConfirm={jest.fn()}
        onDismiss={jest.fn()}
      />
    );

    expect(getByText("High match")).toBeTruthy();
  });

  it("shows possible match text when confidence <= 0.8", () => {
    const lowConfidence: DetectedSubscription = {
      ...mockSubscription,
      confidence: 0.7,
    };
    const { getByText } = render(
      <SubscriptionCard subscription={lowConfidence} onConfirm={jest.fn()} onDismiss={jest.fn()} />
    );

    expect(getByText("Possible match")).toBeTruthy();
  });
});
