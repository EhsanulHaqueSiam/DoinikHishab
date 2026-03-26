import React, { useEffect } from "react";
import { View, Pressable } from "react-native";
import { Check } from "lucide-react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { useTranslation } from "../../lib/i18n";

interface StepIndicatorProps {
  currentStep: number;
  completedSteps: boolean[];
  onStepPress?: (step: number) => void;
}

const STEP_KEYS = [
  "onboarding.step1",
  "onboarding.step2",
  "onboarding.step3",
  "onboarding.step4",
  "onboarding.step5",
] as const;

function StepDot({
  index,
  isActive,
  isCompleted,
  stepLabel,
  onPress,
}: {
  index: number;
  isActive: boolean;
  isCompleted: boolean;
  stepLabel: string;
  onPress?: () => void;
}) {
  const scale = useSharedValue(1);

  useEffect(() => {
    if (isActive) {
      scale.value = withSpring(1.2, { damping: 12, duration: 300 });
      const timer = setTimeout(() => {
        scale.value = withSpring(1, { damping: 12, duration: 300 });
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [isActive, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const accessibilityLabel = `${stepLabel}${
    isCompleted ? ", completed" : isActive ? ", current" : ""
  }`;

  const canPress = isCompleted && onPress;

  return (
    <Pressable
      onPress={canPress ? onPress : undefined}
      hitSlop={12}
      accessibilityLabel={accessibilityLabel}
      disabled={!canPress}
    >
      <Animated.View style={animatedStyle}>
        {isActive ? (
          <View
            className="bg-primary-500 rounded-full"
            style={{ width: 24, height: 12 }}
          />
        ) : isCompleted ? (
          <View
            className="bg-primary-700 rounded-full items-center justify-center"
            style={{ width: 12, height: 12 }}
          >
            <Check size={8} color="#ffffff" strokeWidth={3} />
          </View>
        ) : (
          <View
            className="bg-surface-500 rounded-full"
            style={{ width: 12, height: 12 }}
          />
        )}
      </Animated.View>
    </Pressable>
  );
}

export function StepIndicator({
  currentStep,
  completedSteps,
  onStepPress,
}: StepIndicatorProps) {
  const { t } = useTranslation();

  return (
    <View className="flex-row justify-center items-center py-4 gap-3">
      {STEP_KEYS.map((key, index) => (
        <StepDot
          key={key}
          index={index}
          isActive={index === currentStep}
          isCompleted={completedSteps[index] === true}
          stepLabel={t(key as any)}
          onPress={onStepPress ? () => onStepPress(index) : undefined}
        />
      ))}
    </View>
  );
}
