import { useQuery } from "convex/react";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, ScrollView, Text, View } from "react-native";
import { api } from "../../convex/_generated/api";
import { Card } from "../../src/components/ui/Card";
import { formatCurrency } from "../../src/lib/currency";
import { shadow } from "../../src/lib/platform";
import { useAppStore } from "../../src/stores/app-store";

type ReportType = "spending" | "income_expense" | "net_worth";

export default function ReportsScreen() {
  const { userId } = useAppStore();
  const { t } = useTranslation();
  const [activeReport, setActiveReport] = React.useState<ReportType>("spending");

  const transactions = useQuery(api.transactions.list, userId ? { userId } : "skip");
  const categories = useQuery(api.categories.listCategories, userId ? { userId } : "skip");
  const accounts = useQuery(api.accounts.list, userId ? { userId } : "skip");

  const spendingByCategory = useMemo(() => {
    if (!transactions || !categories) return [];
    const spending = new Map<string, { name: string; total: number }>();
    for (const txn of transactions as any[]) {
      if (txn.type !== "expense" || !txn.categoryId) continue;
      const cat = (categories as any[]).find((c) => c._id === txn.categoryId);
      if (!cat) continue;
      const existing = spending.get(txn.categoryId);
      if (existing) existing.total += Math.abs(txn.amount);
      else spending.set(txn.categoryId, { name: cat.name, total: Math.abs(txn.amount) });
    }
    return Array.from(spending.values())
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);
  }, [transactions, categories]);

  const incomeVsExpense = useMemo(() => {
    if (!transactions) return { income: 0, expense: 0, net: 0 };
    let income = 0,
      expense = 0;
    for (const txn of transactions as any[]) {
      if (txn.type === "income") income += txn.amount;
      else if (txn.type === "expense") expense += Math.abs(txn.amount);
    }
    return { income, expense, net: income - expense };
  }, [transactions]);

  const netWorth = useMemo(() => {
    if (!accounts) return 0;
    return (accounts as any[]).reduce((sum: number, a: any) => sum + a.balance, 0);
  }, [accounts]);

  const totalSpending = spendingByCategory.reduce((s, c) => s + c.total, 0);

  return (
    <View className="flex-1 bg-background">
      {/* Report Type Tabs */}
      <View className="flex-row bg-surface-100 border-b border-border px-1 pt-1">
        {(
          [
            { key: "spending", label: t("reports.spending") },
            { key: "income_expense", label: t("reports.incomeExpense") },
            { key: "net_worth", label: t("reports.netWorth") },
          ] as const
        ).map((tab) => (
          <Pressable
            key={tab.key}
            onPress={() => setActiveReport(tab.key)}
            className={`flex-1 py-3 items-center border-b-2 ${
              activeReport === tab.key ? "border-primary-600" : "border-transparent"
            }`}
          >
            <Text
              className={`text-xs font-semibold tracking-wide uppercase ${
                activeReport === tab.key ? "text-primary-700" : "text-surface-800"
              }`}
            >
              {tab.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={8}
        decelerationRate="fast"
        removeClippedSubviews
      >
        {/* Spending Report */}
        {activeReport === "spending" && (
          <View className="px-4 mt-5">
            <Card>
              <View className="flex-row items-baseline justify-between mb-4">
                <Text className="text-2xs font-semibold text-surface-800 uppercase tracking-widest">
                  {t("reports.totalSpending")}
                </Text>
                <Text className="text-xl font-bold text-danger tracking-tight">
                  {formatCurrency(-totalSpending)}
                </Text>
              </View>

              {spendingByCategory.length > 0 ? (
                <View className="gap-4">
                  {spendingByCategory.map((cat) => {
                    const pct = totalSpending > 0 ? (cat.total / totalSpending) * 100 : 0;
                    return (
                      <View key={cat.name}>
                        <View className="flex-row justify-between mb-1.5">
                          <Text className="text-xs font-medium text-foreground">{cat.name}</Text>
                          <Text className="text-xs font-bold text-foreground">
                            {formatCurrency(-cat.total)}
                          </Text>
                        </View>
                        <View className="h-1.5 bg-surface-400 rounded-full overflow-hidden">
                          <View
                            className="h-1.5 bg-primary-500 rounded-full"
                            style={{ width: `${pct}%` }}
                          />
                        </View>
                        <Text className="text-2xs text-surface-700 mt-1">{pct.toFixed(1)}%</Text>
                      </View>
                    );
                  })}
                </View>
              ) : (
                <Text className="text-xs text-surface-800 text-center py-8">
                  {t("reports.noData")}
                </Text>
              )}
            </Card>
          </View>
        )}

        {/* Income vs Expense */}
        {activeReport === "income_expense" && (
          <View className="px-4 mt-5 gap-4">
            <Card>
              <Text className="text-2xs font-semibold text-surface-800 uppercase tracking-widest mb-4">
                {t("reports.incomeExpense")}
              </Text>
              <View className="gap-3">
                <View className="flex-row justify-between">
                  <Text className="text-sm text-foreground">{t("transaction.income")}</Text>
                  <Text className="text-sm font-bold text-success">
                    {formatCurrency(incomeVsExpense.income)}
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-sm text-foreground">{t("transaction.expense")}</Text>
                  <Text className="text-sm font-bold text-danger">
                    {formatCurrency(-incomeVsExpense.expense)}
                  </Text>
                </View>
                <View className="h-px bg-border/30" />
                <View className="flex-row justify-between">
                  <Text className="text-sm font-bold text-foreground">Net</Text>
                  <Text
                    className={`text-base font-bold ${incomeVsExpense.net >= 0 ? "text-success" : "text-danger"}`}
                  >
                    {formatCurrency(incomeVsExpense.net)}
                  </Text>
                </View>
              </View>
            </Card>

            <Card>
              <Text className="text-2xs font-semibold text-surface-800 uppercase tracking-widest mb-3">
                Comparison
              </Text>
              <View className="gap-3">
                <View>
                  <Text className="text-2xs text-surface-800 mb-1">Income</Text>
                  <View className="h-5 bg-surface-400 rounded-lg overflow-hidden">
                    <View
                      className="h-5 bg-success rounded-lg"
                      style={{
                        width: `${
                          Math.max(incomeVsExpense.income, incomeVsExpense.expense) > 0
                            ? (
                                incomeVsExpense.income /
                                  Math.max(incomeVsExpense.income, incomeVsExpense.expense)
                              ) * 100
                            : 0
                        }%`,
                      }}
                    />
                  </View>
                </View>
                <View>
                  <Text className="text-2xs text-surface-800 mb-1">Expense</Text>
                  <View className="h-5 bg-surface-400 rounded-lg overflow-hidden">
                    <View
                      className="h-5 bg-danger rounded-lg"
                      style={{
                        width: `${
                          Math.max(incomeVsExpense.income, incomeVsExpense.expense) > 0
                            ? (
                                incomeVsExpense.expense /
                                  Math.max(incomeVsExpense.income, incomeVsExpense.expense)
                              ) * 100
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
          <View className="px-4 mt-5">
            <Card
              className="items-center border-accent-300/10"
              style={shadow("#e6a444", 0, 4, 0.08, 16)}
            >
              <Text className="text-2xs font-semibold text-surface-800 uppercase tracking-widest">
                {t("reports.netWorth")}
              </Text>
              <Text
                className={`text-hero font-bold mt-1 tracking-tight ${netWorth >= 0 ? "text-foreground" : "text-danger"}`}
                style={{ lineHeight: 42 }}
              >
                {formatCurrency(netWorth)}
              </Text>
            </Card>

            {accounts && (accounts as any[]).length > 0 && (
              <Card className="mt-4">
                <Text className="text-2xs font-semibold text-surface-800 uppercase tracking-widest mb-3">
                  By Account
                </Text>
                {(accounts as any[]).map((account: any) => (
                  <View
                    key={account._id}
                    className="flex-row justify-between py-2.5 border-b border-border/15"
                  >
                    <Text className="text-sm text-foreground">{account.name}</Text>
                    <Text
                      className={`text-sm font-bold ${account.balance >= 0 ? "text-foreground" : "text-danger"}`}
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
