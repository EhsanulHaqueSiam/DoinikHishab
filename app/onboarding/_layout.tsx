import { Stack } from "expo-router";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StepIndicator } from "../../src/components/onboarding/StepIndicator";
import { useOnboarding } from "../../src/hooks/use-onboarding";

export default function OnboardingLayout() {
  const { currentStep, completedSteps } = useOnboarding();

  return (
    <View className="flex-1 bg-background">
      <SafeAreaView edges={["top"]} className="bg-background">
        <StepIndicator currentStep={currentStep} completedSteps={completedSteps} />
      </SafeAreaView>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "#070b16" },
          animation: "slide_from_right",
        }}
      >
        <Stack.Screen name="rules" />
        <Stack.Screen name="account" />
        <Stack.Screen name="categories" />
        <Stack.Screen name="assign" />
        <Stack.Screen name="transaction" />
      </Stack>
    </View>
  );
}
