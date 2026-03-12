import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("targets")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();
  },
});

export const getByCategory = query({
  args: { categoryId: v.id("categories") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("targets")
      .withIndex("by_categoryId", (q) => q.eq("categoryId", args.categoryId))
      .first();
  },
});

export const set = mutation({
  args: {
    userId: v.id("users"),
    categoryId: v.id("categories"),
    type: v.union(
      v.literal("needed_for_spending"),
      v.literal("weekly_spending"),
      v.literal("spending_by_date"),
      v.literal("savings_balance"),
      v.literal("monthly_savings"),
    ),
    amount: v.number(),
    targetDate: v.optional(v.string()),
    cadence: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Remove existing target for this category
    const existing = await ctx.db
      .query("targets")
      .withIndex("by_categoryId", (q) => q.eq("categoryId", args.categoryId))
      .first();

    if (existing) {
      await ctx.db.delete(existing._id);
    }

    return await ctx.db.insert("targets", {
      userId: args.userId,
      categoryId: args.categoryId,
      type: args.type,
      amount: args.amount,
      targetDate: args.targetDate,
      cadence: args.cadence,
    });
  },
});

export const remove = mutation({
  args: { categoryId: v.id("categories") },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("targets")
      .withIndex("by_categoryId", (q) => q.eq("categoryId", args.categoryId))
      .first();

    if (existing) {
      await ctx.db.delete(existing._id);
    }
  },
});
