import React, { useMemo } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useAppStore } from "../../src/stores/app-store";
import { Card } from "../../src/components/ui/Card";
import { formatCurrency } from "../../src/lib/currency";
import {
  getMonthLabel,
  previousMonth,
  nextMonth,
} from "../../src/lib/date";

export default function BudgetScreen() {
  const { userId, currentMonth, setCurrentMonth } = useAppStore();

  const categories = useQuery(
    api.categories.listCategories,
    userId ? { userId } : "skip"
  );

  const groups = useQuery(
    api.categories.listGroups,
    userId ? { userId } : "skip"
  );

  const budgets = useQuery(
    api.budgets.getByMonth,
    userId ? { userId, month: currentMonth } : "skip"
  );

  // Calculate Ready to Assign (simplified for Phase 1)
  const readyToAssign = useMemo(() => {
    if (!budgets) return 0;
    // This will be computed properly in Phase 2
    return 0;
  }, [budgets]);

  const expenseGroups = useMemo(() => {
    if (!groups || !categories) return [];
    return groups
      .filter((g) => {
        const cats = categories.filter(
          (c) => c.groupId === g._id && c.type === "expense" && !c.isHidden
        );
        return cats.length > 0;
      })
      .map((g) => ({
        ...g,
        categories: categories
          .filter(
            (c) => c.groupId === g._id && c.type === "expense" && !c.isHidden
          )
          .map((c) => {
            const budget = budgets?.find((b) => b.categoryId === c._id);
            return {
              ...c,
              assigned: budget?.assigned ?? 0,
              activity: budget?.activity ?? 0,
              available: budget?.available ?? 0,
            };
          }),
      }));
  }, [groups, categories, budgets]);

  return (
    <View className="flex-1 bg-background">
      {/* Month Navigator */}
      <View className="flex-row items-center justify-between px-4 py-3 bg-white border-b border-border">
        <Pressable onPress={() => setCurrentMonth(previousMonth(currentMonth))}>
          <Text className="text-primary-600 font-semibold text-lg">←</Text>
        </Pressable>
        <Text className="text-base font-bold text-foreground">
          {getMonthLabel(currentMonth)}
        </Text>
        <Pressable onPress={() => setCurrentMonth(nextMonth(currentMonth))}>
          <Text className="text-primary-600 font-semibold text-lg">→</Text>
        </Pressable>
      </View>

      {/* Ready to Assign */}
      <View className="mx-4 mt-4">
        <Card
          className={`items-center py-4 ${
            readyToAssign >= 0 ? "bg-success/10" : "bg-danger/10"
          }`}
        >
          <Text className="text-sm text-muted-foreground font-medium">
            Ready to Assign
          </Text>
          <Text
            className={`text-2xl font-bold mt-1 ${
              readyToAssign >= 0 ? "text-success" : "text-danger"
            }`}
          >
            {formatCurrency(readyToAssign)}
          </Text>
        </Card>
      </View>

      {/* Budget Grid */}
      <ScrollView className="flex-1 mt-4" showsVerticalScrollIndicator={false}>
        {/* Column Headers */}
        <View className="flex-row px-4 py-2 border-b border-border">
          <Text className="flex-1 text-xs font-semibold text-muted-foreground uppercase">
            Category
          </Text>
          <Text className="w-20 text-xs font-semibold text-muted-foreground uppercase text-right">
            Assigned
          </Text>
          <Text className="w-20 text-xs font-semibold text-muted-foreground uppercase text-right">
            Activity
          </Text>
          <Text className="w-20 text-xs font-semibold text-muted-foreground uppercase text-right">
            Available
          </Text>
        </View>

        {expenseGroups.map((group) => (
          <View key={group._id} className="mb-2">
            {/* Group Header */}
            <View className="flex-row px-4 py-2.5 bg-muted/50">
              <Text className="flex-1 text-sm font-bold text-foreground">
                {group.name}
              </Text>
              <Text className="w-20 text-xs font-medium text-muted-foreground text-right">
                {formatCurrency(
                  group.categories.reduce((s, c) => s + c.assigned, 0)
                )}
              </Text>
              <Text className="w-20 text-xs font-medium text-muted-foreground text-right">
                {formatCurrency(
                  group.categories.reduce((s, c) => s + c.activity, 0)
                )}
              </Text>
              <Text className="w-20 text-xs font-medium text-muted-foreground text-right">
                {formatCurrency(
                  group.categories.reduce((s, c) => s + c.available, 0)
                )}
              </Text>
            </View>

            {/* Category Rows */}
            {group.categories.map((cat) => (
              <View
                key={cat._id}
                className="flex-row items-center px-4 py-3 bg-white border-b border-border/30"
              >
                <Text
                  className="flex-1 text-sm text-foreground"
                  numberOfLines={1}
                >
                  {cat.name}
                </Text>
                <Text className="w-20 text-sm text-foreground text-right">
                  {cat.assigned === 0 ? "—" : formatCurrency(cat.assigned)}
                </Text>
                <Text
                  className={`w-20 text-sm text-right ${
                    cat.activity < 0 ? "text-danger" : "text-muted-foreground"
                  }`}
                >
                  {cat.activity === 0 ? "—" : formatCurrency(cat.activity)}
                </Text>
                <Text
                  className={`w-20 text-sm font-medium text-right ${
                    cat.available < 0
                      ? "text-danger"
                      : cat.available > 0
                        ? "text-success"
                        : "text-muted-foreground"
                  }`}
                >
                  {cat.available === 0 ? "—" : formatCurrency(cat.available)}
                </Text>
              </View>
            ))}
          </View>
        ))}

        {/* Empty state */}
        {expenseGroups.length === 0 && (
          <View className="items-center py-20">
            <Text className="text-4xl mb-3">📊</Text>
            <Text className="text-base font-medium text-muted-foreground">
              Budget will appear here
            </Text>
            <Text className="text-sm text-muted-foreground mt-1 text-center px-8">
              Add accounts and transactions to start budgeting
            </Text>
          </View>
        )}

        <View className="h-20" />
      </ScrollView>
    </View>
  );
}
