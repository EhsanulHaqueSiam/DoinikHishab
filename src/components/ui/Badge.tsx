import React from "react";
import { View, Text } from "react-native";

interface BadgeProps {
  label: string;
  variant?: "default" | "success" | "warning" | "danger" | "muted";
  size?: "sm" | "md";
}

const variantStyles = {
  default: "bg-primary-100",
  success: "bg-emerald-100",
  warning: "bg-amber-100",
  danger: "bg-red-100",
  muted: "bg-gray-100",
};

const variantTextStyles = {
  default: "text-primary-700",
  success: "text-emerald-700",
  warning: "text-amber-700",
  danger: "text-red-700",
  muted: "text-gray-600",
};

export function Badge({ label, variant = "default", size = "sm" }: BadgeProps) {
  return (
    <View
      className={`rounded-full ${variantStyles[variant]} ${
        size === "sm" ? "px-2 py-0.5" : "px-3 py-1"
      }`}
    >
      <Text
        className={`font-medium ${variantTextStyles[variant]} ${
          size === "sm" ? "text-xs" : "text-sm"
        }`}
      >
        {label}
      </Text>
    </View>
  );
}
