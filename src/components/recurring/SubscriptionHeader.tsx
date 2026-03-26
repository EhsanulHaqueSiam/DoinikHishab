import React from "react";
import { Text, View } from "react-native";
import { useTranslation } from "../../lib/i18n";
import { formatCurrency } from "../../lib/currency";
import { shadow } from "../../lib/platform";
import type { Subscription } from "./recurring-types";

interface SubscriptionHeaderProps {
  subscriptions: Subscription[];
}

/**
 * Calculate monthly burn rate from subscriptions of mixed frequencies.
 * All math in paisa (integer). Weekly * 4.33, yearly / 12.
 */
function calculateMonthlyBurn(subscriptions: Subscription[]): number {
  let total = 0;
  for (const sub of subscriptions) {
    if (!sub.isActive) continue;
    const amount = sub.type === "expense" ? sub.amount : 0;
    switch (sub.frequency) {
      case "weekly":
        // 4.33 weeks per month, use integer math: amount * 433 / 100
        total += Math.round((amount * 433) / 100);
        break;
      case "monthly":
        total += amount;
        break;
      case "yearly":
        total += Math.round(amount / 12);
        break;
    }
  }
  return total;
}

export function SubscriptionHeader({ subscriptions }: SubscriptionHeaderProps) {
  const { t } = useTranslation();

  const monthlyTotal = calculateMonthlyBurn(subscriptions);
  const annualTotal = monthlyTotal * 12;

  return (
    <View
      className="mx-4 mt-4 rounded-2xl p-5 bg-surface-200 border border-primary-400/15"
      style={shadow("#0d9488", 0, 8, 0.12, 24, 8)}
      accessibilityLabel={`Monthly subscription total: ${formatCurrency(monthlyTotal)}`}
    >
      {/* Label */}
      <Text className="text-2xs font-semibold text-surface-900 uppercase tracking-widest">
        {t("recurring.burnRate")}
      </Text>

      {/* Monthly total - hero display */}
      <Text
        className="text-hero font-bold text-foreground mt-1 tracking-tight"
        style={{ lineHeight: 42 }}
      >
        {formatCurrency(monthlyTotal)}
      </Text>

      {/* Divider */}
      <View className="h-px bg-border/30 my-4" />

      {/* Bottom row */}
      <View className="flex-row gap-6">
        <View className="flex-1">
          <Text className="text-2xs font-semibold text-surface-800 uppercase tracking-widest">
            {t("recurring.monthly")}
          </Text>
          <Text className="text-lg font-bold text-primary-700 mt-0.5">
            {formatCurrency(monthlyTotal)}
          </Text>
        </View>
        <View className="w-px bg-border/30" />
        <View className="flex-1">
          <Text className="text-2xs font-semibold text-surface-800 uppercase tracking-widest">
            {t("recurring.annual")}
          </Text>
          <Text className="text-lg font-bold text-surface-900 mt-0.5">
            {formatCurrency(annualTotal)}
          </Text>
        </View>
      </View>
    </View>
  );
}
