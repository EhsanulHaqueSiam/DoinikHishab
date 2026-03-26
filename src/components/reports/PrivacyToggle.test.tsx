import React from "react";
import { render, fireEvent, renderHook, act } from "@testing-library/react-native";
import { PrivacyToggle, usePrivacyMode } from "./PrivacyToggle";

// Mock storage
jest.mock("../../services/storage", () => ({
  getSetting: jest.fn().mockReturnValue(undefined),
  setSetting: jest.fn(),
}));

// Mock lucide icons
jest.mock("lucide-react-native", () => ({
  Eye: (props: any) => {
    const { View } = require("react-native");
    return <View testID="eye-icon" {...props} />;
  },
  EyeOff: (props: any) => {
    const { View } = require("react-native");
    return <View testID="eye-off-icon" {...props} />;
  },
}));

describe("PrivacyToggle", () => {
  it("renders Eye icon when privacy is off", () => {
    const { getByTestId } = render(
      <PrivacyToggle isPrivacy={false} onToggle={jest.fn()} />,
    );
    expect(getByTestId("eye-icon")).toBeTruthy();
  });

  it("renders EyeOff icon when privacy is on", () => {
    const { getByTestId } = render(
      <PrivacyToggle isPrivacy={true} onToggle={jest.fn()} />,
    );
    expect(getByTestId("eye-off-icon")).toBeTruthy();
  });

  it("calls onToggle when pressed", () => {
    const onToggle = jest.fn();
    const { getByRole } = render(
      <PrivacyToggle isPrivacy={false} onToggle={onToggle} />,
    );
    fireEvent.press(getByRole("switch"));
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it("has correct accessibility attributes", () => {
    const { getByRole } = render(
      <PrivacyToggle isPrivacy={true} onToggle={jest.fn()} />,
    );
    const toggle = getByRole("switch");
    expect(toggle).toBeTruthy();
  });
});

describe("usePrivacyMode", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("defaults to false when no stored value", () => {
    const { result } = renderHook(() => usePrivacyMode());
    expect(result.current[0]).toBe(false);
  });

  it("toggles state and persists to storage", () => {
    const { setSetting } = require("../../services/storage");
    const { result } = renderHook(() => usePrivacyMode());

    act(() => {
      result.current[1](); // toggle
    });

    expect(setSetting).toHaveBeenCalledWith(
      "reports_privacy_mode",
      "true",
    );
  });
});
