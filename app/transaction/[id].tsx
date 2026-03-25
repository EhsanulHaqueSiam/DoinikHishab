import { useMutation, useQuery } from "convex/react";
import { useLocalSearchParams, useRouter } from "expo-router";
import type React from "react";
import { useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { Button } from "../../src/components/ui/Button";
import { Card } from "../../src/components/ui/Card";
import { FLAG_COLORS } from "../../src/lib/constants";
import { formatCurrency } from "../../src/lib/currency";
import { formatDate } from "../../src/lib/date";

function DetailRow({
  label,
  value,
  children,
}: {
  label: string;
  value?: string;
  children?: React.ReactNode;
}) {
  return (
    <View className="flex-row justify-between items-center py-3">
      <Text className="text-xs font-medium text-surface-800">{label}</Text>
      {children ?? <Text className="text-xs font-semibold text-foreground">{value || "—"}</Text>}
    </View>
  );
}

const Divider = () => <View className="h-px bg-border/15" />;

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
        <Text className="text-surface-800 text-xs">Loading...</Text>
      </View>
    );
  }

  const handleDelete = async () => {
    await deleteTransaction({ id: transaction._id });
    router.back();
  };

  const handleToggleCleared = async () => {
    await updateTransaction({ id: transaction._id, isCleared: !transaction.isCleared });
  };

  const handleSetFlag = async (flag: string | undefined) => {
    await updateTransaction({ id: transaction._id, flag });
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
      <View className="flex-row items-center justify-between px-4 pt-14 pb-4 bg-surface-100 border-b border-border">
        <Pressable onPress={() => router.back()}>
          <Text className="text-primary-700 font-semibold text-xs">← Back</Text>
        </Pressable>
        <Text className="text-xs font-bold text-foreground uppercase tracking-widest">
          Transaction
        </Text>
        <Pressable onPress={() => setIsEditing(!isEditing)}>
          <Text className="text-primary-700 font-semibold text-xs">
            {isEditing ? "Done" : "Edit"}
          </Text>
        </Pressable>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={8}
        decelerationRate="fast"
      >
        {/* Hero Amount */}
        <View className="items-center py-10 bg-surface-200 border-b border-border/20">
          <Text
            className={`text-hero font-bold tracking-tight ${
              transaction.amount < 0 ? "text-danger" : "text-success"
            }`}
            style={{ lineHeight: 44 }}
          >
            {formatCurrency(transaction.amount)}
          </Text>
          <Text className="text-2xs text-surface-800 mt-2 font-medium tracking-wider">
            {formatDate(transaction.date)}
          </Text>
        </View>

        {/* Details Card */}
        <View className="px-4 mt-5">
          <Card className="px-4 py-0">
            <DetailRow label="Type" value={transaction.type} />
            <Divider />
            <DetailRow label="Description">
              {isEditing ? (
                <TextInput
                  value={description || transaction.description || ""}
                  onChangeText={setDescription}
                  placeholder="Add description"
                  className="text-xs text-right flex-1 ml-4 text-foreground font-semibold"
                  placeholderTextColor="#4e6381"
                />
              ) : (
                <Text className="text-xs font-semibold text-foreground">
                  {transaction.description || "—"}
                </Text>
              )}
            </DetailRow>
            <Divider />
            <DetailRow label="Memo">
              {isEditing ? (
                <TextInput
                  value={memo || transaction.memo || ""}
                  onChangeText={setMemo}
                  placeholder="Add memo"
                  className="text-xs text-right flex-1 ml-4 text-foreground font-semibold"
                  placeholderTextColor="#4e6381"
                />
              ) : (
                <Text className="text-xs font-semibold text-foreground">
                  {transaction.memo || "—"}
                </Text>
              )}
            </DetailRow>
            <Divider />
            <DetailRow label="Source" value={transaction.source} />
            <Divider />
            <Pressable onPress={handleToggleCleared}>
              <DetailRow label="Cleared">
                <Text className="text-xs font-semibold">
                  {transaction.isCleared ? "✅ Yes" : "⬜ No"}
                </Text>
              </DetailRow>
            </Pressable>
          </Card>
        </View>

        {/* Flags */}
        <View className="px-4 mt-4">
          <Card>
            <Text className="text-2xs font-semibold text-surface-800 uppercase tracking-widest mb-3">
              Flag
            </Text>
            <View className="flex-row gap-3">
              {Object.entries(FLAG_COLORS).map(([color, hex]) => (
                <Pressable
                  key={color}
                  onPress={() => handleSetFlag(transaction.flag === color ? undefined : color)}
                  className={`w-9 h-9 rounded-full items-center justify-center ${
                    transaction.flag === color ? "border-2 border-foreground" : ""
                  }`}
                  style={{ backgroundColor: hex }}
                />
              ))}
            </View>
          </Card>
        </View>

        {/* Actions */}
        <View className="px-4 mt-4 gap-3 mb-8">
          {isEditing && <Button onPress={handleSaveMemo}>Save Changes</Button>}
          <Button variant="danger" onPress={handleDelete}>
            Delete Transaction
          </Button>
        </View>
      </ScrollView>
    </View>
  );
}
