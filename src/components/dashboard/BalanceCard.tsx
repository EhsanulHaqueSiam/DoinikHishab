import React from "react";
import { View, Text } from "react-native";
import { formatCurrency } from "../../lib/currency";
import { shadow } from "../../lib/platform";

interface BalanceCardProps {
  totalBalance: number;
  budgetBalance: number;
  trackingBalance: number;
}

export function BalanceCard({
  totalBalance,
  budgetBalance,
  trackingBalance,
}: BalanceCardProps) {
  return (
    <View
      className="mx-4 mt-4 rounded-2xl p-5 bg-surface-200 border border-primary-400/15"
      style={shadow("#0d9488", 0, 8, 0.12, 24, 8)}
    >
      {/* Total */}
      <Text className="text-2xs font-semibold text-surface-900 uppercase tracking-widest">
        Total Balance
      </Text>
      <Text
        className="text-hero font-bold text-foreground mt-1 tracking-tight"
        style={{ lineHeight: 42 }}
      >
        {formatCurrency(totalBalance)}
      </Text>

      {/* Divider */}
      <View className="h-px bg-border/30 my-4" />

      {/* Split */}
      <View className="flex-row gap-6">
        <View className="flex-1">
          <Text className="text-2xs font-semibold text-surface-800 uppercase tracking-widest">
            Budget
          </Text>
          <Text className="text-lg font-bold text-primary-700 mt-0.5">
            {formatCurrency(budgetBalance)}
          </Text>
        </View>
        <View className="w-px bg-border/30" />
        <View className="flex-1">
          <Text className="text-2xs font-semibold text-surface-800 uppercase tracking-widest">
            Tracking
          </Text>
          <Text className="text-lg font-bold text-surface-900 mt-0.5">
            {formatCurrency(trackingBalance)}
          </Text>
        </View>
      </View>
    </View>
  );
}
