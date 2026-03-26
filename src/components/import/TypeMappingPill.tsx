/**
 * TypeMappingPill
 *
 * Small pill showing transaction type (Expense/Income).
 * Per D-12: Tappable to toggle type. Inline toggle, no modal.
 */

import React from "react";
import { Pressable, Text } from "react-native";
import { useTranslation } from "../../lib/i18n";

interface TypeMappingPillProps {
  type: "expense" | "income";
  onToggle: () => void;
}

export function TypeMappingPill({ type, onToggle }: TypeMappingPillProps) {
  const { t } = useTranslation();

  const isExpense = type === "expense";
  const label = isExpense
    ? t("transaction.expense")
    : t("transaction.income");

  return (
    <Pressable
      onPress={onToggle}
      accessibilityRole="button"
      accessibilityLabel={`Transaction type: ${label}. Tap to change.`}
      className={`rounded-full px-3 py-1 ${
        isExpense ? "bg-danger/20" : "bg-primary-500/20"
      }`}
    >
      <Text
        className={`text-2xs font-bold ${
          isExpense ? "text-danger" : "text-primary-700"
        }`}
      >
        {label}
      </Text>
    </Pressable>
  );
}
