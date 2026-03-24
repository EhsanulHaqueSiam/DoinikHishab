import React from "react";
import { Pressable, Text } from "react-native";

interface FABProps {
  onPress: () => void;
}

export function FAB({ onPress }: FABProps) {
  return (
    <Pressable
      onPress={onPress}
      className="absolute bottom-6 right-6 w-14 h-14 rounded-full bg-primary-600 items-center justify-center z-50 active:bg-primary-700"
      style={{
        shadowColor: "#0d9488",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.6,
        shadowRadius: 16,
        elevation: 12,
      }}
    >
      <Text className="text-white text-3xl font-light leading-none" style={{ marginTop: -2 }}>
        +
      </Text>
    </Pressable>
  );
}
