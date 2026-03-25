import React from "react";
import { View, type ViewProps } from "react-native";
import { shadow } from "../../lib/platform";

interface CardProps extends ViewProps {
  children: React.ReactNode;
  variant?: "default" | "elevated" | "glass" | "outline";
}

const variantClasses = {
  default: "bg-card border border-border/40",
  elevated: "bg-surface-300 border border-border/50",
  glass: "bg-glass border border-border/30",
  outline: "bg-transparent border border-border/60",
};

export function Card({
  children,
  className = "",
  variant = "default",
  style,
  ...props
}: CardProps) {
  return (
    <View
      className={`rounded-2xl p-4 ${variantClasses[variant]} ${className}`}
      style={[
        variant === "elevated"
          ? shadow("#000", 0, 8, 0.4, 16, 8)
          : shadow("#000", 0, 2, 0.2, 8, 3),
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
}
