import React from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { TransactionCard } from "../../src/components/transaction/TransactionCard";
import { Card } from "../../src/components/ui/Card";
import { formatCurrency } from "../../src/lib/currency";
import { formatDateShort } from "../../src/lib/date";
import { ACCOUNT_TYPE_LABELS } from "../../src/lib/constants";
import type { Id } from "../../convex/_generated/dataModel";

export default function AccountDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const account = useQuery(
    api.accounts.getById,
    id ? { id: id as Id<"accounts"> } : "skip"
  );

  const transactions = useQuery(
    api.transactions.list,
    account
      ? { userId: account.userId, accountId: account._id }
      : "skip"
  );

  const categories = useQuery(
    api.categories.listCategories,
    account ? { userId: account.userId } : "skip"
  );

  if (!account) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Text className="text-muted-foreground">Loading...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="px-4 pt-14 pb-4 bg-white border-b border-border">
        <Pressable onPress={() => router.back()}>
          <Text className="text-primary-600 font-medium mb-2">← Back</Text>
        </Pressable>
        <Text className="text-xl font-bold text-foreground">
          {account.name}
        </Text>
        <Text className="text-sm text-muted-foreground">
          {ACCOUNT_TYPE_LABELS[account.type]}
        </Text>
      </View>

      {/* Balance */}
      <View className="px-4 mt-4">
        <Card className="items-center">
          <Text className="text-sm text-muted-foreground">Current Balance</Text>
          <Text
            className={`text-3xl font-bold mt-1 ${
              account.balance >= 0 ? "text-foreground" : "text-danger"
            }`}
          >
            {formatCurrency(account.balance)}
          </Text>
        </Card>
      </View>

      {/* Transaction List */}
      <View className="px-4 mt-4 flex-1">
        <Text className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">
          Transactions
        </Text>
        <ScrollView showsVerticalScrollIndicator={false}>
          {transactions && transactions.length > 0 ? (
            <Card className="p-0 overflow-hidden">
              {transactions.map((txn, idx) => {
                const cat = categories?.find(
                  (c) => c._id === txn.categoryId
                );
                return (
                  <React.Fragment key={txn._id}>
                    <TransactionCard
                      transaction={txn}
                      categoryName={cat?.name}
                      categoryIcon={cat?.icon || undefined}
                      onPress={() =>
                        router.push(`/transaction/${txn._id}` as any)
                      }
                    />
                    {idx < transactions.length - 1 && (
                      <View className="h-px bg-border/30 mx-4" />
                    )}
                  </React.Fragment>
                );
              })}
            </Card>
          ) : (
            <Card className="items-center py-8">
              <Text className="text-sm text-muted-foreground">
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
