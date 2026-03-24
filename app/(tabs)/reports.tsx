import React, { useMemo } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useAppStore } from "../../src/stores/app-store";
import { Card } from "../../src/components/ui/Card";
import { formatCurrency } from "../../src/lib/currency";

type ReportType = "spending" | "income_expense" | "net_worth";

export default function ReportsScreen() {
  const { userId } = useAppStore();
  const [activeReport, setActiveReport] = React.useState<ReportType>("spending");

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

  const spendingByCategory = useMemo(() => {
    if (!transactions || !categories) return [];
    const spending = new Map<string, { name: string; total: number }>();

    for (const txn of transactions as any[]) {
      if (txn.type !== "expense" || !txn.categoryId) continue;
      const cat = (categories as any[]).find(
        (c) => c._id === txn.categoryId
      );
      if (!cat) continue;

      const existing = spending.get(txn.categoryId);
      if (existing) {
        existing.total += Math.abs(txn.amount);
      } else {
        spending.set(txn.categoryId, {
          name: cat.name,
          total: Math.abs(txn.amount),
        });
      }
    }

    return Array.from(spending.values())
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);
  }, [transactions, categories]);

  const incomeVsExpense = useMemo(() => {
    if (!transactions) return { income: 0, expense: 0, net: 0 };
    let income = 0;
    let expense = 0;
    for (const txn of transactions as any[]) {
      if (txn.type === "income") income += txn.amount;
      else if (txn.type === "expense") expense += Math.abs(txn.amount);
    }
    return { income, expense, net: income - expense };
  }, [transactions]);

  const netWorth = useMemo(() => {
    if (!accounts) return 0;
    return (accounts as any[]).reduce(
      (sum: number, a: any) => sum + a.balance,
      0
    );
  }, [accounts]);

  const totalSpending = spendingByCategory.reduce((s, c) => s + c.total, 0);

  return (
    <View className="flex-1 bg-background">
      {/* Report Type Tabs */}
      <View className="flex-row bg-surface-100 border-b border-border px-2 pt-1">
        {(
          [
            { key: "spending", label: "Spending" },
            { key: "income_expense", label: "Income/Expense" },
            { key: "net_worth", label: "Net Worth" },
          ] as const
        ).map((tab) => (
          <Pressable
            key={tab.key}
            onPress={() => setActiveReport(tab.key)}
            className={`flex-1 py-3 items-center border-b-2 ${
              activeReport === tab.key
                ? "border-primary-700"
                : "border-transparent"
            }`}
          >
            <Text
              className={`text-sm font-medium tracking-wide ${
                activeReport === tab.key
                  ? "text-primary-700"
                  : "text-muted-foreground"
              }`}
            >
              {tab.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Spending Report */}
        {activeReport === "spending" && (
          <View className="px-4 mt-4">
            <Card>
              <Text className="text-base font-semibold text-foreground mb-1">
                Total Spending
              </Text>
              <Text className="text-2xl font-bold text-danger mb-4">
                {formatCurrency(-totalSpending)}
              </Text>

              {spendingByCategory.length > 0 ? (
                <View className="gap-3">
                  {spendingByCategory.map((cat) => {
                    const pct =
                      totalSpending > 0
                        ? (cat.total / totalSpending) * 100
                        : 0;
                    return (
                      <View key={cat.name}>
                        <View className="flex-row justify-between mb-1">
                          <Text className="text-sm text-foreground">
                            {cat.name}
                          </Text>
                          <Text className="text-sm font-medium text-foreground">
                            {formatCurrency(-cat.total)}
                          </Text>
                        </View>
                        <View className="h-2 bg-surface-400 rounded-full overflow-hidden">
                          <View
                            className="h-2 bg-primary-600 rounded-full"
                            style={{ width: `${pct}%` }}
                          />
                        </View>
                        <Text className="text-xs text-muted-foreground mt-0.5">
                          {pct.toFixed(1)}%
                        </Text>
                      </View>
                    );
                  })}
                </View>
              ) : (
                <Text className="text-sm text-muted-foreground text-center py-8">
                  No spending data yet
                </Text>
              )}
            </Card>
          </View>
        )}

        {/* Income vs Expense */}
        {activeReport === "income_expense" && (
          <View className="px-4 mt-4 gap-4">
            <Card>
              <Text className="text-base font-semibold text-foreground mb-3">
                Income vs Expense
              </Text>
              <View className="gap-3">
                <View className="flex-row justify-between">
                  <Text className="text-sm text-foreground">Income</Text>
                  <Text className="text-sm font-semibold text-success">
                    {formatCurrency(incomeVsExpense.income)}
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-sm text-foreground">Expense</Text>
                  <Text className="text-sm font-semibold text-danger">
                    {formatCurrency(-incomeVsExpense.expense)}
                  </Text>
                </View>
                <View className="h-px bg-border" />
                <View className="flex-row justify-between">
                  <Text className="text-base font-semibold text-foreground">
                    Net
                  </Text>
                  <Text
                    className={`text-base font-bold ${
                      incomeVsExpense.net >= 0 ? "text-success" : "text-danger"
                    }`}
                  >
                    {formatCurrency(incomeVsExpense.net)}
                  </Text>
                </View>
              </View>
            </Card>

            {/* Visual bar comparison */}
            <Card>
              <Text className="text-sm font-medium text-muted-foreground mb-2 tracking-wider uppercase">
                Comparison
              </Text>
              <View className="gap-2">
                <View>
                  <Text className="text-xs text-muted-foreground mb-1">
                    Income
                  </Text>
                  <View className="h-6 bg-surface-400 rounded-lg overflow-hidden">
                    <View
                      className="h-6 bg-success rounded-lg"
                      style={{
                        width: `${
                          Math.max(incomeVsExpense.income, incomeVsExpense.expense) > 0
                            ? (incomeVsExpense.income /
                                Math.max(
                                  incomeVsExpense.income,
                                  incomeVsExpense.expense
                                )) *
                              100
                            : 0
                        }%`,
                      }}
                    />
                  </View>
                </View>
                <View>
                  <Text className="text-xs text-muted-foreground mb-1">
                    Expense
                  </Text>
                  <View className="h-6 bg-surface-400 rounded-lg overflow-hidden">
                    <View
                      className="h-6 bg-danger rounded-lg"
                      style={{
                        width: `${
                          Math.max(incomeVsExpense.income, incomeVsExpense.expense) > 0
                            ? (incomeVsExpense.expense /
                                Math.max(
                                  incomeVsExpense.income,
                                  incomeVsExpense.expense
                                )) *
                              100
                            : 0
                        }%`,
                      }}
                    />
                  </View>
                </View>
              </View>
            </Card>
          </View>
        )}

        {/* Net Worth */}
        {activeReport === "net_worth" && (
          <View className="px-4 mt-4">
            <Card
              className="items-center border-accent-200/20"
              style={{
                shadowColor: "#e6a444",
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.12,
                shadowRadius: 16,
              }}
            >
              <Text className="text-sm text-muted-foreground tracking-wider uppercase">
                Current Net Worth
              </Text>
              <Text
                className={`text-3xl font-bold mt-1 ${
                  netWorth >= 0 ? "text-foreground" : "text-danger"
                }`}
              >
                {formatCurrency(netWorth)}
              </Text>
            </Card>

            {accounts && (accounts as any[]).length > 0 && (
              <Card className="mt-4">
                <Text className="text-sm font-semibold text-foreground mb-3 tracking-wide">
                  By Account
                </Text>
                {(accounts as any[]).map((account: any) => (
                  <View
                    key={account._id}
                    className="flex-row justify-between py-2 border-b border-border/20"
                  >
                    <Text className="text-sm text-foreground">
                      {account.name}
                    </Text>
                    <Text
                      className={`text-sm font-medium ${
                        account.balance >= 0
                          ? "text-foreground"
                          : "text-danger"
                      }`}
                    >
                      {formatCurrency(account.balance)}
                    </Text>
                  </View>
                ))}
              </Card>
            )}
          </View>
        )}

        <View className="h-20" />
      </ScrollView>
    </View>
  );
}
