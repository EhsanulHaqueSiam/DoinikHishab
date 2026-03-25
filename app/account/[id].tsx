import { useQuery } from "convex/react";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { TransactionCard } from "../../src/components/transaction/TransactionCard";
import { Card } from "../../src/components/ui/Card";
import { ACCOUNT_TYPE_LABELS } from "../../src/lib/constants";
import { formatCurrency } from "../../src/lib/currency";
import { shadow } from "../../src/lib/platform";

export default function AccountDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const account = useQuery(api.accounts.getById, id ? { id: id as Id<"accounts"> } : "skip");
  const transactions = useQuery(
    api.transactions.list,
    account ? { userId: account.userId, accountId: account._id } : "skip"
  );
  const categories = useQuery(
    api.categories.listCategories,
    account ? { userId: account.userId } : "skip"
  );

  if (!account) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Text className="text-surface-800 text-xs">Loading...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="px-4 pt-14 pb-4 bg-surface-100 border-b border-border">
        <Pressable onPress={() => router.back()}>
          <Text className="text-primary-700 font-semibold text-xs mb-2">← Back</Text>
        </Pressable>
        <Text className="text-lg font-bold text-foreground tracking-wide">{account.name}</Text>
        <Text className="text-2xs text-surface-800 uppercase tracking-widest mt-0.5">
          {ACCOUNT_TYPE_LABELS[account.type]}
        </Text>
      </View>

      {/* Balance Hero */}
      <View className="px-4 mt-5">
        <Card
          className="items-center border-primary-400/10"
          style={shadow("#0d9488", 0, 4, 0.08, 16)}
        >
          <Text className="text-2xs font-semibold text-surface-800 uppercase tracking-widest">
            Current Balance
          </Text>
          <Text
            className={`text-hero font-bold mt-1 tracking-tight ${
              account.balance >= 0 ? "text-foreground" : "text-danger"
            }`}
            style={{ lineHeight: 42 }}
          >
            {formatCurrency(account.balance)}
          </Text>
        </Card>
      </View>

      {/* Transaction List */}
      <View className="px-4 mt-5 flex-1">
        <Text className="text-2xs font-semibold text-surface-800 uppercase tracking-widest mb-2.5">
          Transactions
        </Text>
        <ScrollView
          showsVerticalScrollIndicator={false}
          scrollEventThrottle={8}
          decelerationRate="fast"
          removeClippedSubviews
        >
          {transactions && transactions.length > 0 ? (
            <Card className="p-0 overflow-hidden">
              {transactions.map((txn, idx) => {
                const cat = categories?.find((c) => c._id === txn.categoryId);
                return (
                  <React.Fragment key={txn._id}>
                    <TransactionCard
                      transaction={txn}
                      categoryName={cat?.name}
                      categoryIcon={cat?.icon || undefined}
                      onPress={() => router.push(`/transaction/${txn._id}` as any)}
                    />
                    {idx < transactions.length - 1 && <View className="h-px bg-border/15 ml-16" />}
                  </React.Fragment>
                );
              })}
            </Card>
          ) : (
            <Card className="items-center py-10">
              <Text className="text-xs text-surface-800 font-medium">
                No transactions for this account
              </Text>
            </Card>
          )}
          <View className="h-20" />
        </ScrollView>
      </View>
    </View>
  );
}
