import React from "react";
import { render, screen, fireEvent } from "@testing-library/react-native";
import { RuleTip } from "./RuleTip";

// Mock react-i18next
jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

// Mock onboarding service
const mockIsTipDismissed = jest.fn().mockReturnValue(false);
const mockDismissTip = jest.fn();

jest.mock("../../services/onboarding", () => ({
  isTipDismissed: (...args: any[]) => mockIsTipDismissed(...args),
  dismissTip: (...args: any[]) => mockDismissTip(...args),
}));

describe("RuleTip", () => {
  beforeEach(() => {
    mockIsTipDismissed.mockReturnValue(false);
    mockDismissTip.mockClear();
  });

  it("renders tip title and body when not dismissed", () => {
    render(
      <RuleTip ruleId="rule_1" titleKey="tips.rule1Title" bodyKey="tips.rule1Body" />
    );
    expect(screen.getByText("tips.rule1Title")).toBeTruthy();
    expect(screen.getByText("tips.rule1Body")).toBeTruthy();
  });

  it("renders dismiss button", () => {
    render(
      <RuleTip ruleId="rule_1" titleKey="tips.rule1Title" bodyKey="tips.rule1Body" />
    );
    expect(screen.getByText("tips.dismiss")).toBeTruthy();
  });

  it("calls dismissTip when dismiss button is pressed", () => {
    render(
      <RuleTip ruleId="rule_2" titleKey="tips.rule2Title" bodyKey="tips.rule2Body" />
    );
    fireEvent.press(screen.getByText("tips.dismiss"));
    expect(mockDismissTip).toHaveBeenCalledWith("rule_2");
  });

  it("returns null when tip is already dismissed", () => {
    mockIsTipDismissed.mockReturnValue(true);
    const { toJSON } = render(
      <RuleTip ruleId="rule_1" titleKey="tips.rule1Title" bodyKey="tips.rule1Body" />
    );
    expect(toJSON()).toBeNull();
  });

  it("has dismiss button with accessible role", () => {
    render(
      <RuleTip ruleId="rule_1" titleKey="tips.rule1Title" bodyKey="tips.rule1Body" />
    );
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBeGreaterThanOrEqual(1);
  });
});
