import React from "react";
import { Pressable, Text } from "react-native";

interface FABProps {
  onPress: () => void;
}

export function FAB({ onPress }: FABProps) {
  return (
    <Pressable
      onPress={onPress}
      className="absolute bottom-6 right-6 w-14 h-14 rounded-full bg-primary-600 items-center justify-center shadow-lg active:bg-primary-700 z-50"
      style={{
        shadowColor: "#0891b2",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
      }}
    >
      <Text className="text-white text-3xl font-light leading-none" style={{ marginTop: -2 }}>
        +
      </Text>
    </Pressable>
  );
}
