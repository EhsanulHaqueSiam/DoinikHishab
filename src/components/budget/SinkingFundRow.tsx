import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, Text, View } from "react-native";
import Animated, { Easing, useAnimatedStyle, withTiming } from "react-native-reanimated";
import { formatCurrency } from "../../lib/currency";
import { calculateSinkingFundSuggest } from "../../services/budget-engine";
import type { SinkingFundTemplate } from "../../services/mock-data";

interface SinkingFundRowProps {
  template: SinkingFundTemplate;
  accumulated: number;
  targetAmount: number;
  monthsRemaining: number;
  onPress?: () => void;
}

type SinkingFundStatus = "on_track" | "behind" | "funded";

export function SinkingFundRow({
  template,
  accumulated,
  targetAmount,
  monthsRemaining,
  onPress,
}: SinkingFundRowProps) {
  const { t } = useTranslation();

  const progress = targetAmount > 0 ? Math.min(accumulated / targetAmount, 1) : 0;
  const percentage = Math.round(progress * 100);

  // Determine status: funded if >= 100%, on track if >= expected fraction, behind otherwise
  const elapsedMonths = Math.max(template.defaultMonths - monthsRemaining, 0);
  const expectedProgress = template.defaultMonths > 0 ? elapsedMonths / template.defaultMonths : 0;

  const status: SinkingFundStatus =
    progress >= 1 ? "funded" : progress >= expectedProgress ? "on_track" : "behind";

  const suggestAmount = useMemo(
    () => calculateSinkingFundSuggest(targetAmount, accumulated, monthsRemaining),
    [targetAmount, accumulated, monthsRemaining]
  );

  const fundName = t(template.nameKey as any);

  const statusConfig: Record<
    SinkingFundStatus,
    { label: string; color: string; barColor: string }
  > = {
    funded: {
      label: t("sinkingFunds.funded" as any),
      color: "text-primary-700",
      barColor: "bg-primary-500",
    },
    on_track: {
      label: t("sinkingFunds.onTrack" as any),
      color: "text-success",
      barColor: "bg-primary-500",
    },
    behind: {
      label: t("sinkingFunds.behind" as any),
      color: "text-warning",
      barColor: "bg-accent",
    },
  };

  const config = statusConfig[status];

  const progressStyle = useAnimatedStyle(() => ({
    width: withTiming(`${percentage}%`, {
      duration: 600,
      easing: Easing.out(Easing.ease),
    }),
  }));

  const accessibilityLabel = `${fundName}, ${percentage}% ${t("sinkingFunds.ofTarget" as any)}, ${config.label}`;

  return (
    <Pressable
      onPress={onPress}
      className="active:bg-surface-400/30 px-3 py-2.5"
      style={{ minHeight: 56 }}
      accessibilityLabel={accessibilityLabel}
    >
      {/* Top row: name + status */}
      <View className="flex-row items-center justify-between mb-1.5">
        <Text
          className="text-sm font-bold text-foreground flex-1 mr-2"
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {fundName}
        </Text>
        <Text className={`text-2xs font-bold ${config.color}`}>{config.label}</Text>
      </View>

      {/* Progress bar */}
      <View className="h-2 bg-surface-400 rounded-full overflow-hidden">
        <Animated.View className={`h-2 rounded-full ${config.barColor}`} style={progressStyle} />
      </View>

      {/* Bottom row: suggested + amounts */}
      <View className="flex-row items-center justify-between mt-1.5">
        <Text className="text-2xs text-surface-800">
          {t("sinkingFunds.suggested" as any, { amount: formatCurrency(suggestAmount) })}
        </Text>
        <Text className="text-2xs text-surface-800">
          {formatCurrency(accumulated)} of {formatCurrency(targetAmount)}
        </Text>
      </View>
    </Pressable>
  );
}
