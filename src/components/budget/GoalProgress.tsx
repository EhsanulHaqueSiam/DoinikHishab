import React from "react";
import { View, Text } from "react-native";
import { formatCurrency } from "../../lib/currency";

interface GoalProgressProps {
  targetType: string;
  targetAmount: number;
  currentAvailable: number;
  progress: number;
  status: "on_track" | "behind" | "funded";
  targetDate?: string;
}

const TARGET_LABELS: Record<string, string> = {
  needed_for_spending: "Monthly Spending Target",
  weekly_spending: "Weekly Spending Target",
  spending_by_date: "Save by Date",
  savings_balance: "Savings Balance Goal",
  monthly_savings: "Monthly Savings",
};

const STATUS_CONFIG: Record<string, { label: string; color: string; bar: string }> = {
  funded: { label: "Funded", color: "text-primary-700", bar: "bg-primary-500" },
  on_track: { label: "On Track", color: "text-success", bar: "bg-success" },
  behind: { label: "Behind", color: "text-warning", bar: "bg-warning" },
};

export function GoalProgress({
  targetType, targetAmount, currentAvailable, progress, status, targetDate,
}: GoalProgressProps) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.behind;

  return (
    <View className="gap-2.5">
      <View className="flex-row items-center justify-between">
        <Text className="text-xs font-semibold text-foreground">
          {TARGET_LABELS[targetType] || targetType}
        </Text>
        <Text className={`text-2xs font-bold uppercase tracking-wider ${config.color}`}>
          {config.label}
        </Text>
      </View>

      <View className="h-2 bg-surface-400 rounded-full overflow-hidden">
        <View
          className={`h-2 rounded-full ${config.bar}`}
          style={{ width: `${Math.min(progress * 100, 100)}%` }}
        />
      </View>

      <View className="flex-row items-center justify-between">
        <Text className="text-2xs text-surface-800">
          {formatCurrency(currentAvailable)} of {formatCurrency(targetAmount)}
        </Text>
        <Text className="text-2xs font-bold text-surface-900">
          {Math.round(progress * 100)}%
        </Text>
      </View>

      {targetDate && (
        <Text className="text-2xs text-surface-700 tracking-wide">
          Target: {targetDate}
        </Text>
      )}
    </View>
  );
}
