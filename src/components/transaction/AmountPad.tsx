import React, { useState, useCallback } from "react";
import { View, Text, Pressable } from "react-native";
import { formatCurrency } from "../../lib/currency";

interface AmountPadProps {
  value: number; // paisa
  onChange: (value: number) => void;
  type: "expense" | "income" | "transfer";
}

const KEYS = [
  ["1", "2", "3"],
  ["4", "5", "6"],
  ["7", "8", "9"],
  [".", "0", "⌫"],
];

export function AmountPad({ value, onChange, type }: AmountPadProps) {
  const [display, setDisplay] = useState(value === 0 ? "" : String(value / 100));

  const typeColors = {
    expense: "text-danger",
    income: "text-success",
    transfer: "text-primary-600",
  };

  const handleKey = useCallback(
    (key: string) => {
      let newDisplay = display;

      if (key === "⌫") {
        newDisplay = display.slice(0, -1);
      } else if (key === ".") {
        if (display.includes(".")) return;
        newDisplay = display + ".";
      } else {
        // Limit to 2 decimal places
        const parts = display.split(".");
        if (parts[1] && parts[1].length >= 2) return;
        // Limit total digits
        if (display.replace(".", "").length >= 10) return;
        newDisplay = display + key;
      }

      setDisplay(newDisplay);

      const num = parseFloat(newDisplay || "0");
      const paisa = Math.round(num * 100);
      onChange(type === "expense" ? -paisa : paisa);
    },
    [display, onChange, type]
  );

  const displayAmount = Math.abs(value);

  return (
    <View className="items-center">
      {/* Amount Display */}
      <View className="py-6 items-center">
        <Text className={`text-5xl font-bold ${typeColors[type]}`}>
          {displayAmount === 0 ? "৳0" : formatCurrency(displayAmount)}
        </Text>
        <Text className="text-sm text-muted-foreground mt-1 capitalize">
          {type}
        </Text>
      </View>

      {/* Number Pad */}
      <View className="w-full px-4 gap-2">
        {KEYS.map((row, i) => (
          <View key={i} className="flex-row gap-2">
            {row.map((key) => (
              <Pressable
                key={key}
                onPress={() => handleKey(key)}
                className="flex-1 items-center justify-center py-4 rounded-xl bg-muted active:bg-gray-200"
              >
                <Text className="text-2xl font-semibold text-foreground">
                  {key}
                </Text>
              </Pressable>
            ))}
          </View>
        ))}
      </View>
    </View>
  );
}
