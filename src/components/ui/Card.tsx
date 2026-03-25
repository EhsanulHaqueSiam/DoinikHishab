import React from "react";
import { View, type ViewProps } from "react-native";
import { shadow } from "../../lib/platform";

interface CardProps extends ViewProps {
  children: React.ReactNode;
}

export function Card({ children, className = "", style, ...props }: CardProps) {
  return (
    <View
      className={`bg-card rounded-2xl p-4 border border-border/60 ${className}`}
      style={[shadow("#000", 0, 4, 0.3, 12, 6), style]}
      {...props}
    >
      {children}
    </View>
  );
}
