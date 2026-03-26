import React, { useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { formatCurrency } from "../../lib/currency";
import { useTranslation } from "../../lib/i18n";
import { generateAmortization } from "../../services/goal-engine";
import type { PayDownGoal } from "../../services/goal-storage/types";
import { Card } from "../ui/Card";
import { AmortizationTable } from "./AmortizationTable";

interface DebtCardProps {
  debt: PayDownGoal;
  onPress?: () => void;
}

export function DebtCard({ debt, onPress }: DebtCardProps) {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);

  const amortization = useMemo(
    () => generateAmortization(debt.balance, debt.aprPercent, debt.minPayment),
    [debt.balance, debt.aprPercent, debt.minPayment]
  );

  const payoffDate = useMemo(() => {
    if (amortization.length === 0) return "N/A";
    const now = new Date();
    const payoff = new Date(now);
    payoff.setMonth(payoff.getMonth() + amortization.length);
    return payoff.toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
  }, [amortization.length]);

  return (
    <Card className="mb-3">
      <Pressable
        onPress={onPress}
        className="active:bg-surface-400/30"
        accessibilityRole="button"
        accessibilityLabel={`${debt.name}, ${debt.aprPercent}% APR, ${formatCurrency(debt.balance)} balance`}
      >
        {/* Top row: name + APR */}
        <View className="flex-row items-center justify-between mb-1">
          <Text
            className="text-sm font-bold text-foreground flex-1 mr-2"
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {debt.name}
          </Text>
          <Text className="text-2xs font-bold text-surface-800">{debt.aprPercent}% APR</Text>
        </View>

        {/* Balance */}
        <Text className="text-xs text-surface-800 mb-0.5">
          {formatCurrency(debt.balance)} balance
        </Text>

        {/* Min payment */}
        <Text className="text-xs text-surface-800 mb-0.5">
          {formatCurrency(debt.minPayment)} min payment
        </Text>

        {/* Payoff date */}
        <Text className="text-xs text-surface-800 mb-2">
          {t("goals.payoffDate" as any)}: {payoffDate}
        </Text>
      </Pressable>

      {/* Toggle amortization button */}
      <Pressable
        className="py-1.5 items-center"
        onPress={() => setIsExpanded(!isExpanded)}
        accessibilityRole="button"
        accessibilityState={{ expanded: isExpanded }}
      >
        <Text className="text-xs font-bold text-primary-500">
          {isExpanded ? t("goals.hideSchedule" as any) : t("goals.showSchedule" as any)}
        </Text>
      </Pressable>

      {/* Amortization table */}
      <AmortizationTable rows={amortization} isExpanded={isExpanded} />
    </Card>
  );
}
