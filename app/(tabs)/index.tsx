import React, { useEffect } from "react";
import { View, Text, ScrollView, RefreshControl } from "react-native";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useAppStore } from "../../src/stores/app-store";
import { useUIStore } from "../../src/stores/ui-store";
import { BalanceCard } from "../../src/components/dashboard/BalanceCard";
import { TransactionCard } from "../../src/components/transaction/TransactionCard";
import { QuickAdd } from "../../src/components/transaction/QuickAdd";
import { FAB } from "../../src/components/platform/FAB";
import { Card } from "../../src/components/ui/Card";
import { formatDateShort } from "../../src/lib/date";

export default function DashboardScreen() {
  const { userId, deviceId, setUserId } = useAppStore();
  const { openQuickAdd } = useUIStore();

  const createOrGetUser = useMutation(api.users.createOrGet);
  const seedCategories = useMutation(api.categories.seedDefaults);

  const [backendError, setBackendError] = React.useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      createOrGetUser({ deviceId })
        .then((id) => {
          setUserId(id);
          seedCategories({ userId: id });
          setBackendError(null);
        })
        .catch((err: Error) => {
          const msg = err.message || String(err);
          if (msg.includes("free plan") || msg.includes("disabled")) {
            setBackendError("Backend unavailable — Convex free plan limit reached. Data will sync when the backend is restored.");
          } else {
            setBackendError("Unable to connect to server. Please check your connection.");
          }
        });
    }
  }, [userId, deviceId]);

  const balances = useQuery(
    api.accounts.getTotalBalance,
    userId ? { userId } : "skip"
  );

  const transactions = useQuery(
    api.transactions.list,
    userId ? { userId, limit: 10 } : "skip"
  );

  const categories = useQuery(
    api.categories.listCategories,
    userId ? { userId } : "skip"
  );

  const accounts = useQuery(
    api.accounts.list,
    userId ? { userId } : "skip"
  );

  const [refreshing, setRefreshing] = React.useState(false);

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
      <ScrollView
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={8}
        decelerationRate="fast"
        removeClippedSubviews
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            tintColor="#2dd4bf"
            onRefresh={() => {
              setRefreshing(true);
              setTimeout(() => setRefreshing(false), 500);
            }}
          />
        }
      >
        {/* Backend Error Banner */}
        {backendError && (
          <View className="mx-4 mt-4 bg-accent-100 border border-accent-300 rounded-xl p-3">
            <Text className="text-sm text-accent-500 font-medium">
              {backendError}
            </Text>
          </View>
        )}

        {/* Balance Card */}
        <BalanceCard
          totalBalance={balances?.total ?? 0}
          budgetBalance={balances?.budgetTotal ?? 0}
          trackingBalance={balances?.trackingTotal ?? 0}
        />

        {/* Quick Actions */}
        <View className="flex-row px-4 mt-4 gap-3">
          {[
            { label: "Expense", icon: "💸", type: "expense" as const },
            { label: "Income", icon: "💵", type: "income" as const },
            { label: "Transfer", icon: "🔄", type: "transfer" as const },
          ].map((action) => (
            <View key={action.type} className="flex-1">
              <Card className="items-center py-3">
                <Text
                  className="text-2xl"
                  onPress={() => openQuickAdd(action.type)}
                >
                  {action.icon}
                </Text>
                <Text className="text-xs text-muted-foreground mt-1 font-medium tracking-wider uppercase">
                  {action.label}
                </Text>
              </Card>
            </View>
          ))}
        </View>

        {/* Accounts Summary */}
        {accounts && accounts.length > 0 && (
          <View className="px-4 mt-6">
            <Text className="text-base font-semibold text-foreground mb-3 tracking-wide">
              Accounts
            </Text>
            <Card>
              {accounts
                .filter((a) => !a.isClosed)
                .map((account, idx, arr) => (
                  <View key={account._id}>
                    <View className="flex-row items-center justify-between py-2.5">
                      <View className="flex-row items-center gap-3">
                        <View className="w-8 h-8 rounded-lg bg-surface-300 items-center justify-center">
                          <Text className="text-sm">
                            {account.type === "cash"
                              ? "💵"
                              : account.type === "savings"
                                ? "🏦"
                                : account.type === "credit_card"
                                  ? "💳"
                                  : "🏧"}
                          </Text>
                        </View>
                        <Text className="text-sm font-medium text-foreground">
                          {account.name}
                        </Text>
                      </View>
                      <Text
                        className={`text-sm font-semibold ${
                          account.balance >= 0
                            ? "text-foreground"
                            : "text-danger"
                        }`}
                      >
                        {require("../../src/lib/currency").formatCurrency(account.balance)}
                      </Text>
                    </View>
                    {idx < arr.length - 1 && (
                      <View className="h-px bg-border/30" />
                    )}
                  </View>
                ))}
            </Card>
          </View>
        )}

        {/* No accounts prompt */}
        {accounts && accounts.length === 0 && (
          <View className="px-4 mt-6">
            <Card className="items-center py-8">
              <Text className="text-4xl mb-3">🏦</Text>
              <Text className="text-base font-semibold text-foreground">
                Add Your First Account
              </Text>
              <Text className="text-sm text-muted-foreground text-center mt-1">
                Start by adding a cash wallet or bank account to begin tracking
              </Text>
            </Card>
          </View>
        )}

        {/* Recent Transactions */}
        <View className="px-4 mt-6 mb-24">
          <Text className="text-base font-semibold text-foreground mb-3 tracking-wide">
            Recent Transactions
          </Text>
          {transactions && transactions.length > 0 ? (
            <Card className="p-0 overflow-hidden">
              {transactions.map((txn, idx) => {
                const { name, icon } = getCategoryInfo(
                  txn.categoryId ?? undefined
                );
                return (
                  <React.Fragment key={txn._id}>
                    <TransactionCard
                      transaction={txn}
                      categoryName={name}
                      categoryIcon={icon}
                      accountName={getAccountName(txn.accountId)}
                    />
                    {idx < transactions.length - 1 && (
                      <View className="h-px bg-border/20 mx-4" />
                    )}
                  </React.Fragment>
                );
              })}
            </Card>
          ) : (
            <Card className="items-center py-8">
              <Text className="text-4xl mb-3">📝</Text>
              <Text className="text-sm text-muted-foreground text-center">
                No transactions yet. Tap + to add your first one!
              </Text>
            </Card>
          )}
        </View>
      </ScrollView>

      <FAB onPress={() => openQuickAdd("expense")} />
      <QuickAdd />
    </View>
  );
}
