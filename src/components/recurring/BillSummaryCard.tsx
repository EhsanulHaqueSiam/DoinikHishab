import React from "react";
import { View, Text } from "react-native";
import { formatCurrency } from "../../lib/currency";
import { shadow } from "../../lib/platform";
import { useTranslation } from "../../lib/i18n";

interface BillSummaryCardProps {
  upcomingTotal: number; // paisa
  paidTotal: number; // paisa
  billCount: number;
}

export function BillSummaryCard({
  upcomingTotal,
  paidTotal,
  billCount,
}: BillSummaryCardProps) {
  const { t } = useTranslation();

  return (
    <View
      className="mx-4 mt-4 rounded-2xl p-5 bg-surface-200 border border-primary-400/15"
      style={shadow("#0d9488", 0, 8, 0.12, 24, 8)}
    >
      {/* Upcoming Bills Total */}
      <Text className="text-2xs font-semibold text-surface-900 uppercase tracking-widest">
        {t("recurring.upcomingBills")}
      </Text>
      <Text
        className="text-hero font-bold text-foreground mt-1 tracking-tight"
        style={{ lineHeight: 42 }}
      >
        {formatCurrency(upcomingTotal)}
      </Text>

      {/* Divider */}
      <View className="h-px bg-border/30 my-4" />

      {/* Paid + Bill Count */}
      <View className="flex-row gap-6">
        <View className="flex-1">
          <Text className="text-2xs font-semibold text-surface-800 uppercase tracking-widest">
            {t("recurring.paid")}
          </Text>
          <Text className="text-lg font-bold text-primary-700 mt-0.5">
            {formatCurrency(paidTotal)}
          </Text>
        </View>
        <View className="w-px bg-border/30" />
        <View className="flex-1">
          <Text className="text-2xs font-semibold text-surface-800 uppercase tracking-widest">
            {t("recurring.count")}
          </Text>
          <Text className="text-lg font-bold text-surface-900 mt-0.5">
            {billCount}
          </Text>
        </View>
      </View>
    </View>
  );
}
