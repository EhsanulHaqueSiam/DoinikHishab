import React from "react";
import { View, Text, Pressable } from "react-native";
import { formatCurrency } from "../../lib/currency";
import { FLAG_COLORS, type FlagColor } from "../../lib/constants";
import type { Doc } from "../../../convex/_generated/dataModel";

interface TransactionCardProps {
  transaction: Doc<"transactions">;
  categoryName?: string;
  categoryIcon?: string;
  accountName?: string;
  onPress?: () => void;
}

const ICON_EMOJI: Record<string, string> = {
  home: "🏠", zap: "⚡", flame: "🔥", droplets: "💧", wifi: "📶",
  smartphone: "📱", "shopping-cart": "🛒", utensils: "🍽️", bus: "🚌",
  bike: "🚲", banknote: "💵", package: "📦", tv: "📺",
  "shopping-bag": "🛍️", stethoscope: "🏥", "graduation-cap": "🎓",
  gift: "🎁", briefcase: "💼", code: "💻", building: "🏢",
  "plus-circle": "➕", moon: "🌙", plane: "✈️", lamp: "💡",
  heart: "❤️", shirt: "👔", "shield-alert": "🛡️",
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
      className="flex-row items-center py-3 px-4 active:bg-surface-300/50"
    >
      {transaction.flag && (
        <View
          className="w-1 h-8 rounded-full mr-2"
          style={{
            backgroundColor:
              FLAG_COLORS[transaction.flag as FlagColor] || "#3a5280",
          }}
        />
      )}

      <View className="w-10 h-10 rounded-xl bg-surface-300 items-center justify-center mr-3">
        <Text className="text-lg">{emoji}</Text>
      </View>

      <View className="flex-1">
        <Text className="text-base font-medium text-foreground" numberOfLines={1}>
          {transaction.description || categoryName || "Uncategorized"}
        </Text>
        <View className="flex-row items-center gap-2 mt-0.5">
          {categoryName && transaction.description && (
            <Text className="text-xs text-muted-foreground">{categoryName}</Text>
          )}
          {accountName && (
            <Text className="text-xs text-surface-700">
              {categoryName && transaction.description ? "·" : ""} {accountName}
            </Text>
          )}
        </View>
      </View>

      <View className="items-end">
        <Text
          className={`text-base font-semibold ${
            isExpense ? "text-danger" : "text-success"
          }`}
        >
          {formatCurrency(transaction.amount)}
        </Text>
        {!transaction.isCleared && (
          <View className="w-2 h-2 rounded-full bg-accent-500 mt-1" />
        )}
      </View>
    </Pressable>
  );
});
