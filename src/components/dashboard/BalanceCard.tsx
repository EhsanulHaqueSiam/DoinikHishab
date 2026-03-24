import React from "react";
import { View, Text } from "react-native";
import { Card } from "../ui/Card";
import { formatCurrency } from "../../lib/currency";

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
    <Card
      className="mx-4 mt-4 border-primary-200/20"
      style={{
        shadowColor: "#0d9488",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
        elevation: 8,
      }}
    >
      <Text className="text-sm text-muted-foreground font-medium tracking-wider uppercase">
        Total Balance
      </Text>
      <Text className="text-3xl font-bold text-foreground mt-1">
        {formatCurrency(totalBalance)}
      </Text>

      <View className="flex-row mt-4 gap-4">
        <View className="flex-1">
          <Text className="text-xs text-muted-foreground tracking-wider uppercase">
            Budget
          </Text>
          <Text className="text-lg font-semibold text-primary-700">
            {formatCurrency(budgetBalance)}
          </Text>
        </View>
        <View className="w-px bg-border/50" />
        <View className="flex-1">
          <Text className="text-xs text-muted-foreground tracking-wider uppercase">
            Tracking
          </Text>
          <Text className="text-lg font-semibold text-muted-foreground">
            {formatCurrency(trackingBalance)}
          </Text>
        </View>
      </View>
    </Card>
  );
}
