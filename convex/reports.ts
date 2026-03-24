import { v } from "convex/values";
import { query } from "./_generated/server";

export const spendingByCategory = query({
  args: {
    userId: v.id("users"),
    startDate: v.string(), // YYYY-MM-DD
    endDate: v.string(),
  },
  handler: async (ctx, args) => {
    const transactions = await ctx.db
      .query("transactions")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();

    const filtered = transactions.filter(
      (t) =>
        t.type === "expense" &&
        t.date >= args.startDate &&
        t.date <= args.endDate
    );

    // Group by category
    const categoryTotals = new Map<
      string,
      { categoryId: string; total: number }
    >();

    for (const txn of filtered) {
      const key = txn.categoryId ?? "uncategorized";
      const existing = categoryTotals.get(key);
      const amount = Math.abs(txn.amount);
      if (existing) {
        existing.total += amount;
      } else {
        categoryTotals.set(key, { categoryId: key, total: amount });
      }
    }

    const grandTotal = Array.from(categoryTotals.values()).reduce(
      (sum, c) => sum + c.total,
      0
    );

    // Resolve category names
    const results = [];
    for (const entry of categoryTotals.values()) {
      let name = "Uncategorized";
      let color: string | undefined;
      let icon: string | undefined;

      if (entry.categoryId !== "uncategorized") {
        const cat = await ctx.db.get(
          entry.categoryId as any as import("./_generated/dataModel").Id<"categories">
        );
        if (cat) {
          name = cat.name;
          color = cat.color ?? undefined;
          icon = cat.icon ?? undefined;
        }
      }

      results.push({
        categoryId: entry.categoryId,
        name,
        color,
        icon,
        total: entry.total,
        percentage: grandTotal > 0 ? (entry.total / grandTotal) * 100 : 0,
      });
    }

    // Sort by total descending
    results.sort((a, b) => b.total - a.total);

    return { categories: results, grandTotal };
  },
});

export const spendingByPayee = query({
  args: {
    userId: v.id("users"),
    startDate: v.string(),
    endDate: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const transactions = await ctx.db
      .query("transactions")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();

    const filtered = transactions.filter(
      (t) =>
        t.type === "expense" &&
        t.date >= args.startDate &&
        t.date <= args.endDate &&
        t.payeeId
    );

    const payeeTotals = new Map<string, { payeeId: string; total: number }>();

    for (const txn of filtered) {
      const key = txn.payeeId!;
      const existing = payeeTotals.get(key as string);
      const amount = Math.abs(txn.amount);
      if (existing) {
        existing.total += amount;
      } else {
        payeeTotals.set(key as string, {
          payeeId: key as string,
          total: amount,
        });
      }
    }

    const results = [];
    for (const entry of payeeTotals.values()) {
      const payee = await ctx.db.get(
        entry.payeeId as any as import("./_generated/dataModel").Id<"payees">
      );
      results.push({
        payeeId: entry.payeeId,
        name: payee?.name ?? "Unknown",
        total: entry.total,
      });
    }

    results.sort((a, b) => b.total - a.total);

    const limit = args.limit ?? 10;
    return results.slice(0, limit);
  },
});

export const incomeVsExpense = query({
  args: {
    userId: v.id("users"),
    months: v.number(), // how many months back
  },
  handler: async (ctx, args) => {
    const transactions = await ctx.db
      .query("transactions")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();

    // Build monthly buckets
    const monthlyData = new Map<
      string,
      { income: number; expense: number }
    >();

    // Initialize months
    const now = new Date();
    for (let i = args.months - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      monthlyData.set(key, { income: 0, expense: 0 });
    }

    for (const txn of transactions) {
      if (txn.type === "transfer") continue;
      const monthKey = txn.date.substring(0, 7); // YYYY-MM
      const bucket = monthlyData.get(monthKey);
      if (!bucket) continue;

      if (txn.type === "income") {
        bucket.income += txn.amount;
      } else if (txn.type === "expense") {
        bucket.expense += Math.abs(txn.amount);
      }
    }

    return Array.from(monthlyData.entries()).map(([month, data]) => ({
      month,
      income: data.income,
      expense: data.expense,
      net: data.income - data.expense,
    }));
  },
});

export const netWorthOverTime = query({
  args: {
    userId: v.id("users"),
    months: v.number(),
  },
  handler: async (ctx, args) => {
    const accounts = await ctx.db
      .query("accounts")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();

    const transactions = await ctx.db
      .query("transactions")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();

    // Current total balance
    const currentTotal = accounts
      .filter((a) => !a.isClosed)
      .reduce((sum, a) => sum + a.balance, 0);

    // Work backwards from current balance using transactions
    const now = new Date();
    const snapshots: { month: string; balance: number }[] = [];

    // Sort transactions by date descending
    const sorted = [...transactions].sort((a, b) =>
      b.date.localeCompare(a.date)
    );

    let runningBalance = currentTotal;
    let txnIndex = 0;

    for (let i = 0; i < args.months; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-31`;
      const monthStart = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;

      // Subtract transactions from this month to get the balance at start of month
      while (
        txnIndex < sorted.length &&
        sorted[txnIndex].date >= monthStart
      ) {
        runningBalance -= sorted[txnIndex].amount;
        txnIndex++;
      }

      snapshots.push({
        month: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
        balance: runningBalance,
      });
    }

    // Reverse so oldest is first
    snapshots.reverse();
    return snapshots;
  },
});

export const budgetPerformance = query({
  args: {
    userId: v.id("users"),
    month: v.string(), // YYYYMM
  },
  handler: async (ctx, args) => {
    const budgets = await ctx.db
      .query("budgets")
      .withIndex("by_userId_month", (q) =>
        q.eq("userId", args.userId).eq("month", args.month)
      )
      .collect();

    const results = [];
    for (const budget of budgets) {
      const category = await ctx.db.get(budget.categoryId);
      if (!category) continue;

      const spent = Math.abs(budget.activity);
      const budgeted = budget.assigned;

      results.push({
        categoryId: budget.categoryId,
        categoryName: category.name,
        icon: category.icon,
        color: category.color,
        budgeted,
        spent,
        remaining: budgeted - spent,
        percentUsed: budgeted > 0 ? (spent / budgeted) * 100 : 0,
      });
    }

    results.sort((a, b) => b.spent - a.spent);
    return results;
  },
});
