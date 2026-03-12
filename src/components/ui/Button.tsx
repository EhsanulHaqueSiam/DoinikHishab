import React from "react";
import { Pressable, Text, type PressableProps, ActivityIndicator } from "react-native";

interface ButtonProps extends PressableProps {
  variant?: "default" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  children: React.ReactNode;
}

const variantStyles = {
  default: "bg-primary-600 active:bg-primary-700",
  secondary: "bg-muted active:bg-gray-200",
  outline: "border border-border bg-transparent active:bg-muted",
  ghost: "bg-transparent active:bg-muted",
  danger: "bg-danger active:bg-red-600",
};

const variantTextStyles = {
  default: "text-white font-semibold",
  secondary: "text-foreground font-medium",
  outline: "text-foreground font-medium",
  ghost: "text-foreground font-medium",
  danger: "text-white font-semibold",
};

const sizeStyles = {
  sm: "px-3 py-1.5 rounded-lg",
  md: "px-4 py-2.5 rounded-xl",
  lg: "px-6 py-3.5 rounded-xl",
};

const sizeTextStyles = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-lg",
};

export function Button({
  variant = "default",
  size = "md",
  loading = false,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <Pressable
      className={`flex-row items-center justify-center ${variantStyles[variant]} ${sizeStyles[size]} ${disabled || loading ? "opacity-50" : ""}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <ActivityIndicator
          size="small"
          color={variant === "default" || variant === "danger" ? "#fff" : "#0891b2"}
          className="mr-2"
        />
      )}
      {typeof children === "string" ? (
        <Text className={`${variantTextStyles[variant]} ${sizeTextStyles[size]}`}>
          {children}
        </Text>
      ) : (
        children
      )}
    </Pressable>
  );
}
