import { Text, View } from "react-native";
import { LineChart } from "react-native-gifted-charts";
import { useTranslation } from "react-i18next";
import type { MonthlyReportData } from "./report-types";

interface DoBTrendChartProps {
  data: MonthlyReportData[];
}

function formatMonthShort(month: string): string {
  const [, m] = month.split("-");
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  return months[Number.parseInt(m, 10) - 1];
}

export function DoBTrendChart({ data }: DoBTrendChartProps) {
  const { t } = useTranslation();

  // Filter to entries with daysOfBuffering data
  const dobData = data.filter((d) => d.daysOfBuffering != null);

  if (dobData.length === 0) {
    return (
      <View className="items-center py-8">
        <Text className="text-muted-foreground text-sm">
          {t("reports.noData")}
        </Text>
      </View>
    );
  }

  const currentDoB = dobData[dobData.length - 1].daysOfBuffering;
  const previousDoB =
    dobData.length > 1 ? dobData[dobData.length - 2].daysOfBuffering : null;

  const trend =
    currentDoB != null && previousDoB != null
      ? currentDoB > previousDoB
        ? "improving"
        : currentDoB < previousDoB
          ? "declining"
          : "flat"
      : null;

  // Convert to line data
  const lineData = dobData.map((d) => ({
    value: d.daysOfBuffering ?? 0,
    label: formatMonthShort(d.month),
  }));

  // Calculate max for y-axis
  const maxDoB = Math.max(...dobData.map((d) => d.daysOfBuffering ?? 0));
  const maxValue = Math.max(maxDoB + 10, 40);

  // Trend indicator
  const trendArrow =
    trend === "improving" ? " ^" : trend === "declining" ? " v" : "";
  const trendColor =
    trend === "improving"
      ? "text-green-500"
      : trend === "declining"
        ? "text-red-500"
        : "text-muted-foreground";

  return (
    <View className="gap-3 rounded-2xl p-4 border border-accent-300/10">
      {/* Header */}
      <View className="flex-row items-baseline justify-between">
        <View>
          <Text className="text-2xs uppercase font-bold text-muted-foreground tracking-wider">
            {t("reports.daysOfBuffering")}
          </Text>
          <View className="flex-row items-baseline gap-1">
            <Text className="text-xl font-bold text-foreground">
              {currentDoB != null ? `${currentDoB}` : "--"}
            </Text>
            <Text className="text-sm text-muted-foreground">
              {t("reports.days")}
            </Text>
          </View>
        </View>
        {trend && (
          <Text className={`text-sm font-semibold ${trendColor}`}>
            {t(`reports.${trend}`)}
            {trendArrow}
          </Text>
        )}
      </View>

      {/* Area chart with saffron accent - NO reference line */}
      <LineChart
        areaChart
        curved
        isAnimated
        animationDuration={800}
        data={lineData}
        color="#edb85c"
        thickness={2}
        startFillColor="#e6a444"
        startOpacity={0.25}
        endFillColor="transparent"
        endOpacity={0}
        dataPointsColor="#edb85c"
        dataPointsRadius={3}
        maxValue={maxValue}
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
