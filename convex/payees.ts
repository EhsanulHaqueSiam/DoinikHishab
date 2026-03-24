import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const payees = await ctx.db
      .query("payees")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();

    // Sort by most recently used, then alphabetically
    return payees.sort((a, b) => {
      if (a.lastUsed && b.lastUsed) return b.lastUsed.localeCompare(a.lastUsed);
      if (a.lastUsed) return -1;
      if (b.lastUsed) return 1;
      return a.name.localeCompare(b.name);
    });
  },
});

export const create = mutation({
  args: {
    userId: v.id("users"),
    name: v.string(),
    defaultCategoryId: v.optional(v.id("categories")),
  },
  handler: async (ctx, args) => {
    // Check for duplicate name
    const existing = await ctx.db
      .query("payees")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();

    const duplicate = existing.find(
      (p) => p.name.toLowerCase() === args.name.toLowerCase()
    );
    if (duplicate) {
      throw new Error(`Payee "${args.name}" already exists`);
    }

    return await ctx.db.insert("payees", {
      userId: args.userId,
      name: args.name,
      defaultCategoryId: args.defaultCategoryId,
      lastUsed: undefined,
      renameRules: undefined,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("payees"),
    name: v.optional(v.string()),
    defaultCategoryId: v.optional(v.id("categories")),
    lastUsed: v.optional(v.string()),
    renameRules: v.optional(
      v.array(
        v.object({
          pattern: v.string(),
          replacement: v.string(),
        })
      )
    ),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const existing = await ctx.db.get(id);
    if (!existing) throw new Error("Payee not found");

    const cleanUpdates: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) {
        cleanUpdates[key] = value;
      }
    }

    await ctx.db.patch(id, cleanUpdates);
  },
});

export const merge = mutation({
  args: {
    keepId: v.id("payees"),
    mergeId: v.id("payees"),
  },
  handler: async (ctx, args) => {
    const keep = await ctx.db.get(args.keepId);
    const merge = await ctx.db.get(args.mergeId);
    if (!keep || !merge) throw new Error("Payee not found");

    // Reassign all transactions from mergeId to keepId
    const transactions = await ctx.db
      .query("transactions")
      .withIndex("by_userId", (q) => q.eq("userId", keep.userId))
      .collect();

    const toReassign = transactions.filter(
      (t) => t.payeeId === args.mergeId
    );

    for (const txn of toReassign) {
      await ctx.db.patch(txn._id, { payeeId: args.keepId });
    }

    // Update scheduled transactions too
    const scheduled = await ctx.db
      .query("scheduled")
      .withIndex("by_userId", (q) => q.eq("userId", keep.userId))
      .collect();

    for (const s of scheduled) {
      if (s.payeeId === args.mergeId) {
        await ctx.db.patch(s._id, { payeeId: args.keepId });
      }
    }

    // Delete the merged payee
    await ctx.db.delete(args.mergeId);

    return { reassignedCount: toReassign.length };
  },
});
