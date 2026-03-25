import React from "react";
import { Pressable, Text, View } from "react-native";
import type { Doc } from "../../../convex/_generated/dataModel";
import { FLAG_COLORS, type FlagColor } from "../../lib/constants";
import { formatCurrency } from "../../lib/currency";

interface TransactionCardProps {
  transaction: Doc<"transactions">;
  categoryName?: string;
  categoryIcon?: string;
  accountName?: string;
  onPress?: () => void;
}

const ICON_EMOJI: Record<string, string> = {
  home: "🏠",
  zap: "⚡",
  flame: "🔥",
  droplets: "💧",
  wifi: "📶",
  smartphone: "📱",
  "shopping-cart": "🛒",
  utensils: "🍽️",
  bus: "🚌",
  bike: "🚲",
  banknote: "💵",
  package: "📦",
  tv: "📺",
  "shopping-bag": "🛍️",
  stethoscope: "🏥",
  "graduation-cap": "🎓",
  gift: "🎁",
  briefcase: "💼",
  code: "💻",
  building: "🏢",
  "plus-circle": "➕",
  moon: "🌙",
  plane: "✈️",
  lamp: "💡",
  heart: "❤️",
  shirt: "👔",
  "shield-alert": "🛡️",
};

export const TransactionCard = React.memo(function TransactionCard({
  transaction,
  categoryName,
  categoryIcon,
  accountName,
  onPress,
}: TransactionCardProps) {
  const isExpense = transaction.amount < 0;
  const emoji = ICON_EMOJI[categoryIcon || ""] || "📌";

  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center py-3.5 px-4 active:bg-surface-400/40"
    >
      {transaction.flag && (
        <View
          className="w-0.5 h-8 rounded-full mr-2.5"
          style={{
            backgroundColor: FLAG_COLORS[transaction.flag as FlagColor] || "#4e6381",
          }}
        />
      )}

      <View className="w-10 h-10 rounded-xl bg-surface-300 items-center justify-center mr-3">
        <Text className="text-lg">{emoji}</Text>
      </View>

      <View className="flex-1 mr-3">
        <Text className="text-sm font-semibold text-foreground" numberOfLines={1}>
          {transaction.description || categoryName || "Uncategorized"}
        </Text>
        <View className="flex-row items-center gap-1.5 mt-0.5">
          {categoryName && transaction.description && (
            <Text className="text-2xs text-surface-800">{categoryName}</Text>
          )}
          {accountName && (
            <Text className="text-2xs text-surface-700">
              {categoryName && transaction.description ? "·" : ""} {accountName}
            </Text>
          )}
        </View>
      </View>

      <View className="items-end">
        <Text
          className={`text-sm font-bold tracking-tight ${
            isExpense ? "text-danger" : "text-success"
          }`}
        >
          {formatCurrency(transaction.amount)}
        </Text>
        {!transaction.isCleared && (
          <View className="w-1.5 h-1.5 rounded-full bg-accent-500 mt-1.5" />
        )}
      </View>
    </Pressable>
  );
});
