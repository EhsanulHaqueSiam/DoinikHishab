import { useQuery, useMutation } from "convex/react";
import { useMemo, useCallback } from "react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

// --- Types ---

export interface TransactionFilters {
  payeeId?: Id<"payees">;
  categoryId?: Id<"categories">;
  memo?: string;
  description?: string;
  amountMin?: number; // paisa
  amountMax?: number; // paisa
  flag?: string;
  dateFrom?: string; // YYYY-MM-DD
  dateTo?: string; // YYYY-MM-DD
  isCleared?: boolean;
  isReconciled?: boolean;
  source?: "manual" | "import" | "scheduled" | "reconciliation" | "untracked";
  type?: "expense" | "income" | "transfer";
}

// --- Filtered transactions hook ---

export function useFilteredTransactions(
  userId: Id<"users"> | null,
  accountId?: Id<"accounts">,
  filters?: TransactionFilters
) {
  const transactions = useQuery(
    api.transactions.list,
    userId ? { userId, accountId } : "skip"
  );

  const filtered = useMemo(() => {
    if (!transactions || !filters) return transactions ?? [];

    return transactions.filter((txn) => {
      if (filters.payeeId && txn.payeeId !== filters.payeeId) return false;
      if (filters.categoryId && txn.categoryId !== filters.categoryId) return false;
      if (filters.type && txn.type !== filters.type) return false;
      if (filters.source && txn.source !== filters.source) return false;
      if (filters.flag && txn.flag !== filters.flag) return false;

      if (filters.isCleared !== undefined && txn.isCleared !== filters.isCleared) return false;
      if (filters.isReconciled !== undefined && txn.isReconciled !== filters.isReconciled) return false;

      if (filters.amountMin !== undefined && txn.amount < filters.amountMin) return false;
      if (filters.amountMax !== undefined && txn.amount > filters.amountMax) return false;

      if (filters.dateFrom && txn.date < filters.dateFrom) return false;
      if (filters.dateTo && txn.date > filters.dateTo) return false;

      if (filters.memo) {
        const search = filters.memo.toLowerCase();
        const memoMatch = txn.memo?.toLowerCase().includes(search) ?? false;
        if (!memoMatch) return false;
      }

      if (filters.description) {
        const search = filters.description.toLowerCase();
        const descMatch = txn.description?.toLowerCase().includes(search) ?? false;
        if (!descMatch) return false;
      }

      return true;
    });
  }, [transactions, filters]);

  return filtered;
}

// --- Search hook ---

export function useTransactionSearch(
  userId: Id<"users"> | null,
  searchQuery: string
) {
  const transactions = useQuery(
    api.transactions.list,
    userId ? { userId } : "skip"
  );

  const results = useMemo(() => {
    if (!transactions || !searchQuery.trim()) return [];

    const q = searchQuery.toLowerCase().trim();

    return transactions.filter((txn) => {
      const descMatch = txn.description?.toLowerCase().includes(q) ?? false;
      const memoMatch = txn.memo?.toLowerCase().includes(q) ?? false;
      const amountStr = String(Math.abs(txn.amount));
      const amountMatch = amountStr.includes(q);

      return descMatch || memoMatch || amountMatch;
    });
  }, [transactions, searchQuery]);

  return results;
}

// --- Bulk operations hook ---

export function useBulkTransactionOps() {
  const updateTransaction = useMutation(api.transactions.update);
  const removeTransaction = useMutation(api.transactions.remove);

  const bulkUpdateFlag = useCallback(
    async (ids: Id<"transactions">[], flag: string) => {
      await Promise.all(ids.map((id) => updateTransaction({ id, flag })));
    },
    [updateTransaction]
  );

  const bulkClear = useCallback(
    async (ids: Id<"transactions">[]) => {
      await Promise.all(
        ids.map((id) => updateTransaction({ id, isCleared: true }))
      );
    },
    [updateTransaction]
  );

  const bulkApprove = useCallback(
    async (ids: Id<"transactions">[]) => {
      await Promise.all(
        ids.map((id) => updateTransaction({ id, isApproved: true }))
      );
    },
    [updateTransaction]
  );

  const bulkDelete = useCallback(
    async (ids: Id<"transactions">[]) => {
      await Promise.all(ids.map((id) => removeTransaction({ id })));
    },
    [removeTransaction]
  );

  const bulkSetCategory = useCallback(
    async (ids: Id<"transactions">[], categoryId: Id<"categories">) => {
      await Promise.all(
        ids.map((id) => updateTransaction({ id, categoryId }))
      );
    },
    [updateTransaction]
  );

  return {
    bulkUpdateFlag,
    bulkClear,
    bulkApprove,
    bulkDelete,
    bulkSetCategory,
  };
}
