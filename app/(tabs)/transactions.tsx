import React, { useMemo } from "react";
import { View, Text, SectionList, Pressable } from "react-native";
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

export default function TransactionsScreen() {
  const { userId } = useAppStore();
  const { openQuickAdd } = useUIStore();
  const router = useRouter();

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

  const getCategoryInfo = (categoryId: string | undefined) => {
    if (!categoryId || !categories) return { name: undefined, icon: undefined };
    const cat = categories.find((c) => c._id === categoryId);
    return { name: cat?.name, icon: cat?.icon || undefined };
  };

  const getAccountName = (accountId: string) => {
    return accounts?.find((a) => a._id === accountId)?.name;
  };

  return (
    <View className="flex-1 bg-background">
      <SectionList
        sections={sections}
        keyExtractor={(item) => item._id}
        renderSectionHeader={({ section }) => (
          <View className="flex-row items-center justify-between px-4 py-2 bg-background">
            <Text className="text-sm font-semibold text-muted-foreground">
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
        )}
        renderItem={({ item }) => {
          const { name, icon } = getCategoryInfo(item.categoryId ?? undefined);
          return (
            <View className="bg-white">
              <TransactionCard
                transaction={item}
                categoryName={name}
                categoryIcon={icon}
                accountName={getAccountName(item.accountId)}
                onPress={() =>
                  router.push(`/transaction/${item._id}` as any)
                }
              />
            </View>
          );
        }}
        ItemSeparatorComponent={() => (
          <View className="h-px bg-border/30 mx-4" />
        )}
        ListEmptyComponent={() => (
          <View className="flex-1 items-center justify-center py-20">
            <Text className="text-4xl mb-3">📝</Text>
            <Text className="text-base font-medium text-muted-foreground">
              No transactions yet
            </Text>
            <Text className="text-sm text-muted-foreground mt-1">
              Tap + to add your first transaction
            </Text>
          </View>
        )}
        contentContainerStyle={{ paddingBottom: 100 }}
        stickySectionHeadersEnabled
      />

      <FAB onPress={() => openQuickAdd("expense")} />
      <QuickAdd />
    </View>
  );
}
