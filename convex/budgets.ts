import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getByMonth = query({
  args: {
    userId: v.id("users"),
    month: v.string(), // YYYYMM
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("budgets")
      .withIndex("by_userId_month", (q) => q.eq("userId", args.userId).eq("month", args.month))
      .collect();
  },
});

export const assign = mutation({
  args: {
    userId: v.id("users"),
    categoryId: v.id("categories"),
    month: v.string(),
    amount: v.number(), // paisa to assign
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("budgets")
      .withIndex("by_userId_month", (q) => q.eq("userId", args.userId).eq("month", args.month))
      .collect();

    const budget = existing.find((b) => b.categoryId === args.categoryId);

    if (budget) {
      const newAssigned = args.amount;
      await ctx.db.patch(budget._id, {
        assigned: newAssigned,
        available: newAssigned + budget.activity,
      });
    } else {
      await ctx.db.insert("budgets", {
        userId: args.userId,
        categoryId: args.categoryId,
        month: args.month,
        assigned: args.amount,
        activity: 0,
        available: args.amount,
      });
    }
  },
});

export const updateActivity = mutation({
  args: {
    userId: v.id("users"),
    categoryId: v.id("categories"),
    month: v.string(),
    activityDelta: v.number(), // paisa change
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("budgets")
      .withIndex("by_userId_month", (q) => q.eq("userId", args.userId).eq("month", args.month))
      .collect();

    const budget = existing.find((b) => b.categoryId === args.categoryId);

    if (budget) {
      const newActivity = budget.activity + args.activityDelta;
      await ctx.db.patch(budget._id, {
        activity: newActivity,
        available: budget.assigned + newActivity,
      });
    } else {
      await ctx.db.insert("budgets", {
        userId: args.userId,
        categoryId: args.categoryId,
        month: args.month,
        assigned: 0,
        activity: args.activityDelta,
        available: args.activityDelta,
      });
    }
  },
});

export const moveMoney = mutation({
  args: {
    userId: v.id("users"),
    fromCategoryId: v.id("categories"),
    toCategoryId: v.id("categories"),
    month: v.string(),
    amount: v.number(),
  },
  handler: async (ctx, args) => {
    const budgets = await ctx.db
      .query("budgets")
      .withIndex("by_userId_month", (q) => q.eq("userId", args.userId).eq("month", args.month))
      .collect();

    const fromBudget = budgets.find((b) => b.categoryId === args.fromCategoryId);
    const toBudget = budgets.find((b) => b.categoryId === args.toCategoryId);

    if (fromBudget) {
      await ctx.db.patch(fromBudget._id, {
        assigned: fromBudget.assigned - args.amount,
        available: fromBudget.available - args.amount,
      });
    }

    if (toBudget) {
      await ctx.db.patch(toBudget._id, {
        assigned: toBudget.assigned + args.amount,
        available: toBudget.available + args.amount,
      });
    } else {
      await ctx.db.insert("budgets", {
        userId: args.userId,
        categoryId: args.toCategoryId,
        month: args.month,
        assigned: args.amount,
        activity: 0,
        available: args.amount,
      });
    }
  },
});
