import React from "react";
import { View, Text, Pressable } from "react-native";

interface TabBarItem {
  key: string;
  label: string;
  icon: string;
}

interface TabBarProps {
  items: TabBarItem[];
  activeKey: string;
  onPress: (key: string) => void;
}

export function TabBar({ items, activeKey, onPress }: TabBarProps) {
  return (
    <View className="flex-row bg-white border-t border-border px-2 pb-6 pt-2">
      {items.map((item) => {
        const isActive = item.key === activeKey;
        return (
          <Pressable
            key={item.key}
            onPress={() => onPress(item.key)}
            className="flex-1 items-center py-1"
          >
            <Text className={`text-xl ${isActive ? "" : "opacity-40"}`}>
              {item.icon}
            </Text>
            <Text
              className={`text-xs mt-0.5 ${
                isActive
                  ? "text-primary-600 font-semibold"
                  : "text-muted-foreground"
              }`}
            >
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
