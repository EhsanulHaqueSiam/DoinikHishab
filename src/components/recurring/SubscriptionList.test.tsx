import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { SubscriptionList } from "./SubscriptionList";
import type { Subscription } from "./recurring-types";

jest.mock("../../lib/i18n", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const map: Record<string, string> = {
        "recurring.weekly": "Weekly",
        "recurring.monthly": "Monthly",
        "recurring.yearly": "Yearly",
        "recurring.delete": "Delete",
        "recurring.noSubscriptionsTitle": "No Subscriptions Yet",
        "recurring.noSubscriptionsBody":
          "Add subscriptions manually or let us detect them from your transaction history.",
      };
      return map[key] ?? key;
    },
  }),
}));

// FlashList mock (renders items via FlatList-like interface)
jest.mock("@shopify/flash-list", () => {
  const React = require("react");
  const { View } = require("react-native");
  return {
    FlashList: ({ data, renderItem, keyExtractor }: any) =>
      React.createElement(
        View,
        { testID: "flash-list" },
        data.map((item: any, index: number) =>
          React.createElement(
            View,
            { key: keyExtractor?.(item, index) ?? index },
            renderItem({ item, index }),
          ),
        ),
      ),
  };
});

// Lucide icons mock
jest.mock("lucide-react-native", () => {
  const React = require("react");
  const { View } = require("react-native");
  return {
    Trash2: (props: any) =>
      React.createElement(View, { testID: "trash-icon", ...props }),
  };
});

const makeSub = (overrides: Partial<Subscription> = {}): Subscription => ({
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

describe("SubscriptionList", () => {
  it("renders subscription payee names and amounts", () => {
    const subs = [
      makeSub({ id: "sub_1", payee: "Netflix", amount: 50000 }),
      makeSub({ id: "sub_2", payee: "Spotify", amount: 25000 }),
    ];
    const { getByText } = render(
      <SubscriptionList subscriptions={subs} onRemove={jest.fn()} />,
    );

    expect(getByText("Netflix")).toBeTruthy();
    expect(getByText("Spotify")).toBeTruthy();
    expect(getByText(/500\.00/)).toBeTruthy();
    expect(getByText(/250\.00/)).toBeTruthy();
  });

  it("renders frequency labels for each subscription", () => {
    const subs = [
      makeSub({ id: "sub_1", frequency: "monthly" }),
      makeSub({ id: "sub_2", payee: "Gym", frequency: "yearly" }),
    ];
    const { getByText } = render(
      <SubscriptionList subscriptions={subs} onRemove={jest.fn()} />,
    );

    expect(getByText("Monthly")).toBeTruthy();
    expect(getByText("Yearly")).toBeTruthy();
  });

  it("shows empty state when no subscriptions", () => {
    const { getByText } = render(
      <SubscriptionList subscriptions={[]} onRemove={jest.fn()} />,
    );

    expect(getByText("No Subscriptions Yet")).toBeTruthy();
    expect(
      getByText(
        "Add subscriptions manually or let us detect them from your transaction history.",
      ),
    ).toBeTruthy();
  });

  it("calls onRemove when accessibility delete action triggered", () => {
    const onRemove = jest.fn();
    const subs = [makeSub({ id: "sub_99", payee: "TestApp" })];
    const { getByText } = render(
      <SubscriptionList subscriptions={subs} onRemove={onRemove} />,
    );

    // Find the row with the payee name and fire accessibility action
    const payeeElement = getByText("TestApp");
    const row = payeeElement.parent?.parent;
    if (row) {
      fireEvent(row, "accessibilityAction", {
        nativeEvent: { actionName: "delete" },
      });
      expect(onRemove).toHaveBeenCalledWith("sub_99");
    }
  });
});
