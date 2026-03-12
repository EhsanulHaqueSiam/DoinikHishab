import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("scheduled")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();
  },
});

export const create = mutation({
  args: {
    userId: v.id("users"),
    accountId: v.id("accounts"),
    payeeId: v.optional(v.id("payees")),
    categoryId: v.optional(v.id("categories")),
    amount: v.number(),
    memo: v.optional(v.string()),
    flag: v.optional(v.string()),
    rrule: v.string(),
    autoEnter: v.boolean(),
    nextDate: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("scheduled", {
      ...args,
      isActive: true,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("scheduled"),
    amount: v.optional(v.number()),
    memo: v.optional(v.string()),
    rrule: v.optional(v.string()),
    autoEnter: v.optional(v.boolean()),
    nextDate: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
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

export const remove = mutation({
  args: { id: v.id("scheduled") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
