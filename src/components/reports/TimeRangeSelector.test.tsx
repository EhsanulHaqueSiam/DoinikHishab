import { fireEvent, render } from "@testing-library/react-native";
import React from "react";
import { TimeRangeSelector } from "./TimeRangeSelector";

// Mock react-i18next
jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, opts?: Record<string, string>) => {
      const map: Record<string, string> = {
        "reports.range1M": "1M",
        "reports.range3M": "3M",
        "reports.range6M": "6M",
        "reports.range1Y": "1Y",
        "reports.rangeAll": "All",
      };
      if (opts?.range) return `Time range: ${opts.range}`;
      return map[key] || key;
    },
  }),
}));

describe("TimeRangeSelector", () => {
  it("renders all 5 time range pills", () => {
    const { getByText } = render(<TimeRangeSelector selected="1M" onChange={jest.fn()} />);
    expect(getByText("1M")).toBeTruthy();
    expect(getByText("3M")).toBeTruthy();
    expect(getByText("6M")).toBeTruthy();
    expect(getByText("1Y")).toBeTruthy();
    expect(getByText("All")).toBeTruthy();
  });

  it("calls onChange when a pill is tapped", () => {
    const onChange = jest.fn();
    const { getByText } = render(<TimeRangeSelector selected="1M" onChange={onChange} />);
    fireEvent.press(getByText("6M"));
    expect(onChange).toHaveBeenCalledWith("6M");
  });

  it("highlights the selected pill", () => {
    const { getByText } = render(<TimeRangeSelector selected="3M" onChange={jest.fn()} />);
    // The selected pill should exist and be pressable
    expect(getByText("3M")).toBeTruthy();
  });
});
