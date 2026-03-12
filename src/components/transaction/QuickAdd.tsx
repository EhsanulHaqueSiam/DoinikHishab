import React, { useCallback, useMemo, useRef, useState } from "react";
import { View, Text, Pressable, Platform } from "react-native";
import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useAppStore } from "../../stores/app-store";
import { useUIStore } from "../../stores/ui-store";
import { AmountPad } from "./AmountPad";
import { CategoryGrid } from "./CategoryGrid";
import { Button } from "../ui/Button";
import { today } from "../../lib/date";
import type { Id } from "../../../convex/_generated/dataModel";

type Step = "amount" | "category" | "confirm";

export function QuickAdd() {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const { isQuickAddOpen, quickAddType, closeQuickAdd } = useUIStore();
  const { userId } = useAppStore();

  const [step, setStep] = useState<Step>("amount");
  const [amount, setAmount] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<Id<"categories"> | null>(null);
  const [description, setDescription] = useState("");

  const snapPoints = useMemo(() => ["85%"], []);

  const categories = useQuery(
    api.categories.listCategories,
    userId ? { userId } : "skip"
  );
  const groups = useQuery(
    api.categories.listGroups,
    userId ? { userId } : "skip"
  );
  const accounts = useQuery(
    api.accounts.list,
    userId ? { userId } : "skip"
  );
  const createTransaction = useMutation(api.transactions.create);

  const defaultAccount = accounts?.find((a) => a.isDefault) ?? accounts?.[0];

  const handleSave = useCallback(async () => {
    if (!userId || !defaultAccount || amount === 0) return;

    try {
      await createTransaction({
        userId,
        accountId: defaultAccount._id,
        categoryId: selectedCategory ?? undefined,
        amount,
        type: quickAddType,
        description: description || undefined,
        date: today(),
        source: "manual",
        isCleared: false,
      });

      // Reset state
      setAmount(0);
      setSelectedCategory(null);
      setDescription("");
      setStep("amount");
      closeQuickAdd();

      // Haptic feedback on native
      if (Platform.OS !== "web") {
        try {
          const Haptics = require("expo-haptics");
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch {}
      }
    } catch (error) {
      console.error("Failed to save transaction:", error);
    }
  }, [userId, defaultAccount, amount, selectedCategory, description, quickAddType, createTransaction, closeQuickAdd]);

  const handleCategorySelect = useCallback((id: Id<"categories">) => {
    setSelectedCategory(id);
    // Auto-advance to save
    setStep("confirm");
  }, []);

  const handleClose = useCallback(() => {
    setAmount(0);
    setSelectedCategory(null);
    setDescription("");
    setStep("amount");
    closeQuickAdd();
  }, [closeQuickAdd]);

  if (!isQuickAddOpen) return null;

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={0}
      snapPoints={snapPoints}
      onClose={handleClose}
      enablePanDownToClose
      backgroundStyle={{ backgroundColor: "#ffffff", borderRadius: 24 }}
      handleIndicatorStyle={{ backgroundColor: "#cbd5e1", width: 40 }}
    >
      <View className="flex-1 px-4">
        {/* Type toggle */}
        <View className="flex-row bg-muted rounded-xl p-1 mb-4">
          {(["expense", "income", "transfer"] as const).map((type) => (
            <Pressable
              key={type}
              onPress={() => useUIStore.getState().openQuickAdd(type)}
              className={`flex-1 py-2 rounded-lg items-center ${
                quickAddType === type ? "bg-white shadow-sm" : ""
              }`}
            >
              <Text
                className={`text-sm font-medium capitalize ${
                  quickAddType === type
                    ? type === "expense"
                      ? "text-danger"
                      : type === "income"
                        ? "text-success"
                        : "text-primary-600"
                    : "text-muted-foreground"
                }`}
              >
                {type}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Step content */}
        {step === "amount" && (
          <View className="flex-1">
            <AmountPad
              value={amount}
              onChange={setAmount}
              type={quickAddType}
            />
            <View className="px-4 pb-4 mt-4">
              <Button
                onPress={() => setStep("category")}
                disabled={amount === 0}
                size="lg"
              >
                Next — Pick Category
              </Button>
            </View>
          </View>
        )}

        {step === "category" && (
          <View className="flex-1">
            <View className="flex-row items-center justify-between mb-3">
              <Pressable onPress={() => setStep("amount")}>
                <Text className="text-primary-600 font-medium">← Back</Text>
              </Pressable>
              <Text className="text-sm text-muted-foreground">
                Pick a category
              </Text>
              <Pressable onPress={handleSave}>
                <Text className="text-primary-600 font-medium">Skip →</Text>
              </Pressable>
            </View>
            <BottomSheetScrollView>
              <CategoryGrid
                categories={categories ?? []}
                groups={groups ?? []}
                selectedId={selectedCategory}
                onSelect={handleCategorySelect}
                type={quickAddType === "transfer" ? "expense" : quickAddType}
              />
            </BottomSheetScrollView>
          </View>
        )}

        {step === "confirm" && (
          <View className="flex-1 justify-center items-center gap-6">
            <View className="items-center">
              <Text className="text-lg text-muted-foreground">
                {quickAddType === "expense" ? "Spending" : "Receiving"}
              </Text>
              <Text
                className={`text-4xl font-bold mt-2 ${
                  quickAddType === "expense" ? "text-danger" : "text-success"
                }`}
              >
                {require("../../lib/currency").formatCurrency(Math.abs(amount))}
              </Text>
              {selectedCategory && categories && (
                <Text className="text-base text-muted-foreground mt-2">
                  {categories.find((c) => c._id === selectedCategory)?.name}
                </Text>
              )}
              {defaultAccount && (
                <Text className="text-sm text-muted-foreground mt-1">
                  from {defaultAccount.name}
                </Text>
              )}
            </View>
            <View className="w-full gap-3 px-4">
              <Button onPress={handleSave} size="lg">
                Save Transaction
              </Button>
              <Button
                variant="ghost"
                onPress={() => setStep("category")}
                size="md"
              >
                Change Category
              </Button>
            </View>
          </View>
        )}
      </View>
    </BottomSheet>
  );
}
