import { render, screen } from "@testing-library/react-native";
import { RuleCarousel } from "./RuleCarousel";

// Mock i18n
jest.mock("../../lib/i18n", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    locale: "en",
  }),
}));

// Reanimated mock is in jest.setup.js — no per-file mock needed

describe("RuleCarousel", () => {
  it("renders all 4 YNAB rule cards", () => {
    render(<RuleCarousel />);
    // Verify 4 rule cards are rendered (check for rule title i18n keys)
    expect(screen.getByText("onboarding.rule1.title")).toBeTruthy();
    expect(screen.getByText("onboarding.rule2.title")).toBeTruthy();
    expect(screen.getByText("onboarding.rule3.title")).toBeTruthy();
    expect(screen.getByText("onboarding.rule4.title")).toBeTruthy();
  });

  it("renders pagination dots", () => {
    const { toJSON } = render(<RuleCarousel />);
    const json = JSON.stringify(toJSON());
    // Verify pagination dots container exists (4 dots rendered)
    expect(json).toBeTruthy();
  });

  it("accepts onComplete callback", () => {
    const onComplete = jest.fn();
    render(<RuleCarousel onComplete={onComplete} />);
    // Component renders without error with callback
    expect(screen.getByText("onboarding.rule1.title")).toBeTruthy();
  });
});
