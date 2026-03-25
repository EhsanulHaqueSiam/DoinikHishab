import { Text, View } from "react-native";
import { formatCurrency } from "../../lib/currency";

interface CategorySpending {
  name: string;
  total: number;
  percentage: number;
  color?: string;
  icon?: string;
}

interface SpendingChartProps {
  categories: CategorySpending[];
  grandTotal: number;
}

const DEFAULT_COLORS = [
  "#3B82F6", // blue
  "#EF4444", // red
  "#10B981", // green
  "#F59E0B", // amber
  "#8B5CF6", // violet
  "#EC4899", // pink
  "#06B6D4", // cyan
  "#F97316", // orange
];

export function SpendingChart({ categories, grandTotal }: SpendingChartProps) {
  if (categories.length === 0) {
    return (
      <View className="items-center py-8">
        <Text className="text-muted-foreground text-sm">No spending data yet</Text>
      </View>
    );
  }

  const maxTotal = Math.max(...categories.map((c) => c.total));

  return (
    <View className="gap-3">
      <View className="flex-row items-baseline justify-between mb-2">
        <Text className="text-sm font-medium text-muted-foreground">Total Spending</Text>
        <Text className="text-lg font-bold text-foreground">{formatCurrency(grandTotal)}</Text>
      </View>

      {categories.map((category, categoryIndex) => {
        const barColor = category.color ?? DEFAULT_COLORS[categoryIndex % DEFAULT_COLORS.length];
        const widthPercent = maxTotal > 0 ? (category.total / maxTotal) * 100 : 0;

        return (
          <View key={category.name} className="gap-1">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-2 flex-1">
                {category.icon && <Text className="text-sm">{category.icon}</Text>}
                <Text className="text-sm font-medium text-foreground" numberOfLines={1}>
                  {category.name}
                </Text>
              </View>
              <View className="flex-row items-center gap-2">
                <Text className="text-xs text-muted-foreground">
                  {category.percentage.toFixed(1)}%
                </Text>
                <Text className="text-sm font-semibold text-foreground w-24 text-right">
                  {formatCurrency(category.total)}
                </Text>
              </View>
            </View>

            {/* Bar */}
            <View className="h-3 rounded-full bg-muted overflow-hidden">
              <View
                className="h-full rounded-full"
                style={{
                  width: `${Math.max(widthPercent, 2)}%`,
                  backgroundColor: barColor,
                }}
              />
            </View>
          </View>
        );
      })}
    </View>
  );
}
