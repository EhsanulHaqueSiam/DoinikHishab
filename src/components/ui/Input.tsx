import React from "react";
import { TextInput, View, Text, type TextInputProps } from "react-native";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export function Input({ label, error, className = "", ...props }: InputProps) {
  return (
    <View className="gap-1.5">
      {label && (
        <Text className="text-sm font-medium text-muted-foreground">
          {label}
        </Text>
      )}
      <TextInput
        className={`bg-surface-200 border rounded-xl px-4 py-3 text-base text-foreground ${
          error ? "border-danger" : "border-border"
        } ${className}`}
        placeholderTextColor="#3a5280"
        {...props}
      />
      {error && <Text className="text-xs text-danger">{error}</Text>}
    </View>
  );
}
