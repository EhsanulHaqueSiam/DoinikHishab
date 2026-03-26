import React from "react";
import { View } from "react-native";
import Animated, { Easing, useAnimatedStyle, withTiming } from "react-native-reanimated";
import type { GoalStatus } from "../../services/goal-storage/types";

interface GoalProgressProps {
  /** Progress percentage 0-100 */
  percentage: number;
  /** Goal status determines bar color */
  status: GoalStatus;
  /** Bar height in pixels (default 8) */
  height?: number;
}

const statusBarColor: Record<GoalStatus, string> = {
  ahead: "bg-primary-500",
  on_track: "bg-primary-500",
  funded: "bg-primary-500",
  behind: "bg-accent",
};

export function GoalProgress({ percentage, status, height = 8 }: GoalProgressProps) {
  const clampedPercentage = Math.min(Math.max(percentage, 0), 100);

  const progressStyle = useAnimatedStyle(() => ({
    width: withTiming(`${clampedPercentage}%`, {
      duration: 600,
      easing: Easing.out(Easing.ease),
    }),
  }));

  return (
    <View
      className="bg-surface-400 rounded-full overflow-hidden"
      style={{ height }}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: clampedPercentage }}
    >
      <Animated.View
        className={`rounded-full ${statusBarColor[status]}`}
        style={[{ height }, progressStyle]}
      />
    </View>
  );
}
