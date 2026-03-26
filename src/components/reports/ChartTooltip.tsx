import React, { useEffect } from "react";
import { Text, View } from "react-native";
import { formatCurrency } from "../../lib/currency";
import { shadow } from "../../lib/platform";

interface ChartTooltipProps {
  label: string;
  amount: number; // paisa
  percentage?: number;
  isPrivacy?: boolean;
  onDismiss: () => void;
}

export function ChartTooltip({
  label,
  amount,
  percentage,
  isPrivacy,
  onDismiss,
}: ChartTooltipProps) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 3000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <View
      className="bg-surface-300 rounded-xl p-2"
      style={shadow("#000", 0, 4, 0.3, 8, 4)}
      accessibilityLiveRegion="polite"
    >
      <Text className="text-2xs text-surface-900">{label}</Text>
      <Text className="text-sm font-bold text-foreground">
        {isPrivacy && percentage != null ? `${percentage.toFixed(1)}%` : formatCurrency(amount)}
      </Text>
    </View>
  );
}
