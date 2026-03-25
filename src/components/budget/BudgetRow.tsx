import React from "react";
import { Pressable, Text, View } from "react-native";
import { formatCurrency } from "../../lib/currency";
import type { CategoryBudget } from "../../services/budget-engine";

interface BudgetRowProps {
  budget: CategoryBudget;
  onPress?: () => void;
  onAssign?: () => void;
}

function TargetIndicator({ status, progress }: { status?: string; progress?: number }) {
  if (!status || progress === undefined) return null;
  const color =
    status === "funded" ? "bg-primary-500" : status === "on_track" ? "bg-success" : "bg-warning";
  return (
    <View className="w-full h-1 bg-surface-400 rounded-full mt-1.5">
      <View
        className={`h-1 rounded-full ${color}`}
        style={{ width: `${Math.min(progress * 100, 100)}%` }}
      />
    </View>
  );
}

export const BudgetRow = React.memo(function BudgetRow({
  budget,
  onPress,
  onAssign,
}: BudgetRowProps) {
  const availableColor =
    budget.available < 0
      ? "text-danger"
      : budget.available > 0
        ? "text-success"
        : "text-surface-800";
  const availableBg =
    budget.available < 0 ? "bg-danger/8" : budget.available > 0 ? "bg-success/8" : "";

  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center px-4 py-3 bg-card border-b border-border/15 active:bg-surface-400/30"
    >
      <View className="flex-1 pr-2">
        <Text className="text-xs font-medium text-foreground" numberOfLines={1}>
          {budget.name}
        </Text>
        <TargetIndicator status={budget.targetStatus} progress={budget.targetProgress} />
      </View>

      <Pressable onPress={onAssign} className="w-24 items-end">
        <Text className="text-xs text-foreground">
          {budget.assigned === 0 ? "—" : formatCurrency(budget.assigned)}
        </Text>
      </Pressable>

      <View className="w-24 items-end">
        <Text
          className={`text-xs ${budget.activity < 0 ? "text-danger" : budget.activity > 0 ? "text-success" : "text-surface-800"}`}
        >
          {budget.activity === 0 ? "—" : formatCurrency(budget.activity)}
        </Text>
      </View>

      <View className={`w-24 items-end rounded-md px-1.5 py-0.5 ${availableBg}`}>
        <Text className={`text-xs font-bold ${availableColor}`}>
          {budget.available === 0 ? "—" : formatCurrency(budget.available)}
        </Text>
      </View>
    </Pressable>
  );
});
