import React from "react";
import { View, Text } from "react-native";
import { Card } from "../ui/Card";
import { formatCurrency } from "../../lib/currency";

interface BalanceCardProps {
  totalBalance: number; // paisa
  budgetBalance: number;
  trackingBalance: number;
}

export function BalanceCard({
  totalBalance,
  budgetBalance,
  trackingBalance,
}: BalanceCardProps) {
  return (
    <Card className="mx-4 mt-4">
      <Text className="text-sm text-muted-foreground font-medium">
        Total Balance
      </Text>
      <Text className="text-3xl font-bold text-foreground mt-1">
        {formatCurrency(totalBalance)}
      </Text>

      <View className="flex-row mt-4 gap-4">
        <View className="flex-1">
          <Text className="text-xs text-muted-foreground">Budget</Text>
          <Text className="text-lg font-semibold text-foreground">
            {formatCurrency(budgetBalance)}
          </Text>
        </View>
        <View className="w-px bg-border" />
        <View className="flex-1">
          <Text className="text-xs text-muted-foreground">Tracking</Text>
          <Text className="text-lg font-semibold text-muted-foreground">
            {formatCurrency(trackingBalance)}
          </Text>
        </View>
      </View>
    </Card>
  );
}
