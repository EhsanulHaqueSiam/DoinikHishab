import { Minus, Settings, TrendingDown, TrendingUp } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";
import { useMetrics } from "../../hooks/use-metrics";
import { useTranslation } from "../../lib/i18n";
import { shadow } from "../../lib/platform";

interface MetricsCardProps {
  onSettingsPress?: () => void;
}

export function MetricsCard({ onSettingsPress }: MetricsCardProps) {
  const { ageOfMoney, ageOfMoneyTrend, daysOfBuffering } = useMetrics();
  const { t } = useTranslation();

  const trendLabel =
    ageOfMoneyTrend === "improving"
      ? t("metrics.trendImproving")
      : ageOfMoneyTrend === "declining"
        ? t("metrics.trendDeclining")
        : ageOfMoneyTrend === "flat"
          ? t("metrics.trendFlat")
          : "";

  const ageAccessibilityLabel = `${t("metrics.ageOfMoney")}: ${
    ageOfMoney !== null ? `${ageOfMoney} ${t("metrics.days")}` : t("metrics.noDays")
  }${trendLabel ? `, ${trendLabel}` : ""}`;

  return (
    <View
      className="mx-4 mt-3 rounded-2xl p-4 bg-surface-200 border border-primary-400/15"
      style={shadow("#0d9488", 0, 4, 0.08, 16, 4)}
    >
      <View className="flex-row">
        {/* Left Column: Age of Money */}
        <View className="flex-1" accessibilityLabel={ageAccessibilityLabel}>
          <Text className="text-2xs font-bold text-surface-800 uppercase tracking-widest">
            {t("metrics.ageLabel")}
          </Text>
          <View className="flex-row items-center mt-0.5">
            <Text className="text-lg font-bold text-foreground">
              {ageOfMoney !== null ? `${ageOfMoney}` : "--"}{" "}
              <Text className="text-sm font-bold text-surface-800">{t("metrics.days")}</Text>
            </Text>
            {ageOfMoneyTrend === "improving" && (
              <TrendingUp size={14} color="#34d399" style={{ marginLeft: 6 }} />
            )}
            {ageOfMoneyTrend === "declining" && (
              <TrendingDown size={14} color="#f87171" style={{ marginLeft: 6 }} />
            )}
            {ageOfMoneyTrend === "flat" && (
              <Minus size={14} color="#9ca3af" style={{ marginLeft: 6 }} />
            )}
          </View>
          {ageOfMoney === null && (
            <Text className="text-2xs text-surface-700 mt-1">{t("metrics.noAgeDesc")}</Text>
          )}
        </View>

        {/* Vertical Divider */}
        <View className="w-px bg-border/30 mx-3" />

        {/* Right Column: Days of Buffering */}
        <View className="flex-1">
          <View className="flex-row items-center justify-between">
            <Text className="text-2xs font-bold text-surface-800 uppercase tracking-widest">
              {t("metrics.bufferLabel")}
            </Text>
            <Pressable
              onPress={onSettingsPress}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={t("metrics.lookbackSettings")}
              className="active:opacity-60"
            >
              <Settings size={12} color="#9ca3af" />
            </Pressable>
          </View>
          <Text className="text-lg font-bold text-foreground mt-0.5">
            {daysOfBuffering !== null ? `${daysOfBuffering}` : "--"}{" "}
            <Text className="text-sm font-bold text-surface-800">{t("metrics.days")}</Text>
          </Text>
          {daysOfBuffering === null && (
            <Text className="text-2xs text-surface-700 mt-1">{t("metrics.noBufferDesc")}</Text>
          )}
        </View>
      </View>
    </View>
  );
}
