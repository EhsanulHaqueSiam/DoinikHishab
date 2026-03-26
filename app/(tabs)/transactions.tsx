import { useQuery } from "convex/react";
import { useRouter } from "expo-router";
import { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, SectionList, Text, View } from "react-native";
import { api } from "../../convex/_generated/api";
import { FAB } from "../../src/components/platform/FAB";
import { QuickAdd } from "../../src/components/transaction/QuickAdd";
import { TransactionCard } from "../../src/components/transaction/TransactionCard";
import { formatCurrency } from "../../src/lib/currency";
import { formatDateShort, groupByDate } from "../../src/lib/date";
import type { ParsedTransaction } from "../../src/services/statement-parser/types";
import { getJSON } from "../../src/services/storage";
import { useAppStore } from "../../src/stores/app-store";
import { useUIStore } from "../../src/stores/ui-store";

const ItemSeparator = () => <View className="h-px bg-border/20 mx-4" />;

/**
 * Convert imported ParsedTransaction to a shape compatible with TransactionCard.
 * Amount is stored as positive paisa in MMKV; expenses become negative for display.
 */
function mapImportedTransaction(txn: ParsedTransaction, index: number) {
  return {
    _id: `imported_${txn.reference}_${index}`,
    date: txn.date,
    description: `${txn.provider.toUpperCase()}: ${txn.description}`,
    amount: txn.type === "expense" ? -txn.amount : txn.amount,
    type: txn.type,
    flag: null,
    isCleared: true,
    categoryId: undefined,
    accountId: undefined,
  };
}

export default function TransactionsScreen() {
  const { userId } = useAppStore();
  const { openQuickAdd } = useUIStore();
  const router = useRouter();
  const { t } = useTranslation();

  const ListEmpty = useCallback(
    () => (
      <View className="flex-1 items-center justify-center py-20">
        <Text className="text-4xl mb-3">📝</Text>
        <Text className="text-base font-medium text-muted-foreground">
          {t("dashboard.noTransactions")}
        </Text>
      </View>
    ),
    [t]
  );

  const transactions = useQuery(api.transactions.list, userId ? { userId } : "skip");

  const categories = useQuery(api.categories.listCategories, userId ? { userId } : "skip");

  const accounts = useQuery(api.accounts.list, userId ? { userId } : "skip");

  // Read imported transactions from MMKV and merge with Convex transactions
  const allTransactions = useMemo(() => {
    const convexTxns = transactions ?? [];
    const imported = getJSON<ParsedTransaction[]>("import:transactions");
    const mappedImported = imported ? imported.map((txn, i) => mapImportedTransaction(txn, i)) : [];

    // Merge and sort by date descending
    const merged = [...convexTxns, ...mappedImported];
    merged.sort((a, b) => b.date.localeCompare(a.date));
    return merged;
  }, [transactions]);

  const sections = useMemo(() => {
    if (allTransactions.length === 0) return [];
    const grouped = groupByDate(allTransactions);
    return grouped.map((g) => ({
      title: g.date,
      data: g.items,
      total: g.items.reduce((sum, t: any) => sum + t.amount, 0),
    }));
  }, [allTransactions]);

  // Pre-build lookup maps for O(1) access in renderItem
  const categoryMap = useMemo(() => {
    if (!categories) return new Map();
    return new Map(categories.map((c) => [c._id, { name: c.name, icon: c.icon || undefined }]));
  }, [categories]);

  const accountMap = useMemo(() => {
    if (!accounts) return new Map();
    return new Map(accounts.map((a) => [a._id, a.name]));
  }, [accounts]);

  const handlePress = useCallback(
    (id: string) => {
      // Don't navigate for imported transactions (they don't have Convex detail pages)
      if (id.startsWith("imported_")) return;
      router.push(`/transaction/${id}` as any);
    },
    [router]
  );

  const renderItem = useCallback(
    ({ item }: { item: any }) => {
      const cat = categoryMap.get(item.categoryId);
      return (
        <View className="bg-card">
          <TransactionCard
            transaction={item}
            categoryName={cat?.name}
            categoryIcon={cat?.icon}
            accountName={accountMap.get(item.accountId)}
            onPress={() => handlePress(item._id)}
          />
        </View>
      );
    },
    [categoryMap, accountMap, handlePress]
  );

  const renderSectionHeader = useCallback(
    ({ section }: { section: { title: string; total: number } }) => (
      <View className="flex-row items-center justify-between px-4 py-2 bg-surface-100 border-b border-border/20">
        <Text className="text-sm font-semibold text-muted-foreground tracking-wide">
          {formatDateShort(section.title)}
        </Text>
        <Text
          className={`text-sm font-medium ${section.total < 0 ? "text-danger" : "text-success"}`}
        >
          {formatCurrency(section.total)}
        </Text>
      </View>
    ),
    []
  );

  return (
    <View className="flex-1 bg-background">
      {/* Import button header */}
      <View className="flex-row items-center justify-end px-4 py-2 bg-surface-100 border-b border-border/20">
        <Pressable
          onPress={() => router.push("/import" as any)}
          className="flex-row items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-300 active:bg-surface-400"
        >
          <Text className="text-xs">📥</Text>
          <Text className="text-2xs font-semibold text-surface-900 uppercase tracking-wider">
            {t("import.title")}
          </Text>
        </Pressable>
      </View>

      <SectionList
        sections={sections}
        keyExtractor={(item: any) => item._id}
        renderSectionHeader={renderSectionHeader}
        renderItem={renderItem}
        ItemSeparatorComponent={ItemSeparator}
        ListEmptyComponent={ListEmpty}
        contentContainerStyle={{ paddingBottom: 100 }}
        stickySectionHeadersEnabled
        // Performance optimizations
        removeClippedSubviews
        maxToRenderPerBatch={15}
        windowSize={7}
        initialNumToRender={15}
        scrollEventThrottle={8}
        decelerationRate="fast"
      />

      <FAB onPress={() => openQuickAdd("expense")} />
      <QuickAdd />
    </View>
  );
}
