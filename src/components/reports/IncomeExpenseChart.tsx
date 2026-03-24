import React from "react";
import { View, Text } from "react-native";
import { formatCurrency } from "../../lib/currency";

interface MonthlyData {
  month: string; // YYYY-MM
  income: number; // paisa
  expense: number; // paisa
  net: number;
}

interface IncomeExpenseChartProps {
  data: MonthlyData[];
}

function formatMonth(month: string): string {
  const [year, m] = month.split("-");
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  return `${months[parseInt(m, 10) - 1]} '${year.slice(2)}`;
}

export function IncomeExpenseChart({ data }: IncomeExpenseChartProps) {
  if (data.length === 0) {
    return (
      <View className="items-center py-8">
        <Text className="text-muted-foreground text-sm">No data available</Text>
      </View>
    );
  }

  // Take last 6 months
  const recent = data.slice(-6);

  const maxValue = Math.max(
    ...recent.map((d) => Math.max(d.income, d.expense)),
    1
  );
  const BAR_MAX_HEIGHT = 100;

  // Totals for the period
  const totalIncome = recent.reduce((sum, d) => sum + d.income, 0);
  const totalExpense = recent.reduce((sum, d) => sum + d.expense, 0);

  return (
    <View className="gap-4">
      {/* Summary row */}
      <View className="flex-row justify-between">
        <View>
          <Text className="text-xs text-muted-foreground">Total Income</Text>
          <Text className="text-base font-semibold text-green-500">
            {formatCurrency(totalIncome)}
          </Text>
        </View>
        <View className="items-end">
          <Text className="text-xs text-muted-foreground">Total Expense</Text>
          <Text className="text-base font-semibold text-red-500">
            {formatCurrency(totalExpense)}
          </Text>
        </View>
      </View>

      {/* Legend */}
      <View className="flex-row gap-4">
        <View className="flex-row items-center gap-1">
          <View className="w-3 h-3 rounded-sm bg-green-500" />
          <Text className="text-xs text-muted-foreground">Income</Text>
        </View>
        <View className="flex-row items-center gap-1">
          <View className="w-3 h-3 rounded-sm bg-red-500" />
          <Text className="text-xs text-muted-foreground">Expense</Text>
        </View>
      </View>

      {/* Chart area */}
      <View
        className="flex-row items-end justify-between gap-2"
        style={{ height: BAR_MAX_HEIGHT }}
      >
        {recent.map((monthData) => {
          const incomeHeight =
            Math.max((monthData.income / maxValue) * BAR_MAX_HEIGHT, 2);
          const expenseHeight =
            Math.max((monthData.expense / maxValue) * BAR_MAX_HEIGHT, 2);

          return (
            <View
              key={monthData.month}
              className="flex-1 flex-row items-end justify-center gap-0.5"
              style={{ height: BAR_MAX_HEIGHT }}
            >
              {/* Income bar */}
              <View
                className="flex-1 rounded-t-sm bg-green-500"
                style={{ height: incomeHeight, maxWidth: 16 }}
              />
              {/* Expense bar */}
              <View
                className="flex-1 rounded-t-sm bg-red-500"
                style={{ height: expenseHeight, maxWidth: 16 }}
              />
            </View>
          );
        })}
      </View>

      {/* Month labels */}
      <View className="flex-row justify-between">
        {recent.map((monthData) => (
          <View key={monthData.month} className="flex-1 items-center">
            <Text className="text-[10px] text-muted-foreground">
              {formatMonth(monthData.month)}
            </Text>
          </View>
        ))}
      </View>

      {/* Net row */}
      <View className="flex-row justify-between pt-2 border-t border-border">
        <Text className="text-sm text-muted-foreground">Net Savings</Text>
        <Text
          className={`text-sm font-semibold ${
            totalIncome - totalExpense >= 0 ? "text-green-500" : "text-red-500"
          }`}
        >
          {totalIncome - totalExpense >= 0 ? "+" : ""}
          {formatCurrency(totalIncome - totalExpense)}
        </Text>
      </View>
    </View>
  );
}
