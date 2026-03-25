import React from "react";
import { View, Text, Pressable } from "react-native";
import { formatCurrency } from "../../lib/currency";
import type { CategoryBudget } from "../../services/budget-engine";

interface BudgetRowProps {
  budget: CategoryBudget;
  onPress?: () => void;
  onAssign?: () => void;
}

function TargetIndicator({
  status,
  progress,
}: {
  status?: string;
  progress?: number;
}) {
  if (!status || progress === undefined) return null;

  const color =
    status === "funded"
      ? "bg-primary-600"
      : status === "on_track"
        ? "bg-success"
        : "bg-warning";

  return (
    <View className="w-full h-1.5 bg-surface-400 rounded-full mt-1">
      <View
        className={`h-1.5 rounded-full ${color}`}
        style={{ width: `${Math.min(progress * 100, 100)}%` }}
      />
    </View>
  );
}

export const BudgetRow = React.memo(function BudgetRow({ budget, onPress, onAssign }: BudgetRowProps) {
  const availableColor =
    budget.available < 0
      ? "text-danger"
      : budget.available > 0
        ? "text-success"
        : "text-muted-foreground";

  const availableBg =
    budget.available < 0
      ? "bg-red-950/50"
      : budget.available > 0
        ? "bg-emerald-950/50"
        : "";

  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center px-4 py-3 bg-card border-b border-border/30 active:bg-surface-300"
    >
      <View className="flex-1 pr-2">
        <Text className="text-sm text-foreground" numberOfLines={1}>
          {budget.name}
        </Text>
        <TargetIndicator
          status={budget.targetStatus}
          progress={budget.targetProgress}
        />
      </View>

      <Pressable
        onPress={onAssign}
        className="w-24 items-end"
      >
        <Text className="text-sm text-foreground">
          {budget.assigned === 0
            ? "—"
            : formatCurrency(budget.assigned)}
        </Text>
      </Pressable>

      <View className="w-24 items-end">
        <Text
          className={`text-sm ${
            budget.activity < 0
              ? "text-danger"
              : budget.activity > 0
                ? "text-success"
                : "text-muted-foreground"
          }`}
        >
          {budget.activity === 0
            ? "—"
            : formatCurrency(budget.activity)}
        </Text>
      </View>

      <View className={`w-24 items-end rounded-lg px-1.5 py-0.5 ${availableBg}`}>
        <Text className={`text-sm font-medium ${availableColor}`}>
          {budget.available === 0
            ? "—"
            : formatCurrency(budget.available)}
        </Text>
      </View>
    </Pressable>
  );
});
