import { Text, View } from "react-native";
import { formatCurrency } from "../../lib/currency";
import { Card } from "../ui/Card";

interface CategorySpending {
  name: string;
  total: number;
  percentage: number;
  color?: string;
}

interface DashboardSpendingChartProps {
  categories: CategorySpending[];
  grandTotal: number;
}

const COMPACT_COLORS = ["#3B82F6", "#EF4444", "#10B981", "#F59E0B", "#8B5CF6"];

export function DashboardSpendingChart({ categories, grandTotal }: DashboardSpendingChartProps) {
  // Show top 5 only
  const top5 = categories.slice(0, 5);

  if (top5.length === 0) {
    return null;
  }

  const maxTotal = Math.max(...top5.map((c) => c.total));

  return (
    <Card className="mx-4 mt-3">
      <View className="flex-row items-baseline justify-between mb-3">
        <Text className="text-sm font-medium text-muted-foreground">This Month</Text>
        <Text className="text-base font-bold text-foreground">{formatCurrency(grandTotal)}</Text>
      </View>

      <View className="gap-2">
        {top5.map((category, categoryIndex) => {
          const barColor = category.color ?? COMPACT_COLORS[categoryIndex % COMPACT_COLORS.length];
          const widthPercent = maxTotal > 0 ? (category.total / maxTotal) * 100 : 0;

          return (
            <View key={category.name} className="gap-0.5">
              <View className="flex-row items-center justify-between">
                <Text className="text-xs text-foreground flex-1" numberOfLines={1}>
                  {category.name}
                </Text>
                <Text className="text-xs text-muted-foreground ml-2">
                  {category.percentage.toFixed(0)}%
                </Text>
              </View>
              <View className="h-2 rounded-full bg-muted overflow-hidden">
                <View
                  className="h-full rounded-full"
                  style={{
                    width: `${Math.max(widthPercent, 3)}%`,
                    backgroundColor: barColor,
                  }}
                />
              </View>
            </View>
          );
        })}
      </View>
    </Card>
  );
}
