import { Text, View } from "react-native";
import { formatCurrency } from "../../lib/currency";

interface MonthSnapshot {
  month: string; // YYYY-MM
  balance: number; // paisa
}

interface NetWorthChartProps {
  snapshots: MonthSnapshot[];
}

function formatMonth(month: string): string {
  const [year, m] = month.split("-");
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
  return `${months[parseInt(m, 10) - 1]} '${year.slice(2)}`;
}

export function NetWorthChart({ snapshots }: NetWorthChartProps) {
  if (snapshots.length === 0) {
    return (
      <View className="items-center py-8">
        <Text className="text-muted-foreground text-sm">No data available</Text>
      </View>
    );
  }

  const values = snapshots.map((s) => s.balance);
  const maxVal = Math.max(...values, 1);
  const minVal = Math.min(...values, 0);
  const range = maxVal - minVal || 1;
  const BAR_MAX_HEIGHT = 120;

  const first = values[0];
  const last = values[values.length - 1];
  const trend = last >= first ? "up" : "down";
  const trendDiff = last - first;

  return (
    <View className="gap-4">
      {/* Current net worth & trend */}
      <View className="flex-row items-baseline justify-between">
        <View>
          <Text className="text-sm text-muted-foreground">Net Worth</Text>
          <Text className="text-2xl font-bold text-foreground">{formatCurrency(last)}</Text>
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
            {trend === "up" ? "Trending up" : "Trending down"}
          </Text>
        </View>
      </View>

      {/* Bar chart */}
      <View className="flex-row items-end justify-between gap-1" style={{ height: BAR_MAX_HEIGHT }}>
        {snapshots.map((snapshot, index) => {
          const normalizedHeight = ((snapshot.balance - minVal) / range) * BAR_MAX_HEIGHT;
          const barHeight = Math.max(normalizedHeight, 4);
          const isPositive = snapshot.balance >= 0;

          return (
            <View
              key={snapshot.month}
              className="flex-1 items-center justify-end"
              style={{ height: BAR_MAX_HEIGHT }}
            >
              <View
                className={`w-full rounded-t-sm ${
                  isPositive ? "bg-primary" : "bg-red-400"
                } ${index === snapshots.length - 1 ? "opacity-100" : "opacity-60"}`}
                style={{ height: barHeight }}
              />
            </View>
          );
        })}
      </View>

      {/* Month labels */}
      <View className="flex-row justify-between">
        {snapshots.map((snapshot) => (
          <View key={snapshot.month} className="flex-1 items-center">
            <Text className="text-[10px] text-muted-foreground">{formatMonth(snapshot.month)}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}
