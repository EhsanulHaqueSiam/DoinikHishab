import React from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { shadow } from "../../lib/platform";
import type { Doc, Id } from "../../../convex/_generated/dataModel";

interface CategoryGridProps {
  categories: Doc<"categories">[];
  groups: Doc<"categoryGroups">[];
  selectedId: Id<"categories"> | null;
  onSelect: (id: Id<"categories">) => void;
  type: "expense" | "income";
}

const ICON_EMOJI: Record<string, string> = {
  home: "🏠", zap: "⚡", flame: "🔥", droplets: "💧", wifi: "📶",
  smartphone: "📱", shield: "🛡️", "shopping-cart": "🛒", utensils: "🍽️",
  bus: "🚌", bike: "🚲", fuel: "⛽", lamp: "💡", heart: "❤️",
  banknote: "💵", package: "📦", repeat: "🔄", tv: "📺",
  "shopping-bag": "🛍️", stethoscope: "🏥", "graduation-cap": "🎓",
  gift: "🎁", shirt: "👔", "shield-alert": "🛡️", plane: "✈️",
  moon: "🌙", laptop: "💻", briefcase: "💼", code: "💻",
  building: "🏢", "trending-up": "📈", "plus-circle": "➕",
};

function CategoryIcon({ icon, isSelected }: { icon?: string; isSelected: boolean }) {
  const emoji = ICON_EMOJI[icon || ""] || "📌";
  return (
    <View
      className={`w-11 h-11 rounded-xl items-center justify-center ${
        isSelected ? "bg-primary-500" : "bg-surface-300"
      }`}
      style={isSelected ? shadow("#0d9488", 0, 0, 0.4, 10, 6) : undefined}
    >
      <Text className="text-lg">{emoji}</Text>
    </View>
  );
}

export function CategoryGrid({ categories, groups, selectedId, onSelect, type }: CategoryGridProps) {
  const filteredGroups = groups.filter((g) => {
    return categories.some((c) => c.groupId === g._id && c.type === type && !c.isHidden);
  });

  return (
    <ScrollView className="flex-1" showsVerticalScrollIndicator={false} scrollEventThrottle={8} decelerationRate="fast">
      {filteredGroups.map((group) => {
        const groupCats = categories.filter(
          (c) => c.groupId === group._id && c.type === type && !c.isHidden
        );

        return (
          <View key={group._id} className="mb-5">
            <Text className="text-2xs font-semibold text-surface-800 uppercase tracking-widest px-2 mb-2.5">
              {group.name}
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {groupCats.map((cat) => {
                const isSelected = selectedId === cat._id;
                return (
                  <Pressable
                    key={cat._id}
                    onPress={() => onSelect(cat._id)}
                    className={`items-center p-2 rounded-xl w-20 ${
                      isSelected ? "bg-surface-300 border border-primary-500/30" : ""
                    }`}
                  >
                    <CategoryIcon icon={cat.icon || undefined} isSelected={isSelected} />
                    <Text
                      className={`text-2xs mt-1.5 text-center leading-tight ${
                        isSelected ? "text-primary-700 font-bold" : "text-surface-900"
                      }`}
                      numberOfLines={2}
                    >
                      {cat.name}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
}
