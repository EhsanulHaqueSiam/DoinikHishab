import { useCallback } from "react";
import { Dimensions, Pressable, Text, View } from "react-native";
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";

const TILE_WIDTH = 80;
const TILE_GAP = 8;
const PADDING = 16;

const ICON_EMOJI: Record<string, string> = {
  home: "\u{1F3E0}",
  zap: "\u26A1",
  flame: "\u{1F525}",
  droplets: "\u{1F4A7}",
  wifi: "\u{1F4F6}",
  smartphone: "\u{1F4F1}",
  shield: "\u{1F6E1}\uFE0F",
  "shopping-cart": "\u{1F6D2}",
  utensils: "\u{1F37D}\uFE0F",
  bus: "\u{1F68C}",
  bike: "\u{1F6B2}",
  fuel: "\u26FD",
  lamp: "\u{1F4A1}",
  heart: "\u2764\uFE0F",
  banknote: "\u{1F4B5}",
  package: "\u{1F4E6}",
  repeat: "\u{1F504}",
  tv: "\u{1F4FA}",
  "shopping-bag": "\u{1F6CD}\uFE0F",
  stethoscope: "\u{1F3E5}",
  "graduation-cap": "\u{1F393}",
  gift: "\u{1F381}",
  shirt: "\u{1F454}",
  "shield-alert": "\u{1F6E1}\uFE0F",
  plane: "\u2708\uFE0F",
  moon: "\u{1F319}",
  laptop: "\u{1F4BB}",
  briefcase: "\u{1F4BC}",
  code: "\u{1F4BB}",
  building: "\u{1F3E2}",
  "trending-up": "\u{1F4C8}",
  "plus-circle": "\u2795",
};

function getFrequentTileCount(): number {
  const screenWidth = Dimensions.get("window").width;
  const usableWidth = screenWidth - PADDING * 2;
  const tilesPerRow = Math.floor((usableWidth + TILE_GAP) / (TILE_WIDTH + TILE_GAP));
  return tilesPerRow * 2; // 2 rows per D-11
}

interface CategoryFrequentProps {
  categories: any[];
  frequentIds: string[];
  onSelect: (id: string) => void;
  type: "expense" | "income";
  flashingId?: string | null;
}

function AnimatedCategoryTile({
  id,
  name,
  icon,
  onSelect,
  testID,
}: {
  id: string;
  name: string;
  icon?: string;
  onSelect: (id: string) => void;
  testID?: string;
}) {
  const flash = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      flash.value,
      [0, 1],
      ["transparent", "rgba(52, 211, 153, 0.4)"]
    ),
  }));

  const handlePress = useCallback(() => {
    flash.value = withSequence(withTiming(1, { duration: 150 }), withTiming(0, { duration: 150 }));
    onSelect(id);
  }, [id, onSelect, flash]);

  const emoji = ICON_EMOJI[icon || ""] || "\u{1F4CC}";

  return (
    <Pressable testID={testID} onPress={handlePress}>
      <Animated.View style={[animatedStyle]} className="w-20 items-center p-2 rounded-xl">
        <View className="w-11 h-11 rounded-xl items-center justify-center bg-surface-300">
          <Text className="text-lg">{emoji}</Text>
        </View>
        <Text
          className="text-2xs mt-1.5 text-center leading-tight text-surface-900"
          numberOfLines={2}
        >
          {name}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

export function CategoryFrequent({
  categories,
  frequentIds,
  onSelect,
  type,
}: CategoryFrequentProps) {
  const maxTiles = getFrequentTileCount();

  // Filter to matching type and not hidden
  const validCategories = categories.filter((c: any) => c.type === type && !c.isHidden);

  // Sort by frequentIds order: categories in frequentIds first, in that order
  const sorted = [...validCategories].sort((a: any, b: any) => {
    const aIdx = frequentIds.indexOf(a._id);
    const bIdx = frequentIds.indexOf(b._id);
    if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
    if (aIdx !== -1) return -1;
    if (bIdx !== -1) return 1;
    return 0;
  });

  const tiles = sorted.slice(0, maxTiles);

  if (tiles.length === 0) return null;

  return (
    <View className="mb-3">
      <Text className="text-2xs font-semibold text-surface-800 uppercase tracking-widest px-2 mb-2">
        Frequent
      </Text>
      <View className="flex-row flex-wrap gap-2">
        {tiles.map((cat: any, index: number) => (
          <AnimatedCategoryTile
            key={cat._id}
            id={cat._id}
            name={cat.name}
            icon={cat.icon}
            onSelect={onSelect}
            testID={`frequent-category-${index}`}
          />
        ))}
      </View>
    </View>
  );
}
