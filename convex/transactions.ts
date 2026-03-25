import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: {
    userId: v.id("users"),
    accountId: v.optional(v.id("accounts")),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const q = ctx.db
      .query("transactions")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .order("desc");

    const all = await q.collect();

    let filtered = all;
    if (args.accountId) {
      filtered = all.filter((t) => t.accountId === args.accountId);
    }

    // Sort by date descending
    filtered.sort((a, b) => b.date.localeCompare(a.date));

    if (args.limit) {
      filtered = filtered.slice(0, args.limit);
    }

    return filtered;
  },
});

export const getById = query({
  args: { id: v.id("transactions") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const create = mutation({
  args: {
    userId: v.id("users"),
    accountId: v.id("accounts"),
    categoryId: v.optional(v.id("categories")),
    amount: v.number(),
    type: v.union(v.literal("expense"), v.literal("income"), v.literal("transfer")),
    description: v.optional(v.string()),
    memo: v.optional(v.string()),
    date: v.string(),
    source: v.union(
      v.literal("manual"),
      v.literal("import"),
      v.literal("scheduled"),
      v.literal("reconciliation"),
      v.literal("untracked")
    ),
    payeeId: v.optional(v.id("payees")),
    flag: v.optional(v.string()),
    transferAccountId: v.optional(v.id("accounts")),
    isCleared: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("transactions", {
      userId: args.userId,
      accountId: args.accountId,
      categoryId: args.categoryId,
      amount: args.amount,
      type: args.type,
      description: args.description,
      memo: args.memo,
      date: args.date,
      source: args.source,
      payeeId: args.payeeId,
      flag: args.flag,
      transferAccountId: args.transferAccountId,
      isCleared: args.isCleared ?? false,
      isReconciled: false,
      isApproved: true,
      bankRef: undefined,
      splitParentId: undefined,
      importId: undefined,
    });

    // Update account balance
    const account = await ctx.db.get(args.accountId);
    if (account) {
      await ctx.db.patch(args.accountId, {
        balance: account.balance + args.amount,
      });
    }

    // Update transfer account if applicable
    if (args.transferAccountId) {
      const transferAccount = await ctx.db.get(args.transferAccountId);
      if (transferAccount) {
        await ctx.db.patch(args.transferAccountId, {
          balance: transferAccount.balance - args.amount,
        });
      }
    }

    return id;
  },
});

export const update = mutation({
  args: {
    id: v.id("transactions"),
    categoryId: v.optional(v.id("categories")),
    amount: v.optional(v.number()),
    description: v.optional(v.string()),
    memo: v.optional(v.string()),
    date: v.optional(v.string()),
    flag: v.optional(v.string()),
    isCleared: v.optional(v.boolean()),
    isApproved: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const existing = await ctx.db.get(id);
    if (!existing) throw new Error("Transaction not found");

    // If amount changed, update account balance
    if (updates.amount !== undefined && updates.amount !== existing.amount) {
      const diff = updates.amount - existing.amount;
      const account = await ctx.db.get(existing.accountId);
      if (account) {
        await ctx.db.patch(existing.accountId, {
          balance: account.balance + diff,
        });
      }
    }

    const cleanUpdates: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) {
        cleanUpdates[key] = value;
      }
    }

    await ctx.db.patch(id, cleanUpdates);
  },
});

export const remove = mutation({
  args: { id: v.id("transactions") },
  handler: async (ctx, args) => {
    const txn = await ctx.db.get(args.id);
    if (!txn) throw new Error("Transaction not found");

    // Reverse the balance change
    const account = await ctx.db.get(txn.accountId);
    if (account) {
      await ctx.db.patch(txn.accountId, {
        balance: account.balance - txn.amount,
      });
    }

    await ctx.db.delete(args.id);
  },
});

export const getByDateRange = query({
  args: {
    userId: v.id("users"),
    startDate: v.string(),
    endDate: v.string(),
  },
  handler: async (ctx, args) => {
    const all = await ctx.db
      .query("transactions")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();

    return all.filter((t) => t.date >= args.startDate && t.date <= args.endDate);
  },
});
