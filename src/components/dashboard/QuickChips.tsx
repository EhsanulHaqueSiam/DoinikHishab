import React, { useMemo } from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { generateSuggestions } from "../../services/suggestions";
import type { Doc } from "../../../convex/_generated/dataModel";

interface QuickChipsProps {
  transactions: Doc<"transactions">[];
  categories: Doc<"categories">[];
  onPress: (chip: {
    label: string;
    amount?: number;
    categoryId?: string;
    type: "expense" | "income";
  }) => void;
}

export function QuickChips({
  transactions,
  categories,
  onPress,
}: QuickChipsProps) {
  const hour = new Date().getHours();

  const suggestions = useMemo(
    () => generateSuggestions(transactions, categories, hour),
    [transactions, categories, hour]
  );

  if (suggestions.length === 0) return null;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className="px-4 py-2"
      contentContainerStyle={{ gap: 8 }}
    >
      {suggestions.map((chip, index) => (
        <Pressable
          key={`${chip.label}-${index}`}
          onPress={() =>
            onPress({
              label: chip.label,
              amount: chip.amount,
              categoryId: chip.categoryId,
              type: chip.type,
            })
          }
          className="flex-row items-center gap-1.5 px-3.5 py-2 rounded-full bg-surface-300 border border-border/50 active:bg-surface-400"
        >
          <Text className="text-sm text-foreground">{chip.label}</Text>
          {chip.amount != null && chip.amount > 0 && (
            <Text className="text-xs text-accent-500">
              ~{Math.round(chip.amount / 100)}
            </Text>
          )}
        </Pressable>
      ))}
    </ScrollView>
  );
}
