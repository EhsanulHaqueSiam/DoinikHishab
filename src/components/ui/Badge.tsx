import React from "react";
import { View, Text } from "react-native";

interface BadgeProps {
  label: string;
  variant?: "default" | "success" | "warning" | "danger" | "muted";
  size?: "sm" | "md";
}

const variantStyles = {
  default: "bg-primary-50 border border-primary-200/40",
  success: "bg-emerald-950 border border-emerald-800/40",
  warning: "bg-amber-950 border border-amber-800/40",
  danger: "bg-red-950 border border-red-800/40",
  muted: "bg-surface-300 border border-border/40",
};

const variantTextStyles = {
  default: "text-primary-700",
  success: "text-emerald-400",
  warning: "text-amber-400",
  danger: "text-red-400",
  muted: "text-muted-foreground",
};

export function Badge({ label, variant = "default", size = "sm" }: BadgeProps) {
  return (
    <View
      className={`rounded-full ${variantStyles[variant]} ${
        size === "sm" ? "px-2.5 py-0.5" : "px-3 py-1"
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
