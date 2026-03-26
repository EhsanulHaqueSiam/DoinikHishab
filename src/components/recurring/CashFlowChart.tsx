import React from "react";
import { Text, useWindowDimensions, View } from "react-native";
import { LineChartBicolor } from "react-native-gifted-charts";
import { useTranslation } from "../../lib/i18n";

interface CashFlowChartProps {
  data: { date: string; value: number }[];
  horizon: 30 | 60 | 90;
}

/** Format a date string "YYYY-MM-DD" to "Mar 28" short format */
function formatShortDate(dateStr: string): string {
  const d = new Date(dateStr);
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  return `${months[d.getMonth()]} ${d.getDate()}`;
}

export function CashFlowChart({ data, horizon }: CashFlowChartProps) {
  const { t } = useTranslation();
  const { width: screenWidth } = useWindowDimensions();

  // Empty state
  if (!data || data.length < 2) {
    return (
      <View
        className="mx-4 rounded-2xl p-4 bg-surface-200 border border-surface-600/10 items-center justify-center py-12"
        testID="cash-flow-empty"
      >
        <Text className="text-sm font-bold text-surface-900 mt-3">
          {t("recurring.noForecastTitle")}
        </Text>
        <Text className="text-2xs text-surface-800 mt-1 text-center px-8">
          {t("recurring.noForecastBody")}
        </Text>
      </View>
    );
  }

  // Convert paisa to taka for display
  const chartData = data.map((point, idx) => {
    const valueTaka = Math.round(point.value / 100);
    // Show label every 7th day to avoid crowding
    const label = idx % 7 === 0 ? formatShortDate(point.date) : "";
    return { value: valueTaka, label };
  });

  // Calculate min/max for axis configuration
  const values = chartData.map((d) => d.value);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);

  // Step size for Y axis
  const range = maxValue - Math.min(minValue, 0);
  const stepValue = Math.max(Math.ceil(range / 5 / 1000) * 1000, 1000);

  // Negative axis sections
  const noOfSectionsBelowXAxis = minValue < 0 ? Math.ceil(Math.abs(minValue) / stepValue) : 0;
  const mostNegativeValue = minValue < 0 ? minValue : 0;

  // Chart width = screen width minus container padding (mx-4 = 16px each side) minus internal padding (p-4 = 16px each side)
  const chartWidth = screenWidth - 64 - 50; // 50px for Y-axis labels

  return (
    <View className="mx-4 rounded-2xl p-4 bg-surface-200 border border-surface-600/10">
      <View testID="cash-flow-chart">
        <LineChartBicolor
          testID="line-chart-bicolor"
          areaChart
          data={chartData}
          width={Math.max(chartWidth, 200)}
          height={200}
          color="#14b8a6"
          colorNegative="#f87171"
          startFillColor="#0d9488"
          startFillColorNegative="#f87171"
          startOpacity={0.3}
          startOpacityNegative={0.3}
          endFillColor="transparent"
          endFillColorNegative="transparent"
          showReferenceLine1
          referenceLine1Position={0}
          referenceLine1Config={{
            color: "#3b4d63",
            dashWidth: 4,
            dashGap: 4,
          }}
          noOfSectionsBelowXAxis={noOfSectionsBelowXAxis}
          mostNegativeValue={mostNegativeValue}
          stepValue={stepValue}
          noOfSections={Math.max(Math.ceil(maxValue / stepValue), 1)}
          xAxisColor="#1e2a3a"
          yAxisColor="#1e2a3a"
          xAxisLabelTextStyle={{
            color: "#6b83a3",
            fontSize: 8,
          }}
          yAxisTextStyle={{
            color: "#6b83a3",
            fontSize: 9,
          }}
          spacing={Math.max(Math.floor(chartWidth / data.length), 3)}
          thickness={2}
          hideDataPoints
          initialSpacing={8}
          adjustToWidth
        />
      </View>

      {/* Estimated label */}
      <Text className="text-2xs text-surface-800 italic mt-2 text-center" testID="estimated-label">
        {t("recurring.estimated")}
      </Text>
    </View>
  );
}
