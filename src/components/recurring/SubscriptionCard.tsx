import React from "react";
import { Pressable, Text, View } from "react-native";
import { useTranslation } from "../../lib/i18n";
import { formatCurrency } from "../../lib/currency";
import type { DetectedSubscription } from "./recurring-types";

interface SubscriptionCardProps {
  subscription: DetectedSubscription;
  onConfirm: (sub: DetectedSubscription) => void;
  onDismiss: (payee: string) => void;
}

const frequencyLabelKey: Record<string, string> = {
  weekly: "recurring.weekly",
  monthly: "recurring.monthly",
  yearly: "recurring.yearly",
};

export function SubscriptionCard({
  subscription,
  onConfirm,
  onDismiss,
}: SubscriptionCardProps) {
  const { t } = useTranslation();

  const isHighConfidence = subscription.confidence > 0.8;

  return (
    <View
      className="mx-4 mt-3 rounded-2xl p-4 bg-surface-200 border border-accent/20"
      accessibilityLabel={`Detected subscription: ${subscription.payee}, ${formatCurrency(subscription.amount)}, ${t(frequencyLabelKey[subscription.frequency])}`}
    >
      {/* Payee name */}
      <Text className="text-sm font-bold text-foreground">
        {subscription.payee}
      </Text>

      {/* Detection info row */}
      <View className="flex-row items-center gap-3 mt-2">
        <Text className="text-2xs text-surface-800">
          {t(frequencyLabelKey[subscription.frequency])}
        </Text>
        <Text className="text-2xs font-bold text-surface-900">
          {formatCurrency(subscription.amount)}
        </Text>
        <Text className="text-2xs text-surface-800">
          {subscription.occurrences}x
        </Text>
      </View>

      {/* Confidence indicator */}
      <Text
        className={`text-2xs mt-1 ${isHighConfidence ? "text-primary-500" : "text-surface-800"}`}
      >
        {isHighConfidence ? "High match" : "Possible match"}
      </Text>

      {/* Action buttons */}
      <View className="flex-row gap-3 mt-3">
        <Pressable
          className="bg-primary-500 rounded-xl px-4 py-2"
          accessibilityRole="button"
          onPress={() => onConfirm(subscription)}
        >
          <Text className="text-white font-bold text-sm">
            {t("recurring.confirm")}
          </Text>
        </Pressable>

        <Pressable
          className="bg-transparent rounded-xl px-4 py-2 border border-surface-600"
          accessibilityRole="button"
          onPress={() => onDismiss(subscription.payee)}
        >
          <Text className="text-surface-900 font-bold text-sm">
            {t("recurring.notSubscription")}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
