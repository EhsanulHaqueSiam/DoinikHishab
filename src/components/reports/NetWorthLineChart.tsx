import { Text, View } from "react-native";
import { LineChart } from "react-native-gifted-charts";
import { useTranslation } from "react-i18next";
import { formatCurrency } from "../../lib/currency";
import { shadow } from "../../lib/platform";
import type { MonthlyReportData } from "./report-types";

interface NetWorthLineChartProps {
  data: MonthlyReportData[];
}

function formatMonth(month: string): string {
  const [year, m] = month.split("-");
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  return `${months[Number.parseInt(m, 10) - 1]} '${year.slice(2)}`;
}

export function NetWorthLineChart({ data }: NetWorthLineChartProps) {
  const { t } = useTranslation();

  if (data.length === 0) {
    return (
      <View className="items-center py-8">
        <Text className="text-muted-foreground text-sm">
          {t("reports.noData")}
        </Text>
      </View>
    );
  }

  const currentValue = data[data.length - 1].netWorth;
  const firstValue = data[0].netWorth;
  const trend = currentValue >= firstValue ? "up" : "down";
  const trendDiff = currentValue - firstValue;

  // Convert to gifted-charts data points (value in taka)
  const lineData = data.map((d) => ({
    value: d.netWorth / 100,
    label: formatMonth(d.month),
    dataPointText: "",
  }));

  return (
    <View
      className="gap-4 rounded-2xl p-4 border border-accent-300/10"
      style={shadow("#e6a444", 0, 4, 0.08, 16, 4)}
    >
      {/* Current net worth & trend */}
      <View className="flex-row items-baseline justify-between">
        <View>
          <Text className="text-2xs uppercase font-bold text-muted-foreground tracking-wider">
            {t("reports.netWorth")}
          </Text>
          <Text
            className={`text-xl font-bold ${
              currentValue >= 0 ? "text-foreground" : "text-danger"
            }`}
          >
            {formatCurrency(currentValue)}
          </Text>
        </View>
        <View className="items-end">
          <Text
            className={`text-sm font-semibold ${
              trend === "up" ? "text-green-500" : "text-red-500"
            }`}
          >
            {trend === "up" ? "+" : ""}
            {formatCurrency(trendDiff)}
          </Text>
          <Text className="text-xs text-muted-foreground">
            {trend === "up" ? t("reports.trendUp") : t("reports.trendDown")}
          </Text>
        </View>
      </View>

      {/* Area chart with gradient */}
      <LineChart
        areaChart
        curved
        isAnimated
        animationDuration={800}
        data={lineData}
        color="#14b8a6"
        thickness={2}
        startFillColor="#0d9488"
        startOpacity={0.3}
        endFillColor="transparent"
        endOpacity={0}
        dataPointsColor="#14b8a6"
        dataPointsRadius={4}
        noOfSections={4}
        yAxisTextStyle={{ color: "#6b83a3", fontSize: 10 }}
        xAxisColor="#1e2a3a"
        yAxisColor="#1e2a3a"
        backgroundColor="transparent"
        hideRules
        xAxisLabelTextStyle={{ color: "#6b83a3", fontSize: 9 }}
      />
    </View>
  );
}
