import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";
import { internalMutation } from "./_generated/server";

// --- Internal mutations used by cron jobs ---

export const autoEnterScheduledTransactions = internalMutation({
  handler: async (ctx) => {
    const todayStr = new Date().toISOString().split("T")[0];

    // Find all active scheduled transactions with autoEnter and nextDate <= today
    const allScheduled = await ctx.db.query("scheduled").collect();
    const due = allScheduled.filter(
      (s) => s.isActive && s.autoEnter && s.nextDate <= todayStr
    );

    for (const scheduled of due) {
      // Create the transaction
      await ctx.db.insert("transactions", {
        userId: scheduled.userId,
        accountId: scheduled.accountId,
        categoryId: scheduled.categoryId,
        amount: scheduled.amount,
        type: scheduled.amount < 0 ? "expense" : "income",
        description: scheduled.memo,
        memo: scheduled.memo,
        date: scheduled.nextDate,
        source: "scheduled",
        payeeId: scheduled.payeeId,
        flag: scheduled.flag,
        isCleared: false,
        isReconciled: false,
        isApproved: true,
        bankRef: undefined,
        splitParentId: undefined,
        transferAccountId: undefined,
        importId: undefined,
      });

      // Update account balance
      const account = await ctx.db.get(scheduled.accountId);
      if (account) {
        await ctx.db.patch(scheduled.accountId, {
          balance: account.balance + scheduled.amount,
        });
      }

      // Advance nextDate based on rrule
      const nextDate = advanceDate(scheduled.nextDate, scheduled.rrule);
      if (nextDate) {
        await ctx.db.patch(scheduled._id, { nextDate });
      } else {
        // No more occurrences — deactivate
        await ctx.db.patch(scheduled._id, { isActive: false });
      }
    }
  },
});

export const monthlyBudgetRollover = internalMutation({
  handler: async (ctx) => {
    const now = new Date();
    const currentMonth = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`;

    // Calculate previous month
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    let prevMonth: string;
    if (month === 1) {
      prevMonth = `${year - 1}12`;
    } else {
      prevMonth = `${year}${String(month - 1).padStart(2, "0")}`;
    }

    // Get all budgets from previous month
    const prevBudgets = await ctx.db
      .query("budgets")
      .withIndex("by_userId_month", (q) => q.eq("userId" as never, undefined as never))
      .collect();

    // Since we can't query all users via index, collect all previous month budgets
    const allBudgets = await ctx.db.query("budgets").collect();
    const previousMonthBudgets = allBudgets.filter((b) => b.month === prevMonth);
    const currentMonthBudgets = allBudgets.filter((b) => b.month === currentMonth);

    for (const prevBudget of previousMonthBudgets) {
      // Check if current month budget already exists for this category
      const existing = currentMonthBudgets.find(
        (b) =>
          b.userId === prevBudget.userId &&
          b.categoryId === prevBudget.categoryId
      );

      if (!existing && prevBudget.available !== 0) {
        // Roll over the available balance to the new month
        await ctx.db.insert("budgets", {
          userId: prevBudget.userId,
          categoryId: prevBudget.categoryId,
          month: currentMonth,
          assigned: 0,
          activity: 0,
          available: prevBudget.available,
        });
      }
    }
  },
});

// --- Cron schedule ---

const crons = cronJobs();

crons.daily(
  "auto-enter scheduled transactions",
  { hourUTC: 0, minuteUTC: 5 },
  internal.crons.autoEnterScheduledTransactions
);

crons.monthly(
  "monthly budget rollover",
  { day: 1, hourUTC: 0, minuteUTC: 10 },
  internal.crons.monthlyBudgetRollover
);

export default crons;

// --- Helper: advance date by rrule ---

function advanceDate(dateStr: string, rrule: string): string | null {
  const d = new Date(dateStr + "T00:00:00Z");

  // Parse simple RRULE patterns
  // FREQ=DAILY;INTERVAL=N
  // FREQ=WEEKLY;INTERVAL=N
  // FREQ=MONTHLY;INTERVAL=N
  // FREQ=YEARLY;INTERVAL=N
  // Optional: COUNT=N or UNTIL=YYYYMMDD

  const parts = rrule.split(";").reduce<Record<string, string>>((acc, part) => {
    const [key, value] = part.split("=");
    if (key && value) acc[key] = value;
    return acc;
  }, {});

  const freq = parts["FREQ"];
  const interval = parseInt(parts["INTERVAL"] ?? "1", 10);
  const count = parts["COUNT"] ? parseInt(parts["COUNT"], 10) : null;
  const until = parts["UNTIL"] ?? null;

  // COUNT tracking is simplified — for a proper implementation you'd track occurrences
  // For now, always advance unless UNTIL is passed

  switch (freq) {
    case "DAILY":
      d.setUTCDate(d.getUTCDate() + interval);
      break;
    case "WEEKLY":
      d.setUTCDate(d.getUTCDate() + interval * 7);
      break;
    case "MONTHLY":
      d.setUTCMonth(d.getUTCMonth() + interval);
      break;
    case "YEARLY":
      d.setUTCFullYear(d.getUTCFullYear() + interval);
      break;
    default:
      // Unrecognized frequency — advance by 1 month as fallback
      d.setUTCMonth(d.getUTCMonth() + 1);
  }

  const nextStr = d.toISOString().split("T")[0];

  // Check UNTIL limit
  if (until) {
    const untilDate = `${until.substring(0, 4)}-${until.substring(4, 6)}-${until.substring(6, 8)}`;
    if (nextStr > untilDate) return null;
  }

  return nextStr;
}
