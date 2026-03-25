import React from "react";
import { Pressable, Text, type PressableProps, ActivityIndicator } from "react-native";
import { shadow } from "../../lib/platform";

interface ButtonProps extends PressableProps {
  variant?: "default" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  children: React.ReactNode;
}

const variantStyles = {
  default: "bg-primary-500 active:bg-primary-400",
  secondary: "bg-surface-400 active:bg-surface-500",
  outline: "border border-border/80 bg-transparent active:bg-surface-300",
  ghost: "bg-transparent active:bg-surface-300",
  danger: "bg-danger/90 active:bg-danger",
};

const variantTextStyles = {
  default: "text-white font-semibold",
  secondary: "text-foreground font-medium",
  outline: "text-foreground font-medium",
  ghost: "text-surface-900 font-medium",
  danger: "text-white font-semibold",
};

const sizeStyles = {
  sm: "px-3 py-2 rounded-xl",
  md: "px-5 py-3 rounded-xl",
  lg: "px-6 py-4 rounded-2xl",
};

const sizeTextStyles = {
  sm: "text-xs",
  md: "text-sm",
  lg: "text-base",
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
      className={`flex-row items-center justify-center ${variantStyles[variant]} ${sizeStyles[size]} ${disabled || loading ? "opacity-30" : ""}`}
      disabled={disabled || loading}
      style={variant === "default" ? shadow("#0d9488", 0, 4, 0.3, 12, 6) : undefined}
      {...props}
    >
      {loading && (
        <ActivityIndicator
          size="small"
          color={variant === "default" || variant === "danger" ? "#fff" : "#2dd4bf"}
          className="mr-2"
        />
      )}
      {typeof children === "string" ? (
        <Text
          className={`${variantTextStyles[variant]} ${sizeTextStyles[size]} tracking-wide`}
        >
          {children}
        </Text>
      ) : (
        children
      )}
    </Pressable>
  );
}
