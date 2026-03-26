import { useCallback, useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { formatCurrency } from "../../lib/currency";

interface AmountPadProps {
  value: number;
  onChange: (value: number) => void;
  type: "expense" | "income" | "transfer";
  locale?: "en" | "bn";
}

const KEYS = [
  ["1", "2", "3"],
  ["4", "5", "6"],
  ["7", "8", "9"],
  [".", "0", "\u232B"],
];

const TYPE_COLORS = {
  expense: "text-danger",
  income: "text-success",
  transfer: "text-primary-700",
};

export function AmountPad({ value, onChange, type, locale }: AmountPadProps) {
  const [display, setDisplay] = useState(value === 0 ? "" : String(value / 100));

  // External reset: sync display when value is set to 0 externally (Pitfall 5)
  useEffect(() => {
    if (value === 0 && display !== "") {
      setDisplay("");
    }
  }, [value, display]);

  const handleKey = useCallback(
    (key: string) => {
      let newDisplay = display;

      if (key === "\u232B") {
        newDisplay = display.slice(0, -1);
      } else if (key === ".") {
        if (display.includes(".")) return;
        newDisplay = `${display}.`;
      } else {
        const parts = display.split(".");
        if (parts[1] && parts[1].length >= 2) return;
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
  const displayText =
    displayAmount === 0 ? "\u09F30" : formatCurrency(displayAmount, locale === "bn");

  return (
    <View className="items-center">
      {/* Amount Display */}
      <View className="py-8 items-center">
        <Text
          className={`text-hero font-bold ${TYPE_COLORS[type]} tracking-tight`}
          style={{ lineHeight: 44 }}
        >
          {displayText}
        </Text>
        <Text className="text-2xs font-semibold text-surface-800 mt-2 uppercase tracking-widest">
          {type}
        </Text>
      </View>

      {/* Keypad - always Arabic digits per D-18 */}
      <View className="w-full px-4 gap-2">
        {KEYS.map((row) => (
          <View key={row.join("-")} className="flex-row gap-2">
            {row.map((key) => (
              <Pressable
                key={key}
                testID={`keypad-${key}`}
                onPress={() => handleKey(key)}
                className="flex-1 items-center justify-center py-4 rounded-xl bg-surface-200 active:bg-surface-400 border border-border/20"
              >
                <Text className="text-xl font-bold text-foreground">{key}</Text>
              </Pressable>
            ))}
          </View>
        ))}
      </View>
    </View>
  );
}
