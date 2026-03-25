/**
 * Convex handler test pattern demonstration.
 *
 * Convex query/mutation handlers are plain async functions that receive
 * a ctx object and args. We can test them by:
 * 1. Importing the handler's internal logic
 * 2. Mocking the ctx object (ctx.db.query, ctx.db.get, ctx.db.insert, etc.)
 *
 * This pattern tests the handler logic without a running Convex backend.
 * NOTE: Convex server functions are wrapped with query()/mutation() which
 * makes direct import tricky. This test demonstrates the mock pattern
 * that future tests should follow.
 */

// Mock Convex server primitives before importing
jest.mock("./_generated/server", () => ({
  query: jest.fn((config: any) => config),
  mutation: jest.fn((config: any) => config),
}));

jest.mock("./_generated/api", () => ({
  api: {},
}));

import * as transactionsModule from "./transactions";

const mockTransactions = [
  { _id: "t1", userId: "u1", accountId: "a1", date: "2026-03-15", amount: -5000, type: "expense" },
  { _id: "t2", userId: "u1", accountId: "a1", date: "2026-03-14", amount: 100000, type: "income" },
  { _id: "t3", userId: "u1", accountId: "a2", date: "2026-03-13", amount: -2000, type: "expense" },
];

describe("convex/transactions handlers", () => {
  describe("list query handler", () => {
    it("returns transactions sorted by date descending", async () => {
      const mockCtx = {
        db: {
          query: jest.fn().mockReturnValue({
            withIndex: jest.fn().mockReturnValue({
              order: jest.fn().mockReturnValue({
                collect: jest.fn().mockResolvedValue([...mockTransactions]),
              }),
            }),
          }),
        },
      };

      const listConfig = transactionsModule.list as any;
      const result = await listConfig.handler(mockCtx, { userId: "u1" });

      expect(result).toHaveLength(3);
      // Should be sorted by date descending
      expect(result[0].date).toBe("2026-03-15");
      expect(result[2].date).toBe("2026-03-13");
    });

    it("filters by accountId when provided", async () => {
      const mockCtx = {
        db: {
          query: jest.fn().mockReturnValue({
            withIndex: jest.fn().mockReturnValue({
              order: jest.fn().mockReturnValue({
                collect: jest.fn().mockResolvedValue([...mockTransactions]),
              }),
            }),
          }),
        },
      };

      const listConfig = transactionsModule.list as any;
      const result = await listConfig.handler(mockCtx, { userId: "u1", accountId: "a1" });

      expect(result).toHaveLength(2);
      expect(result.every((t: any) => t.accountId === "a1")).toBe(true);
    });

    it("respects limit parameter", async () => {
      const mockCtx = {
        db: {
          query: jest.fn().mockReturnValue({
            withIndex: jest.fn().mockReturnValue({
              order: jest.fn().mockReturnValue({
                collect: jest.fn().mockResolvedValue([...mockTransactions]),
              }),
            }),
          }),
        },
      };

      const listConfig = transactionsModule.list as any;
      const result = await listConfig.handler(mockCtx, { userId: "u1", limit: 1 });

      expect(result).toHaveLength(1);
    });
  });

  describe("create mutation handler", () => {
    it("inserts transaction and updates account balance", async () => {
      const mockAccount = { _id: "a1", balance: 50000 };
      const mockCtx = {
        db: {
          insert: jest.fn().mockResolvedValue("new_id"),
          get: jest.fn().mockResolvedValue(mockAccount),
          patch: jest.fn().mockResolvedValue(undefined),
        },
      };

      const createConfig = transactionsModule.create as any;
      const result = await createConfig.handler(mockCtx, {
        userId: "u1",
        accountId: "a1",
        amount: -3000,
        type: "expense",
        date: "2026-03-20",
        source: "manual",
      });

      expect(result).toBe("new_id");
      expect(mockCtx.db.insert).toHaveBeenCalledWith("transactions", expect.objectContaining({
        userId: "u1",
        amount: -3000,
        type: "expense",
      }));
      expect(mockCtx.db.patch).toHaveBeenCalledWith("a1", { balance: 47000 });
    });
  });

  describe("remove mutation handler", () => {
    it("reverses balance and deletes transaction", async () => {
      const mockTxn = { _id: "t1", accountId: "a1", amount: -5000 };
      const mockAccount = { _id: "a1", balance: 45000 };
      const mockCtx = {
        db: {
          get: jest.fn()
            .mockResolvedValueOnce(mockTxn)    // first call: get transaction
            .mockResolvedValueOnce(mockAccount), // second call: get account
          patch: jest.fn().mockResolvedValue(undefined),
          delete: jest.fn().mockResolvedValue(undefined),
        },
      };

      const removeConfig = transactionsModule.remove as any;
      await removeConfig.handler(mockCtx, { id: "t1" });

      // Balance reversed: 45000 - (-5000) = 50000
      expect(mockCtx.db.patch).toHaveBeenCalledWith("a1", { balance: 50000 });
      expect(mockCtx.db.delete).toHaveBeenCalledWith("t1");
    });
  });
});
