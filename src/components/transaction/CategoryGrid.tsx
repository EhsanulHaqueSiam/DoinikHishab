import React from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
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
      className={`w-12 h-12 rounded-xl items-center justify-center ${
        isSelected ? "bg-primary-600" : "bg-surface-300"
      }`}
      style={
        isSelected
          ? {
              shadowColor: "#0d9488",
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.5,
              shadowRadius: 10,
              elevation: 6,
            }
          : undefined
      }
    >
      <Text className="text-xl">{emoji}</Text>
    </View>
  );
}

export function CategoryGrid({
  categories,
  groups,
  selectedId,
  onSelect,
  type,
}: CategoryGridProps) {
  const filteredGroups = groups.filter((g) => {
    const groupCats = categories.filter(
      (c) => c.groupId === g._id && c.type === type && !c.isHidden
    );
    return groupCats.length > 0;
  });

  return (
    <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
      {filteredGroups.map((group) => {
        const groupCats = categories.filter(
          (c) => c.groupId === group._id && c.type === type && !c.isHidden
        );

        return (
          <View key={group._id} className="mb-4">
            <Text className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 mb-2">
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
                      isSelected ? "bg-surface-300 border border-primary-600/40" : ""
                    }`}
                  >
                    <CategoryIcon icon={cat.icon || undefined} isSelected={isSelected} />
                    <Text
                      className={`text-xs mt-1 text-center ${
                        isSelected
                          ? "text-primary-700 font-semibold"
                          : "text-muted-foreground"
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
