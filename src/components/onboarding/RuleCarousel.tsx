import React, { useCallback, useState } from "react";
import { View, ScrollView, useWindowDimensions } from "react-native";
import type { NativeSyntheticEvent, NativeScrollEvent } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import { YNAB_RULES } from "../../services/onboarding/rules";
import { RuleCard } from "./RuleCard";

interface RuleCarouselProps {
  onComplete?: () => void;
}

function PaginationDot({ isActive }: { isActive: boolean }) {
  const animatedWidth = useSharedValue(isActive ? 24 : 12);

  React.useEffect(() => {
    animatedWidth.value = withTiming(isActive ? 24 : 12, { duration: 200 });
  }, [isActive, animatedWidth]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: animatedWidth.value,
    height: 12,
    borderRadius: 6,
    backgroundColor: isActive ? "#0d9488" : "#6b7280",
    marginHorizontal: 4,
  }));

  return <Animated.View style={animatedStyle} />;
}

export function RuleCarousel({ onComplete }: RuleCarouselProps) {
  const { width: screenWidth } = useWindowDimensions();
  const CARD_WIDTH = Math.min(screenWidth - 32, 448);
  const [activeIndex, setActiveIndex] = useState(0);

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offsetX = event.nativeEvent.contentOffset.x;
      const index = Math.round(offsetX / CARD_WIDTH);
      setActiveIndex(index);

      // If swiped past the last card, trigger onComplete
      if (index >= YNAB_RULES.length - 1 && onComplete) {
        const maxOffset = (YNAB_RULES.length - 1) * CARD_WIDTH;
        if (offsetX > maxOffset + CARD_WIDTH * 0.3) {
          onComplete();
        }
      }
    },
    [CARD_WIDTH, onComplete]
  );

  return (
    <View>
      <ScrollView
        horizontal
        pagingEnabled
        snapToInterval={CARD_WIDTH}
        decelerationRate="fast"
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={handleScroll}
        accessibilityRole="adjustable"
      >
        {YNAB_RULES.map((rule) => (
          <RuleCard
            key={rule.id}
            rule={rule}
            width={CARD_WIDTH - 32}
          />
        ))}
      </ScrollView>

      {/* Pagination Dots */}
      <View className="flex-row justify-center items-center mt-4">
        {YNAB_RULES.map((rule, index) => (
          <PaginationDot key={rule.id} isActive={index === activeIndex} />
        ))}
      </View>
    </View>
  );
}
