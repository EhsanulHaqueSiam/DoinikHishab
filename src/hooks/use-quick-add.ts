import { useCallback, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useAppStore } from "../stores/app-store";
import { useUIStore } from "../stores/ui-store";
import { getSetting, setSetting, getJSON, setJSON } from "../services/storage";
import {
  MOCK_CATEGORIES,
  MOCK_GROUPS,
  MOCK_ACCOUNTS,
} from "../services/mock-data";
import { today } from "../lib/date";
import type { MockAccount, MockCategory, MockCategoryGroup } from "../services/mock-data";

interface TransactionInput {
  amount: number;
  categoryId?: string;
  accountId: string;
  type: "expense" | "income" | "transfer";
  date: string;
  description?: string;
  memo?: string;
  flag?: string;
}

interface OfflineTransaction extends TransactionInput {
  _id: string;
  createdAt: string;
}

export function useQuickAdd() {
  const { userId } = useAppStore();
  const { quickAddType } = useUIStore();

  // Try Convex, fallback to mock
  const convexCategories = useQuery(
    api.categories.listCategories,
    userId ? { userId } : "skip"
  );
  const convexGroups = useQuery(
    api.categories.listGroups,
    userId ? { userId } : "skip"
  );
  const convexAccounts = useQuery(
    api.accounts.list,
    userId ? { userId } : "skip"
  );
  const createTransaction = useMutation(api.transactions.create);

  const categories: readonly MockCategory[] = (convexCategories as unknown as MockCategory[] | undefined) ?? MOCK_CATEGORIES;
  const groups: readonly MockCategoryGroup[] = (convexGroups as unknown as MockCategoryGroup[] | undefined) ?? MOCK_GROUPS;
  const accounts: readonly MockAccount[] = (convexAccounts as unknown as MockAccount[] | undefined) ?? MOCK_ACCOUNTS;

  // Smart default account (D-16): last-used -> isDefault -> first
  const defaultAccount = useMemo(() => {
    const lastUsedId = getSetting("last_account_id");
    if (lastUsedId) {
      const found = accounts.find(
        (a) => a._id === lastUsedId && !a.isClosed
      );
      if (found) return found;
    }
    return accounts.find((a) => a.isDefault) ?? accounts[0];
  }, [accounts]);

  const saveTransaction = useCallback(
    async (data: TransactionInput) => {
      // Persist last-used account
      setSetting("last_account_id", data.accountId);

      if (userId) {
        try {
          await createTransaction({
            userId,
            accountId: data.accountId as any,
            categoryId: data.categoryId as any,
            amount: data.amount,
            type: data.type,
            description: data.description,
            memo: data.memo,
            date: data.date,
            source: "manual" as const,
            isCleared: false,
            isReconciled: false,
            isApproved: true,
            flag: data.flag,
          });
          return;
        } catch {
          // Fall through to offline save
        }
      }

      // Offline save to MMKV
      const existing = getJSON<OfflineTransaction[]>("offline_txns") ?? [];
      const offlineTxn: OfflineTransaction = {
        ...data,
        _id: `offline_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        createdAt: new Date().toISOString(),
      };
      setJSON("offline_txns", [...existing, offlineTxn]);
    },
    [userId, createTransaction]
  );

  return { categories, groups, accounts, defaultAccount, saveTransaction };
}
