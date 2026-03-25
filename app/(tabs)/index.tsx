import React, { useEffect, useCallback } from "react";
import { View, Text, ScrollView, RefreshControl, Pressable } from "react-native";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useAppStore } from "../../src/stores/app-store";
import { useUIStore } from "../../src/stores/ui-store";
import { BalanceCard } from "../../src/components/dashboard/BalanceCard";
import { TransactionCard } from "../../src/components/transaction/TransactionCard";
import { QuickAdd } from "../../src/components/transaction/QuickAdd";
import { FAB } from "../../src/components/platform/FAB";
import { Card } from "../../src/components/ui/Card";
import { formatCurrency } from "../../src/lib/currency";

function SectionHeader({ title }: { title: string }) {
  return (
    <Text className="text-2xs font-semibold text-surface-800 uppercase tracking-widest mb-3">
      {title}
    </Text>
  );
}

const ACCOUNT_ICON: Record<string, string> = {
  cash: "💵", savings: "🏦", credit_card: "💳",
  checking: "🏧", line_of_credit: "💳", mortgage: "🏠",
};

export default function DashboardScreen() {
  const { userId, deviceId, setUserId } = useAppStore();
  const { openQuickAdd } = useUIStore();
  const { t } = useTranslation();

  const createOrGetUser = useMutation(api.users.createOrGet);
  const seedCategories = useMutation(api.categories.seedDefaults);

  const [backendError, setBackendError] = React.useState<string | null>(null);
  const [refreshing, setRefreshing] = React.useState(false);

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
            setBackendError("Backend unavailable — Convex free plan limit reached.");
          } else {
            setBackendError("Unable to connect to server.");
          }
        });
    }
  }, [userId, deviceId]);

  const balances = useQuery(api.accounts.getTotalBalance, userId ? { userId } : "skip");
  const transactions = useQuery(api.transactions.list, userId ? { userId, limit: 10 } : "skip");
  const categories = useQuery(api.categories.listCategories, userId ? { userId } : "skip");
  const accounts = useQuery(api.accounts.list, userId ? { userId } : "skip");

  const getCategoryInfo = useCallback((categoryId: string | undefined) => {
    if (!categoryId || !categories) return { name: undefined, icon: undefined };
    const cat = categories.find((c) => c._id === categoryId);
    return { name: cat?.name, icon: cat?.icon || undefined };
  }, [categories]);

  const getAccountName = useCallback((accountId: string) => {
    return accounts?.find((a) => a._id === accountId)?.name;
  }, [accounts]);

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
        {/* Error Banner */}
        {backendError && (
          <View className="mx-4 mt-4 bg-accent-100 border border-accent-300/30 rounded-xl px-4 py-3">
            <Text className="text-xs text-accent-600 font-medium">{backendError}</Text>
          </View>
        )}

        {/* Hero Balance */}
        <BalanceCard
          totalBalance={balances?.total ?? 0}
          budgetBalance={balances?.budgetTotal ?? 0}
          trackingBalance={balances?.trackingTotal ?? 0}
        />

        {/* Quick Actions */}
        <View className="flex-row px-4 mt-5 gap-2.5">
          {[
            { label: t("transaction.expense"), icon: "💸", type: "expense" as const, color: "text-danger" },
            { label: t("transaction.income"), icon: "💵", type: "income" as const, color: "text-success" },
            { label: t("transaction.transfer"), icon: "🔄", type: "transfer" as const, color: "text-primary-700" },
          ].map((action) => (
            <Pressable
              key={action.type}
              onPress={() => openQuickAdd(action.type)}
              className="flex-1 bg-surface-200 border border-border/30 rounded-xl items-center py-3.5 active:bg-surface-400"
            >
              <Text className="text-xl mb-1">{action.icon}</Text>
              <Text className={`text-2xs font-semibold ${action.color} uppercase tracking-wider`}>
                {action.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Accounts Summary */}
        {accounts && accounts.length > 0 && (
          <View className="px-4 mt-6">
            <SectionHeader title={t("tabs.accounts")} />
            <Card className="p-0 overflow-hidden">
              {accounts
                .filter((a) => !a.isClosed)
                .map((account, idx, arr) => (
                  <View key={account._id}>
                    <View className="flex-row items-center justify-between py-3 px-4">
                      <View className="flex-row items-center gap-3">
                        <View className="w-9 h-9 rounded-lg bg-surface-300 items-center justify-center">
                          <Text className="text-sm">
                            {ACCOUNT_ICON[account.type] || "🏧"}
                          </Text>
                        </View>
                        <Text className="text-sm font-medium text-foreground">
                          {account.name}
                        </Text>
                      </View>
                      <Text
                        className={`text-sm font-bold tracking-tight ${
                          account.balance >= 0 ? "text-foreground" : "text-danger"
                        }`}
                      >
                        {formatCurrency(account.balance)}
                      </Text>
                    </View>
                    {idx < arr.length - 1 && (
                      <View className="h-px bg-border/20 ml-16" />
                    )}
                  </View>
                ))}
            </Card>
          </View>
        )}

        {/* No accounts prompt */}
        {accounts && accounts.length === 0 && (
          <View className="px-4 mt-6">
            <Card className="items-center py-10">
              <Text className="text-4xl mb-3">🏦</Text>
              <Text className="text-base font-bold text-foreground">
                {t("dashboard.addFirstAccount")}
              </Text>
              <Text className="text-xs text-surface-800 text-center mt-1.5 px-4 leading-5">
                {t("dashboard.addFirstAccountDesc")}
              </Text>
            </Card>
          </View>
        )}

        {/* Recent Transactions */}
        <View className="px-4 mt-6 mb-24">
          <SectionHeader title={t("dashboard.recentTransactions")} />
          {transactions && transactions.length > 0 ? (
            <Card className="p-0 overflow-hidden">
              {transactions.map((txn, idx) => {
                const { name, icon } = getCategoryInfo(txn.categoryId ?? undefined);
                return (
                  <React.Fragment key={txn._id}>
                    <TransactionCard
                      transaction={txn}
                      categoryName={name}
                      categoryIcon={icon}
                      accountName={getAccountName(txn.accountId)}
                    />
                    {idx < transactions.length - 1 && (
                      <View className="h-px bg-border/15 ml-16" />
                    )}
                  </React.Fragment>
                );
              })}
            </Card>
          ) : (
            <Card className="items-center py-10">
              <Text className="text-4xl mb-3">📝</Text>
              <Text className="text-sm font-medium text-surface-900 text-center">
                {t("dashboard.noTransactions")}
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
