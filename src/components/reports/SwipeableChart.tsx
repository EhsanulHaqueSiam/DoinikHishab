import type React from "react";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

const SWIPE_THRESHOLD = 50;
const VELOCITY_THRESHOLD = 500;

interface SwipeableChartProps {
  children: React.ReactNode;
  onNext: () => void;
  onPrev: () => void;
}

export function SwipeableChart({ children, onNext, onPrev }: SwipeableChartProps) {
  const translateX = useSharedValue(0);

  const panGesture = Gesture.Pan()
    .activeOffsetX([-15, 15])
    .failOffsetY([-10, 10])
    .onUpdate((event) => {
      translateX.value = event.translationX * 0.3;
    })
    .onEnd((event) => {
      if (event.translationX < -SWIPE_THRESHOLD || event.velocityX < -VELOCITY_THRESHOLD) {
        runOnJS(onNext)();
      } else if (event.translationX > SWIPE_THRESHOLD || event.velocityX > VELOCITY_THRESHOLD) {
        runOnJS(onPrev)();
      }
      translateX.value = withTiming(0, {
        duration: 250,
        easing: Easing.out(Easing.cubic),
      });
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View
        style={animatedStyle}
        accessibilityActions={[{ name: "increment" }, { name: "decrement" }]}
        onAccessibilityAction={(event) => {
          if (event.nativeEvent.actionName === "increment") onNext();
          if (event.nativeEvent.actionName === "decrement") onPrev();
        }}
      >
        {children}
      </Animated.View>
    </GestureDetector>
  );
}
