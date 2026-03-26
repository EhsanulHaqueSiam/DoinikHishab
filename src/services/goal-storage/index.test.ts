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
  getGoals,
  saveSaveUpGoal,
  updateSaveUpGoal,
  deleteSaveUpGoal,
  savePayDownGoal,
  updatePayDownGoal,
  deletePayDownGoal,
} from "./index";

describe("goal-storage", () => {
  beforeEach(() => {
    mockStore.clear();
  });

  it("getGoals returns empty store when no data exists", () => {
    const result = getGoals();
    expect(result).toEqual({
      version: 1,
      saveUpGoals: [],
      payDownGoals: [],
    });
  });

  it("saveSaveUpGoal creates goal with auto-generated ID (goal_ prefix)", () => {
    const goal = saveSaveUpGoal({
      name: "Emergency Fund",
      targetAmount: 500000,
      currentAmount: 100000,
      targetDate: "2026-12-31",
      linkedAccountId: "mock_acc_1",
      createdDate: "2026-03-01",
    });

    expect(goal.id).toBeDefined();
    expect(goal.id).toMatch(/^goal_/);
    expect(goal.name).toBe("Emergency Fund");
    expect(goal.targetAmount).toBe(500000);
  });

  it("saveSaveUpGoal appends to existing goals without overwriting", () => {
    saveSaveUpGoal({
      name: "Emergency Fund",
      targetAmount: 500000,
      currentAmount: 100000,
      targetDate: "2026-12-31",
      linkedAccountId: "mock_acc_1",
      createdDate: "2026-03-01",
    });

    saveSaveUpGoal({
      name: "Vacation",
      targetAmount: 200000,
      currentAmount: 50000,
      targetDate: "2026-06-30",
      linkedAccountId: "mock_acc_2",
      createdDate: "2026-03-01",
    });

    const stored = getGoals();
    expect(stored.saveUpGoals).toHaveLength(2);
    expect(stored.saveUpGoals[0].name).toBe("Emergency Fund");
    expect(stored.saveUpGoals[1].name).toBe("Vacation");
  });

  it("updateSaveUpGoal updates fields by ID, preserves other goals", () => {
    const goal1 = saveSaveUpGoal({
      name: "Emergency Fund",
      targetAmount: 500000,
      currentAmount: 100000,
      targetDate: "2026-12-31",
      linkedAccountId: "mock_acc_1",
      createdDate: "2026-03-01",
    });

    saveSaveUpGoal({
      name: "Vacation",
      targetAmount: 200000,
      currentAmount: 50000,
      targetDate: "2026-06-30",
      linkedAccountId: "mock_acc_2",
      createdDate: "2026-03-01",
    });

    updateSaveUpGoal(goal1.id, { currentAmount: 200000 });

    const stored = getGoals();
    expect(stored.saveUpGoals).toHaveLength(2);
    const updated = stored.saveUpGoals.find((g) => g.id === goal1.id);
    expect(updated?.currentAmount).toBe(200000);
    expect(updated?.name).toBe("Emergency Fund"); // unchanged
  });

  it("deleteSaveUpGoal removes goal by ID, preserves other goals", () => {
    const goal1 = saveSaveUpGoal({
      name: "Emergency Fund",
      targetAmount: 500000,
      currentAmount: 100000,
      targetDate: "2026-12-31",
      linkedAccountId: "mock_acc_1",
      createdDate: "2026-03-01",
    });

    const goal2 = saveSaveUpGoal({
      name: "Vacation",
      targetAmount: 200000,
      currentAmount: 50000,
      targetDate: "2026-06-30",
      linkedAccountId: "mock_acc_2",
      createdDate: "2026-03-01",
    });

    deleteSaveUpGoal(goal1.id);

    const stored = getGoals();
    expect(stored.saveUpGoals).toHaveLength(1);
    expect(stored.saveUpGoals[0].id).toBe(goal2.id);
  });

  it("savePayDownGoal creates debt with auto-generated ID (debt_ prefix)", () => {
    const debt = savePayDownGoal({
      name: "Home Loan",
      balance: 5000000,
      aprPercent: 12.5,
      minPayment: 100000,
      createdDate: "2026-03-01",
    });

    expect(debt.id).toBeDefined();
    expect(debt.id).toMatch(/^debt_/);
    expect(debt.name).toBe("Home Loan");
    expect(debt.balance).toBe(5000000);
    expect(debt.aprPercent).toBe(12.5);
  });

  it("updatePayDownGoal updates debt fields by ID", () => {
    const debt = savePayDownGoal({
      name: "Home Loan",
      balance: 5000000,
      aprPercent: 12.5,
      minPayment: 100000,
      createdDate: "2026-03-01",
    });

    updatePayDownGoal(debt.id, { balance: 4500000 });

    const stored = getGoals();
    const updated = stored.payDownGoals.find((d) => d.id === debt.id);
    expect(updated?.balance).toBe(4500000);
    expect(updated?.name).toBe("Home Loan"); // unchanged
  });

  it("deletePayDownGoal removes debt by ID", () => {
    const debt1 = savePayDownGoal({
      name: "Home Loan",
      balance: 5000000,
      aprPercent: 12.5,
      minPayment: 100000,
      createdDate: "2026-03-01",
    });

    const debt2 = savePayDownGoal({
      name: "Car Loan",
      balance: 2000000,
      aprPercent: 10.0,
      minPayment: 50000,
      createdDate: "2026-03-01",
    });

    deletePayDownGoal(debt1.id);

    const stored = getGoals();
    expect(stored.payDownGoals).toHaveLength(1);
    expect(stored.payDownGoals[0].id).toBe(debt2.id);
  });

  it("stored data includes version field (version: 1)", () => {
    saveSaveUpGoal({
      name: "Test",
      targetAmount: 100000,
      currentAmount: 0,
      targetDate: "2026-12-31",
      linkedAccountId: "mock_acc_1",
      createdDate: "2026-03-01",
    });

    const rawData = mockStore.get("goals:data");
    expect(rawData).toBeDefined();
    const parsed = JSON.parse(rawData!);
    expect(parsed.version).toBe(1);
  });
});
