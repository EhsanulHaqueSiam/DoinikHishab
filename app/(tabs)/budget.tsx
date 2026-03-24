import React, { useState } from "react";
import { View, Text, ScrollView, Pressable, Modal } from "react-native";
import { useRouter } from "expo-router";
import { useBudget } from "../../src/hooks/use-budget";
import { useAppStore } from "../../src/stores/app-store";
import { BudgetRow } from "../../src/components/budget/BudgetRow";
import { AssignMoney } from "../../src/components/budget/AssignMoney";
import { Card } from "../../src/components/ui/Card";
import { formatCurrency } from "../../src/lib/currency";
import { getMonthLabel, previousMonth, nextMonth } from "../../src/lib/date";
import type { Id } from "../../convex/_generated/dataModel";

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

  const [assignTarget, setAssignTarget] = useState<AssignTarget | null>(null);
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

  const toggleGroup = (groupId: string) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupId)) {
        next.delete(groupId);
      } else {
        next.add(groupId);
      }
      return next;
    });
  };

  const groupedBudgets = groups
    ?.filter((g: any) => {
      const groupCats = summary?.categories.filter(
        (c) => c.groupId === g._id
      );
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
          <Text className="text-primary-700 font-semibold text-lg">‹</Text>
        </Pressable>
        <Text className="text-base font-bold text-foreground tracking-wide">
          {getMonthLabel(currentMonth)}
        </Text>
        <Pressable
          onPress={() => setCurrentMonth(nextMonth(currentMonth))}
          className="px-3 py-1"
        >
          <Text className="text-primary-700 font-semibold text-lg">›</Text>
        </Pressable>
      </View>

      {/* Ready to Assign Banner */}
      <Pressable className="mx-4 mt-3">
        <Card
          className={`items-center py-3 ${
            readyToAssign > 0
              ? "border-emerald-800/40"
              : readyToAssign < 0
                ? "border-red-800/40"
                : "border-primary-200/40"
          }`}
          style={
            readyToAssign > 0
              ? {
                  shadowColor: "#22c55e",
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.15,
                  shadowRadius: 16,
                }
              : readyToAssign < 0
                ? {
                    shadowColor: "#ef4444",
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: 0.15,
                    shadowRadius: 16,
                  }
                : undefined
          }
        >
          <Text className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Ready to Assign
          </Text>
          <Text
            className={`text-2xl font-bold mt-0.5 ${
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
            <Text className="text-xs text-muted-foreground mt-1">
              Distribute to categories below
            </Text>
          )}
          {readyToAssign < 0 && (
            <Text className="text-xs text-danger mt-1">
              You've assigned more than you have!
            </Text>
          )}
        </Card>
      </Pressable>

      {/* Budget Grid */}
      <ScrollView
        className="flex-1 mt-3"
        showsVerticalScrollIndicator={false}
      >
        {/* Column Headers */}
        <View className="flex-row px-4 py-2 border-b border-border bg-surface-200">
          <Text className="flex-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Category
          </Text>
          <Text className="w-24 text-xs font-semibold text-muted-foreground uppercase text-right">
            Assigned
          </Text>
          <Text className="w-24 text-xs font-semibold text-muted-foreground uppercase text-right">
            Activity
          </Text>
          <Text className="w-24 text-xs font-semibold text-muted-foreground uppercase text-right">
            Available
          </Text>
        </View>

        {groupedBudgets?.map((group: any) => {
          const isCollapsed = collapsedGroups.has(group._id);
          const groupAssigned = group.budgets.reduce(
            (s: number, c: any) => s + c.assigned,
            0
          );
          const groupActivity = group.budgets.reduce(
            (s: number, c: any) => s + c.activity,
            0
          );
          const groupAvailable = group.budgets.reduce(
            (s: number, c: any) => s + c.available,
            0
          );

          return (
            <View key={group._id}>
              {/* Group Header */}
              <Pressable
                onPress={() => toggleGroup(group._id)}
                className="flex-row items-center px-4 py-2.5 bg-surface-300 border-b border-border/30"
              >
                <View className="flex-1 flex-row items-center">
                  <Text className="text-xs mr-1.5 text-muted-foreground">
                    {isCollapsed ? "▸" : "▾"}
                  </Text>
                  <Text className="text-sm font-bold text-foreground">
                    {group.name}
                  </Text>
                </View>
                <Text className="w-24 text-xs font-medium text-muted-foreground text-right">
                  {formatCurrency(groupAssigned)}
                </Text>
                <Text className="w-24 text-xs font-medium text-muted-foreground text-right">
                  {formatCurrency(groupActivity)}
                </Text>
                <Text
                  className={`w-24 text-xs font-semibold text-right ${
                    groupAvailable < 0 ? "text-danger" : "text-foreground"
                  }`}
                >
                  {formatCurrency(groupAvailable)}
                </Text>
              </Pressable>

              {/* Category Rows */}
              {!isCollapsed &&
                group.budgets.map((budget: any) => (
                  <BudgetRow
                    key={budget.categoryId}
                    budget={budget}
                    onPress={() =>
                      router.push(
                        `/budget/${budget.categoryId}` as any
                      )
                    }
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

        {/* Overspent summary */}
        {summary && summary.overspent > 0 && (
          <View className="mx-4 mt-4">
            <Card className="border-red-800/40">
              <View className="flex-row items-center justify-between">
                <Text className="text-sm font-medium text-danger">
                  Total Overspent
                </Text>
                <Text className="text-sm font-bold text-danger">
                  {formatCurrency(-summary.overspent)}
                </Text>
              </View>
              <Text className="text-xs text-muted-foreground mt-1">
                Move money from other categories to cover
              </Text>
            </Card>
          </View>
        )}

        {/* Empty state */}
        {(!groupedBudgets || groupedBudgets.length === 0) && !isLoading && (
          <View className="items-center py-20">
            <Text className="text-4xl mb-3">📊</Text>
            <Text className="text-base font-medium text-muted-foreground">
              Budget will appear here
            </Text>
            <Text className="text-sm text-surface-700 mt-1 text-center px-8">
              Add accounts and income to start budgeting
            </Text>
          </View>
        )}

        <View className="h-20" />
      </ScrollView>

      {/* Assign Money Modal */}
      {assignTarget && userId && (
        <Modal
          visible={true}
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
