import React from "react";
import { Pressable, Text, Platform } from "react-native";
import { shadow } from "../../lib/platform";

interface FABProps {
  onPress: () => void;
}

export function FAB({ onPress }: FABProps) {
  return (
    <Pressable
      onPress={onPress}
      className="absolute bottom-6 right-6 w-14 h-14 rounded-full bg-primary-600 items-center justify-center z-50 active:bg-primary-700"
      style={[
        shadow("#0d9488", 0, 0, 0.6, 16, 12),
        Platform.OS === "web" && {
          position: "fixed" as any,
          width: 56,
          height: 56,
          borderRadius: 28,
        },
      ]}
    >
      <Text className="text-white text-3xl font-light leading-none" style={{ marginTop: -2 }}>
        +
      </Text>
    </Pressable>
  );
}
