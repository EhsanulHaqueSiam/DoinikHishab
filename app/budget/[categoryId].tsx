import React, { useState } from "react";
import { View, Text, ScrollView, Pressable, TextInput } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useAppStore } from "../../src/stores/app-store";
import { Card } from "../../src/components/ui/Card";
import { Button } from "../../src/components/ui/Button";
import { GoalProgress } from "../../src/components/budget/GoalProgress";
import { formatCurrency, takaToPaisa, paisaToTaka } from "../../src/lib/currency";
import { getMonthLabel } from "../../src/lib/date";
import { calculateTargetProgress } from "../../src/services/budget-engine";
import type { Id } from "../../convex/_generated/dataModel";

const TARGET_TYPES = [
  { key: "needed_for_spending", label: "Monthly Spending", desc: "Need this much each month" },
  { key: "weekly_spending", label: "Weekly Spending", desc: "Weekly allocation" },
  { key: "spending_by_date", label: "Save by Date", desc: "Save X amount by a date" },
  { key: "savings_balance", label: "Savings Balance", desc: "Build up to a balance" },
  { key: "monthly_savings", label: "Monthly Savings", desc: "Save a fixed amount monthly" },
] as const;

export default function CategoryDetailScreen() {
  const { categoryId } = useLocalSearchParams<{ categoryId: string }>();
  const router = useRouter();
  const { userId, currentMonth } = useAppStore();

  const category = useQuery(
    api.categories.getById,
    categoryId ? { id: categoryId as Id<"categories"> } : "skip"
  );

  const target = useQuery(
    api.targets.getByCategory,
    categoryId ? { categoryId: categoryId as Id<"categories"> } : "skip"
  );

  const budgets = useQuery(
    api.budgets.getByMonth,
    userId ? { userId, month: currentMonth } : "skip"
  );

  const setTarget = useMutation(api.targets.set);
  const removeTarget = useMutation(api.targets.remove);
  const assignBudget = useMutation(api.budgets.assign);

  const [showTargetForm, setShowTargetForm] = useState(false);
  const [targetType, setTargetType] = useState<string>(
    target?.type ?? "needed_for_spending"
  );
  const [targetAmount, setTargetAmount] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [assignAmount, setAssignAmount] = useState("");

  const budget = budgets?.find(
    (b: any) => b.categoryId === categoryId
  );
  const available = budget?.available ?? 0;
  const assigned = budget?.assigned ?? 0;
  const activity = budget?.activity ?? 0;

  const targetProgress =
    target && calculateTargetProgress(target as any, available);

  const handleSetTarget = async () => {
    if (!userId || !categoryId) return;
    await setTarget({
      userId,
      categoryId: categoryId as Id<"categories">,
      type: targetType as any,
      amount: takaToPaisa(parseFloat(targetAmount) || 0),
      targetDate: targetDate || undefined,
    });
    setShowTargetForm(false);
  };

  const handleRemoveTarget = async () => {
    if (!categoryId) return;
    await removeTarget({ categoryId: categoryId as Id<"categories"> });
  };

  const handleQuickAssign = async () => {
    if (!userId || !categoryId) return;
    const paisa = takaToPaisa(parseFloat(assignAmount) || 0);
    await assignBudget({
      userId,
      categoryId: categoryId as Id<"categories">,
      month: currentMonth,
      amount: paisa,
    });
    setAssignAmount("");
  };

  if (!category) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Text className="text-muted-foreground">Loading...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="px-4 pt-14 pb-4 bg-white border-b border-border">
        <Pressable onPress={() => router.back()}>
          <Text className="text-primary-600 font-medium mb-2">← Budget</Text>
        </Pressable>
        <Text className="text-xl font-bold text-foreground">
          {category.name}
        </Text>
        <Text className="text-sm text-muted-foreground">
          {getMonthLabel(currentMonth)}
        </Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Budget Summary */}
        <View className="px-4 mt-4">
          <Card>
            <View className="flex-row justify-between mb-3">
              <Text className="text-sm text-muted-foreground">Assigned</Text>
              <Text className="text-sm font-medium text-foreground">
                {formatCurrency(assigned)}
              </Text>
            </View>
            <View className="flex-row justify-between mb-3">
              <Text className="text-sm text-muted-foreground">Activity</Text>
              <Text
                className={`text-sm font-medium ${
                  activity < 0 ? "text-danger" : "text-foreground"
                }`}
              >
                {formatCurrency(activity)}
              </Text>
            </View>
            <View className="h-px bg-border my-1" />
            <View className="flex-row justify-between mt-2">
              <Text className="text-base font-semibold text-foreground">
                Available
              </Text>
              <Text
                className={`text-base font-bold ${
                  available < 0
                    ? "text-danger"
                    : available > 0
                      ? "text-success"
                      : "text-muted-foreground"
                }`}
              >
                {formatCurrency(available)}
              </Text>
            </View>
          </Card>
        </View>

        {/* Quick Assign */}
        <View className="px-4 mt-4">
          <Card>
            <Text className="text-sm font-semibold text-foreground mb-2">
              Quick Assign
            </Text>
            <View className="flex-row items-center gap-2">
              <View className="flex-1 flex-row items-center border border-border rounded-xl px-3 py-2">
                <Text className="text-base font-bold text-foreground mr-1">
                  ৳
                </Text>
                <TextInput
                  value={assignAmount}
                  onChangeText={setAssignAmount}
                  keyboardType="numeric"
                  placeholder="0"
                  className="flex-1 text-base text-foreground"
                  placeholderTextColor="#94a3b8"
                />
              </View>
              <Button onPress={handleQuickAssign} size="md">
                Assign
              </Button>
            </View>
          </Card>
        </View>

        {/* Target / Goal */}
        <View className="px-4 mt-4">
          {target && targetProgress ? (
            <Card>
              <GoalProgress
                targetType={target.type}
                targetAmount={target.amount}
                currentAvailable={available}
                progress={targetProgress.progress}
                status={targetProgress.status}
                targetDate={target.targetDate || undefined}
              />
              <View className="flex-row gap-3 mt-4">
                <View className="flex-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onPress={() => setShowTargetForm(true)}
                  >
                    Edit Goal
                  </Button>
                </View>
                <View className="flex-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onPress={handleRemoveTarget}
                  >
                    Remove
                  </Button>
                </View>
              </View>
            </Card>
          ) : !showTargetForm ? (
            <Button
              variant="outline"
              onPress={() => setShowTargetForm(true)}
            >
              + Set a Target
            </Button>
          ) : null}

          {showTargetForm && (
            <Card className="mt-3">
              <Text className="text-base font-semibold text-foreground mb-3">
                Set Target
              </Text>

              {/* Target type selector */}
              <View className="gap-2 mb-4">
                {TARGET_TYPES.map((tt) => (
                  <Pressable
                    key={tt.key}
                    onPress={() => setTargetType(tt.key)}
                    className={`px-3 py-2.5 rounded-xl border ${
                      targetType === tt.key
                        ? "border-primary-400 bg-primary-50"
                        : "border-border"
                    }`}
                  >
                    <Text
                      className={`text-sm font-medium ${
                        targetType === tt.key
                          ? "text-primary-700"
                          : "text-foreground"
                      }`}
                    >
                      {tt.label}
                    </Text>
                    <Text className="text-xs text-muted-foreground">
                      {tt.desc}
                    </Text>
                  </Pressable>
                ))}
              </View>

              {/* Amount */}
              <View className="flex-row items-center border border-border rounded-xl px-3 py-2 mb-3">
                <Text className="text-base font-bold text-foreground mr-1">
                  ৳
                </Text>
                <TextInput
                  value={targetAmount}
                  onChangeText={setTargetAmount}
                  keyboardType="numeric"
                  placeholder="Target amount"
                  className="flex-1 text-base text-foreground"
                  placeholderTextColor="#94a3b8"
                />
              </View>

              {/* Date (for spending_by_date) */}
              {targetType === "spending_by_date" && (
                <TextInput
                  value={targetDate}
                  onChangeText={setTargetDate}
                  placeholder="Target date (YYYY-MM-DD)"
                  className="border border-border rounded-xl px-3 py-2 text-base mb-3"
                  placeholderTextColor="#94a3b8"
                />
              )}

              <View className="flex-row gap-3">
                <View className="flex-1">
                  <Button
                    variant="ghost"
                    onPress={() => setShowTargetForm(false)}
                  >
                    Cancel
                  </Button>
                </View>
                <View className="flex-1">
                  <Button onPress={handleSetTarget}>Save Target</Button>
                </View>
              </View>
            </Card>
          )}
        </View>

        <View className="h-20" />
      </ScrollView>
    </View>
  );
}
