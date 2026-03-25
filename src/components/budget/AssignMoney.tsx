import { useMutation } from "convex/react";
import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { formatCurrency, paisaToTaka, takaToPaisa } from "../../lib/currency";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";

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
  available: _available,
  readyToAssign,
  onClose,
}: AssignMoneyProps) {
  const [inputValue, setInputValue] = useState(
    currentAssigned === 0 ? "" : String(paisaToTaka(currentAssigned))
  );

  const assign = useMutation(api.budgets.assign);

  const handleAssign = async () => {
    const paisa = takaToPaisa(parseFloat(inputValue) || 0);
    await assign({ userId, categoryId, month, amount: paisa });
    onClose();
  };

  const quickAmounts = [1000, 2000, 5000, 10000].map((t) => t * 100);

  return (
    <Card className="mx-4" variant="elevated">
      <Text className="text-sm font-bold text-foreground mb-0.5">Assign to {categoryName}</Text>
      <Text className="text-2xs text-primary-700 mb-4 font-medium">
        Ready to Assign: {formatCurrency(readyToAssign)}
      </Text>

      <View className="flex-row items-center border border-border/50 rounded-xl px-3 py-2.5 mb-3 bg-surface-200">
        <Text className="text-lg font-bold text-accent-500 mr-1.5">৳</Text>
        <TextInput
          value={inputValue}
          onChangeText={setInputValue}
          keyboardType="numeric"
          placeholder="0"
          className="flex-1 text-lg text-foreground font-bold"
          placeholderTextColor="#4e6381"
          autoFocus
        />
      </View>

      <View className="flex-row gap-2 mb-4">
        {quickAmounts.map((amount) => (
          <Pressable
            key={amount}
            onPress={() => setInputValue(String(paisaToTaka(amount)))}
            className="flex-1 bg-surface-300 rounded-lg py-2 items-center border border-border/20 active:bg-surface-500"
          >
            <Text className="text-2xs font-bold text-foreground">{formatCurrency(amount)}</Text>
          </Pressable>
        ))}
      </View>

      <View className="flex-row justify-between mb-4">
        <Text className="text-2xs text-surface-800">Currently assigned</Text>
        <Text className="text-2xs font-bold text-foreground">
          {formatCurrency(currentAssigned)}
        </Text>
      </View>

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
