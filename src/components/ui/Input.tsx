import { Text, TextInput, type TextInputProps, View } from "react-native";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export function Input({ label, error, className = "", ...props }: InputProps) {
  return (
    <View className="gap-2">
      {label && (
        <Text className="text-xs font-semibold text-surface-900 uppercase tracking-wider">
          {label}
        </Text>
      )}
      <TextInput
        className={`bg-surface-200 border rounded-xl px-4 py-3.5 text-sm text-foreground ${
          error ? "border-danger/60" : "border-border/50"
        } ${className}`}
        placeholderTextColor="#4e6381"
        {...props}
      />
      {error && <Text className="text-xs text-danger mt-0.5">{error}</Text>}
    </View>
  );
}
