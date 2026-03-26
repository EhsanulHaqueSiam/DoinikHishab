import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Text, View } from "react-native";
import { BarChart } from "react-native-gifted-charts";
import { formatCurrency } from "../../lib/currency";
import type { MonthlyReportData } from "./report-types";

interface IncomeExpenseBarChartProps {
  data: MonthlyReportData[];
}

function formatMonth(month: string): string {
  const [year, m] = month.split("-");
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  return `${months[Number.parseInt(m, 10) - 1]} '${year.slice(2)}`;
}

export function IncomeExpenseBarChart({ data }: IncomeExpenseBarChartProps) {
  const { t } = useTranslation();
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);

  if (data.length === 0) {
    return (
      <View className="items-center py-8">
        <Text className="text-muted-foreground text-sm">{t("reports.noData")}</Text>
      </View>
    );
  }

  // Take last 6 months
  const recent = data.slice(-6);
  const totalIncome = recent.reduce((sum, d) => sum + d.income, 0);
  const totalExpense = recent.reduce((sum, d) => sum + d.expense, 0);
  const net = totalIncome - totalExpense;

  // Build grouped bar data: each month has 2 bars (income + expense)
  // In gifted-charts, grouped bars use stackData or alternating items
  const barData = recent.flatMap((d) => [
    {
      value: d.income / 100,
      label: formatMonth(d.month),
      frontColor: "#0d9488", // teal for income
      spacing: 2,
      onPress: () => setSelectedMonth(d.month),
      accessibilityLabel: `${formatMonth(d.month)} income: ${formatCurrency(d.income)}`,
    },
    {
      value: d.expense / 100,
      frontColor: "#f87171", // red for expense
      spacing: 16,
      onPress: () => setSelectedMonth(d.month),
      accessibilityLabel: `${formatMonth(d.month)} expense: ${formatCurrency(d.expense)}`,
    },
  ]);

  const selectedData = selectedMonth ? recent.find((d) => d.month === selectedMonth) : null;

  return (
    <View className="gap-4">
      {/* Summary row */}
      <View className="flex-row justify-between">
        <View>
          <Text className="text-xs text-muted-foreground">{t("reports.totalIncome")}</Text>
          <Text className="text-base font-semibold text-green-500">
            {formatCurrency(totalIncome)}
          </Text>
        </View>
        <View className="items-end">
          <Text className="text-xs text-muted-foreground">{t("reports.totalExpense")}</Text>
          <Text className="text-base font-semibold text-red-500">
            {formatCurrency(totalExpense)}
          </Text>
        </View>
      </View>

      {/* Legend */}
      <View className="flex-row gap-4">
        <View className="flex-row items-center gap-1">
          <View className="w-3 h-3 rounded-sm" style={{ backgroundColor: "#0d9488" }} />
          <Text className="text-xs text-muted-foreground">{t("transaction.income")}</Text>
        </View>
        <View className="flex-row items-center gap-1">
          <View className="w-3 h-3 rounded-sm" style={{ backgroundColor: "#f87171" }} />
          <Text className="text-xs text-muted-foreground">{t("transaction.expense")}</Text>
        </View>
      </View>

      {/* Selected month detail */}
      {selectedData && (
        <View className="flex-row justify-between bg-surface-200 rounded-lg p-2">
          <Text className="text-xs text-foreground">{formatMonth(selectedData.month)}</Text>
          <Text className="text-xs text-green-500">+{formatCurrency(selectedData.income)}</Text>
          <Text className="text-xs text-red-500">-{formatCurrency(selectedData.expense)}</Text>
        </View>
      )}

      {/* Grouped bar chart */}
      <BarChart
        data={barData}
        barWidth={12}
        spacing={2}
        barBorderRadius={3}
        isAnimated
        animationDuration={600}
        noOfSections={4}
        yAxisTextStyle={{ color: "#6b83a3", fontSize: 10 }}
        xAxisColor="#1e2a3a"
        yAxisColor="#1e2a3a"
        backgroundColor="transparent"
        hideRules
        xAxisLabelTextStyle={{ color: "#6b83a3", fontSize: 9 }}
      />

      {/* Net savings row */}
      <View className="flex-row justify-between pt-2 border-t border-border">
        <Text className="text-sm text-muted-foreground">{t("reports.netSavings")}</Text>
        <Text className={`text-sm font-semibold ${net >= 0 ? "text-green-500" : "text-red-500"}`}>
          {net >= 0 ? "+" : ""}
          {formatCurrency(net)}
        </Text>
      </View>
    </View>
  );
}
