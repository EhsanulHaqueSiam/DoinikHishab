import { fireEvent, render } from "@testing-library/react-native";

// Mock @gorhom/bottom-sheet: BottomSheetTextInput -> regular TextInput
jest.mock("@gorhom/bottom-sheet", () => ({
  BottomSheetTextInput: (props: Record<string, unknown>) => {
    const RN = require("react-native");
    return <RN.TextInput {...props} />;
  },
}));

// Mock react-i18next
jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

// Mock lucide-react-native icons
jest.mock("lucide-react-native", () => ({
  ChevronDown: "ChevronDown",
  ChevronUp: "ChevronUp",
  Flag: "Flag",
}));

// Mock date module
jest.mock("../../lib/date", () => ({
  today: jest.fn(() => "2026-03-25"),
}));

import { ExpandableDetails } from "./ExpandableDetails";

const mockAccounts = [
  { _id: "mock_acct_cash", name: "Cash" },
  { _id: "mock_acct_bkash", name: "bKash" },
];

const defaultValues = {
  payee: "",
  memo: "",
  flag: "",
  accountId: "mock_acct_cash",
  date: "2026-03-25",
};

describe("ExpandableDetails", () => {
  it("renders '+ Details' text initially", () => {
    const { getByText } = render(
      <ExpandableDetails
        values={defaultValues}
        onChange={jest.fn()}
        accounts={mockAccounts}
        defaultAccountId="mock_acct_cash"
      />
    );

    expect(getByText("quickAdd.showDetails")).toBeTruthy();
  });

  it("pressing toggle shows input fields", () => {
    const { getByText, getByPlaceholderText } = render(
      <ExpandableDetails
        values={defaultValues}
        onChange={jest.fn()}
        accounts={mockAccounts}
        defaultAccountId="mock_acct_cash"
      />
    );

    fireEvent.press(getByText("quickAdd.showDetails"));

    // Payee and memo fields should now be visible
    expect(getByPlaceholderText("quickAdd.payeePlaceholder")).toBeTruthy();
    expect(getByPlaceholderText("quickAdd.memoPlaceholder")).toBeTruthy();
  });

  it("pressing toggle again hides fields", () => {
    const { getByText, queryByPlaceholderText } = render(
      <ExpandableDetails
        values={defaultValues}
        onChange={jest.fn()}
        accounts={mockAccounts}
        defaultAccountId="mock_acct_cash"
      />
    );

    // Open
    fireEvent.press(getByText("quickAdd.showDetails"));
    expect(queryByPlaceholderText("quickAdd.payeePlaceholder")).toBeTruthy();

    // Close
    fireEvent.press(getByText("quickAdd.hideDetails"));
    expect(queryByPlaceholderText("quickAdd.payeePlaceholder")).toBeNull();
  });

  it("account chips render for each account", () => {
    const { getByText } = render(
      <ExpandableDetails
        values={defaultValues}
        onChange={jest.fn()}
        accounts={mockAccounts}
        defaultAccountId="mock_acct_cash"
      />
    );

    // Open details
    fireEvent.press(getByText("quickAdd.showDetails"));

    expect(getByText("Cash")).toBeTruthy();
    expect(getByText("bKash")).toBeTruthy();
  });

  it("date chips render Today and Yesterday", () => {
    const { getByText } = render(
      <ExpandableDetails
        values={defaultValues}
        onChange={jest.fn()}
        accounts={mockAccounts}
        defaultAccountId="mock_acct_cash"
      />
    );

    // Open details
    fireEvent.press(getByText("quickAdd.showDetails"));

    expect(getByText("quickAdd.today")).toBeTruthy();
    expect(getByText("quickAdd.yesterday")).toBeTruthy();
  });

  it("flag toggle fires onChange with flag field", () => {
    const onChange = jest.fn();
    const { getByText } = render(
      <ExpandableDetails
        values={defaultValues}
        onChange={onChange}
        accounts={mockAccounts}
        defaultAccountId="mock_acct_cash"
      />
    );

    // Open details
    fireEvent.press(getByText("quickAdd.showDetails"));

    // Toggle flag
    fireEvent.press(getByText("quickAdd.flagTransaction"));
    expect(onChange).toHaveBeenCalledWith("flag", "red");
  });

  it("account chip fires onChange with accountId field", () => {
    const onChange = jest.fn();
    const { getByText } = render(
      <ExpandableDetails
        values={defaultValues}
        onChange={onChange}
        accounts={mockAccounts}
        defaultAccountId="mock_acct_cash"
      />
    );

    // Open details
    fireEvent.press(getByText("quickAdd.showDetails"));

    // Select bKash
    fireEvent.press(getByText("bKash"));
    expect(onChange).toHaveBeenCalledWith("accountId", "mock_acct_bkash");
  });
});
