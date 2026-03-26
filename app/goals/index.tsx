import type BottomSheet from "@gorhom/bottom-sheet";
import { useRouter } from "expo-router";
import React, { useCallback, useMemo, useRef } from "react";
import { ScrollView, Text, View } from "react-native";
import { DebtCard } from "../../src/components/goals/DebtCard";
import { DebtForm } from "../../src/components/goals/DebtForm";
import { GoalCard } from "../../src/components/goals/GoalCard";
import { GoalForm } from "../../src/components/goals/GoalForm";
import { StrategyComparison } from "../../src/components/goals/StrategyComparison";
import { Button } from "../../src/components/ui/Button";
import { Card } from "../../src/components/ui/Card";
import { useGoals } from "../../src/hooks/use-goals";
import { useTranslation } from "../../src/lib/i18n";
import { compareStrategies } from "../../src/services/goal-engine";
import type { PayDownGoal, SaveUpGoal } from "../../src/services/goal-storage/types";

export default function GoalsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const goalFormRef = useRef<BottomSheet>(null);
  const debtFormRef = useRef<BottomSheet>(null);

  const { saveUpGoals, payDownGoals, addSaveUpGoal, addPayDownGoal } = useGoals();

  const strategies = useMemo(() => {
    if (payDownGoals.length < 2) return null;
    const debtInputs = payDownGoals.map((d) => ({
      name: d.name,
      balance: d.balance,
      aprPercent: d.aprPercent,
      minPayment: d.minPayment,
    }));
    return compareStrategies(debtInputs);
  }, [payDownGoals]);

  const handleGoalPress = useCallback(
    (goalId: string) => {
      router.push(`/goals/${goalId}` as any);
    },
    [router]
  );

  const handleSaveGoal = useCallback(
    (goal: Omit<SaveUpGoal, "id">) => {
      addSaveUpGoal(goal);
    },
    [addSaveUpGoal]
  );

  const handleSaveDebt = useCallback(
    (debt: Omit<PayDownGoal, "id">) => {
      addPayDownGoal(debt);
    },
    [addPayDownGoal]
  );

  return (
    <View className="flex-1 bg-background">
      <ScrollView className="flex-1" contentContainerClassName="pb-8">
        <View className="px-4 pt-4">
          {/* Savings Goals Section */}
          <Text className="text-xl font-bold text-foreground mb-4">
            {t("goals.savingsGoals" as any)}
          </Text>

          {saveUpGoals.length === 0 ? (
            <Card className="mb-4 items-center py-6">
              <Text className="text-sm font-bold text-foreground mb-1">
                {t("goals.noGoalsTitle" as any)}
              </Text>
              <Text className="text-xs text-surface-800 text-center px-4">
                {t("goals.noGoalsBody" as any)}
              </Text>
            </Card>
          ) : (
            <Card className="mb-4">
              {saveUpGoals.map((goal) => (
                <GoalCard key={goal.id} goal={goal} onPress={() => handleGoalPress(goal.id)} />
              ))}
            </Card>
          )}

          <View className="mb-8">
            <Button onPress={() => goalFormRef.current?.expand()}>
              {t("goals.createGoal" as any)}
            </Button>
          </View>

          {/* Debt Payoff Section */}
          <Text className="text-xl font-bold text-foreground mb-4">
            {t("goals.debtPayoff" as any)}
          </Text>

          {payDownGoals.length === 0 ? (
            <Card className="mb-4 items-center py-6">
              <Text className="text-sm font-bold text-foreground mb-1">
                {t("goals.noDebtsTitle" as any)}
              </Text>
              <Text className="text-xs text-surface-800 text-center px-4">
                {t("goals.noDebtsBody" as any)}
              </Text>
            </Card>
          ) : (
            <View className="mb-4">
              {payDownGoals.map((debt) => (
                <DebtCard key={debt.id} debt={debt} />
              ))}
            </View>
          )}

          <View className="mb-8">
            <Button onPress={() => debtFormRef.current?.expand()}>
              {t("goals.addDebt" as any)}
            </Button>
          </View>

          {/* Strategy Comparison (only with 2+ debts) */}
          {strategies && (
            <View>
              <Text className="text-xl font-bold text-foreground mb-4">
                {t("goals.strategyComparison" as any)}
              </Text>
              <StrategyComparison avalanche={strategies.avalanche} snowball={strategies.snowball} />
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom sheet forms */}
      <GoalForm sheetRef={goalFormRef} onSave={handleSaveGoal as any} />
      <DebtForm sheetRef={debtFormRef} onSave={handleSaveDebt as any} />
    </View>
  );
}
