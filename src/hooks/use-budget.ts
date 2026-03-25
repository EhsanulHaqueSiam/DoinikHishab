import { useQuery } from "convex/react";
import { useMemo } from "react";
import { api } from "../../convex/_generated/api";
import {
  type CategoryBudget,
  calculateReadyToAssign,
  calculateTargetProgress,
} from "../services/budget-engine";
import { useAppStore } from "../stores/app-store";

export function useBudget() {
  const { userId, currentMonth } = useAppStore();

  const budgets = useQuery(
    api.budgets.getByMonth,
    userId ? { userId, month: currentMonth } : "skip"
  );

  const categories = useQuery(api.categories.listCategories, userId ? { userId } : "skip");

  const groups = useQuery(api.categories.listGroups, userId ? { userId } : "skip");

  const targets = useQuery(api.targets.list, userId ? { userId } : "skip");

  const transactions = useQuery(api.transactions.list, userId ? { userId } : "skip");

  const summary = useMemo(() => {
    if (!categories || !budgets || !transactions) return null;

    // Calculate total income this month
    const monthPrefix = `${currentMonth.substring(0, 4)}-${currentMonth.substring(4, 6)}`;
    const monthTransactions = transactions.filter((t: any) => t.date.startsWith(monthPrefix));
    const totalIncome = monthTransactions
      .filter((t: any) => t.type === "income")
      .reduce((sum: number, t: any) => sum + t.amount, 0);

    // Total assigned this month
    const totalAssigned = budgets.reduce((sum: number, b: any) => sum + b.assigned, 0);

    // Total activity this month
    const totalActivity = budgets.reduce((sum: number, b: any) => sum + b.activity, 0);

    // Calculate overspent
    const overspent = budgets.reduce((sum: number, b: any) => {
      if (b.available < 0) return sum + Math.abs(b.available);
      return sum;
    }, 0);

    const readyToAssign = calculateReadyToAssign(
      totalIncome,
      totalAssigned,
      0 // prior overspent — simplified for now
    );

    // Build category budgets
    const categoryBudgets: CategoryBudget[] = (categories as any[])
      .filter((c) => c.type === "expense" && !c.isHidden)
      .map((cat) => {
        const budget = (budgets as any[]).find((b) => b.categoryId === cat._id);
        const target = targets?.find((t: any) => t.categoryId === cat._id);

        const available = budget?.available ?? 0;
        let targetProgress: number | undefined;
        let targetStatus: "on_track" | "behind" | "funded" | undefined;

        if (target) {
          const result = calculateTargetProgress(target as any, available);
          targetProgress = result.progress;
          targetStatus = result.status;
        }

        return {
          categoryId: cat._id,
          name: cat.name,
          groupId: cat.groupId,
          assigned: budget?.assigned ?? 0,
          activity: budget?.activity ?? 0,
          available,
          targetType: target?.type,
          targetAmount: target?.amount,
          targetProgress,
          targetStatus,
        };
      });

    return {
      readyToAssign,
      totalIncome,
      totalAssigned,
      totalActivity,
      overspent,
      categories: categoryBudgets,
    };
  }, [categories, budgets, transactions, targets, currentMonth]);

  return {
    summary,
    budgets,
    categories,
    groups,
    targets,
    isLoading: !categories || !budgets,
  };
}
