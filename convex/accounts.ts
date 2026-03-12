import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const accounts = await ctx.db
      .query("accounts")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();
    return accounts.sort((a, b) => a.sortOrder - b.sortOrder);
  },
});

export const getById = query({
  args: { id: v.id("accounts") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const create = mutation({
  args: {
    userId: v.id("users"),
    name: v.string(),
    type: v.union(
      v.literal("checking"),
      v.literal("savings"),
      v.literal("cash"),
      v.literal("credit_card"),
      v.literal("line_of_credit"),
      v.literal("mortgage"),
      v.literal("auto_loan"),
      v.literal("student_loan"),
      v.literal("other_debt"),
      v.literal("other_asset"),
    ),
    balance: v.number(),
    icon: v.optional(v.string()),
    color: v.optional(v.string()),
    isDefault: v.optional(v.boolean()),
    isBudget: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("accounts")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();

    return await ctx.db.insert("accounts", {
      userId: args.userId,
      name: args.name,
      type: args.type,
      balance: args.balance,
      icon: args.icon,
      color: args.color,
      isDefault: args.isDefault ?? existing.length === 0,
      isBudget: args.isBudget ?? true,
      isClosed: false,
      sortOrder: existing.length,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("accounts"),
    name: v.optional(v.string()),
    balance: v.optional(v.number()),
    icon: v.optional(v.string()),
    color: v.optional(v.string()),
    isDefault: v.optional(v.boolean()),
    isBudget: v.optional(v.boolean()),
    isClosed: v.optional(v.boolean()),
    sortOrder: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const cleanUpdates: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) {
        cleanUpdates[key] = value;
      }
    }
    await ctx.db.patch(id, cleanUpdates);
  },
});

export const getTotalBalance = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const accounts = await ctx.db
      .query("accounts")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();

    const budgetTotal = accounts
      .filter((a) => a.isBudget && !a.isClosed)
      .reduce((sum, a) => sum + a.balance, 0);

    const trackingTotal = accounts
      .filter((a) => !a.isBudget && !a.isClosed)
      .reduce((sum, a) => sum + a.balance, 0);

    return { budgetTotal, trackingTotal, total: budgetTotal + trackingTotal };
  },
});
