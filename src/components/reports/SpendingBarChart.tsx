import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { Text, View } from "react-native";
import { BarChart } from "react-native-gifted-charts";
import { formatCurrency } from "../../lib/currency";
import { ChartTooltip } from "./ChartTooltip";
import type { CategorySpendingData } from "./report-types";
import { DEFAULT_CHART_COLORS } from "./report-types";

interface SpendingBarChartProps {
  categories: CategorySpendingData[];
  totalSpending: number; // paisa
}

export function SpendingBarChart({ categories, totalSpending }: SpendingBarChartProps) {
  const { t } = useTranslation();
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);

  const handleDismissTooltip = useCallback(() => {
    setFocusedIndex(null);
  }, []);

  if (categories.length === 0) {
    return (
      <View className="items-center py-8">
        <Text className="text-muted-foreground text-sm">{t("reports.noData")}</Text>
      </View>
    );
  }

  // Sort descending by total, take top 10
  const sorted = [...categories].sort((a, b) => b.total - a.total).slice(0, 10);

  // Convert to gifted-charts format (amounts in taka for display)
  const barData = sorted.map((cat, index) => ({
    value: cat.total / 100, // paisa to taka
    label: cat.name.length > 8 ? `${cat.name.slice(0, 8)}..` : cat.name,
    frontColor: cat.color || DEFAULT_CHART_COLORS[index % DEFAULT_CHART_COLORS.length],
    onPress: () => setFocusedIndex(index),
    topLabelComponent: () => (
      <Text className="text-2xs text-muted-foreground ml-1">{formatCurrency(cat.total)}</Text>
    ),
    accessibilityLabel: `${cat.name}, ${formatCurrency(cat.total)}, ${cat.percentage.toFixed(1)}%`,
  }));

  const focusedCat = focusedIndex !== null ? sorted[focusedIndex] : null;

  return (
    <View className="gap-3">
      {/* Header: total spending */}
      <View className="flex-row items-baseline justify-between mb-2">
        <Text className="text-sm font-medium text-muted-foreground">
          {t("reports.totalSpending")}
        </Text>
        <Text className="text-xl font-bold text-danger">{formatCurrency(totalSpending)}</Text>
      </View>

      {/* Tooltip when a bar is focused */}
      {focusedCat && (
        <ChartTooltip
          label={focusedCat.name}
          amount={focusedCat.total}
          percentage={focusedCat.percentage}
          onDismiss={handleDismissTooltip}
        />
      )}

      {/* Horizontal bar chart */}
      <BarChart
        horizontal
        data={barData}
        barWidth={24}
        spacing={8}
        barBorderRadius={4}
        isAnimated
        animationDuration={600}
        noOfSections={4}
        yAxisTextStyle={{ color: "#6b83a3", fontSize: 10 }}
        xAxisColor="#1e2a3a"
        yAxisColor="#1e2a3a"
        backgroundColor="transparent"
        hideRules
        xAxisLabelTextStyle={{ color: "#6b83a3", fontSize: 10 }}
      />
    </View>
  );
}
