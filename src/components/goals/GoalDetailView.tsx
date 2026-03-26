import React, { useMemo } from "react";
import { Alert, ScrollView, Text, View } from "react-native";
import { useTranslation } from "../../lib/i18n";
import { formatCurrency } from "../../lib/currency";
import {
  calculateGoalStatus,
  calculateMonthlyContribution,
} from "../../services/goal-engine";
import type { SaveUpGoal, GoalStatus } from "../../services/goal-storage/types";
import { GoalProgress } from "./GoalProgress";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";

interface GoalDetailViewProps {
  goal: SaveUpGoal;
  onEdit: () => void;
  onDelete: () => void;
}

const statusConfig: Record<GoalStatus, { labelKey: string; color: string }> = {
  ahead: { labelKey: "goals.ahead", color: "text-primary-700" },
  on_track: { labelKey: "goals.onTrack", color: "text-success" },
  behind: { labelKey: "goals.behind", color: "text-warning" },
  funded: { labelKey: "goals.funded", color: "text-primary-700" },
};

// Mock contribution history for display
const MOCK_CONTRIBUTIONS = [
  { month: "Mar 2026", amount: 300000 },
  { month: "Feb 2026", amount: 250000 },
  { month: "Jan 2026", amount: 350000 },
];

export function GoalDetailView({ goal, onEdit, onDelete }: GoalDetailViewProps) {
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

  const targetDateFormatted = new Date(goal.targetDate).toLocaleDateString(
    "en-US",
    { month: "long", year: "numeric" }
  );

  const handleDelete = () => {
    Alert.alert(
      t("goals.deleteConfirm" as any, { name: goal.name }),
      t("goals.deleteWarning" as any),
      [
        { text: t("recurring.cancel" as any), style: "cancel" },
        {
          text: t("goals.deleteGoal" as any),
          style: "destructive",
          onPress: onDelete,
        },
      ]
    );
  };

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="px-4 py-6">
        {/* Large progress display */}
        <Card className="mb-6">
          <View className="items-center py-4">
            <Text className="text-hero font-bold text-foreground mb-2">
              {percentage}%
            </Text>
            <View className="w-full px-4 mb-3">
              <GoalProgress percentage={percentage} status={status} height={12} />
            </View>
            <Text className="text-sm text-surface-800 mb-1">
              {formatCurrency(goal.currentAmount)} of{" "}
              {formatCurrency(goal.targetAmount)}
            </Text>
            <Text className={`text-2xs font-bold ${config.color}`}>
              {statusLabel}
            </Text>
          </View>
        </Card>

        {/* Info rows */}
        <Card className="mb-6">
          <InfoRow
            label={t("goals.targetDate" as any)}
            value={targetDateFormatted}
          />
          <InfoRow
            label={t("goals.monthlyNeeded" as any, { amount: "" }).replace("needed", "").trim()}
            value={formatCurrency(monthlyNeeded)}
          />
          <InfoRow
            label={t("goals.linkedAccount" as any)}
            value={goal.linkedAccountId.replace("mock_acc_", "").replace(/^./, (c) => c.toUpperCase())}
          />
        </Card>

        {/* Contribution History */}
        <View className="mb-6">
          <Text className="text-sm font-bold text-foreground mb-3">
            {t("goals.contributionHistory" as any)}
          </Text>
          <Card>
            {MOCK_CONTRIBUTIONS.map((entry, idx) => (
              <View
                key={entry.month}
                className={`flex-row justify-between py-2 ${
                  idx < MOCK_CONTRIBUTIONS.length - 1 ? "border-b border-border/20" : ""
                }`}
              >
                <Text className="text-xs text-surface-800">{entry.month}</Text>
                <Text className="text-xs font-bold text-foreground">
                  {formatCurrency(entry.amount)}
                </Text>
              </View>
            ))}
          </Card>
        </View>

        {/* Action buttons */}
        <View className="gap-3">
          <Button variant="outline" onPress={onEdit}>
            {t("goals.editGoal" as any)}
          </Button>
          <Button variant="danger" onPress={handleDelete}>
            {t("goals.deleteGoal" as any)}
          </Button>
        </View>
      </View>
    </ScrollView>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row justify-between py-2 border-b border-border/20 last:border-b-0">
      <Text className="text-xs text-surface-800">{label}</Text>
      <Text className="text-xs font-bold text-foreground">{value}</Text>
    </View>
  );
}
