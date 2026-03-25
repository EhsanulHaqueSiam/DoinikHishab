import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { useMutation, useQuery } from "convex/react";
import { useCallback, useMemo, useRef, useState } from "react";
import { Platform, Pressable, Text, View } from "react-native";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { formatCurrency } from "../../lib/currency";
import { today } from "../../lib/date";
import { shadow } from "../../lib/platform";
import { useAppStore } from "../../stores/app-store";
import { useUIStore } from "../../stores/ui-store";
import { Button } from "../ui/Button";
import { AmountPad } from "./AmountPad";
import { CategoryGrid } from "./CategoryGrid";

type Step = "amount" | "category" | "confirm";

const TYPE_COLORS = {
  expense: { active: "text-danger", shadow: "#f87171" },
  income: { active: "text-success", shadow: "#34d399" },
  transfer: { active: "text-primary-700", shadow: "#0d9488" },
};

export function QuickAdd() {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const { isQuickAddOpen, quickAddType, closeQuickAdd } = useUIStore();
  const { userId } = useAppStore();

  const [step, setStep] = useState<Step>("amount");
  const [amount, setAmount] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<Id<"categories"> | null>(null);
  const [description, setDescription] = useState("");

  const snapPoints = useMemo(() => ["85%"], []);

  const categories = useQuery(api.categories.listCategories, userId ? { userId } : "skip");
  const groups = useQuery(api.categories.listGroups, userId ? { userId } : "skip");
  const accounts = useQuery(api.accounts.list, userId ? { userId } : "skip");
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
      setAmount(0);
      setSelectedCategory(null);
      setDescription("");
      setStep("amount");
      closeQuickAdd();
      if (Platform.OS !== "web") {
        try {
          const Haptics = require("expo-haptics");
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch {}
      }
    } catch (error) {
      console.error("Failed to save transaction:", error);
    }
  }, [
    userId,
    defaultAccount,
    amount,
    selectedCategory,
    description,
    quickAddType,
    createTransaction,
    closeQuickAdd,
  ]);

  const handleCategorySelect = useCallback((id: Id<"categories">) => {
    setSelectedCategory(id);
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
      backgroundStyle={{
        backgroundColor: "#0c1021",
        borderRadius: 24,
        borderWidth: 1,
        borderColor: "#1e2a3a",
      }}
      handleIndicatorStyle={{ backgroundColor: "#4e6381", width: 36 }}
    >
      <View className="flex-1 px-4">
        {/* Type Toggle */}
        <View className="flex-row bg-surface-200 rounded-xl p-1 mb-4 border border-border/20">
          {(["expense", "income", "transfer"] as const).map((type) => (
            <Pressable
              key={type}
              onPress={() => useUIStore.getState().openQuickAdd(type)}
              className={`flex-1 py-2.5 rounded-lg items-center ${
                quickAddType === type ? "bg-surface-400" : ""
              }`}
              style={
                quickAddType === type ? shadow(TYPE_COLORS[type].shadow, 0, 0, 0.25, 8) : undefined
              }
            >
              <Text
                className={`text-xs font-bold uppercase tracking-wider ${
                  quickAddType === type ? TYPE_COLORS[type].active : "text-surface-800"
                }`}
              >
                {type}
              </Text>
            </Pressable>
          ))}
        </View>

        {step === "amount" && (
          <View className="flex-1">
            <AmountPad value={amount} onChange={setAmount} type={quickAddType} />
            <View className="px-4 pb-4 mt-4">
              <Button onPress={() => setStep("category")} disabled={amount === 0} size="lg">
                Next — Pick Category
              </Button>
            </View>
          </View>
        )}

        {step === "category" && (
          <View className="flex-1">
            <View className="flex-row items-center justify-between mb-3">
              <Pressable onPress={() => setStep("amount")}>
                <Text className="text-primary-700 font-semibold text-xs">← Back</Text>
              </Pressable>
              <Text className="text-2xs font-semibold text-surface-800 uppercase tracking-widest">
                Pick a category
              </Text>
              <Pressable onPress={handleSave}>
                <Text className="text-accent-500 font-semibold text-xs">Skip →</Text>
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
          <View className="flex-1 justify-center items-center gap-8">
            <View className="items-center">
              <Text className="text-2xs font-semibold text-surface-800 uppercase tracking-widest">
                {quickAddType === "expense" ? "Spending" : "Receiving"}
              </Text>
              <Text
                className={`text-hero font-bold mt-2 tracking-tight ${
                  quickAddType === "expense" ? "text-danger" : "text-success"
                }`}
                style={{ lineHeight: 44 }}
              >
                {formatCurrency(Math.abs(amount))}
              </Text>
              {selectedCategory && categories && (
                <Text className="text-sm text-surface-900 mt-3 font-medium">
                  {categories.find((c) => c._id === selectedCategory)?.name}
                </Text>
              )}
              {defaultAccount && (
                <Text className="text-2xs text-surface-700 mt-1 uppercase tracking-wider">
                  from {defaultAccount.name}
                </Text>
              )}
            </View>
            <View className="w-full gap-3 px-4">
              <Button onPress={handleSave} size="lg">
                Save Transaction
              </Button>
              <Button variant="ghost" onPress={() => setStep("category")} size="md">
                Change Category
              </Button>
            </View>
          </View>
        )}
      </View>
    </BottomSheet>
  );
}
