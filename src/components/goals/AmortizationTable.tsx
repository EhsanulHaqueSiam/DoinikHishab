import React, { useState } from "react";
import { Pressable, Text, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import { useTranslation } from "../../lib/i18n";
import { formatCurrency } from "../../lib/currency";
import type { AmortizationRow } from "../../services/goal-storage/types";

interface AmortizationTableProps {
  rows: AmortizationRow[];
  isExpanded: boolean;
}

const INITIAL_ROWS = 6;

export function AmortizationTable({ rows, isExpanded }: AmortizationTableProps) {
  const { t } = useTranslation();
  const [showAll, setShowAll] = useState(false);

  const visibleRows = showAll ? rows : rows.slice(0, INITIAL_ROWS);
  const hasMore = rows.length > INITIAL_ROWS;

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: withTiming(isExpanded ? 1 : 0, {
      duration: 300,
      easing: Easing.out(Easing.ease),
    }),
    maxHeight: withTiming(isExpanded ? 9999 : 0, {
      duration: 300,
      easing: Easing.out(Easing.ease),
    }),
  }));

  if (!isExpanded) return null;

  return (
    <Animated.View style={animatedStyle} className="mt-3">
      {/* Table headers */}
      <View className="flex-row px-2 pb-1.5 border-b border-border/30">
        <Text className="flex-1 text-2xs font-bold uppercase tracking-wider text-surface-900">
          {t("goals.colMonth" as any)}
        </Text>
        <Text className="flex-1 text-2xs font-bold uppercase tracking-wider text-surface-900 text-right">
          {t("goals.colPayment" as any)}
        </Text>
        <Text className="flex-1 text-2xs font-bold uppercase tracking-wider text-surface-900 text-right">
          {t("goals.colPrincipal" as any)}
        </Text>
        <Text className="flex-1 text-2xs font-bold uppercase tracking-wider text-surface-900 text-right">
          {t("goals.colInterest" as any)}
        </Text>
        <Text className="flex-1 text-2xs font-bold uppercase tracking-wider text-surface-900 text-right">
          {t("goals.colBalance" as any)}
        </Text>
      </View>

      {/* Table rows */}
      {visibleRows.map((row) => (
        <View
          key={row.month}
          className="flex-row px-2 py-1.5 border-b border-border/15"
        >
          <Text className="flex-1 text-2xs text-surface-800">
            {row.month}
          </Text>
          <Text className="flex-1 text-2xs text-surface-800 text-right">
            {formatCurrency(row.payment)}
          </Text>
          <Text className="flex-1 text-2xs text-surface-800 text-right">
            {formatCurrency(row.principal)}
          </Text>
          <Text className="flex-1 text-2xs text-surface-800 text-right">
            {formatCurrency(row.interest)}
          </Text>
          <Text className="flex-1 text-2xs text-surface-800 text-right">
            {formatCurrency(row.balance)}
          </Text>
        </View>
      ))}

      {/* Show more */}
      {hasMore && !showAll && (
        <Pressable
          className="py-2 items-center"
          onPress={() => setShowAll(true)}
        >
          <Text className="text-xs font-bold text-primary-500">
            {t("goals.showMore" as any)}
          </Text>
        </Pressable>
      )}
    </Animated.View>
  );
}
