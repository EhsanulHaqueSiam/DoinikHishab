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
    <View className="flex-row bg-surface-100 border-t border-border px-2 pb-6 pt-2">
      {items.map((item) => {
        const isActive = item.key === activeKey;
        return (
          <Pressable
            key={item.key}
            onPress={() => onPress(item.key)}
            className="flex-1 items-center py-1"
          >
            <View
              style={
                isActive
                  ? {
                      shadowColor: "#0d9488",
                      shadowOffset: { width: 0, height: 0 },
                      shadowOpacity: 0.5,
                      shadowRadius: 6,
                    }
                  : undefined
              }
            >
              <Text className={`text-xl ${isActive ? "" : "opacity-30"}`}>
                {item.icon}
              </Text>
            </View>
            <Text
              className={`text-xs mt-0.5 ${
                isActive
                  ? "text-primary-700 font-semibold"
                  : "text-surface-700"
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
