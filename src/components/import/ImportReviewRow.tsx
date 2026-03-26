/**
 * ImportReviewRow
 *
 * Single row in import review list.
 * Per D-11: checkbox left, date + description center, amount right.
 * Per D-12: TypeMappingPill for type override.
 * Yellow "Duplicate" badge when flagged.
 */

import React from "react";
import { Pressable, Text, View } from "react-native";
import { Check, Square, CheckSquare } from "lucide-react-native";
import type { ParsedTransaction } from "../../services/statement-parser/types";
import { TypeMappingPill } from "./TypeMappingPill";
import { useTranslation } from "../../lib/i18n";

interface ImportReviewRowProps {
  transaction: ParsedTransaction;
  isSelected: boolean;
  isDuplicate: boolean;
  onToggleSelect: () => void;
  onToggleType: () => void;
}

function formatAmount(paisa: number): string {
  const taka = paisa / 100;
  return `Tk ${taka.toLocaleString("en-BD", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

function formatDate(isoDate: string): string {
  const parts = isoDate.split("-");
  if (parts.length !== 3) return isoDate;
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const monthIndex = Number.parseInt(parts[1], 10) - 1;
  return `${months[monthIndex]} ${Number.parseInt(parts[2], 10)}`;
}

export function ImportReviewRow({
  transaction,
  isSelected,
  isDuplicate,
  onToggleSelect,
  onToggleType,
}: ImportReviewRowProps) {
  const { t } = useTranslation();

  const CheckIcon = isSelected ? CheckSquare : Square;

  return (
    <Pressable
      onPress={onToggleSelect}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: isSelected }}
      className="flex-row items-center px-4 py-3 border-b border-border/20"
      style={{ minHeight: 56 }}
    >
      {/* Checkbox */}
      <View className="mr-3" style={{ minWidth: 44, minHeight: 44, justifyContent: "center", alignItems: "center" }}>
        <CheckIcon
          size={22}
          color={isSelected ? "#0d9488" : "#6b7280"}
        />
      </View>

      {/* Transaction info */}
      <View className="flex-1 gap-1">
        <View className="flex-row items-center gap-2">
          <Text className="text-2xs text-surface-800">
            {formatDate(transaction.date)}
          </Text>
          <Text
            className="text-sm font-bold text-foreground flex-1"
            numberOfLines={1}
          >
            {transaction.description}
          </Text>
        </View>

        <View className="flex-row items-center gap-2">
          <Text className="text-2xs text-surface-800">
            Ref: {transaction.reference}
          </Text>
          {isDuplicate && (
            <View className="rounded-full bg-warning/20 px-2 py-0.5">
              <Text
                className="text-2xs font-bold text-warning"
                accessibilityLabel="Duplicate transaction detected"
              >
                {t("import.duplicate")}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Amount and type */}
      <View className="items-end gap-1 ml-2">
        <Text className="text-sm font-bold text-foreground">
          {formatAmount(transaction.amount)}
        </Text>
        <TypeMappingPill
          type={transaction.type}
          onToggle={onToggleType}
        />
      </View>
    </Pressable>
  );
}
