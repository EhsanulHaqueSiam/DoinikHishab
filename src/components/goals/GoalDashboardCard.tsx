import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { useGoals } from "../../hooks/use-goals";
import { formatCurrency } from "../../lib/currency";
import { useTranslation } from "../../lib/i18n";
import { calculateGoalStatus, calculateMonthlyContribution } from "../../services/goal-engine";
import { Card } from "../ui/Card";
import { GoalProgress } from "./GoalProgress";

/**
 * Dashboard widget showing top 2-3 goals with mini progress bars.
 * Save-up goals show percentage progress; pay-down goals show remaining balance.
 * Taps navigate to the full goals screen.
 */
export function GoalDashboardCard() {
  const { saveUpGoals, payDownGoals } = useGoals();
  const router = useRouter();
  const { t } = useTranslation();

  const hasGoals = saveUpGoals.length > 0 || payDownGoals.length > 0;

  const handlePress = () => {
    router.push("/goals" as any);
  };

  if (!hasGoals) {
    return (
      <Pressable onPress={handlePress} accessibilityRole="button">
        <Card>
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-sm font-bold text-foreground">{t("goals.title")}</Text>
          </View>
          <View className="flex-row items-center gap-2">
            <Text className="text-lg">+</Text>
            <Text className="text-xs text-surface-800">{t("goals.noGoalsBody")}</Text>
          </View>
        </Card>
      </Pressable>
    );
  }

  // Show top 2 save-up goals, then fill remaining slots (up to 3 total) with pay-down goals
  const displaySaveUp = saveUpGoals.slice(0, 2);
  const remainingSlots = 3 - displaySaveUp.length;
  const displayPayDown = payDownGoals.slice(0, Math.max(0, remainingSlots));

  return (
    <Pressable onPress={handlePress} accessibilityRole="button">
      <Card>
        {/* Header */}
        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-sm font-bold text-foreground">{t("goals.title")}</Text>
          <Pressable onPress={handlePress}>
            <Text className="text-2xs font-semibold text-primary-700 uppercase tracking-wider">
              {t("goals.seeAll")}
            </Text>
          </Pressable>
        </View>

        {/* Save-up goals with mini progress bars */}
        {displaySaveUp.map((goal) => {
          const percentage =
            goal.targetAmount > 0 ? Math.round((goal.currentAmount / goal.targetAmount) * 100) : 0;
          const status = calculateGoalStatus(
            goal.currentAmount,
            goal.targetAmount,
            goal.targetDate,
            goal.createdDate
          );

          return (
            <View key={goal.id} className="mb-2.5">
              <View className="flex-row items-center justify-between mb-1">
                <Text className="text-xs font-medium text-foreground" numberOfLines={1}>
                  {goal.name}
                </Text>
                <Text className="text-2xs font-bold text-surface-800 ml-2">{percentage}%</Text>
              </View>
              <GoalProgress percentage={percentage} status={status} height={4} />
            </View>
          );
        })}

        {/* Pay-down goals with remaining balance */}
        {displayPayDown.map((goal) => (
          <View key={goal.id} className="flex-row items-center justify-between mb-2">
            <Text className="text-xs font-medium text-foreground" numberOfLines={1}>
              {goal.name}
            </Text>
            <Text className="text-2xs font-medium text-surface-800 ml-2">
              {formatCurrency(goal.balance)} left
            </Text>
          </View>
        ))}
      </Card>
    </Pressable>
  );
}
