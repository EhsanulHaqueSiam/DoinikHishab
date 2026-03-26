import { render } from "@testing-library/react-native";

// Mock currency module to control Bengali numeral behavior
jest.mock("../../lib/currency", () => ({
  formatCurrency: jest.fn((paisa: number, useBengali?: boolean) => {
    const taka = (paisa / 100).toFixed(2);
    if (useBengali) {
      // Simple Bengali numeral conversion for testing
      const bengaliDigits = [
        "\u09E6",
        "\u09E7",
        "\u09E8",
        "\u09E9",
        "\u09EA",
        "\u09EB",
        "\u09EC",
        "\u09ED",
        "\u09EE",
        "\u09EF",
      ];
      const converted = taka.replace(/[0-9]/g, (d) => bengaliDigits[parseInt(d, 10)]);
      return `\u09F3${converted}`;
    }
    return `\u09F3${taka}`;
  }),
  toBengaliNumerals: jest.fn((str: string) => {
    const bengaliDigits = [
      "\u09E6",
      "\u09E7",
      "\u09E8",
      "\u09E9",
      "\u09EA",
      "\u09EB",
      "\u09EC",
      "\u09ED",
      "\u09EE",
      "\u09EF",
    ];
    return str.replace(/[0-9]/g, (d) => bengaliDigits[parseInt(d, 10)]);
  }),
}));

import { AmountPad } from "./AmountPad";

describe("AmountPad", () => {
  describe("Bengali numeral display (TRAN-02, D-18)", () => {
    it("renders display with Bengali numerals when locale=bn and value > 0", () => {
      const { getByText } = render(
        <AmountPad value={45000} onChange={jest.fn()} type="expense" locale="bn" />
      );

      // 45000 paisa = 450.00 taka, in Bengali: ৳৪৫০.০০
      expect(getByText(/\u09F3\u09EA\u09EB\u09E6\.\u09E6\u09E6/)).toBeTruthy();
    });

    it("renders display with Arabic numerals when locale=en", () => {
      const { getByText } = render(
        <AmountPad value={45000} onChange={jest.fn()} type="expense" locale="en" />
      );

      expect(getByText(/\u09F3450\.00/)).toBeTruthy();
    });

    it("renders display with Arabic numerals when locale is undefined", () => {
      const { getByText } = render(<AmountPad value={45000} onChange={jest.fn()} type="expense" />);

      expect(getByText(/\u09F3450\.00/)).toBeTruthy();
    });

    it("keypad buttons always show Arabic digits regardless of locale", () => {
      const { getByText } = render(
        <AmountPad value={0} onChange={jest.fn()} type="expense" locale="bn" />
      );

      // Verify Arabic digits are present on the keypad
      expect(getByText("1")).toBeTruthy();
      expect(getByText("2")).toBeTruthy();
      expect(getByText("3")).toBeTruthy();
      expect(getByText("4")).toBeTruthy();
      expect(getByText("5")).toBeTruthy();
      expect(getByText("6")).toBeTruthy();
      expect(getByText("7")).toBeTruthy();
      expect(getByText("8")).toBeTruthy();
      expect(getByText("9")).toBeTruthy();
      expect(getByText("0")).toBeTruthy();
    });
  });

  describe("External reset (Pitfall 5)", () => {
    it("display resets when value prop changes to 0 externally", () => {
      const onChange = jest.fn();
      const { getByText, rerender } = render(
        <AmountPad value={10000} onChange={onChange} type="expense" />
      );

      // Amount should show ৳100.00
      expect(getByText(/\u09F3100\.00/)).toBeTruthy();

      // Simulate external reset: parent sets value to 0
      rerender(<AmountPad value={0} onChange={onChange} type="expense" />);

      // Should now show ৳0
      expect(getByText("\u09F30")).toBeTruthy();
    });

    it("display stays for non-zero value change", () => {
      const onChange = jest.fn();
      const { getByText, rerender } = render(
        <AmountPad value={10000} onChange={onChange} type="expense" />
      );

      rerender(<AmountPad value={20000} onChange={onChange} type="expense" />);

      // Should show the new value
      expect(getByText(/\u09F3200\.00/)).toBeTruthy();
    });
  });
});
