import { useRouter } from "expo-router";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import type { Id } from "../../convex/_generated/dataModel";
import { AssignMoney } from "../../src/components/budget/AssignMoney";
import { BudgetRow } from "../../src/components/budget/BudgetRow";
import { Card } from "../../src/components/ui/Card";
import { useBudget } from "../../src/hooks/use-budget";
import { formatCurrency } from "../../src/lib/currency";
import { getMonthLabel, nextMonth, previousMonth } from "../../src/lib/date";
import { shadow } from "../../src/lib/platform";
import { useAppStore } from "../../src/stores/app-store";

interface AssignTarget {
  categoryId: Id<"categories">;
  categoryName: string;
  currentAssigned: number;
  available: number;
}

export default function BudgetScreen() {
  const { userId, currentMonth, setCurrentMonth } = useAppStore();
  const { summary, groups, isLoading } = useBudget();
  const router = useRouter();
  const { t } = useTranslation();

  const [assignTarget, setAssignTarget] = useState<AssignTarget | null>(null);
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

  const toggleGroup = (groupId: string) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      next.has(groupId) ? next.delete(groupId) : next.add(groupId);
      return next;
    });
  };

  const groupedBudgets = groups
    ?.filter((g: any) => {
      const groupCats = summary?.categories.filter((c) => c.groupId === g._id);
      return groupCats && groupCats.length > 0;
    })
    .map((g: any) => ({
      ...g,
      budgets: summary?.categories.filter((c) => c.groupId === g._id) ?? [],
    }));

  const readyToAssign = summary?.readyToAssign ?? 0;

  return (
    <View className="flex-1 bg-background">
      {/* Month Navigator */}
      <View className="flex-row items-center justify-between px-4 py-3 bg-surface-100 border-b border-border">
        <Pressable
          onPress={() => setCurrentMonth(previousMonth(currentMonth))}
          className="px-3 py-1"
        >
          <Text className="text-primary-700 font-bold text-base">‹</Text>
        </Pressable>
        <Text className="text-sm font-bold text-foreground tracking-wide">
          {getMonthLabel(currentMonth)}
        </Text>
        <Pressable onPress={() => setCurrentMonth(nextMonth(currentMonth))} className="px-3 py-1">
          <Text className="text-primary-700 font-bold text-base">›</Text>
        </Pressable>
      </View>

      {/* Ready to Assign */}
      <Pressable className="mx-4 mt-3">
        <Card
          className={`items-center py-3.5 ${
            readyToAssign > 0
              ? "border-success/20"
              : readyToAssign < 0
                ? "border-danger/20"
                : "border-primary-400/15"
          }`}
          style={
            readyToAssign > 0
              ? shadow("#34d399", 0, 0, 0.1, 16)
              : readyToAssign < 0
                ? shadow("#f87171", 0, 0, 0.1, 16)
                : undefined
          }
        >
          <Text className="text-2xs font-semibold text-surface-800 uppercase tracking-widest">
            {t("budget.readyToAssign")}
          </Text>
          <Text
            className={`text-2xl font-bold mt-0.5 tracking-tight ${
              readyToAssign > 0
                ? "text-success"
                : readyToAssign < 0
                  ? "text-danger"
                  : "text-primary-700"
            }`}
          >
            {formatCurrency(readyToAssign)}
          </Text>
          {readyToAssign > 0 && (
            <Text className="text-2xs text-surface-800 mt-1">Distribute to categories below</Text>
          )}
          {readyToAssign < 0 && (
            <Text className="text-2xs text-danger mt-1">You've assigned more than you have!</Text>
          )}
        </Card>
      </Pressable>

      {/* Budget Grid */}
      <ScrollView
        scrollEventThrottle={8}
        decelerationRate="fast"
        removeClippedSubviews
        className="flex-1 mt-3"
        showsVerticalScrollIndicator={false}
      >
        {/* Column Headers */}
        <View className="flex-row px-4 py-2.5 border-b border-border bg-surface-200">
          <Text className="flex-1 text-2xs font-semibold text-surface-800 uppercase tracking-widest">
            {t("budget.category")}
          </Text>
          <Text className="w-24 text-2xs font-semibold text-surface-800 uppercase text-right tracking-wider">
            {t("budget.assigned")}
          </Text>
          <Text className="w-24 text-2xs font-semibold text-surface-800 uppercase text-right tracking-wider">
            {t("budget.activity")}
          </Text>
          <Text className="w-24 text-2xs font-semibold text-surface-800 uppercase text-right tracking-wider">
            {t("budget.available")}
          </Text>
        </View>

        {groupedBudgets?.map((group: any) => {
          const isCollapsed = collapsedGroups.has(group._id);
          const groupAssigned = group.budgets.reduce((s: number, c: any) => s + c.assigned, 0);
          const groupActivity = group.budgets.reduce((s: number, c: any) => s + c.activity, 0);
          const groupAvailable = group.budgets.reduce((s: number, c: any) => s + c.available, 0);

          return (
            <View key={group._id}>
              <Pressable
                onPress={() => toggleGroup(group._id)}
                className="flex-row items-center px-4 py-2.5 bg-surface-300 border-b border-border/20"
              >
                <View className="flex-1 flex-row items-center">
                  <Text className="text-2xs mr-1.5 text-surface-800">
                    {isCollapsed ? "▸" : "▾"}
                  </Text>
                  <Text className="text-xs font-bold text-foreground tracking-wide">
                    {group.name}
                  </Text>
                </View>
                <Text className="w-24 text-2xs font-medium text-surface-800 text-right">
                  {formatCurrency(groupAssigned)}
                </Text>
                <Text className="w-24 text-2xs font-medium text-surface-800 text-right">
                  {formatCurrency(groupActivity)}
                </Text>
                <Text
                  className={`w-24 text-2xs font-bold text-right ${groupAvailable < 0 ? "text-danger" : "text-foreground"}`}
                >
                  {formatCurrency(groupAvailable)}
                </Text>
              </Pressable>

              {!isCollapsed &&
                group.budgets.map((budget: any) => (
                  <BudgetRow
                    key={budget.categoryId}
                    budget={budget}
                    onPress={() => router.push(`/budget/${budget.categoryId}` as any)}
                    onAssign={() =>
                      setAssignTarget({
                        categoryId: budget.categoryId,
                        categoryName: budget.name,
                        currentAssigned: budget.assigned,
                        available: budget.available,
                      })
                    }
                  />
                ))}
            </View>
          );
        })}

        {summary && summary.overspent > 0 && (
          <View className="mx-4 mt-4">
            <Card className="border-danger/20">
              <View className="flex-row items-center justify-between">
                <Text className="text-xs font-semibold text-danger">{t("budget.overspent")}</Text>
                <Text className="text-xs font-bold text-danger">
                  {formatCurrency(-summary.overspent)}
                </Text>
              </View>
              <Text className="text-2xs text-surface-800 mt-1">
                Move money from other categories to cover
              </Text>
            </Card>
          </View>
        )}

        {(!groupedBudgets || groupedBudgets.length === 0) && !isLoading && (
          <View className="items-center py-20">
            <Text className="text-4xl mb-3">📊</Text>
            <Text className="text-sm font-bold text-surface-900">Budget will appear here</Text>
            <Text className="text-xs text-surface-800 mt-1 text-center px-8">
              Add accounts and income to start budgeting
            </Text>
          </View>
        )}

        <View className="h-20" />
      </ScrollView>

      {assignTarget && userId && (
        <Modal
          visible
          transparent
          animationType="fade"
          onRequestClose={() => setAssignTarget(null)}
        >
          <Pressable
            className="flex-1 bg-black/60 justify-center"
            onPress={() => setAssignTarget(null)}
          >
            <Pressable onPress={() => {}}>
              <AssignMoney
                userId={userId}
                categoryId={assignTarget.categoryId}
                categoryName={assignTarget.categoryName}
                month={currentMonth}
                currentAssigned={assignTarget.currentAssigned}
                available={assignTarget.available}
                readyToAssign={readyToAssign}
                onClose={() => setAssignTarget(null)}
              />
            </Pressable>
          </Pressable>
        </Modal>
      )}
    </View>
  );
}
