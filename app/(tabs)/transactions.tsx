import React, { useMemo, useCallback } from "react";
import { View, Text, SectionList, Pressable } from "react-native";
import { useTranslation } from "react-i18next";
import { useQuery } from "convex/react";
import { useRouter } from "expo-router";
import { api } from "../../convex/_generated/api";
import { useAppStore } from "../../src/stores/app-store";
import { useUIStore } from "../../src/stores/ui-store";
import { TransactionCard } from "../../src/components/transaction/TransactionCard";
import { QuickAdd } from "../../src/components/transaction/QuickAdd";
import { FAB } from "../../src/components/platform/FAB";
import { formatDateShort, groupByDate } from "../../src/lib/date";
import { formatCurrency } from "../../src/lib/currency";

const ItemSeparator = () => <View className="h-px bg-border/20 mx-4" />;

export default function TransactionsScreen() {
  const { userId } = useAppStore();
  const { openQuickAdd } = useUIStore();
  const router = useRouter();
  const { t } = useTranslation();

  const ListEmpty = useCallback(() => (
    <View className="flex-1 items-center justify-center py-20">
      <Text className="text-4xl mb-3">📝</Text>
      <Text className="text-base font-medium text-muted-foreground">
        {t("dashboard.noTransactions")}
      </Text>
    </View>
  ), [t]);

  const transactions = useQuery(
    api.transactions.list,
    userId ? { userId } : "skip"
  );

  const categories = useQuery(
    api.categories.listCategories,
    userId ? { userId } : "skip"
  );

  const accounts = useQuery(
    api.accounts.list,
    userId ? { userId } : "skip"
  );

  const sections = useMemo(() => {
    if (!transactions) return [];
    const grouped = groupByDate(transactions);
    return grouped.map((g) => ({
      title: g.date,
      data: g.items,
      total: g.items.reduce((sum, t) => sum + t.amount, 0),
    }));
  }, [transactions]);

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
    (id: string) => router.push(`/transaction/${id}` as any),
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
          className={`text-sm font-medium ${
            section.total < 0 ? "text-danger" : "text-success"
          }`}
        >
          {formatCurrency(section.total)}
        </Text>
      </View>
    ),
    []
  );

  return (
    <View className="flex-1 bg-background">
      <SectionList
        sections={sections}
        keyExtractor={(item) => item._id}
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
