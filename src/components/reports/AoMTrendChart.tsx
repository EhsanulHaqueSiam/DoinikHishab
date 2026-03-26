import { Text, View } from "react-native";
import { LineChart } from "react-native-gifted-charts";
import { useTranslation } from "react-i18next";
import type { MonthlyReportData } from "./report-types";

interface AoMTrendChartProps {
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

export function AoMTrendChart({ data }: AoMTrendChartProps) {
  const { t } = useTranslation();

  // Filter to entries with ageOfMoney data
  const aomData = data.filter((d) => d.ageOfMoney != null);

  if (aomData.length === 0) {
    return (
      <View className="items-center py-8">
        <Text className="text-muted-foreground text-sm">
          {t("reports.noData")}
        </Text>
      </View>
    );
  }

  const currentAoM = aomData[aomData.length - 1].ageOfMoney;
  const previousAoM =
    aomData.length > 1 ? aomData[aomData.length - 2].ageOfMoney : null;

  const trend =
    currentAoM != null && previousAoM != null
      ? currentAoM > previousAoM
        ? "improving"
        : currentAoM < previousAoM
          ? "declining"
          : "flat"
      : null;

  // Convert to line data
  const lineData = aomData.map((d) => ({
    value: d.ageOfMoney ?? 0,
    label: formatMonthShort(d.month),
  }));

  // Calculate max for y-axis (at least 40, or max AoM + 10)
  const maxAoM = Math.max(...aomData.map((d) => d.ageOfMoney ?? 0));
  const maxValue = Math.max(maxAoM + 10, 40);

  // Determine AoM value color: teal if above 30, default otherwise
  const valueColor =
    currentAoM != null && currentAoM >= 30
      ? "text-primary"
      : "text-foreground";

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
    <View className="gap-3 rounded-2xl p-4 border border-primary-400/15">
      {/* Header */}
      <View className="flex-row items-baseline justify-between">
        <View>
          <Text className="text-2xs uppercase font-bold text-muted-foreground tracking-wider">
            {t("reports.ageOfMoney")}
          </Text>
          <View className="flex-row items-baseline gap-1">
            <Text className={`text-xl font-bold ${valueColor}`}>
              {currentAoM != null ? `${currentAoM}` : "--"}
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

      {/* Area chart with 30-day reference line */}
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
        dataPointsRadius={3}
        maxValue={maxValue}
        noOfSections={4}
        showReferenceLine1
        referenceLine1Position={30}
        referenceLine1Config={{
          color: "#4e6381",
          dashWidth: 4,
          dashGap: 4,
          labelText: t("reports.thirtyDays"),
          labelTextStyle: { color: "#4e6381", fontSize: 10 },
        }}
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
