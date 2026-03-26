/**
 * ImportReviewList
 *
 * FlashList of parsed transactions with select all/deselect all controls.
 * Shows parse summary with total and duplicate count.
 */

import { FlashList } from "@shopify/flash-list";
import React, { useCallback } from "react";
import { Pressable, Text, View } from "react-native";
import { useTranslation } from "../../lib/i18n";
import type { ParsedTransaction } from "../../services/statement-parser/types";
import { ImportReviewRow } from "./ImportReviewRow";

interface ImportReviewListProps {
  transactions: ParsedTransaction[];
  duplicates: Map<number, boolean>;
  selected: Set<number>;
  onToggleSelect: (index: number) => void;
  onToggleType: (index: number) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  duplicateCount: number;
}

export function ImportReviewList({
  transactions,
  duplicates,
  selected,
  onToggleSelect,
  onToggleType,
  onSelectAll,
  onDeselectAll,
  duplicateCount,
}: ImportReviewListProps) {
  const { t } = useTranslation();

  const renderItem = useCallback(
    ({ item, index }: { item: ParsedTransaction; index: number }) => (
      <ImportReviewRow
        transaction={item}
        isSelected={selected.has(index)}
        isDuplicate={duplicates.get(index) ?? false}
        onToggleSelect={() => onToggleSelect(index)}
        onToggleType={() => onToggleType(index)}
      />
    ),
    [selected, duplicates, onToggleSelect, onToggleType]
  );

  const summaryText = t("import.parseSummary")
    .replace("{{total}}", String(transactions.length))
    .replace("{{duplicates}}", String(duplicateCount));

  return (
    <View className="flex-1">
      {/* Summary and controls */}
      <View className="px-4 py-3 gap-2">
        <Text className="text-2xs text-surface-800">{summaryText}</Text>

        <View className="flex-row gap-3">
          <Pressable onPress={onSelectAll}>
            <Text className="text-sm font-bold text-primary-500">{t("import.selectAll")}</Text>
          </Pressable>
          <Text className="text-surface-800">/</Text>
          <Pressable onPress={onDeselectAll}>
            <Text className="text-sm font-bold text-surface-800">{t("import.deselectAll")}</Text>
          </Pressable>
        </View>
      </View>

      {/* Transaction list */}
      <FlashList
        data={transactions}
        renderItem={renderItem}
        keyExtractor={(_, index) => String(index)}
      />
    </View>
  );
}
