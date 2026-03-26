import { render } from "@testing-library/react-native";
import { BillListView } from "./BillListView";
import type { BillItem } from "./recurring-types";

jest.mock("../../lib/i18n", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

// Helper to get a date string N days from now
function daysFromNow(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function createMockBills(): BillItem[] {
  return [
    {
      id: "bill_1",
      subscriptionId: "sub_1",
      payee: "Netflix",
      amount: 50000,
      dueDate: daysFromNow(1), // This week
      status: "paid",
      categoryId: "cat_1",
      type: "expense",
    },
    {
      id: "bill_2",
      subscriptionId: "sub_2",
      payee: "Spotify",
      amount: 25000,
      dueDate: daysFromNow(3), // This week
      status: "upcoming",
      categoryId: "cat_2",
      type: "expense",
    },
    {
      id: "bill_3",
      subscriptionId: "sub_3",
      payee: "Internet",
      amount: 80000,
      dueDate: daysFromNow(9), // Next week
      status: "upcoming",
      categoryId: "cat_3",
      type: "expense",
    },
    {
      id: "bill_4",
      subscriptionId: "sub_4",
      payee: "Electricity",
      amount: 210000,
      dueDate: daysFromNow(20), // This month
      status: "overdue",
      categoryId: "cat_4",
      type: "expense",
    },
  ];
}

describe("BillListView", () => {
  it("renders section headers for groups that have bills", () => {
    const bills = createMockBills();
    const { getByText } = render(<BillListView bills={bills} />);

    // i18n mock returns the key itself
    expect(getByText("recurring.thisWeek")).toBeTruthy();
    expect(getByText("recurring.nextWeek")).toBeTruthy();
    expect(getByText("recurring.thisMonth")).toBeTruthy();
  });

  it("renders bill payee names and amounts", () => {
    const bills = createMockBills();
    const { getByText } = render(<BillListView bills={bills} />);

    expect(getByText("Netflix")).toBeTruthy();
    expect(getByText("Spotify")).toBeTruthy();
    expect(getByText("Internet")).toBeTruthy();
    expect(getByText("Electricity")).toBeTruthy();
  });

  it("renders correct status badge for each bill status", () => {
    const bills = createMockBills();
    const { getAllByLabelText } = render(<BillListView bills={bills} />);

    // Status labels come from i18n mock returning keys
    const paidBadges = getAllByLabelText("recurring.paid");
    expect(paidBadges.length).toBe(1);

    const upcomingBadges = getAllByLabelText("recurring.upcoming");
    expect(upcomingBadges.length).toBe(2);

    const overdueBadges = getAllByLabelText("recurring.overdue");
    expect(overdueBadges.length).toBe(1);
  });

  it("shows empty state when no bills provided", () => {
    const { getByText } = render(<BillListView bills={[]} />);

    expect(getByText("recurring.noBillsTitle")).toBeTruthy();
    expect(getByText("recurring.noBillsBody")).toBeTruthy();
  });

  it("groups bills correctly by date proximity", () => {
    const bills = createMockBills();
    const { getByText } = render(<BillListView bills={bills} />);

    // Verify all three sections are rendered (indicates correct grouping)
    const thisWeekHeader = getByText("recurring.thisWeek");
    const nextWeekHeader = getByText("recurring.nextWeek");
    const thisMonthHeader = getByText("recurring.thisMonth");

    expect(thisWeekHeader).toBeTruthy();
    expect(nextWeekHeader).toBeTruthy();
    expect(thisMonthHeader).toBeTruthy();
  });
});
