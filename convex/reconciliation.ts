import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const startReconciliation = mutation({
  args: {
    userId: v.id("users"),
    accountId: v.id("accounts"),
    date: v.string(),
  },
  handler: async (ctx, args) => {
    const account = await ctx.db.get(args.accountId);
    if (!account) throw new Error("Account not found");

    return await ctx.db.insert("reconciliations", {
      userId: args.userId,
      accountId: args.accountId,
      date: args.date,
      startingBalance: account.balance,
      endingBalance: 0,
      expectedBalance: account.balance,
      gap: 0,
      resolution: undefined,
    });
  },
});

export const completeReconciliation = mutation({
  args: {
    id: v.id("reconciliations"),
    actualBalance: v.number(), // paisa — user's counted amount
    resolution: v.union(v.literal("adjustment"), v.literal("untracked"), v.literal("accepted")),
  },
  handler: async (ctx, args) => {
    const recon = await ctx.db.get(args.id);
    if (!recon) throw new Error("Reconciliation not found");

    const account = await ctx.db.get(recon.accountId);
    if (!account) throw new Error("Account not found");

    // Current app balance is the expected balance
    const expectedBalance = account.balance;
    const gap = args.actualBalance - expectedBalance;

    // Update reconciliation record
    await ctx.db.patch(args.id, {
      endingBalance: args.actualBalance,
      expectedBalance,
      gap,
      resolution: args.resolution,
    });

    // If there's a gap and user wants adjustment, create a transaction
    if (gap !== 0 && args.resolution === "adjustment") {
      const today = new Date().toISOString().split("T")[0];

      await ctx.db.insert("transactions", {
        userId: recon.userId,
        accountId: recon.accountId,
        amount: gap,
        type: gap > 0 ? "income" : "expense",
        description: "Reconciliation adjustment",
        memo: `Reconciliation gap: ${gap > 0 ? "+" : ""}${gap} paisa`,
        date: today,
        source: "reconciliation",
        isCleared: true,
        isReconciled: true,
        isApproved: true,
        categoryId: undefined,
        payeeId: undefined,
        flag: undefined,
        transferAccountId: undefined,
        bankRef: undefined,
        splitParentId: undefined,
        importId: undefined,
      });

      // Update account balance to match actual
      await ctx.db.patch(recon.accountId, {
        balance: args.actualBalance,
      });
    } else if (gap !== 0 && args.resolution === "untracked") {
      const today = new Date().toISOString().split("T")[0];

      await ctx.db.insert("transactions", {
        userId: recon.userId,
        accountId: recon.accountId,
        amount: gap,
        type: gap > 0 ? "income" : "expense",
        description: "Untracked spending/income",
        memo: "Flagged during reconciliation",
        date: today,
        source: "untracked",
        isCleared: true,
        isReconciled: true,
        isApproved: true,
        categoryId: undefined,
        payeeId: undefined,
        flag: "orange",
        transferAccountId: undefined,
        bankRef: undefined,
        splitParentId: undefined,
        importId: undefined,
      });

      // Update account balance to match actual
      await ctx.db.patch(recon.accountId, {
        balance: args.actualBalance,
      });
    }
    // "accepted" means user acknowledges gap but takes no action

    // Mark all cleared transactions as reconciled
    const transactions = await ctx.db
      .query("transactions")
      .withIndex("by_accountId", (q) => q.eq("accountId", recon.accountId))
      .collect();

    for (const txn of transactions) {
      if (txn.isCleared && !txn.isReconciled) {
        await ctx.db.patch(txn._id, { isReconciled: true });
      }
    }

    return { gap, resolution: args.resolution };
  },
});

export const listByAccount = query({
  args: {
    accountId: v.id("accounts"),
  },
  handler: async (ctx, args) => {
    const reconciliations = await ctx.db
      .query("reconciliations")
      .withIndex("by_accountId", (q) => q.eq("accountId", args.accountId))
      .collect();

    return reconciliations.sort((a, b) => b.date.localeCompare(a.date));
  },
});
