import React, { useState, useCallback } from "react";
import { View, Text, ScrollView, Pressable, Platform } from "react-native";
import { useRouter } from "expo-router";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useAppStore } from "../../src/stores/app-store";
import { AmountPad } from "../../src/components/transaction/AmountPad";
import { CategoryGrid } from "../../src/components/transaction/CategoryGrid";
import { Button } from "../../src/components/ui/Button";
import { today } from "../../src/lib/date";
import { formatCurrency } from "../../src/lib/currency";
import type { Id } from "../../convex/_generated/dataModel";

type Step = "amount" | "category" | "confirm";

const TYPE_COLORS = {
  expense: { text: "text-danger", label: "Spending" },
  income: { text: "text-success", label: "Receiving" },
  transfer: { text: "text-primary-700", label: "Transferring" },
};

export default function AddTransactionScreen() {
  const router = useRouter();
  const { userId } = useAppStore();

  const [step, setStep] = useState<Step>("amount");
  const [amount, setAmount] = useState(0);
  const [type, setType] = useState<"expense" | "income" | "transfer">("expense");
  const [selectedCategory, setSelectedCategory] = useState<Id<"categories"> | null>(null);

  const categories = useQuery(api.categories.listCategories, userId ? { userId } : "skip");
  const groups = useQuery(api.categories.listGroups, userId ? { userId } : "skip");
  const accounts = useQuery(api.accounts.list, userId ? { userId } : "skip");
  const createTransaction = useMutation(api.transactions.create);

  const defaultAccount = accounts?.find((a) => a.isDefault) ?? accounts?.[0];

  const handleSave = useCallback(async () => {
    if (!userId || !defaultAccount || amount === 0) return;
    await createTransaction({
      userId,
      accountId: defaultAccount._id,
      categoryId: selectedCategory ?? undefined,
      amount,
      type,
      date: today(),
      source: "manual",
      isCleared: false,
    });
    if (Platform.OS !== "web") {
      try {
        const Haptics = require("expo-haptics");
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch {}
    }
    router.back();
  }, [userId, defaultAccount, amount, selectedCategory, type, createTransaction, router]);

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 pt-14 pb-4 border-b border-border bg-surface-100">
        <Pressable onPress={() => router.back()}>
          <Text className="text-primary-700 font-semibold text-xs">Cancel</Text>
        </Pressable>
        <Text className="text-xs font-bold text-foreground uppercase tracking-widest">
          Add Transaction
        </Text>
        <View className="w-14" />
      </View>

      {/* Type Toggle */}
      <View className="flex-row bg-surface-200 mx-4 mt-4 rounded-xl p-1 border border-border/20">
        {(["expense", "income", "transfer"] as const).map((t) => (
          <Pressable
            key={t}
            onPress={() => setType(t)}
            className={`flex-1 py-2.5 rounded-lg items-center ${type === t ? "bg-surface-400" : ""}`}
          >
            <Text
              className={`text-xs font-bold uppercase tracking-wider ${
                type === t ? TYPE_COLORS[t].text : "text-surface-800"
              }`}
            >
              {t}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Content */}
      <ScrollView className="flex-1" scrollEventThrottle={8} decelerationRate="fast">
        {step === "amount" && (
          <View className="flex-1">
            <AmountPad value={amount} onChange={setAmount} type={type} />
            <View className="px-4 pb-4 mt-4">
              <Button onPress={() => setStep("category")} disabled={amount === 0} size="lg">
                Next — Pick Category
              </Button>
            </View>
          </View>
        )}

        {step === "category" && (
          <View className="flex-1 px-4 pt-4">
            <View className="flex-row items-center justify-between mb-3">
              <Pressable onPress={() => setStep("amount")}>
                <Text className="text-primary-700 font-semibold text-xs">← Back</Text>
              </Pressable>
              <Pressable onPress={handleSave}>
                <Text className="text-accent-500 font-semibold text-xs">Skip →</Text>
              </Pressable>
            </View>
            <CategoryGrid
              categories={categories ?? []}
              groups={groups ?? []}
              selectedId={selectedCategory}
              onSelect={(id) => {
                setSelectedCategory(id);
                setStep("confirm");
              }}
              type={type === "transfer" ? "expense" : type}
            />
          </View>
        )}

        {step === "confirm" && (
          <View className="items-center py-14 gap-8 px-4">
            <View className="items-center">
              <Text className="text-2xs font-semibold text-surface-800 uppercase tracking-widest">
                {TYPE_COLORS[type].label}
              </Text>
              <Text
                className={`text-hero font-bold mt-2 tracking-tight ${TYPE_COLORS[type].text}`}
                style={{ lineHeight: 44 }}
              >
                {formatCurrency(Math.abs(amount))}
              </Text>
              {selectedCategory && categories && (
                <Text className="text-sm text-surface-900 mt-3 font-medium">
                  {categories.find((c) => c._id === selectedCategory)?.name}
                </Text>
              )}
            </View>
            <View className="w-full gap-3">
              <Button onPress={handleSave} size="lg">Save Transaction</Button>
              <Button variant="ghost" onPress={() => setStep("category")}>Change Category</Button>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
