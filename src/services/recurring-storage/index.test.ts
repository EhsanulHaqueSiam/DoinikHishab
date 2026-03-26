// Stateful in-memory mock for storage
const mockStore = new Map<string, string>();

jest.mock("../storage", () => ({
  getJSON: jest.fn((key: string) => {
    const val = mockStore.get(key);
    return val ? JSON.parse(val) : undefined;
  }),
  setJSON: jest.fn((key: string, value: unknown) => {
    mockStore.set(key, JSON.stringify(value));
  }),
  deleteKey: jest.fn((key: string) => {
    mockStore.delete(key);
  }),
}));

import {
  dismissPayee,
  getDismissedPayees,
  getSubscriptions,
  removeSubscription,
  saveSubscription,
} from "./index";

describe("recurring-storage", () => {
  beforeEach(() => {
    mockStore.clear();
  });

  it("getSubscriptions returns empty array when nothing stored", () => {
    const result = getSubscriptions();
    expect(result).toEqual([]);
  });

  it("saveSubscription adds to stored list and assigns unique ID", () => {
    const sub = saveSubscription({
      payee: "Netflix",
      amount: 50000,
      frequency: "monthly",
      categoryId: "ent",
      nextDueDate: "2026-04-01",
      isActive: true,
      type: "expense",
    });

    expect(sub.id).toBeDefined();
    expect(sub.id).toMatch(/^sub_/);
    expect(sub.payee).toBe("Netflix");

    const stored = getSubscriptions();
    expect(stored).toHaveLength(1);
    expect(stored[0].id).toBe(sub.id);
  });

  it("removeSubscription removes by ID", () => {
    const sub1 = saveSubscription({
      payee: "Netflix",
      amount: 50000,
      frequency: "monthly",
      categoryId: "ent",
      nextDueDate: "2026-04-01",
      isActive: true,
      type: "expense",
    });
    const sub2 = saveSubscription({
      payee: "Spotify",
      amount: 25000,
      frequency: "monthly",
      categoryId: "ent",
      nextDueDate: "2026-04-01",
      isActive: true,
      type: "expense",
    });

    removeSubscription(sub1.id);

    const stored = getSubscriptions();
    expect(stored).toHaveLength(1);
    expect(stored[0].payee).toBe("Spotify");
  });

  it("getDismissedPayees returns list of dismissed payee names", () => {
    const result = getDismissedPayees();
    expect(result).toEqual([]);
  });

  it("dismissPayee adds payee to dismissed list", () => {
    dismissPayee("Groceries Store");
    dismissPayee("Random Vendor");

    const dismissed = getDismissedPayees();
    expect(dismissed).toContain("Groceries Store");
    expect(dismissed).toContain("Random Vendor");
    expect(dismissed).toHaveLength(2);
  });

  it("stored data includes version field (version: 1)", () => {
    saveSubscription({
      payee: "Netflix",
      amount: 50000,
      frequency: "monthly",
      categoryId: "ent",
      nextDueDate: "2026-04-01",
      isActive: true,
      type: "expense",
    });

    // Check raw stored data has version field
    const rawData = mockStore.get("recurring:subscriptions");
    expect(rawData).toBeDefined();
    const parsed = JSON.parse(rawData!);
    expect(parsed.version).toBe(1);
  });
});
