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

function SummaryRow({ label, value, valueClass }: { label: string; value: string; valueClass?: string }) {
  return (
    <View className="flex-row justify-between py-2.5">
      <Text className="text-xs text-surface-800">{label}</Text>
      <Text className={`text-xs font-bold ${valueClass || "text-foreground"}`}>{value}</Text>
    </View>
  );
}

export default function CategoryDetailScreen() {
  const { categoryId } = useLocalSearchParams<{ categoryId: string }>();
  const router = useRouter();
  const { userId, currentMonth } = useAppStore();

  const category = useQuery(api.categories.getById, categoryId ? { id: categoryId as Id<"categories"> } : "skip");
  const target = useQuery(api.targets.getByCategory, categoryId ? { categoryId: categoryId as Id<"categories"> } : "skip");
  const budgets = useQuery(api.budgets.getByMonth, userId ? { userId, month: currentMonth } : "skip");

  const setTarget = useMutation(api.targets.set);
  const removeTarget = useMutation(api.targets.remove);
  const assignBudget = useMutation(api.budgets.assign);

  const [showTargetForm, setShowTargetForm] = useState(false);
  const [targetType, setTargetType] = useState<string>(target?.type ?? "needed_for_spending");
  const [targetAmount, setTargetAmount] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [assignAmount, setAssignAmount] = useState("");

  const budget = budgets?.find((b: any) => b.categoryId === categoryId);
  const available = budget?.available ?? 0;
  const assigned = budget?.assigned ?? 0;
  const activity = budget?.activity ?? 0;
  const targetProgress = target && calculateTargetProgress(target as any, available);

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

  const handleQuickAssign = async () => {
    if (!userId || !categoryId) return;
    await assignBudget({
      userId,
      categoryId: categoryId as Id<"categories">,
      month: currentMonth,
      amount: takaToPaisa(parseFloat(assignAmount) || 0),
    });
    setAssignAmount("");
  };

  if (!category) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Text className="text-surface-800 text-xs">Loading...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="px-4 pt-14 pb-4 bg-surface-100 border-b border-border">
        <Pressable onPress={() => router.back()}>
          <Text className="text-primary-700 font-semibold text-xs mb-2">← Budget</Text>
        </Pressable>
        <Text className="text-lg font-bold text-foreground tracking-wide">{category.name}</Text>
        <Text className="text-2xs text-surface-800 uppercase tracking-widest mt-0.5">
          {getMonthLabel(currentMonth)}
        </Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} scrollEventThrottle={8} decelerationRate="fast">
        {/* Budget Summary */}
        <View className="px-4 mt-5">
          <Card className="px-4 py-0">
            <SummaryRow label="Assigned" value={formatCurrency(assigned)} />
            <View className="h-px bg-border/15" />
            <SummaryRow
              label="Activity"
              value={formatCurrency(activity)}
              valueClass={activity < 0 ? "text-danger" : "text-foreground"}
            />
            <View className="h-px bg-border/15" />
            <View className="flex-row justify-between py-3">
              <Text className="text-sm font-bold text-foreground">Available</Text>
              <Text className={`text-sm font-bold ${
                available < 0 ? "text-danger" : available > 0 ? "text-success" : "text-surface-800"
              }`}>
                {formatCurrency(available)}
              </Text>
            </View>
          </Card>
        </View>

        {/* Quick Assign */}
        <View className="px-4 mt-4">
          <Card>
            <Text className="text-2xs font-semibold text-surface-800 uppercase tracking-widest mb-2.5">
              Quick Assign
            </Text>
            <View className="flex-row items-center gap-2">
              <View className="flex-1 flex-row items-center border border-border/50 rounded-xl px-3 py-2.5 bg-surface-200">
                <Text className="text-base font-bold text-accent-500 mr-1.5">৳</Text>
                <TextInput
                  value={assignAmount}
                  onChangeText={setAssignAmount}
                  keyboardType="numeric"
                  placeholder="0"
                  className="flex-1 text-sm text-foreground font-bold"
                  placeholderTextColor="#4e6381"
                />
              </View>
              <Button onPress={handleQuickAssign} size="md">Assign</Button>
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
                  <Button variant="outline" size="sm" onPress={() => setShowTargetForm(true)}>Edit Goal</Button>
                </View>
                <View className="flex-1">
                  <Button variant="ghost" size="sm" onPress={() => removeTarget({ categoryId: categoryId as Id<"categories"> })}>Remove</Button>
                </View>
              </View>
            </Card>
          ) : !showTargetForm ? (
            <Button variant="outline" onPress={() => setShowTargetForm(true)}>+ Set a Target</Button>
          ) : null}

          {showTargetForm && (
            <Card className="mt-3">
              <Text className="text-xs font-bold text-foreground mb-3">Set Target</Text>
              <View className="gap-2 mb-4">
                {TARGET_TYPES.map((tt) => (
                  <Pressable
                    key={tt.key}
                    onPress={() => setTargetType(tt.key)}
                    className={`px-3 py-2.5 rounded-xl border ${
                      targetType === tt.key ? "border-primary-500 bg-surface-300" : "border-border/40"
                    }`}
                  >
                    <Text className={`text-xs font-semibold ${targetType === tt.key ? "text-primary-700" : "text-foreground"}`}>
                      {tt.label}
                    </Text>
                    <Text className="text-2xs text-surface-800 mt-0.5">{tt.desc}</Text>
                  </Pressable>
                ))}
              </View>

              <View className="flex-row items-center border border-border/50 rounded-xl px-3 py-2.5 mb-3 bg-surface-200">
                <Text className="text-base font-bold text-accent-500 mr-1.5">৳</Text>
                <TextInput
                  value={targetAmount}
                  onChangeText={setTargetAmount}
                  keyboardType="numeric"
                  placeholder="Target amount"
                  className="flex-1 text-sm text-foreground"
                  placeholderTextColor="#4e6381"
                />
              </View>

              {targetType === "spending_by_date" && (
                <TextInput
                  value={targetDate}
                  onChangeText={setTargetDate}
                  placeholder="Target date (YYYY-MM-DD)"
                  className="border border-border/50 rounded-xl px-3 py-2.5 text-sm text-foreground mb-3 bg-surface-200"
                  placeholderTextColor="#4e6381"
                />
              )}

              <View className="flex-row gap-3">
                <View className="flex-1">
                  <Button variant="ghost" onPress={() => setShowTargetForm(false)}>Cancel</Button>
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
