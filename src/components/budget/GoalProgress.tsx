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

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  funded: { label: "Funded", color: "text-primary-700" },
  on_track: { label: "On Track", color: "text-success" },
  behind: { label: "Behind", color: "text-warning" },
};

export function GoalProgress({
  targetType,
  targetAmount,
  currentAvailable,
  progress,
  status,
  targetDate,
}: GoalProgressProps) {
  const statusInfo = STATUS_LABELS[status] || STATUS_LABELS.behind;
  const barColor =
    status === "funded"
      ? "bg-primary-600"
      : status === "on_track"
        ? "bg-success"
        : "bg-warning";

  return (
    <View className="gap-2">
      <View className="flex-row items-center justify-between">
        <Text className="text-sm font-medium text-foreground">
          {TARGET_LABELS[targetType] || targetType}
        </Text>
        <Text className={`text-sm font-semibold ${statusInfo.color}`}>
          {statusInfo.label}
        </Text>
      </View>

      <View className="h-3 bg-surface-400 rounded-full overflow-hidden">
        <View
          className={`h-3 rounded-full ${barColor}`}
          style={{ width: `${Math.min(progress * 100, 100)}%` }}
        />
      </View>

      <View className="flex-row items-center justify-between">
        <Text className="text-xs text-muted-foreground">
          {formatCurrency(currentAvailable)} of{" "}
          {formatCurrency(targetAmount)}
        </Text>
        <Text className="text-xs text-muted-foreground">
          {Math.round(progress * 100)}%
        </Text>
      </View>

      {targetDate && (
        <Text className="text-xs text-surface-700">
          Target date: {targetDate}
        </Text>
      )}
    </View>
  );
}
