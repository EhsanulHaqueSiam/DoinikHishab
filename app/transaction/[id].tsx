import React, { useState } from "react";
import { View, Text, ScrollView, Pressable, TextInput } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Card } from "../../src/components/ui/Card";
import { Button } from "../../src/components/ui/Button";
import { formatCurrency, paisaToTaka, takaToPaisa } from "../../src/lib/currency";
import { formatDate } from "../../src/lib/date";
import { FLAG_COLORS, type FlagColor } from "../../src/lib/constants";
import type { Id } from "../../convex/_generated/dataModel";

export default function TransactionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const transaction = useQuery(
    api.transactions.getById,
    id ? { id: id as Id<"transactions"> } : "skip"
  );

  const updateTransaction = useMutation(api.transactions.update);
  const deleteTransaction = useMutation(api.transactions.remove);

  const [isEditing, setIsEditing] = useState(false);
  const [memo, setMemo] = useState("");
  const [description, setDescription] = useState("");

  if (!transaction) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Text className="text-muted-foreground">Loading...</Text>
      </View>
    );
  }

  const handleDelete = async () => {
    await deleteTransaction({ id: transaction._id });
    router.back();
  };

  const handleToggleCleared = async () => {
    await updateTransaction({
      id: transaction._id,
      isCleared: !transaction.isCleared,
    });
  };

  const handleSetFlag = async (flag: string | undefined) => {
    await updateTransaction({
      id: transaction._id,
      flag,
    });
  };

  const handleSaveMemo = async () => {
    await updateTransaction({
      id: transaction._id,
      memo: memo || undefined,
      description: description || undefined,
    });
    setIsEditing(false);
  };

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 pt-14 pb-4 bg-white border-b border-border">
        <Pressable onPress={() => router.back()}>
          <Text className="text-primary-600 font-medium text-base">← Back</Text>
        </Pressable>
        <Text className="text-base font-semibold text-foreground">
          Transaction
        </Text>
        <Pressable onPress={() => setIsEditing(!isEditing)}>
          <Text className="text-primary-600 font-medium text-base">
            {isEditing ? "Done" : "Edit"}
          </Text>
        </Pressable>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Amount */}
        <View className="items-center py-8 bg-white">
          <Text
            className={`text-4xl font-bold ${
              transaction.amount < 0 ? "text-danger" : "text-success"
            }`}
          >
            {formatCurrency(transaction.amount)}
          </Text>
          <Text className="text-sm text-muted-foreground mt-2">
            {formatDate(transaction.date)}
          </Text>
        </View>

        {/* Details */}
        <View className="px-4 mt-4">
          <Card>
            <View className="gap-4">
              <View className="flex-row justify-between">
                <Text className="text-sm text-muted-foreground">Type</Text>
                <Text className="text-sm font-medium text-foreground capitalize">
                  {transaction.type}
                </Text>
              </View>

              <View className="h-px bg-border/30" />

              <View className="flex-row justify-between">
                <Text className="text-sm text-muted-foreground">
                  Description
                </Text>
                {isEditing ? (
                  <TextInput
                    value={description || transaction.description || ""}
                    onChangeText={setDescription}
                    placeholder="Add description"
                    className="text-sm text-right flex-1 ml-4"
                    placeholderTextColor="#94a3b8"
                  />
                ) : (
                  <Text className="text-sm font-medium text-foreground">
                    {transaction.description || "—"}
                  </Text>
                )}
              </View>

              <View className="h-px bg-border/30" />

              <View className="flex-row justify-between">
                <Text className="text-sm text-muted-foreground">Memo</Text>
                {isEditing ? (
                  <TextInput
                    value={memo || transaction.memo || ""}
                    onChangeText={setMemo}
                    placeholder="Add memo"
                    className="text-sm text-right flex-1 ml-4"
                    placeholderTextColor="#94a3b8"
                  />
                ) : (
                  <Text className="text-sm font-medium text-foreground">
                    {transaction.memo || "—"}
                  </Text>
                )}
              </View>

              <View className="h-px bg-border/30" />

              <View className="flex-row justify-between">
                <Text className="text-sm text-muted-foreground">Source</Text>
                <Text className="text-sm font-medium text-foreground capitalize">
                  {transaction.source}
                </Text>
              </View>

              <View className="h-px bg-border/30" />

              <Pressable
                onPress={handleToggleCleared}
                className="flex-row justify-between"
              >
                <Text className="text-sm text-muted-foreground">Cleared</Text>
                <Text className="text-sm font-medium">
                  {transaction.isCleared ? "✅ Yes" : "⬜ No"}
                </Text>
              </Pressable>
            </View>
          </Card>
        </View>

        {/* Flags */}
        <View className="px-4 mt-4">
          <Card>
            <Text className="text-sm font-semibold text-foreground mb-3">
              Flag
            </Text>
            <View className="flex-row gap-3">
              {Object.entries(FLAG_COLORS).map(([color, hex]) => (
                <Pressable
                  key={color}
                  onPress={() =>
                    handleSetFlag(
                      transaction.flag === color ? undefined : color
                    )
                  }
                  className={`w-10 h-10 rounded-full items-center justify-center ${
                    transaction.flag === color
                      ? "border-2 border-foreground"
                      : ""
                  }`}
                  style={{ backgroundColor: hex }}
                />
              ))}
            </View>
          </Card>
        </View>

        {/* Save / Delete */}
        <View className="px-4 mt-4 gap-3 mb-8">
          {isEditing && (
            <Button onPress={handleSaveMemo}>Save Changes</Button>
          )}
          <Button variant="danger" onPress={handleDelete}>
            Delete Transaction
          </Button>
        </View>
      </ScrollView>
    </View>
  );
}
