import React, { useMemo } from "react";
import { Pressable, Text, View } from "react-native";
import { useTranslation } from "../../lib/i18n";
import { formatCurrency } from "../../lib/currency";
import {
  calculateGoalStatus,
  calculateMonthlyContribution,
} from "../../services/goal-engine";
import type { SaveUpGoal } from "../../services/goal-storage/types";
import type { GoalStatus } from "../../services/goal-storage/types";
import { GoalProgress } from "./GoalProgress";

interface GoalCardProps {
  goal: SaveUpGoal;
  onPress: () => void;
}

const statusConfig: Record<GoalStatus, { labelKey: string; color: string }> = {
  ahead: { labelKey: "goals.ahead", color: "text-primary-700" },
  on_track: { labelKey: "goals.onTrack", color: "text-success" },
  behind: { labelKey: "goals.behind", color: "text-warning" },
  funded: { labelKey: "goals.funded", color: "text-primary-700" },
};

export function GoalCard({ goal, onPress }: GoalCardProps) {
  const { t } = useTranslation();

  const status = useMemo(
    () =>
      calculateGoalStatus(
        goal.currentAmount,
        goal.targetAmount,
        goal.targetDate,
        goal.createdDate
      ),
    [goal.currentAmount, goal.targetAmount, goal.targetDate, goal.createdDate]
  );

  const monthlyNeeded = useMemo(
    () =>
      calculateMonthlyContribution(
        goal.targetAmount,
        goal.currentAmount,
        goal.targetDate
      ),
    [goal.targetAmount, goal.currentAmount, goal.targetDate]
  );

  const percentage =
    goal.targetAmount > 0
      ? Math.round((goal.currentAmount / goal.targetAmount) * 100)
      : 0;

  const config = statusConfig[status];
  const statusLabel = t(config.labelKey as any);

  return (
    <Pressable
      onPress={onPress}
      className="active:bg-surface-400/30 px-4 py-3"
      style={{ minHeight: 80 }}
      accessibilityRole="button"
      accessibilityLabel={`${goal.name}, ${percentage}% complete, ${statusLabel}`}
    >
      {/* Top row: name + status badge */}
      <View className="flex-row items-center justify-between mb-1.5">
        <Text
          className="text-sm font-bold text-foreground flex-1 mr-2"
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {goal.name}
        </Text>
        <Text className={`text-2xs font-bold ${config.color}`}>
          {statusLabel}
        </Text>
      </View>

      {/* Progress bar */}
      <GoalProgress percentage={percentage} status={status} />

      {/* Bottom row: amounts + monthly needed */}
      <View className="flex-row items-center justify-between mt-1.5">
        <Text className="text-2xs text-surface-800">
          {formatCurrency(goal.currentAmount)} of{" "}
          {formatCurrency(goal.targetAmount)} &middot; {percentage}%
        </Text>
        <Text className="text-2xs text-surface-800">
          {t("goals.monthlyNeeded" as any, {
            amount: formatCurrency(monthlyNeeded),
          })}
        </Text>
      </View>
    </Pressable>
  );
}
