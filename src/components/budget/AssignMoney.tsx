import React, { useState } from "react";
import { View, Text, TextInput, Pressable } from "react-native";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { formatCurrency, takaToPaisa, paisaToTaka } from "../../lib/currency";
import type { Id } from "../../../convex/_generated/dataModel";

interface AssignMoneyProps {
  userId: Id<"users">;
  categoryId: Id<"categories">;
  categoryName: string;
  month: string;
  currentAssigned: number;
  available: number;
  readyToAssign: number;
  onClose: () => void;
}

export function AssignMoney({
  userId,
  categoryId,
  categoryName,
  month,
  currentAssigned,
  available,
  readyToAssign,
  onClose,
}: AssignMoneyProps) {
  const [inputValue, setInputValue] = useState(
    currentAssigned === 0 ? "" : String(paisaToTaka(currentAssigned))
  );

  const assign = useMutation(api.budgets.assign);

  const handleAssign = async () => {
    const paisa = takaToPaisa(parseFloat(inputValue) || 0);
    await assign({
      userId,
      categoryId,
      month,
      amount: paisa,
    });
    onClose();
  };

  const quickAmounts = [1000, 2000, 5000, 10000].map((t) => t * 100); // to paisa

  return (
    <Card className="mx-4">
      <Text className="text-base font-semibold text-foreground mb-1">
        Assign to {categoryName}
      </Text>
      <Text className="text-xs text-muted-foreground mb-4">
        Ready to Assign: {formatCurrency(readyToAssign)}
      </Text>

      {/* Amount input */}
      <View className="flex-row items-center border border-border rounded-xl px-3 py-2 mb-3">
        <Text className="text-lg font-bold text-foreground mr-1">৳</Text>
        <TextInput
          value={inputValue}
          onChangeText={setInputValue}
          keyboardType="numeric"
          placeholder="0"
          className="flex-1 text-lg text-foreground"
          placeholderTextColor="#94a3b8"
          autoFocus
        />
      </View>

      {/* Quick amounts */}
      <View className="flex-row gap-2 mb-4">
        {quickAmounts.map((amount) => (
          <Pressable
            key={amount}
            onPress={() => setInputValue(String(paisaToTaka(amount)))}
            className="flex-1 bg-muted rounded-lg py-2 items-center"
          >
            <Text className="text-xs font-medium text-foreground">
              {formatCurrency(amount)}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Current state */}
      <View className="flex-row justify-between mb-4">
        <Text className="text-xs text-muted-foreground">Currently assigned</Text>
        <Text className="text-xs font-medium text-foreground">
          {formatCurrency(currentAssigned)}
        </Text>
      </View>

      {/* Actions */}
      <View className="flex-row gap-3">
        <View className="flex-1">
          <Button variant="ghost" onPress={onClose}>
            Cancel
          </Button>
        </View>
        <View className="flex-1">
          <Button onPress={handleAssign}>Assign</Button>
        </View>
      </View>
    </Card>
  );
}
